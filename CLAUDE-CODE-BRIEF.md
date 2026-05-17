# Brief for next Claude Code session

You are continuing work on a static prototype for the Greaton marketing
landing page. The page will eventually be ported to WordPress (most likely
ACF Pro flexible content blocks).

## What to do first

1. **Read `README.md`.** It has the full section map (5 sections),
   file layout, design system tokens, mental model of how the
   scroll-scrubbed video works, and the open TODO list.
2. **Read `designs/README.md`.** Every design comp is in the
   `designs/` folder, organized by section. The README there tells
   you which file is which, what's confirmed, and what's still
   ambiguous (especially section 5 — likely needs user clarification).
   Use the `view` tool on the PNGs whenever you need to verify
   layout, copy, color, or animation cues. They're your source of
   truth — never guess.
3. **Read `assets/js/main.js` — but only the `CONFIG` block at the top.**
   That's where 100% of editable content lives. Don't reflexively
   refactor the file; the structure underneath is intentional and
   working.
4. **Run locally with a Range-capable server** (`npx serve .`).
   Python's `http.server` won't work for video scrubbing.

## Current state

- **Section 3** (dark, scroll-scrubbed video, "This is what changes.")
  is built and visually validated against the comps. 5 text scenes
  (calendar, consultations, vanity, wasted, final) sync to video time.
- **Sections 1, 2, 4, 5** are not built yet. Designs exist.

## Definite things to ship next (in order)

1. **Progressive char fade** — see "Known issues" #1 in README. This
   is the one piece of section 3 that visually diverges from the comps:
   trailing chars should dim with position, controlled by a per-scene
   `fadeStrength` value. ~10 lines of change in `animateSceneChars()`.
   Do this BEFORE section 1 — it's a shared utility that section 1
   will also use.

2. **Light theme primitives**. Sections 1, 2, 4, 5 are all light.
   Add light-mode CSS variables (`--bg-light`, `--fg-light` etc.) and
   a parallel `STOPS_NORMAL_LIGHT` in `main.js` for the char reveal
   utility. The existing `splitChars` and per-char animation works
   unchanged — only the color stops differ.

3. **Section 1 — light hero with scaling video.** Pattern:
   - Standard hero layout (headline + subhead + CTA + thumbnail/player)
   - On scroll, the video player scales up from inline to ~full-bleed
     (similar to section 3's sticky scroll, but transforming scale
     instead of `video.currentTime`)
   - Same character reveal motif on the headline
     ("the n**ext** patient comes from.")

4. **Section 2** — results / charts.

5. **Section 4** — "Stop Scroll" pop-ups: floating icons (ADS,
   chart, magnifier) animate in around a static "Everything connected."
   / "One system. Everything handled." headline. Pinned scroll like
   section 3, but the variable is icon position/opacity instead of
   video time.

6. **Section 5** — final pitch.

## Things to NOT do

- **Don't add GSAP, Lenis, or any other animation lib.** The hand-rolled
  rAF + lerp loop is fast and avoids extra WP enqueue overhead. If
  something seems to need a library, ask first.
- **Don't change the font from Inter.** Geist was in the original
  template but isn't on Google Fonts. Self-hosting Geist is a future
  decision, not a today decision.
- **Don't touch `mix-blend-mode: screen`.** It used to be on `.scene`
  and caused mid-tone characters to disappear over dark video frames.
  Removed deliberately.
- **Don't pre-build the WP theme.** Keep working in static HTML/CSS/JS
  until all 5 sections look right and the design is locked. WordPress
  port is a separate phase.

## Architecture notes for the WordPress port (later, not now)

- `CONFIG` in `main.js` will be replaced by output of
  `wp_localize_script('greaton-app', 'GREATON_CONFIG', $cfg)` where
  `$cfg` is built from ACF fields.
- Each section becomes either a template part
  (`template-parts/section-{n}.php`) or an ACF block, depending on
  client editing needs.
- The media URLs (currently relative paths) become attachment URLs
  from `wp_get_attachment_url()`.
- The character-reveal utility, scroll loop, and scene state machine
  stay in JS unchanged — only their data source changes.

## How to communicate with the user

The user prefers concise, technical Serbian. They are technically
capable, prefer direct answers over hand-holding, and have specific
opinions about layout. When they say "fix this", fix THAT specific
thing and don't refactor the surrounding area unprompted.
