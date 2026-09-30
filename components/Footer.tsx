import type { Locale } from "@/content/types";
import { dictionaries } from "@/lib/i18n";

/** Site credit, not Nico's content: fixed here rather than in Sanity. */
const DESIGNER = {
  name: "Franco Gonzalez Farabollini",
  url: "https://www.linkedin.com/in/franco-gonzalez-farabollini-568455148/",
};

/** Just the credit. Contact lives in the header. */
export default function Footer({ locale }: { locale: Locale }) {
  const t = dictionaries[locale];
  return (
    <footer className="mx-auto max-w-3xl px-4 py-6 font-mono text-[11px] text-ink-3 sm:px-6">
      {t.footer.designedBy}{" "}
      <a href={DESIGNER.url} target="_blank" rel="noreferrer" className="text-ink-2 transition-colors hover:text-ink">
        {DESIGNER.name} ↗<span className="sr-only"> {t.newTab}</span>
      </a>
    </footer>
  );
}
