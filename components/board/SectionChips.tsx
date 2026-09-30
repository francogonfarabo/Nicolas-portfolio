"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "../I18n";

export type SectionChip = { id: string; label: string };

/**
 * Jump links to each part of the work history, pinned under the skills map.
 * The section currently under the map is marked (two when they sit side by side).
 */
export default function SectionChips({ sections, active }: { sections: SectionChip[]; active: string[] }) {
  const { t } = useI18n();
  const row = useRef<HTMLElement>(null);

  // Keep the active chip visible when the row scrolls sideways (small screens).
  // Scrolls the row only, never the page.
  useEffect(() => {
    const el = row.current;
    const chip = active[0] && el?.querySelector<HTMLElement>(`[data-chip="${active[0]}"]`);
    if (!el || !chip || el.scrollWidth <= el.clientWidth) return;
    const left = chip.offsetLeft - el.offsetLeft;
    if (left < el.scrollLeft || left + chip.offsetWidth > el.scrollLeft + el.clientWidth) {
      el.scrollTo({ left: Math.max(0, left - 16), behavior: "smooth" });
    }
  }, [active]);

  return (
    <nav
      ref={row}
      aria-label={t.work.sections}
      className="-mx-4 flex gap-1.5 overflow-x-auto px-4 py-2 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {sections.map((s) => {
        const on = active.includes(s.id);
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            data-chip={s.id}
            aria-current={on ? "location" : undefined}
            className={`shrink-0 border px-2 py-1 font-mono text-[10.5px] tracking-wide uppercase transition-colors ${
              on ? "border-ink bg-ink text-white" : "border-line text-ink-2 hover:border-ink hover:text-ink"
            }`}
          >
            {s.label}
          </a>
        );
      })}
    </nav>
  );
}
