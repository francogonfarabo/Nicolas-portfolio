"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "../I18n";

export type SectionChip = { id: string; label: string };

/**
 * Jump links to each part of the work history, pinned under the skills map.
 * The section currently under the map is marked (two when they sit side by side).
 */
let navigation = 0;

/**
 * Scrolls a section to just under the pinned block (16px gap, as the scroll margins give), in one
 * continuous movement. Done by hand rather than with a smooth-scroll target: the skills map can
 * fold from the radial chart into the strip mid-way, which moves the section, so each frame aims
 * at where the section is *now* (an ease-out that settles exactly) and it only stops once the fold
 * is over. Touching or wheeling hands control back to the visitor.
 */
function goTo(e: React.MouseEvent, id: string) {
  const block = document.getElementById("pin-block");
  const el = document.getElementById(id);
  if (!block || !el) return;
  e.preventDefault();
  history.replaceState(null, "", `#${id}`);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const run = ++navigation;
  const started = performance.now();
  let stopped = false;
  const stop = () => (stopped = true);
  window.addEventListener("wheel", stop, { once: true, passive: true });
  window.addEventListener("touchstart", stop, { once: true, passive: true });
  const done = () => {
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchstart", stop);
  };
  const step = () => {
    if (stopped || run !== navigation) return done();
    const off = el.getBoundingClientRect().top - block.getBoundingClientRect().bottom - 16;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const blocked = (off > 0 && window.scrollY >= max - 0.5) || (off < 0 && window.scrollY <= 0);
    const folding = !!document.querySelector("[data-flight]");
    if ((Math.abs(off) < 0.5 || blocked) && !folding) return done();
    if (performance.now() - started > 3000) return done();
    // Ease out, but never by less than a pixel (the browser rounds smaller steps away).
    const move = reduce || Math.abs(off) <= 1 ? off : Math.sign(off) * Math.max(1, Math.abs(off) * 0.16);
    window.scrollTo({ top: Math.round(window.scrollY + move), behavior: "instant" });
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

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
            onClick={(e) => goTo(e, s.id)}
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
