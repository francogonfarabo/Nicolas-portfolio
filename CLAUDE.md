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
- White, technical aesthetic: Geist + Geist Mono, hairline borders, one orange accent. Playfulness **only** through easter eggs. **No rotated or tilted elements**, nothing cheesy. The skills strip, its skill chips, the project skill tags and the section chips use a softer, more modern language the user asked for: rounded pills in Geist sans (not mono), a colour dot, soft tints (`color-mix` with white) instead of hard borders, and rounded-2xl cards.
- Single centred column (`max-w-3xl`): name → the line "role · since 2019" → the **radial skills chart** (scrolls away normally) → its legend, the **skills strip**, which stays pinned under the header with the section chips → work history scrolling under the strip → photo gallery → a one-line footer credit.
- **Header:** Email and LinkedIn on the left; the EN/ES switch and CV.pdf on the right. No logo.
- **Skills chart (`components/skills/RadialChart.tsx`, `geometry.ts`):** a radial tree with Nico's portrait as the root.
  - It shows *what* Nico has worked with, not *how much*: **no numbers, no scale, no level words, and no geometry that reads as a score**. Every skill sits on one circle (R_leaf) and every family hub on another (R_hub = `HUB_RATIO` × R_leaf), skills are evenly spaced by angle with one equal gap between families (`CATEGORY_GAP`), and each hub sits at the mean angle of its skills. All of it is derived from the data in `components/skills/geometry.ts` (constants at the top); no per-skill offsets. The Sanity "depth" values are no longer used for layout.
  - Dragging a node is just for fun, and nodes spring back on release. **Touch:** any touch on the half-disc (out to a little past the outer ring, down to the baseline) grabs the nearest node and doesn't scroll the page — a native non-passive `touchstart` calling `preventDefault` (iOS ignores `touch-action` on SVG). Touches outside it (title, empty corners, the portrait) scroll normally; two fingers still zoom; nothing is captured while the childhood photo is showing. The phone hint reads "drag a node".
  - Hovering a dot, its connector or its label highlights that branch.
  - Linked to projects: hovering a project lights up its skills, and hovering a skill highlights the projects that used it. Screen readers get "used in N projects".
  - The chart box hugs the chart; `--chart-area` is only a maximum height. From `sm` up it follows the screen height (`clamp(260px, 56svh - 140px, 500px)`), so on laptops the header plus pinned block stay around 56% of the screen and the rest is left for reading.
  - **Radial + strip (every width, since the user's phone recordings):** the radial chart is in the normal flow and scrolls away; the strip under it is its legend from the start and simply sticks under the header. Families never change form and nothing changes size while scrolling (an earlier version folded the chart into the strip with a flight animation: two looks for the same categories, and the page height changed under the finger on iPhone). From `sm` up the chart takes what fits under the name with the strip and chips still on screen (`--chart-start`, capped at 520px; `ProfileBoard` sets `--chart-cap` on `#chart-block`); phones keep the compact chart. Scroll anchoring is off for the whole page (`html, body`; Chrome needs both). The section chips scroll by hand in one continuous ease-out that re-aims every frame (`goTo` in `SectionChips.tsx`); touching or wheeling stops it. `--chart-guess` reserves the chart's height before it measures.
  - **Strip behaviour (kept minimal on purpose, after a design check):** pills for the seven families (laptop/tablet: one justified row; phones: a centred cloud over a few rows). It only reflects the project the visitor is on: **the open project is the focus** (one open at a time), its families are tinted and its skills laid out underneath (curves to their families on laptop/tablet; centred rows on phones); hovering other projects changes nothing until it's closed. With nothing open, hovering a project tints its families after ~140ms (hover intent). Hovering a pill highlights that family in the radial chart. **The strip never changes height:** the skills area is sized for the project that needs the most rows at the current width (`reserve` prop), with a quiet "Open a project to see its stack" hint while empty. Chip widths are measured with the real font (canvas `measureText`).
  - When the cap is under `MIN_LAYOUT` (380px, in `RadialChart.tsx`), the chart is laid out at 380px and scaled down whole (CSS transform), so labels shrink a little instead of disappearing. Mobile keeps its compact chart (no labels at rest).
  - **Phones (below `sm`, `lib/media.ts`):** the open card lights up its skills until it's closed (no hover on touch). At the top of the page the compact chart also names the highlighted skills with flat callouts inside the half-disc (`placeCallouts` in `RadialChart.tsx`): next to each dot, nudged a line up or down to avoid other labels, the portrait and the edge, with a hairline back to the dot. Opening a card keeps it in place while the one above collapses (`keepInPlace` in `WorkPanel.tsx`). A sideways (right-opening) chart was tried and reverted.
- **Project cards:** one is open at a time. They open and close with a CSS grid-row transition (no JS height measuring, which nudged the scroll); closed panels stay in the DOM but `inert`. A card closing above the one just opened shuts instantly and the page is compensated once before paint (`snapShut` + layout effect in `WorkPanel.tsx`), so the chosen card never moves. The header button toggles a card, and clicking or tapping its open details collapses it too (links, skill tags and selected text excepted); if the header has gone under the pinned block, the page scrolls back to it once the collapse ends (`bringBack` in `WorkPanel.tsx`). Desktop hover still drives the chart.
  - Family order is tuned for a full, balanced fan: Cloud, Infra as Code, Containers, Quality, CI/CD (Jenkins → GitHub Actions), Soft skills, Scripting (Python → Git), with short labels at both ends.
  - Long labels on the diagonals shrink the chart. Keep Spanish labels about as long as the English ones; for example, "Diagnóstico deductivo" and "Transversales" were chosen for this.
  - There is no list view or list toggle; the user removed it.
- **Portrait easter egg:** hover or tap to reveal the childhood photo plus a quote, centred with no box. No coding metaphors (the user rejected git/commit wording) and no hint text. The portrait grows upward.
- **Section chips** (`components/board/SectionChips.tsx`): Experience, Projects, Certifications, Education, Languages. They're pinned under the chart and mark the current section. Clicking one scrolls its section to 16px under the pinned block.
- **Gallery:** justified rows, images only (no captions), a dark lightbox, and a "More on Instagram @gonzalezfarabollini ↗" link (from `profile.instagram` in Sanity).
- **Footer:** only "Designed by Franco Gonzalez Farabollini ↗" linking to https://www.linkedin.com/in/franco-gonzalez-farabollini-568455148/ (hardcoded in `components/Footer.tsx`).
- **Ideas the user tried and rejected (don't reintroduce unless asked):** the radial chart shrinking with the scroll while pinned; folding the radial chart into the strip with a flight animation (looked like two designs, and changing the page height mid-scroll made iPhone stutter); in the strip: a hover preview panel per family, fading the boxes that aren't lit, hovering other projects overriding the open one, several projects open at once; the 25/50/75/100 scale and level words (exploring…expert); "fig.01" titles; the hint text under the portrait; a contact section in the footer; the stats line under the role (projects, certifications, skills mapped); the "further out · more hands-on" key on the chart.

## Code map
- `app/(en)/page.tsx`, `app/(es)/es/page.tsx`: separate root layouts per language (`<html lang>`). Both render `components/SitePage.tsx`.
- `lib/content.ts`: GROQ query plus a fallback to `content/`; `getContent(locale)` resolves `{en, es}` fields (Spanish falls back to English). Draft mode fetches drafts with stega.
- `lib/i18n.ts`: UI strings for both languages (neutral Spanish, no voseo).
- `components/board/`: ProfileBoard (layout, sticky block, scroll state: chart cap, scrollspy), ChartPanel (the radial chart), SkillStrip (the pinned legend), Portrait, WorkPanel, SectionChips.
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
