export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "tqm0fcg9";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-09-01";

/** Set NEXT_PUBLIC_SANITY_PROJECT_ID="" to run purely on the local fallback in `content/`. */
export const isSanityConfigured = projectId.length > 0;
