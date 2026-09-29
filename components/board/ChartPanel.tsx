"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Profile, Skills } from "@/content/types";
import RadialChart from "../skills/RadialChart";
import SkillList from "../skills/SkillList";
import Portrait, { ChildhoodNote } from "./Portrait";

/**
 * The skills map. Pinned under the header while the work history scrolls beneath it,
 * so hovering/tapping a project always shows its stack. Values are fixed; nodes can be
 * pulled around for fun and spring back.
 */
export default function ChartPanel({
  skills,
  profile,
  highlight,
  onFamilyHover,
  onActiveSkill,
  pulse,
  revealed,
  onPortraitHover,
  onPortraitToggle,
}: {
  skills: Skills;
  profile: Profile;
  highlight: Set<string> | null;
  onFamilyHover: (id: string | null) => void;
  onActiveSkill: (key: string | null) => void;
  pulse: { id: string; key: number } | null;
  revealed: boolean;
  onPortraitHover: (on: boolean) => void;
  onPortraitToggle: () => void;
}) {
  const reduce = useReducedMotion();
  const [touched, setTouched] = useState(false);
  const [showList, setShowList] = useState(false);

  return (
    <div id="skills" role="region" aria-labelledby="skills-title" className="ticks flex flex-col border border-line bg-white">
      {/* Title bar: name, legend, list toggle */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-line px-3 py-2">
        <h2 id="skills-title" className="meta !text-ink">
          fig.01 — Skills map
        </h2>
        <ul className="order-3 flex w-full flex-wrap gap-x-3 gap-y-1 sm:order-none sm:w-auto" aria-label="Skill families">
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
        <button
          type="button"
          onClick={() => setShowList((s) => !s)}
          aria-expanded={showList}
          aria-controls="skill-list"
          className="ml-auto px-1.5 py-0.5 font-mono text-[10.5px] text-ink uppercase transition-colors hover:bg-surface aria-expanded:bg-ink aria-expanded:text-white"
        >
          {showList ? "close" : "list"}
        </button>
      </div>

      {/* Chart */}
      <div className="dot-grid relative h-(--chart-area) px-3 pt-2">
        <p id="skills-desc" className="sr-only">
          Distance from the centre shows depth of experience. Use the arrow keys to move between skills; each one reads its
          level. A plain list of every skill is available with the list button.
        </p>
        <RadialChart
          categories={skills.categories}
          rings={skills.rings}
          onFirstTouch={() => setTouched(true)}
          highlight={highlight}
          onActive={onActiveSkill}
          pulse={pulse}
          fitHeight
          dimmed={revealed}
          labelledBy="skills-title"
          describedBy="skills-desc"
          renderRoot={(f) => (
            <Portrait
              profile={profile}
              size={f.root}
              revealed={revealed}
              onHover={onPortraitHover}
              onToggle={onPortraitToggle}
              showHint={!touched}
            />
          )}
          renderOverlay={(f) => (
            <AnimatePresence>
              {revealed && (
                <div
                  className="pointer-events-none absolute -translate-x-1/2"
                  style={{
                    left: f.cx,
                    bottom: f.height - f.cy + (f.root * 1.6) / 2 + (f.compact ? 10 : 18),
                    width: Math.min(560, f.width - 16),
                  }}
                >
                  <ChildhoodNote key="note" profile={profile} compact={f.compact} />
                </div>
              )}
            </AnimatePresence>
          )}
        />

        {/* Read-only list, over the chart */}
        <AnimatePresence>
          {showList && (
            <motion.div
              key="list"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 z-10 overflow-y-auto overscroll-contain bg-white/97 p-4"
            >
              <SkillList id="skill-list" categories={skills.categories} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
