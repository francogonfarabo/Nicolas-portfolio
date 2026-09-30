"use client";

import { AnimatePresence } from "motion/react";
import type { Profile, Skills } from "@/content/types";
import RadialChart from "../skills/RadialChart";
import Portrait, { ChildhoodNote, SCALE } from "./Portrait";
import { useI18n } from "../I18n";

/**
 * The skills map. Pinned under the header while the work history scrolls beneath it,
 * so hovering/tapping a project always shows its stack. Values are fixed; nodes can be
 * pulled around for fun and spring back.
 */
export default function ChartPanel({
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

  return (
    <div id="skills" role="region" aria-labelledby="skills-title" className="ticks flex flex-col border border-line bg-white">
      {/* Title bar: name, legend, list toggle */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-line px-3 py-2">
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

        {/* The only key the chart needs: what distance means. Deliberately no scale. */}
        <p
          aria-hidden
          className="pointer-events-none absolute right-3 bottom-2 font-mono text-[10px] tracking-wide text-ink-3 uppercase transition-opacity duration-300"
          style={{ opacity: revealed ? 0 : 1 }}
        >
          {t.chart.key}
        </p>

      </div>
    </div>
  );
}
