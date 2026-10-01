/* Aarav & Meera — sage botanical invitation logic | vanilla, mobile-first */
(function () {
  'use strict';

  /* ============ SINGLE CONFIG (reusable for Mehfill.in) ============ */
  var wedding = {
    groom: 'Aarav', bride: 'Meera',
    date: '18 December 2026',
    target: new Date('2026-12-18T19:00:00'),
    venue: 'The Garden Estate', city: 'Mumbai',
    theme: { primary: '#737C5B', cream: '#F8F3E8', gold: '#C7A75B' }
  };

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function vibrate(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }

  /* vh fix */
  function fixVH() { document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px'); }
  fixVH();
  var rT; window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { fixVH(); sizePetals(); sizeBurst(); sizeScratch(true); }, 150); });
  window.addEventListener('orientationchange', function () { setTimeout(function () { fixVH(); sizeScratch(true); }, 350); });

  /* ============ PETAL CANVAS ============ */
  var pcv = document.getElementById('petals'), pctx = pcv.getContext('2d'), petals = [];
  var PC = ['#8A9270', '#C7A75B', '#F8F3E8', '#DDD5C4', '#ffffff', '#a9b18e'];
  function petalN() { var w = window.innerWidth; if (w < 380) return 12; if (w < 600) return 18; if (w < 900) return 26; return 36; }
  function mkP(init) {
    return { x: Math.random() * window.innerWidth, y: init ? Math.random() * window.innerHeight : -16,
      s: 4 + Math.random() * 7, vy: 0.25 + Math.random() * 0.6, vx: -0.25 + Math.random() * 0.5,
      r: Math.random() * 6.28, vr: -0.02 + Math.random() * 0.04, c: PC[Math.floor(Math.random() * PC.length)], a: 0.25 + Math.random() * 0.4 };
  }
  function sizePetals() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    pcv.width = window.innerWidth * dpr; pcv.height = window.innerHeight * dpr;
    pcv.style.width = window.innerWidth + 'px'; pcv.style.height = window.innerHeight + 'px';
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var want = reduced ? 0 : petalN();
    while (petals.length < want) petals.push(mkP(true));
    petals = petals.slice(0, want);
  }
  sizePetals();
  (function tick() {
    pctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (!reduced) petals.forEach(function (o, k) {
      o.x += o.vx + Math.sin(o.y / 80) * 0.3; o.y += o.vy; o.r += o.vr;
      if (o.y > window.innerHeight + 24) { petals[k] = mkP(false); return; }
      pctx.save(); pctx.translate(o.x, o.y); pctx.rotate(o.r);
      pctx.globalAlpha = o.a; pctx.fillStyle = o.c;
      pctx.beginPath(); pctx.ellipse(0, 0, o.s * 0.6, o.s, 0, 0, 6.29); pctx.fill();
      pctx.restore();
    });
    requestAnimationFrame(tick);
  })();

  /* ============ GOLD BURST CANVAS ============ */
  var bcv = document.getElementById('burst'), bctx = bcv.getContext('2d'), parts = [], bRun = false;
  function sizeBurst() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    bcv.width = window.innerWidth * dpr; bcv.height = window.innerHeight * dpr;
    bcv.style.width = window.innerWidth + 'px'; bcv.style.height = window.innerHeight + 'px';
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeBurst(); window.addEventListener('resize', sizeBurst);
  var BC = ['#C7A75B', '#737C5B', '#F8F3E8', '#ffffff', '#ecdcb4', '#8A9270'];
  function burst(x, y, n) {
    if (reduced) return; sizeBurst();
    for (var k = 0; k < (n || 80); k++) parts.push({ x: x, y: y, vx: (Math.random() - 0.5) * 11, vy: Math.random() * -9 - 2,
      g: 0.28 + Math.random() * 0.12, s: 3 + Math.random() * 5, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3,
      c: BC[Math.floor(Math.random() * BC.length)], life: 90 + Math.random() * 50, heart: Math.random() < 0.22 });
    if (!bRun) { bRun = true; bTick(); }
  }
  function bTick() {
    bctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    parts = parts.filter(function (o) { return o.life > 0 && o.y < window.innerHeight + 30; });
    parts.forEach(function (o) {
      o.vy += o.g; o.x += o.vx; o.y += o.vy; o.vx *= 0.99; o.r += o.vr; o.life--;
      bctx.save(); bctx.translate(o.x, o.y); bctx.rotate(o.r);
      bctx.globalAlpha = Math.min(1, o.life / 40); bctx.fillStyle = o.c;
      if (o.heart) { bctx.font = o.s * 3 + 'px serif'; bctx.fillText('♡', -o.s, o.s * 0.5); }
      else bctx.fillRect(-o.s / 2, -o.s / 3, o.s, o.s * 0.66);
      bctx.restore();
    });
    if (parts.length) requestAnimationFrame(bTick);
    else { bRun = false; bctx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
  }

  /* ============ VIDEO COVER: tap -> play -> names -> dock & scroll ============ */
  var cover = document.getElementById('cover');
  var coverVideo = document.getElementById('cover-video');
  var coverBar = document.getElementById('cover-bar');
  var opened = false, entered = false, endTimer = null;

  if (coverVideo) { try { coverVideo.pause(); } catch (e) {} }

  function enterSite() {
    if (entered) return; entered = true;
    if (endTimer) { clearTimeout(endTimer); endTimer = null; }
    try { if (coverVideo) coverVideo.pause(); } catch (e) {}
    vibrate(20);
    // No lift — the cover becomes the top hero, guest scrolls down
    cover.classList.add('docked');
    if (!userMuted) playMusic(); // song keeps playing on the website (unless guest paused it)
    document.body.classList.remove('locked');
    document.body.classList.add('ready');
    burst(window.innerWidth / 2, window.innerHeight * 0.3, 80);
    observe();
    setTimeout(function () { sizeScratch(true); }, 400);
    window.scrollTo(0, 0);
  }

  function startVideo() {
    if (opened) return; opened = true; vibrate(15);
    if (!coverVideo) { enterSite(); return; }
    cover.classList.add('playing');
    // Names + texts reveal 3.5s after tap, over the running video
    setTimeout(function () { if (!entered) cover.classList.add('shownames'); }, 3500);
    try { coverVideo.currentTime = 0; } catch (e) {}
    try { coverVideo.muted = true; } catch (e) {} // mp3 is the soundtrack — no clash with video audio
    playMusic(); // Bol Kaffara starts with the video
    var pr = null;
    try { pr = coverVideo.play(); } catch (e) { pr = null; }
    if (pr && pr.catch) {
      pr.catch(function () { try { coverVideo.muted = true; coverVideo.play(); } catch (e2) {} });
    }
    // Safety: never trap the guest even if the video stalls
    setTimeout(function () { if (!entered) enterSite(); }, 90000);
  }

  document.getElementById('open-btn').addEventListener('click', function (e) { e.stopPropagation(); startVideo(); });
  cover.addEventListener('click', function () { if (!opened) startVideo(); });

  if (coverVideo) {
    coverVideo.addEventListener('ended', function () {
      if (entered) return;
      endTimer = setTimeout(enterSite, 1200);
    });
    coverVideo.addEventListener('error', function () { if (!opened) enterSite(); });
    coverVideo.addEventListener('timeupdate', function () {
      try {
        if (coverVideo.duration && coverBar) {
          coverBar.style.width = (coverVideo.currentTime / coverVideo.duration * 100) + '%';
        }
      } catch (e) {}
    });
  }
  setTimeout(function () { if (!opened) observe(); }, 4000); // safety

  /* ============ SCROLL: progress + reveals + timeline ============ */
  var prog = document.querySelector('#scroll-progress span');
  var topBtn = document.getElementById('top-btn');
  var tFill = document.getElementById('t-fill'), timeline = document.getElementById('timeline');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var sc = max > 0 ? h.scrollTop / max : 0;
    if (prog) prog.style.width = (sc * 100) + '%';
    if (topBtn) topBtn.classList.toggle('show', h.scrollTop > window.innerHeight * 0.9);
    if (timeline && tFill) {
      var r = timeline.getBoundingClientRect();
      var vis = Math.min(1, Math.max(0, (window.innerHeight * 0.75 - r.top) / r.height));
      tFill.style.height = (vis * 100) + '%';
      timeline.querySelectorAll('.t-item').forEach(function (it) {
        var ir = it.getBoundingClientRect();
        if (ir.top < window.innerHeight * 0.72) it.classList.add('lit');
      });
    }
    // hero parallax
    var hero = document.querySelector('.hero-bg');
    if (hero) hero.style.transform = 'translateY(' + (h.scrollTop * 0.06) + 'px)';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  topBtn.addEventListener('click', function () { vibrate(10); window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });

  var seen = false;
  function observe() {
    if (seen) return; seen = true;
    var els = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      var ob = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); ob.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      els.forEach(function (el) { ob.observe(el); });
    } else els.forEach(function (el) { el.classList.add('in'); });
  }

  /* ============ SCRATCH CARD ============ */
  var scv = document.getElementById('scratch-canvas');
  var sctx = scv ? scv.getContext('2d', { willReadFrequently: true }) : null;
  var sHint = document.getElementById('scratch-hint');
  var sBar = document.getElementById('scratch-bar');
  var sDone = document.getElementById('scratch-done');
  var srHeart = document.getElementById('sr-heart');
  var sDown = false, sFinished = false, sPainted = false;
  var last = null, progTick = 0, sTouched = false;

  function sizeScratch(repaint) {
    if (!scv || !sctx || !scv.parentElement) return;
    var r = scv.parentElement.getBoundingClientRect();
    if (!r.width || !r.height) return;
    if (sPainted && !repaint) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    scv.width = Math.round(r.width * dpr); scv.height = Math.round(r.height * dpr);
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintScratch(r.width, r.height);
    sPainted = true;
  }
  function paintScratch(w, h) {
    sctx.globalCompositeOperation = 'source-over';
    sctx.globalAlpha = 1;
    var g = sctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#7e8763'); g.addColorStop(0.5, '#737C5B'); g.addColorStop(1, '#5c6547');
    sctx.fillStyle = g; sctx.fillRect(0, 0, w, h);
    // leaf pattern
    sctx.strokeStyle = 'rgba(255,253,247,.28)'; sctx.lineWidth = 1.2;
    for (var k = 0; k < 26; k++) {
      var lx = Math.random() * w, ly = Math.random() * h, s = 10 + Math.random() * 16;
      sctx.beginPath(); sctx.ellipse(lx, ly, s, s * 0.45, Math.random() * 3.14, 0, 6.29); sctx.stroke();
    }
    sctx.fillStyle = 'rgba(199,167,91,.5)';
    for (var j = 0; j < 30; j++) { sctx.beginPath(); sctx.arc(Math.random() * w, Math.random() * h, 1.2, 0, 6.29); sctx.fill(); }
    // center emblem (heart-friendly ring, no rectangle)
    var er = Math.min(w, h) * 0.17, ecx = w / 2, ecy = h * 0.44;
    sctx.strokeStyle = 'rgba(248,243,232,.85)'; sctx.lineWidth = 1.5;
    sctx.beginPath(); sctx.arc(ecx, ecy, er, 0, 6.29); sctx.stroke();
    sctx.beginPath(); sctx.arc(ecx, ecy, er - 6, 0, 6.29);
    sctx.strokeStyle = 'rgba(248,243,232,.45)'; sctx.lineWidth = 1; sctx.stroke();
    sctx.fillStyle = '#F8F3E8'; sctx.textAlign = 'center'; sctx.textBaseline = 'middle';
    sctx.font = '22px Georgia, serif';
    sctx.fillText('A  ♡  M', ecx, ecy - 2);
    sctx.font = '600 9px Inter, sans-serif'; sctx.globalAlpha = 0.9;
    sctx.fillText('S W I P E   T O   R E V E A L', ecx, ecy + 26);
    sctx.globalAlpha = 1;
    sFinished = false; sDone.hidden = true;
    if (srHeart) srHeart.classList.remove('pulse');
    scv.style.opacity = '1'; scv.style.pointerEvents = 'auto'; scv.style.transition = 'none';
    if (sHint) sHint.classList.remove('hide');
    if (sBar) sBar.style.width = '0%';
  }
  function scratchAt(cx, cy) {
    var r = scv.getBoundingClientRect();
    var x = cx - r.left, y = cy - r.top;
    sctx.globalCompositeOperation = 'destination-out';
    sctx.lineWidth = Math.max(42, r.width * 0.12); sctx.lineCap = 'round'; sctx.lineJoin = 'round';
    sctx.beginPath();
    if (last) { sctx.moveTo(last.x, last.y); sctx.lineTo(x, y); sctx.stroke(); }
    else { sctx.beginPath(); sctx.arc(x, y, 22, 0, 6.29); sctx.fill(); }
    last = { x: x, y: y };
    sTouched = true;
    if (sHint) sHint.classList.add('hide');
    scratchProgress();
  }
  function scratchProgress() {
    var now = Date.now();
    if (now - progTick < 200) return; progTick = now;
    try {
      var d = sctx.getImageData(0, 0, scv.width, scv.height).data;
      var tot = 0, clr = 0, step = 4 * 32;
      for (var i = 3; i < d.length; i += step) { tot++; if (d[i] === 0) clr++; }
      var pc = Math.round(clr / tot * 100);
      if (sBar) sBar.style.width = Math.min(pc, 100) + '%';
      if (pc > 1 && !sFinished) {
        sFinished = true; vibrate(25);
        scv.style.transition = 'opacity .9s ease';
        scv.style.opacity = '0'; scv.style.pointerEvents = 'none';
        sDone.hidden = false;
        if (srHeart) srHeart.classList.add('pulse');
        var rr = scv.getBoundingClientRect();
        burst(rr.left + rr.width / 2, rr.top + 100, 60);
      }
    } catch (e) {}
  }
  function scratchEnd() {
    sDown = false; last = null;
    // final check on lift — a single quick tap also celebrates
    if (sTouched && !sFinished) { sTouched = false; progTick = 0; scratchProgress(); }
  }
  if (scv && sctx) {
    scv.addEventListener('mousedown', function (e) { sDown = true; scratchAt(e.clientX, e.clientY); });
    window.addEventListener('mousemove', function (e) { if (sDown && !sFinished) scratchAt(e.clientX, e.clientY); });
    window.addEventListener('mouseup', scratchEnd);
    scv.addEventListener('touchstart', function (e) { e.preventDefault(); sDown = true; scratchAt(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    scv.addEventListener('touchmove', function (e) { e.preventDefault(); if (sDown && !sFinished) scratchAt(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    scv.addEventListener('touchend', scratchEnd);
    var rsBtn = document.getElementById('scratch-reset');
    if (rsBtn) rsBtn.addEventListener('click', function () { vibrate(10); var r = scv.parentElement.getBoundingClientRect(); paintScratch(r.width, r.height); });
    setTimeout(function () { sizeScratch(false); }, 400);
    setTimeout(function () { sizeScratch(false); }, 2500);
    window.addEventListener('load', function () { sizeScratch(false); });
  }

  /* ============ COUNTDOWN ============ */
  var lastVals = {};
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function setNum(id, v) {
    var el = document.getElementById(id);
    if (!el) return;
    if (lastVals[id] !== v) {
      el.textContent = v;
      if (lastVals[id] !== undefined) { el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); }
      lastVals[id] = v;
    }
  }
  function updateCD() {
    var diff = wedding.target - new Date();
    var note = document.getElementById('cd-note');
    if (diff <= 0) { setNum('cd-d','00'); setNum('cd-h','00'); setNum('cd-m','00'); setNum('cd-s','00');
      if (note) note.textContent = 'Just married — thank you for celebrating with us.'; return; }
    var dd = Math.floor(diff / 864e5), hh = Math.floor(diff % 864e5 / 36e5),
        mm = Math.floor(diff % 36e5 / 6e4), ss = Math.floor(diff % 6e4 / 1e3);
    setNum('cd-d', pad(dd)); setNum('cd-h', pad(hh)); setNum('cd-m', pad(mm)); setNum('cd-s', pad(ss));
    if (note) note.textContent = dd === 0 ? 'Almost time — see you very soon.' : dd === 1 ? 'Only 1 day to go.' : 'Only ' + dd + ' days of waiting left.';
  }
  updateCD(); setInterval(updateCD, 1000);

  /* ============ GALLERY LIGHTBOX + SWIPE ============ */
  var lb = document.getElementById('lightbox'), lbImg = document.getElementById('lb-img');
  var gImgs = Array.prototype.slice.call(document.querySelectorAll('.gal img'));
  var gIdx = 0;
  function showLb(i) {
    if (!gImgs.length) return;
    gIdx = (i + gImgs.length) % gImgs.length;
    lbImg.src = gImgs[gIdx].src; lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function hideLb() { lb.hidden = true; if (!document.body.classList.contains('locked')) document.body.style.overflow = ''; }
  gImgs.forEach(function (img, idx) { img.addEventListener('click', function () { vibrate(10); showLb(idx); }); });
  document.getElementById('lb-x').addEventListener('click', hideLb);
  document.getElementById('lb-next').addEventListener('click', function (e) { e.stopPropagation(); showLb(gIdx + 1); });
  document.getElementById('lb-prev').addEventListener('click', function (e) { e.stopPropagation(); showLb(gIdx - 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) hideLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') hideLb();
    if (e.key === 'ArrowRight') showLb(gIdx + 1);
    if (e.key === 'ArrowLeft') showLb(gIdx - 1);
  });
  var tx0 = null;
  lb.addEventListener('touchstart', function (e) { tx0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (tx0 === null) return;
    var dx = e.changedTouches[0].clientX - tx0;
    if (Math.abs(dx) > 45) showLb(gIdx + (dx < 0 ? 1 : -1));
    tx0 = null;
  }, { passive: true });

  /* ============ RSVP ============ */
  var attend = '', guests = 1;
  var gVal = document.getElementById('g-val');
  document.getElementById('attend-pills').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    attend = b.dataset.v; vibrate(10);
    this.querySelectorAll('button').forEach(function (x) { x.classList.toggle('sel', x === b); });
  });
  document.getElementById('g-minus').addEventListener('click', function () { guests = Math.max(1, guests - 1); gVal.textContent = guests; vibrate(8); });
  document.getElementById('g-plus').addEventListener('click', function () { guests = Math.min(10, guests + 1); gVal.textContent = guests; vibrate(8); });
  document.getElementById('rsvp-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var nameInput = document.getElementById('f-name');
    var note = document.getElementById('rsvp-note');
    var pills = document.getElementById('attend-pills');
    var name = nameInput.value.trim();
    note.hidden = true;
    nameInput.classList.remove('field-error'); pills.classList.remove('shake');
    if (!name) { vibrate(30); nameInput.classList.remove('field-error'); void nameInput.offsetWidth; nameInput.classList.add('field-error'); nameInput.focus(); return; }
    if (!attend) { vibrate(30); pills.classList.remove('shake'); void pills.offsetWidth; pills.classList.add('shake'); return; }
    vibrate([20, 40, 20]);
    note.textContent = attend === 'yes'
      ? 'Thank you, ' + name + ' — see you on Dec 18 (+' + guests + '). ♡'
      : 'Thank you, ' + name + ' — you will be missed. ♡';
    note.hidden = false;
    if (attend === 'yes') burst(window.innerWidth / 2, window.innerHeight * 0.4, 90);
    e.target.reset(); attend = ''; guests = 1; gVal.textContent = '1';
    document.querySelectorAll('#attend-pills button').forEach(function (x) { x.classList.remove('sel'); });
  });

  /* ============ MUSIC — Bol Kaffara (local mp3, loops) ============ */
  var bgMusic = document.getElementById('bg-music');
  var mBtn = document.getElementById('music-btn'), mIcon = document.getElementById('music-icon');
  var musicOn = false, userMuted = false;
  function setMusicUI(on) {
    musicOn = !!on;
    mBtn.classList.toggle('on', musicOn);
    mIcon.textContent = musicOn ? '♡' : '♪';
  }
  function playMusic() {
    if (!bgMusic) return;
    try { bgMusic.loop = true; bgMusic.volume = 0.85; } catch (e) {}
    // Start the song from 0:20 (skip the intro)
    try { if (bgMusic.currentTime < 20) bgMusic.currentTime = 20; } catch (e) {}
    var pr = null;
    try { pr = bgMusic.play(); } catch (e) { pr = null; }
    if (pr && pr.catch) pr.catch(function () { setMusicUI(false); });
  }
  function pauseMusic() { if (!bgMusic) return; try { bgMusic.pause(); } catch (e) {} }
  if (bgMusic) {
    bgMusic.addEventListener('play', function () { setMusicUI(true); });
    bgMusic.addEventListener('pause', function () { setMusicUI(false); });
  }
  mBtn.addEventListener('click', function (e) {
    e.stopPropagation(); vibrate(10);
    if (musicOn) { userMuted = true; pauseMusic(); }
    else { userMuted = false; playMusic(); }
  });

  /* smooth anchor */
  document.querySelectorAll('a.scroll-link').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); }
    });
  });

  sizePetals(); sizeBurst();
})();
