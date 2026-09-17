# GrowthifyEdge Campaign Cube: Handoff

Checkpoint written 2026-09-18. Everything below was read from the repository and verified in a real Chrome render on that date, not recalled from earlier conversations.

## Project

- **Project:** GrowthifyEdge Digital Solutions (Angular showcase hub)
- **Project path:** `E:\Business Software Dashboard`
- **Branch:** `main`
- **Dev server:** `npm start` (`ng serve`), the browser harnesses below expect it on port 4273 (`npm start -- --port 4273`)
- **Development build:** `npx ng build --configuration development` (passes, no warnings, as of this checkpoint)

## Primary campaign files

| File | Role |
|---|---|
| `src/app/shared/components/campaign-slide/campaign-slide.ts` | Cube engine: scroll scrubbing, wheel gesture handling, controlled transitions, scroll sync. **Locked.** |
| `src/app/shared/components/campaign-slide/campaign-slide.html` | Scene, sticky stage, atmosphere, aura, Up/Down controls, three cube faces with artwork and copy. |
| `src/app/shared/components/campaign-slide/campaign-slide.css` | All visual styling: square size, glow, face palettes, artwork, typography, responsive rules. |

Related but outside the cube: `src/app/layout/public-navbar/` (navbar, unchanged by the cube work), `src/app/layout/shell/shell.ts` (auto-opens the project inquiry modal 2.5s after load), `src/app/core/services/project-inquiry-modal.service.ts`.

## Locked and working systems

Do not casually rebuild any of these during the face redesign.

- **Physical 3D cube geometry.** `.campaign-cube-shell` sets `--cube-size` and `--cube-depth: calc(var(--cube-size) / 2)`. Faces are `rotateX(0 / -90 / -180deg) translateZ(var(--cube-depth))`; the cube is `translateZ(-depth) rotateX(var(--cube-rotation))`. Stage perspective is 1400px.
- **Wheel interaction and gesture segmentation.** One face per physical wheel gesture. Every wheel event records its time and restarts a 120ms quiet-period timer; when it fires the gesture ends and its state resets, regardless of whether a cube transition is running. There is no post-transition cooldown.
- **Scroll RAF protection.** `transitionToFace` cancels any queued scroll-driven frame and raises both guards (`cubeTransitionActive` and `isProgrammaticTransition`) before the cube moves. The scroll frame callback re-checks both guards at execution time.
- **Programmatic scroll sync.** After a controlled transition the angle and face are set exactly, the window is scrolled to the settled face while the guard is held, and the guard is released only after at least two frames once `window.scrollY` has stopped changing (12-frame ceiling).
- **Up/Down controls.** `goToFace` uses the same transition path; buttons are disabled while a transition is in flight and at the ends.
- **Square sizing, tight glow, navbar integration, routing, lower Home sections.** All verified unchanged or as documented below.

## Current timings

| Interaction | Duration | Where |
|---|---|---|
| Wheel transition | 520ms | `campaign-slide.ts` line 106 |
| Arrow-button transition | 250ms | `campaign-slide.ts` line 125 |
| Wheel quiet period | 120ms | `WHEEL_QUIET_PERIOD_MS`, line 37 |

Regression test on this checkpoint: 12 of 12 gestures passed (DOWN DOWN UP UP, DOWN UP DOWN UP, and Face 3 UP then an immediate UP at lock release). Measured tween lengths 517 to 552ms, every trajectory monotonic in the gesture direction.

## Current square size logic

Exact rules in `campaign-slide.css`:

```css
/* desktop */
.campaign-cube-shell { --cube-size:min(48vw,720px,calc(100vh - 140px)); }
/* max-width 1023px */
.campaign-cube-shell { --cube-size:min(76vw,720px,calc(100vh - 140px)); }
/* max-width 639px */
.campaign-cube-shell { --cube-size:min(90vw,460px,calc(100vh - 130px)); }
```

Measured settled square:

