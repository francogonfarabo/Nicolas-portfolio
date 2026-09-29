import { defineArrayMember, defineField, defineType } from "sanity";
import { apiVersion } from "../env";
import { dateField, englishRequired } from "./locale";

const period = [
  dateField("start", { validation: (r: any) => r.required().regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/, { name: "YYYY-MM or YYYY" }) }),
  dateField("end", { hidden: ({ parent }: { parent?: { current?: boolean } }) => !!parent?.current }),
  defineField({ name: "current", title: "Ongoing", type: "boolean", initialValue: false }),
];

const range = (start?: string, end?: string, current?: boolean) => `${start ?? ""} → ${current ? "present" : end ?? ""}`;

export const work = defineType({
  name: "work",
  title: "Work history",
  type: "document",
  groups: [
    { name: "roles", title: "Roles", default: true },
    { name: "projects", title: "Projects" },
    { name: "credentials", title: "Certificates & education" },
  ],
  fields: [
    defineField({
      name: "roles",
      type: "array",
      group: "roles",
      of: [
        defineArrayMember({
          type: "object",
          name: "role",
          fields: [
            defineField({ name: "title", type: "localeString", validation: (r) => r.custom(englishRequired) }),
            defineField({ name: "org", title: "Organisation", type: "localeString", validation: (r) => r.custom(englishRequired) }),
            defineField({ name: "orgUrl", title: "Organisation URL", type: "url" }),
            ...period,
            defineField({ name: "paragraphs", type: "array", of: [{ type: "localeText" }] }),
            defineField({ name: "clients", type: "array", of: [{ type: "localeString" }] }),
          ],
          preview: {
            select: { title: "title.en", org: "org.en", start: "start", end: "end", current: "current" },
            prepare: ({ title, org, start, end, current }) => ({ title: `${title} · ${org}`, subtitle: range(start, end, current) }),
          },
        }),
      ],
    }),
    defineField({
      name: "projects",
      type: "array",
      group: "projects",
      description: "Drag to reorder. Hovering a project on the site lights up its skills in the chart.",
      of: [
        defineArrayMember({
          type: "object",
          name: "project",
          fields: [
            defineField({ name: "name", type: "string", validation: (r) => r.required() }),
            defineField({ name: "url", title: "Website", type: "url" }),
            ...period,
            defineField({ name: "intro", title: "One-line summary", type: "localeString" }),
            defineField({ name: "bullets", type: "array", of: [{ type: "localeText" }] }),
            defineField({
              name: "skills",
              type: "array",
              of: [{ type: "string" }],
              options: { layout: "tags" },
              description: "Skill keys from “Skills chart” (e.g. aws, terraform, github-actions).",
              validation: (r) =>
                r.custom(async (keys, ctx) => {
                  if (!keys?.length) return true;
                  const known: string[] = await ctx
                    .getClient({ apiVersion })
                    .fetch(`coalesce(*[_id == "skills"][0].categories[].skills[].key, [])`);
                  const missing = (keys as string[]).filter((k) => !known.includes(k));
                  return missing.length ? `Unknown skill key(s): ${missing.join(", ")}` : true;
                }),
            }),
          ],
          preview: {
            select: { title: "name", start: "start", end: "end", current: "current" },
            prepare: ({ title, start, end, current }) => ({ title, subtitle: range(start, end, current) }),
          },
        }),
      ],
    }),
    defineField({
      name: "certificates",
      type: "array",
      group: "credentials",
      of: [
        defineArrayMember({
          type: "object",
          name: "certificate",
          fields: [
            defineField({ name: "name", type: "localeString", validation: (r) => r.custom(englishRequired) }),
            dateField("date"),
            defineField({ name: "url", title: "Verification URL", type: "url" }),
            defineField({ name: "note", type: "string", description: "Shown when there's no URL, e.g. a certificate number." }),
          ],
          preview: { select: { title: "name.en", subtitle: "date" } },
        }),
      ],
    }),
    defineField({
      name: "education",
      type: "object",
      group: "credentials",
      fields: [
        defineField({ name: "degree", type: "localeString" }),
        defineField({ name: "school", type: "localeString" }),
        defineField({ name: "start", type: "string" }),
        defineField({ name: "end", type: "string" }),
        defineField({ name: "place", type: "string" }),
      ],
    }),
    defineField({
      name: "languages",
      type: "array",
      group: "credentials",
      of: [
        defineArrayMember({
          type: "object",
          name: "language",
          fields: [defineField({ name: "name", type: "localeString" }), defineField({ name: "level", type: "localeString" })],
          preview: { select: { title: "name.en", subtitle: "level.en" } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Work history" }) },
});
