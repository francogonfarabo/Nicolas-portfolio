import { defineField, defineType } from "sanity";

/**
 * Translatable fields. Each stores `{ en, es }`. English is the source;
 * if Spanish is empty, the Spanish page shows the English text.
 */
function localeObject(name: string, title: string, fieldType: "string" | "text", rows?: number) {
  return defineType({
    name,
    title,
    type: "object",
    options: { columns: fieldType === "string" ? 2 : 1 },
    fields: [
      defineField({ name: "en", title: "English", type: fieldType, ...(fieldType === "text" ? { rows } : {}) }),
      defineField({
        name: "es",
        title: "Español",
        type: fieldType,
        description: fieldType === "text" ? "Leave empty to show the English text on the Spanish page." : undefined,
        ...(fieldType === "text" ? { rows } : {}),
      }),
    ],
    preview: { select: { title: "en", subtitle: "es" } },
  });
}

export const localeString = localeObject("localeString", "Translatable text", "string");
export const localeText = localeObject("localeText", "Translatable paragraph", "text", 3);

/** Use as `validation: (r) => r.custom(englishRequired)`. */
export const englishRequired = (v: { en?: string } | undefined) => (v?.en?.trim() ? true : "English is required");

/** "2023-10" or "2019". The site formats it per language (Oct 2023 / oct 2023). */
export const dateField = (name: string, extra: Record<string, unknown> = {}) =>
  defineField({
    name,
    type: "string",
    description: "YYYY-MM (e.g. 2023-10) or just YYYY",
    validation: (r) => r.regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/, { name: "YYYY-MM or YYYY" }),
    ...extra,
  });
