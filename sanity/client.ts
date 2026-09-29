import { createClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "./env";

export const client = isSanityConfigured
  ? createClient({ projectId, dataset, apiVersion, useCdn: true, perspective: "published" })
  : null;

/** Read-only token for previewing drafts in the Studio. Server-only: never exposed to the browser. */
export const readToken = process.env.SANITY_API_READ_TOKEN ?? "";
