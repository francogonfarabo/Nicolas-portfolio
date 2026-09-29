import { gallery } from "./gallery";
import { localeString, localeText } from "./locale";
import { profile } from "./profile";
import { skills } from "./skills";
import { work } from "./work";

export const schemaTypes = [localeString, localeText, profile, work, skills, gallery];

/** One document each; the id equals the type name. */
export const singletonTypes = ["profile", "work", "skills", "gallery"] as const;
