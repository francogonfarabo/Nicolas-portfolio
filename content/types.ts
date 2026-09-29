/** Shapes shared by the Sanity fetch and the local fallback. Components only see these. */

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
export type Skills = { categories: SkillCategory[]; rings: { value: number; label?: string }[] };

export type Photo = Img & { title: string };
export type Gallery = { title?: string; intro?: string; photos: Photo[] };

export type SiteContent = { profile: Profile; work: Work; skills: Skills; gallery: Gallery; source: "sanity" | "local" };
