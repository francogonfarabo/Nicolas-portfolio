/**
 * Two layers:
 * - Raw*: what Sanity (and the local fallback) store. Translatable text is `{ en, es }`,
 *   dates are "YYYY" or "YYYY-MM".
 * - The plain types below: one language resolved, dates formatted. Components only see these.
 */

export type Locale = "en" | "es";
export const locales: Locale[] = ["en", "es"];

/** A translatable string. English is the source; missing Spanish falls back to English. */
export type L = { en: string; es?: string };

// ---------------------------------------------------------------- resolved

export type Img = {
  src: string;
  width: number;
  height: number;
  alt: string;
  blurDataURL?: string;
  /** Focal point, 0–1 (from the Sanity hotspot). */
  focus?: { x: number; y: number };
};

export type Profile = {
  name: string;
  shortName: string;
  role: string;
  since?: string;
  intro?: string;
  portrait: Img;
  childhood?: Img;
  childhoodQuote?: string;
  email: string;
  linkedin?: string;
  cvUrl?: string;
  contactTitle?: string;
  contactBody?: string;
};

export type Role = {
  title: string;
  org: string;
  orgUrl?: string;
  start: string;
  end?: string;
  current: boolean;
  paragraphs: string[];
  clients?: string[];
};

export type Project = {
  name: string;
  url?: string;
  start: string;
  end?: string;
  current: boolean;
  intro?: string;
  bullets: string[];
  /** Skill keys. */
  skills: string[];
};

export type Certificate = { name: string; date?: string; url?: string; note?: string };

export type Work = {
  roles: Role[];
  projects: Project[];
  certificates: Certificate[];
  education?: { degree?: string; school?: string; start?: string; end?: string; place?: string };
  languages: { name: string; level?: string }[];
};

export type Skill = { key: string; label: string; value: number; basis?: string };
export type SkillCategory = { id: string; label: string; color: string; skills: Skill[] };
export type Skills = { categories: SkillCategory[] };

export type Photo = Img & { title: string };
export type Gallery = { title?: string; intro?: string; photos: Photo[] };

export type SiteContent = {
  locale: Locale;
  profile: Profile;
  work: Work;
  skills: Skills;
  gallery: Gallery;
  source: "sanity" | "local";
};

// ---------------------------------------------------------------- raw (stored)

export type RawImg = Omit<Img, "alt"> & { alt: L };

export type RawProfile = {
  name: string;
  shortName: string;
  role: L;
  since?: string;
  intro?: L;
  portrait: RawImg;
  childhood?: RawImg;
  childhoodQuote?: L;
  email: string;
  linkedin?: string;
  /** English CV; `cvUrlEs` is optional and used on the Spanish page when present. */
  cvUrl?: string;
  cvUrlEs?: string;
  contactTitle?: L;
  contactBody?: L;
};

export type RawRole = {
  title: L;
  org: L;
  orgUrl?: string;
  start: string;
  end?: string;
  current: boolean;
  paragraphs: L[];
  clients?: L[];
};

export type RawProject = {
  name: string;
  url?: string;
  start: string;
  end?: string;
  current: boolean;
  intro?: L;
  bullets: L[];
  skills: string[];
};

export type RawWork = {
  roles: RawRole[];
  projects: RawProject[];
  certificates: { name: L; date?: string; url?: string; note?: string }[];
  education?: { degree?: L; school?: L; start?: string; end?: string; place?: string };
  languages: { name: L; level?: L }[];
};

export type RawSkills = {
  categories: { id: string; label: L; color: string; skills: { key: string; label: L; value: number; basis?: string }[] }[];
};

export type RawGallery = { title?: L; intro?: L; photos: (RawImg & { title: L })[] };
