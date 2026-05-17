  <footer id="site-footer">
    <div class="footer-inner">
      <a class="footer-logo" href="<?php echo home_url('/'); ?>">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/icons/greaton-footer.svg" alt="Greaton">
      </a>
      <div class="footer-cols">
        <div class="footer-col">
          <?php wp_nav_menu(['theme_location' => 'footer-col1', 'container' => false, 'menu_class' => '', 'items_wrap' => '<ul>%3$s</ul>', 'fallback_cb' => false]); ?>
        </div>
        <div class="footer-col">
          <?php wp_nav_menu(['theme_location' => 'footer-col2', 'container' => false, 'menu_class' => '', 'items_wrap' => '<ul>%3$s</ul>', 'fallback_cb' => false]); ?>
        </div>
        <div class="footer-col">
          <?php wp_nav_menu(['theme_location' => 'footer-col3', 'container' => false, 'menu_class' => '', 'items_wrap' => '<ul>%3$s</ul>', 'fallback_cb' => false]); ?>
        </div>
      </div>
      <div class="footer-social">
        <a href="https://www.facebook.com/GreatonMedicalAgency" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        </a>
        <a href="https://www.instagram.com/greatonmedical" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
        </a>
        <a href="https://www.linkedin.com/company/greatonmedical/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
        </a>
      </div>
      <div class="footer-copy">
        <span>&copy; <?php echo date('Y'); ?> Greaton, LLC. All rights reserved.</span>
        <span>Money-Back Guarantee Subject to Specific Terms and Conditions</span>
      </div>
    </div>
  </footer>

  <div id="cursor-glow"></div>

  <div id="dbg">
    <div>video: <span id="dbg-time">0.00</span>s</div>
    <div>scroll: <span id="dbg-scroll">0</span>px</div>
    <div>scene: <span id="dbg-scene">—</span></div>
    <div style="margin-top:6px; color: rgba(90,171,255,0.5); font-size:10px">press D to toggle</div>
  </div>

  <?php wp_footer(); ?>
</body>
</html>
