import { draftMode } from "next/headers";
import { defineQuery } from "next-sanity";
import { client, readToken } from "@/sanity/client";
import { profile as localProfile, work as localWork } from "@/content/cv";
import { skills as localSkills } from "@/content/skills";
import { gallery as localGallery } from "@/content/gallery";
import type {
  Img,
  L,
  Locale,
  RawGallery,
  RawImg,
  RawProfile,
  RawSkills,
  RawWork,
  SiteContent,
} from "@/content/types";
import { formatDate, tr } from "@/lib/i18n";

const image = `{ alt, title, hotspot, "asset": asset->{ url, metadata { lqip, dimensions { width, height } } } }`;

const QUERY = defineQuery(`{
  "profile": *[_id == "profile"][0]{
    name, shortName, role, since, intro, childhoodQuote, email, linkedin, contactTitle, contactBody,
    "portrait": portrait${image},
    "childhood": childhoodPhoto${image},
    "cvUrl": cvFile.asset->url,
    "cvUrlEs": cvFileEs.asset->url
  },
  "work": *[_id == "work"][0]{
    roles[]{ title, org, orgUrl, start, end, current, paragraphs, clients },
    projects[]{ name, url, start, end, current, intro, bullets, skills },
    certificates[]{ name, date, url, note },
    education,
    languages[]{ name, level }
  },
  "skills": *[_id == "skills"][0]{
    rings[]{ value, label },
    categories[]{ _key, label, color, skills[]{ key, label, value, basis } }
  },
  "gallery": *[_id == "gallery"][0]{ title, intro, "photos": photos[]${image} }
}`);

type SanityImage = {
  alt?: L;
  title?: L;
  hotspot?: { x: number; y: number };
  asset?: { url: string; metadata?: { lqip?: string; dimensions?: { width: number; height: number } } };
} | null;

const toRawImg = (i: SanityImage): RawImg | undefined =>
  i?.asset?.url && i.asset.metadata?.dimensions
    ? {
        src: i.asset.url,
        width: i.asset.metadata.dimensions.width,
        height: i.asset.metadata.dimensions.height,
        blurDataURL: i.asset.metadata.lqip,
        alt: i.alt ?? { en: "" },
        focus: i.hotspot ? { x: i.hotspot.x, y: i.hotspot.y } : undefined,
      }
    : undefined;

const clean = <T,>(arr: (T | null | undefined)[] | null | undefined): T[] => (arr ?? []).filter(Boolean) as T[];
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const defined = <T extends object>(o: T) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v != null && v !== "")) as Partial<T>;

type Raw = { profile: RawProfile; work: RawWork; skills: RawSkills; gallery: RawGallery };

/** Reads Sanity; any section that's missing or unreachable falls back to `content/`. */
async function getRaw(): Promise<Raw & { source: SiteContent["source"] }> {
  const local: Raw = { profile: localProfile, work: localWork, skills: localSkills, gallery: localGallery };
  if (!client) return { ...local, source: "local" };

  let isDraft = false;
  try {
    isDraft = (await draftMode()).isEnabled;
  } catch {
    // Outside a request (static build): published content.
  }

  let data: any;
  try {
    if (isDraft && readToken) {
      // Studio preview: unpublished drafts, uncached, with invisible click-to-edit markers.
      data = await client.fetch(QUERY, {}, {
        perspective: "drafts",
        token: readToken,
        useCdn: false,
        cache: "no-store",
        stega: {
          enabled: true,
          studioUrl: "/studio",
          // Only translatable text. Not skill labels (the chart measures them for layout) nor alt text.
          filter: ({ sourcePath, sourceDocument }) => {
            if (sourceDocument?._type === "skills" || sourcePath.includes("alt")) return false;
            const last = sourcePath.at(-1);
            return last === "en" || last === "es";
          },
        },
      });
    } else {
      // Dev: always fresh, so Studio edits show on refresh. Prod: refreshed at most every 60s.
      const revalidate = process.env.NODE_ENV === "development" ? 0 : 60;
      data = await client.fetch(QUERY, {}, { next: { revalidate, tags: ["sanity"] } });
    }
  } catch (err) {
    console.warn("[content] Sanity fetch failed, using local content:", (err as Error).message);
    return { ...local, source: "local" };
  }

  const p = data?.profile;
  const profile: RawProfile = p?.name
    ? {
        ...localProfile,
        ...defined(p),
        portrait: toRawImg(p.portrait) ?? localProfile.portrait,
        childhood: toRawImg(p.childhood) ?? localProfile.childhood,
        cvUrl: p.cvUrl ?? localProfile.cvUrl,
        cvUrlEs: p.cvUrlEs ?? undefined,
      }
    : localProfile;

  const w = data?.work;
  const work: RawWork = w
    ? {
        roles: clean<any>(w.roles).map((r) => ({ ...r, current: !!r.current, paragraphs: clean(r.paragraphs), clients: clean(r.clients) })),
        projects: clean<any>(w.projects).map((pr) => ({ ...pr, current: !!pr.current, bullets: clean(pr.bullets), skills: clean(pr.skills) })),
        certificates: clean(w.certificates),
        education: w.education ?? undefined,
        languages: clean(w.languages),
      }
    : localWork;

  const s = data?.skills;
  const skills: RawSkills = s?.categories?.length
    ? {
        rings: clean(s.rings).length ? clean(s.rings) : localSkills.rings,
        categories: clean<any>(s.categories).map((c) => ({
          id: slug(c.label?.en ?? c._key),
          label: c.label ?? { en: "" },
          color: c.color,
          skills: clean<any>(c.skills).filter((k) => k.key && k.label?.en),
        })),
      }
    : localSkills;

  const g = data?.gallery;
  const photos = clean<SanityImage>(g?.photos)
    .map((ph) => {
      const img = toRawImg(ph);
      return img ? { ...img, title: ph?.title ?? { en: "" } } : null;
    })
    .filter(Boolean) as RawGallery["photos"];
  const gallery: RawGallery = photos.length ? { title: g.title, intro: g.intro, photos } : localGallery;

  return { profile, work, skills, gallery, source: "sanity" };
}

