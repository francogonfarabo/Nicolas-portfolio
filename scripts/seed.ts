/**
 * Pushes the local content in `content/` into Sanity (profile, work, skills, photography),
 * uploading every image and the CV PDF. Uses your logged-in Sanity CLI, so no token needed.
 *
 *   npm run seed
 *
 * After the first seed, edit in the Studio (/studio). Re-seeding overwrites Studio edits.
 */
import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { profile, work } from "../content/cv";
import { skills } from "../content/skills";
import { gallery } from "../content/gallery";
import type { L, RawImg } from "../content/types";

let n = 0;
const key = () => `k${(++n).toString(36).padStart(4, "0")}`;

const image = (img: RawImg | undefined, extra: Record<string, unknown> = {}) =>
  img && {
    _type: "image",
    _sanityAsset: `image@${img.src}`,
    ...(img.focus ? { hotspot: { _type: "sanity.imageHotspot", x: img.focus.x, y: img.focus.y, width: 0.6, height: 0.6 } } : {}),
    alt: img.alt,
    ...extra,
  };

/** Translatable values in arrays need a type and key in Sanity. */
const locItems = (items: L[] | undefined, type: "localeString" | "localeText") =>
  items?.map((x) => ({ _type: type, _key: key(), ...x }));

const cvPath = pathToFileURL(resolve("public", profile.cvUrl?.replace(/^\//, "") ?? "")).href;

const docs = [
  {
    _id: "profile",
    _type: "profile",
    name: profile.name,
    shortName: profile.shortName,
    role: profile.role,
    since: profile.since,
    intro: profile.intro,
    portrait: image(profile.portrait),
    childhoodPhoto: image(profile.childhood),
    childhoodQuote: profile.childhoodQuote,
    email: profile.email,
    linkedin: profile.linkedin,
    cvFile: profile.cvUrl ? { _type: "file", _sanityAsset: `file@${cvPath}` } : undefined,
    contactTitle: profile.contactTitle,
    contactBody: profile.contactBody,
  },
  {
    _id: "work",
    _type: "work",
    roles: work.roles.map((r) => ({
      _type: "role",
      _key: key(),
      ...r,
      paragraphs: locItems(r.paragraphs, "localeText"),
      clients: locItems(r.clients, "localeString"),
    })),
    projects: work.projects.map((p) => ({ _type: "project", _key: key(), ...p, bullets: locItems(p.bullets, "localeText") })),
    certificates: work.certificates.map((c) => ({ _type: "certificate", _key: key(), ...c })),
    education: work.education,
    languages: work.languages.map((l) => ({ _type: "language", _key: key(), ...l })),
  },
  {
    _id: "skills",
    _type: "skills",
    rings: skills.rings.map((r) => ({ _type: "ring", _key: key(), ...r })),
    categories: skills.categories.map((c) => ({
      _type: "category",
      _key: key(),
      label: c.label,
      color: c.color,
      skills: c.skills.map((s) => ({ _type: "skill", _key: key(), ...s })),
    })),
  },
  {
    _id: "gallery",
    _type: "gallery",
    title: gallery.title,
    intro: gallery.intro,
    photos: gallery.photos.map((p) => ({ ...image(p, { title: p.title }), _key: key() })),
  },
];

const dir = mkdtempSync(join(tmpdir(), "nico-seed-"));
const file = join(dir, "seed.ndjson");
writeFileSync(file, docs.map((d) => JSON.stringify(d, (_k, v) => (v === null ? undefined : v))).join("\n"));
console.log(`Wrote ${docs.length} documents → ${file}`);

execSync(`npx sanity dataset import "${file}" --dataset production --replace`, { stdio: "inherit" });
