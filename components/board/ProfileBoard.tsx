"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Profile, Skills, Work } from "@/content/types";
import ChartPanel, { type ChartView } from "./ChartPanel";
import SectionChips, { type SectionChip } from "./SectionChips";
import WorkPanel from "./WorkPanel";
import { useI18n } from "../I18n";
import { PHONE_QUERY } from "@/lib/media";

export type SkillMeta = { label: string; color: string; family: string };

/**
 * The one-pager's core, in one column: who Nico is, then the skills map pinned under
 * the header while the work history scrolls beneath it (on laptops/tablets as a slim strip).
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
  const [view, setView] = useState<{ view: ChartView; instant: boolean }>({ view: "radial", instant: true });
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
  const activeSections = useScrollState(sections, (v, instant) => setView({ view: v, instant }));
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
    // No scroll anchoring here: the chart changing form above the fold would make the browser shift
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
            view={view.view}
            instant={view.instant}
            litFamilies={litFamilies}
            shown={openSkills}
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
          onProjectHover={onProjectHover}
          onProjectSelect={setOpenSkills}
          onSkillTag={(key) => setPulse({ id: key, key: Date.now() })}
        />
      </div>
    </section>
  );
}

/**
 * Follows the scroll: picks the chart's form, sizes the radial one, keeps --stuck-offset (the
 * pinned block's height once stuck, used as the sections' scroll margin) up to date, and reports
 * which section sits under the pinned block.
 *
 * Laptop/tablet: the radial chart takes all the room the screen has under the name; when the
 * block reaches the header it turns into the strip, and back once the visitor scrolls 40px
 * above that point (the gap stops it flickering at the line). Phones keep the compact radial chart.
 */
function useScrollState(sections: SectionChip[], onView: (view: ChartView, instant: boolean) => void) {
  const [active, setActive] = useState<string[]>([]);
  const lastKey = useRef("");
  const viewCb = useRef(onView);
  viewCb.current = onView;

  useEffect(() => {
    const block = document.getElementById("pin-block");
    if (!block) return;
    const root = document.documentElement;
    const mounted = performance.now();
    let raf = 0;
    let offset = -1;
    let lastCap = "";
    let view: ChartView = "radial";
    let stripH = 0;
    // Measures --chart-area (the pinned cap) in px.
    const pinProbe = document.createElement("div");
    pinProbe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;width:0;height:var(--chart-area)";
    document.body.appendChild(pinProbe);

    const update = () => {
      raf = 0;
      const headerH = parseFloat(getComputedStyle(root).getPropertyValue("--header-h")) || 48;
      const panel = block.querySelector<HTMLElement>("#skills");
      const phone = window.matchMedia(PHONE_QUERY).matches;
      const restTop = (block.previousElementSibling?.getBoundingClientRect().bottom ?? 0) + window.scrollY;
      const stickAt = restTop - headerH;
      const around = panel ? block.offsetHeight - panel.offsetHeight : 0; // chips and padding

      let next = view;
      if (phone) next = "radial";
      else if (view === "radial" && window.scrollY >= stickAt - 1) next = "strip";
      else if (view === "strip" && window.scrollY < stickAt - 40) next = "radial";
      if (next !== view) {
        view = next;
        // Landing mid-page (reload, a link to a section) shouldn't play the flight.
        viewCb.current(next, performance.now() - mounted < 700);
      }

      let pinnedH = block.offsetHeight;
      if (!phone) {
        // The radial chart's cap: what's left of the screen under the name.
        const titleBar = block.querySelector<HTMLElement>("[data-titlebar]");
        const chrome = around + (titleBar?.offsetHeight ?? 37) + 10;
        const cap = `${Math.round(Math.max(pinProbe.offsetHeight, Math.min(520, window.innerHeight - restTop - chrome - 16)))}px`;
        if (cap !== lastCap) {
          lastCap = cap;
          block.style.setProperty("--chart-cap", cap);
        }
        if (view === "strip" && panel && !panel.querySelector("[data-chart]")) stripH = block.offsetHeight;
        // Sections land under the strip (its last height, or about a row of boxes before it's been shown).
        pinnedH = view === "strip" || stripH ? stripH || block.offsetHeight : around + 48;
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
