import { defineDocuments, defineLocations, type PresentationPluginOptions } from "sanity/presentation";

const both = [
  { title: "English", href: "/" },
  { title: "Español", href: "/es" },
];

/** Every document shows up on both language versions of the one-pager. */
export const resolve: PresentationPluginOptions["resolve"] = {
  mainDocuments: defineDocuments([
    { route: "/", filter: `_id == "profile"` },
    { route: "/es", filter: `_id == "profile"` },
  ]),
  locations: Object.fromEntries(
    ["profile", "work", "skills", "gallery"].map((type) => [
      type,
      defineLocations({ locations: both, message: "Shown on:" }),
    ]),
  ),
};
