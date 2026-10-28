import { ReactNode } from "react";

/**
 * Shared wrapper so every section on the page has the same heading style
 * and the same rounded card. Set boxed={false} when the content draws its
 * own card (e.g. the News carousel) or is plain prose (About Me).
 */
export function SectionCard({
  id,
  title,
  children,
  boxed = true,
}: {
  id?: string;
  title: string;
  children: ReactNode;
  boxed?: boolean;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="font-serif text-2xl font-light tracking-wide text-zinc-900 mb-5">
        {title}
      </h2>
      {boxed ? (
        <div className="rounded-2xl border border-zinc-200 bg-white/60 divide-y divide-zinc-200">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}
