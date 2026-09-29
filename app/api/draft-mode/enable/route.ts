import { createClient } from "next-sanity";
import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { readToken } from "@/sanity/client";

/** Turns on draft preview. Called by the Studio's Presentation tool. */
export const GET = readToken
  ? defineEnableDraftMode({ client: createClient({ projectId, dataset, apiVersion, useCdn: false, token: readToken }) }).GET
  : () =>
      new Response(
        "Preview isn't set up yet: add SANITY_API_READ_TOKEN (a Viewer token) to the environment. See the README, section “Live preview”.",
        { status: 501 },
      );
