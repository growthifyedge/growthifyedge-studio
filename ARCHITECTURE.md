# Architecture — GrowthifyEdge Studio

A single-page **software showcase hub** built with Angular (standalone, zoneless,
signals-first). This document describes how the code is organized, how state and
data flow, and the conventions every feature follows.

---

## 1. Tech & rendering model

| Concern           | Choice |
| ----------------- | ------ |
| Framework         | Angular — **standalone components only** (no NgModules) |
| Change detection  | **Zoneless** + `ChangeDetectionStrategy.OnPush` on every component |
| State             | **Signals** (`signal` / `computed` / `effect`) — no NgRx |
| Routing           | Lazy `loadComponent` per route + `withComponentInputBinding()` + `withViewTransitions()` |
| Forms             | Typed reactive forms (`NonNullableFormBuilder`) |
| Styling           | Tailwind CSS v3 + design tokens; utility-first, no component CSS libraries |
| Control flow      | Built-in `@if` / `@for` / `@switch` (every `@for` has `track`) |
| Data              | Local-first (`localStorage`) with an **optional** Supabase cloud backend |

The app is **client-rendered**. SEO tags + JSON-LD are injected at runtime by
`SeoService`; full crawler coverage via SSR/prerender is a future recommendation.

---

## 2. Directory layout

```
src/app
├── app.ts / app.config.ts / app.routes.ts   # bootstrap, providers, lazy routes
├── core/
│   ├── models/       # strict domain types (Software, CaseStudy, Inquiry, …)
│   ├── data/         # seed datasets (mock-software.ts, technologies.ts)
│   ├── services/     # signal stores + integrations (see §4)
│   ├── guards/       # adminGuard (route protection)
│   └── utils/        # pure helpers (video-embed, …)
├── layout/           # shell, sidebar, topbar (persistent chrome)
├── shared/components # reusable presentational UI (card, icon, badge, …)
└── features/         # one lazy-loaded page per route (see §3)
```

### The four-move feature pattern

Every feature is added the same way — this keeps the codebase predictable:

1. **Model** — a strict interface in `core/models`.
2. **Signal store** — a service in `core/services` (localStorage-first, seeded).
3. **Component(s)** — standalone, OnPush, in `features/…`.
4. **Route** — a lazy `loadComponent` entry in `app.routes.ts`.

Admin-managed data adds a 5th move: a prepared `supabase/*.sql` migration.

---

## 3. Routes

| Route | Page | Guard |
| ----- | ---- | ----- |
| `/` | Executive Dashboard | — |
| `/gallery` | Software Gallery | — |
| `/software/:slug` | Software Detail (SEO + JSON-LD) | — |
| `/automations` | AI Automation Gallery | — |
| `/lab` | Mini Software Lab | — |
| `/theatre` | Demo Theatre | — |
| `/case-studies` | Case Studies + testimonials wall | — |
| `/roadmap` | Roadmap | — |
| `/present`, `/present/:slug` | Client Presentation Mode | — |
| `/contact` | Request a Demo | — |
| `/login` | Admin Sign In | — |
| `/studio` | Admin Studio | `adminGuard` |
| `/studio/analytics` | Project Analytics | `adminGuard` |
| `/studio/inquiries` | Client Inquiries | `adminGuard` |
| `/studio/testimonials` | Testimonials CRUD | `adminGuard` |
| `/studio/new`, `/studio/edit/:id` | Add / Edit Software | `adminGuard` |

All 19 route entries are lazy-loaded — no feature is in the initial bundle.

---

## 4. Services (state & integrations)

| Service | Responsibility |
| ------- | -------------- |
| `SoftwareService` | Single source of truth for projects — signal list, filtering, CRUD, import/export. Reads through `SoftwareStorageService`, mirrors to cloud when enabled. |
| `SoftwareStorageService` | localStorage persistence boundary + first-run seeding from `mock-software.ts`. |
| `SoftwareCloudService` | Supabase row ⇄ `Software` model mapping (camelCase ⇄ snake_case, JSONB nested arrays). |
| `SupabaseClientService` | Thin REST wrapper over PostgREST/GoTrue/Storage — no SDK dependency. |
| `MediaUploadService` | Uploads thumbnails/screenshots to Supabase Storage. |
| `AnalyticsService` | localStorage-first view/click tracking; aggregates for the admin dashboard. |
| `InquiryService` | Client demo/quote/contact requests (localStorage-first signal store). |
| `TestimonialService` | Curated client testimonials (localStorage-first, seeded). |
| `PresentationService` | Presentation-mode enter/exit state (drives full-bleed chrome-less layout). |
| `SeoService` | Per-page `<title>`, meta, Open Graph, Twitter Card, canonical, JSON-LD. |
| `TechnologyService` | Technology library lookups (icons/metadata). |
| `AuthService` + `SessionStore` | Admin auth — Supabase GoTrue in cloud mode, local password gate in demo mode. |

### State flow

```
Component (signals/computed)
     │ reads/calls
     ▼
Service signal store  ──effect──▶ localStorage (always, cache/fallback)
     │ (when cloud enabled)
     ▼
SupabaseCloudService ──REST──▶ Supabase (best-effort mirror)
```

Components never touch `localStorage` or HTTP directly — they only talk to
services. Swapping the data source is a service-layer change, not a component one.

---

## 5. Data storage modes

| Mode | Trigger | Behaviour |
| ---- | ------- | --------- |
| **Demo** (default) | `useSupabase: false` or missing URL/key | localStorage only — fully offline, demo never breaks |
| **Cloud** | `useSupabase: true` + URL + anon key | Loads from Supabase on startup; every mutation mirrors to Supabase; localStorage kept as offline cache/fallback |

See [`supabase/README.md`](supabase/README.md) for the schema and migrations.

---

## 6. Conventions

- **Strict TypeScript** — `strict`, `noUnusedLocals`, `noUnusedParameters`,
  `noImplicitReturns`, `strictTemplates`. Zero `any` in the codebase.
- **Immutability** — domain models use `readonly` fields; signal updates are
  done with new objects/arrays, never in-place mutation.
- **Presentational vs. feature** — `shared/components` are dumb/reusable
  (inputs/outputs only); `features/*` own state via injected services.
- **Accessibility** — semantic elements, `aria-*` on icon-only controls, alt text.
- **Images** — hero/LCP images use `fetchpriority="high"`; below-the-fold images
  use `loading="lazy"` + `decoding="async"`; every `<img>` has a fallback.
