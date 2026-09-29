import { defineArrayMember, defineField, defineType } from "sanity";
import { englishRequired } from "./locale";

export const gallery = defineType({
  name: "gallery",
  title: "Photography",
  type: "document",
  fields: [
    defineField({ name: "title", type: "localeString" }),
    defineField({ name: "intro", type: "localeText" }),
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
            defineField({ name: "title", type: "localeString", validation: (r) => r.custom(englishRequired) }),
            defineField({
              name: "alt",
              title: "Alt text",
              type: "localeString",
              description: "Describe the photo for screen readers.",
              validation: (r) => r.custom(englishRequired),
            }),
          ],
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Photography" }) },
});
