# Greaton — landing page

Static HTML/CSS/JS prototype for the Greaton marketing site.
Will be ported to WordPress (likely ACF Pro flexible content) after design lock-in.

This snapshot delivers **section 3 only** — the dark, cinematic scroll-scrubbed
video section. Sections 1, 2, 4, 5 are still pending.

---

## Section map (full site, 5 sections)

| # | Theme | What it is | Status |
|---|-------|------------|--------|
| 1   | Light | Hero — "Never wonder where the next patient comes from." Video player scales up on scroll. | ⏳ pending |
| 1.x | Light | Sub-sections (video play state, scroll continuation) | ⏳ pending |
| 2   | Light | Results / charts — "Month 3 results. One practice." | ⏳ pending |
| **3** | **Dark** | **Scroll-scrubbed cinematic video with 5 text scenes — "This is what changes."** | ✅ **done (this build)** |
| 4   | Light | "Stop Scroll" pop-ups — floating icons, "Everything connected. Nothing wasted." → "One system. Everything handled." | ⏳ pending |
| 5   | Light | Final pitch — "Your calendar fills with patients who chose you.", "See where your revenue is bleeding." | ⏳ pending |

The single shared design motif across all sections is the **per-character
accent reveal** on headlines (e.g. "the n**ext** patient", "Everything
conne**ct**ed", "Every dollar **tracked**"). The utility that does this
(`splitChars` in `main.js`) is already built and will be reused for every
section — it just needs different color stops for light vs dark backgrounds.

---

## File structure

```
greaton/
├── index.html              ← single page, semantic, references everything
├── README.md               ← this file
└── assets/
    ├── css/
    │   └── main.css        ← all styles, :root variables at top
    ├── js/
    │   └── main.js         ← all behaviour, CONFIG object at top
    └── media/
        ├── loading.mp4     ← 6s logo intro, plays on first load
        └── greaton.mp4     ← 50s scroll-scrubbed video (only ~9.5s used)
```

---

## How to run locally

The page needs a server (browsers won't load `<video>` from `file://`).
**Use a server that supports HTTP Range requests** — `python3 -m http.server`
does NOT serve video correctly for scrubbing. Use one of:

```bash
# Recommended — npx, supports Range out of the box
npx serve .

# Or
npx http-server -c-1 .

# Or any modern static server (vite, live-server, etc.)
```

Then open <http://localhost:3000> (or whatever port the server prints).

---

## How section 3 works (mental model)

```
[ loading.mp4 plays 6s ]  →  [ hero title appears ]  →  scroll starts
                                                              ↓
                            [ video scrubs forward as you scroll ]
                                                              ↓
                            scene 1 ──── scene 5 (each: enter, dwell, exit)
                                                              ↓
                                              [ next page section ]
```

**Two coordinate systems are linked:**

1. **Scroll position** (in px) — controlled by user
2. **Video currentTime** (in s) — controlled by scroll

`scrollToVideoTime()` in `main.js` is the map between them. Each scene
declares `videoIn / videoPeak / videoOut` (seconds) and `dwellPx`
(how long the text holds before the video moves on).

**Scene state machine** — each scene cycles through:
`idle → entering → active → exiting → idle`

While `entering`, characters of the headline are revealed left-to-right
with a per-character sweep through colors (transparent → blue → white →
grey). Accent words stay blue. On `exiting`, all chars fade out.

---

## Where to edit content

**Everything content-related lives in `CONFIG` at the top of `main.js`.**
This is the same object that will eventually be populated by WordPress.

```js
const CONFIG = {
  media:   { loading: "...", main: "..." },     // video paths
  loading: { minMs, maxMs },                     // loading screen timing
  hero:    { title, accent, sub, fadeOutAt },    // first view
  scenes:  [ { id, position, label, headline, accent, videoIn, videoPeak, videoOut, dwellPx }, ... ],
  scrollPxPerSec: 160,                           // global scroll→video ratio
  heroLeadInPx:   700,                           // breathing room before scrubbing
  scrubLerp:      0.10,                          // smoothing (lower = smoother)
  char:    { sweepMs, charMs, exitMs },          // per-char animation
};
```

To add/remove/reorder scenes: edit `CONFIG.scenes`. The HTML scene
elements are generated dynamically in `buildSceneElements()` — you do not
edit `index.html` to add scenes.

`position` accepts: `bottom-left | mid-left | mid-right | mid-center`
(corresponds to CSS classes in `main.css`).

`accent` is an array of whole-word matches. Word boundaries are respected,
so `accent: ["is"]` will NOT match the "is" inside "This".

---

## Design system (what's already set)

| Token | Value | Use |
|-------|-------|-----|
| `--blue` | `#5aabff` | Accent / brand |
| `--bg`   | `#000` | Dark section bg |
| `--fg`   | `#fff` | Primary text |
| `--font-display` | Inter 800 | Headlines |
| `--font-body`    | Inter 400 | Body |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | All major transitions |

**For light sections (1, 2, 4, 5):** the same `--blue` accent works on light
backgrounds, but `STOPS_NORMAL` in `main.js` (used by char reveal) targets
white→grey end-states and will need a light-mode variant
(`white → black → grey` style) when those sections are built.

---

## Debug tools

- **Press `D`** anywhere to toggle a debug overlay showing live video
  time, scroll position, and current scene name. Useful for tuning
  `videoIn / videoPeak / videoOut` to match the underlying video content.

---

## Known issues / things to revisit

1. **Progressive char fade is missing.** In the design comps every
   headline fades on the right side — e.g. "This is what chang**es.**"
   has visibly dimmer trailing chars, and "You focus on patient**s.**"
   in the final scene fades almost to invisible. Right now `localT` is
   clamped at `0.35` (white) for every char regardless of position. To
   match the comps, the clamp should scale with character position:
   ```js
   const positionT  = i / Math.max(N - 1, 1);
   const maxLocalT  = 0.35 + positionT * (scene.fadeStrength ?? 0.5);
   const localT     = clamp(ct * 0.55 - 0.2, -0.2, maxLocalT);
   ```
   Add `fadeStrength` (0..1.3) per scene in CONFIG — final scene wants
   ~0.9, regular scenes ~0.4, hero ~0.7.
2. **Browser autoplay policy**: in some browsers the loading.mp4 won't
   autoplay without user interaction. We catch `play()` rejection and
   skip to the main page after `loading.minMs`, so no UX is blocked.
3. **greaton.mp4 is 50s but only first ~9.5s is used.** That's fine —
   the rest is reserved for future or just unused source material.
4. **greaton.mp4 is 640x360.** Looks fine on dark, but if a higher-res
   master exists we should swap it in.

---

## Scene layout reference (what each `position` means)

| `position`    | Anchor          | text-align    | Use case                              |
|---------------|-----------------|---------------|---------------------------------------|
| `bottom-left` | Lower-left      | left          | Calendar, Wasted                      |
| `mid-left`    | Middle-left     | left          | Consultations                         |
| `mid-right`   | Middle-right    | right         | Vanity                                |
| `mid-center`  | Dead center     | center        | (currently unused)                    |
| `top-left`    | Upper-left, **headline shrinks to widest line and right-aligns shorter lines inside** | right (within block) | Final scene |

Adding a new position = add a class to `main.css` under the `.scene.*`
group, then use that string in `CONFIG.scenes[i].position`.

---

## What's next (for Claude Code)

When picking this up, the right order is:

1. **Read this README + skim `main.js` `CONFIG` block** — that's the
   whole content surface.
2. **Add light theme primitives** to `main.css` (new CSS variables for
   light bg/fg, light-mode char color stops in `main.js`).
3. **Build section 1** (light hero with scaling video on scroll). Use
   the same sticky + scroll-scrubbing pattern as section 3 — just for
   a transform/scale animation instead of `video.currentTime`.
4. **Build sections 2, 4, 5** in order. Each one likely re-uses
   `splitChars` for headlines.
5. **WordPress port plan**: each section becomes either a template part
   (`template-parts/section-{n}.php`) or an ACF block. `CONFIG` becomes
   `wp_localize_script('greaton-app', 'GREATON_CONFIG', $cfg)` where
   `$cfg` is built from ACF fields.

---

## Decisions made so far

- **No external animation library** (no GSAP, no Lenis). Hand-rolled
  rAF loop with `lerp` smoothing is fast enough and avoids the WP
  enqueue overhead of another big script.
- **Single JS file, single CSS file.** Easier to enqueue in WP and
  faster to load than a build step. Will revisit if total size grows.
- **Inter as the only web font.** Geist (originally referenced) is not
  available on Google Fonts. Inter 800 with `letter-spacing: -0.045em`
  gives a similar tight-modern display feel.
- **No `mix-blend-mode: screen`** on text. Caused grey/transparent
  characters to disappear over dark video frames. Replaced with plain
  colors + per-character opacity control.
- **Scenes are JS-generated** from CONFIG, not hardcoded in HTML. WP
  migration friendly.