| Viewport | Square | Notes |
|---|---|---|
| 1904 x 905 | 720 x 720 | 46px below navbar, 45px above viewport bottom, 453px clear of the left controls |
| 1424 x 805 | 665 x 665 | height clause binds; 23px clearance top and bottom |
| 500 x 749 | 450 x 450 | phone rules, no horizontal overflow |

The cube is centred at `left:50%; top:calc(50% + 47px)` inside the sticky stage. Face grid is `1fr auto` with a fixed 36px copy padding, so the CTA bottom gap is 36 to 37px on desktop regardless of viewport height.

## Current glow

- **Aura container** `.cube-aura`: `width/height: var(--halo-size)` where `--halo-size = cube-size * 1.15` at every breakpoint. `filter: blur(26px)`, `mix-blend-mode: screen`, `opacity: 1` (face 3 lowers the whole aura to 0.68). Measured 1.15x the square: 54px overhang per side at 720px.
- **Lobes** (three `span`s, rounded rectangles, crossfaded by opacity via the `scene-face-one/two/three` classes on the scene section):
  - `.cube-aura-cyan`: cyan to electric blue, anchored lower-left (`ellipse 62% 78% at 8% 72%`).
  - `.cube-aura-violet`: violet to purple, anchored upper-right (`ellipse 66% 66% at 88% 14%`).
  - `.cube-aura-inner`: faint full-perimeter blue fill plus top and bottom bands.
- **Attached spill** behind the square: `.campaign-cube-shell::before` (blue, lower-left, inset `-6% -7% -9% -9%`) and `::after` (violet, upper-right, inset `-9% -9% -6% -7%`), `blur(22px)`, per-face opacity.
- **Stage atmosphere:** the two large stage blobs (`.scroll-campaign-stage::before/::after`) are at `opacity: 0`, effectively removed. The atmosphere layer is a neutral navy vignette only (`ellipse 56% 48% at 50% 54%`, alpha 0.12 to 0.16) over the canvas `#040b16`.
- **Rim:** `.cube-face` border 1px at 5% white (6% on the front face), gradient rim `::after` resolves to 0.055 when settled. Contrast comes from the glow, not an outline.

Per-face glow mix:

| Face | Cyan lobe | Violet lobe | Inner | Spill (blue / violet) | Result |
|---|---|---|---|---|---|
| 1 Websites | 1.0 | 0.22 | 0.6 | 0.55 / 0.16 | compact cyan and blue, trace of violet top-right |
| 2 Apps | 0.45 | 1.0 | 0.75 | 0.22 / 0.6 | strongest, violet and purple, restrained magenta |
| 3 Automation | 0.6 | 0.4 | 0.4 | 0.32 / 0.3 | whole aura at 0.68, cool blue left, faint violet right |

## Current face palettes

```css
.face-light-1 { radial cyan/blue focal at 50% 28% over #041c38 -> #031226 -> #020a17 }
.face-light-2 { radial violet/magenta focal at 50% 28% over #130c36 -> #0b0824 -> #040312 }
.face-light-3 { small cool-blue focal at 50% 32% over #05080f -> #030509 -> #010203 }
```

Headline is explicit `#fff` on `.face-copy h1` (the global body colour is slate and would otherwise leak in); the second line is a near-white clipped gradient. Eyebrow 12px at 78% white, description 15px at 84% white.

## Current CTA routes

| Face | Label | Route | Verified in `app.routes.ts` |
|---|---|---|---|
| 1 | View My Work | `/work` | line 23 |
| 2 | Explore Capabilities | `/capabilities` | line 29 |
| 3 | Start a Project | `/contact` | line 163 |

All three are `<a [routerLink]>` with per-face gradient backgrounds. The face 3 CTA no longer opens the inquiry modal.

## Important pending work for the next session

The **internal face designs are not final**. The next session will likely remove or rebuild the visual contents inside the three faces while keeping the cube engine:

- Face 1: premium Websites & Software product-style composition.
- Face 2: premium Apps & Dashboards composition.
- Face 3: premium Automation & AI composition.

