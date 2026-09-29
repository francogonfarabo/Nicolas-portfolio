import { defineQuery } from "next-sanity";
import { client } from "@/sanity/client";
import { profile as localProfile, work as localWork } from "@/content/cv";
import { skills as localSkills } from "@/content/skills";
import { gallery as localGallery } from "@/content/gallery";
import type { Gallery, Img, Profile, SiteContent, Skill, Skills, Work } from "@/content/types";

const image = `{ alt, title, hotspot, "asset": asset->{ url, metadata { lqip, dimensions { width, height } } } }`;

const QUERY = defineQuery(`{
  "profile": *[_id == "profile"][0]{
    name, shortName, role, since, intro, childhoodQuote, email, linkedin, contactTitle, contactBody,
    "portrait": portrait${image},
    "childhood": childhoodPhoto${image},
    "cvUrl": cvFile.asset->url
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
  alt?: string;
  title?: string;
  hotspot?: { x: number; y: number };
  asset?: { url: string; metadata?: { lqip?: string; dimensions?: { width: number; height: number } } };
} | null;

const toImg = (i: SanityImage): Img | undefined =>
  i?.asset?.url && i.asset.metadata?.dimensions
    ? {
        src: i.asset.url,
        width: i.asset.metadata.dimensions.width,
        height: i.asset.metadata.dimensions.height,
        blurDataURL: i.asset.metadata.lqip,
        alt: i.alt ?? "",
        focus: i.hotspot ? { x: i.hotspot.x, y: i.hotspot.y } : undefined,
      }
    : undefined;

const clean = <T,>(arr: (T | null | undefined)[] | null | undefined): T[] => (arr ?? []).filter(Boolean) as T[];
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/**
 * Everything the page renders. Reads Sanity (revalidated every minute); any section
 * that's missing or unreachable falls back to the local files in `content/`.
 */
export async function getContent(): Promise<SiteContent> {
  const local: SiteContent = { profile: localProfile, work: localWork, skills: localSkills, gallery: localGallery, source: "local" };
  if (!client) return local;

  let data: any;
  try {
    // Dev: always fresh, so Studio edits show on refresh. Prod: refreshed at most every 60s.
    const revalidate = process.env.NODE_ENV === "development" ? 0 : 60;
    data = await client.fetch(QUERY, {}, { next: { revalidate, tags: ["sanity"] } });
  } catch (err) {
    console.warn("[content] Sanity fetch failed, using local content:", (err as Error).message);
    return local;
  }

  const p = data?.profile;
  const profile: Profile = p?.name
    ? {
        ...localProfile,
        ...Object.fromEntries(Object.entries(p).filter(([, v]) => v != null && v !== "")),
        portrait: toImg(p.portrait) ?? localProfile.portrait,
        childhood: toImg(p.childhood) ?? localProfile.childhood,
        cvUrl: p.cvUrl ?? localProfile.cvUrl,
      }
    : localProfile;

  const w = data?.work;
  const work: Work = w
    ? {
        roles: clean(w.roles).map((r: any) => ({ ...r, current: !!r.current, paragraphs: clean(r.paragraphs), clients: clean(r.clients) })),
        projects: clean(w.projects).map((pr: any) => ({ ...pr, current: !!pr.current, bullets: clean(pr.bullets), skills: clean(pr.skills) })),
        certificates: clean(w.certificates),
        education: w.education ?? undefined,
        languages: clean(w.languages),
      }
    : localWork;

  const s = data?.skills;
  const skills: Skills = s?.categories?.length
    ? {
        rings: clean(s.rings).length ? clean(s.rings) : localSkills.rings,
        categories: clean(s.categories).map((c: any) => ({
          id: slug(c.label ?? c._key),
          label: c.label,
          color: c.color,
          skills: clean<Skill>(c.skills).filter((k) => k.key && k.label),
        })),
      }
    : localSkills;

  const g = data?.gallery;
  const photos = clean<SanityImage>(g?.photos)
    .map((ph: SanityImage) => {
      const img = toImg(ph);
      return img ? { ...img, title: ph?.title ?? "" } : null;
    })
    .filter(Boolean) as Gallery["photos"];
  const gallery: Gallery = photos.length ? { title: g.title, intro: g.intro, photos } : localGallery;

  return { profile, work, skills, gallery, source: "sanity" };
}
