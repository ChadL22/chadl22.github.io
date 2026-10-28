"use client";

import { ReactNode, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CardPage {
  label: string; // shown in the header, e.g. "2026" or "Current"
  meta?: string; // small muted text beside the label, e.g. "2 items"
  content: ReactNode;
}

// Every paged card on the site shares this height so the sections look uniform.
export const PAGED_CARD_BODY_HEIGHT = "19rem";
const SWIPE_THRESHOLD = 50;

/**
 * Rounded card that pages through content: header arrows, swipe on touch,
 * left/right keys, and dots. The body has a fixed height and scrolls if a
 * page holds more than fits.
 */
export function PagedCard({
  pages,
  ariaLabel,
  prevLabel = "Previous",
  nextLabel = "Next",
  bodyHeight = PAGED_CARD_BODY_HEIGHT,
}: {
  pages: CardPage[];
  ariaLabel: string;
  prevLabel?: string;
  nextLabel?: string;
  // "auto" sizes the body to the tallest page so pages don't jump and nothing is left blank
  bodyHeight?: string;
}) {
  const [page, setPage] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);

  const last = pages.length - 1;
  const goTo = (p: number) => setPage(Math.min(last, Math.max(0, p)));
  const current = pages[page];
  if (!current) return null;

  const arrow =
    "p-1 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-25 disabled:hover:bg-transparent transition-colors";

  return (
    <div
      className="rounded-2xl border border-zinc-200 bg-white/60 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/40"
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") goTo(page + 1);
        if (e.key === "ArrowLeft") goTo(page - 1);
      }}
      onTouchStart={(e) => {
        const t = e.changedTouches[0];
        start.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(e) => {
        if (!start.current) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - start.current.x;
        const dy = t.clientY - start.current.y;
        // Only mostly-horizontal gestures page; vertical scrolling still works
        if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
          goTo(dx < 0 ? page + 1 : page - 1);
        }
        start.current = null;
      }}
    >
      {pages.length > 1 ? (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200">
          <button type="button" onClick={() => goTo(page - 1)} disabled={page === 0} aria-label={prevLabel} className={arrow}>
            <ChevronLeft size={16} />
          </button>
          <p className="font-serif text-base tracking-wide text-zinc-900" aria-live="polite">
            {current.label}
            {current.meta && <span className="ml-2 text-xs text-zinc-400">{current.meta}</span>}
          </p>
          <button type="button" onClick={() => goTo(page + 1)} disabled={page === last} aria-label={nextLabel} className={arrow}>
            <ChevronRight size={16} />
          </button>
        </div>
      ) : null}

      {bodyHeight === "auto" ? (
        // Stack every page in one grid cell: the cell takes the tallest page's height,
        // and only the current page is visible.
        <div className="grid">
          {pages.map((p, i) => (
            <div
              key={i}
              className={`[grid-area:1/1] ${i === page ? "" : "invisible"}`}
              aria-hidden={i !== page}
            >
              {p.content}
            </div>
          ))}
        </div>
      ) : (
        <div
          key={page}
          className="overflow-y-auto overscroll-contain"
          style={{ height: bodyHeight }}
        >
          {current.content}
        </div>
      )}

      {pages.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-2.5 border-t border-zinc-200">
          {pages.map((p, i) => (
            <button
              key={`${p.label}-${i}`}
              type="button"
              onClick={() => goTo(i)}
              aria-label={p.label}
              aria-current={i === page}
              title={p.label}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === page ? "w-5 bg-amber-600" : "w-1.5 bg-zinc-300 hover:bg-zinc-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
