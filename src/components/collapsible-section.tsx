import { useState } from "react";

interface CollapsibleSectionProps {
  id?: string;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({ id, title, defaultOpen = true, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section id={id} className="">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-md mb-4 tracking-wide uppercase">{title}</h2>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="text-xs text-zinc-600 hover:text-zinc-900 ml-4"
        >
          {open ? "Collapse" : "Expand"}
        </button>
      </div>

      <div className={`${open ? "block" : "hidden"}`}>{children}</div>
    </section>
  );
}