During that redesign, keep untouched: `campaign-slide.ts`, the cube transforms and `--cube-size` / `--cube-depth` rules, the aura and spill rules, the stage atmosphere, the rim, and the controls. Face content lives in `.face-art` (artwork) and `.face-copy` (text and CTA) inside each `.cube-face`; the artwork CSS is in the `.web-art-*`, `.app-art-*`, and `.ai-art-*` rules.

## Branding

- **GE**: official GrowthifyEdge company mark. The only mark allowed inside the campaign faces, small and integrated into the product visuals, never as a large standalone logo, never with the full wordmark inside the square.
- **HMJ**: personal Founder/CEO mark for Hafiz Muhammad Junaid. Reserved for a future Founder/CEO or About treatment. Do not use inside the campaign faces.

## Logo status

- The official GE source artwork is **not in the repository**. `public/brand/` exists and is empty. **`public/brand/ge-mark.png` does not exist.**
- The stylesheet already references `/brand/ge-mark.png` in three places, which currently render nothing:
  - Face 1: `.web-art-browser section em::before`, inside the browser mock's hero tile.
  - Face 2: `.app-art-dashboard header::after`, right-aligned in the dashboard header bar (15px).
  - Face 3: `.cube-face-3 .face-art::after`, a 26px badge at the lower right of the automation artwork.
- A manually recreated GE SVG was intentionally deleted at the owner's request. Do not recreate, trace, or approximate the mark.
- `tools/extract-ge-mark.py` produces the asset from the real poster once it is on disk. It crops the top portion of the poster (default 62%, which holds the circular emblem and excludes the wordmark), finds the bounding box of the emblem pixels, keys the near-black canvas to transparency with a luminance ramp (fully transparent at luma 22 and below, fully opaque at 70 and above), centres the result on a square canvas, resizes to 512px, and writes `public/brand/ge-mark.png`. It does not redraw anything. Requires Pillow. Usage from the repo root:

```bash
python tools/extract-ge-mark.py path/to/official-ge-logo.png
```

## Test and capture harnesses

Both live in `tools/campaign/` and drive a real headless Chrome over the DevTools protocol with Node 24 (built-in `fetch` and `WebSocket`, no npm dependencies). They expect Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe` and the dev server on port 4273. Both dismiss the auto-opened inquiry modal with a real Escape key before acting.

- `node tools/campaign/wheel-regression.mjs out.png` runs the 12-gesture sequence with genuine mouse-wheel input, records every angle change, uses the Up button's disabled state to detect lock release for the immediate second UP, and prints a pass table plus `ALL PASS`.
- `node tools/campaign/capture-faces.mjs outDir` screenshots each settled face and dumps computed metrics (square, halo, rim, headline colour, CTA gap, layout clearances) to `inspect.json`. Window size via `CAP_W` and `CAP_H` env vars.

Why these exist: the desktop app's built-in browser pane does not run animation frames while hidden, so the cube tween cannot be exercised there. Headless Chrome enforces a 500px minimum window width, so true phone widths need a real device or a Chrome device emulation session.

## Other pending issues found in the repository

- `CampaignFace.route` is still optional in the interface while the template binds `[routerLink]="face.route"` unconditionally. Making it required would prevent a future face rendering a dead link.
- The shell auto-opens the inquiry modal 2.5s after load. It covers the cube and swallows wheel input until dismissed, which matters for any automated testing.
- Face 1's hero tile (`.web-art-browser section em`) carries a dark fill added for the GE mark; until the asset exists it reads as an empty tile.
- The global `.ge-btn-aurora` class still applies its `aurora-pan` animation to the face CTAs, which is inert because the per-face `background` shorthand overrides the animated gradient.
- Only the development build has been verified in this session; the production build was not run.
- Earlier campaign work in this repo was partly done by Codex (face palettes and CTA routing on 2026-09-17) and is recorded in Codex rollout logs, not in git history, since the campaign files were untracked until this checkpoint.
