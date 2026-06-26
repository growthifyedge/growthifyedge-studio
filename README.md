# GrowthifyEdge — Software Showcase Hub

A premium, client-facing Angular 22 **software showcase platform** — a high-end SaaS /
agency / Apple-style presentation experience for showing software, AI automations,
dashboards, mini tools, demo videos, case studies and business impact to clients.

Built with **Angular 22 · standalone components · signals · lazy routes · typed reactive
forms · Tailwind CSS**. No NgModules. Strict TypeScript. Mock data service first,
backend-ready later.

**Design language:** dark luxury sidebar, light glass canvas, glassmorphism cards,
cinematic gradient heroes, bento grids, 24px rounded cards, aurora gradient accents,
`Space Grotesk` display type and smooth hover motion.

---

## Quick start

```bash
npm install
npm start
# open http://localhost:4200
```

Production build:

```bash
npm run build
```

> Built from scratch as files. If you'd rather generate via the CLI, the equivalent
> scaffold command is:
> ```bash
> npx @angular/cli@22 new growthifyedge-showcase-hub --standalone --routing --style=css --ssr=false
> ```
> then add Tailwind: `npm i -D tailwindcss postcss autoprefixer && npx tailwindcss init`.

---

## Tech stack

| Concern            | Choice                                             |
| ------------------ | -------------------------------------------------- |
| Framework          | Angular 22 (standalone, zoneless-ready)            |
| State              | Signals (`signal` / `computed`) — no NgRx needed   |
| Routing            | Lazy `loadComponent`, component input binding      |
| Forms              | Typed reactive forms (`NonNullableFormBuilder`)    |
| Styling            | Tailwind CSS v3 + custom design tokens             |
| Data               | `SoftwareService` (mock now, HTTP-ready API shape) |
| Control flow       | `@if` / `@for` / `@switch`                         |

---

## Folder structure

```
src/app
├── app.ts / app.config.ts / app.routes.ts   # bootstrap + lazy routing
├── core/
│   ├── models/        # Software, CaseStudy, filters — strict types
│   ├── data/          # mock-software.ts (seed dataset)
│   └── services/      # software.service.ts (signals), presentation.service.ts
├── layout/
│   ├── shell/         # dark sidebar + topbar + content shell
│   ├── sidebar/       # navigation
│   └── topbar/        # global search
├── shared/components/ # reusable UI: card, icon, status-badge, tech-chip,
│                      # video-modal, screenshot-gallery, impact-stat,
│                      # filter-bar, page-header, empty-state
└── features/          # one lazy-loaded page per route
    ├── dashboard/          # Executive Dashboard (cinematic hero + bento)
    ├── software-library/   # Software Gallery (search + filters)
    ├── software-detail/    # Full project page (problem→pain→solution)
    ├── ai-automations/     # AI Automation Gallery
    ├── mini-lab/           # Mini Software Lab (I/O examples)
    ├── demo-theatre/       # Demo Theatre (sectioned video library)
    ├── case-studies/       # Client proof
    ├── roadmap/            # Quarterly roadmap timeline
    ├── presentation/       # Client Presentation Mode
    ├── admin/              # Admin Studio (table + visibility)
    ├── software-form/      # Add / Edit (typed reactive form)
    └── contact/            # Request a Demo
```

Shared components: `software-card`, `video-card`, `category-card`, `icon`,
`status-badge`, `tech-chip`, `video-modal`, `screenshot-gallery`, `impact-stat`,
`filter-bar`, `page-header`, `empty-state`.

---

## Pages & routes

| Route               | Page                       |
| ------------------- | -------------------------- |
| `/`                 | Executive Dashboard        |
| `/gallery`          | Software Gallery           |
| `/software/:slug`   | Software Detail            |
| `/automations`      | AI Automation Gallery      |
| `/lab`              | Mini Software Lab          |
| `/theatre`          | Demo Theatre               |
| `/case-studies`     | Case Studies               |
| `/roadmap`          | Roadmap                    |
| `/present`          | Client Presentation Mode   |
| `/studio`           | Admin Studio               |
| `/studio/new`       | Add Software               |
| `/studio/edit/:id`  | Edit Software              |
| `/contact`          | Request a Demo             |

---

## Data storage & the optional Supabase backend

The app is **local-first**. Every page reads one signal in `SoftwareService`,
which is always cached to **localStorage** — so it works fully offline and the
demo never breaks. An **optional Supabase backend** can be switched on to make
projects available across devices and ready for client presentations.

| Mode | When | Behaviour |
| ---- | ---- | --------- |
| **Demo (default)** | `useSupabase: false` or no URL/key | localStorage only |
| **Cloud** | `useSupabase: true` + URL + anon key | loads from Supabase on startup; every add/edit/delete/toggle/import mirrors to Supabase; localStorage still kept as an offline cache/fallback |

Service layer: `SupabaseClientService` (thin REST wrapper, no SDK dependency),
`SoftwareCloudService` (row ⇄ model mapping), `MediaUploadService` (Storage).

### Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. **Dashboard → SQL → New query** → paste and run [`supabase/schema.sql`](supabase/schema.sql).
   This creates the `software_projects` table, indexes, RLS policies and the
   public `project-media` storage bucket.
3. **Project Settings → API** → copy the **Project URL** and **anon public key**.
4. Put them in `src/environments/environment.prod.ts` (and/or `environment.ts`
   for local dev) and set `useSupabase: true`.
5. (Optional) Seed the cloud: in Admin Studio click **Export JSON**, then import
   that file once the backend is on — or `POST` the rows directly.

> Auth is intentionally not added yet (Phase 5). The RLS policies currently allow
> anon read+write so Admin Studio works locally; `schema.sql` includes the
> commented `authenticated`-only policy to tighten later.

### Quick toggle without a rebuild

For testing the cloud path on an already-built site, set a runtime override in
the browser console (overrides the environment files):

```js
localStorage.setItem('growthifyedge.supabase', JSON.stringify({
  useSupabase: true,
  url: 'https://YOUR-ref.supabase.co',
  anonKey: 'YOUR-anon-key',
  bucket: 'project-media'
}));
location.reload();
```

Remove it with `localStorage.removeItem('growthifyedge.supabase')`.

### Media uploads

When the backend is on, the Add/Edit form's **Upload thumbnail** and **Upload
screenshots** dropzones push files to Supabase Storage and fill the URL fields
automatically. The URL inputs remain available in every mode.

---

## Production build & deployment

```bash
npm run build       # production build → dist/growthifyedge-showcase-hub/browser
```

The build output is a static SPA. **Deep links such as `/present/:slug` need a
SPA fallback** (rewrite everything to `index.html`) — config files are included:

### Vercel

- Push the repo and "Import Project", or run `vercel`.
- Settings are pre-wired in [`vercel.json`](vercel.json) (build command, output
  dir `dist/growthifyedge-showcase-hub/browser`, SPA rewrites).
- To enable the backend, add `useSupabase/url/anonKey` to
  `environment.prod.ts` before building (or set Vercel env vars and mirror them
  in a build step).

### Netlify

- "Add new site → Import" (or drag-and-drop the `browser` folder).
- [`netlify.toml`](netlify.toml) sets the build command, publish dir and SPA
  redirect; [`public/_redirects`](public/_redirects) covers drag-and-drop deploys.

### Environment values

See [`.env.example`](.env.example) for the variable names. Angular bundles config
at build time, so apply them in `environment.prod.ts` (or use the runtime
override above for quick tests).

---

© 2026 GrowthifyEdge. Crafted for client presentations.
