jQuery(function ($) {

  // ── Tabs — init when meta box is in the DOM ───────────────────────────────
  function initTabs() {
    var $nav = $('#grt-tab-nav');
    if (!$nav.length) return false;

    var $btns   = $nav.find('.grt-tab-btn');
    var $panels = $('.grt-tab-panel');
    var saved   = sessionStorage.getItem('grt_active_tab');
    var first   = $btns.first().data('tab');
    var initial = (saved && $('#grt-tab-' + saved).length) ? saved : first;

    function activateTab(id) {
      $btns.removeClass('grt-active').filter('[data-tab="' + id + '"]').addClass('grt-active');
      $panels.removeClass('grt-active').filter('#grt-tab-' + id).addClass('grt-active');
      sessionStorage.setItem('grt_active_tab', id);
    }

    $btns.on('click', function () { activateTab($(this).data('tab')); });
    activateTab(initial);
    return true;
  }

  if (!initTabs()) {
    var observer = new MutationObserver(function () {
      if (initTabs()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ── Media picker buttons ──────────────────────────────────────────────────
  $(document).on('click', '.grt-media-btn', function () {
    var target = $(this).data('target');
    var type   = $(this).data('type'); // 'image' or 'video'
    var frame  = wp.media({
      title:    type === 'video' ? 'Select video' : 'Select image',
      button:   { text: 'Use this' },
      library:  { type: type },
      multiple: false,
    });
    frame.on('select', function () {
      var att = frame.state().get('selection').first().toJSON();
      var url = att.url;
      $('#' + target).val(url);
      // update preview
      var $preview = $('#' + target).siblings('video,img');
      if ($preview.length) {
        $preview.attr('src', url);
      } else {
        if (type === 'video') {
          $('#' + target).after('<br><video src="' + url + '" style="max-width:240px;margin-top:6px" controls muted></video>');
        } else {
          $('#' + target).after('<br><img src="' + url + '" style="max-width:240px;margin-top:6px">');
        }
      }
    });
    frame.open();
  });

  // ── Section 5 slides builder ──────────────────────────────────────────────
  var slides = (typeof window.GRT_SLIDES_INIT !== 'undefined') ? window.GRT_SLIDES_INIT : [];

  function renderSlides() {
    var $wrap = $('#grt-slides-wrap');
    $wrap.empty();
    slides.forEach(function (slide, i) {
      var row = $('<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">');
      row.append('<span style="min-width:20px;color:#999">' + (i + 1) + '.</span>');
      var labelInput = $('<input type="text" placeholder="Label (e.g. Plastic Surgery)" style="width:200px">').val(slide.label);
      labelInput.on('input', function () { slides[i].label = $(this).val(); syncSlides(); });
      row.append(labelInput);
      var srcInput = $('<input type="text" placeholder="Video URL" style="flex:1">').val(slide.src);
      srcInput.on('input', function () { slides[i].src = $(this).val(); syncSlides(); });
      row.append(srcInput);
      var pickBtn = $('<button type="button" class="button">Select video</button>');
      pickBtn.on('click', function () {
        var frame = wp.media({ title: 'Select video', button: { text: 'Use this' }, library: { type: 'video' }, multiple: false });
        frame.on('select', function () {
          var url = frame.state().get('selection').first().toJSON().url;
          srcInput.val(url);
          slides[i].src = url;
          syncSlides();
        });
        frame.open();
      });
      row.append(pickBtn);
      var delBtn = $('<button type="button" class="button" style="color:#a00">✕</button>');
      delBtn.on('click', function () { slides.splice(i, 1); renderSlides(); });
      row.append(delBtn);
      $wrap.append(row);
    });
    syncSlides();
  }

  function syncSlides() {
    $('#grt_s5_slides').val(JSON.stringify(slides));
  }

  $('#grt-add-slide').on('click', function () {
    slides.push({ label: '', src: '' });
    renderSlides();
  });

  if ($('#grt-slides-wrap').length) renderSlides();

  // ── Client logos builder ──────────────────────────────────────────────────
  var logos = (typeof window.GRT_LOGOS_INIT !== 'undefined') ? window.GRT_LOGOS_INIT : [];

  function renderLogos() {
    var $wrap = $('#grt-logos-wrap');
    $wrap.empty();
    logos.forEach(function (logo, i) {
      var row = $('<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">');
      row.append('<span style="min-width:20px;color:#999">' + (i + 1) + '.</span>');
      var nameInput = $('<input type="text" placeholder="Name (e.g. SONY)" style="width:180px">').val(logo.name);
      nameInput.on('input', function () { logos[i].name = $(this).val(); syncLogos(); });
      row.append(nameInput);
      var srcInput = $('<input type="text" placeholder="Image URL" style="flex:1">').val(logo.src);
      srcInput.on('input', function () { logos[i].src = $(this).val(); syncLogos(); });
      row.append(srcInput);
      if (logo.src) row.append('<img src="' + logo.src + '" style="height:32px;object-fit:contain;background:#f0f0f0;padding:2px">');
      var pickBtn = $('<button type="button" class="button">Select image</button>');
      pickBtn.on('click', function () {
        var frame = wp.media({ title: 'Select logo', button: { text: 'Use this' }, library: { type: 'image' }, multiple: false });
        frame.on('select', function () {
          var url = frame.state().get('selection').first().toJSON().url;
          srcInput.val(url);
          logos[i].src = url;
          syncLogos();
          renderLogos();
        });
        frame.open();
      });
      row.append(pickBtn);
      var delBtn = $('<button type="button" class="button" style="color:#a00">✕</button>');
      delBtn.on('click', function () { logos.splice(i, 1); renderLogos(); });
      row.append(delBtn);
      $wrap.append(row);
    });
    syncLogos();
  }

  function syncLogos() {
    $('#grt_s2_logos').val(JSON.stringify(logos));
  }

  $('#grt-add-logo').on('click', function () {
    logos.push({ name: '', src: '' });
    renderLogos();
  });

  if ($('#grt-logos-wrap').length) renderLogos();
});
