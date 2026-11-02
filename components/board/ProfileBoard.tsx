"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Profile, Skills, Work } from "@/content/types";
import ChartPanel from "./ChartPanel";
import SkillStrip from "./SkillStrip";
import SectionChips, { type SectionChip } from "./SectionChips";
import WorkPanel from "./WorkPanel";
import { useI18n } from "../I18n";
import { PHONE_QUERY } from "@/lib/media";

export type SkillMeta = { label: string; color: string; family: string };

/**
 * The one-pager's core, in one column: who Nico is, the radial skills map, then its legend, the
 * family strip, which stays pinned under the header (with the section chips) while the work
 * history scrolls beneath it. Nothing changes form or size while scrolling.
 * Open a project → it's the visitor's focus: its skills stay lit (the strip lays them out) and
 * hovering other projects changes nothing until it's closed. With nothing open, hovering a project
 * lights its skills (strip: tints its families). Hover a skill in the radial chart → the projects
 * that used it light up.
 */
export default function ProfileBoard({ profile, work, skills }: { profile: Profile; work: Work; skills: Skills }) {
  const { t } = useI18n();
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const revealed = hovered || pinned;

  /** The project under the pointer / focus (desktop), and the project the visitor opened. */
  const [hoverSkills, setHoverSkills] = useState<string[] | null>(null);
  // Hover intent: a short pause before lighting up (and before letting go), so running the
  // pointer down the list doesn't make the map flicker.
  const hoverTimer = useRef<number | undefined>(undefined);
  const onProjectHover = useCallback((skills: string[] | null) => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setHoverSkills(skills), 140);
  }, []);
  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);
  const [openSkills, setOpenSkills] = useState<string[] | null>(null);
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

  // The open project is the focus; hover only speaks when nothing is open.
  const projectSkills = openSkills ?? hoverSkills;
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
  const activeSections = useScrollState(sections);
  const reserve = useMemo(() => work.projects.map((p) => p.skills), [work]);
  const litFamilies = useMemo(
    () => (projectSkills ? new Set(skills.categories.filter((c) => c.skills.some((s) => projectSkills.includes(s.key))).map((c) => c.id)) : null),
    [projectSkills, skills],
  );

  const since = profile.since ? ` · ${t.profile.since(profile.since)}` : "";
  /** How many projects used each skill: the chart's evidence of experience. */
  const usage = useMemo(() => {
    const n: Record<string, number> = {};
    for (const p of work.projects) for (const k of p.skills) n[k] = (n[k] ?? 0) + 1;
    return n;
  }, [work]);

  return (
    // (Scroll anchoring is off for the whole page; see globals.css.)
    <section id="top" aria-label={t.profile.section} className="border-b border-line">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Identity (scrolls away) */}
        <div className="pt-8 pb-7 sm:pt-12">
          <h1 className="text-[clamp(2.1rem,6.4vw,3.4rem)] leading-[1] font-medium tracking-[-0.04em] text-balance">
            {profile.name}
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-2">
            {profile.role}
            {since}
          </p>
        </div>

        {/* Radial skills map (scrolls away) */}
        <div id="chart-block">
          <ChartPanel
            skills={skills}
            usage={usage}
            profile={profile}
            highlight={highlight}
            onActiveSkill={setActiveSkill}
            pulse={pulse}
            revealed={revealed}
            onPortraitHover={setHovered}
            onPortraitToggle={() => setPinned((p) => !p)}
          />
        </div>

        {/* Its legend, the family strip, and the section chips: pinned under the header */}
        <div id="pin-block" className="group sticky top-(--header-h) z-30 -mx-4 bg-white/85 px-4 pt-2 pb-1 backdrop-blur-md sm:-mx-6 sm:px-6">
          <div className="rounded-2xl border border-line bg-white p-2.5 transition-shadow max-sm:p-2 duration-300 group-data-[stuck]:shadow-[0_12px_32px_-20px_rgba(10,10,10,0.35)]">
            <SkillStrip
              categories={skills.categories}
              usage={usage}
              lit={litFamilies}
              shown={openSkills}
              reserve={reserve}
              pulse={pulse}
              onFamilyHover={setFamilyHover}
            />
          </div>
          <SectionChips sections={sections} active={activeSections} />
        </div>

        {/* Work history (scrolls under the map) */}
        <WorkPanel
          work={work}
          skillIndex={skillIndex}
          activeSkill={activeSkill}
          onProjectHover={onProjectHover}
          onProjectSelect={setOpenSkills}
          onSkillTag={(key) => setPulse({ id: key, key: Date.now() })}
        />
      </div>
    </section>
  );
}

/**
 * Follows the scroll: sizes the radial chart (laptop/tablet: as big as fits under the name, with the
 * strip and chips still on screen; phones: compact), keeps --stuck-offset (the pinned block's
 * height, used as the sections' scroll margin) up to date, marks the block while it's stuck, and
 * reports which section sits under it.
 */
function useScrollState(sections: SectionChip[]) {
  const [active, setActive] = useState<string[]>([]);
  const lastKey = useRef("");

  useEffect(() => {
    const block = document.getElementById("pin-block");
    const chartBlock = document.getElementById("chart-block");
    if (!block || !chartBlock) return;
    const root = document.documentElement;
    let raf = 0;
    let offset = -1;
    let lastCap = "";
    // Measures --chart-area (the smallest the radial chart gets) in px.
    const pinProbe = document.createElement("div");
    pinProbe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;width:0;height:var(--chart-area)";
    document.body.appendChild(pinProbe);

    const update = () => {
      raf = 0;
      const headerH = parseFloat(getComputedStyle(root).getPropertyValue("--header-h")) || 48;
      const phone = window.matchMedia(PHONE_QUERY).matches;
      const restTop = chartBlock.getBoundingClientRect().top + window.scrollY;

      if (!phone) {
        // What's left of the screen under the name once the chart's title, the strip and the chips are counted.
        const titleBar = chartBlock.querySelector<HTMLElement>("[data-titlebar]");
        const chrome = (titleBar?.offsetHeight ?? 32) + 6 + block.offsetHeight;
        const cap = `${Math.round(Math.max(pinProbe.offsetHeight, Math.min(520, window.innerHeight - restTop - chrome - 12)))}px`;
        if (cap !== lastCap) {
          lastCap = cap;
          chartBlock.style.setProperty("--chart-cap", cap);
        }
      } else if (lastCap) {
        lastCap = "";
        chartBlock.style.removeProperty("--chart-cap");
      }

      const stuck = block.offsetHeight + 8;
      if (stuck !== offset) {
        offset = stuck;
        root.style.setProperty("--stuck-offset", `${stuck}px`);
      }
      block.toggleAttribute("data-stuck", block.getBoundingClientRect().top <= headerH + 0.5 && window.scrollY > 0);

      // The section whose top has passed the bottom of the pinned block (ties: both).
      const line = headerH + stuck + 24;
      let best = -Infinity;
      const tops = sections.map((s) => {
        const top = document.getElementById(s.id)?.getBoundingClientRect().top ?? Infinity;
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
    ro.observe(chartBlock);
    return () => {
      pinProbe.remove();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
    };
  }, [sections]);

  return active;
}
