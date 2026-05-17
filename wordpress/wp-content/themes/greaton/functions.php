<?php

// ── Nav menus + widgets ───────────────────────────────────────────────────────
add_action('after_setup_theme', function() {
    register_nav_menus([
        'main-nav'    => 'Main Navigation',
        'footer-col1' => 'Footer Column 1',
        'footer-col2' => 'Footer Column 2 (Social)',
        'footer-col3' => 'Footer Column 3',
    ]);
});

// ── SVG support ───────────────────────────────────────────────────────────────
add_filter('upload_mimes', function($mimes) {
    $mimes['svg']  = 'image/svg+xml';
    $mimes['svgz'] = 'image/svg+xml';
    return $mimes;
});
add_filter('wp_check_filetype_and_ext', function($data, $file, $filename, $mimes) {
    if (substr($filename, -4) === '.svg') {
        $data['ext']  = 'svg';
        $data['type'] = 'image/svg+xml';
    }
    return $data;
}, 10, 4);

// ── Enqueue assets + pass content to JS ──────────────────────────────────────
function greaton_assets() {
    $tpath = get_template_directory();
    wp_enqueue_style('greaton-main', get_template_directory_uri() . '/assets/css/main.css', [], filemtime($tpath . '/assets/css/main.css'));
    wp_enqueue_script('greaton-main', get_template_directory_uri() . '/assets/js/main.js', [], filemtime($tpath . '/assets/js/main.js'), true);

    $tdir = get_template_directory_uri();
    $pid  = greaton_homepage_id();

    wp_localize_script('greaton-main', 'GREATON_CONFIG', [
        'templateUri' => $tdir,
        'media' => [
            'main' => get_post_meta($pid, 'grt_main_video', true) ?: $tdir . '/assets/media/greaton.mp4',
        ],
        'section1' => [
            'title'   => get_post_meta($pid, 'grt_s1_title',   true) ?: "Never wonder where\n the next patient\n comes from.",
            'sub'     => get_post_meta($pid, 'grt_s1_sub',     true) ?: '20+ booked consultations. Every month. Done for you.',
            'cta'     => get_post_meta($pid, 'grt_s1_cta',     true) ?: 'Request Marketing Review',
            'cta_url' => get_post_meta($pid, 'grt_s1_cta_url', true) ?: '#',
            'video'   => get_post_meta($pid, 'grt_s1_video',   true) ?: $tdir . '/assets/media/hero-video.mp4',
        ],
        'hero' => [
            'title' => get_post_meta($pid, 'grt_hero_title', true) ?: 'This is what changes.',
            'sub'   => get_post_meta($pid, 'grt_hero_sub',   true) ?: "You're spending on marketing. You're not sure what it brings back.",
        ],
        'section2' => [
            'headline'    => get_post_meta($pid, 'grt_s2_headline',  true) ?: "Month 3 results.\nOne practice.",
            'testimonial' => greaton_s2_testimonial($pid, $tdir),
            'logos'       => greaton_s2_logos($pid, $tdir),
        ],
        'section4' => [
            'cta'            => get_post_meta($pid, 'grt_s4_cta',            true) ?: 'The Greaton System',
            'cta_url'        => get_post_meta($pid, 'grt_s4_cta_url',        true) ?: '#',
            'headline_main'  => get_post_meta($pid, 'grt_s4_headline_main',  true) ?: "One system.\nEverything handled.",
            'headline_final' => get_post_meta($pid, 'grt_s4_headline_final', true) ?: "Everything connected.\nNothing wasted.",
            'card1'          => get_post_meta($pid, 'grt_s4_card1',          true) ?: 'Ads that bring patients in.',
            'card2'          => get_post_meta($pid, 'grt_s4_card2',          true) ?: 'SEO that compounds.',
            'card3'          => get_post_meta($pid, 'grt_s4_card3',          true) ?: 'A sales team that books consultations.',
            'card4'          => get_post_meta($pid, 'grt_s4_card4',          true) ?: "Tracking that shows what's working.",
        ],
        'section5' => [
            'headline' => get_post_meta($pid, 'grt_s5_headline', true) ?: "Your calendar fills with patients\n who chose you.",
            'slides'   => greaton_s5_slides($pid, $tdir),
        ],
        'nav_cta' => [
            'text' => get_post_meta($pid, 'grt_nav_cta_text', true) ?: 'Request Marketing Review',
            'url'  => get_post_meta($pid, 'grt_nav_cta_url',  true) ?: '#',
        ],
        'section6' => [
            'headline' => get_post_meta($pid, 'grt_s6_headline', true) ?: "See where your\nrevenue is bleeding.",
            'body'     => get_post_meta($pid, 'grt_s6_body',     true) ?: '20 minutes. We learn your goals and numbers first. Then you get a marketing review built around your practice. Not a template.',
            'cta'      => get_post_meta($pid, 'grt_s6_cta',      true) ?: 'Request Marketing Review',
            'cta_url'  => get_post_meta($pid, 'grt_s6_cta_url',  true) ?: '#',
            'image'    => get_post_meta($pid, 'grt_s6_image',    true) ?: $tdir . '/assets/images/doctor-last-section.webp',
        ],
        'scenes' => [
            'calendar'      => get_post_meta($pid, 'grt_scene_calendar',      true) ?: 'Your calendar fills.',
            'consultations' => get_post_meta($pid, 'grt_scene_consultations',  true) ?: "Consultations\nevery month.",
            'vanity'        => get_post_meta($pid, 'grt_scene_vanity',         true) ?: "You know what's\nworking.",
            'wasted'        => get_post_meta($pid, 'grt_scene_wasted',         true) ?: "Every dollar tracked.\nEvery patient traced.",
            'final_lines'   => get_post_meta($pid, 'grt_scene_final',          true) ?: "One system.|One team.|You focus on patients.",
        ],
    ]);
}
add_action('wp_enqueue_scripts', 'greaton_assets');

