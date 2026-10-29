// Site content lives in /content/*.json and is edited through Pages CMS
// (https://app.pagescms.org — see .pages.yml at the repo root).
// List items carry a "published" flag: anything not published is a draft
// and never reaches the built site.

type Plain = string | number | boolean | null | Plain[] | { [key: string]: Plain };

// The CMS saves cleared fields as empty strings or empty lists; treat those
// as "not set" so optional fields behave exactly like they're absent.
export function tidy(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(tidy);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, Plain>)
        .filter(([, v]) => v !== "" && v !== null && !(Array.isArray(v) && v.length === 0))
        .map(([k, v]) => [k, tidy(v)])
    );
  }
  return value;
}

/** Published items from a content file shaped like { "items": [...] }, without the flag. */
export function publishedItems<T>(file: unknown): T[] {
  const items = (file as { items?: Record<string, unknown>[] }).items ?? [];
  return items
    .filter((item) => item.published === true)
    .map((item) => {
      const copy = { ...item };
      delete copy.published;
      return tidy(copy) as T;
    });
}
