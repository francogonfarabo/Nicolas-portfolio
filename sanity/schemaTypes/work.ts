import { defineArrayMember, defineField, defineType } from "sanity";
import { apiVersion } from "../env";

const period = [
  defineField({ name: "start", type: "string", description: "e.g. “Oct 2023” or “2019”", validation: (r) => r.required() }),
  defineField({ name: "end", type: "string", description: "Leave empty if ongoing", hidden: ({ parent }) => !!parent?.current }),
  defineField({ name: "current", title: "Ongoing", type: "boolean", initialValue: false }),
];

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
            defineField({ name: "title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "org", title: "Organisation", type: "string", validation: (r) => r.required() }),
            defineField({ name: "orgUrl", title: "Organisation URL", type: "url" }),
            ...period,
            defineField({ name: "paragraphs", type: "array", of: [{ type: "text", rows: 3 }] }),
            defineField({ name: "clients", type: "array", of: [{ type: "string" }], options: { layout: "tags" } }),
          ],
          preview: {
            select: { title: "title", org: "org", start: "start", end: "end", current: "current" },
            prepare: ({ title, org, start, end, current }) => ({
              title: `${title} · ${org}`,
              subtitle: `${start} → ${current ? "present" : end ?? ""}`,
            }),
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
            defineField({ name: "intro", title: "One-line summary", type: "string", validation: (r) => r.max(140) }),
            defineField({ name: "bullets", type: "array", of: [{ type: "text", rows: 2 }] }),
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
            prepare: ({ title, start, end, current }) => ({ title, subtitle: `${start} → ${current ? "present" : end ?? ""}` }),
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
            defineField({ name: "name", type: "string", validation: (r) => r.required() }),
            defineField({ name: "date", type: "string" }),
            defineField({ name: "url", title: "Verification URL", type: "url" }),
            defineField({ name: "note", type: "string", description: "Shown when there's no URL, e.g. a certificate number." }),
          ],
          preview: { select: { title: "name", subtitle: "date" } },
        }),
      ],
    }),
    defineField({
      name: "education",
      type: "object",
      group: "credentials",
      fields: [
        defineField({ name: "degree", type: "string" }),
        defineField({ name: "school", type: "string" }),
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
          fields: [defineField({ name: "name", type: "string" }), defineField({ name: "level", type: "string" })],
          preview: { select: { title: "name", subtitle: "level" } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Work history" }) },
});