function greaton_homepage_id() {
    $id = get_option('page_on_front');
    return $id ?: 0;
}

function greaton_s5_slides($pid, $tdir) {
    $defaults = [
        ['label' => 'Plastic Surgery',       'src' => $tdir . '/assets/media/plastic-surgery.mp4'],
        ['label' => 'MedSpa',                'src' => $tdir . '/assets/media/medspa.mp4'],
        ['label' => 'Cosmetic Dentistry',    'src' => $tdir . '/assets/media/cosmetic-dentistry.mp4'],
        ['label' => 'Aesthetic Dermatology', 'src' => $tdir . '/assets/media/aesthetic-dermatology.mp4'],
        ['label' => 'Orthodontics',          'src' => $tdir . '/assets/media/orthodontics.mp4'],
        ['label' => 'Ophthalmology',         'src' => $tdir . '/assets/media/opthalmology.mp4'],
    ];
    $saved = get_post_meta($pid, 'grt_s5_slides', true);
    return $saved ?: $defaults;
}

function greaton_s2_testimonial($pid, $tdir) {
    return [
        'cardLogo' => get_post_meta($pid, 'grt_s2_card_logo',  true) ?: $tdir . '/assets/logos/sweetgrassplasticsurgery.png',
        'quote'    => get_post_meta($pid, 'grt_s2_quote',      true) ?: "They genuinely care about the success of every brand they work with, and it shows in the remarkable growth we\u2019ve experienced.",
        'author'   => get_post_meta($pid, 'grt_s2_author',     true) ?: 'Olivia Burgess',
        'role'     => get_post_meta($pid, 'grt_s2_role',       true) ?: "Marketing Director, Sweetgrass\n Plastic Surgery & Med Spa",
        'avatar'   => get_post_meta($pid, 'grt_s2_avatar',     true) ?: $tdir . '/assets/images/olivia.png',
    ];
}

function greaton_s2_logos($pid, $tdir) {
    $defaults = [
        ['name' => 'SeniorCareFinder',  'src' => $tdir . '/assets/logos/seniorcarefinder.png'],
        ['name' => 'SONY',              'src' => $tdir . '/assets/logos/sony.png'],
        ['name' => 'SweetGrass',        'src' => $tdir . '/assets/logos/sweetgrassplasticsurgery.png'],
        ['name' => 'Recording Academy', 'src' => $tdir . '/assets/logos/recordingacademy.png'],
        ['name' => 'Wright',            'src' => $tdir . '/assets/logos/wright.png'],
        ['name' => 'Rose & Arbor',      'src' => $tdir . '/assets/logos/rosearbor.png'],
    ];
    $saved = get_post_meta($pid, 'grt_s2_logos', true);
    return $saved ?: $defaults;
}

