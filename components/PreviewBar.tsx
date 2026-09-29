import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import type { Locale } from "@/content/types";
import { paths } from "@/lib/i18n";

/**
 * Only in Studio preview (draft mode): a small bar to leave the preview, plus the
 * overlays that make text clickable to edit it in the Studio.
 */
export default async function PreviewBar({ locale }: { locale: Locale }) {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  return (
    <>
      <div
        role="status"
        className="fixed bottom-4 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-4 bg-ink px-4 py-2 font-mono text-[11px] text-white uppercase shadow-lg"
      >
        <span>{locale === "es" ? "Vista previa · borradores" : "Preview · drafts"}</span>
        {/* API route: needs a full navigation, not client routing. */}
        <a href={`/api/draft-mode/disable?redirect=${paths[locale]}`} className="underline underline-offset-4 hover:text-accent">
          {locale === "es" ? "salir" : "exit"}
        </a>
      </div>
      <VisualEditing />
    </>
  );
}
