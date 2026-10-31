"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Profile, Skills } from "@/content/types";
import RadialChart from "../skills/RadialChart";
import Portrait, { ChildhoodNote, SCALE } from "./Portrait";
import SkillStrip from "./SkillStrip";
import CategoryFlight, { rectOf, type FlightItem } from "./CategoryFlight";
import { useI18n } from "../I18n";

export type ChartView = "radial" | "strip";

/**
 * The skills map, in two forms. At the top of the page it's the radial chart; on laptops and
 * tablets, once it reaches the header it turns into a slim strip of family boxes (SkillStrip)
 * that stays pinned while the work history scrolls beneath. The switch is one movement: each
 * family flies between its hub and its box (CategoryFlight) while the rest of the chart fades
 * and the panel's height eases to the new size. Values are fixed; radial nodes can be pulled
 * around for fun and spring back.
 */
export default function ChartPanel({
  view: wanted,
  instant,
  litFamilies,
  shown,
  dimShown,
  skills,
  usage,
  profile,
  highlight,
  onFamilyHover,
  onActiveSkill,
  pulse,
  revealed,
  onPortraitHover,
  onPortraitToggle,
}: {
  view: ChartView;
  /** Switch without the flight (first paint, reduced motion). */
  instant: boolean;
  litFamilies: Set<string> | null;
  shown: string[] | null;
  dimShown: boolean;
  skills: Skills;
  usage: Record<string, number>;
  profile: Profile;
  highlight: Set<string> | null;
  onFamilyHover: (id: string | null) => void;
  onActiveSkill: (key: string | null) => void;
  pulse: { id: string; key: number } | null;
  revealed: boolean;
  onPortraitHover: (on: boolean) => void;
  onPortraitToggle: () => void;
}) {
  const { t } = useI18n();
  const reduce = !!useReducedMotion();
  const [view, setView] = useState<ChartView>(wanted);
  const [flight, setFlight] = useState<{ toStrip: boolean; items: FlightItem[] } | null>(null);
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  /** The panel's height when the switch began; it eases to the new view's height with the flight. */
  const fromH = useRef(0);

  // A new view was asked for: note where every family is right now (mid-flight pieces included),
  // then swap and fly them to their new places.
  useLayoutEffect(() => {
    if (wanted === view) return;
    if (instant || reduce) {
      setFlight(null);
      setView(wanted);
      return;
    }
    const from = (id: string) =>
      document.querySelector(`[data-flight="${id}"]`) ??
      document.querySelector(view === "radial" ? `#skills [data-hub="${id}"]` : `[data-cat-box="${id}"]`);
    const items = skills.categories.flatMap((c) => {
      const el = from(c.id);
      return el ? [{ id: c.id, label: c.label, color: c.color, from: rectOf(el) }] : [];
    });
    const box = outer.current;
    if (items.length && box) {
      // Hold the current height; the flight eases it to the new view's (the outgoing view is out of
      // the flow and clipped meanwhile).
      fromH.current = box.offsetHeight;
      box.style.height = `${fromH.current}px`;
      box.style.overflow = "hidden";
    }
    setFlight(items.length ? { toStrip: wanted === "strip", items } : null);
    setView(wanted);
  }, [wanted, view, instant, reduce, skills]);

  // In step with the flight: never let the panel's edge cut across a piece still on its way.
  const onFrame = (e: number, lowest: number) => {
    const box = outer.current;
    if (!box || !inner.current) return;
    const to = inner.current.offsetHeight + 2;
    const from = fromH.current;
    const h = Math.min(Math.max(from, to), Math.max(from + (to - from) * e, lowest - box.getBoundingClientRect().top + 6));
    box.style.height = `${h}px`;
  };
  const onLanded = () => {
    const box = outer.current;
    if (box) {
      box.style.height = "";
      box.style.overflow = "";
    }
    setFlight(null);
  };

  const radial = (
    <>
      {/* Title bar: name, legend */}
      <div data-titlebar className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-line px-3 py-2">
        <h2 id="skills-title" className="meta !text-ink">
          {t.chart.title}
        </h2>
        <ul className="order-3 flex w-full flex-wrap gap-x-3 gap-y-1 sm:order-none sm:w-auto" aria-label={t.chart.families}>
          {skills.categories.map((c) => (
            <li
              key={c.id}
              onPointerEnter={() => onFamilyHover(c.id)}
              onPointerLeave={() => onFamilyHover(null)}
              className="flex cursor-default items-center gap-1.5 font-mono text-[10.5px] text-ink-3 transition-colors hover:text-ink"
            >
              <span className="size-[7px]" style={{ background: c.color }} aria-hidden />
              {c.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Chart */}
      <div className="dot-grid relative px-3 pt-2">
        <p id="skills-desc" className="sr-only">
          {t.chart.description}
        </p>
        <RadialChart
          categories={skills.categories}
          usage={usage}
          highlight={highlight}
          onActive={onActiveSkill}
          pulse={pulse}
          fitHeight
          dimmed={revealed}
          hideHubs={!!flight && !flight.toStrip}
          labelledBy="skills-title"
          describedBy="skills-desc"
          renderRoot={(f) => (
            <Portrait
              profile={profile}
              size={f.root}
              revealed={revealed}
              onHover={onPortraitHover}
              onToggle={onPortraitToggle}
            />
          )}
          renderOverlay={(f) => {
            // Above the grown portrait (it grows upward from its bottom edge).
            const above = f.height - f.cy + f.root / 2 + f.root * (SCALE - 1);
            // Short chart: smaller quote, on white, since it may rise over the legend.
            const tight = f.compact || f.height - above < 150;
            return (
              <AnimatePresence>
                {revealed && (
                  <div
                    className="pointer-events-none absolute -translate-x-1/2"
                    style={{
                      left: f.cx,
                      bottom: above + (tight ? 10 : 18),
                      width: tight ? f.width + 20 : Math.min(560, f.width - 16),
                    }}
                  >
                    <ChildhoodNote key="note" profile={profile} compact={tight} className={tight ? "bg-white/95 px-4 py-1.5" : ""} />
                  </div>
                )}
              </AnimatePresence>
            );
          }}
        />
      </div>
    </>
  );

  return (
    <div ref={outer} id="skills" role="region" aria-labelledby="skills-title" className="ticks flex flex-col border border-line bg-white">
      <div ref={inner} className="relative">
        <AnimatePresence initial={false} mode="popLayout">
          {view === "radial" ? (
            <motion.div
              key="radial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              {radial}
            </motion.div>
          ) : (
            <motion.div
              key="strip"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.18 } }}
              transition={{ duration: 0.3 }}
              className="dot-grid w-full p-2"
            >
              <SkillStrip
                categories={skills.categories}
                usage={usage}
                lit={litFamilies}
                shown={shown}
                dimShown={dimShown}
                hideBoxes={!!flight?.toStrip}
                pulse={pulse}
                onActiveSkill={onActiveSkill}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {flight && <CategoryFlight items={flight.items} toStrip={flight.toStrip} onFrame={onFrame} onDone={onLanded} />}
    </div>
  );
}
