# Nico · CV

A one-page CV for Nicolás González Farabollini. The skills map stays pinned while the work history scrolls beneath it, and each lights up the other. The chart shows fixed values; visitors can pull nodes around, but everything springs back. All content is managed in Sanity.

**Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, Motion, Sanity (Studio embedded at `/studio`). Fonts are Geist and Geist Mono. The chart is hand-rolled SVG with a small spring simulation, so there's no chart library.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000   ·   Studio: http://localhost:3000/studio
npm run build      # production build (also type-checks)
```

## Editing content (Sanity)

Sanity project **`tqm0fcg9`** (“Nico CV”), dataset `production`. It's public, so no token is needed to read it.

Open `/studio` and sign in with the Sanity account that owns the project. There are four documents:

| Studio item | What it controls |
| --- | --- |
| **Profile** | Name, role, intro, portrait, the childhood photo + quote (easter egg), email, LinkedIn, Instagram (linked from Photography), CV PDF, contact copy |
| **Work history** | Roles, projects (drag to reorder), certificates, education, languages |
| **Skills chart** | Skill families (label + colour) and their skills (label, key, value 0–100, internal note), plus the guide rings |
| **Photography** | Photos (drag to reorder), each with alt text. Photos show without captions |

- **Linking projects to the chart:** a project's `skills` field holds skill **keys** (e.g. `terraform`). The Studio flags any key that doesn't exist in Skills chart.
- **Chart order:** families and skills are drawn left to right in Studio order. Keep short labels at the two ends (AWS, Git) and long ones in between, or the chart has to shrink to fit them.
- **Focal points:** set the hotspot on the portrait (face) and on the childhood photo (where the zoom centres).
- **When changes appear:** in `npm run dev`, on refresh. In production, within 60 seconds.
- **Adding people:** invite editors at https://www.sanity.io/manage/project/tqm0fcg9.
- **Deploying the site:** add your production domain as a CORS origin with credentials, either in the Sanity manage page or with `npx sanity cors add https://your-domain --credentials`.

### Live preview

In the Studio, open **Preview** in the top bar to see the site next to the form. It shows unpublished changes as you type. Click any translatable text in the preview to jump to its field. Use the URL bar in the preview to switch between `/` (English) and `/es` (Español).

It needs a read-only **Viewer** token, set once:

1. **Create it:** https://www.sanity.io/manage/project/tqm0fcg9/api → Tokens → *Add API token* → name "Preview", permission **Viewer**. Or run `npx sanity tokens add "Preview" --role viewer` in this folder.
2. **Vercel:** Project → Settings → Environment Variables → add `SANITY_API_READ_TOKEN` = the token (Production, and Preview if you like), then redeploy.
3. **Local (optional):** create `.env.local` with `SANITY_API_READ_TOKEN=…` and restart `npm run dev`.

Keep it server-only (never `NEXT_PUBLIC_`). It's never sent to visitors.

### English / Español

The site is bilingual: `/` is English and `/es` is Spanish, with an EN · ES switch in the header.

- **In the Studio,** every translatable field has an **English** and an **Español** box side by side. English is required. Leave Español empty and the Spanish page shows the English text, which is handy for tool names like "Terraform".
- **Dates** are entered as `YYYY-MM` (e.g. `2023-10`) or `YYYY`. The site formats them per language: "Oct 2023" / "oct 2023".
- **CV PDF:** add an optional **CV (PDF, Español)** in Profile → Contact. Without it, the Spanish page offers the English PDF.
- **Fixed labels** (buttons, headings, hints) live in `lib/i18n.ts`.
- The Spanish content is a drafted translation for Nico to review.

### Local fallback and re-seeding

`content/*.ts` holds a local copy of everything. The site falls back to it for any section Sanity doesn't return, for example if it's unreachable.

`npm run seed` pushes that local copy (including images and the PDF) into Sanity through your logged-in Sanity CLI. **It overwrites the four documents**, so only use it to reset.

## Where things live

```
app/(en)/, app/(es)/ one root layout per language (sets <html lang>), pages render components/SitePage
app/studio/          embedded Sanity Studio
components/
  Header, Footer, Gallery, ConsoleHello
  board/             ProfileBoard (chart ⟷ work linking), ChartPanel, WorkPanel, Portrait (easter egg)
  skills/            RadialChart, geometry (layout maths), SkillList (read-only list view)
lib/content.ts       GROQ query + fallback + resolving one language
lib/i18n.ts          UI strings (en/es), date formatting
sanity/              schema, structure, client, env
content/             local fallback + seed source
scripts/seed.ts      pushes content/ into Sanity
app/globals.css      design tokens (colours, fonts, hairlines)
```

## Easter eggs

- Hover or tap the portrait at the root of the chart to see Nico as a kid.
- Open devtools.
