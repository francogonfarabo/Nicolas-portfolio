"use client";

import { useMemo, useState } from "react";
import type { Profile, Skills, Work } from "@/content/types";
import ChartPanel from "./ChartPanel";
import WorkPanel from "./WorkPanel";
import { useI18n } from "../I18n";

export type SkillMeta = { label: string; color: string; family: string };

/**
 * The one-pager's core, in one column: who Nico is, then the skills map pinned under
 * the header while the work history scrolls beneath it.
 * Hover/tap a project → its skills light up. Hover a skill → the projects that used it light up.
 */
export default function ProfileBoard({ profile, work, skills }: { profile: Profile; work: Work; skills: Skills }) {
  const { t } = useI18n();
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const revealed = hovered || pinned;

  const [projectSkills, setProjectSkills] = useState<string[] | null>(null);
  const [familyHover, setFamilyHover] = useState<string | null>(null);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [pulse, setPulse] = useState<{ id: string; key: number } | null>(null);

  const skillIndex = useMemo(
    () =>
      new Map<string, SkillMeta>(
        skills.categories.flatMap((c) => c.skills.map((s) => [s.key, { label: s.label, color: c.color, family: c.label }])),
      ),
    [skills],
  );

  const highlight = useMemo(() => {
    if (projectSkills) return new Set(projectSkills);
    if (familyHover) {
      const cat = skills.categories.find((c) => c.id === familyHover);
      return cat ? new Set(cat.skills.map((s) => s.key)) : null;
    }
    return null;
  }, [projectSkills, familyHover, skills]);

  const since = profile.since ? ` · ${t.profile.since(profile.since)}` : "";
  const skillCount = skills.categories.reduce((n, c) => n + c.skills.length, 0);

  return (
    <section id="top" aria-label={t.profile.section} className="border-b border-line">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Identity (scrolls away) */}
        <div className="pt-8 pb-7 sm:pt-12">
          <p className="meta flex items-center gap-2">
            <span aria-hidden className="size-1.5 bg-accent" />
            {profile.role}
            {since}
          </p>
          <h1 className="mt-4 text-[clamp(2.1rem,6.4vw,3.4rem)] leading-[1] font-medium tracking-[-0.04em] text-balance">
            {profile.name}
          </h1>
          {profile.intro && <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-2">{profile.intro}</p>}
          <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[11px] text-ink-3 uppercase">
            <Stat label={t.profile.projects} value={work.projects.length} />
            <Stat label={t.profile.certifications} value={work.certificates.length} />
            <Stat label={t.profile.skillsMapped} value={skillCount} />
            {work.languages.length > 0 && <Stat label={t.profile.languages} value={work.languages.length} />}
          </dl>
        </div>

        {/* Skills map: pinned under the header */}
        <div className="sticky top-(--header-h) z-30 -mx-4 bg-white px-4 pt-2 pb-3 sm:-mx-6 sm:px-6">
          <ChartPanel
            skills={skills}
            profile={profile}
            highlight={highlight}
            onFamilyHover={setFamilyHover}
            onActiveSkill={setActiveSkill}
            pulse={pulse}
            revealed={revealed}
            onPortraitHover={setHovered}
            onPortraitToggle={() => setPinned((p) => !p)}
          />
        </div>

        {/* Work history (scrolls under the map) */}
        <WorkPanel
          work={work}
          skillIndex={skillIndex}
          activeSkill={activeSkill}
          onProjectHover={setProjectSkills}
          onSkillTag={(key) => setPulse({ id: key, key: Date.now() })}
        />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="sr-only">{label}</dt>
      <dd className="text-ink tabular">{value}</dd>
      <span aria-hidden>{label}</span>
    </div>
  );
}
