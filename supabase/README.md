# Database & schema — GrowthifyEdge Studio

The app is **local-first**: everything works from `localStorage` with no backend.
An **optional** Supabase backend makes data multi-device and presentation-ready.
This folder holds the SQL migrations and documents the schema.

> **Nothing here is auto-applied.** Run the files you need in the Supabase SQL
> editor (Dashboard → SQL → New query). `schema.sql` is the base; the others are
> additive, self-contained migrations that do not alter existing tables/policies.

---

## Migrations

| File | Adds | Applied by default |
| ---- | ---- | ------------------ |
| [`schema.sql`](schema.sql) | `software_projects` table, indexes, `updated_at` trigger, RLS, public `project-media` storage bucket | Base — run first |
| [`analytics.sql`](analytics.sql) | `project_analytics_events` + `project_analytics`, `record_analytics_event()` RPC | Prepared (app uses localStorage today) |
| [`inquiries.sql`](inquiries.sql) | `inquiries` table + `submit_inquiry()` RPC | Prepared |
| [`testimonials.sql`](testimonials.sql) | `testimonials` table + `software_projects.case_study` column | Prepared |

---

## Table: `software_projects`

One row per project; nested collections are stored as **JSONB** so the row maps
1:1 to the front-end `Software` model (`SoftwareCloudService` handles the
camelCase ⇄ snake_case translation).

| Column | Type | Notes |
| ------ | ---- | ----- |
| `id` | `text` PK | e.g. `sw-01` |
| `slug` | `text` unique | URL key for `/software/:slug` |
| `name`, `tagline` | `text` | |
| `short_description`, `full_description` | `text` | `description` / `longDescription` |
| `problem`, `solution` | `text` | story fields |
| `manual_pain_points` | `jsonb` | `string[]` |
| `category`, `demo_category` | `text` | |
| `status` | `text` | `Live \| Beta \| In Development \| Concept \| Archived` |
| `visibility` | `text` | `public \| private \| client-only` |
| `pricing` | `text` | `Free \| Subscription \| One-time \| Custom Quote` |
| `featured`, `is_mini` | `boolean` | |
| `cover_image`, `accent_color`, `accent_color2` | `text` | |
| `tech_stack`, `screenshots`, `videos`, `impact`, `key_features`, `tags` | `jsonb` | nested arrays |
| `headline_metric`, `io_example` | `jsonb` | objects |
| `time_saved` | `text` | |
| `demo_video_url`, `teaser_video_url`, `walkthrough_video_url`, `live_url`, `repo_url`, `case_study_url` | `text` | optional links |
| `case_study` | `jsonb` | structured case study (added by `testimonials.sql`) |
| `rating` | `numeric(2,1)` | |
| `clients`, `impact_score` | `integer` | |
| `launched_at` | `date` | |
| `created_at`, `updated_at` | `timestamptz` | `updated_at` kept fresh by trigger |

**Indexes:** `category`, `status`, `featured`, `visibility`.

---

## Analytics (prepared)

- **`project_analytics_events`** — raw event log (`view \| presentation \| demo \| case_study`), FK → `software_projects` (cascade delete).
- **`project_analytics`** — per-project aggregate (`total_views`, `presentation_views`, `demo_clicks`, `case_study_clicks`, `last_viewed_at`).
- **`record_analytics_event(project_id, type)`** — `SECURITY DEFINER` RPC so **anonymous** visitors can record events without direct table writes.

---

## Inquiries (prepared)

- **`inquiries`** — demo/quotation/contact requests (`status`: `New → Contacted → Quoted → Closed → Archived`).
- **`submit_inquiry(...)`** — `SECURITY DEFINER` RPC; forces `status = 'New'` and validates `type`, so anonymous submits are safe.

---

## Testimonials (prepared)

- **`testimonials`** — curated client quotes (`rating` 1–5, `featured`).
- Adds **`software_projects.case_study`** (`jsonb`) for the structured, embedded case study.

---

## Row-Level Security model

| Data | Read | Write |
| ---- | ---- | ----- |
| `software_projects` | public (anon) | admin (see policy notes in `schema.sql`) |
| `project_analytics*` | admin only | anon via RPC (event recording) |
| `inquiries` | admin only | anon via `submit_inquiry` RPC |
| `testimonials` | public (shown on the site) | admin only |

Anonymous **writes** never go direct to a table — they flow through
`SECURITY DEFINER` RPCs that validate and constrain the payload. All admin
mutations run as an authenticated Supabase user (GoTrue JWT via `AuthService`).

> The base `schema.sql` currently ships anon read+write policies so Admin Studio
> works before auth is wired in cloud mode; it includes the commented
> `authenticated`-only policy to tighten for production.
