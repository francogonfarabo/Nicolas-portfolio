"use client";

import { AnimatePresence } from "motion/react";
import type { Profile, Skills } from "@/content/types";
import RadialChart from "../skills/RadialChart";
import Portrait, { ChildhoodNote, SCALE } from "./Portrait";
import { useI18n } from "../I18n";

/**
 * The radial skills map at the top of the page. It scrolls away like any other content; the family
 * strip right under it (SkillStrip) is its legend and is what stays pinned, so the families never
 * change form and nothing changes size while scrolling. Values are fixed; nodes can be pulled
 * around for fun and spring back.
 */
export default function ChartPanel({
  skills,
  usage,
  profile,
  highlight,
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
  onActiveSkill: (key: string | null) => void;
  pulse: { id: string; key: number } | null;
  revealed: boolean;
  onPortraitHover: (on: boolean) => void;
  onPortraitToggle: () => void;
}) {
  const { t } = useI18n();

  return (
    <div id="skills" role="region" aria-labelledby="skills-title" className="overflow-hidden rounded-2xl border border-line bg-white">
      <div data-titlebar className="px-4 pt-3">
        <h2 id="skills-title" className="text-[13px] font-medium tracking-tight text-ink">
          {t.chart.title}
        </h2>
      </div>

      <div className="dot-grid relative px-3 pt-1">
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
            <Portrait profile={profile} size={f.root} revealed={revealed} onHover={onPortraitHover} onToggle={onPortraitToggle} />
          )}
          renderOverlay={(f) => {
            // Above the grown portrait (it grows upward from its bottom edge).
            const above = f.height - f.cy + f.root / 2 + f.root * (SCALE - 1);
            // Short chart: smaller quote, on white, since it may rise over the title.
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
    </div>
  );
}
