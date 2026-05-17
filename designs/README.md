# Design references

All design comps for the Greaton landing page, organized by section.
Reference these files directly (open with the `view` tool) whenever you
need to check layout, color, typography, copy, or animation cues.

**Important uncertainty:** the section count and grouping below is what
the user roughly described, but some files may belong to a different
section than we guessed. **Confirm with the user before building if any
section feels ambiguous** — especially section 5.

---

## Section 1 — Hero with scaling video (LIGHT theme)

The first thing the visitor sees. Light cyan/white background with
subtle wave linework. Large headline + subhead + CTA + inline video
thumbnail. On scroll, the video thumbnail scales up toward full-bleed
and starts playing.

- `section-1/01-hero-default.png` — initial state. Headline: *"Never wonder where the n**ext** patient comes from."* Subhead: *"20+ booked consultations. Every month. Done for you."* CTA: *"Request Marketing Review"*. Video thumbnail (doctors) sits below.
- `section-1/02-hero-video-playing.png` — scroll state. Video has scaled up to ~full-bleed and started playing. Headline is now smaller and partially behind the player.

**Note:** the per-character accent treatment ("n**ext**" in blue, rest
in tightening grey) is the same motif used in section 3 — reuse
`splitChars` from `main.js`.

**Need from user:** the actual hero video file (the doctors footage).
Dummy is acceptable to start.

---

## Section 2 — Results / charts (LIGHT theme)

Stat / results section. Headline: *"Month 3 results. One practice."*
with bar and line charts showing growth.

- `section-2/01-results-thumbnails.png` — multiple thumbnails of the same section. Pick the cleanest one as the source of truth, or ask the user which version is canonical.

**Need from user:** confirmation of which thumbnail is the final
design. Also: actual numbers / data for the charts (or use placeholder
data with note in code).

---

## Section 3 — Dark cinematic video (DARK theme) — ✅ BUILT

This is the one already in code. Don't rebuild it. Reference these
files only if you're verifying behavior or making polish changes.

- `section-3/01-hero-state.png` — hero before scrolling: *"This is what changes."*
- `section-3/02-this-is-what-changes.png` — same hero, full state, with subhead
- `section-3/03-transition.png` — mid-scrub transition (no text overlay)
- `section-3/04-calendar-fills.png` — scene 1: *"Empty Patient Slots — Your **calendar** fills."*
- `section-3/05-consultations.png` — scene 2: *"Inconsistent Patient Flow — Consultations every month."*
- `section-3/06-vanity-metrics.png` — scene 3: *"Vanity Metrics — You know **what's** working."*
- `section-3/07-wasted-money.png` — scene 4: *"Wasted Money — Every dollar tracked. Every **patient** traced."*
- `section-3/08-final-one-system.png` — scene 5: *"One **system**. One **team**. You **focus** on patients."* (top-left position, right-aligned)
- `section-3/all-states-strip.png` — overview strip of all 8 states in sequence

**Visual diff vs. current build:** the comps show a clear right-side
fade on every headline (e.g. "chang**es.**", "fill**s.**", "patient**s.**").
The current code clamps every char at full white. README → Known
issues #1 has the ~10-line fix to add `fadeStrength` per scene.

---

## Section 4 — "Stop Scroll" pop-ups (LIGHT theme)

Scroll pinning section where icons (ADS, search, charts) animate in
around a static headline. Multiple variants shown in one file.

- `section-4/01-stop-scroll-variants.png` — four states side by side:
  - State 1: *"Everything connected. Nothing wasted."* with ADS / chart / search icons floating
  - State 2: *"One system. Everything handled."* with same icons in different positions
  - State 3 & 4: continuation states with different icon arrangements

**Need from user:** confirm whether these four panels are (a) a scroll
sequence within ONE pinned section, (b) two separate sections, or (c)
design alternatives to pick between.

---

## Section 5 — Final pitch (LIGHT theme)

Two distinct designs were uploaded — could be two sub-sections of
section 5, two separate sections (so the site is actually 6 sections),
or alternatives the user is choosing between.

- `section-5/01-calendar-fills-variants.png` — *"Your calendar fills with patients who chose you."* shown with calendar mockups, multiple thumbnail variants
- `section-5/02-revenue-bleeding.png` — *"See where your revenue is bleeding."* dashboard mockup

**Need from user:** which of these is section 5, or are they both
shipping as separate sections?

---

## When designs and copy conflict

If a screenshot shows text different from what's in `CONFIG` in
`main.js`, the **screenshot wins** unless the user says otherwise.
Update `CONFIG` to match.
