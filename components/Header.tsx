import type { Locale, Profile } from "@/content/types";
import { dictionaries, paths } from "@/lib/i18n";

export default function Header({ profile, locale }: { profile: Profile; locale: Locale }) {
  const t = dictionaries[locale];

  return (
    <header className="sticky top-0 z-50 h-(--header-h) border-b border-line bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
        <nav aria-label={t.nav.main} className="-ml-2 flex items-center gap-1 font-mono text-[11px] tracking-wide uppercase">
          <HeaderLink href="#work">{t.nav.work}</HeaderLink>
          <HeaderLink href="#photos">{t.nav.photos}</HeaderLink>
          <span aria-hidden className="mx-1 hidden h-4 w-px bg-line-2 sm:block" />
          <HeaderLink href={`mailto:${profile.email}`} className="max-sm:hidden">
            {t.nav.email}
          </HeaderLink>
          {profile.linkedin && (
            <HeaderLink href={profile.linkedin} external newTab={t.newTab} className="max-sm:hidden">
              {t.nav.linkedin}
            </HeaderLink>
          )}
        </nav>
        <div className="flex items-center gap-2 font-mono text-[11px] tracking-wide uppercase">
          <LanguageSwitch locale={locale} label={t.nav.language} />
          {profile.cvUrl && (
            <a
              href={profile.cvUrl}
              download
              className="inline-flex items-center gap-1.5 bg-ink px-2.5 py-1.5 text-white transition-colors hover:bg-accent-ink"
            >
              CV.pdf
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                <path d="M5 1v6m0 0L2.5 4.5M5 7l2.5-2.5M1.5 9h7" fill="none" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

function LanguageSwitch({ locale, label }: { locale: Locale; label: string }) {
  const langs = [
    { id: "en" as const, short: "EN", name: "English" },
    { id: "es" as const, short: "ES", name: "Español" },
  ];
  return (
    <div role="group" aria-label={label} className="flex items-center border border-line">
      {langs.map((l) =>
        l.id === locale ? (
          <span key={l.id} aria-current="true" className="bg-surface px-1.5 py-1 text-ink" title={l.name}>
            {l.short}
          </span>
        ) : (
          <a
            key={l.id}
            href={paths[l.id]}
            hrefLang={l.id}
            lang={l.id}
            title={l.name}
            aria-label={l.name}
            className="px-1.5 py-1 text-ink-3 transition-colors hover:text-ink"
          >
            {l.short}
          </a>
        ),
      )}
    </div>
  );
}

function HeaderLink({
  href,
  children,
  external,
  newTab,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  newTab?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={`inline-flex items-center gap-1 px-2 py-1.5 text-ink-2 transition-colors hover:text-ink ${className}`}
    >
      {children}
      {external && <span aria-hidden>↗</span>}
      {external && <span className="sr-only"> {newTab}</span>}
    </a>
  );
}
