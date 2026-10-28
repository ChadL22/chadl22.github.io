import { ArrowUpRight } from "lucide-react";
import { News } from "@/data/news";
import { PagedCard, CardPage } from "@/components/paged-card";

function NewsRow({ news }: { news: News }) {
  return (
    <li className="news-item px-5 py-4">
      <h3 className="font-serif text-base text-zinc-900 leading-snug flex items-start gap-2.5">
        <span
          aria-hidden="true"
          className="mt-[0.5rem] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-600"
        />
        {news.link ? (
          <a
            href={news.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-start gap-1.5 hover:text-zinc-600 transition-colors duration-300"
          >
            <span>{news.title}</span>
            <ArrowUpRight
              size={14}
              className="mt-1 flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
            />
          </a>
        ) : (
          <span>{news.title}</span>
        )}
      </h3>
      {news.description && (
        <p className="text-sm text-zinc-600 leading-relaxed mt-1 pl-4">{news.description}</p>
      )}
    </li>
  );
}

export function NewsList({ items }: { items: News[] }) {
  // One page per year, in the order years first appear (newest first)
  const groups: { year: string; items: News[] }[] = [];
  items.forEach((item) => {
    const g = groups.find((x) => x.year === item.date);
    if (g) g.items.push(item);
    else groups.push({ year: item.date, items: [item] });
  });

  const pages: CardPage[] = groups.map((g) => ({
    label: g.year,
    meta: `${g.items.length} ${g.items.length === 1 ? "item" : "items"}`,
    content: (
      <ul className="divide-y divide-zinc-200">
        {g.items.map((news, i) => (
          <NewsRow key={i} news={news} />
        ))}
      </ul>
    ),
  }));

  return <PagedCard pages={pages} ariaLabel="News by year" prevLabel="Newer year" nextLabel="Older year" />;
}
