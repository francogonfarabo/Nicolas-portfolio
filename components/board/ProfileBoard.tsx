"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Profile, Skills, Work } from "@/content/types";
import ChartPanel from "./ChartPanel";
import SectionChips, { type SectionChip } from "./SectionChips";
import WorkPanel from "./WorkPanel";
import { useI18n } from "../I18n";
import { PHONE_QUERY } from "@/lib/media";

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
  const activeSections = useActiveSection(sections);

  const since = profile.since ? ` · ${t.profile.since(profile.since)}` : "";
  /** How many projects used each skill: the chart's evidence of experience. */
  const usage = useMemo(() => {
    const n: Record<string, number> = {};
    for (const p of work.projects) for (const k of p.skills) n[k] = (n[k] ?? 0) + 1;
    return n;
  }, [work]);

  return (
    // No scroll anchoring here: the chart shrinking above the fold would make the browser shift
    // the page to compensate, fighting the scroll that drives it (and the section chips' targets).
    <section id="top" aria-label={t.profile.section} className="border-b border-line [overflow-anchor:none]">
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

        {/* Skills map: pinned under the header */}
        <div id="pin-block" className="sticky top-(--header-h) z-30 -mx-4 bg-white px-4 pt-2 pb-1 sm:-mx-6 sm:px-6">
          <ChartPanel
            skills={skills}
            usage={usage}
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

/**
 * Sizes the chart while scrolling and keeps --stuck-offset (the pinned block's height once
 * stuck, used as the sections' scroll margin) up to date; reports which section sits under it.
 *
 * Laptop/tablet: at the top the chart takes all the room the screen has under the name; as the
 * block rises to the header it shrinks to its pinned size (--chart-area), tracking the scroll.
 * Phones keep the fixed compact size.
 */
function useActiveSection(sections: SectionChip[]) {
  const [active, setActive] = useState<string[]>([]);
  const lastKey = useRef("");

  useEffect(() => {
    const block = document.getElementById("pin-block");
    if (!block) return;
    const root = document.documentElement;
    let raf = 0;
    let offset = -1;
    let lastCap = "";
    // Measures --chart-area (the pinned cap) in px.
    const pinProbe = document.createElement("div");
    pinProbe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;width:0;height:var(--chart-area)";
    document.body.appendChild(pinProbe);

    const update = () => {
      raf = 0;
      const headerH = parseFloat(getComputedStyle(root).getPropertyValue("--header-h")) || 48;
      const chart = block.querySelector<HTMLElement>("[data-chart]");
      const pinCap = pinProbe.offsetHeight;
      let pinnedH = block.offsetHeight;
      if (chart && !window.matchMedia(PHONE_QUERY).matches) {
        const chrome = block.offsetHeight - chart.offsetHeight; // title bar, chips, padding
        const restTop = (block.previousElementSibling?.getBoundingClientRect().bottom ?? 0) + window.scrollY;
        const startCap = Math.max(pinCap, Math.min(520, window.innerHeight - restTop - chrome - 16));
        const t = Math.min(1, Math.max(0, window.scrollY / Math.max(1, restTop - headerH)));
        const cap = `${Math.round(startCap + (pinCap - startCap) * t)}px`;
        if (cap !== lastCap) {
          lastCap = cap;
          block.style.setProperty("--chart-cap", cap);
        }
        // The chart never gets taller than the cap, so once pinned it's min(pinned cap, its own height).
        pinnedH = chrome + Math.min(pinCap, chart.offsetHeight);
      } else if (lastCap) {
        lastCap = "";
        block.style.removeProperty("--chart-cap");
      }
      const stuck = pinnedH + 8;
      if (stuck !== offset) {
        offset = stuck;
        root.style.setProperty("--stuck-offset", `${stuck}px`);
      }

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
