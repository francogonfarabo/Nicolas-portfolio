import type { SkillCategory, Skills } from "@/content/types";
import { levelName } from "./geometry";

/** The same data as the chart, as a plain list: for screen readers, keyboards and quick scanning. */
export default function SkillList({ id, categories, rings }: { id: string; categories: SkillCategory[]; rings: Skills["rings"] }) {
  return (
    <div id={id} className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
      {categories.map((cat) => (
        <section key={cat.id} aria-label={cat.label} className="min-w-0">
          <h3 className="meta mb-2 flex items-center gap-2 !text-ink">
            <span className="size-2" style={{ background: cat.color }} aria-hidden />
            {cat.label}
          </h3>
          <dl className="space-y-1.5">
            {cat.skills.map((s) => (
              <div key={s.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
                <dt className="truncate text-[13px] text-ink-2">{s.label}</dt>
                <dd className="text-right font-mono text-[11px] text-ink-3 uppercase">{levelName(s.value, rings)}</dd>
                <dd aria-hidden className="col-span-2 h-[2px] bg-line-2">
                  <span className="block h-full" style={{ width: `${s.value}%`, background: cat.color }} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
