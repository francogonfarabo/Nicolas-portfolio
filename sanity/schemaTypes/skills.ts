import { defineArrayMember, defineField, defineType } from "sanity";

const HEX = /^#[0-9a-fA-F]{6}$/;

export const skills = defineType({
  name: "skills",
  title: "Skills chart",
  type: "document",
  fields: [
    defineField({
      name: "categories",
      title: "Skill families",
      type: "array",
      description:
        "Each family is a hollow node; its skills fan out from it. Order here = order around the arc, left to right.",
      of: [
        defineArrayMember({
          type: "object",
          name: "category",
          fields: [
            defineField({ name: "label", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "color",
              type: "string",
              description:
                "Hex, e.g. #2563EB. The default seven were checked for colour-blind separation on white; test new ones before swapping.",
              validation: (r) => r.required().regex(HEX, { name: "hex colour" }),
            }),
            defineField({
              name: "skills",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "skill",
                  fields: [
                    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
                    defineField({
                      name: "key",
                      type: "string",
                      description: "Stable id used by projects to link to this skill (lowercase, dashes).",
                      validation: (r) => r.required().regex(/^[a-z0-9-]+$/, { name: "lowercase-dashes" }),
                    }),
                    defineField({
                      name: "value",
                      type: "number",
                      description: "0–100. Distance from the centre of the chart.",
                      validation: (r) => r.required().min(0).max(100).integer(),
                    }),
                    defineField({
                      name: "basis",
                      title: "Why this value",
                      type: "string",
                      description: "Internal note; never shown on the site.",
                    }),
                  ],
                  preview: {
                    select: { title: "label", value: "value", key: "key" },
                    prepare: ({ title, value, key }) => ({ title, subtitle: `${value} · ${key}` }),
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: "label", skills: "skills", color: "color" },
            prepare: ({ title, skills, color }) => ({
              title,
              subtitle: `${color} · ${(skills ?? []).length} skills`,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: "rings",
      type: "array",
      description: "Concentric guide rings, centre outwards.",
      of: [
        defineArrayMember({
          type: "object",
          name: "ring",
          fields: [
            defineField({ name: "value", type: "number", validation: (r) => r.required().min(1).max(100) }),
            defineField({ name: "label", type: "string" }),
          ],
          preview: { select: { title: "label", subtitle: "value" } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Skills chart" }) },
});