const img = (i: RawImg, locale: Locale): Img => ({ ...i, alt: tr(i.alt, locale) ?? "" });

/** Everything the page renders, in one language. */
export async function getContent(locale: Locale): Promise<SiteContent> {
  const raw = await getRaw();
  const t = (v: L | undefined) => tr(v, locale);
  const d = (v: string | undefined) => formatDate(v, locale);
  const { profile: p, work: w, skills: s, gallery: g } = raw;

  return {
    locale,
    source: raw.source,
    profile: {
      name: p.name,
      shortName: p.shortName,
      role: t(p.role) ?? "",
      since: p.since,
      intro: t(p.intro),
      portrait: img(p.portrait, locale),
      childhood: p.childhood && img(p.childhood, locale),
      childhoodQuote: t(p.childhoodQuote),
      email: p.email,
      linkedin: p.linkedin,
      cvUrl: (locale === "es" && p.cvUrlEs) || p.cvUrl,
      contactTitle: t(p.contactTitle),
      contactBody: t(p.contactBody),
    },
    work: {
      roles: w.roles.map((r) => ({
        title: t(r.title) ?? "",
        org: t(r.org) ?? "",
        orgUrl: r.orgUrl,
        start: d(r.start) ?? "",
        end: d(r.end),
        current: r.current,
        paragraphs: r.paragraphs.map((x) => t(x) ?? "").filter(Boolean),
        clients: (r.clients ?? []).map((x) => t(x) ?? "").filter(Boolean),
      })),
      projects: w.projects.map((pr) => ({
        name: pr.name,
        url: pr.url,
        start: d(pr.start) ?? "",
        end: d(pr.end),
        current: pr.current,
        intro: t(pr.intro),
        bullets: pr.bullets.map((x) => t(x) ?? "").filter(Boolean),
        skills: pr.skills,
      })),
      certificates: w.certificates.map((c) => ({ name: t(c.name) ?? "", date: d(c.date), url: c.url, note: c.note })),
      education: w.education && {
        degree: t(w.education.degree),
        school: t(w.education.school),
        start: w.education.start,
        end: w.education.end,
        place: w.education.place,
      },
      languages: w.languages.map((l) => ({ name: t(l.name) ?? "", level: t(l.level) })),
    },
    skills: {
      rings: s.rings.map((r) => ({ value: r.value, label: t(r.label) })),
      categories: s.categories.map((c) => ({
        id: c.id,
        label: t(c.label) ?? "",
        color: c.color,
        skills: c.skills.map((k) => ({ key: k.key, label: t(k.label) ?? k.key, value: k.value, basis: k.basis })),
      })),
    },
    gallery: {
      title: t(g.title),
      intro: t(g.intro),
      photos: g.photos.map((ph) => ({ ...img(ph, locale), title: t(ph.title) ?? "" })),
    },
  };
}
