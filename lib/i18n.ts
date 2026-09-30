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
    main: "Main",
    language: "Language",
  },
  newTab: "(opens in a new tab)",
  profile: {
    section: "Profile, skills and work history",
    since: (y: string) => `since ${y}`,
    projects: "projects",
    certifications: "certifications",
    skillsMapped: "skills mapped",
    languages: "languages",
  },
  chart: {
    title: "Skills map",
    families: "Skill families",
    list: "list",
    close: "close",
    description:
      "Distance from the centre shows depth of experience. Use the arrow keys to move between skills; each one reads its level. A plain list of every skill is available with the list button.",
    touch: "touch a node",
    hover: "hover a node",
    outOf: (v: number) => `${v} out of 100`,
    familyAvg: (label: string, n: number, v: number) => `${label}: ${n} skills, average ${v} out of 100`,
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
    contact: "Contact",
    fallbackTitle: "Get in touch",
    linkedin: "LinkedIn",
    cv: "CV",
    download: "download .pdf",
    email: "Email",
    write: "write",
    top: "↑ top",
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
    main: "Principal",
    language: "Idioma",
  },
  newTab: "(se abre en una pestaña nueva)",
  profile: {
    section: "Perfil, habilidades y experiencia",
    since: (y: string) => `desde ${y}`,
    projects: "proyectos",
    certifications: "certificaciones",
    skillsMapped: "habilidades",
    languages: "idiomas",
  },
  chart: {
    title: "Mapa de habilidades",
    families: "Familias de habilidades",
    list: "lista",
    close: "cerrar",
    description:
      "La distancia al centro indica la profundidad de experiencia. Usa las flechas para moverte entre habilidades; cada una anuncia su nivel. Con el botón lista hay un listado simple de todas.",
    touch: "toca un nodo",
    hover: "pasa el cursor sobre un nodo",
    outOf: (v: number) => `${v} de 100`,
    familyAvg: (label: string, n: number, v: number) => `${label}: ${n} habilidades, promedio ${v} de 100`,
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
    contact: "Contacto",
    fallbackTitle: "Escríbeme",
    linkedin: "LinkedIn",
    cv: "CV",
    download: "descargar .pdf",
    email: "Email",
    write: "escribir",
    top: "↑ arriba",
  },
  meta: {
    description: (intro?: string) => intro ?? "",
  },
};

export const dictionaries: Record<Locale, Dict> = { en, es };
