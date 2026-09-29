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
| **Profile** | Name, role, intro, portrait, the childhood photo + quote (easter egg), email, LinkedIn, CV PDF, contact copy |
| **Work history** | Roles, projects (drag to reorder), certificates, education, languages |
| **Skills chart** | Skill families (label + colour) and their skills (label, key, value 0–100, internal note), plus the guide rings |
| **Photography** | Photos (drag to reorder), each with a title and alt text |

- **Linking projects to the chart:** a project's `skills` field holds skill **keys** (e.g. `terraform`). The Studio flags any key that doesn't exist in Skills chart.
- **Focal points:** set the hotspot on the portrait (face) and on the childhood photo (where the zoom centres).
- **When changes appear:** in `npm run dev`, on refresh. In production, within 60 seconds.
- **Adding people:** invite editors at https://www.sanity.io/manage/project/tqm0fcg9.
- **Deploying the site:** add your production domain as a CORS origin with credentials, either in the Sanity manage page or with `npx sanity cors add https://your-domain --credentials`.

### Local fallback and re-seeding

`content/*.ts` holds a local copy of everything. The site falls back to it for any section Sanity doesn't return, for example if it's unreachable.

`npm run seed` pushes that local copy (including images and the PDF) into Sanity through your logged-in Sanity CLI. **It overwrites the four documents**, so only use it to reset.

## Where things live

```
app/(site)/          page + layout (fonts, globals)
app/studio/          embedded Sanity Studio
components/
  Header, Footer, Gallery, ConsoleHello
  board/             ProfileBoard (chart ⟷ work linking), ChartPanel, WorkPanel, Portrait (easter egg)
  skills/            RadialChart, geometry (layout maths), SkillList (read-only list view)
lib/content.ts       GROQ query + mapping + fallback
sanity/              schema, structure, client, env
content/             local fallback + seed source
scripts/seed.ts      pushes content/ into Sanity
app/globals.css      design tokens (colours, fonts, hairlines)
```

## Easter eggs

- Hover or tap the portrait at the root of the chart to see Nico as a kid.
- Open devtools.
