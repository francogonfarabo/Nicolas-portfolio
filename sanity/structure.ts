import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) => {
  const singleton = (type: string, title: string) =>
    S.listItem().title(title).id(type).child(S.document().schemaType(type).documentId(type).title(title));

  return S.list()
    .title("Nico's CV")
    .items([
      singleton("profile", "Profile"),
      singleton("work", "Work history"),
      singleton("skills", "Skills chart"),
      singleton("gallery", "Photography"),
    ]);
};