// ── Meta boxes ────────────────────────────────────────────────────────────────
function greaton_add_meta_boxes() {
    add_meta_box('grt-content', 'Greaton Content', 'grt_box_tabs', ['page'], 'normal', 'high');
}
add_action('add_meta_boxes', 'greaton_add_meta_boxes');

// ── Save meta ─────────────────────────────────────────────────────────────────
function greaton_save_meta($post_id) {
    if (!isset($_POST['grt_nonce']) || !wp_verify_nonce($_POST['grt_nonce'], 'grt_save_meta')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    $text_fields = [
        'grt_s1_title', 'grt_s1_sub', 'grt_s1_cta',
        'grt_hero_title', 'grt_hero_sub',
        'grt_s2_headline', 'grt_s2_quote', 'grt_s2_author', 'grt_s2_role',
        'grt_nav_cta_text',
        'grt_s4_cta', 'grt_s4_headline_main', 'grt_s4_headline_final',
        'grt_s4_card1', 'grt_s4_card2', 'grt_s4_card3', 'grt_s4_card4',
        'grt_s5_headline',
        'grt_s6_headline', 'grt_s6_body', 'grt_s6_cta',
        'grt_scene_calendar', 'grt_scene_consultations',
        'grt_scene_vanity', 'grt_scene_wasted', 'grt_scene_final',
    ];
    foreach ($text_fields as $field) {
        if (isset($_POST[$field])) {
            update_post_meta($post_id, $field, sanitize_textarea_field(wp_unslash($_POST[$field])));
        }
    }

    // URL fields (media picker output)
    $url_fields = [
        'grt_nav_cta_url', 'grt_s1_cta_url', 'grt_s4_cta_url', 'grt_s6_cta_url',
        'grt_main_video', 'grt_s1_video', 'grt_s6_image', 'grt_s2_card_logo', 'grt_s2_avatar',
    ];
    foreach ($url_fields as $field) {
        if (isset($_POST[$field])) {
            update_post_meta($post_id, $field, esc_url_raw(wp_unslash($_POST[$field])));
        }
    }

    // Slides (JSON)
    if (isset($_POST['grt_s5_slides'])) {
        $slides = json_decode(wp_unslash($_POST['grt_s5_slides']), true);
        if (is_array($slides)) {
            $clean = [];
            foreach ($slides as $slide) {
                $clean[] = [
                    'label' => sanitize_text_field($slide['label'] ?? ''),
                    'src'   => esc_url_raw($slide['src'] ?? ''),
                ];
            }
            update_post_meta($post_id, 'grt_s5_slides', $clean);
        }
    }

    // Client logos (JSON)
    if (isset($_POST['grt_s2_logos'])) {
        $logos = json_decode(wp_unslash($_POST['grt_s2_logos']), true);
        if (is_array($logos)) {
            $clean = [];
            foreach ($logos as $logo) {
                $clean[] = [
                    'name' => sanitize_text_field($logo['name'] ?? ''),
                    'src'  => esc_url_raw($logo['src'] ?? ''),
                ];
            }
            update_post_meta($post_id, 'grt_s2_logos', $clean);
        }
    }
}
add_action('save_post', 'greaton_save_meta');

// ── Enqueue media uploader in admin ──────────────────────────────────────────
function greaton_admin_scripts($hook) {
    if (!in_array($hook, ['post.php', 'post-new.php'])) return;
    wp_enqueue_media();
    wp_enqueue_style('grt-admin',  get_template_directory_uri() . '/assets/css/admin.css', [], '1.1');
    wp_enqueue_script('grt-admin', get_template_directory_uri() . '/assets/js/admin.js', ['jquery'], '1.1', true);
}
add_action('admin_enqueue_scripts', 'greaton_admin_scripts');

// ── Box renderers ─────────────────────────────────────────────────────────────
function grt_nonce_field() {
    wp_nonce_field('grt_save_meta', 'grt_nonce');
}

function grt_text($pid, $key, $label, $type = 'text') {
    $raw = get_post_meta($pid, $key, true);
    echo "<p><label><strong>{$label}</strong><br>";
    if ($type === 'textarea') {
        echo "<textarea name='{$key}' style='width:100%;height:80px'>" . esc_textarea($raw) . "</textarea>";
    } else {
        echo "<input type='text' name='{$key}' value='" . esc_attr($raw) . "' style='width:100%'>";
    }
    echo "</label></p>";
}

function grt_media($pid, $key, $label, $type = 'image') {
    $val  = esc_attr(get_post_meta($pid, $key, true));
    $mime = $type === 'video' ? 'video' : 'image';
    echo "<p><strong>{$label}</strong><br>";
    echo "<input type='text' name='{$key}' id='{$key}' value='{$val}' style='width:80%' placeholder='URL is filled automatically'>";
    echo "<button type='button' class='button grt-media-btn' data-target='{$key}' data-type='{$mime}' style='margin-left:6px'>Select</button>";
    if ($val) {
        if ($type === 'video') {
            echo "<br><video src='{$val}' style='max-width:240px;margin-top:6px' controls muted></video>";
        } else {
            echo "<br><img src='{$val}' style='max-width:240px;margin-top:6px'>";
        }
    }
    echo "</p>";
}

function grt_box_tabs($post) {
    grt_nonce_field();
    $tabs = [
        'videos'   => 'Global',
        'section1' => 'Section 1',
        'section2' => 'Section 2',
        'section3' => 'Section 3',
        'section4' => 'Section 4',
        'section5' => 'Section 5',
        'section6' => 'Section 6',
    ];
    echo '<div id="grt-tabs">';
    echo '<nav id="grt-tab-nav">';
    foreach ($tabs as $id => $label) {
        echo "<button type='button' class='grt-tab-btn' data-tab='{$id}'>{$label}</button>";
    }
    echo '</nav>';
    foreach ($tabs as $id => $label) {
        echo "<div class='grt-tab-panel' id='grt-tab-{$id}'>";
        call_user_func("grt_tab_{$id}", $post);
        echo '</div>';
    }
    echo '</div>';
}

function grt_tab_videos($post)   { grt_box_videos($post); }
function grt_tab_section1($post) { grt_box_section1($post); }
function grt_tab_section2($post) { grt_box_section2($post); echo '<hr style="margin:20px 0">'; grt_box_s2logos($post); }
function grt_tab_section3($post) { grt_box_hero($post); echo '<hr style="margin:20px 0">'; grt_box_scenes($post); }
function grt_tab_section4($post) { grt_box_section4($post); }
function grt_tab_section5($post) { grt_box_section5($post); }
function grt_tab_section6($post) { grt_box_section6($post); }

function grt_box_section1($post) {
    $tdir = get_template_directory_uri();
    if (!get_post_meta($post->ID, 'grt_s1_video', true)) {
        update_post_meta($post->ID, 'grt_s1_video', $tdir . '/assets/media/hero-video.mp4');
    }
    grt_text($post->ID,  'grt_s1_title', 'Headline (\\n = new line)', 'textarea');
    grt_text($post->ID,  'grt_s1_sub',   'Subheading');
    grt_text($post->ID,  'grt_s1_cta',     'CTA Button text');
    grt_text($post->ID,  'grt_s1_cta_url', 'CTA Button URL');
    grt_media($post->ID, 'grt_s1_video',   'Video', 'video');
}

function grt_box_hero($post) {
    grt_text($post->ID, 'grt_hero_title', 'Title (Enter = new line)', 'textarea');
    grt_text($post->ID, 'grt_hero_sub',   'Subheading', 'textarea');
}

function grt_box_scenes($post) {
    echo '<p style="color:#666;margin-bottom:12px">Press Enter for a new line in the overlay text.</p>';
    grt_text($post->ID, 'grt_scene_calendar',      'Calendar scene',      'textarea');
    grt_text($post->ID, 'grt_scene_consultations', 'Consultations scene', 'textarea');
    grt_text($post->ID, 'grt_scene_vanity',        'Vanity Metrics scene','textarea');
    grt_text($post->ID, 'grt_scene_wasted',        'Wasted Money scene',  'textarea');
    grt_text($post->ID, 'grt_scene_final',         'Final scene (separate lines with |)', 'textarea');
}

function grt_box_videos($post) {
    echo '<strong style="display:block;margin-bottom:4px">Nav CTA Button</strong>';
    grt_text($post->ID, 'grt_nav_cta_text', 'Button text');
    grt_text($post->ID, 'grt_nav_cta_url',  'Button URL');
    echo '<hr style="margin:16px 0"><strong style="display:block;margin-bottom:8px">Videos</strong>';
    $tdir = get_template_directory_uri();
    if (!get_post_meta($post->ID, 'grt_main_video', true)) {
        update_post_meta($post->ID, 'grt_main_video', $tdir . '/assets/media/greaton.mp4');
    }
    grt_media($post->ID, 'grt_main_video', 'Main scroll video', 'video');
}

function grt_box_section2($post) {
    grt_text($post->ID,  'grt_s2_headline',  'Headline', 'textarea');
    echo "<hr style='margin:12px 0'><strong>Testimonial</strong>";
    grt_media($post->ID, 'grt_s2_card_logo', 'Client logo', 'image');
    grt_text($post->ID,  'grt_s2_quote',     'Quote', 'textarea');
    grt_text($post->ID,  'grt_s2_author',    'Author name');
    grt_text($post->ID,  'grt_s2_role',      'Author role / company');
    grt_media($post->ID, 'grt_s2_avatar',    'Author photo', 'image');
}

function grt_box_s2logos($post) {
    $tdir   = get_template_directory_uri();
    $logos  = get_post_meta($post->ID, 'grt_s2_logos', true) ?: greaton_s2_logos($post->ID, $tdir);
    $json   = json_encode($logos);
    $attr   = esc_attr($json);
    echo "<p><strong>Client logos</strong></p>";
    echo "<div id='grt-logos-wrap'></div>";
    echo "<button type='button' class='button' id='grt-add-logo'>+ Add logo</button>";
    echo "<input type='hidden' name='grt_s2_logos' id='grt_s2_logos' value='{$attr}'>";
    echo "<script>window.GRT_LOGOS_INIT = {$json};</script>";
}

function grt_box_section4($post) {
    grt_text($post->ID, 'grt_s4_headline_main',  'Headline (states 1–3)', 'textarea');
    grt_text($post->ID, 'grt_s4_headline_final', 'Headline (state 4 — final)', 'textarea');
    grt_text($post->ID, 'grt_s4_cta',     'CTA Button text');
    grt_text($post->ID, 'grt_s4_cta_url', 'CTA Button URL');
    echo '<hr style="margin:12px 0"><strong>Popup card texts</strong>';
    grt_text($post->ID, 'grt_s4_card1', 'State 2 — card 1 (Ads)');
    grt_text($post->ID, 'grt_s4_card2', 'State 2 — card 2 (Search/SEO)');
    grt_text($post->ID, 'grt_s4_card3', 'State 3 — card 3 (Document/Sales)');
    grt_text($post->ID, 'grt_s4_card4', 'State 3 — card 4 (Growth/Tracking)');
}

function grt_box_section5($post) {
    grt_text($post->ID,  'grt_s5_headline', 'Headline', 'textarea');
    $tdir   = get_template_directory_uri();
    $slides = get_post_meta($post->ID, 'grt_s5_slides', true) ?: greaton_s5_slides($post->ID, $tdir);
    $json   = json_encode($slides);
    $attr   = esc_attr($json);
    echo "<p><strong>Slides (label + video)</strong></p>";
    echo "<div id='grt-slides-wrap'></div>";
    echo "<button type='button' class='button' id='grt-add-slide'>+ Add slide</button>";
    echo "<input type='hidden' name='grt_s5_slides' id='grt_s5_slides' value='{$attr}'>";
    echo "<script>window.GRT_SLIDES_INIT = {$json};</script>";
}

function grt_box_section6($post) {
    grt_text($post->ID,  'grt_s6_headline', 'Headline', 'textarea');
    grt_text($post->ID,  'grt_s6_body',     'Body text', 'textarea');
    grt_text($post->ID,  'grt_s6_cta',     'CTA Button text');
    grt_text($post->ID,  'grt_s6_cta_url', 'CTA Button URL');
    grt_media($post->ID, 'grt_s6_image',   'Doctor image', 'image');
}
