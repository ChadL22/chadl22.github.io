"use client";

import { useState } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { News } from "@/data/news";

const INITIAL_COUNT = 5;

function NewsRow({ news }: { news: News }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="news-item py-3 border-b border-zinc-200 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-serif text-sm leading-snug">
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
            news.title
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
        <p className="text-sm text-zinc-600 leading-relaxed mt-2">
          {news.description}
        </p>
      )}
    </li>
  );
}

export function NewsList({ items }: { items: News[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, INITIAL_COUNT);

  // Group visible items by year, preserving order
  const groups: { year: string; items: News[] }[] = [];
  visible.forEach((item) => {
    const last = groups[groups.length - 1];
    if (last && last.year === item.date) {
      last.items.push(item);
    } else {
      groups.push({ year: item.date, items: [item] });
    }
  });

  const hiddenCount = items.length - INITIAL_COUNT;

  return (
    <div className="space-y-8">
      {groups.map((group, i) => (
        <div key={`${group.year}-${i}`} className="grid grid-cols-[4.5rem_1fr] gap-4">
          <p className="text-xs text-zinc-500 pt-3.5 tracking-wide">{group.year}</p>
          <ul>
            {group.items.map((news, j) => (
              <NewsRow key={j} news={news} />
            ))}
          </ul>
        </div>
      ))}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="group inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-900 transition-colors duration-300"
        >
          <ChevronDown
            size={12}
            className={`transition-transform duration-300 ${showAll ? "rotate-180" : ""}`}
          />
          <span className="tracking-wider uppercase">
            {showAll ? "Show less" : `Show all news (${hiddenCount} more)`}
          </span>
        </button>
      )}
    </div>
  );
}
