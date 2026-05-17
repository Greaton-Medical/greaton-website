<?php
function greaton_assets() {
    wp_enqueue_style('greaton-main', get_template_directory_uri() . '/assets/css/main.css', [], '1.0');
    wp_enqueue_script('greaton-main', get_template_directory_uri() . '/assets/js/main.js', [], '1.0', true);
}
add_action('wp_enqueue_scripts', 'greaton_assets');
