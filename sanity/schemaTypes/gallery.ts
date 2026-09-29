import { defineArrayMember, defineField, defineType } from "sanity";

export const gallery = defineType({
  name: "gallery",
  title: "Photography",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({ name: "intro", type: "text", rows: 2 }),
    defineField({
      name: "photos",
      type: "array",
      description: "Drag to reorder. Images keep their own aspect ratio on the page.",
      options: { layout: "grid" },
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "title", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
              description: "Describe the photo for screen readers.",
              validation: (r) => r.required(),
            }),
          ],
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Photography" }) },
});
