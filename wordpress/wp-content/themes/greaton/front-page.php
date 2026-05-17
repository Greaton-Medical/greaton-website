<?php get_header(); ?>

  <!-- SECTION 1 — Light hero with scaling video -->
  <section id="section-1" data-theme="light">
    <div id="s1-sticky">
      <div id="s1-content">
        <h1 id="s1-title"></h1>
        <p id="s1-sub"></p>
        <button id="s1-cta" class="s1-cta cta-common"></button>
      </div>
      <div id="s1-player">
        <video id="s1-vid"
               src="<?php echo get_template_directory_uri(); ?>/assets/media/intro-video.mp4"
               muted playsinline loop preload="auto"></video>
        <div id="s1-play-btn" aria-label="Play">&#9654;</div>
      </div>
    </div>
  </section>

  <!-- SECTION 2 — Results / charts -->
  <section id="section-2" data-theme="light">
    <div id="s2-sticky">
      <h2 id="s2-title"></h2>
      <div id="s2-main">
        <div id="s2-stack"></div>
        <div id="s2-panel-wrap"></div>
      </div>
      <div id="s2-logos"></div>
    </div>
  </section>

  <!-- SECTION — Scroll-scrubbed video -->
  <section id="video-section" data-theme="dark">
    <div id="sticky">
      <video id="vid"
             src="<?php echo get_template_directory_uri(); ?>/assets/media/greaton.mp4"
             muted playsinline preload="auto"></video>
      <div id="hero">
        <h2 id="hero-title"></h2>
        <p id="hero-sub"></p>
      </div>
      <div id="scenes" aria-hidden="true"></div>
    </div>
  </section>

  <!-- SECTION 4 — Stop Scroll -->
  <section id="section-4" data-theme="light">
    <div id="s4-sticky">
      <div id="s4-content">
        <h2 id="s4-title"></h2>
        <button id="s4-cta" class="cta-common"></button>
      </div>
      <div id="s4-popups" aria-hidden="true"></div>
    </div>
  </section>

  <!-- SECTION 5 — Curved video slider -->
  <section id="section-5" data-theme="light">
    <div id="s5-sticky">
      <h2 id="s5-title"></h2>
      <div id="s5-carousel">
        <div id="s5-track"></div>
        <div id="s5-pill">
          <button id="s5-prev" aria-label="Previous"><img src="<?php echo get_template_directory_uri(); ?>/assets/icons/left.svg" alt=""></button>
          <span id="s5-pill-label"></span>
          <button id="s5-next" aria-label="Next"><img src="<?php echo get_template_directory_uri(); ?>/assets/icons/right.svg" alt=""></button>
        </div>
      </div>
    </div>
  </section>

  <!-- SECTION 6 — Final CTA -->
  <section id="section-6" data-theme="light">
    <div id="s6-inner">
      <h2 id="s6-title"></h2>
      <div id="s6-left">
        <img id="s6-image"
             src="<?php echo get_template_directory_uri(); ?>/assets/images/doctor-last-section.webp"
             alt="Doctor consulting with a patient about their treatment plan"
             width="640" height="360" />
      </div>
      <div id="s6-right">
        <p id="s6-body"></p>
        <button id="s6-cta" class="cta-common"></button>
      </div>
    </div>
  </section>

<?php get_footer(); ?>
