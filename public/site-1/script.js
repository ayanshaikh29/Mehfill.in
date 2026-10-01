/* Cinematic Nikah invitation — video intro · YouTube nasheed · EN/UR */
(function () {
  'use strict';

  var WEDDING_DATE = new Date('2026-08-31T10:30:00');
  var SLOW_RATE = 1;          // original video speed (no slow-motion)
  var NAMES_AT = 3.7;           // video-seconds: doors fully open ≈2.2s, +1.5s ≈ 3.7s

  var cine = document.getElementById('cine');
  var openBtn = document.getElementById('open-btn');
  var enterBtn = document.getElementById('enter-btn');
  var namesLayer = document.getElementById('cine-names');
  var video = document.getElementById('journey');
  var main = document.getElementById('main-content');
  var musicToggle = document.getElementById('music-toggle');
  var musicIcon = document.getElementById('music-icon');

  var phase = 'invite'; // invite → journey → names → entered
  var fallbackTimer = null;
  var endFallbackTimer = null;
  var lang = 'en';

  document.body.classList.add('no-scroll');

  /* ================= LANGUAGE ================= */
  var STR = {
    en: {
      cdSoon: "✨ It's almost time — see you very soon!",
      cdOne: '💍 Only 1 day to go!',
      cdMany: function (d) { return 'Only ' + d + ' days of waiting left…'; },
      cdDone: '💕 Just Married! Thank you for celebrating with us.',
      needName: 'Please enter your full name. 💕',
      needAttend: 'Please tell us if you will attend. ✨',
      needGuests: 'Guests must be at least 1.',
      thanksYes: function (n, g) { return '🎉 Thank you, ' + n + '! See you on Aug 31 (+' + g + ').'; },
      thanksNo: function (n) { return '💌 Thank you, ' + n + '! You will be missed.'; },
      musicLoading: '🎵 Nasheed loading… tap again in a moment.',
      musicPlaying: '🎵 Wedding Nasheed playing…',
      musicFallback: '⚠️ Nasheed blocked here — playing backup melody.',
      scratchYes: '💝 You revealed our date — 31 August 2026!'
    },
    ur: {
      cdSoon: '✨ بس تھوڑا انتظار — جلد ملاقات ہوگی!',
      cdOne: '💍 بس ایک دن باقی!',
      cdMany: function (d) { return 'صرف ' + d + ' دن باقی…'; },
      cdDone: '💕 نکاح مبارک! شرکت کا شکریہ۔',
      needName: 'براہ کرم اپنا نام لکھیں۔ 💕',
      needAttend: 'براہ کرم بتائیں کیا آپ آئیں گے؟ ✨',
      needGuests: 'مہمان کم از کم ایک ہونا چاہیے۔',
      thanksYes: function (n, g) { return '🎉 شکریہ، ' + n + '! 31 اگست کو ملاقات ہوگی (+' + g + ')۔'; },
      thanksNo: function (n) { return '💌 شکریہ، ' + n + '! آپ کی کمی محسوس ہوگی۔'; },
      musicLoading: '🎵 نعت لوڈ ہو رہی ہے… تھوڑی دیر میں دوبارہ دبائیں۔',
      musicPlaying: '🎵 نعت چل رہی ہے…',
      musicFallback: '⚠️ نعت یہاں نہیں چل سکی — متبادل دھن بج رہی ہے۔',
      scratchYes: '💝 آپ نے تاریخ دیکھ لی — 31 اگست 2026!'
    }
  };

  function applyLang(l) {
    lang = l;
    var btns = document.querySelectorAll('#lang-toggle button');
    for (var b = 0; b < btns.length; b++) {
      btns[b].classList.toggle('active', btns[b].getAttribute('data-lang') === l);
    }
    var els = document.querySelectorAll('[data-en]');
    for (var i = 0; i < els.length; i++) {
      var v = l === 'ur' ? els[i].getAttribute('data-ur') : els[i].getAttribute('data-en');
      if (v !== null) els[i].innerHTML = v;
    }
    var phs = document.querySelectorAll('[data-en-ph]');
    for (var j = 0; j < phs.length; j++) {
      phs[j].setAttribute('placeholder', l === 'ur' ? phs[j].getAttribute('data-ur-ph') : phs[j].getAttribute('data-en-ph'));
    }
    document.documentElement.setAttribute('lang', l === 'ur' ? 'ur' : 'en');
    document.documentElement.setAttribute('dir', l === 'ur' ? 'rtl' : 'ltr');
    paintCsLabels();
    updateCountdown();
  }
  document.getElementById('lang-toggle').addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (btn) applyLang(btn.getAttribute('data-lang'));
  });

  /* ================= BACKGROUND NASHEED (local MP3) ================= */
  var audio = document.getElementById('bg-music');
  function tryPlayMusic() {
    if (!audio) return;
    audio.volume = 0.8;
    var p = audio.play();
    if (p && p.catch) p.then(function(){ setPlayingUI(true); }).catch(function(){ setPlayingUI(false); });
    else setPlayingUI(true);
  }
  function pauseMusic() {
    if (audio) { try { audio.pause(); } catch (e) {} }
    setPlayingUI(false);
  }
  var everPlayed = false;
  audio.addEventListener('play', function(){ everPlayed = true; setPlayingUI(true); });
  audio.addEventListener('pause', function(){ setPlayingUI(false); });
  /* start nasheed the moment the site opens; keep retrying on touches (browsers block sound before first tap) */
  tryPlayMusic();
  window.addEventListener('load', function(){ if (!everPlayed) tryPlayMusic(); });
  ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, function () { if (!everPlayed) tryPlayMusic(); });
  });

  function setPlayingUI(on) {
    musicToggle.classList.toggle('playing', !!on);
    musicIcon.textContent = on ? '❚❚' : '♪';
    document.body.classList.toggle('playing-music', !!on);
  }
  musicToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    if (audio && !audio.paused) { pauseMusic(); }
    else { tryPlayMusic(); }
  });

  /* ---------- petals (bougainvillea + turquoise) ---------- */
  var canvas = document.getElementById('petals');
  var ctx = canvas.getContext('2d');
  var petals = [];
  var COUNT = window.innerWidth < 600 ? 20 : 34;
  var COLORS = ['#f2a4b5', '#e2547a', '#7fd1cc', '#ffffff', '#f9d3d8'];

  function resizeFx() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resizeFx();
  window.addEventListener('resize', resizeFx);

  function makePetal(init) {
    return {
      x: Math.random() * canvas.width,
      y: init ? Math.random() * canvas.height : -20,
      s: 5 + Math.random() * 9,
      vy: 0.3 + Math.random() * 0.7,
      vx: -0.3 + Math.random() * 0.6,
      rot: Math.random() * Math.PI * 2,
      vr: -0.02 + Math.random() * 0.04,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 0.35 + Math.random() * 0.4
    };
  }
  for (var i = 0; i < COUNT; i++) petals.push(makePetal(true));

  (function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var j = 0; j < petals.length; j++) {
      var p = petals[j];
      p.x += p.vx + Math.sin(p.y / 70) * 0.35;
      p.y += p.vy;
      p.rot += p.vr;
      if (p.y > canvas.height + 30) { petals[j] = makePetal(false); continue; }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.s * 0.6, p.s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    requestAnimationFrame(tick);
  })();

  /* force first frame (closed door in video) to show before tap */
  video.addEventListener('loadeddata', function () {
    try { video.pause(); video.currentTime = 0.01; } catch (e) {}
  });
  video.addEventListener('loadedmetadata', function () {
    try { video.playbackRate = SLOW_RATE; } catch (e) {}
  });

  /* ---------- TAP: invite text fades, video + nasheed start ---------- */
  function beginOpening() {
    if (phase !== 'invite') return;
    phase = 'journey';
    tryPlayMusic();                      // nasheed starts on user gesture
    cine.classList.add('opening');       // YOU'RE INVITED melts away
    cine.classList.add('playing');       // slow drift-zoom begins
    try { video.playbackRate = SLOW_RATE; } catch (e) {}
    var play = video.play();
    if (play && play.catch) play.catch(function(){ showNames(); });

    // fallbacks (if video events fail): slow-clock timers
    var dur = 8;
    try { if (video.duration && isFinite(video.duration)) dur = video.duration; } catch (e) {}
    clearTimeout(fallbackTimer);
    fallbackTimer = setTimeout(showNames, (NAMES_AT / SLOW_RATE) * 1000 + 800);
    clearTimeout(endFallbackTimer);
    endFallbackTimer = setTimeout(readyEnter, (dur / SLOW_RATE) * 1000 + 1200);
  }

  /* ---------- names rise OVER the video, 1.5s after doors open ---------- */
  function showNames() {
    if (phase !== 'journey') return;
    phase = 'names';
    cine.classList.add('names');
  }
  video.addEventListener('timeupdate', function () {
    try {
      if (phase === 'journey' && video.currentTime >= NAMES_AT) showNames();
    } catch (e) {}
  });

  /* ---------- video ends → reveal the Swipe-Up cue (last frame holds) ---------- */
  function readyEnter() {
    if (phase !== 'names') return;
    cine.classList.add('enter-ready');
  }
  video.addEventListener('ended', function () {
    if (phase === 'journey') showNames();
    readyEnter();
  });

  /* ---------- lift curtain → scroll story ---------- */
  function enterStory() {
    if (phase !== 'names') return;
    phase = 'entered';
    clearTimeout(fallbackTimer);
    clearTimeout(endFallbackTimer);
    cine.classList.add('lift');
    main.classList.remove('locked');
    document.body.classList.remove('no-scroll');
    document.body.classList.add('ready');
    observeReveals();
    setTimeout(sizeScratch, 350);
    try { window.scrollTo(0, 0); } catch (e) {}
    setTimeout(function () { cine.style.display = 'none'; }, 1800);
  }

  openBtn.addEventListener('click', function (e) { e.stopPropagation(); beginOpening(); });
  enterBtn.addEventListener('click', function (e) { e.stopPropagation(); enterStory(); });
  namesLayer.addEventListener('click', function (e) {
    if (e.target === namesLayer) enterStory();
  });
  var touchY = null;
  namesLayer.addEventListener('touchstart', function (e) { touchY = e.touches[0].clientY; }, { passive: true });
  namesLayer.addEventListener('touchend', function (e) {
    if (touchY === null) return;
    var dy = touchY - e.changedTouches[0].clientY;
    if (dy > 60) enterStory();
    touchY = null;
  }, { passive: true });

  /* ---------- countdown ---------- */
  var dEl = document.getElementById('cd-days');
  var hEl = document.getElementById('cd-hours');
  var mEl = document.getElementById('cd-mins');
  var sEl = document.getElementById('cd-secs');
  var note = document.getElementById('countdown-note');
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function updateCountdown() {
    var diff = WEDDING_DATE - new Date();
    if (diff <= 0) {
      dEl.textContent = hEl.textContent = mEl.textContent = sEl.textContent = '00';
      note.textContent = STR[lang].cdDone;
      return;
    }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    dEl.textContent = pad(d); hEl.textContent = pad(h);
    mEl.textContent = pad(m); sEl.textContent = pad(s);
    note.textContent = d === 0 ? STR[lang].cdSoon
      : d === 1 ? STR[lang].cdOne
      : STR[lang].cdMany(d);
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------- photo slider ---------- */
  var slidesEl = document.getElementById('slides');
  var slides = slidesEl.querySelectorAll('.slide');
  var dotsWrap = document.getElementById('slide-dots');
  var current = 0, autoTimer = null;
  slides.forEach(function (_, idx) {
    var dot = document.createElement('button');
    dot.setAttribute('aria-label', 'Go to photo ' + (idx + 1));
    if (idx === 0) dot.classList.add('active');
    dot.addEventListener('click', function () { goTo(idx); restartAuto(); });
    dotsWrap.appendChild(dot);
  });
  var dots = dotsWrap.querySelectorAll('button');
  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }
  function restartAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(function () { goTo(current + 1); }, 5000);
  }
  document.getElementById('slide-prev').addEventListener('click', function () { goTo(current - 1); restartAuto(); });
  document.getElementById('slide-next').addEventListener('click', function () { goTo(current + 1); restartAuto(); });
  restartAuto();

  /* ---------- scroll reveals ---------- */
  function observeReveals() {
    var els = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      var ob = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('visible'); ob.unobserve(en.target); }
        });
      }, { threshold: 0.12 });
      els.forEach(function (el) { ob.observe(el); });
    } else {
      els.forEach(function (el) { el.classList.add('visible'); });
    }
  }

  /* ---------- custom attendance dropdown (themed) ---------- */
  var attendSelect = document.getElementById('f-attend');
  var csWrap = document.getElementById('attend-select');
  var csBtn = csWrap.querySelector('.cs-btn');
  var csValue = csWrap.querySelector('.cs-value');
  var csList = csWrap.querySelector('.cs-list');
  var csOptions = [];
  attendSelect.querySelectorAll('option').forEach(function (op) {
    csOptions.push({ value: op.value, en: op.getAttribute('data-en') || op.textContent, ur: op.getAttribute('data-ur') || op.textContent });
  });
  csOptions.forEach(function (op, idx) {
    var li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.setAttribute('data-idx', idx);
    if (idx === 0) li.classList.add('placeholder');
    li.innerHTML = '<span class="cs-tick">✓</span><span class="cs-label"></span>';
    li.addEventListener('click', function () { setAttendance(op.value); closeCs(); });
    csList.appendChild(li);
  });
  function paintCsLabels() {
    if (!csList) return;
    var items = csList.querySelectorAll('li');
    items.forEach(function (li) {
      var op = csOptions[+li.getAttribute('data-idx')];
      li.querySelector('.cs-label').innerHTML = lang === 'ur' ? op.ur : op.en;
      li.classList.toggle('selected', op.value !== '' && op.value === attendSelect.value);
    });
    var cur = csOptions[0];
    for (var c = 0; c < csOptions.length; c++) {
      if (csOptions[c].value === attendSelect.value) { cur = csOptions[c]; break; }
    }
    csValue.innerHTML = lang === 'ur' ? cur.ur : cur.en;
    csWrap.classList.toggle('chosen', attendSelect.value !== '');
  }
  function setAttendance(val) {
    attendSelect.value = val;
    try { attendSelect.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) {}
    paintCsLabels();
  }
  function closeCs() {
    csList.hidden = true;
    csBtn.setAttribute('aria-expanded', 'false');
    csWrap.classList.remove('open');
  }
  csBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var willOpen = csList.hidden;
    document.querySelectorAll('.custom-select.open').forEach(function (o) {
      o.classList.remove('open');
      o.querySelector('.cs-list').hidden = true;
    });
    csList.hidden = !willOpen;
    csBtn.setAttribute('aria-expanded', String(willOpen));
    csWrap.classList.toggle('open', willOpen);
  });
  document.addEventListener('click', function (e) { if (!csWrap.contains(e.target)) closeCs(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCs(); });
  paintCsLabels();

  /* ---------- toast + RSVP ---------- */
  var toast = document.getElementById('toast');
  var toastTimer = null;
  function showToast(msg, type) {
    toast.textContent = msg;
    toast.className = 'toast show ' + (type || '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.className = 'toast'; }, 4200);
  }
  document.getElementById('rsvp-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('f-name').value.trim();
    var attend = document.getElementById('f-attend').value;
    var guests = document.getElementById('f-guests').value;
    if (!name || !attend || !guests || guests < 1) { return; }
    e.target.reset();
    document.getElementById('f-guests').value = '1';
    paintCsLabels();
  });

  /* ---------- scratch of love (date reveal) ---------- */
  var scratchCanvas = document.getElementById('scratch-canvas');
  var sctx = scratchCanvas.getContext('2d', { willReadFrequently: true });
  var scratchHint = document.getElementById('scratch-hint');
  var scratchBar = document.getElementById('scratch-bar');
  var sDown = false, sRevealed = false;

  function sizeScratch() {
    if (!scratchCanvas || !scratchCanvas.parentElement) return;
    var rect = scratchCanvas.parentElement.getBoundingClientRect();
    if (!rect.width) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    scratchCanvas.width = rect.width * dpr;
    scratchCanvas.height = rect.height * dpr;
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintCover(rect.width, rect.height);
  }
  function paintCover(w, h) {
    var grad = sctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#f2a4b5');
    grad.addColorStop(0.5, '#e2547a');
    grad.addColorStop(1, '#b23a5c');
    sctx.globalCompositeOperation = 'source-over';
    sctx.globalAlpha = 1;
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, w, h);
    for (var k = 0; k < 700; k++) {
      sctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,.6)' : 'rgba(255,217,222,.75)';
      sctx.beginPath();
      sctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.8 + 0.4, 0, Math.PI * 2);
      sctx.fill();
    }
    sRevealed = false;
    scratchCanvas.style.opacity = '1';
    scratchCanvas.style.pointerEvents = 'auto';
    scratchHint.classList.remove('hide');
    scratchBar.style.width = '0%';
  }
  function scratchAt(cx, cy) {
    var rect = scratchCanvas.getBoundingClientRect();
    var x = cx - rect.left, y = cy - rect.top;
    sctx.globalCompositeOperation = 'destination-out';
    sctx.lineWidth = 44; sctx.lineCap = 'round'; sctx.lineJoin = 'round';
    sctx.beginPath();
    if (scratchAt.last) { sctx.moveTo(scratchAt.last.x, scratchAt.last.y); sctx.lineTo(x, y); sctx.stroke(); }
    else { sctx.arc(x, y, 22, 0, Math.PI * 2); sctx.fill(); }
    scratchAt.last = { x: x, y: y };
    scratchHint.classList.add('hide');
    updateScratchProgress();
  }
  function updateScratchProgress() {
    try {
      var data = sctx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height).data;
      var total = 0, clear = 0, step = 4 * 32;
      for (var i = 3; i < data.length; i += step) { total++; if (data[i] === 0) clear++; }
      var pct = Math.round((clear / total) * 100);
      scratchBar.style.width = Math.min(pct, 100) + '%';
      if (pct > 45 && !sRevealed) {
        sRevealed = true;
        scratchCanvas.style.transition = 'opacity .8s ease';
        scratchCanvas.style.opacity = '0';
        scratchCanvas.style.pointerEvents = 'none';
      }
    } catch (e) {}
  }
  function endStroke() { sDown = false; scratchAt.last = null; }
  scratchCanvas.addEventListener('mousedown', function (e) { sDown = true; scratchAt(e.clientX, e.clientY); });
  window.addEventListener('mousemove', function (e) { if (sDown) scratchAt(e.clientX, e.clientY); });
  window.addEventListener('mouseup', endStroke);
  scratchCanvas.addEventListener('touchstart', function (e) { e.preventDefault(); sDown = true; scratchAt(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
  scratchCanvas.addEventListener('touchmove', function (e) { e.preventDefault(); if (sDown) scratchAt(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
  scratchCanvas.addEventListener('touchend', endStroke);
  document.getElementById('scratch-reset').addEventListener('click', function () {
    var rect = scratchCanvas.parentElement.getBoundingClientRect();
    paintCover(rect.width, rect.height);
  });
  window.addEventListener('resize', function () { if (!sRevealed) sizeScratch(); });
  setTimeout(sizeScratch, 600);

})();
