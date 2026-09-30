"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Project, Work } from "@/content/types";
import type { SkillMeta } from "./ProfileBoard";
import { useI18n } from "../I18n";

function Period({ start, end, current }: { start: string; end?: string; current: boolean }) {
  const { t } = useI18n();
  return (
    <>
      {start} — {current ? <span className="text-ink">{t.work.present}</span> : end}
    </>
  );
}

export default function WorkPanel({
  work,
  skillIndex,
  activeSkill,
  onProjectHover,
  onSkillTag,
}: {
  work: Work;
  skillIndex: Map<string, SkillMeta>;
  activeSkill: string | null;
  onProjectHover: (skills: string[] | null) => void;
  onSkillTag: (key: string) => void;
}) {
  const { t } = useI18n();
  const firstRich = work.projects.findIndex((p) => p.bullets.length > 2);
  const [open, setOpen] = useState<Set<number>>(() => new Set(firstRich >= 0 ? [firstRich] : []));
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const earliest = work.roles.at(-1)?.start;
  const usedIn = activeSkill ? work.projects.filter((p) => p.skills.includes(activeSkill)).length : 0;

  return (
    <div id="work" className="scroll-mt-[var(--stuck-offset,var(--panel-h))] pt-6 pb-16">
      {/* Roles */}
      <Block title={t.work.experience} aside={earliest ? `${earliest} — ${t.work.present}` : undefined} id="experience-title" anchor="experience">
        <ol className="divide-y divide-line">
          {work.roles.map((r) => (
            <li key={r.title + r.org} className="grid gap-x-6 gap-y-1 py-5 first:pt-0 sm:grid-cols-[8.5rem_minmax(0,1fr)]">
              <p className="font-mono text-[11px] leading-6 text-ink-3 uppercase tabular"><Period start={r.start} end={r.end} current={r.current} /></p>
              <div>
                <h3 className="text-[15px] leading-6 font-medium">
                  {r.title}
                  <span className="text-ink-3"> {t.work.at} </span>
                  {r.orgUrl ? (
                    <a href={r.orgUrl} target="_blank" rel="noreferrer" className="underline decoration-line-2 underline-offset-4 hover:decoration-ink">
                      {r.org}
                    </a>
                  ) : (
                    r.org
                  )}
                </h3>
                <div className="mt-2 space-y-2 text-[14px] leading-relaxed text-ink-2">
                  {r.paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
                {!!r.clients?.length && (
                  <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-3">
                    <span className="uppercase">{t.work.clients}:</span> {r.clients.join(" · ")}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Block>

      {/* Projects */}
      <Block
        title={t.work.projects}
        count={work.projects.length}
        aside={
          activeSkill && skillIndex.get(activeSkill)
            ? t.work.usedIn(skillIndex.get(activeSkill)!.label, usedIn)
            : t.work.rowHint
        }
        id="projects-title"
        anchor="projects"
      >
        <ul className="border-t border-line" onPointerLeave={() => onProjectHover(null)}>
          {work.projects.map((p, i) => (
            <ProjectRow
              key={p.name}
              project={p}
              open={open.has(i)}
              onToggle={() => toggle(i)}
              skillIndex={skillIndex}
              match={activeSkill ? p.skills.includes(activeSkill) : null}
              onHover={onProjectHover}
              onSkillTag={onSkillTag}
            />
          ))}
        </ul>
      </Block>

      {/* Credentials */}
      <Block title={t.work.certifications} count={work.certificates.length} id="certs-title" anchor="certifications">
        <ul className="border-t border-line">
          {work.certificates.map((c) => (
            <li key={c.name} className="grid grid-cols-[5.5rem_minmax(0,1fr)_auto] items-baseline gap-x-4 border-b border-line py-2.5 sm:grid-cols-[8.5rem_minmax(0,1fr)_auto] sm:gap-x-6">
              <span className="font-mono text-[11px] text-ink-3 uppercase tabular">{c.date}</span>
              <span className="text-[14px]">{c.name}</span>
              {c.url ? (
                <a href={c.url} target="_blank" rel="noreferrer" className="font-mono text-[11px] text-ink-2 uppercase hover:text-ink">
                  {t.work.verify} ↗<span className="sr-only"> {c.name} {t.newTab}</span>
                </a>
              ) : (
                <span className="font-mono text-[11px] text-ink-3">{c.note}</span>
              )}
            </li>
          ))}
        </ul>
      </Block>

      <div className="grid gap-x-10 sm:grid-cols-2">
        {work.education?.degree && (
          <Block title={t.work.education} id="edu-title" anchor="education">
            <div className="border-t border-line py-3">
              <p className="font-mono text-[11px] text-ink-3 uppercase tabular">
                {work.education.start} — {work.education.end}
              </p>
              <p className="mt-1 text-[14px] font-medium">{work.education.degree}</p>
              <p className="text-[13px] text-ink-2">
                {work.education.school}
                {work.education.place ? `, ${work.education.place}` : ""}
              </p>
            </div>
          </Block>
        )}
        {work.languages.length > 0 && (
          <Block title={t.work.languages} id="lang-title" anchor="languages">
            <ul className="border-t border-line">
              {work.languages.map((l) => (
                <li key={l.name} className="flex items-baseline justify-between gap-4 border-b border-line py-2.5">
                  <span className="text-[14px]">{l.name}</span>
                  <span className="font-mono text-[11px] text-ink-3 uppercase">{l.level}</span>
                </li>
              ))}
            </ul>
          </Block>
        )}
      </div>
    </div>
  );
}

function Block({
  title,
  count,
  aside,
  id,
  anchor,
  children,
}: {
  title: string;
  count?: number;
  aside?: string;
  id: string;
  /** Target for the section chips (see SectionChips). */
  anchor: string;
  children: React.ReactNode;
}) {
  return (
    <section id={anchor} aria-labelledby={id} className="mb-12 scroll-mt-[var(--stuck-offset,var(--panel-h))] last:mb-0">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 id={id} className="meta !text-ink">
          {title}
          {count != null && <span className="ml-2 text-ink-3 tabular">[{String(count).padStart(2, "0")}]</span>}
        </h2>
        {aside && (
          <p className="truncate font-mono text-[11px] text-ink-3" aria-live="polite">
            {aside}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function ProjectRow({
  project: p,
  open,
  onToggle,
  skillIndex,
  match,
  onHover,
  onSkillTag,
}: {
  project: Project;
  open: boolean;
  onToggle: () => void;
  skillIndex: Map<string, SkillMeta>;
  match: boolean | null;
  onHover: (skills: string[] | null) => void;
  onSkillTag: (key: string) => void;
}) {
  const reduce = useReducedMotion();
  const { t } = useI18n();
  const panelId = useId();
  const tags = p.skills.map((k) => [k, skillIndex.get(k)] as const).filter((x): x is readonly [string, SkillMeta] => !!x[1]);

  return (
    <li
      onPointerEnter={(e) => e.pointerType === "mouse" && onHover(p.skills)}
      onFocus={() => onHover(p.skills)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && onHover(null)}
      className="relative border-b border-line transition-opacity duration-300"
      style={{ opacity: match === false ? 0.35 : 1 }}
    >
      {match && <span aria-hidden className="absolute top-0 bottom-0 -left-3 w-0.5 bg-accent sm:-left-4" />}
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 py-3 text-left transition-colors hover:bg-bg-2 sm:grid-cols-[8.5rem_minmax(0,1fr)_auto] sm:gap-x-6"
        >
          <span className="hidden font-mono text-[11px] leading-6 text-ink-3 uppercase tabular sm:block">
            <Period start={p.start} end={p.end} current={p.current} />
          </span>
          <span className="min-w-0">
            <span className="block text-[14px] leading-6 font-medium">
              {p.name}
              {p.current && (
                <span className="ml-2 inline-block size-1.5 -translate-y-px rounded-full bg-plus align-middle">
                  <span className="sr-only">{t.work.ongoing}</span>
                </span>
              )}
            </span>
            {p.intro && <span className="block text-[13px] leading-snug text-ink-3">{p.intro}</span>}
            <span className="mt-1 block font-mono text-[10.5px] text-ink-3 uppercase sm:hidden"><Period start={p.start} end={p.end} current={p.current} /></span>
          </span>
          <span className="flex items-center gap-3 pt-1.5">
            <span className="hidden gap-[3px] md:flex" aria-hidden>
              {tags.map(([k, s]) => (
                <span key={k} className="size-[7px]" style={{ background: s.color }} title={s.label} />
              ))}
            </span>
            <span aria-hidden className="w-3 font-mono text-[13px] leading-none text-ink-3 group-hover:text-ink">
              {open ? "−" : "+"}
            </span>
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-4 sm:ml-[calc(8.5rem+1.5rem)]">
              <ul className="space-y-1.5 text-[13.5px] leading-relaxed text-ink-2">
                {p.bullets.map((b) => (
                  <li key={b} className="relative pl-4">
                    <span aria-hidden className="absolute top-0 left-0 font-mono text-ink-3">
                      –
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {tags.map(([k, s]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => onSkillTag(k)}
                    className="inline-flex items-center gap-1.5 border border-line px-1.5 py-0.5 font-mono text-[10.5px] text-ink-2 transition-colors hover:border-ink hover:text-ink"
                  >
                    <span className="size-1.5" style={{ background: s.color }} aria-hidden />
                    {s.label}
                    <span className="sr-only">{t.work.showInMap}</span>
                  </button>
                ))}
                {p.url && (
                  <a href={p.url} target="_blank" rel="noreferrer" className="ml-auto font-mono text-[10.5px] text-ink-2 uppercase hover:text-ink">
                    {t.work.website} ↗<span className="sr-only"> {t.newTab}</span>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
