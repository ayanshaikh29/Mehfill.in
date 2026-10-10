/* Amit & Siya — interactions (site-5) */

(function () {

  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;



  /* ---------- floating dust particles + twinkling stars ---------- */

  (function dust() {

    var cv = document.getElementById('dust');

    if (!cv || reduceMotion) return;

    var ctx = cv.getContext('2d'), W, H, ps = [], stars = [], petals = [];

    var mobile = window.innerWidth < 768;

    function size() {

      var dpr = Math.min(window.devicePixelRatio || 1, 2);

      W = window.innerWidth; H = window.innerHeight;

      cv.width = W * dpr; cv.height = H * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    }

    function make() {

      return { x: Math.random() * W, y: Math.random() * H, r: .6 + Math.random() * 1.6,

               vy: .08 + Math.random() * .22, vx: (Math.random() - .5) * .12, a: .12 + Math.random() * .3 };

    }

    function makeStar() {

      return { x: Math.random() * W, y: Math.random() * H, r: 3 + Math.random() * 5,

               ph: Math.random() * 6.28, sp: .008 + Math.random() * .02 };

    }

    var PETALS = ['rgba(184,155,99,', 'rgba(216,190,140,', 'rgba(240,230,210,', 'rgba(200,170,150,'];

    function makePetal() {

      return { x: Math.random() * W, y: -12 - Math.random() * H * .5,

               rx: 3 + Math.random() * 5, ry: 5 + Math.random() * 7,

               vy: .35 + Math.random() * .7, sway: 20 + Math.random() * 40,

               ph: Math.random() * 6.28, rot: Math.random() * 6.28, vr: (Math.random() - .5) * .03,

               c: PETALS[Math.floor(Math.random() * PETALS.length)], a: .35 + Math.random() * .4 };

    }

    size();

    var n = Math.min(mobile ? 26 : 42, Math.floor(W / 22));

    for (var i = 0; i < n; i++) ps.push(make());

    var ns = mobile ? 7 : 15;

    for (var k = 0; k < ns; k++) stars.push(makeStar());

    var np = mobile ? 8 : 16;

    for (var q = 0; q < np; q++) { var pt = makePetal(); pt.y = Math.random() * H; petals.push(pt); }

    window.addEventListener('resize', size);

    (function tick() {

      ctx.clearRect(0, 0, W, H);

      var i, p;

      for (i = 0; i < ps.length; i++) {

        p = ps[i];

        p.y -= p.vy; p.x += p.vx;

        if (p.y < -6) { ps[i] = make(); ps[i].y = H + 4; continue; }

        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.29);

        ctx.fillStyle = 'rgba(184,155,99,' + p.a + ')'; ctx.fill();

      }

      for (i = 0; i < stars.length; i++) {

        var st = stars[i];

        st.ph += st.sp;

        var tw = .25 + Math.abs(Math.sin(st.ph)) * .65;

        ctx.strokeStyle = 'rgba(201,174,109,' + tw.toFixed(2) + ')';

        ctx.lineWidth = 1;

        ctx.beginPath();

        ctx.moveTo(st.x - st.r, st.y); ctx.lineTo(st.x + st.r, st.y);

        ctx.moveTo(st.x, st.y - st.r); ctx.lineTo(st.x, st.y + st.r);

        ctx.stroke();

      }

      for (i = 0; i < petals.length; i++) {

        var pl = petals[i];

        pl.ph += .012; pl.y += pl.vy; pl.rot += pl.vr;

        if (pl.y > H + 14) { petals[i] = makePetal(); continue; }

        var sx = pl.x + Math.sin(pl.ph) * pl.sway * .3;

        ctx.save();

        ctx.translate(sx, pl.y); ctx.rotate(Math.sin(pl.rot) * .9);

        ctx.beginPath(); ctx.ellipse(0, 0, pl.rx, pl.ry, 0, 0, 6.29);

        ctx.fillStyle = pl.c + pl.a + ')'; ctx.fill();

        ctx.restore();

      }

      requestAnimationFrame(tick);

    })();

  })();



  /* ---------- cinematic opening (video gate + music) ---------- */
  /* Reveal timing (ms) - configurable. Names fade in after tap, details
     follow, music starts musicDelay after playback begins. */
  var OPENING = { nameStart: 3000, nameFull: 3600, detailsStart: 4100, musicDelay: 0, musicOffset: 32, musicVolume: 0.55 };
  (function cinema() {
    var v = document.getElementById('veil');
    var video = document.getElementById('opening-video');
    var status = document.getElementById('veil-status');
    var names = document.getElementById('veil-names');
    var scrollCue = document.getElementById('veil-scroll');
    var music = document.getElementById('bg-music');
    var musicBtn = document.getElementById('music-toggle');
    var btn = document.getElementById('veil-open');
    var veilBar = document.getElementById('veil-bar');
    if (!v || !video || !btn) return;
    if (reduceMotion) { v.style.display = 'none'; return; }
    document.body.classList.add('locked');
    window.scrollTo(0, 0);
    setMusicBtn(false);
    var started = false, finished = false, musicTimer = null;
    function say(msg) { if (status) { status.hidden = false; status.textContent = msg; } }
    function quiet() { if (status) status.hidden = true; }
    function revealAll() {
      if (!names) return;
      names.classList.add('show-names'); names.classList.add('full'); names.classList.add('show-details');
    }
    function setMusicBtn(on) {
      if (!musicBtn) return;
      musicBtn.hidden = false;
      musicBtn.classList.toggle('off', !on);
      musicBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      musicBtn.setAttribute('aria-label', on ? 'Mute background music' : 'Play background music');
    }
    function playMusic() {
      if (!music) return;
      try { music.volume = OPENING.musicVolume; } catch (e) {}
      try { if (music.duration && music.duration > OPENING.musicOffset) music.currentTime = OPENING.musicOffset; } catch (e) {}
      var pr = null;
      try { pr = music.play(); } catch (e) { setMusicBtn(false); return; }
      setMusicBtn(true);
      if (pr && pr.then) pr.then(function () { setMusicBtn(true); }, function () { setMusicBtn(false); });
    }
    function startMusicTimer() {
      if (!music || musicTimer) return;
      musicTimer = setTimeout(playMusic, OPENING.musicDelay);
    }
    function finish(skipped) {
      if (finished) return; finished = true;
      if (skipped && video && !video.paused) { try { video.pause(); } catch (e) {} }
      quiet();
      v.classList.add('finished');
      document.body.classList.remove('locked');
      if (scrollCue) scrollCue.hidden = false;
    }
    if (musicBtn && music) {
      musicBtn.addEventListener('click', function () {
        if (music.paused) { playMusic(); }
        else { music.muted = !music.muted; setMusicBtn(!music.muted); }
      });
    }
    video.addEventListener('playing', function () { quiet(); });
    video.addEventListener('waiting', function () { if (started && !finished) say('Loading film\u2026'); });
    video.addEventListener('error', function () {
      v.classList.add('failed');
      say('The film could not load \u2014 please continue below.');
      revealAll();
      finish(true);
    }, true);
    video.addEventListener('play', function () {
      v.classList.add('playing');
      quiet();
      setTimeout(function () { if (names) names.classList.add('show-names'); }, OPENING.nameStart);
      setTimeout(function () { if (names) names.classList.add('full'); }, OPENING.nameFull);
      setTimeout(function () {
        if (names) names.classList.add('show-details');
        v.classList.add('detailed');
      }, OPENING.detailsStart);
      startMusicTimer();
    });
    video.addEventListener('timeupdate', function () {
      try {
        if (video.duration && veilBar) veilBar.style.width = (video.currentTime / video.duration * 100) + '%';
      } catch (e) {}
    });
    video.addEventListener('ended', function () { finish(false); });
    btn.addEventListener('click', function () {
      if (started || finished) return; started = true;
      if (navigator.vibrate) { try { navigator.vibrate(20); } catch (e) {} }
      try { video.muted = true; } catch (e) {}
      startMusicTimer();
      var pr = null;
      try { pr = video.play(); } catch (e) { pr = null; }
      if (pr && pr.catch) pr.catch(function () { started = false; });
    });
  })();



  /* ---------- sparkle trail (fine pointers, hero/finale/veil only) ---------- */

  (function trail() {

    if (reduceMotion || !window.matchMedia('(pointer:fine)').matches) return;

    var last = 0;

    document.addEventListener('pointermove', function (e) {

      var now = Date.now();

      if (now - last < 70) return; last = now;

      var t = e.target;

      if (!t || !t.closest || !t.closest('.finale,.veil')) return;

      var s = document.createElement('span');

      s.className = 'trail-bit';

      var sz = 3 + Math.random() * 4;

      s.style.cssText = 'left:' + e.clientX + 'px;top:' + e.clientY + 'px;width:' + sz + 'px;height:' + sz + 'px';

      document.body.appendChild(s);

      var dx = (Math.random() - .5) * 44, dy = -14 - Math.random() * 30;

      if (s.animate) {

        s.animate(

          [{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },

           { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(.2)', opacity: 0 }],

          { duration: 850, easing: 'ease-out' }).onfinish = function () { s.remove(); };

      } else { setTimeout(function () { s.remove(); }, 900); }

    }, { passive: true });

  })();



  /* ---------- floating sparkles over the finale ---------- */

  (function hearts() {

    if (reduceMotion) return;

    var fin = document.querySelector('.finale');

    if (!fin) return;

    var live = false, timer = null;

    var glyphs = ['\u2726', '\u2727', '\u2661'];

    function spawn() {

      if (!live) return;

      var s = document.createElement('span');

      s.className = 'float-heart';

      s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];

      s.style.left = (8 + Math.random() * 84) + 'vw';

      s.style.top = (fin.getBoundingClientRect().top + window.scrollY + fin.offsetHeight * .55) + 'px';

      s.style.fontSize = (14 + Math.random() * 16) + 'px';

      s.style.position = 'absolute';

      document.body.appendChild(s);

      setTimeout(function () { s.remove(); }, 5200);

    }

    new IntersectionObserver(function (entries) {

      var vis = entries[0].isIntersecting;

      if (vis && !live) { live = true; spawn(); timer = setInterval(spawn, 1700); }

      if (!vis && live) { live = false; clearInterval(timer); }

    }, { threshold: 0.2 }).observe(fin);

  })();



  /* ---------- scroll reveals + timeline dots + parallax ---------- */

  var io = new IntersectionObserver(function (entries) {

    entries.forEach(function (e) {

      if (e.isIntersecting) {

        e.target.classList.add('in');

        if (e.target.classList.contains('timeline')) {

          var items = e.target.querySelectorAll('li');

          items.forEach(function (li, i) {

            setTimeout(function () { li.classList.add('lit'); }, 500 + i * 450);

          });

        }

        io.unobserve(e.target);

      }

    });

  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal, .reveal-img, .timeline').forEach(function (el) { io.observe(el); });



  var gal = document.querySelectorAll('.masonry figure');

  if (gal.length) {

    var gio = new IntersectionObserver(function (entries) {

      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); gio.unobserve(e.target); } });

    }, { threshold: 0.1 });

    gal.forEach(function (f) { gio.observe(f); });

  }



  // subtle parallax on hero + finale imagery + scroll progress

  var pxEls = document.querySelectorAll('.finale-bg img');

  var pBar = document.getElementById('progress-bar');

  var ticking = false;

  window.addEventListener('scroll', function () {

    if (ticking || reduceMotion) return; ticking = true;

    requestAnimationFrame(function () {

      var y = window.scrollY;

      pxEls.forEach(function (img) { img.style.translate = '0 ' + Math.min(y * 0.12, 120) + 'px'; });

      if (pBar) {

        var max = document.documentElement.scrollHeight - window.innerHeight;

        pBar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

      }

      ticking = false;

    });

  }, { passive: true });



  /* ---------- gold confetti ---------- */

  function confetti(n) {

    if (reduceMotion) return;

    var colors = ['#C9AE6D', '#B89B63', '#EFE3C8', '#FFFDF6', '#D8BE8C'];

    for (var i = 0; i < n; i++) {

      (function () {

        var s = document.createElement('span');

        s.className = 'confetti-bit';

        var w = 5 + Math.random() * 6, h = 7 + Math.random() * 8;

        s.style.cssText = 'left:' + (20 + Math.random() * (window.innerWidth - 40)) + 'px;top:-20px;width:' + w +

          'px;height:' + h + 'px;background:' + colors[Math.floor(Math.random() * colors.length)] +

          ';border-radius:2px;transition:transform 2.4s ease-in,opacity 2.4s ease-in';

        document.body.appendChild(s);

        requestAnimationFrame(function () {

          s.style.transform = 'translate(' + ((Math.random() - .5) * 160) + 'px,' + (window.innerHeight + 60) +

            'px) rotate(' + (Math.random() * 720 - 360) + 'deg)';

          s.style.opacity = '0';

        });

        setTimeout(function () { s.remove(); }, 2700);

      })();

    }

  }



  /* ---------- scratch card (70% auto-complete) ---------- */

  var scv = document.getElementById('scratch-canvas');

  var sctx = scv ? scv.getContext('2d', { willReadFrequently: true }) : null;

  var sHint = document.getElementById('scratch-hint');

  var sBar = document.getElementById('scratch-bar');

  var sDone = document.getElementById('scratch-done');

  var sDown = false, sFinished = false, sPainted = false, last = null, progTick = 0, sTouched = false;



  function paintScratch() {

    var box = scv.parentElement.getBoundingClientRect();

    if (!box.width || !box.height) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    scv.width = Math.round(box.width * dpr); scv.height = Math.round(box.height * dpr);

    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var w = box.width, h = box.height;

    sctx.globalCompositeOperation = 'source-over'; sctx.globalAlpha = 1;

    // luxury ivory paper surface

    var g = sctx.createLinearGradient(0, 0, w, h);

    g.addColorStop(0, '#EFE7D6'); g.addColorStop(0.55, '#E7DCC4'); g.addColorStop(1, '#DCCFAF');

    sctx.fillStyle = g; sctx.fillRect(0, 0, w, h);

    // paper grain

    sctx.fillStyle = 'rgba(120,100,60,.10)';

    for (var j = 0; j < 420; j++) { sctx.fillRect(Math.random() * w, Math.random() * h, 1, 1); }

    // gold flecks

    sctx.fillStyle = 'rgba(184,155,99,.55)';

    for (var k = 0; k < 46; k++) { sctx.beginPath(); sctx.arc(Math.random() * w, Math.random() * h, 1.1, 0, 6.29); sctx.fill(); }

    // double-ring emblem

    var er = Math.min(w, h) * 0.19, cx = w / 2, cy = h * 0.42;

    sctx.strokeStyle = 'rgba(90,74,40,.75)'; sctx.lineWidth = 1.4;

    sctx.beginPath(); sctx.arc(cx, cy, er, 0, 6.29); sctx.stroke();

    sctx.strokeStyle = 'rgba(90,74,40,.4)'; sctx.lineWidth = 1;

    sctx.beginPath(); sctx.arc(cx, cy, er - 7, 0, 6.29); sctx.stroke();

    sctx.fillStyle = '#4A3F28'; sctx.textAlign = 'center'; sctx.textBaseline = 'middle';

    sctx.font = '500 24px Georgia, serif';

    sctx.fillText('A  ·  S', cx, cy - 4);

    sctx.font = '600 9px Manrope, sans-serif';

    sctx.fillText('S W I P E   T O   R E V E A L', cx, cy + 28);

    sFinished = false; sPainted = true;

    sDone.hidden = true;

    scv.style.opacity = '1'; scv.style.pointerEvents = 'auto'; scv.style.transition = 'none';

    if (sHint) sHint.classList.remove('hide');

    if (sBar) sBar.style.width = '0%';

  }

  function scratchAt(px, py) {

    var r = scv.getBoundingClientRect();

    var x = px - r.left, y = py - r.top;

    sctx.globalCompositeOperation = 'destination-out';

    sctx.lineWidth = Math.max(46, r.width * 0.13); sctx.lineCap = 'round'; sctx.lineJoin = 'round';

    sctx.beginPath();

    if (last) { sctx.moveTo(last.x, last.y); sctx.lineTo(x, y); sctx.stroke(); }

    else { sctx.beginPath(); sctx.arc(x, y, 24, 0, 6.29); sctx.fill(); }

    last = { x: x, y: y };

    sTouched = true;

    if (sHint) sHint.classList.add('hide');

    scratchProgress();

  }

  function scratchProgress() {

    var now = Date.now();

    if (now - progTick < 220) return; progTick = now;

    try {

      var d = sctx.getImageData(0, 0, scv.width, scv.height).data;

      var tot = 0, clr = 0, step = 4 * 28;

      for (var i = 3; i < d.length; i += step) { tot++; if (d[i] === 0) clr++; }

      var pc = Math.round(clr / tot * 100);

      if (sBar) sBar.style.width = Math.min(pc, 100) + '%';

      if (pc >= 70 && !sFinished) finishScratch();

    } catch (e) {}

  }

  function finishScratch() {

    sFinished = true;

    if (navigator.vibrate) { try { navigator.vibrate(25); } catch (e) {} }

    scv.style.transition = 'opacity 1s ease';

    scv.style.opacity = '0'; scv.style.pointerEvents = 'none';

    sDone.hidden = false;

    var card = document.getElementById('scratch-card');

    if (card) card.classList.add('complete');

    var under = document.querySelector('.su-date');

    if (under) under.classList.add('revealed');

    // subtle sparkle

    var r = card.getBoundingClientRect();

    sparkle(r.left + r.width / 2, r.top + r.height / 2, 46);

  }

  function sparkle(x, y, n) {

    var layer = document.createElement('div');

    layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:40';

    document.body.appendChild(layer);

    for (var i = 0; i < n; i++) {

      (function () {

        var s = document.createElement('span');

        var sz = 2 + Math.random() * 3;

        s.style.cssText = 'position:absolute;left:' + x + 'px;top:' + y + 'px;width:' + sz + 'px;height:' + sz +

          'px;border-radius:50%;background:#C9AE6D;transition:all 1.4s ease-out';

        layer.appendChild(s);

        requestAnimationFrame(function () {

          var a = Math.random() * 6.28, dist = 60 + Math.random() * 130;

          s.style.transform = 'translate(' + Math.cos(a) * dist + 'px,' + (Math.sin(a) * dist - 40) + 'px)';

          s.style.opacity = '0';

        });

      })();

    }

    setTimeout(function () { layer.remove(); }, 1700);

  }

  function scratchEnd() {

    sDown = false; last = null;

    if (sTouched && !sFinished) { sTouched = false; progTick = 0; scratchProgress(); }

  }

  if (scv && sctx) {

    scv.addEventListener('mousedown', function (e) { sDown = true; scratchAt(e.clientX, e.clientY); });

    window.addEventListener('mousemove', function (e) { if (sDown && !sFinished) scratchAt(e.clientX, e.clientY); });

    window.addEventListener('mouseup', scratchEnd);

    scv.addEventListener('touchstart', function (e) { e.preventDefault(); sDown = true; scratchAt(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });

    scv.addEventListener('touchmove', function (e) { e.preventDefault(); if (sDown && !sFinished) scratchAt(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });

    scv.addEventListener('touchend', scratchEnd);

    var painted = function () { if (!sPainted) paintScratch(); };

    setTimeout(painted, 350);

    setTimeout(painted, 2200);

    window.addEventListener('load', painted);

    var rT; window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { sPainted = false; if (!sFinished) paintScratch(); }, 200); });

    window.addEventListener('orientationchange', function () { setTimeout(function () { sPainted = false; if (!sFinished) paintScratch(); }, 350); });

  }



  /* ---------- countdown (18 Dec 2026, 7PM IST) ---------- */

  var target = new Date('2026-12-18T19:00:00+05:30').getTime();

  var lastVals = {};

  function setNum(id, v) {

    var el = document.getElementById(id);

    if (!el) return;

    v = String(v).padStart(2, '0');

    if (lastVals[id] !== v) {

      lastVals[id] = v;

      el.classList.add('tick');

      setTimeout(function () { el.textContent = v; el.classList.remove('tick'); }, 160);

    }

  }

  function tickCd() {

    var diff = Math.max(0, target - Date.now());

    var d = Math.floor(diff / 86400000);

    var h = Math.floor(diff / 3600000) % 24;

    var m = Math.floor(diff / 60000) % 60;

    var s = Math.floor(diff / 1000) % 60;

    setNum('cd-d', d); setNum('cd-h', h); setNum('cd-m', m); setNum('cd-s', s);

  }

  tickCd(); setInterval(tickCd, 1000);



  /* ---------- gallery lightbox ---------- */

  var lb = document.getElementById('lightbox');

  var lbImg = document.getElementById('lb-img');

  document.querySelectorAll('.masonry img').forEach(function (img) {

    img.addEventListener('error', function h() {

      img.removeEventListener('error', h);

      img.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop';

    });

    img.parentElement.addEventListener('click', function () {

      lbImg.src = img.src.replace('w=800', 'w=1400');

      lb.hidden = false;

      document.body.style.overflow = 'hidden';

    });

  });

  function closeLb() { lb.hidden = true; document.body.style.overflow = ''; }

  document.getElementById('lb-close').addEventListener('click', closeLb);

  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });



  /* ---------- RSVP (stored in this browser) ---------- */

  var form = document.getElementById('rsvp-form');

  var ok = document.getElementById('rsvp-ok');

  var okSub = document.getElementById('rsvp-ok-sub');

  if (form) {

    form.addEventListener('submit', function (e) {

      e.preventDefault();

      var name = form.name.value.trim();

      var phone = form.phone.value.trim();

      var guests = form.guests.value;

      if (!name || !phone) {

        (!name ? form.name : form.phone).focus();

        return;

      }

      var attend = form.querySelector('input[name="attend"]:checked').value;

      try {

        var all = JSON.parse(localStorage.getItem('site5_rsvp') || '[]');

        all.push({ name: name, phone: phone, guests: guests, attend: attend,

                   message: form.message.value.trim(), at: new Date().toISOString() });

        localStorage.setItem('site5_rsvp', JSON.stringify(all));

      } catch (err) {}

      form.hidden = true;

      ok.hidden = false;

      confetti(90);

      okSub.textContent = attend === 'accept'

        ? 'Thank you, ' + name.split(' ')[0] + ' — your RSVP' + (guests > 1 ? ' for ' + guests + ' guests' : '') + ' has been received.'

        : 'Thank you, ' + name.split(' ')[0] + ' — you will be missed, and your wishes mean the world.';

      ok.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });

    });

  }

})();
