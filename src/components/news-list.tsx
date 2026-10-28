"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { News } from "@/data/news";

// Number of news items shown per page. The box is sized to fit exactly this many rows.
const PAGE_SIZE = 6;
// Height of one row (in rem). Box height = PAGE_SIZE * ROW_REM.
const ROW_REM = 3;
const SWIPE_THRESHOLD = 50;

function NewsRow({
  news,
  year,
  showDivider,
}: {
  news: News;
  year: string | null; // shown only on the first item of each year on a page
  showDivider: boolean; // line above the first item of a new year
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className="news-item grid grid-cols-[4rem_1fr] gap-3">
      <p className="text-xs text-zinc-500 tracking-wide pt-[1.05rem]">{year ?? ""}</p>
      <div>
        {showDivider && <div aria-hidden="true" className="h-px bg-zinc-200 mr-20" />}
        <div
          className="flex items-center justify-between gap-4"
          style={{ minHeight: `${ROW_REM}rem` }}
        >
          <h3 className="font-serif text-sm leading-snug flex items-center gap-2.5 min-w-0">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-600"
            />
            {news.link ? (
              <a
                href={news.link}
                target="_blank"
                rel="noopener noreferrer"
                title={news.title}
                className="group inline-flex items-center gap-1.5 min-w-0 hover:text-zinc-600 transition-colors duration-300"
              >
                <span className="truncate">{news.title}</span>
                <ArrowUpRight
                  size={13}
                  className="flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
                />
              </a>
            ) : (
              <span className="truncate" title={news.title}>
                {news.title}
              </span>
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
          <p className="text-sm text-zinc-600 leading-relaxed pl-4 pb-3 pr-4">
            {news.description}
          </p>
        )}
      </div>
    </li>
  );
}

export function NewsList({ items }: { items: News[] }) {
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const [page, setPage] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const goTo = (p: number) => setPage(Math.min(pageCount - 1, Math.max(0, p)));
  const pageItems = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div
      className="rounded-2xl border border-zinc-200 bg-white/60 shadow-sm"
      role="region"
      aria-roledescription="carousel"
      aria-label="News"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") goTo(page + 1);
        if (e.key === "ArrowLeft") goTo(page - 1);
      }}
      onTouchStart={(e) => {
        touchStartX.current = e.changedTouches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (dx < -SWIPE_THRESHOLD) goTo(page + 1);
        if (dx > SWIPE_THRESHOLD) goTo(page - 1);
        touchStartX.current = null;
      }}
    >
      {/* Fixed-height viewport: always fits PAGE_SIZE rows; scrolls if a description is expanded */}
      <ul
        key={page}
        className="px-5 pt-2 overflow-y-auto"
        style={{ height: `${PAGE_SIZE * ROW_REM + 0.5}rem` }}
        aria-live="polite"
      >
        {pageItems.map((news, i) => {
          const prev = pageItems[i - 1];
          const newYear = !prev || prev.date !== news.date;
          return (
            <NewsRow
              key={`${page}-${i}`}
              news={news}
              year={newYear ? news.date : null}
              showDivider={newYear && i > 0}
            />
          );
        })}
      </ul>

      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-3">
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={page === 0}
            aria-label="Previous page"
            className="p-1 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: pageCount }).map((_, p) => (
              <button
                key={p}
                type="button"
                onClick={() => goTo(p)}
                aria-label={`Page ${p + 1}`}
                aria-current={p === page}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  p === page ? "w-5 bg-amber-600" : "w-1.5 bg-zinc-300 hover:bg-zinc-400"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => goTo(page + 1)}
            disabled={page === pageCount - 1}
            aria-label="Next page"
            className="p-1 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
