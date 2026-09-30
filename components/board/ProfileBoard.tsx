"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Profile, Skills, Work } from "@/content/types";
import ChartPanel from "./ChartPanel";
import SectionChips, { type SectionChip } from "./SectionChips";
import WorkPanel from "./WorkPanel";
import { useI18n } from "../I18n";

export type SkillMeta = { label: string; color: string; family: string };

/**
 * While the work history scrolls under it, the pinned skills map shrinks from --chart-area
 * to --chart-area-compact (globals.css), one pixel per pixel scrolled, so more projects stay
 * in view. Set to false to keep it full size (the previous behaviour).
 */
const COMPRESS_ON_SCROLL = true;

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

  const sections = useMemo<SectionChip[]>(
    () =>
      [
        work.roles.length > 0 && { id: "experience", label: t.work.experience },
        work.projects.length > 0 && { id: "projects", label: t.work.projects },
        work.certificates.length > 0 && { id: "certifications", label: t.work.certifications },
        !!work.education?.degree && { id: "education", label: t.work.education },
        work.languages.length > 0 && { id: "languages", label: t.work.languages },
      ].filter((x): x is SectionChip => !!x),
    [work, t],
  );
  const activeSections = usePinnedMap(sections);

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

        {/* Skills map + section chips: pinned under the header. The pinned block keeps its full
            height in the flow; as the map shrinks, the see-through spacer below it lets the
            work history show, so nothing on the page jumps. */}
        <div id="pin-start" aria-hidden />
        <div className="pointer-events-none sticky top-(--header-h) z-30 -mx-4 sm:-mx-6">
          <div id="pin-block" className="pointer-events-auto bg-white px-4 pt-2 sm:px-6">
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
            <SectionChips sections={sections} active={activeSections} />
          </div>
          <div id="pin-spacer" aria-hidden />
          {/* Measured by usePinnedMap */}
          <div id="pin-full" aria-hidden className="invisible absolute h-(--chart-area) w-0" />
          <div id="pin-compact" aria-hidden className="invisible absolute h-(--chart-area-compact) w-0" />
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

/**
 * Drives the pinned block on scroll: shrinks the map (COMPRESS_ON_SCROLL), keeps
 * --stuck-offset (the pinned block's height once shrunk, used as the sections' scroll margin)
 * up to date, and reports which section sits under the map.
 */
function usePinnedMap(sections: SectionChip[]) {
  const [active, setActive] = useState<string[]>([]);
  const lastKey = useRef("");

  useEffect(() => {
    const $ = (id: string) => document.getElementById(id);
    const start = $("pin-start");
    const block = $("pin-block");
    const spacer = $("pin-spacer");
    const full = $("pin-full");
    const compact = $("pin-compact");
    if (!start || !block || !spacer || !full || !compact) return;
    const root = document.documentElement;
    let raf = 0;
    let offset = -1;

    const update = () => {
      raf = 0;
      const headerH = parseFloat(getComputedStyle(root).getPropertyValue("--header-h")) || 48;
      const fullH = full.offsetHeight;
      const minH = COMPRESS_ON_SCROLL ? Math.min(fullH, compact.offsetHeight) : fullH;
      const past = Math.max(0, headerH - start.getBoundingClientRect().top);
      const h = Math.round(Math.max(minH, fullH - past));
      block.style.setProperty("--chart-h", `${h}px`);
      spacer.style.height = `${fullH - h}px`;

      const stuck = block.offsetHeight - (h - minH) + 8;
      if (stuck !== offset) {
        offset = stuck;
        root.style.setProperty("--stuck-offset", `${stuck}px`);
      }

      // The section whose top has passed the bottom of the pinned block (ties: both).
      const line = headerH + stuck + 24;
      let best = -Infinity;
      const tops = sections.map((s) => {
        const top = $(s.id)?.getBoundingClientRect().top ?? Infinity;
        if (top <= line) best = Math.max(best, top);
        return top;
      });
      const on = best === -Infinity ? [] : sections.filter((_, i) => Math.abs(tops[i] - best) < 2).map((s) => s.id);
      const key = on.join();
      if (key !== lastKey.current) {
        lastKey.current = key;
        setActive(on);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(block);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
    };
  }, [sections]);

  return active;
}
