<?php get_header(); ?>
  <script>
    document.body.classList.add('loaded');
    var _nav = document.querySelector('nav');
    if (_nav) _nav.setAttribute('data-theme', 'light');
  </script>

  <main class="page-content">
    <div class="page-content-inner">
      <?php if (have_posts()) : while (have_posts()) : the_post(); ?>
        <h1 class="page-title"><?php the_title(); ?></h1>
        <div class="page-body"><?php the_content(); ?></div>
      <?php endwhile; endif; ?>
    </div>
  </main>

  <script>
    var l = document.getElementById('loading');
    if (l) l.style.display = 'none';
  </script>

<?php get_footer(); ?>
