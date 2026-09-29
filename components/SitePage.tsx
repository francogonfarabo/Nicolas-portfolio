import type { Metadata } from "next";
import type { Locale } from "@/content/types";
import { getContent } from "@/lib/content";
import { dictionaries, paths } from "@/lib/i18n";
import Header from "./Header";
import ProfileBoard from "./board/ProfileBoard";
import Gallery from "./Gallery";
import Footer from "./Footer";
import ConsoleHello from "./ConsoleHello";
import { I18nProvider } from "./I18n";

export async function siteMetadata(locale: Locale): Promise<Metadata> {
  const { profile } = await getContent(locale);
  const title = `${profile.name} · ${profile.role}`;
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://nicolas-portfolio-pied.vercel.app"),
    title,
    description: profile.intro,
    alternates: { canonical: paths[locale], languages: { en: paths.en, es: paths.es, "x-default": paths.en } },
    openGraph: { title, description: profile.intro, type: "profile", locale: locale === "es" ? "es_AR" : "en_US" },
  };
}

/** The whole one-pager, in one language. Used by both `/` and `/es`. */
export default async function SitePage({ locale }: { locale: Locale }) {
  const content = await getContent(locale);
  const t = dictionaries[locale];
  return (
    <I18nProvider locale={locale}>
      <a
        href="#work"
        className="sr-only z-[80] bg-ink px-3 py-2 font-mono text-xs text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {t.skipToWork}
      </a>
      <Header profile={content.profile} locale={locale} />
      <main>
        <ProfileBoard profile={content.profile} work={content.work} skills={content.skills} />
        <Gallery gallery={content.gallery} />
      </main>
      <Footer profile={content.profile} locale={locale} />
      <ConsoleHello name={content.profile.shortName} />
    </I18nProvider>
  );
}
