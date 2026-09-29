import type { Profile } from "@/content/types";

export default function Footer({ profile }: { profile: Profile }) {
  const year = new Date().getFullYear();
  return (
    <footer id="contact" aria-labelledby="contact-title" className="border-t border-line">
      <div className="mx-auto grid max-w-3xl gap-10 px-4 py-16 sm:px-6 md:py-20">
        <div>
          <p className="meta">Contact</p>
          <h2 id="contact-title" className="mt-4 max-w-xl text-[clamp(1.6rem,3.2vw,2.4rem)] leading-[1.1] font-medium tracking-[-0.025em] text-balance">
            {profile.contactTitle ?? "Get in touch"}
          </h2>
          {profile.contactBody && <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-2">{profile.contactBody}</p>}
          <a
            href={`mailto:${profile.email}`}
            className="group mt-8 inline-flex items-baseline gap-2 font-mono text-[clamp(1rem,2.2vw,1.35rem)] break-all text-ink sm:break-normal"
          >
            <span className="border-b border-ink/25 pb-0.5 transition-colors group-hover:border-accent">{profile.email}</span>
            <span aria-hidden className="text-accent transition-transform duration-300 group-hover:translate-x-0.5">
              →
            </span>
          </a>
        </div>
        <ul className="grid gap-px border border-line bg-line font-mono text-[12px] sm:grid-cols-3">
          {profile.linkedin && (
            <FooterRow
              href={profile.linkedin}
              label="LinkedIn"
              value={profile.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com/, "").replace(/\/$/, "") || "profile"}
              external
            />
          )}
          {profile.cvUrl && <FooterRow href={profile.cvUrl} label="CV" value="download .pdf" download />}
          <FooterRow href={`mailto:${profile.email}`} label="Email" value="write" />
        </ul>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4 font-mono text-[11px] text-ink-3 sm:px-6">
          <span>
            © {year} {profile.name}
          </span>
          <a href="#top" className="transition-colors hover:text-ink">
            ↑ top
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterRow({
  href,
  label,
  value,
  external,
  download,
}: {
  href: string;
  label: string;
  value: string;
  external?: boolean;
  download?: boolean;
}) {
  return (
    <li className="bg-white">
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        {...(download ? { download: true } : {})}
        className="flex items-center justify-between gap-6 px-4 py-3 transition-colors hover:bg-bg-2"
      >
        <span className="text-ink-3 uppercase">{label}</span>
        <span className="truncate text-ink">
          {value} {external ? "↗" : download ? "↓" : "→"}
        </span>
      </a>
    </li>
  );
}
