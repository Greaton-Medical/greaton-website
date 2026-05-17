<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><?php wp_title('—', true, 'right'); ?><?php bloginfo('name'); ?></title>
  <link rel="icon" type="image/svg+xml" href="<?php echo get_template_directory_uri(); ?>/assets/icons/favicon.svg">
  <link rel="preload" as="video" type="video/mp4" href="<?php echo get_template_directory_uri(); ?>/assets/media/loading.mp4">
  <link rel="preload" as="video" type="video/mp4" href="<?php echo get_template_directory_uri(); ?>/assets/media/greaton.mp4">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>

  <div id="loading" aria-hidden="true">
    <video id="loading-video"
           src="<?php echo get_template_directory_uri(); ?>/assets/media/loading.mp4"
           muted playsinline autoplay preload="auto"></video>
  </div>

  <video id="bg-vid"
         src="<?php echo get_template_directory_uri(); ?>/assets/media/BG.mp4"
         muted playsinline autoplay loop preload="auto" aria-hidden="true"></video>

  <nav>
    <a class="nav-logo" href="<?php echo home_url('/'); ?>">
      <img class="logo-light" src="<?php echo get_template_directory_uri(); ?>/assets/icons/logo.svg"/>
      <img class="logo-dark"  src="<?php echo get_template_directory_uri(); ?>/assets/icons/logo-alt.svg"/>
    </a>
    <?php wp_nav_menu([
      'theme_location' => 'main-nav',
      'container'      => false,
      'menu_class'     => 'nav-links',
      'items_wrap'     => '<ul class="%2$s">%3$s</ul>',
      'fallback_cb'    => false,
    ]); ?>
    <?php
      $pid      = get_option('page_on_front');
      $cta_text = get_post_meta($pid, 'grt_nav_cta_text', true) ?: 'Request Marketing Review';
      $cta_url  = get_post_meta($pid, 'grt_nav_cta_url',  true) ?: '#';
    ?>
    <a href="<?php echo esc_url($cta_url); ?>" class="nav-cta"><?php echo esc_html($cta_text); ?></a>
    <button id="menu-toggle" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </nav>

  <div id="mobile-nav" aria-hidden="true">
    <div class="mobile-nav-links">
      <?php wp_nav_menu(['theme_location' => 'main-nav', 'container' => false, 'menu_class' => 'mobile-nav-ul', 'items_wrap' => '<ul class="%2$s">%3$s</ul>', 'fallback_cb' => false]); ?>
    </div>
    <?php
      $pid      = get_option('page_on_front');
      $cta_text = get_post_meta($pid, 'grt_nav_cta_text', true) ?: 'Request Marketing Review';
      $cta_url  = get_post_meta($pid, 'grt_nav_cta_url',  true) ?: '#';
    ?>
    <a href="<?php echo esc_url($cta_url); ?>" class="mobile-nav-cta cta-common"><?php echo esc_html($cta_text); ?></a>
  </div>
