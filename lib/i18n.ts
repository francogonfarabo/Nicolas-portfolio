import type { L, Locale } from "@/content/types";

/** Pick a language from a translatable value; Spanish falls back to English. */
export const tr = (v: L | undefined, locale: Locale): string | undefined => (v ? (locale === "es" && v.es) || v.en : undefined);

/** "2023-10" → "Oct 2023" / "oct 2023"; "2019" stays "2019". */
export function formatDate(value: string | undefined, locale: Locale): string | undefined {
  if (!value) return undefined;
  const m = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (!m) return value;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, 1));
  return new Intl.DateTimeFormat(locale === "es" ? "es-AR" : "en-US", { month: "short", year: "numeric", timeZone: "UTC" })
    .format(d)
    .replace(".", "")
    .replace(" de ", " ");
}

export const paths: Record<Locale, string> = { en: "/", es: "/es" };

const en = {
  skipToWork: "Skip to work history",
  nav: {
    work: "Work",
    photos: "Photos",
    email: "Email",
    linkedin: "LinkedIn",
    contact: "Contact",
    language: "Language",
  },
  newTab: "(opens in a new tab)",
  profile: {
    section: "Profile, skills and work history",
    since: (y: string) => `since ${y}`,
  },
  chart: {
    title: "Skills",
    families: "Skill families",
    description:
      "Skills grouped by family. Use the arrow keys to move between skills; each one says how many projects used it.",
    touch: "touch a node",
    family: (label: string, n: number) => `${label}: ${n} skills`,
    skill: (label: string, n: number) => (n ? `${label}, used in ${n} project${n === 1 ? "" : "s"}` : label),
  },
  portrait: {
    show: (name: string) => `Show ${name} as a kid`,
    hide: "Hide the childhood photo",
  },
  work: {
    sections: "Work history sections",
    experience: "Experience",
    present: "present",
    clients: "clients",
    projects: "Projects",
    usedIn: (skill: string, n: number) => `${skill} → ${n} project${n === 1 ? "" : "s"}`,
    rowHint: "select a row to see its stack",
    certifications: "Certifications",
    verify: "verify",
    education: "Education",
    languages: "Languages",
    ongoing: "ongoing",
    showInMap: ": show in skills map",
    website: "website",
    at: "@",
  },
  gallery: {
    title: "Photography",
    instagram: "More on Instagram",
    open: (i: string, alt: string) => `Open photo ${i}${alt ? `: ${alt}` : ""}`,
    dialog: (i: number, n: number) => `Photo ${i} of ${n}`,
    close: "close [esc]",
    prev: "← prev",
    next: "next →",
    prevLabel: "Previous photo",
    nextLabel: "Next photo",
  },
  footer: {
    designedBy: "Designed by",
  },
  meta: {
    description: (intro?: string) => intro ?? "",
  },
};

export type Dict = typeof en;

const es: Dict = {
  skipToWork: "Ir a la experiencia",
  nav: {
    work: "Experiencia",
    photos: "Fotos",
    email: "Email",
    linkedin: "LinkedIn",
    contact: "Contacto",
    language: "Idioma",
  },
  newTab: "(se abre en una pestaña nueva)",
  profile: {
    section: "Perfil, habilidades y experiencia",
    since: (y: string) => `desde ${y}`,
  },
  chart: {
    title: "Habilidades",
    families: "Familias de habilidades",
    description:
      "Habilidades agrupadas por familia. Usa las flechas para moverte entre habilidades; cada una indica en cuántos proyectos se usó.",
    touch: "toca un nodo",
    family: (label: string, n: number) => `${label}: ${n} habilidades`,
    skill: (label: string, n: number) => (n ? `${label}, usada en ${n} proyecto${n === 1 ? "" : "s"}` : label),
  },
  portrait: {
    show: (name: string) => `Ver a ${name} de chico`,
    hide: "Ocultar la foto de infancia",
  },
  work: {
    sections: "Secciones de la experiencia",
    experience: "Experiencia",
    present: "hoy",
    clients: "clientes",
    projects: "Proyectos",
    usedIn: (skill: string, n: number) => `${skill} → ${n} proyecto${n === 1 ? "" : "s"}`,
    rowHint: "elige un proyecto para ver su stack",
    certifications: "Certificaciones",
    verify: "verificar",
    education: "Formación",
    languages: "Idiomas",
    ongoing: "en curso",
    showInMap: ": ver en el mapa de habilidades",
    website: "sitio web",
    at: "@",
  },
  gallery: {
    title: "Fotografía",
    instagram: "Más en Instagram",
    open: (i: string, alt: string) => `Abrir foto ${i}${alt ? `: ${alt}` : ""}`,
    dialog: (i: number, n: number) => `Foto ${i} de ${n}`,
    close: "cerrar [esc]",
    prev: "← anterior",
    next: "siguiente →",
    prevLabel: "Foto anterior",
    nextLabel: "Foto siguiente",
  },
  footer: {
    designedBy: "Diseñado por",
  },
  meta: {
    description: (intro?: string) => intro ?? "",
  },
};

export const dictionaries: Record<Locale, Dict> = { en, es };
