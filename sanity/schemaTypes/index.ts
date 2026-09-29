import { gallery } from "./gallery";
import { profile } from "./profile";
import { skills } from "./skills";
import { work } from "./work";

export const schemaTypes = [profile, work, skills, gallery];

/** One document each; the id equals the type name. */
export const singletonTypes = ["profile", "work", "skills", "gallery"] as const;
