/* ============================================================
   GREATON — main.js
   Scroll-scrubbed video + scene state machine + loading flow.

   ALL editable content lives in the CONFIG block below.
   When porting to WordPress this whole block becomes the output
   of wp_localize_script() / ACF flexible content.
   ============================================================ */
(() => {
  "use strict";

  // Pull overrides from WordPress (wp_localize_script) or fall back to static paths
  const WP = (typeof GREATON_CONFIG !== 'undefined') ? GREATON_CONFIG : null;
  const tdir = WP ? WP.templateUri : '';
  const wpPath = (rel) => tdir ? tdir + '/' + rel : rel;

  // ============================================================
  // CONFIG — single source of truth
  // ============================================================
  const CONFIG = {

    // Video paths
    media: {
      loading: wpPath('assets/media/loading.mp4'),
      main:    WP?.media?.main ?? wpPath('assets/media/greaton.mp4'),
    },

    // Loading screen — minimum + maximum time it can stay up
    loading: {
      minMs: 350,      // never flash faster than this
      maxMs: 5000,     // safety: hide after this even if video stalls
    },

    // Hero — first view, controlled by CSS reveal (not scroll)
    hero: {
      title:      WP?.hero?.title ?? "This is what changes.",
      accent:     ["is"],
      sub:        WP?.hero?.sub   ?? "You're spending on marketing. You're not sure what it brings back.",
      fadeOutAt:  0.5,
      // 0 = all chars stay white, 1.3 = last char goes dark grey
      fadeStrength: 0.7,
    },

    // Each scene = a chunk of video time + a text overlay
    // videoIn  → time scene begins
    // videoPeak → time the text fully "lands" (held while scrolling)
    // videoOut → time scene ends, next begins
    // dwellPx  → how much vertical scroll the text holds before moving on
    scenes: [
      {
        id: "calendar",
        position: "mid-left",
        label: "Empty Patient Slots",
        headline: WP?.scenes?.calendar ?? "Your calendar fills.",
        accent: ["calendar"], // TODO: confirm — screenshot unclear if whole word or suffix is blue
        fadeStrength: 0.4,
        videoIn: 1.0, videoPeak: 1.5, videoOut: 2.2, dwellPx: 560,
      },
      {
        id: "consultations",
        position: "mid-left",
        label: "Inconsistent Patient Flow",
        headline: WP?.scenes?.consultations ?? "Consultations\nevery month.",
        accent: [],
        fadeStrength: 0.4,
        videoIn: 2.2, videoPeak: 3.2, videoOut: 3.5, dwellPx: 560,
      },
      {
        id: "vanity",
        position: "mid-left",
        label: "Vanity Metrics",
        headline: WP?.scenes?.vanity ?? "You know what's\nworking.",
        accent: ["what's"], // TODO: confirm accent
        fadeStrength: 0.4,
        videoIn: 3.5, videoPeak: 5.2, videoOut: 5.80, dwellPx: 560,
      },
      {
        id: "wasted",
        position: "mid-right",
        label: "Wasted Money",
        headline: WP?.scenes?.wasted ?? "Every dollar tracked.\nEvery patient traced.",
        accent: ["patient"], // TODO: confirm accent
        fadeStrength: 0.45,
        videoIn: 5.80, videoPeak: 6.7, videoOut: 7.20, dwellPx: 560,
      },
      {
        id: "final",
        position: "mid-center",
        label: null,
        // Special: rendered as three stacked lines, right-aligned within a fit-content block
        lines: (WP?.scenes?.final_lines ?? "One system.|One team.|You focus on patients.").split('|'),
        accent: ["system", "team", "focus"],
        fadeStrength: 0,
        videoIn: 7.20, videoPeak: 9.30, videoOut: 9.50, dwellPx: 840,
      },
    ],

    // How much page scroll = 1 second of video for the ramp/exit parts
    scrollPxPerSec: 320,

    // Pre-hero scroll padding (lets the hero breathe before scrubbing starts)
    heroLeadInPx: 1400,

    // Smoothing for scroll → video time (lower = smoother but laggier)
    scrubLerp: 0.028,

    // ── Section 4 — Stop Scroll (4 pinned states) ───────────────
    section4: {
      cta:     WP?.section4?.cta     ?? "The Greaton System",
      cta_url: WP?.section4?.cta_url ?? '#',
      scrollRunwayPx: 4800,
      states: [
        {
          headline: WP?.section4?.headline_main ?? "One system.\nEverything handled.",
          accent: ["system", "handled"],
          popups: [],
        },
        {
          headline: WP?.section4?.headline_main ?? "One system.\nEverything handled.",
          accent: ["system", "handled"],
          popups: [
            { type: "icon", src: wpPath("assets/icons/ads.png"),                                                            x: 0, y: 0 },
            { type: "card", src: wpPath("assets/icons/ads.png"),    text: WP?.section4?.card1 ?? "Ads that bring patients in.", x: 40, y: 10 },
            { type: "icon", src: wpPath("assets/icons/search.png"),                                                         x: 30, y: 48 },
            { type: "card", src: wpPath("assets/icons/search.png"), text: WP?.section4?.card2 ?? "SEO that compounds.",        x: 70, y: 60 },
          ],
        },
        {
          headline: WP?.section4?.headline_main ?? "One system.\nEverything handled.",
          accent: ["system", "handled"],
          popups: [
            { type: "icon", src: wpPath("assets/icons/document.png"),                                                                       x: -10, y: -15 },
            { type: "card", src: wpPath("assets/icons/document.png"), text: WP?.section4?.card3 ?? "A sales team that books consultations.", x: 30,  y: -6  },
            { type: "icon", src: wpPath("assets/icons/growth.png"),                                                                         x: 16,  y: 28  },
            { type: "card", src: wpPath("assets/icons/growth.png"),   text: WP?.section4?.card4 ?? "Tracking that shows what's working.",   x: 58,  y: 36  },
            { type: "icon", src: wpPath("assets/icons/ads.png"),      x: 58, y: 74 },
            { type: "icon", src: wpPath("assets/icons/search.png"),   x: 16, y: 74 },
          ],
        },
        {
          headline: WP?.section4?.headline_final ?? "Everything connected.\nNothing wasted.",
          accent: ["connected", "wasted"],
          popups: [
            { type: "bracket", src: wpPath("assets/icons/greaton-left.png"),  x: 0,  y: 0  },
            { type: "bracket", src: wpPath("assets/icons/greaton-right.png"), x: 84, y: 86 },
            { type: "icon",    src: wpPath("assets/icons/document.png"),      x: 10, y: 12 },
            { type: "icon",    src: wpPath("assets/icons/growth.png"),        x: 56, y: 12 },
            { type: "icon",    src: wpPath("assets/icons/ads.png"),           x: 10, y: 60 },
            { type: "icon",    src: wpPath("assets/icons/search.png"),        x: 56, y: 60 },
          ],
        },
      ],
    },

    // ── Section 5 — curved video slider ─────────────────────────
    section5: {
      headline:  WP?.section5?.headline ?? "Your calendar fills with patients\n who chose you.",
      accent:    ["patients"],
      activeIdx: 0,
      slides: WP?.section5?.slides ?? [
        { label: "Plastic Surgery",       src: wpPath("assets/media/plastic-surgery.mp4") },
        { label: "MedSpa",                src: wpPath("assets/media/medspa.mp4") },
        { label: "Cosmetic Dentistry",    src: wpPath("assets/media/cosmetic-dentistry.mp4") },
        { label: "Aesthetic Dermatology", src: wpPath("assets/media/aesthetic-dermatology.mp4") },
        { label: "Orthodontics",          src: wpPath("assets/media/orthodontics.mp4") },
        { label: "Ophthalmology",         src: wpPath("assets/media/opthalmology.mp4") },
      ],
      scrollRunwayPx: 2400,
    },

    // ── Section 6 — revenue bleeding ────────────────────────────
    section6: {
      headline: WP?.section6?.headline ?? "See where your\nrevenue is bleeding.",
      body:     WP?.section6?.body     ?? "20 minutes. We learn your goals and numbers first. Then you get a marketing review built around your practice. Not a template.",
      cta:      WP?.section6?.cta      ?? "Request Marketing Review",
      image:    "", // TODO: add doctor photo path
    },

    // ── Section 2 — results / charts (scroll-pinned card stack) ──
    section2: {
      headline: "Month 3 results.\nOne practice.",
      scrollRunwayPx: 4800,
      cards: [
        {
          type:       "chart",
          cardBg:     "#ffffff",
          chartLabel: "Revenue Growth",
          yAxis:      ["$10k","$8k","$6k","$4k","$2k","$0"],
          bars: [
            { label: "Mo 1", pct: 50 },
            { label: "Mo 2", pct: 45 },
            { label: "Mo 3", pct: 75 },
            { label: "Mo 4", pct: 95 },
          ],
          // right panel
          panel: "stats",
          stats: [
            { value: "$91,750", label: "Revenue Growth", lineColor: "#7ADAEF" },
            { value: "6.1x",   label: "ROI",            lineColor: "#9DA2FF" },
          ],
        },
        {
          type:   "hbars",
          cardBg: "#ede9f8",
          rows: [
            { label: "Paid Ads", pct: 75, count: "123 Booked", color: "#5aabff" },
            { label: "Organic",  pct: 84, count: "147 Booked", color: "#a78bfa" },
          ],
          // right panel
          panel: "breakdown",
          cols: [
            { head: "Paid Ads", stat: "123 booked", sub: "$48 CPA",                lineColor: "#7ADAEF" },
            { head: "Organic",  stat: "147 booked", sub: "21% growth in 3 months", lineColor: "#9DA2FF" },
          ],
        },
        {
          type:     "testimonial-card",
          cardBg:   "#e9f0fb",
          cardLogo: WP?.section2?.testimonial?.cardLogo ?? wpPath("assets/logos/sweetgrassplasticsurgery.png"),
          cardStats: [
            { label: "Revenue Growth", value: "$91,750", color: "#7ADAEF" },
            { label: "ROI",            value: "6.1x",    color: "#9DA2FF" },
            { label: "Paid Ads",       value: "123",     color: "#7ADAEF", suffix: "booked", sub: "$48 CPA" },
            { label: "Organic",        value: "147",     color: "#9DA2FF", suffix: "booked", sub: "21% growth in 3 months" },
          ],
          // right panel
          panel: "testimonial",
          quote:  WP?.section2?.testimonial?.quote  ?? "They genuinely care about the success of every brand they work with, and it shows in the remarkable growth we\u2019ve experienced.",
          author: WP?.section2?.testimonial?.author ?? "Olivia Burgess",
          role:   WP?.section2?.testimonial?.role   ?? "Marketing Director, Sweetgrass\n Plastic Surgery & Med Spa",
          avatar: WP?.section2?.testimonial?.avatar ?? wpPath("assets/images/olivia.png"),
        },
      ],
      logos: WP?.section2?.logos ?? [
        { name: "SeniorCareFinder",  src: wpPath("assets/logos/seniorcarefinder.png") },
        { name: "SONY",              src: wpPath("assets/logos/sony.png") },
        { name: "SweetGrass",        src: wpPath("assets/logos/sweetgrassplasticsurgery.png") },
        { name: "Recording Academy", src: wpPath("assets/logos/recordingacademy.png") },
        { name: "Wright",            src: wpPath("assets/logos/wright.png") },
        { name: "Rose & Arbor",      src: wpPath("assets/logos/rosearbor.png") },
      ],
    },

    // ── Section 1 — light hero ──────────────────────────────────
    section1: {
      title:        WP?.section1?.title ?? "Never wonder where\n the next patient\n comes from.",
      accent:       ["next"],
      sub:          WP?.section1?.sub   ?? "20+ booked consultations. Every month. Done for you.",
      cta:          WP?.section1?.cta   ?? "Request Marketing Review",
      fadeStrength: 0.5,
      video:        WP?.section1?.video ?? wpPath("assets/media/hero-video.mp4"),
      scrollRunwayPx: 2800,
      dwellPx:        1200,
    },

    // Per-character animation timings
    char: {
      sweepMs: 580,   // delay sweep from first char to last
      charMs:  240,   // time each char takes to reveal
      exitMs:  380,   // fade-out duration on scene exit
    },
  };

  // ============================================================
  // Utils
  // ============================================================
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const lerp  = (a, b, t) => a + (b - a) * t;

  // Sample a multi-stop color array at position t
  // stops: [{t, r, g, b, a}]
  function sampleStops(stops, t) {
    if (t <= stops[0].t) return stops[0];
    const last = stops[stops.length - 1];
    if (t >= last.t) return last;
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i], b = stops[i + 1];
      if (t >= a.t && t < b.t) {
        const u = (t - a.t) / (b.t - a.t);
        return {
          r: a.r + (b.r - a.r) * u,
          g: a.g + (b.g - a.g) * u,
          b: a.b + (b.b - a.b) * u,
          a: a.a + (b.a - a.a) * u,
        };
      }
    }
    return last;
  }
  const rgba = c => `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${c.a.toFixed(3)})`;

  // Per-character color stops (used during scene reveal)
  // localT controls how the sweep moves a character through phases:
  //   −0.2 = invisible blue, 0 = bright blue, 0.35 = white, 0.8 = mid grey, 1.6 = dark grey
  const STOPS_NORMAL = [
    { t: -0.2, r:  90, g: 171, b: 255, a: 0    },
    { t:  0,   r:  90, g: 171, b: 255, a: 0.85 },
    { t:  0.35,r: 255, g: 255, b: 255, a: 1    },
    { t:  0.8, r: 180, g: 180, b: 180, a: 1    },
    { t:  1.6, r:  90, g:  90, b:  90, a: 1    },
  ];
  const STOPS_ACCENT = [
    { t: -0.2, r: 90, g: 171, b: 255, a: 0    },
    { t:  0,   r: 90, g: 171, b: 255, a: 1    },
    { t:  0.35,r: 90, g: 171, b: 255, a: 1    },
    { t:  0.8, r: 90, g: 171, b: 255, a: 0.85 },
    { t:  1.6, r: 90, g: 171, b: 255, a: 0.7  },
  ];

  // Light-theme variants: sweep goes transparent-blue → blue → near-black → mid-grey
  const STOPS_NORMAL_LIGHT = [
    { t: -0.2, r:  90, g: 171, b: 255, a: 0    },
    { t:  0,   r:  90, g: 171, b: 255, a: 0.85 },
    { t:  0.35,r:  17, g:  17, b:  20, a: 1    },
    { t:  0.8, r:  80, g:  80, b:  88, a: 1    },
    { t:  1.6, r: 140, g: 140, b: 148, a: 1    },
  ];
  const STOPS_ACCENT_LIGHT = [
    { t: -0.2, r: 90, g: 171, b: 255, a: 0    },
    { t:  0,   r: 90, g: 171, b: 255, a: 1    },
    { t:  0.35,r: 90, g: 171, b: 255, a: 1    },
    { t:  0.8, r: 60, g: 140, b: 220, a: 0.9  },
    { t:  1.6, r: 40, g: 110, b: 190, a: 0.8  },
  ];

  // isLight = true → use light-theme stops (dark text on light bg)
  function charColor(localT, isAccent, isLight = false) {
    const stops = isLight
      ? (isAccent ? STOPS_ACCENT_LIGHT : STOPS_NORMAL_LIGHT)
      : (isAccent ? STOPS_ACCENT       : STOPS_NORMAL);
    return rgba(sampleStops(stops, localT));
  }

  // Split text into <span class="char"> nodes; marks accent words.
  // Accent matching uses WORD BOUNDARIES so "is" doesn't match inside "This".
  // Returns array of spans (with nulls for line breaks).
  function splitChars(el, text, accentWords = []) {
    el.innerHTML = "";
    const spans = [];
    [...text].forEach(ch => {
      if (ch === "\n") {
        el.appendChild(document.createElement("br"));
        spans.push(null);
        return;
      }
      const sp = document.createElement("span");
      sp.className = "char";
      sp.textContent = ch === " " ? "\u00a0" : ch;
      sp.style.color = "rgba(161,214,239,0)";
      el.appendChild(sp);
      spans.push(sp);
    });
    // mark accent ranges by WHOLE WORD only
    accentWords.forEach(word => {
      // Escape special regex chars in the word
      const esc = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`(?<![\\p{L}\\p{N}])${esc}(?![\\p{L}\\p{N}])`, "giu");
      let m;
      while ((m = re.exec(text)) !== null) {
        for (let j = m.index; j < m.index + m[0].length; j++) {
          if (spans[j]) spans[j].classList.add("accent");
        }
      }
    });
    return spans;
  }

  // ============================================================
  // DOM refs
  // ============================================================
  const dom = {
    loading:      $("#loading"),
    loadingVid:   $("#loading-video"),
    video:        $("#vid"),
    section:      $("#video-section"),
    sticky:       $("#sticky"),
    hero:         $("#hero"),
    heroTitle:    $("#hero-title"),
    heroSub:      $("#hero-sub"),
    scenesRoot:   $("#scenes"),
    bgLines:      $("#bg-lines"),
    glow:         $("#cursor-glow"),
    hint:         $("#hint"),
    dbg:          $("#dbg"),
    dbgTime:      $("#dbg-time"),
    dbgScroll:    $("#dbg-scroll"),
    dbgScene:     $("#dbg-scene"),
  };

  // ============================================================
  // Build scenes DOM dynamically from CONFIG (so WP can drive it)
  // ============================================================
  function buildSceneElements() {
    const frag = document.createDocumentFragment();

    CONFIG.scenes.forEach(scene => {
      const el = document.createElement("div");
      el.className = `scene ${scene.position}`;
      el.id = `scene-${scene.id}`;

      if (scene.label) {
        const lab = document.createElement("span");
        lab.className = "label";
        lab.textContent = scene.label;
        el.appendChild(lab);
        scene._labelEl = lab;
      }

      if (scene.lines) {
        // Multi-line final scene — each line is display:block, no <br> needed
        const wrap = document.createElement("span");
        wrap.className = "headline xl";
        scene._lineEls = scene.lines.map(text => {
          const line = document.createElement("span");
          line.className = "final-line";
          splitChars(line, text, scene.accent);
          wrap.appendChild(line);
          return line;
        });
        el.appendChild(wrap);
      } else {
        const hl = document.createElement("span");
        hl.className = "headline";
        splitChars(hl, scene.headline, scene.accent);
        el.appendChild(hl);
        scene._headlineEl = hl;
      }

      scene._el = el;
      scene._state = "idle";       // idle | entering | active | exiting
      scene._enterTime = 0;
      scene._exitTime  = 0;

      frag.appendChild(el);
    });

    dom.scenesRoot.appendChild(frag);
  }

  // ============================================================
  // Build scroll → video-time map
  // ============================================================
  let scrollMap = [];
  let totalScrollPx = 0;

  function buildScrollMap() {
    scrollMap = [];
    let cum = CONFIG.heroLeadInPx;
    CONFIG.scenes.forEach(scene => {
      const rampIn  = Math.round((scene.videoPeak - scene.videoIn)  * CONFIG.scrollPxPerSec);
      const rampOut = Math.round((scene.videoOut  - scene.videoPeak) * CONFIG.scrollPxPerSec);
      const seg = {
        scene,
        videoIn: scene.videoIn, videoPeak: scene.videoPeak, videoOut: scene.videoOut,
        scrollStart:      cum,
        scrollDwellStart: cum + rampIn,
        scrollDwellEnd:   cum + rampIn + scene.dwellPx,
        scrollEnd:        cum + rampIn + scene.dwellPx + rampOut,
      };
      cum = seg.scrollEnd;
      scrollMap.push(seg);
    });
    totalScrollPx = cum;
    return cum;
  }

  function scrollToVideoTime(scrolled) {
    if (scrolled < CONFIG.heroLeadInPx) return 0;
    for (const s of scrollMap) {
      if (scrolled <= s.scrollDwellStart) {
        const range = s.scrollDwellStart - s.scrollStart;
        const t = range > 0 ? (scrolled - s.scrollStart) / range : 1;
        return s.videoIn + (s.videoPeak - s.videoIn) * clamp(t, 0, 1);
      }
      if (scrolled <= s.scrollDwellEnd) return s.videoPeak;
      if (scrolled <= s.scrollEnd) {
        const range = s.scrollEnd - s.scrollDwellEnd;
        const t = range > 0 ? (scrolled - s.scrollDwellEnd) / range : 1;
        return s.videoPeak + (s.videoOut - s.videoPeak) * clamp(t, 0, 1);
      }
    }
    return scrollMap.length ? scrollMap[scrollMap.length - 1].videoOut : 0;
  }

  function updateSceneStates(vt) {
    const now = performance.now();
    CONFIG.scenes.forEach(scene => {
      const inRange = vt >= scene.videoIn && vt < scene.videoOut;
      const isPast  = vt >= scene.videoOut;
      if (inRange && scene._state === "idle") {
        scene._state = "entering"; scene._enterTime = now; showSceneUI(scene);
      } else if (isPast && (scene._state === "entering" || scene._state === "active")) {
        scene._state = "exiting"; scene._exitTime = now; hideSceneUI(scene);
      } else if (!inRange && !isPast && scene._state !== "idle") {
        scene._state = "idle"; hideSceneUI(scene); resetSceneChars(scene);
      }
    });
  }

  function showSceneUI(scene) {
    scene._el?.classList.add("active");
    if (scene._labelEl) setTimeout(() => scene._labelEl.classList.add("visible"), 50);
    if (scene._lineEls) {
      scene._lineEls.forEach((line, i) => {
        setTimeout(() => line.classList.add("visible"), 140 * i);
      });
    }
  }
  function hideSceneUI(scene) {
    scene._el?.classList.remove("active");
    if (scene._labelEl) scene._labelEl.classList.remove("visible");
    if (scene._lineEls) scene._lineEls.forEach(l => l.classList.remove("visible"));
  }
  function resetSceneChars(scene) {
    const root = scene._el;
    if (!root) return;
    root.querySelectorAll(".char").forEach(c => {
      c.style.color   = "rgba(161,214,239,0)";
      c.style.opacity = "1";
    });
  }

  // Per-frame: animate the chars inside each scene based on its state
  function animateSceneChars() {
    const now = performance.now();
    const { sweepMs, charMs, exitMs } = CONFIG.char;

    CONFIG.scenes.forEach(scene => {
      // Get the char container — either single headline OR all final lines flattened
      const charsContainer = scene._headlineEl
        ? scene._headlineEl
        : scene._el;  // for final scene we animate all chars under root

      if (!charsContainer) return;
      const chars = charsContainer.querySelectorAll(".char");
      const N = chars.length;
      if (!N) return;

      if (scene._state === "entering" || scene._state === "active") {
        const elapsed = now - scene._enterTime;
        chars.forEach((c, i) => {
          const delay     = (i / Math.max(N - 1, 1)) * sweepMs;
          const ct        = (elapsed - delay) / charMs;
          const positionT = i / Math.max(N - 1, 1);
          const maxLocalT = 0.35 + positionT * (scene.fadeStrength ?? 0.4);
          const localT    = clamp(ct * 0.55 - 0.2, -0.2, maxLocalT);
          // All scene chars use STOPS_NORMAL — hover glow is the only source of blue
          const animC = sampleStops(STOPS_NORMAL, localT);
          const rect  = c.getBoundingClientRect();
          const cx    = rect.left + rect.width  / 2;
          const cy    = rect.top  + rect.height / 2;
          const dx    = cx - _glowX;
          const dy    = cy - _glowY;
          const dist  = Math.sqrt(dx * dx + dy * dy);

          // Floating blue orb
          const odx  = cx - _orbX;
          const ody  = cy - _orbY;
          const odist = Math.sqrt(odx * odx + ody * ody);
          const orbT  = odist < ORB_R ? Math.pow(1 - odist / ORB_R, 1.8) : 0;

          if (dist < GLOW_R) {
            // Mouse proximity glow wins
            const t2 = Math.pow(1 - dist / GLOW_R, 1.5);
            const str = t2 * 0.65;
            c.style.color = rgba({
              r: lerp(animC.r, 97,  str),
              g: lerp(animC.g, 182, str),
              b: lerp(animC.b, 224, str),
              a: animC.a,
            });
            c.style.textShadow = `0px 0px ${Math.round(t2 * 20)}px rgba(161,214,239,${(t2 * 0.40).toFixed(2)})`;
          } else if (orbT > 0) {
            // Orb blue tint — subtle
            const str = orbT * 0.62;
            c.style.color = rgba({
              r: lerp(animC.r, 90,  str),
              g: lerp(animC.g, 171, str),
              b: lerp(animC.b, 255, str),
              a: animC.a,
            });
            c.style.textShadow = `0px 0px ${Math.round(orbT * 10)}px rgba(161,214,239,${(orbT * 0.28).toFixed(2)})`;
          } else {
            c.style.color = charColor(localT, false);
            if (c.style.textShadow) c.style.textShadow = "";
          }
          c.style.opacity = "1";
        });
        if (scene._state === "entering" && elapsed > sweepMs + charMs) {
          scene._state = "active";
        }
      } else if (scene._state === "exiting") {
        const elapsed  = now - scene._exitTime;
        const progress = clamp(elapsed / exitMs, 0, 1);
        const opacity  = 1 - progress * progress;
        chars.forEach(c => {
          c.style.opacity = opacity;
          if (c.style.textShadow) c.style.textShadow = "";
        });
        if (progress >= 1) {
          scene._state = "idle";
          chars.forEach(c => {
            c.style.color   = "rgba(161,214,239,0)";
            c.style.opacity = "1";
          });
        }
      }
    });
  }

  // ============================================================
  // Hero title — fade out when video passes hero zone
  // ============================================================
  function updateHero(vt) {
    if (!dom.hero) return;
    const out = vt >= CONFIG.hero.fadeOutAt;
    dom.hero.style.opacity = out ? "0" : "1";
  }

  // ============================================================
  // Video section — scroll position drives video time
  // ============================================================

  function initVideoSnap() {
    if (!dom.section || !dom.sticky) return;

    function setSectionHeight() {
      dom.section.style.height = (window.innerHeight + totalScrollPx) + "px";
    }
    setSectionHeight();
    window.addEventListener("resize", () => {
      buildScrollMap();
      setSectionHeight();
    }, { passive: true });
  }

  // ============================================================
  // Main rAF loop — drives video scrubbing + scene UI
  // ============================================================
  let smoothTime = 0;
  let lastFrame  = 0;
  let debugOn    = false;
  let _glowX        = -9999;   // updated by initMouseEffects, read by animateSceneChars
  let _glowY        = -9999;
  let _lanternStr   = 0;       // lerps 0→1 when mouse enters, 1→0 when it leaves
  const GLOW_R   = 55;      // proximity radius in px

  // Floating blue orb — autonomous, random-walks over scene text
  const ORB_R     = 280;
  let _orbX       = -9999;  // current position (lerped)
  let _orbY       = -9999;
  let _orbTX      = 0;      // target position
  let _orbTY      = 0;
  let _orbNextMs  = 0;      // when to pick next target

  function frame() {
    const now = performance.now();
    const dt  = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    _lanternStr += ((_glowX > -999 ? 1 : 0) - _lanternStr) * Math.min(1, dt * 3);

    // Orb random walk — targets any visible title/scene char
    if (now >= _orbNextMs) {
      const allChars = [...document.querySelectorAll(GLOW_SEL + ", .scene.active .char")];
      const visibleChars = allChars.filter(c => {
        const r = c.getBoundingClientRect();
        return r.top >= 0 && r.bottom <= window.innerHeight && r.width > 0;
      });
      const pool = visibleChars.length ? visibleChars : allChars;
      if (pool.length) {
        const pick = pool[Math.floor(Math.random() * pool.length)];
        const pr   = pick.getBoundingClientRect();
        _orbTX = pr.left + pr.width  / 2;
        _orbTY = pr.top  + pr.height / 2;
      } else {
        _orbTX = window.innerWidth  * (0.2 + Math.random() * 0.6);
        _orbTY = window.innerHeight * (0.2 + Math.random() * 0.6);
      }
      _orbNextMs = now + 3000 + Math.random() * 2000;
    }
    if (_orbX < -999) { _orbX = _orbTX; _orbY = _orbTY; }
    const orbSpeed = Math.min(1, dt * 0.38);
    _orbX += (_orbTX - _orbX) * orbSpeed;
    _orbY += (_orbTY - _orbY) * orbSpeed;


    const sectionTop = dom.section.getBoundingClientRect().top + window.scrollY;
    const scrolled   = Math.max(0, window.scrollY - sectionTop);
    const target     = scrollToVideoTime(scrolled);
    const duration   = dom.video.duration || 9.5;

    smoothTime += (target - smoothTime) * Math.min(1, dt * CONFIG.scrubLerp * 60);
    if (Math.abs(smoothTime - target) < 0.001) smoothTime = target;
    smoothTime  = clamp(smoothTime, 0, duration);

    if (dom.video.readyState >= 2) {
      try { dom.video.currentTime = smoothTime; } catch (_) {}
    }

    // Use smoothTime (not dom.video.currentTime) to avoid video-seeking
    // imprecision that causes oscillation at exact scene boundaries (e.g. 2.2s)
    updateSceneStates(smoothTime);
    animateSceneChars();
    applyProximityGlow();
    updateHero(smoothTime);

    if (scrolled > 80) dom.hint?.classList.add("hidden");
    else               dom.hint?.classList.remove("hidden");

    updateSection1();
    updateSection2();
    updateSection4();
    updateSection5();

    if (debugOn) {
      dom.dbgTime.textContent   = smoothTime.toFixed(2);
      dom.dbgScroll.textContent = Math.round(scrolled);
      const active = CONFIG.scenes.find(s => smoothTime >= s.videoIn && smoothTime < s.videoOut);
      dom.dbgScene.textContent  = active ? active.id : (smoothTime < CONFIG.hero.fadeOutAt ? "hero" : "—");
    }

    requestAnimationFrame(frame);
  }

  // ============================================================
  // Proximity glow + orb on all title chars (module-level so frame() can call it)
  // ============================================================
  const GLOW_SEL = "#s1-title .char, #s2-title .char, #hero-title .char, #s4-title .char, #s5-title .char, #s6-title .char";

  function applyProximityGlow() {
    document.querySelectorAll(GLOW_SEL).forEach(c => {
      if (c._origColor === undefined) {
        c._origColor = c.style.color;
        c._isLight   = c.closest("[data-theme]")?.dataset.theme === "light";
      }
      const r    = c.getBoundingClientRect();
      const cx   = r.left + r.width  / 2;
      const cy   = r.top  + r.height / 2;
      const dx   = cx - _glowX;
      const dy   = cy - _glowY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const odx  = cx - _orbX;
      const ody  = cy - _orbY;
      const orbT = Math.sqrt(odx*odx+ody*ody) < ORB_R
        ? Math.pow(1 - Math.sqrt(odx*odx+ody*ody) / ORB_R, 1.8) : 0;

      if (dist < GLOW_R) {
        const t2  = Math.pow(1 - dist / GLOW_R, 2);
        const [gr, gg, gb] = [90, 171, 255];
        const [or, og, ob] = c._isLight ? [13, 13, 20] : [255, 255, 255];
        const str = t2 * 0.90;
        const sA  = (t2 * (c._isLight ? 0.70 : 0.60)).toFixed(2);
        const bl  = Math.round(t2 * 32);
        c.style.color = `rgba(${Math.round(lerp(or,gr,str))},${Math.round(lerp(og,gg,str))},${Math.round(lerp(ob,gb,str))},1)`;
        c.style.textShadow = `0px 0px ${bl}px rgba(${gr},${gg},${gb},${sA})`;
      } else if (orbT > 0) {
        const [or, og, ob] = c._isLight ? [13, 13, 20] : [255, 255, 255];
        const str = orbT * 0.85;
        c.style.color = `rgba(${Math.round(lerp(or,90,str))},${Math.round(lerp(og,171,str))},${Math.round(lerp(ob,255,str))},1)`;
        c.style.textShadow = `0px 0px ${Math.round(orbT*10)}px rgba(161,214,239,${(orbT*0.28).toFixed(2)})`;
      } else {
        if (c.style.textShadow) c.style.textShadow = "";
        if (c.style.color !== c._origColor) c.style.color = c._origColor;
      }
    });
  }

  // ============================================================
  // Mouse interactions — hero cursor glow, bg-lines parallax,
  // hero title gradient shift on cursor X, proximity char glow
  // ============================================================
  function initMouseEffects() {
    if (!window.matchMedia("(hover: hover)").matches) return;

    let mx = window.innerWidth  / .1;
    let my = window.innerHeight / .1;
    let pending = false;

    let targetShift = 0, currentShift = 0;

    // Scene chars handled inside animateSceneChars() via module-level _glowX/_glowY

    function apply() {
      pending = false;
      // bg-lines parallax
      if (dom.bgLines) {
        const nx = (mx / window.innerWidth  - 0.5) * 1.2;
        const ny = (my / window.innerHeight - 0.5) * 1.2;
        dom.bgLines.style.transform =
          `translate(${(nx * -12).toFixed(1)}px, ${(ny * -10).toFixed(1)}px)`;
      }
      // cursor glow
      if (dom.glow) {
        dom.glow.style.left = mx + "px";
        dom.glow.style.top  = my + "px";
      }
      applyProximityGlow();
    }

    document.addEventListener("mousemove", e => {
      mx = e.clientX; my = e.clientY;
      _glowX = e.clientX; _glowY = e.clientY;
      dom.glow?.classList.add("active");
      if (dom.heroTitle) {
        const r = dom.heroTitle.getBoundingClientRect();
        const x = clamp((e.clientX - r.left) / r.width, 0, 1);
        targetShift = (x - 0.5) * 20;
      }
      if (!pending) {
        pending = true;
        requestAnimationFrame(apply);
      }
    }, { passive: true });

    document.addEventListener("mouseleave", () => {
      dom.glow?.classList.remove("active");
      _glowX = -9999; _glowY = -9999;
      document.querySelectorAll(GLOW_SEL).forEach(c => {
        c.style.textShadow = "";
        if (c._origColor !== undefined) c.style.color = c._origColor;
      });
    });
    document.addEventListener("mouseenter", () => dom.glow?.classList.add("active"));

    (function loop() {
      currentShift += (targetShift - currentShift) * 0.08;
      if (dom.heroTitle) {
        dom.heroTitle.style.setProperty("--shift", currentShift.toFixed(2) + "%");
      }
      requestAnimationFrame(loop);
    })();
  }

  // ============================================================
  // Section 1 — light hero with scroll-driven player scale
  // ============================================================
  function _s1PlayerBounds(progress) {
    const player  = document.getElementById("s1-player");
    const content = document.getElementById("s1-content");
    if (!player) return;
    const ease = 1 - Math.pow(1 - clamp(progress, 0, 1), 2.5);
    const vh   = window.innerHeight;
    const vw   = window.innerWidth;

    // Text fades + slides up fast — gone before player reaches it
    if (content) {
      const ty = Math.round(lerp(0, -vh * 0.12, ease));
      const op = Math.max(0, 1 - progress * 4);
      content.style.transform = `translateY(${ty}px)`;
      content.style.opacity   = op;
    }

    // Video expands: top 68vh→22vh, bottom 3vh→0, sides in
    const topPx   = Math.round(lerp(vh * 0.68, vh * 0.22, ease));
    const botPx   = Math.round(lerp(vh * 0.03, 0, ease));
    const maxW    = 1800;
    const minSide = Math.max(0, Math.round((vw - maxW) / 2));
    const side    = Math.round(lerp(vw * 0.175, minSide, ease));
    const radius  = lerp(14, 8, ease);

    player.style.top          = topPx + "px";
    player.style.bottom       = botPx + "px";
    player.style.left         = side + "px";
    player.style.right        = side + "px";
    player.style.borderRadius = radius + "px";
  }

  // ── Section 4 ────────────────────────────────────────────────
  let _s4StateIdx = -1;
  let _s4Exiting  = false;

  function initSection4() {
    const sec = document.getElementById("section-4");
    const cta = document.getElementById("s4-cta");
    if (!sec) return;
    const cfg = CONFIG.section4;

    sec.style.height = (window.innerHeight + cfg.scrollRunwayPx) + "px";
    if (cta) cta.textContent = cfg.cta;

    // Paint first state immediately
    const title = document.getElementById("s4-title");
    if (title) {
      splitChars(title, cfg.states[0].headline, cfg.states[0].accent);
      _s4PaintTitle(title);
    }

    window.addEventListener("resize", () => {
      sec.style.height = (window.innerHeight + cfg.scrollRunwayPx) + "px";
    }, { passive: true });
  }

  function _s4PaintTitle(title) {
    title.querySelectorAll(".char").forEach(sp => { sp.style.color = "rgba(13,13,20,1)"; });
  }

  function _s4BuildPopup(p, delay) {
    const el = document.createElement("div");
    el.style.cssText = `position:absolute; left:${p.x}%; top:${p.y}%; opacity:0; transform:translateY(10px); transition:opacity 0.5s var(--ease-out) ${delay}ms, transform 0.55s var(--ease-out) ${delay}ms; pointer-events:none;`;

    if (p.type === "bracket") {
      el.className = "s4-popup-bracket";
      const img = document.createElement("img");
      img.src = p.src; img.alt = "";
      el.appendChild(img);
    } else if (p.type === "icon") {
      el.className = "s4-popup-icon";
      const img = document.createElement("img");
      img.src = p.src; img.alt = "";
      el.appendChild(img);
    } else {
      el.className = "s4-popup-card";
      el.innerHTML = `<span>${p.text}</span>`;
    }
    return el;
  }

  function _s4ShowPopups(stateIdx) {
    const container = document.getElementById("s4-popups");
    if (!container) return;
    const state = CONFIG.section4.states[stateIdx];

    // Fade out + slide up existing
    const existing = Array.from(container.children);
    existing.forEach(el => {
      el.style.opacity = "0";
      el.style.transform = "translateY(-8px)";
    });

    const doInsert = () => {
      container.innerHTML = "";
      state.popups.forEach((p, i) => {
        const el = _s4BuildPopup(p, i * 80);
        container.appendChild(el);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }));
      });
      _s4Exiting = false;
    };

    if (existing.length > 0) {
      _s4Exiting = true;
      setTimeout(doInsert, 300);
    } else {
      doInsert();
    }
  }

  function updateSection4() {
    const sec = document.getElementById("section-4");
    if (!sec) return;
    const cfg      = CONFIG.section4;
    const secTop   = sec.getBoundingClientRect().top + window.scrollY;
    const scrolled = Math.max(0, window.scrollY - secTop);
    const total    = cfg.states.length;
    // Lead-in: first slot is reserved so state 0 stays active on entry
    const leadIn   = cfg.scrollRunwayPx / (total + 1);
    const progress = clamp(Math.max(0, scrolled - leadIn) / (cfg.scrollRunwayPx - leadIn), 0, 1);
    const stateIdx = Math.min(Math.floor(progress * total), total - 1);

    if (stateIdx === _s4StateIdx || _s4Exiting) return;
    _s4StateIdx = stateIdx;

    const state = cfg.states[stateIdx];
    const title = document.getElementById("s4-title");
    if (title) {
      splitChars(title, state.headline, state.accent);
      _s4PaintTitle(title);
    }
    _s4ShowPopups(stateIdx);
  }

  // ── Section 5 — curved video slider ─────────────────────────
  let s5ActiveIdx = 0;

  function s5Layout() {
    const slides = document.querySelectorAll(".s5-slide");
    const pill   = document.getElementById("s5-pill-label");
    const total  = slides.length;
    const gapPx  = window.innerWidth * 0.37;
    const arcPx  = 90;

    slides.forEach((slide, i) => {
      // Compute shortest circular distance for infinite feel
      let offset = i - s5ActiveIdx;
      if (offset > total / 2)  offset -= total;
      if (offset < -total / 2) offset += total;

      const abs  = Math.abs(offset);
      const tx   = offset * gapPx;
      const ty   = offset * offset * arcPx;            // parabolic arc — center highest, sides drop down
      const rot  = offset * 18;                        // 2D tilt like design
      const sc   = abs === 0 ? 1 : abs === 1 ? 0.84 : 0.70;
      // Only 3 visible: center full, ±1 at 38%, beyond invisible
      const op   = abs === 0 ? 1 : abs === 1 ? 0.38 : 0;

      slide.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${rot}deg) scale(${sc})`;
      slide.style.opacity   = String(op);
      slide.style.zIndex    = String(total - abs);
      slide.classList.toggle("active", i === s5ActiveIdx);

      // Per-card edge fade: outer half transparent → inner half opaque
      if (abs === 0) {
        slide.style.webkitMaskImage = "";
        slide.style.maskImage       = "";
      } else {
        const dir = offset > 0 ? "to left" : "to right";
        const mask = `linear-gradient(${dir}, transparent 0%, black 50%)`;
        slide.style.webkitMaskImage = mask;
        slide.style.maskImage       = mask;
      }

      const vid = slide.querySelector("video");
      if (vid) {
        if (i === s5ActiveIdx) vid.play().catch(() => {});
        else { vid.pause(); vid.currentTime = 0; }
      }
    });

    const cfg = CONFIG.section5;
    if (pill) pill.textContent = cfg.slides[s5ActiveIdx]?.label ?? "";
  }

  function initSection5() {
    const sec   = document.getElementById("section-5");
    const title = document.getElementById("s5-title");
    const track = document.getElementById("s5-track");
    const prev  = document.getElementById("s5-prev");
    const next  = document.getElementById("s5-next");
    if (!sec) return;

    const cfg = CONFIG.section5;
    s5ActiveIdx = cfg.activeIdx ?? 0;

    function setHeight() {
      sec.style.height = (window.innerHeight + cfg.scrollRunwayPx) + "px";
    }
    setHeight();
    window.addEventListener("resize", setHeight, { passive: true });

    if (title) {
      splitChars(title, cfg.headline, cfg.accent).filter(Boolean).forEach(sp => {
        sp.style.color = "rgba(13,13,20,1)";
      });
    }

    if (track) {
      cfg.slides.forEach((slide, i) => {
        const el = document.createElement("div");
        el.className = "s5-slide";
        el.innerHTML = `<video src="${slide.src}" muted playsinline loop preload="metadata"></video>`;
        el.addEventListener("click", () => { if (i !== s5ActiveIdx) { s5ActiveIdx = i; s5Layout(); } });
        track.appendChild(el);
      });
      s5Layout();
    }

    const total = cfg.slides.length;
    if (prev) prev.addEventListener("click", () => { s5ActiveIdx = (s5ActiveIdx - 1 + total) % total; s5Layout(); });
    if (next) next.addEventListener("click", () => { s5ActiveIdx = (s5ActiveIdx + 1) % total; s5Layout(); });

    window.addEventListener("resize", () => { s5Layout(); }, { passive: true });

    // ── Drag (mouse + touch) ──────────────────────────────────
    let _dragStart = null;
    const DRAG_THRESHOLD = 20;

    track.addEventListener("mousedown", e => {
      _dragStart = e.clientX;
      e.preventDefault();
    });
    track.addEventListener("touchstart", e => {
      _dragStart = e.touches[0].clientX;
    }, { passive: true });

    const onDragEnd = endX => {
      if (_dragStart === null) return;
      const delta = endX - _dragStart;
      _dragStart = null;
      if (Math.abs(delta) < DRAG_THRESHOLD) return;
      const t = cfg.slides.length;
      s5ActiveIdx = delta < 0
        ? (s5ActiveIdx + 1) % t
        : (s5ActiveIdx - 1 + t) % t;
      s5Layout();
    };
    window.addEventListener("mouseup",  e => onDragEnd(e.clientX));
    window.addEventListener("touchend", e => onDragEnd(e.changedTouches[0].clientX), { passive: true });
  }

  function updateSection5() {
    // Section 5 is now a natural-height section — no scroll expansion
  }

  // ── Section 6 ────────────────────────────────────────────────
  function initSection6() {
    const sec   = document.getElementById("section-6");
    const title = document.getElementById("s6-title");
    const body  = document.getElementById("s6-body");
    const cta   = document.getElementById("s6-cta");
    if (!sec) return;
    const cfg = CONFIG.section6;

    if (title) {
      splitChars(title, cfg.headline, cfg.accent).filter(Boolean).forEach(sp => {
        sp.style.color = sp.classList.contains("accent")
          ? "var(--blue)"
          : "rgba(13,13,20,1)";
      });
    }
    if (body) body.textContent = cfg.body;
    if (cta)  cta.textContent  = cfg.cta;
  }

  function initSection2() {
    const sec      = document.getElementById("section-2");
    const title    = document.getElementById("s2-title");
    const stack    = document.getElementById("s2-stack");
    const panelWrap = document.getElementById("s2-panel-wrap");
    const logos    = document.getElementById("s2-logos");
    if (!sec) return;
    const cfg = CONFIG.section2;

    sec.style.height = (window.innerHeight + cfg.scrollRunwayPx) + "px";
    window.addEventListener("resize", () => {
      sec.style.height = (window.innerHeight + cfg.scrollRunwayPx) + "px";
    }, { passive: true });

    if (title) {
      const spans = splitChars(title, cfg.headline, cfg.accent);
      spans.filter(Boolean).forEach(sp => {
        sp.style.color = sp.classList.contains("accent")
          ? "var(--blue)"
          : "rgba(13,13,20,1)";
      });
    }

    if (stack) {
      cfg.cards.forEach((card, idx) => {
        const el = document.createElement("div");
        el.className = "s2-card" + (idx === 0 ? " active" : "");
        el.dataset.idx = String(idx);
        el.style.background = card.cardBg || "#fff";

        if (card.type === "chart") {
          el.innerHTML = `
            <span class="s2-chart-label">${card.chartLabel}</span>
            <div class="s2-chart-body">
              <div class="s2-yaxis">
                ${card.yAxis.map(l => `<span>${l}</span>`).join("")}
              </div>
              <div class="s2-bars-wrap">
                <div class="s2-grid-lines">
                  ${card.yAxis.map(() => "<span></span>").join("")}
                </div>
                <div class="s2-bars">
                  ${card.bars.map((b, i) => `<div class="s2-bar-col" style="--delay:${i * 0.08}s">
                    <div class="s2-bar-track"><div class="s2-bar" style="--pct:${b.pct}%"></div></div>
                    <span class="s2-bar-label">${b.label}</span>
                  </div>`).join("")}
                </div>
              </div>
            </div>`;

        } else if (card.type === "hbars") {
          el.innerHTML = `
            <div class="s2-hbars">
              ${card.rows.map((r, i) => `
                <div class="s2-hbar-group" style="--delay:${i * 0.15}s">
                  <div class="s2-hbar-label">${r.label}</div>
                  <div class="s2-hbar-row">
                    <div class="s2-hbar-track">
                      <div class="s2-hbar-fill" style="--pct:${r.pct}%; background:${r.color}"></div>
                    </div>
                    <span class="s2-hbar-count">${r.count}</span>
                  </div>
                </div>`).join("")}
            </div>`;

        } else if (card.type === "testimonial-card") {
          el.innerHTML = `
            <img class="s2-tcard-logo" src="${card.cardLogo}" alt="SweetGrass">
            <div class="s2-stats-grid">
              ${card.cardStats.map(s => `
                <div class="s2-sg-item">
                  <span class="s2-sg-label">${s.label}</span>
                  <div class="s2-sg-value-row">
                    <span class="s2-sg-value" style="color:${s.color}">${s.value}</span>
                    ${s.suffix ? `<span class="s2-sg-suffix" style="color:${s.color}">${s.suffix}</span>` : ""}
                  </div>
                  ${s.sub ? `<span class="s2-sg-sub">${s.sub}</span>` : ""}
                </div>`).join("")}
            </div>`;
        }

        stack.appendChild(el);
      });
    }

    if (panelWrap) {
      cfg.cards.forEach((card, idx) => {
        const el = document.createElement("div");
        el.className = "s2-panel" + (idx === 0 ? " active" : "");
        el.dataset.idx = String(idx);

        if (card.panel === "stats") {
          el.innerHTML = `
            <div class="s2-bigstats">
              ${card.stats.map(s => `
                <div class="s2-stat-col">
                  <span class="s2-bigval">${s.value}</span>
                  <div class="s2-bigdivider" style="background:${s.lineColor}"></div>
                  <span class="s2-biglab">${s.label}</span>
                </div>`).join("")}
            </div>`;

        } else if (card.panel === "breakdown") {
          el.innerHTML = `
            <div class="s2-cols">
              ${card.cols.map(c => `
                <div class="s2-col">
                  <span class="s2-col-head">${c.head}</span>
                  <div class="s2-bigdivider" style="background:${c.lineColor}"></div>
                  <span class="s2-col-stat">${c.stat}</span>
                  <span class="s2-col-sub">${c.sub}</span>
                </div>`).join("")}
            </div>`;

        } else if (card.panel === "testimonial") {
          const initials = card.author.split(" ").map(w => w[0]).join("");
          el.innerHTML = `
            <blockquote class="s2-quote">\u201C${card.quote}\u201D</blockquote>
            <div class="s2-author-row">
              <div class="s2-avatar" aria-hidden="true">
                ${card.avatar ? `<img src="${card.avatar}" alt="${card.author}">` : `<span>${initials}</span>`}
              </div>
              <div class="s2-author-info">
                <span class="s2-author-name">${card.author}</span>
                <span class="s2-author-role">${card.role}</span>
              </div>
            </div>`;
        }

        panelWrap.appendChild(el);
      });
    }

    if (logos) {
      cfg.logos.forEach(logo => {
        const badge = document.createElement("div");
        badge.className = "s2-logo-badge";
        const img = document.createElement("img");
        img.src = logo.src;
        img.alt = logo.name;
        badge.appendChild(img);
        logos.appendChild(badge);
      });
    }

  }

  let _s2ActiveIdx = 0;

  function updateSection2() {
    const sec = document.getElementById("section-2");
    if (!sec) return;
    const cfg      = CONFIG.section2;
    const secTop   = sec.getBoundingClientRect().top + window.scrollY;
    const scrolled = Math.max(0, window.scrollY - secTop);
    const total    = cfg.cards.length;
    // Lead-in: first slot is reserved so card 0 stays active on entry
    const leadIn   = cfg.scrollRunwayPx / (total + 1);
    const progress = clamp(Math.max(0, scrolled - leadIn) / (cfg.scrollRunwayPx - leadIn), 0, 1);
    const activeIdx = Math.min(Math.floor(progress * total), total - 1);

    if (activeIdx === _s2ActiveIdx) return;
    _s2ActiveIdx = activeIdx;

    // Stacked cards — each gets a position in the deck relative to active
    document.querySelectorAll(".s2-card").forEach((card, i) => {
      const pos = (i - activeIdx + total) % total;
      card.classList.toggle("active",     pos === 0);
      card.classList.toggle("s2-behind1", pos === 1);
      card.classList.toggle("s2-behind2", pos >= 2);
    });

    // Right panels — simple cross-fade
    document.querySelectorAll(".s2-panel").forEach((panel, i) => {
      panel.classList.toggle("active", i === activeIdx);
    });
  }

  function initSection1() {
    const sec    = document.getElementById("section-1");
    const title  = document.getElementById("s1-title");
    const sub    = document.getElementById("s1-sub");
    const ctaEl  = document.getElementById("s1-cta");
    const vid    = document.getElementById("s1-vid");
    const player = document.getElementById("s1-player");

    if (!sec) return;
    const cfg = CONFIG.section1;

    // Char reveal — light theme static paint
    if (title) {
      const spans   = splitChars(title, cfg.title, cfg.accent);
      const visible = spans.filter(Boolean);
      visible.forEach(sp => { sp.style.color = "rgba(13,13,20,1)"; });
    }
    if (sub)   sub.textContent   = cfg.sub;
    if (ctaEl) ctaEl.textContent = cfg.cta;

    // ── Mobile: static layout, simple play/pause only ──────────
    if (window.innerWidth <= 640) {
      sec._s1Mobile = true;

      if (vid) {
        vid.addEventListener("play", () => {
          const btn = document.getElementById("s1-play-btn");
          if (btn) { btn.textContent = "⏸"; btn.classList.remove("hidden"); }
        });
        vid.addEventListener("pause", () => {
          const btn = document.getElementById("s1-play-btn");
          if (btn) { btn.textContent = "▶"; btn.classList.remove("hidden"); }
        });
      }

      if (player) {
        player.addEventListener("click", () => {
          if (!vid) return;
          vid.paused ? vid.play().catch(() => {}) : vid.pause();
        });

        // Pause when scrolled out of view
        new IntersectionObserver(entries => {
          entries.forEach(e => {
            if (!e.isIntersecting && vid && !vid.paused) vid.pause();
          });
        }, { threshold: 0.1 }).observe(player);
      }

      return; // skip desktop scroll init
    }

    // ── Desktop: scroll-scrubbed expand animation ───────────────
    function s1Animate(from, to, dur, onDone) {
      const start = performance.now();
      (function tick(now) {
        const t     = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const val   = from + (to - from) * eased;
        sec._s1ClickProgress = val;
        _s1PlayerBounds(val);
        if (t < 1) requestAnimationFrame(tick);
        else if (onDone) onDone();
      })(performance.now());
    }

    function s1ExpandAndPlay() {
      const v = document.getElementById("s1-vid");
      if (!v) return;
      if (!sec._s1ClickExpanded) {
        sec._s1ClickExpanded = true;
        sec._s1Played = true;
        s1Animate(0, 1, 650);
        v.play().catch(() => {});
      } else if (!v.paused) {
        v.pause();
        sec._s1ClickExpanded = false;
        sec._s1Played = false;
        s1Animate(1, 0, 550, () => { sec._s1ClickProgress = 0; });
      } else {
        v.play().catch(() => {});
        sec._s1ClickExpanded = true;
      }
    }

    if (vid) {
      vid.addEventListener("play",  () => {
        const btn = document.getElementById("s1-play-btn");
        if (btn) { btn.textContent = "⏸"; btn.classList.remove("hidden"); }
        sec._s1Played = true;
      });
      vid.addEventListener("pause", () => {
        const btn = document.getElementById("s1-play-btn");
        if (btn) { btn.textContent = "▶"; btn.classList.remove("hidden"); }
      });
    }
    if (player) player.addEventListener("click", s1ExpandAndPlay);

    if (player) {
      new IntersectionObserver(entries => {
        entries.forEach(e => {
          const v = document.getElementById("s1-vid");
          if (!v || !sec._s1Played) return;
          if (!e.isIntersecting) v.pause();
          else if (v.paused)     v.play().catch(() => {});
        });
      }, { threshold: 0.1 }).observe(player);
    }

    sec._s1Play = function() {
      const v = document.getElementById("s1-vid");
      if (v && v.paused) v.play().catch(() => {});
    };

    function setHeight() {
      sec.style.height = (window.innerHeight + cfg.scrollRunwayPx + (cfg.dwellPx || 0)) + "px";
    }
    setHeight();
    window.addEventListener("resize", setHeight, { passive: true });
    _s1PlayerBounds(0);
  }

  function updateSection1() {
    const sec = document.getElementById("section-1");
    if (!sec) return;
    if (sec._s1Mobile) return; // mobile: no scroll update

    const secTop      = sec.getBoundingClientRect().top + window.scrollY;
    const scrolled    = Math.max(0, window.scrollY - secTop);
    const scrollProg  = clamp(scrolled / CONFIG.section1.scrollRunwayPx, 0, 1);
    const progress    = Math.max(scrollProg, sec._s1ClickProgress || 0);
    _s1PlayerBounds(progress);

    const v = document.getElementById("s1-vid");
    if (!v) return;

    if (progress <= 0) {
      if (!v.paused) v.pause();
    } else if (v.paused && sec._s1Played) {
      v.play().catch(() => {});
    } else if (sec._s1Play) {
      sec._s1Play();
      sec._s1Play = null;
    }
  }

  // ============================================================
  // Nav theme — intersection observer watches [data-theme] sections.
  // To use: add data-theme="light" or data-theme="dark" to any <section>.
  // The nav automatically adopts the theme of the most visible section.
  // ============================================================
  function initNavTheme() {
    const nav = document.querySelector("nav");
    if (!nav) return;
    const sections = Array.from(document.querySelectorAll("[data-theme]"));
    if (!sections.length) return;

    const ratios = new Map(sections.map(s => [s, 0]));

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => ratios.set(e.target, e.intersectionRatio));
      let best = sections[0];
      ratios.forEach((r, s) => { if (r > ratios.get(best)) best = s; });
      nav.dataset.theme = best.dataset.theme ?? "dark";
    }, { threshold: Array.from({ length: 11 }, (_, i) => i * 0.1) });

    sections.forEach(s => observer.observe(s));
    nav.dataset.theme = sections[0].dataset.theme ?? "dark";
  }

  // ============================================================
  // Hero init — split title chars, paint static state
  // ============================================================
  function initHero() {
    if (!dom.heroTitle) return;
    const spans = splitChars(dom.heroTitle, CONFIG.hero.title, CONFIG.hero.accent);
    const visible = spans.filter(Boolean);
    visible.forEach((sp, i) => {
      sp.style.setProperty("--d", `${i * 40}ms`);
      sp.style.color = "rgba(255,255,255,0.95)";
    });

    if (dom.heroSub) dom.heroSub.textContent = CONFIG.hero.sub;
  }

  // ============================================================
  // Loading screen flow
  // ============================================================
  function runLoadingSequence(onDone) {
    const start = performance.now();
    let finished = false;

    function finish() {
      if (finished) return;
      finished = true;

      const elapsed = performance.now() - start;
      const wait = Math.max(0, CONFIG.loading.minMs - elapsed);

      setTimeout(() => {
        dom.loading.classList.add("out");
        document.body.classList.add("loaded");
        setTimeout(() => dom.loading?.remove(), 1000);
        onDone();
      }, wait);
    }

    // Try to play loading video
    const lv = dom.loadingVid;
    if (lv) {
      lv.playbackRate = 2.0;
      lv.addEventListener("ended", finish, { once: true });
      // some browsers throw on autoplay — start silently then catch
      const p = lv.play();
      if (p && p.catch) p.catch(() => finish());
    } else {
      finish();
    }

    // Safety timeout
    setTimeout(finish, CONFIG.loading.maxMs);
  }

  // ============================================================
  // Section entrance animations — staggered fade+slide on entry
  // ============================================================
  function initSectionEntrances() {
    // Groups: elements in the same group stagger in sequence
    const groups = [
      ["#s2-title"],
      ["#s2-stack", "#s2-panel-wrap"],
      ["#s2-logos"],
      ["#hero"],
      ["#s4-content"],
      ["#s5-title"],
      ["#s5-carousel"],
      ["#s6-title"],
      ["#s6-left", "#s6-right"],
      [".footer-inner"],
    ];

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("s-visible");
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    groups.forEach(group => {
      group.forEach((sel, i) => {
        const el = document.querySelector(sel);
        if (!el) return;
        el.classList.add("s-enter");
        el.style.transitionDelay = `${i * 120}ms`;
        observer.observe(el);
      });
    });
  }


  // ============================================================
  // Boot
  // ============================================================
  function initMobileMenu() {
    const toggle    = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    if (!toggle || !mobileNav) return;

    function openMenu() {
      toggle.classList.add('open');
      mobileNav.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      mobileNav.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      toggle.classList.remove('open');
      mobileNav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () => {
      toggle.classList.contains('open') ? closeMenu() : openMenu();
    });

    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeMenu);
    });
  }

  function initNavScroll() {
    const textMap = {
      'about': '#video-section',
    };

    function scrollTo(target) {
      target.scrollIntoView({ behavior: 'smooth' });
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    document.querySelectorAll('.nav-links a, .mobile-nav-ul li a').forEach(a => {
      const label = a.textContent.trim().toLowerCase();
      const mappedId = textMap[label];
      if (mappedId) {
        const target = document.querySelector(mappedId);
        if (target) {
          a.addEventListener('click', e => { e.preventDefault(); scrollTo(target); });
          return;
        }
      }
      const hash = a.hash;
      if (!hash) return;
      const target = document.querySelector(hash);
      if (!target) return;
      a.addEventListener('click', e => { e.preventDefault(); scrollTo(target); });
    });
  }

  function wireCtaButtons() {
    [
      { id: 's1-cta', url: WP?.section1?.cta_url },
      { id: 's4-cta', url: WP?.section4?.cta_url },
      { id: 's6-cta', url: WP?.section6?.cta_url },
    ].forEach(({ id, url }) => {
      if (!url || url === '#') return;
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', () => window.location.href = url);
    });
  }

  function boot() {
    buildSceneElements();
    initSection2();
    initSection1();
    initSection4();
    initSection5();
    initSection6();
    initHero();
    initNavTheme();
    initMouseEffects();
    initSectionEntrances();
    wireCtaButtons();
    initNavScroll();
    initMobileMenu();

    buildScrollMap();
    initVideoSnap();

    lastFrame = performance.now();
    requestAnimationFrame(frame);

    function onVideoReady() {
      smoothTime = 0;
      try { dom.video.currentTime = 0; } catch (_) {}
    }
    if (dom.video.readyState >= 2) onVideoReady();
    else {
      dom.video.addEventListener("loadedmetadata", onVideoReady, { once: true });
      dom.video.addEventListener("canplay",        onVideoReady, { once: true });
    }


    document.addEventListener("keydown", e => {
      if (e.key.toLowerCase() === "d") {
        debugOn = !debugOn;
        dom.dbg.classList.toggle("on", debugOn);
      }
    });
  }

  // ============================================================
  // Kickoff
  // ============================================================
  // We start the loading sequence immediately, and boot the rest in parallel.
  // Main video preloads while loading.mp4 plays — by the time loading ends,
  // the main video is usually ready to scrub smoothly.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      runLoadingSequence(boot);
    });
  } else {
    runLoadingSequence(boot);
  }

})();
