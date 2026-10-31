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

type Box = { x: number; w: number };
type Placed = { key: string; label: string; color: string; cat: string; x: number; w: number; row: number };

/**
 * Places the shown skills under their families: each family's skills sit side by side, centred
 * under its box, then pushed apart (and back inside the strip) where neighbours would overlap.
 * Too many to fit on one line → plain rows, left to right.
 */
function placeSkills(groups: { cat: SkillCategory; skills: { key: string; label: string }[] }[], boxes: Record<string, Box>, width: number) {
  const sized = groups.map((g) => {
    const items = g.skills.map((s) => ({ ...s, w: itemWidth(s.label) }));
    const span = items.reduce((n, it) => n + it.w, 0) + ITEM_GAP * (items.length - 1);
    const box = boxes[g.cat.id];
    return { cat: g.cat, items, span, x: box ? box.x + box.w / 2 - span / 2 : 0 };
  });
  const total = sized.reduce((n, g) => n + g.span, 0) + GROUP_GAP * (sized.length - 1);
  const out: Placed[] = [];

  if (total <= width) {
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
 * the header). Every family is always visible as a box. Hovering a project lights up its families;
 * opening one also lays out its skills under them, joined by curves. Hovering a box previews
 * that family's skills in a small panel that floats over the page (so nothing moves).
 */
export default function SkillStrip({
  categories,
  usage,
  lit,
  shown,
  dimShown,
  hideBoxes,
  pulse,
  onActiveSkill,
}: {
  categories: SkillCategory[];
  usage: Record<string, number>;
  /** Families to light up (the hovered or open project's); null = none in particular. */
  lit: Set<string> | null;
  /** Skill keys laid out under the boxes (the open project's). */
  shown: string[] | null;
  /** Another project is hovered: fade the open project's skills while its families show. */
  dimShown: boolean;
  /** While the families fly in from the radial chart, the boxes wait underneath. */
  hideBoxes: boolean;
  pulse: { id: string; key: number } | null;
  onActiveSkill: (key: string | null) => void;
}) {
  const { t } = useI18n();
  const reduce = !!useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const boxRefs = useRef(new Map<string, HTMLElement>());
  const [boxes, setBoxes] = useState<Record<string, Box>>({});
  const [width, setWidth] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);

  // Where each family box sits, for the curves and for centring its skills.
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => {
      const left = el.getBoundingClientRect().left;
      const next: Record<string, Box> = {};
      boxRefs.current.forEach((b, id) => {
        const r = b.getBoundingClientRect();
        next[id] = { x: r.left - left, w: r.width };
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

  const placed = useMemo(() => {
    if (!shown?.length || !width) return { items: [], rows: 0 };
    const set = new Set(shown);
    const groups = categories
      .map((cat) => ({ cat, skills: cat.skills.filter((s) => set.has(s.key)).map((s) => ({ key: s.key, label: s.label })) }))
      .filter((g) => g.skills.length);
    return placeSkills(groups, boxes, width);
  }, [shown, categories, boxes, width]);

  const pulseCat = pulse ? categories.find((c) => c.skills.some((s) => s.key === pulse.id))?.id : undefined;
  const subH = placed.rows ? CONNECT + placed.rows * ROW_H : 0;
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    // A narrow strip (small tablets) trades each box's colour square for a colour bar along its top,
    // so every label still fits on one line.
    <div ref={wrap} className="@container relative">
      <h2 id="skills-title" className="sr-only">
        {t.chart.title}
      </h2>
      <ul className="flex gap-1.5" aria-label={t.chart.families}>
        {categories.map((c) => {
          const state = !lit ? "neutral" : lit.has(c.id) || preview === c.id ? "on" : "off";
          return (
            <li key={c.id} className="relative flex min-w-0 flex-auto">
              <button
                type="button"
                ref={(el) => {
                  if (el) boxRefs.current.set(c.id, el);
                  else boxRefs.current.delete(c.id);
                }}
                data-cat-box={c.id}
                aria-expanded={preview === c.id}
                aria-label={t.chart.family(c.label, c.skills.length)}
                onPointerEnter={(e) => e.pointerType === "mouse" && setPreview(c.id)}
                onPointerLeave={(e) => e.pointerType === "mouse" && setPreview((p) => (p === c.id ? null : p))}
                // Mouse: hover. Keyboard: focus (and Enter toggles). Touch: tap toggles.
                onFocus={(e) => e.currentTarget.matches(":focus-visible") && setPreview(c.id)}
                onBlur={() => setPreview((p) => (p === c.id ? null : p))}
                onClick={(e) => {
                  if ((e.nativeEvent as PointerEvent).pointerType === "mouse") return;
                  setPreview((p) => (p === c.id ? null : c.id));
                }}
                className="relative flex w-full min-w-0 cursor-default items-center justify-center gap-1.5 border border-(--b) px-2 py-1.5 text-center font-mono text-[10.5px] leading-tight whitespace-nowrap transition-[background-color,border-color,color,opacity] duration-300 @max-[690px]:border-t-2 @max-[690px]:border-t-(--c) @max-[690px]:px-1.5 @max-[690px]:pt-[5px]"
                style={{
                  visibility: hideBoxes ? "hidden" : undefined,
                  ["--c" as string]: c.color,
                  ["--b" as string]: state === "on" || preview === c.id ? c.color : "var(--color-line)",
                  background: state === "on" || preview === c.id ? `color-mix(in srgb, ${c.color} 9%, white)` : "white",
                  color: state === "off" ? "var(--color-ink-3)" : "var(--color-ink)",
                  opacity: state === "off" && preview !== c.id ? 0.6 : 1,
                }}
              >
                <span className="size-[7px] shrink-0 @max-[690px]:hidden" style={{ background: c.color }} aria-hidden />
                <span className="min-w-0">{c.label}</span>
                {pulseCat === c.id && <span key={pulse!.key} aria-hidden className="box-ping absolute -inset-px border" style={{ borderColor: c.color }} />}
              </button>

              {/* Hover / focus / tap a family: its skills, floating over the page */}
              <AnimatePresence>
                {preview === c.id && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
                    transition={{ duration: 0.2, ease }}
                    className="absolute top-full z-20 mt-1.5 flex w-max max-w-[18rem] flex-wrap gap-1 border border-line bg-white p-1.5"
                    style={(boxes[c.id]?.x ?? 0) > width / 2 ? { right: 0 } : { left: 0 }}
                  >
                    {c.skills.map((s) => (
                      <span
                        key={s.key}
                        onPointerEnter={(e) => e.pointerType === "mouse" && onActiveSkill(s.key)}
                        onPointerLeave={(e) => e.pointerType === "mouse" && onActiveSkill(null)}
                        className="inline-flex items-center gap-1.5 border px-1.5 py-0.5 font-mono text-[10.5px] whitespace-nowrap text-ink-2"
                        style={{ borderColor: `color-mix(in srgb, ${c.color} 45%, white)` }}
                      >
                        <span className="size-1.5" style={{ background: c.color }} aria-hidden />
                        {s.label}
                      </span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
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
        <svg aria-hidden className="pointer-events-none absolute inset-0 overflow-visible" width={width} height={Math.max(subH, 1)}>
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
                  strokeWidth={1}
                  initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ d, pathLength: 1, opacity: dimShown ? 0.25 : 0.8 }}
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
                initial={reduce ? false : { opacity: 0, x: it.x, y: CONNECT + it.row * ROW_H - 6 }}
                animate={{ opacity: dimShown ? 0.35 : 1, x: it.x, y: CONNECT + it.row * ROW_H }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: reduce ? 0 : 0.4, ease, delay: reduce ? 0 : 0.06 + i * 0.03 }}
                className="absolute top-0 left-0"
                style={{ width: it.w, height: ITEM_H }}
              >
                <span
                  aria-label={t.chart.skill(it.label, usage[it.key] ?? 0)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && onActiveSkill(it.key)}
                  onPointerLeave={(e) => e.pointerType === "mouse" && onActiveSkill(null)}
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
