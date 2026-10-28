"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { News } from "@/data/news";

// Height of the scrollable list area (rem). Fits ~4 rows; longer years scroll inside the card.
const LIST_HEIGHT_REM = 10.5;
const SWIPE_THRESHOLD = 50;

function NewsRow({ news }: { news: News }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="news-item py-1.5">
      <div className="flex items-center justify-between gap-3 min-h-[2.25rem]">
        <h3 className="font-serif text-sm leading-snug flex items-start gap-2.5 min-w-0">
          <span
            aria-hidden="true"
            className="mt-[0.45rem] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-600"
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
                size={13}
                className="mt-0.5 flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
              />
            </a>
          ) : (
            <span>{news.title}</span>
          )}
        </h3>
        {news.description && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-zinc-400 hover:text-zinc-900 transition-colors duration-300"
          >
            {open ? "Less" : "More"}
            <ChevronDown
              size={12}
              className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
      {open && (
        <p className="text-sm text-zinc-600 leading-relaxed pl-4 pt-1 pb-2 pr-2">
          {news.description}
        </p>
      )}
    </li>
  );
}

export function NewsList({ items }: { items: News[] }) {
  // One page per year, in the order the years first appear in the data (newest first)
  const years: { year: string; items: News[] }[] = [];
  items.forEach((item) => {
    const group = years.find((g) => g.year === item.date);
    if (group) group.items.push(item);
    else years.push({ year: item.date, items: [item] });
  });

  const [page, setPage] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const last = years.length - 1;
  const goTo = (p: number) => setPage(Math.min(last, Math.max(0, p)));
  const current = years[page];

  if (!current) return null;

  return (
    <div
      className="rounded-2xl border border-zinc-200 bg-white/60 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/40"
      role="region"
      aria-roledescription="carousel"
      aria-label="News by year"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") goTo(page + 1);
        if (e.key === "ArrowLeft") goTo(page - 1);
      }}
      onTouchStart={(e) => {
        touchStartX.current = e.changedTouches[0].clientX;
        touchStartY.current = e.changedTouches[0].clientY;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null || touchStartY.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        // Only treat mostly-horizontal gestures as swipes, so vertical scrolling still works
        if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
          goTo(dx < 0 ? page + 1 : page - 1);
        }
        touchStartX.current = null;
        touchStartY.current = null;
      }}
    >
      {/* Year header with previous / next */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200">
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={page === 0}
          aria-label="Newer year"
          className="p-1 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <p className="font-serif text-sm tracking-wide text-zinc-900" aria-live="polite">
          {current.year}
          <span className="ml-2 text-xs text-zinc-400">
            {current.items.length} {current.items.length === 1 ? "item" : "items"}
          </span>
        </p>
        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={page === last}
          aria-label="Older year"
          className="p-1 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Fixed-height, scrollable list for the selected year */}
      <ul
        key={current.year}
        className="px-4 py-2 overflow-y-auto overscroll-contain"
        style={{ height: `${LIST_HEIGHT_REM}rem` }}
      >
        {current.items.map((news, i) => (
          <NewsRow key={`${current.year}-${i}`} news={news} />
        ))}
      </ul>

      {/* Page dots, one per year */}
      {years.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-2.5 border-t border-zinc-200">
          {years.map((g, p) => (
            <button
              key={g.year}
              type="button"
              onClick={() => goTo(p)}
              aria-label={g.year}
              aria-current={p === page}
              title={g.year}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                p === page ? "w-5 bg-amber-600" : "w-1.5 bg-zinc-300 hover:bg-zinc-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
