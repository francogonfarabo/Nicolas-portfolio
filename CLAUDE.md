# Nico CV: working notes for Claude Code

One-page bilingual CV site for **Nicolás ("Nico") González Farabollini**, Cloud & DevOps Engineer.
Designed and directed by **Franco Gonzalez Farabollini** (the user, a designer). Read this before changing anything.

## Where things live
- **Repo:** https://github.com/francogonfarabo/Nicolas-portfolio, branch `main`. Every change gets committed and pushed here.
- **Live site:** https://nicolas-portfolio-pied.vercel.app (English `/`, Spanish `/es`). The bare `nicolas-portfolio.vercel.app` belongs to someone else.
- **Vercel:** project `nicolas-portfolio`, team `francogonzalezz-gmailcoms-projects` (Hobby). A push to `main` deploys to production automatically (~30 s).
- **Sanity:** project `tqm0fcg9`, dataset `production` (public). Studio at `/studio`. Four singleton documents: `profile`, `work`, `skills`, `gallery`.
- **Nico's GitHub:** `M3THA`, a collaborator with write access. Admin isn't possible on a personal repo.

## Rules that matter
- **Commit identity:** always commit with
  `git -c user.name="Franco Gonzalez" -c user.email="201109785+francogonfarabo@users.noreply.github.com" commit ...`
  Vercel Hobby blocks deploys whose commit author isn't the account owner.
- **Content lives in Sanity, not code.** `content/*.ts` is only a fallback and the seed source. When content changes (labels, order, translations), patch the Sanity document *and* mirror it in `content/*.ts`.
- **Never run `npm run seed` casually.** It overwrites all four documents. First check for Studio edits and drafts:
  `npx sanity documents query '*[_id in path("drafts.**") || _type in ["profile","skills","work","gallery"]]{_id,_updatedAt}'`
  To change one thing, prefer a small script run with `npx sanity exec <file>.ts --with-user-token` that uses `getCliClient` and patches with `ifRevisionId`. Delete the script afterwards.
- **Don't create or handle tokens or credentials.** The user adds them. The Studio live preview (Presentation tool) needs `SANITY_API_READ_TOKEN` (a Viewer token) in Vercel env and in `.env.local`. It isn't set yet, so `/api/draft-mode/enable` returns 501 with instructions.
- **Verify before reporting:** `npx tsc --noEmit`, `npx next build`, then check `next start -p 3218` with Playwright (Edge, `channel="msedge"`, headless), desktop 1440×900 plus mobile 390×844, in both `/` and `/es`. After pushing, wait for the Vercel deployment and check the live site.
- If a local build shows stale Sanity data, delete `.next/cache/fetch-cache` and rebuild.

## Design direction (from the user)
- White, technical aesthetic: Geist + Geist Mono, hairline borders, one orange accent. Playfulness **only** through easter eggs. **No rotated or tilted elements**, nothing cheesy.
- Single centred column (`max-w-3xl`): name → the line "role · since 2019" → **skills chart pinned under the header** with section chips beneath it → work history scrolling under the chart → photo gallery → a one-line footer credit.
- **Header:** Email and LinkedIn on the left; the EN/ES switch and CV.pdf on the right. No logo.
- **Skills chart (`components/skills/RadialChart.tsx`, `geometry.ts`):** a radial tree with Nico's portrait as the root.
  - It shows *what* Nico has worked with, not *how much*: **no numbers, no scale, no level words, and no geometry that reads as a score**. Every skill sits on one circle (R_leaf) and every family hub on another (R_hub = `HUB_RATIO` × R_leaf), skills are evenly spaced by angle with one equal gap between families (`CATEGORY_GAP`), and each hub sits at the mean angle of its skills. All of it is derived from the data in `components/skills/geometry.ts` (constants at the top); no per-skill offsets. The Sanity "depth" values are no longer used for layout.
  - Dragging a node is just for fun, and nodes spring back on release.
  - Hovering a dot, its connector or its label highlights that branch.
  - Linked to projects: hovering a project lights up its skills, and hovering a skill highlights the projects that used it. Screen readers get "used in N projects".
  - The chart box hugs the chart; `--chart-area` is only a maximum height. From `sm` up it follows the screen height (`clamp(260px, 56svh - 140px, 500px)`), so on laptops the header plus pinned block stay around 56% of the screen and the rest is left for reading.
  - When the cap is under `MIN_LAYOUT` (380px, in `RadialChart.tsx`), the chart is laid out at 380px and scaled down whole (CSS transform), so labels shrink a little instead of disappearing. Mobile keeps its compact, label-less chart.
  - Family order is tuned for a full, balanced fan: Cloud, Infra as Code, Containers, Quality, CI/CD (Jenkins → GitHub Actions), Soft skills, Scripting (Python → Git), with short labels at both ends.
  - Long labels on the diagonals shrink the chart. Keep Spanish labels about as long as the English ones; for example, "Diagnóstico deductivo" and "Transversales" were chosen for this.
  - There is no list view or list toggle; the user removed it.
