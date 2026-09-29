import type { Profile } from "@/content/types";

export default function Header({ profile }: { profile: Profile }) {
  const initials = profile.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 h-(--header-h) border-b border-line bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex min-w-0 shrink-0 items-center gap-3" aria-label={`${profile.name}, back to top`}>
          <span className="grid h-6 shrink-0 place-items-center border border-ink px-1.5 font-mono text-[10px] leading-none font-medium tracking-wider">
            {initials}
          </span>
          <span className="hidden truncate text-[13px] font-medium sm:inline">{profile.name}</span>
        </a>
        <nav aria-label="Contact" className="flex items-center gap-1 font-mono text-[11px] tracking-wide uppercase">
          <HeaderLink href="#work">Work</HeaderLink>
          <HeaderLink href="#photos">Photos</HeaderLink>
          <span aria-hidden className="mx-1 hidden h-4 w-px bg-line-2 sm:block" />
          <HeaderLink href={`mailto:${profile.email}`} className="max-sm:hidden">
            Email
          </HeaderLink>
          {profile.linkedin && (
            <HeaderLink href={profile.linkedin} external className="max-sm:hidden">
              LinkedIn
            </HeaderLink>
          )}
          {profile.cvUrl && (
            <a
              href={profile.cvUrl}
              download
              className="ml-1 inline-flex items-center gap-1.5 bg-ink px-2.5 py-1.5 text-white transition-colors hover:bg-accent-ink"
            >
              CV.pdf
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                <path d="M5 1v6m0 0L2.5 4.5M5 7l2.5-2.5M1.5 9h7" fill="none" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}

function HeaderLink({
  href,
  children,
  external,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
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
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}
