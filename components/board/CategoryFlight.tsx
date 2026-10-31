"use client";

import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";

export type Rect = { x: number; y: number; w: number; h: number };
export type FlightItem = { id: string; label: string; color: string; from: Rect };

/** Seconds. The panel's height uses the same duration and curve, so the pieces stay inside it as it folds. */
export const FLIGHT_S = 0.64;
const DURATION = FLIGHT_S * 1000;
const STAGGER = 16;

/** The site's soft ease-out, cubic-bezier(0.22, 1, 0.36, 1), as a function (shared with the panel's height). */
export function softEase(t: number) {
  const [x1, y1, x2, y2] = [0.22, 1, 0.36, 1];
  const at = (a: number, b: number, s: number) => 3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3;
  let s = t;
  for (let i = 0; i < 8; i++) {
    const dx = 3 * x1 * (1 - s) ** 2 + 6 * (x2 - x1) * s * (1 - s) + 3 * (1 - x2) * s * s;
    if (Math.abs(dx) < 1e-6) break;
    s = Math.min(1, Math.max(0, s - (at(x1, x2, s) - t) / dx));
  }
  return at(y1, y2, s);
}
const ramp = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));

export const rectOf = (el: Element): Rect => {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};

/**
 * Carries each skill family between the radial chart (a hub: a small ring) and the pinned
 * strip (a box), so switching views reads as one movement rather than a swap. Each piece flies
 * from where it was to wherever its target is *now* (re-measured every frame, so it lands true
 * even while the page moves), morphing ring ↔ box on the way. The real targets stay hidden
 * until it lands.
 */
export default function CategoryFlight({
  items,
  toStrip,
  onFrame,
  onDone,
}: {
  items: FlightItem[];
  /** true: hubs → strip boxes; false: boxes → hubs. */
  toStrip: boolean;
  /** Each frame: overall progress (eased, 0–1) and the lowest edge of any piece (viewport px). */
  onFrame?: (progress: number, lowest: number) => void;
  onDone: () => void;
}) {
  const refs = useRef(new Map<string, HTMLDivElement>());
  const done = useRef(onDone);
  done.current = onDone;
  const tick = useRef(onFrame);
  tick.current = onFrame;

  useLayoutEffect(() => {
    let raf = 0;
    const start = performance.now();
    const target = (id: string) =>
      document.querySelector(toStrip ? `[data-cat-box="${id}"]` : `#skills [data-hub="${id}"]`);
    // The box's own colours, so the piece settles into exactly what's underneath.
    const look = new Map(
      items.map((it) => {
        const el = toStrip ? target(it.id) : null;
        const cs = el ? getComputedStyle(el) : null;
        return [it.id, { border: cs?.borderTopColor ?? it.color, bg: cs?.backgroundColor ?? "#fff" }];
      }),
    );

    const frame = (now: number) => {
      let running = false;
      let lowest = -Infinity;
      items.forEach((it, i) => {
        const el = refs.current.get(it.id);
        const to = target(it.id);
        if (!el || !to) return;
        const raw = Math.min(1, Math.max(0, (now - start - i * STAGGER) / DURATION));
        if (raw < 1) running = true;
        const e = softEase(raw);
        let a = it.from;
        let b = rectOf(to);
        // A hub is a ring 11px across drawn with a 2px stroke: grow the box to match its outer edge.
        if (toStrip) a = { x: a.x - 1, y: a.y - 1, w: a.w + 2, h: a.h + 2 };
        else b = { x: b.x - 1, y: b.y - 1, w: b.w + 2, h: b.h + 2 };
        const p = toStrip ? e : 1 - e; // 0 = ring, 1 = box
        const r = { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, w: a.w + (b.w - a.w) * e, h: a.h + (b.h - a.h) * e };
        const lk = look.get(it.id)!;
        const boxness = ramp(p, 0.55, 1);
        lowest = Math.max(lowest, r.y + r.h);
        el.style.transform = `translate(${r.x}px, ${r.y}px)`;
        el.style.width = `${r.w}px`;
        el.style.height = `${r.h}px`;
        el.style.borderRadius = `${(1 - ramp(p, 0, 0.7)) * Math.min(r.w, r.h) / 2}px`;
        el.style.borderWidth = `${2 - p}px`;
        el.style.borderColor = `color-mix(in srgb, ${it.color} ${Math.round((1 - boxness) * 100)}%, ${lk.border})`;
        el.style.background = `color-mix(in srgb, #fff ${Math.round((1 - boxness) * 100)}%, ${lk.bg})`;
        (el.firstElementChild as HTMLElement).style.opacity = String(toStrip ? ramp(raw, 0.45, 1) : 1 - ramp(raw, 0, 0.35));
      });
      tick.current?.(softEase(Math.min(1, (now - start) / DURATION)), lowest);
      if (running) raf = requestAnimationFrame(frame);
      else done.current();
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [items, toStrip]);

  return createPortal(
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40">
      {items.map((it) => (
        <div
          key={it.id}
          data-flight={it.id}
          ref={(el) => {
            if (el) refs.current.set(it.id, el);
            else refs.current.delete(it.id);
          }}
          className="absolute top-0 left-0 flex items-center justify-center overflow-hidden border-solid"
          style={{
            transform: `translate(${it.from.x}px, ${it.from.y}px)`,
            width: it.from.w,
            height: it.from.h,
            borderRadius: toStrip ? it.from.h / 2 : 0,
            borderWidth: toStrip ? 2 : 1,
            borderColor: it.color,
            background: "#fff",
          }}
        >
          <span className="flex min-w-0 items-center gap-1.5 px-2 font-mono text-[10.5px] leading-tight whitespace-nowrap text-ink" style={{ opacity: toStrip ? 0 : 1 }}>
            <span className="size-[7px] shrink-0" style={{ background: it.color }} />
            {it.label}
          </span>
        </div>
      ))}
    </div>,
    document.body,
  );
}