- **Portrait easter egg:** hover or tap to reveal the childhood photo plus a quote, centred with no box. No coding metaphors (the user rejected git/commit wording) and no hint text. The portrait grows upward.
- **Section chips** (`components/board/SectionChips.tsx`): Experience, Projects, Certifications, Education, Languages. They're pinned under the chart and mark the current section.
- **Gallery:** justified rows, images only (no captions), a dark lightbox, and a "More on Instagram @gonzalezfarabollini ↗" link (from `profile.instagram` in Sanity).
- **Footer:** only "Designed by Franco Gonzalez Farabollini ↗" linking to https://www.linkedin.com/in/franco-gonzalez-farabollini-568455148/ (hardcoded in `components/Footer.tsx`).
- **Ideas the user tried and rejected (don't reintroduce unless asked):** the chart shrinking while you scroll; the 25/50/75/100 scale and level words (exploring…expert); "fig.01" titles; the hint text under the portrait; a contact section in the footer; the stats line under the role (projects, certifications, skills mapped); the "further out · more hands-on" key on the chart.

## Code map
- `app/(en)/page.tsx`, `app/(es)/es/page.tsx`: separate root layouts per language (`<html lang>`). Both render `components/SitePage.tsx`.
- `lib/content.ts`: GROQ query plus a fallback to `content/`; `getContent(locale)` resolves `{en, es}` fields (Spanish falls back to English). Draft mode fetches drafts with stega.
- `lib/i18n.ts`: UI strings for both languages (neutral Spanish, no voseo).
- `components/board/`: ProfileBoard (layout, sticky block, scrollspy), ChartPanel, Portrait, WorkPanel, SectionChips.
- `sanity/`: schemas (`localeString`/`localeText` `{en, es}`), structure, Presentation tool config. `sanity.config.ts` is at the repo root.
- `scripts/seed.ts`: imports `content/` into Sanity (destructive; see Rules).

## Open items
- The Spanish translation was drafted by Claude and is pending Nico's review.
- The Studio live preview is waiting for `SANITY_API_READ_TOKEN` (Viewer).
- The Sanity skill "depth" values (and their schema help text) are now unused by the chart; remove them or repurpose them if wanted.
- Git, Python and Bash aren't linked to any project, so their "used in N projects" note is empty.

## Setting up a new machine
`git clone`, then `npm install` and `npm run dev` (no env file needed; the project ID defaults in `sanity/env.ts`).
To edit Sanity from the CLI: `npx sanity login`. For deploy status: `npx vercel login`. For GitHub: `gh auth login`.
Add `http://localhost:3000` (or your dev port) as a Sanity CORS origin if the embedded Studio complains: `npx sanity cors add http://localhost:3000 --credentials`.
