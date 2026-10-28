"use client";

import { Mail } from "lucide-react";

/**
 * Email icon that keeps the real address out of the page source (to deter
 * scrapers). The obfuscated form, e.g. "name [at] host [dot] me", is decoded
 * only when someone clicks.
 */
export function EmailIconLink({ obfuscated, className }: { obfuscated: string; className?: string }) {
  const decode = () =>
    obfuscated.replace(/\s*\[at\]\s*/g, "@").replace(/\s*\[dot\]\s*/g, ".").replace(/\s+/g, "");

  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        window.location.href = `mailto:${decode()}`;
      }}
      aria-label={`Email: ${obfuscated}`}
      title={obfuscated}
      className={className}
    >
      <Mail size={18} />
    </a>
  );
}
