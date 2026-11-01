"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { SkillCategory } from "@/content/types";
import { useI18n } from "../I18n";

/** Room for the connectors between a family box and its skills, and one row of skill boxes. */
const CONNECT = 20;
const ROW_H = 26;
const ITEM_H = 22;
/** Geist Mono advances 0.6em, so a 10.5px label is 6.3px a character; plus padding, square and border. */
const itemWidth = (label: string) => Math.ceil(label.length * 6.3) + 26;
const ITEM_GAP = 6;
const GROUP_GAP = 12;

type Box = { x: number; y: number; w: number };
type Placed = { key: string; label: string; color: string; cat: string; x: number; w: number; row: number };

/**
 * Places the shown skills under their families: each family's skills sit side by side, centred
 * under its box, then pushed apart (and back inside the strip) where neighbours would overlap.
 * Too many to fit on one line, or `flow` (the boxes themselves wrap, on phones) → plain rows,
 * left to right, in family order.
 */
function placeSkills(
  groups: { cat: SkillCategory; skills: { key: string; label: string }[] }[],
  boxes: Record<string, Box>,
  width: number,
  flow: boolean,
) {
  const sized = groups.map((g) => {
    const items = g.skills.map((s) => ({ ...s, w: itemWidth(s.label) }));
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
  return { items: out, rows: row + 1 };
}

/**
 * The pinned, horizontal form of the skills map (laptop/tablet, once the radial chart reaches
 * the header): a quiet row of the seven families. It only reflects the project the visitor is on:
 * hovering one (with nothing open) tints its families; opening one also lays out its skills under
 * them, joined by curves. Nothing in the strip reacts to the pointer itself. The skills row is
 * always there (with a quiet hint while nothing is open), so the strip never changes height and
 * choosing a project never moves the page.
 *
 * Phones: the boxes wrap onto two rows (colour bar instead of square) and only tint, no skill row:
 * the strip keeps one height, so choosing projects never moves the page (the open card shows its
 * skill tags right there).
 */
export default function SkillStrip({
  categories,
  usage,
  lit,
  shown,
  hideBoxes,
  pulse,
}: {
  categories: SkillCategory[];
  usage: Record<string, number>;
  /** Families to tint (the open project's, else the hovered one's); null = none. */
  lit: Set<string> | null;
  /** Skill keys laid out under the boxes (the open project's). */
  shown: string[] | null;
  /** While the families fly in from the radial chart, the boxes wait underneath. */
  hideBoxes: boolean;
  pulse: { id: string; key: number } | null;
}) {
  const { t } = useI18n();
  const reduce = !!useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const boxRefs = useRef(new Map<string, HTMLElement>());
  const [boxes, setBoxes] = useState<Record<string, Box>>({});
  const [width, setWidth] = useState(0);

  // Where each family box sits, for the curves and for centring its skills.
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => {
      const left = el.getBoundingClientRect().left;
      const next: Record<string, Box> = {};
      boxRefs.current.forEach((b, id) => {
        const r = b.getBoundingClientRect();
        next[id] = { x: r.left - left, y: r.top, w: r.width };
      });
      setBoxes(next);
      setWidth(el.clientWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    boxRefs.current.forEach((b) => ro.observe(b));
    return () => ro.disconnect();
  }, [categories]);

  // Boxes on more than one row (phones): no skill row, so the strip's height never changes.
  const wrapped = new Set(Object.values(boxes).map((b) => Math.round(b.y))).size > 1;
  const top = CONNECT;
  const placed = useMemo(() => {
    if (!shown?.length || !width || wrapped) return { items: [], rows: 0 };
    const set = new Set(shown);
    const groups = categories
      .map((cat) => ({ cat, skills: cat.skills.filter((s) => set.has(s.key)).map((s) => ({ key: s.key, label: s.label })) }))
      .filter((g) => g.skills.length);
    return placeSkills(groups, boxes, width, wrapped);
  }, [shown, categories, boxes, width, wrapped]);

  const pulseCat = pulse ? categories.find((c) => c.skills.some((s) => s.key === pulse.id))?.id : undefined;
  // One row is always reserved (laptop/tablet); phones have none. Only a project needing more rows than
  // fit would grow it.
  const subH = wrapped ? 0 : top + Math.max(1, placed.rows) * ROW_H;
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    // A narrow strip (small tablets) trades each box's colour square for a colour bar along its top,
    // so every label still fits on one line.
    <div ref={wrap} className="@container relative">
      <h2 id="skills-title" className="sr-only">
        {t.chart.title}
      </h2>
      <ul className="flex flex-wrap gap-1.5" aria-label={t.chart.families}>
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
              className="relative flex min-w-0 flex-auto items-center justify-center gap-1.5 border border-(--b) px-2 py-1.5 text-center font-mono text-[10.5px] leading-tight whitespace-nowrap transition-[background-color,border-color,color] duration-500 @max-[690px]:border-t-2 @max-[690px]:border-t-(--c) @max-[690px]:px-1.5 @max-[690px]:pt-[5px]"
              style={{
                visibility: hideBoxes ? "hidden" : undefined,
                ["--c" as string]: c.color,
                ["--b" as string]: on ? c.color : "var(--color-line)",
                background: on ? `color-mix(in srgb, ${c.color} 9%, white)` : "white",
                color: lit && !on ? "var(--color-ink-2)" : "var(--color-ink)",
              }}
            >
              <span className="size-[7px] shrink-0 @max-[690px]:hidden" style={{ background: c.color }} aria-hidden />
              <span className="min-w-0">{c.label}</span>
              {pulseCat === c.id && <span key={pulse!.key} aria-hidden className="box-ping absolute -inset-px border" style={{ borderColor: c.color }} />}
            </li>
          );
        })}
      </ul>

      {/* The open project's skills, under their families */}
      <motion.div
        initial={false}
        animate={{ height: subH }}
        transition={reduce ? { duration: 0 } : { duration: 0.35, ease }}
        className="relative overflow-hidden"
        aria-live="polite"
      >
        <AnimatePresence>
          {!wrapped && !placed.items.length && (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.15 } }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              className="absolute inset-x-0 font-mono text-[10.5px] text-ink-3"
              style={{ top: top + 4 }}
            >
              {t.chart.stripHint}
            </motion.p>
          )}
        </AnimatePresence>
        <svg aria-hidden className="pointer-events-none absolute inset-0 overflow-visible" width={width} height={Math.max(subH, 1)}>
          <AnimatePresence>
            {placed.items.map((it) => {
              const b = boxes[it.cat];
              if (!b || wrapped) return null;
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
                  strokeWidth={1}
                  initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ d, pathLength: 1, opacity: 0.8 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ duration: reduce ? 0 : 0.45, ease }}
                />
              );
            })}
          </AnimatePresence>
        </svg>
        <ul aria-label={t.chart.title}>
          <AnimatePresence>
            {placed.items.map((it, i) => (
              <motion.li
                key={it.key}
                initial={reduce ? false : { opacity: 0, x: it.x, y: top + it.row * ROW_H - 6 }}
                animate={{ opacity: 1, x: it.x, y: top + it.row * ROW_H }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: reduce ? 0 : 0.4, ease, delay: reduce ? 0 : 0.06 + i * 0.03 }}
                className="absolute top-0 left-0"
                style={{ width: it.w, height: ITEM_H }}
              >
                <span
                  aria-label={t.chart.skill(it.label, usage[it.key] ?? 0)}
                  className="relative flex h-full items-center gap-1.5 border bg-white px-1.5 font-mono text-[10.5px] whitespace-nowrap text-ink"
                  style={{ borderColor: it.color }}
                >
                  <span className="size-1.5 shrink-0" style={{ background: it.color }} aria-hidden />
                  {it.label}
                  {pulse?.id === it.key && <span key={pulse.key} aria-hidden className="box-ping absolute -inset-px border" style={{ borderColor: it.color }} />}
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </motion.div>
    </div>
  );
}
