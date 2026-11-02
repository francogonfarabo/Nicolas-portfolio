"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { SkillCategory } from "@/content/types";
import { useI18n } from "../I18n";

/** Curves between a family and its skills (laptop/tablet), or a plain gap (phones); then rows of skill chips. */
const CONNECT = 18;
const GAP = 10;
const ITEM_H = 24;
const ROW_H = ITEM_H + 6;
const ITEM_GAP = 6;
const GROUP_GAP = 12;
/** A chip is its label (11.5px, medium) plus padding, dot, gap and border. */
const CHIP_FONT = "500 11.5px";
const CHIP_EXTRA = 20 + 6 + 6 + 2;

type Box = { x: number; y: number; w: number };
type Placed = { key: string; label: string; color: string; cat: string; x: number; w: number; row: number };
type Group = { cat: SkillCategory; skills: { key: string; label: string }[] };

const mix = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, white)`;

/**
 * Places skills under their families: each family's skills side by side, centred under its pill,
 * pushed apart (and back inside the strip) where neighbours would overlap. Too many for one line,
 * or `flow` (the pills themselves wrap, on phones): plain rows, left to right, in family order.
 */
function placeSkills(groups: Group[], boxes: Record<string, Box>, width: number, flow: boolean, widthOf: (s: string) => number) {
  const sized = groups.map((g) => {
    const items = g.skills.map((s) => ({ ...s, w: widthOf(s.label) }));
    const span = items.reduce((n, it) => n + it.w, 0) + ITEM_GAP * (items.length - 1);
    const box = boxes[g.cat.id];
    return { cat: g.cat, items, span, x: box ? box.x + box.w / 2 - span / 2 : 0 };
  });
  const total = sized.reduce((n, g) => n + g.span, 0) + GROUP_GAP * (sized.length - 1);
  const out: Placed[] = [];

  if (total <= width && !flow) {
    let edge = -Infinity;
    for (const g of sized) {
      g.x = Math.max(g.x, 0, edge + GROUP_GAP);
      edge = g.x + g.span;
    }
    let limit = width;
    for (const g of [...sized].reverse()) {
      g.x = Math.min(g.x, limit - g.span);
      limit = g.x - GROUP_GAP;
    }
    for (const g of sized) {
      let x = g.x;
      for (const it of g.items) {
        out.push({ key: it.key, label: it.label, color: g.cat.color, cat: g.cat.id, x, w: it.w, row: 0 });
        x += it.w + ITEM_GAP;
      }
    }
    return { items: out, rows: sized.length ? 1 : 0 };
  }

  let x = 0;
  let row = 0;
  for (const g of sized)
    for (const it of g.items) {
      if (x > 0 && x + it.w > width) {
        row++;
        x = 0;
      }
      out.push({ key: it.key, label: it.label, color: g.cat.color, cat: g.cat.id, x, w: it.w, row });
      x += it.w + ITEM_GAP;
    }
  // Phones: each row centred under the (centred) pills.
  if (flow)
    for (let r = 0; r <= row; r++) {
      const inRow = out.filter((o) => o.row === r);
      const span = inRow.reduce((n, o) => n + o.w, 0) + ITEM_GAP * (inRow.length - 1);
      const shift = Math.max(0, (width - span) / 2);
      for (const o of inRow) o.x += shift;
    }
  return { items: out, rows: row + 1 };
}

/**
 * The skills map's legend, and what stays pinned under the header while the work history scrolls:
 * the seven families as pills. It reflects the project the visitor is on: hovering one (with nothing
 * open) tints its families; opening one tints them and lays its skills out underneath (joined to
 * their families by curves on laptop/tablet; in family order on phones, where the pills wrap).
 *
 * It never changes height: the skills area is sized once for the project that needs the most rows
 * (with a quiet hint while nothing is open), so choosing projects never moves the page. Hovering a
 * pill highlights that family in the radial chart above.
 */
export default function SkillStrip({
  categories,
  usage,
  lit,
  shown,
  reserve,
  pulse,
  onFamilyHover,
}: {
  categories: SkillCategory[];
  usage: Record<string, number>;
  /** Families to tint (the open project's, else the hovered one's); null = none. */
  lit: Set<string> | null;
  /** Skill keys laid out under the pills (the open project's). */
  shown: string[] | null;
  /** Every project's skills: the skills area is sized for the one that needs the most rows. */
  reserve: string[][];
  pulse: { id: string; key: number } | null;
  onFamilyHover: (id: string | null) => void;
}) {
  const { t } = useI18n();
  const reduce = !!useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const boxRefs = useRef(new Map<string, HTMLElement>());
  const [boxes, setBoxes] = useState<Record<string, Box>>({});
  const [width, setWidth] = useState(0);
  const [font, setFont] = useState({ family: "", ready: 0 });

  // Where each pill sits (for the curves and for centring its skills), and the font to measure labels in.
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => {
      const left = el.getBoundingClientRect().left;
      const top = el.getBoundingClientRect().top;
      const next: Record<string, Box> = {};
      boxRefs.current.forEach((b, id) => {
        const r = b.getBoundingClientRect();
        next[id] = { x: r.left - left, y: r.top - top, w: r.width };
      });
      setBoxes(next);
      setWidth(el.clientWidth);
    };
    measure();
    setFont((f) => ({ ...f, family: getComputedStyle(el).fontFamily }));
    document.fonts?.ready.then(() => {
      setFont((f) => ({ ...f, ready: f.ready + 1 }));
      measure();
    });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    boxRefs.current.forEach((b) => ro.observe(b));
    return () => ro.disconnect();
  }, [categories]);

  const widthOf = useMemo(() => {
    if (!font.family || typeof document === "undefined") return null;
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return null;
    ctx.font = `${CHIP_FONT} ${font.family}`;
    const cache = new Map<string, number>();
    return (s: string) => {
      let w = cache.get(s);
      if (w === undefined) cache.set(s, (w = Math.ceil(ctx.measureText(s).width) + CHIP_EXTRA));
      return w;
    };
  }, [font]);

  // Pills on more than one row (phones): skills flow under them, no curves.
  const wrapped = new Set(Object.values(boxes).map((b) => Math.round(b.y))).size > 1;
  const top = wrapped ? GAP : CONNECT;
  const groupsFor = useMemo(
    () => (keys: string[]) => {
      const set = new Set(keys);
      return categories
        .map((cat) => ({ cat, skills: cat.skills.filter((s) => set.has(s.key)).map((s) => ({ key: s.key, label: s.label })) }))
        .filter((g) => g.skills.length);
    },
    [categories],
  );
  const ready = !!width && !!widthOf;
  const placed = useMemo(
    () => (ready && shown?.length ? placeSkills(groupsFor(shown), boxes, width, wrapped, widthOf!) : { items: [], rows: 0 }),
    [ready, shown, groupsFor, boxes, width, wrapped, widthOf],
  );
  // The most rows any project needs here, so the strip's height never depends on which one is open.
  const rows = useMemo(
    () => (ready ? Math.max(1, ...reserve.map((keys) => placeSkills(groupsFor(keys), boxes, width, wrapped, widthOf!).rows)) : 1),
    [ready, reserve, groupsFor, boxes, width, wrapped, widthOf],
  );
  const subH = top + rows * ROW_H - (ROW_H - ITEM_H);
  const pulseCat = pulse ? categories.find((c) => c.skills.some((s) => s.key === pulse.id))?.id : undefined;
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <div ref={wrap} className="@container relative">
      {/* Laptop/tablet: one justified row. Phones: a centred cloud over a few rows. */}
      <ul className="flex flex-wrap gap-1.5 @max-[560px]:justify-center" aria-label={t.chart.families}>
        {categories.map((c) => {
          const on = !!lit?.has(c.id);
          return (
            <li
              key={c.id}
              ref={(el) => {
                if (el) boxRefs.current.set(c.id, el);
                else boxRefs.current.delete(c.id);
              }}
              data-cat-box={c.id}
              aria-label={t.chart.family(c.label, c.skills.length)}
              onPointerEnter={(e) => e.pointerType === "mouse" && onFamilyHover(c.id)}
              onPointerLeave={(e) => e.pointerType === "mouse" && onFamilyHover(null)}
              className="relative flex h-8 min-w-0 flex-auto cursor-default items-center justify-center gap-1.5 rounded-full border px-2.5 text-[12px] font-medium tracking-tight whitespace-nowrap transition-[background-color,border-color,color] duration-300 @max-[560px]:h-7 @max-[560px]:flex-none"
              style={{
                background: on ? mix(c.color, 12) : "white",
                borderColor: on ? mix(c.color, 45) : "var(--color-line)",
                color: on ? "var(--color-ink)" : "var(--color-ink-2)",
              }}
            >
              <span className="size-2 shrink-0 rounded-full" style={{ background: c.color }} aria-hidden />
              {c.label}
              {pulseCat === c.id && <span key={pulse!.key} aria-hidden className="box-ping absolute -inset-px rounded-full border" style={{ borderColor: c.color }} />}
            </li>
          );
        })}
      </ul>

      {/* The open project's skills, under their families. Always the same height. */}
      <div className="relative" style={{ height: subH }} aria-live="polite">
        <AnimatePresence>
          {!placed.items.length && (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.15 } }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              className="absolute inset-x-0 text-[12px] tracking-tight text-ink-3 @max-[560px]:text-center"
              style={{ top: (subH - 18) / 2 }}
            >
              {t.chart.stripHint}
            </motion.p>
          )}
        </AnimatePresence>
        {!wrapped && (
          <svg aria-hidden className="pointer-events-none absolute inset-0 overflow-visible" width={width} height={subH}>
            <AnimatePresence>
              {placed.items.map((it) => {
                const b = boxes[it.cat];
                if (!b) return null;
                const bx = b.x + b.w / 2;
                const sx = it.x + it.w / 2;
                const y1 = CONNECT + it.row * ROW_H;
                const d = `M${bx},0 C${bx},${y1 * 0.6} ${sx},${y1 * 0.4} ${sx},${y1}`;
                return (
                  <motion.path
                    key={it.key}
                    d={d}
                    fill="none"
                    stroke={it.color}
                    strokeWidth={1.25}
                    strokeLinecap="round"
                    initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                    animate={{ d, pathLength: 1, opacity: 0.45 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    transition={{ duration: reduce ? 0 : 0.45, ease }}
                  />
                );
              })}
            </AnimatePresence>
          </svg>
        )}
        <ul aria-label={t.chart.title}>
          <AnimatePresence>
            {placed.items.map((it, i) => (
              <motion.li
                key={it.key}
                initial={reduce ? false : { opacity: 0, x: it.x, y: top + it.row * ROW_H + 4 }}
                animate={{ opacity: 1, x: it.x, y: top + it.row * ROW_H }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: reduce ? 0 : 0.4, ease, delay: reduce ? 0 : 0.05 + i * 0.03 }}
                className="absolute top-0 left-0"
                style={{ width: it.w, height: ITEM_H }}
              >
                <span
                  aria-label={t.chart.skill(it.label, usage[it.key] ?? 0)}
                  className="relative flex h-full items-center gap-1.5 rounded-full border px-2.5 text-[11.5px] font-medium tracking-tight whitespace-nowrap text-ink"
                  style={{ background: mix(it.color, 8), borderColor: mix(it.color, 32) }}
                >
                  <span className="size-1.5 shrink-0 rounded-full" style={{ background: it.color }} aria-hidden />
                  {it.label}
                  {pulse?.id === it.key && <span key={pulse.key} aria-hidden className="box-ping absolute -inset-px rounded-full border" style={{ borderColor: it.color }} />}
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}
