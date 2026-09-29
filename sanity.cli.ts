/** Sanity CLI config (`npx sanity cors …`, `npx sanity dataset import …`). */
import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "tqm0fcg9",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  },
});
