import { sectionOrder, Section } from "@/data/section-order";
import { useState } from "react";

const prettyName: Record<Section, string> = {
  [Section.News]: "News",
  [Section.Education]: "Education",
  [Section.Publication]: "Publications",
  [Section.Experience]: "Experience",
  [Section.Portfolio]: "Portfolio",
};

export function SectionNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6">
      <div className="relative inline-block text-left">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex justify-center w-full rounded-md border border-zinc-200 shadow-sm px-4 py-2 bg-white text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Sections
          <svg
            className={`ml-2 h-4 w-4 transition-transform ${open ? "-rotate-180" : "rotate-0"}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
          </svg>
        </button>

        {open && (
          <div className="origin-top-left absolute left-0 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              {sectionOrder.map((s) => (
                <a
                  key={s}
                  href={`#${s}`}
                  className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                  onClick={() => setOpen(false)}
                >
                  {prettyName[s]}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
