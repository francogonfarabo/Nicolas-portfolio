import { defineField, defineType } from "sanity";
import { englishRequired } from "./locale";

const altField = defineField({
  name: "alt",
  title: "Alt text",
  type: "localeString",
  description: "Describe the image for screen readers.",
  validation: (r) => r.custom(englishRequired),
});

export const profile = defineType({
  name: "profile",
  title: "Profile",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "easterEgg", title: "Portrait easter egg" },
    { name: "contact", title: "Contact" },
  ],
  fields: [
    defineField({ name: "name", type: "string", group: "identity", validation: (r) => r.required() }),
    defineField({ name: "shortName", title: "Short name", type: "string", group: "identity", initialValue: "Nico" }),
    defineField({ name: "role", type: "localeString", group: "identity", validation: (r) => r.custom(englishRequired) }),
    defineField({ name: "since", title: "Working since (year)", type: "string", group: "identity" }),
    defineField({ name: "intro", title: "Intro line", type: "localeText", group: "identity" }),
    defineField({
      name: "portrait",
      type: "image",
      group: "identity",
      options: { hotspot: true },
      description: "Set the hotspot on the face; it becomes the centre of the round crop.",
      fields: [altField],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "childhoodPhoto",
      title: "Childhood photo",
      type: "image",
      group: "easterEgg",
      options: { hotspot: true },
      description: "Revealed when someone hovers or taps the portrait. Hotspot = where the zoom centres.",
      fields: [altField],
    }),
    defineField({
      name: "childhoodQuote",
      title: "Quote",
      type: "localeText",
      group: "easterEgg",
      description: "Shown centred above the portrait while the childhood photo is visible.",
    }),
    defineField({ name: "email", type: "string", group: "contact", validation: (r) => r.required().email() }),
    defineField({ name: "linkedin", title: "LinkedIn URL", type: "url", group: "contact" }),
    defineField({
      name: "instagram",
      title: "Instagram URL",
      description: "Linked from the Photography section.",
      type: "url",
      group: "contact",
    }),
    defineField({
      name: "cvFile",
      title: "CV (PDF, English)",
      type: "file",
      group: "contact",
      options: { accept: "application/pdf" },
    }),
    defineField({
      name: "cvFileEs",
      title: "CV (PDF, Español)",
      type: "file",
      group: "contact",
      options: { accept: "application/pdf" },
      description: "Optional. Without it, the Spanish page offers the English PDF.",
    }),
    defineField({ name: "contactTitle", title: "Contact heading", type: "localeString", group: "contact" }),
    defineField({ name: "contactBody", title: "Contact text", type: "localeText", group: "contact" }),
  ],
  preview: { select: { title: "name", subtitle: "role.en", media: "portrait" } },
});
