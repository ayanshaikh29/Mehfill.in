/* Blush Garden — interactions (site-6).
   EDITABLE WEDDING CONFIG: change the values below — everything renders from here.
   Names/dates below are editable sample details for this demo template. */
var WEDDING = {
  bride: "Anaya",
  groom: "Vihaan",
  inviteLine: "request the pleasure of your company",
  familyLine: "Together with their families",
  dateISO: "2027-02-14T19:00:00+05:30", // EDIT ME — wedding date + time
  timeText: "7:00 PM onwards",
  venue: "The Celebration Gardens", // EDIT ME — sample venue
  address: "Mumbai, Maharashtra", // EDIT ME
  mapsQuery: "Celebration Gardens Mumbai", // EDIT ME — used for maps links
  venuePhoto: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1000&auto=format&fit=crop",
  whatsapp: "", // EDIT ME — e.g. "919876543210" to enable WhatsApp RSVP confirm (empty = hidden)
  music: "music.m4a", // Laavan wedding song — full track from 0:00, no cuts
  events: [ // EDIT ME — add/remove/reorder freely; empty items are hidden
    { title: "Welcome Evening", date: "12 February 2027", time: "6:00 PM", venue: "Garden Lawns", desc: "An easy evening of music and conversation as our families meet." },
    { title: "Wedding Ceremony", date: "14 February 2027", time: "11:00 AM", venue: "Flower Pavilion", desc: "Our vows beneath an arch of roses and jasmine." },
    { title: "Reception & Dinner", date: "14 February 2027", time: "7:00 PM", venue: "Grand Hall", desc: "Dinner, toasts and dancing under candlelight." },
    { title: "Farewell Brunch", date: "15 February 2027", time: "10:30 AM", venue: "Terrace", desc: "One last morning together before we say goodbye." }
  ],
  gallery: [ // EDIT ME — licensed wedding imagery (Unsplash)
    { src: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop", alt: "Newly married couple" },
    { src: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=800&auto=format&fit=crop", alt: "Outdoor wedding aisle with flowers" },
    { src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop", alt: "Wedding table setting with candles" },
    { src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800&auto=format&fit=crop", alt: "Couple at sunset" },
    { src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800&auto=format&fit=crop", alt: "Bridal portrait with bouquet" },
    { src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=800&auto=format&fit=crop", alt: "Hands with wedding bouquet" },
    { src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=800&auto=format&fit=crop", alt: "Couple sharing a quiet moment" },
    { src: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop", alt: "Soft blush wedding florals" }
  ],
  quotes: [
    { text: "Two hearts, two families, one beautiful journey.", by: "Our promise" },
    { text: "And suddenly, all the love songs were about one person.", by: "For each other" }
  ]
};

(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var REVEAL_AT = 4.0; // seconds of actual video playback before names reveal

  /* ---------- gentle floating petals ---------- */
  (function petals() {
    var cv = document.getElementById('leafCanvas');
    if (!cv || reduceMotion) return;
    var ctx = cv.getContext('2d'), W, H, ps = [];
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    var COLORS = ['rgba(200,130,131,', 'rgba(232,185,178,', 'rgba(198,161,91,', 'rgba(120,133,106,'];
    function make(top) {
      return { x: Math.random() * W, y: top ? -12 : Math.random() * H,
        r: 2 + Math.random() * 3.5, vy: .25 + Math.random() * .55,
        ph: Math.random() * 6.28, c: COLORS[Math.floor(Math.random() * COLORS.length)],
        a: .25 + Math.random() * .35 };
    }
    size();
    var n = Math.min(22, Math.floor(W / 34));
    for (var i = 0; i < n; i++) ps.push(make(false));
    window.addEventListener('resize', size);
    var hidden = false;
    document.addEventListener('visibilitychange', function () { hidden = document.hidden; });
    (function tick() {
      requestAnimationFrame(tick);
      if (hidden) return;
      if (window.__filmPlaying) return; // pause FX while cover film plays — smooth video on low-end phones
      ctx.clearRect(0, 0, W, H);
      for (var k = 0; k < ps.length; k++) {
        var p = ps[k];
        p.ph += .012; p.y += p.vy;
        if (p.y > H + 12) ps[k] = make(true);
        else {
          var x = p.x + Math.sin(p.ph) * 22;
          ctx.beginPath(); ctx.arc(x, p.y, p.r, 0, 6.29);
          ctx.fillStyle = p.c + p.a + ')'; ctx.fill();
        }
      }
    })();
  })();

  /* ---------- celebration confetti (canvas burst + rain) ---------- */
  var cCanvas = null, cCtx = null, cParts = [], cRunning = false, cW = 0, cH = 0;
  var CCOLORS = ['#C6A15B', '#96713D', '#E8B9B2', '#FFFDF7', '#78856A', '#F5E8D7', '#ffffff'];
  function cSize() {
    if (!cCanvas) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cW = window.innerWidth; cH = window.innerHeight;
    cCanvas.width = cW * dpr; cCanvas.height = cH * dpr;
    cCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function cSetup() {
    if (cCanvas) return;
    cCanvas = document.createElement('canvas');
    cCanvas.id = 'celebrateCanvas';
    cCanvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cCanvas);
    cCtx = cCanvas.getContext('2d');
    cSize();
    window.addEventListener('resize', cSize);
  }
  function cBurst(n) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, sp = 4 + Math.random() * 9;
      cParts.push({ x: cW * (0.2 + Math.random() * 0.6), y: cH * 0.28,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 5,
        w: 5 + Math.random() * 7, h: 7 + Math.random() * 9,
        r: Math.random() * 6.28, vr: (Math.random() - .5) * .3,
        c: CCOLORS[(Math.random() * CCOLORS.length) | 0],
        life: 1, decay: .004 + Math.random() * .006, ph: Math.random() * 6.28 });
    }
  }
  function cRain(n) {
    for (var j = 0; j < n; j++) {
      cParts.push({ x: Math.random() * cW, y: -20 - Math.random() * cH * .3,
        vx: (Math.random() - .5) * 1.4, vy: 2 + Math.random() * 3,
        w: 5 + Math.random() * 7, h: 7 + Math.random() * 9,
        r: Math.random() * 6.28, vr: (Math.random() - .5) * .25,
        c: CCOLORS[(Math.random() * CCOLORS.length) | 0],
        life: 1, decay: .002 + Math.random() * .003, ph: Math.random() * 6.28 });
    }
  }
  function cTick() {
    if (!cParts.length) { cRunning = false; if (cCtx) cCtx.clearRect(0, 0, cW, cH); return; }
    requestAnimationFrame(cTick);
    if (document.hidden) return;
    cCtx.clearRect(0, 0, cW, cH);
    for (var k = cParts.length - 1; k >= 0; k--) {
      var p = cParts[k];
      p.vy += .14; p.vx *= .99;
      p.ph += .05;
      p.x += p.vx + Math.sin(p.ph) * 1.2; p.y += p.vy; p.r += p.vr;
      p.life -= p.decay;
      if (p.life <= 0 || p.y > cH + 30) { cParts.splice(k, 1); continue; }
      cCtx.save();
      cCtx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.4));
      cCtx.translate(p.x, p.y); cCtx.rotate(p.r);
      cCtx.fillStyle = p.c;
      cCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cCtx.restore();
    }
  }
  function celebrate(n) {
    if (reduceMotion) return;
    cSetup(); cSize();
    var total = Math.max(40, Math.min(220, n || 120));
    var nb = Math.round(total * .45);
    cBurst(nb);
    cRain(total - nb);
    if (!cRunning) { cRunning = true; cTick(); }
  }

  /* ---------- ambient gold sparkles (whole site, always on) ---------- */
  (function sparkles() {
    var cv = document.getElementById('sparkCanvas');
    if (!cv || reduceMotion) return;
    var ctx = cv.getContext('2d'), W, H, stars = [];
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function make(any) {
      return { x: Math.random() * W, y: any ? Math.random() * H : -10,
        r: 4 + Math.random() * 7, ph: Math.random() * 6.28,
        vy: .12 + Math.random() * .25, sp: .008 + Math.random() * .02 };
    }
    size();
    var n = Math.min(14, Math.floor(W / 60));
    for (var i = 0; i < n; i++) stars.push(make(true));
    window.addEventListener('resize', size);
    var hidden = false;
    document.addEventListener('visibilitychange', function () { hidden = document.hidden; });
    (function tick() {
      requestAnimationFrame(tick);
      if (hidden) return;
      if (window.__filmPlaying) return; // pause FX while cover film plays — smooth video on low-end phones
      ctx.clearRect(0, 0, W, H);
      for (var k = 0; k < stars.length; k++) {
        var st = stars[k];
        st.ph += st.sp; st.y += st.vy;
        if (st.y > H + 12) { stars[k] = make(false); continue; }
        var tw = .15 + Math.abs(Math.sin(st.ph)) * .6;
        ctx.strokeStyle = 'rgba(198,161,91,' + tw.toFixed(2) + ')';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(st.x - st.r, st.y); ctx.lineTo(st.x + st.r, st.y);
        ctx.moveTo(st.x, st.y - st.r); ctx.lineTo(st.x, st.y + st.r);
        ctx.stroke();
      }
    })();
  })();

  /* ---------- cinematic cover: tap -> play -> reveal at 4s -> dock ----------
     Buffer-aware: preloads on page load, shows real buffer %, only starts when
     enough is buffered, and debounces 'waiting' so "Loading film…" doesn't
     flicker on every micro-stall. Fixes beech-beech me atakna on slow 4G. */
  (function cover() {
    var c = document.getElementById('cover');
    var video = document.getElementById('coverVideo');
    var btn = document.getElementById('openBtn');
    var status = document.getElementById('coverStatus');
    var invite = document.getElementById('coverInvite');
    var bar = document.getElementById('coverBar');
    var cue = document.getElementById('coverCue');
    var replay = document.getElementById('coverReplay');
    var skip = document.getElementById('coverSkip');
    if (!c || !video || !btn) return;
    function say(m) { if (status) { status.hidden = false; status.textContent = m; } }
    function quiet() { if (status) status.hidden = true; }
    var opened = false, entered = false, revealed = false;
    var ready = false, wantPlay = false, waitTimer = null, readyTimer = null;
    function reveal() {
      if (revealed) return; revealed = true;
      if (invite) { invite.classList.remove('show'); invite.classList.add('hide'); }
      c.classList.add('shownames');
    }
    function enter(dock) {
      if (entered) return; entered = true;
      clearTimeout(waitTimer); clearTimeout(readyTimer);
      if (dock !== false && video && !video.paused) { try { video.pause(); } catch (e) {} }
      if (invite) { invite.classList.remove('show'); invite.classList.add('hide'); }
      c.classList.add('docked');
      document.body.classList.remove('locked');
    }
    function bufferedSec() {
      try {
        if (!video.buffered || !video.buffered.length) return 0;
        var end = video.buffered.end(video.buffered.length - 1);
        var start = 0;
        try { start = video.buffered.start(0); } catch (e) {}
        return Math.max(0, end - Math.max(start, video.currentTime || 0));
      } catch (e) { return 0; }
    }
    function bufferedPct() {
      try {
        if (!video.buffered || !video.buffered.length || !video.duration) return 0;
        return Math.min(100, Math.round(video.buffered.end(video.buffered.length - 1) / video.duration * 100));
      } catch (e) { return 0; }
    }
    function markReady() {
      if (ready || entered) return;
      ready = true;
      if (bar) bar.style.width = '100%';
      if (wantPlay) { doPlay(); }
      else quiet();
    }
    function paintLoadUI() {
      if (opened || entered || ready) return;
      var p = bufferedPct();
      if (p > 0 && bar) bar.style.width = p + '%';
      say(p > 0 ? ('Loading film… ' + p + '%') : 'Loading film…');
    }
    function doPlay() {
      if (entered) return;
      quiet();
      try { if (video.currentTime > 0.1 && video.paused) { /* resume */ } else { try { video.currentTime = 0; } catch (e) {} } } catch (e) {}
      var pr = null;
      try { pr = video.play(); } catch (e) { pr = null; }
      if (pr && pr.catch) pr.catch(function () {
        opened = false; wantPlay = false;
        say('Tap again to retry.');
      });
    }
    if (reduceMotion) { reveal(); enter(false); quiet(); return; }
    document.body.classList.add('locked');
    window.scrollTo(0, 0);
    function start() {
      if (opened) return; opened = true; wantPlay = true;
      // Music FIRST: must run inside the tap gesture with zero delay.
      if (typeof window.startSiteMusic === 'function') window.startSiteMusic();
      if (navigator.vibrate) { try { navigator.vibrate(15); } catch (e) {} }
      // HQ film (~3Mbps): play only with deep buffer so it never stalls mid-way.
      // canplaythrough (markReady) or >=7s buffered or >=75% or HAVE_ENOUGH_DATA.
      if (ready || bufferedSec() >= 7 || bufferedPct() >= 75 || video.readyState >= 4) { doPlay(); }
      else {
        say('Buffering film…');
        var onCanPlay = function () { if (wantPlay && !entered) doPlay(); };
        video.addEventListener('canplaythrough', onCanPlay, { once: true });
        // Fallback: play anyway after 9s so users never get stuck.
        clearTimeout(readyTimer);
        readyTimer = setTimeout(function () { if (wantPlay && !entered && video.paused) doPlay(); }, 9000);
      }
      // fallback sync: if timeupdate lags, reveal from play-time (guarded by currentTime)
      setTimeout(function () {
        try { if (!video.paused && video.currentTime >= REVEAL_AT) reveal(); } catch (e) {}
      }, (REVEAL_AT + 0.6) * 1000);
    }
    btn.addEventListener('click', start);
    c.addEventListener('click', function (e) {
      if (opened || entered) return;
      if (e.target.closest && e.target.closest('button, a')) return;
      start();
    });
    // Start preloading immediately so Tap -> instant play (was: 0% buffered on tap).
    try { video.preload = 'auto'; video.load(); } catch (e) {}
    video.addEventListener('progress', paintLoadUI);
    video.addEventListener('loadedmetadata', paintLoadUI);
    video.addEventListener('canplay', paintLoadUI);
    video.addEventListener('canplaythrough', markReady);
    // Some browsers never fire canplaythrough on slow networks — poll buffer.
    var loadPoll = setInterval(function () {
      paintLoadUI();
      if (ready || entered) { clearInterval(loadPoll); return; }
      if (bufferedPct() >= 90 || bufferedSec() >= 8 || video.readyState >= 4) { markReady(); clearInterval(loadPoll); }
    }, 500);
    setTimeout(function () { clearInterval(loadPoll); if (!ready && !entered) markReady(); }, 12000);
    video.addEventListener('play', function () {
      c.classList.add('playing');
      window.__filmPlaying = true;
      if (invite) invite.classList.add('show');
      quiet();
    });
    video.addEventListener('timeupdate', function () {
      try {
        if (video.currentTime >= REVEAL_AT) reveal();
        if (video.duration && bar) bar.style.width = (video.currentTime / video.duration * 100) + '%';
      } catch (e) {}
    });
    video.addEventListener('seeked', function () {
      try { if (video.currentTime >= REVEAL_AT) reveal(); } catch (e) {}
    });
    // Debounced stall UI: ignore micro-stalls <400ms so "Loading film…" stops flickering.
    function onStall() {
      if (!opened || entered || !wantPlay) return;
      clearTimeout(waitTimer);
      waitTimer = setTimeout(function () {
        if (!video.paused && !video.ended && !entered) say('Loading film…');
      }, 400);
    }
    function onFlow() {
      clearTimeout(waitTimer);
      if (opened && !entered && !video.paused) quiet();
    }
    video.addEventListener('waiting', onStall);
    video.addEventListener('stalled', onStall);
    video.addEventListener('playing', onFlow);
    video.addEventListener('canplay', onFlow);
    video.addEventListener('pause', function () { window.__filmPlaying = false; });
    video.addEventListener('ended', function () { clearTimeout(waitTimer); window.__filmPlaying = false; celebrate(130); enter(false); });
    video.addEventListener('error', function () { reveal(); enter(true); }, true);
    if (skip) skip.addEventListener('click', function (e) {
      e.stopPropagation(); reveal(); enter(true);
      var m = document.getElementById('intro');
      if (m && m.scrollIntoView) m.scrollIntoView({ behavior: 'smooth' });
    });
    if (replay) replay.addEventListener('click', function (e) {
      e.stopPropagation();
      entered = false; revealed = false; opened = false; ready = false; wantPlay = false;
      clearTimeout(waitTimer); clearTimeout(readyTimer);
      c.classList.remove('docked', 'playing', 'shownames');
      document.body.classList.add('locked');
      window.scrollTo(0, 0);
      try { video.currentTime = 0; } catch (err) {}
      start();
    });
  })();

  /* ---------- background music: full track from 0:00, no cuts ---------- */
  var MUSIC_VOL = 0.55;
  (function music() {
    var b = document.getElementById('musicBtn');
    if (!b || !WEDDING.music) { if (b) b.hidden = true; return; }
    var a = new Audio(WEDDING.music);
    a.loop = true; a.preload = 'none'; // fetch starts on tap — video preload keeps full bandwidth till then
    try { a.volume = MUSIC_VOL; } catch (e) {}
    var started = false, on = false;
    function setBtn(v) {
      on = v;
      b.classList.toggle('on', v);
      b.setAttribute('aria-label', v ? 'Mute background music' : 'Play background music');
    }
    window.startSiteMusic = function () {
      if (started) return; started = true;
      setBtn(true);
      var pr = null;
      try { pr = a.play(); } catch (e) {}
      if (pr && pr.then) pr.then(function () { setBtn(true); },
        function () { setBtn(false); started = false; });
    };
    b.addEventListener('click', function () {
      if (a.paused) {
        if (!started) window.startSiteMusic();
        else { var pr = null; try { pr = a.play(); } catch (e) {} setBtn(true); }
      } else { a.muted = !a.muted; setBtn(!a.muted); }
    });
  })();

  /* ---------- scroll reveals + progress ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  var pBar = document.getElementById('scrollBar'), ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking || reduceMotion) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      if (pBar) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        pBar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
      }
      ticking = false;
    });
  }, { passive: true });

  /* ---------- scratch trio (DAY / MONTH / YEAR from CONFIG) ---------- */
  (function scratch() {
    var d = new Date(WEDDING.dateISO);
    if (isNaN(d.getTime())) return;
    var MONTHS = ['January','February','March','April','May','June','July',
      'August','September','October','November','December'];
    var vals = [
      { k: 'Day', v: String(d.getDate()) },
      { k: 'Month', v: MONTHS[d.getMonth()] },
      { k: 'Year', v: String(d.getFullYear()) }
    ];
    document.querySelectorAll('.scard').forEach(function (card, idx) {
      var data = vals[idx % vals.length];
      card.querySelector('.k').textContent = data.k;
      card.querySelector('.v').textContent = data.v;
      var cv = card.querySelector('canvas');
      if (!cv) return;
      var ctx = cv.getContext('2d', { willReadFrequently: true });
      var W, H, down = false, done = false, last = null, moves = 0;
      function paint() {
        var r = card.getBoundingClientRect();
        W = Math.max(80, Math.floor(r.width)); H = Math.max(100, Math.floor(r.height));
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = W * dpr; cv.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, '#C6A15B'); g.addColorStop(.5, '#96713D'); g.addColorStop(1, '#C6A15B');
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(255,253,247,.85)';
        ctx.font = '700 10px Inter, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('S C R A T C H', W / 2, H / 2 - 4);
        ctx.font = '400 16px Georgia, serif';
        ctx.fillText('\u2726', W / 2, H / 2 + 18);
        done = false;
        var hint = card.parentElement.querySelector('.tap-reveal');
        if (hint) hint.hidden = false;
      }
      function erase(x, y) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = Math.max(30, W * 0.22); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath();
        if (last) { ctx.moveTo(last.x, last.y); ctx.lineTo(x, y); ctx.stroke(); }
        else { ctx.arc(x, y, 16, 0, 6.29); ctx.fill(); }
        last = { x: x, y: y };
      }
      function pct() {
        try {
          var px = ctx.getImageData(0, 0, cv.width, cv.height).data;
          var clear = 0, total = px.length / 4;
          for (var i = 3; i < px.length; i += 4 * 7) { if (px[i] === 0) clear++; }
          return clear / (total / 7);
        } catch (e) { return 0; }
      }
      function finish() {
        if (done) return; done = true;
        ctx.clearRect(0, 0, W, H);
        card.classList.add('done');
        var hint = card.parentElement.querySelector('.tap-reveal');
        if (hint) hint.hidden = true;
      }
      function pos(e) {
        var r = cv.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
      }
      cv.addEventListener('pointerdown', function (e) {
        if (done) return; down = true; last = null;
        try { cv.setPointerCapture(e.pointerId); } catch (err) {}
        var p = pos(e); erase(p.x, p.y);
      });
      cv.addEventListener('pointermove', function (e) {
        if (!down || done) return;
        var p = pos(e); erase(p.x, p.y);
        if (++moves % 6 === 0 && pct() > 0.55) finish();
      });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
        cv.addEventListener(ev, function () { down = false; last = null; });
      });
      var btn = card.parentElement.querySelector('.tap-reveal');
      if (btn) btn.addEventListener('click', finish);
      if (document.readyState === 'complete') paint();
      else window.addEventListener('load', paint);
      window.addEventListener('resize', function () { if (!done) paint(); });
    });
  })();

  /* ---------- countdown ---------- */
  (function countdown() {
    var target = new Date(WEDDING.dateISO).getTime();
    var box = document.getElementById('countBox');
    var note = document.getElementById('countNote');
    if (!box || isNaN(target)) return;
    var dd = document.getElementById('cdD'), hh = document.getElementById('cdH'),
        mm = document.getElementById('cdM'), ss = document.getElementById('cdS');
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        dd.textContent = hh.textContent = mm.textContent = ss.textContent = '00';
        if (note) note.textContent = 'Just married \u2014 thank you for celebrating with us.';
        clearInterval(timer);
        return;
      }
      var s = Math.floor(diff / 1000);
      dd.textContent = pad(Math.floor(s / 86400));
      hh.textContent = pad(Math.floor(s % 86400 / 3600));
      mm.textContent = pad(Math.floor(s % 3600 / 60));
      ss.textContent = pad(s % 60);
    }
    tick();
    var timer = setInterval(tick, 1000);
  })();

  /* ---------- events (from CONFIG; empty hidden) ---------- */
  (function events() {
    var wrap = document.getElementById('eventList');
    if (!wrap) return;
    var list = (WEDDING.events || []).filter(function (e) { return e && e.title; });
    if (!list.length) { wrap.innerHTML = '<p class="lead">Event details coming soon.</p>'; return; }
    wrap.innerHTML = list.map(function (e) {
      return '<article class="event reveal">' +
        '<p class="et">' + (e.date || '') + (e.time ? ' \u00b7 ' + e.time : '') + '</p>' +
        '<h3>' + e.title + '</h3>' +
        (e.desc ? '<p class="ed">' + e.desc + '</p>' : '') +
        '<hr />' +
        (e.venue ? '<p class="ev">' + e.venue + '</p>' : '') +
        '</article>';
    }).join('');
    wrap.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  })();

  /* ---------- gallery + lightbox (from CONFIG) ---------- */
  (function gallery() {
    var grid = document.getElementById('galGrid');
    var lb = document.getElementById('lightbox');
    if (!grid || !lb) return;
    var imgs = (WEDDING.gallery || []).filter(function (g) { return g && g.src; });
    var lbImg = document.getElementById('lbImg');
    var lbCount = document.getElementById('lbCount');
    var cur = 0;
    grid.innerHTML = imgs.map(function (g, i) {
      return '<figure class="reveal"><img src="' + g.src + '" alt="' + (g.alt || 'Wedding photo') +
        '" loading="lazy" data-i="' + i + '" /></figure>';
    }).join('');
    grid.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.closest('figure').style.display = 'none';
      });
      img.addEventListener('click', function () { open(+img.dataset.i); });
    });
    grid.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
    function show() {
      lbImg.src = imgs[cur].src.replace('w=800', 'w=1200');
      lbImg.alt = imgs[cur].alt || 'Wedding photo enlarged';
      if (lbCount) lbCount.textContent = (cur + 1) + ' / ' + imgs.length;
    }
    function open(i) {
      if (!imgs.length) return;
      cur = (i + imgs.length) % imgs.length;
      lb.hidden = false; document.body.style.overflow = 'hidden'; show();
    }
    function close() { lb.hidden = true; document.body.style.overflow = ''; }
    function step(n) { cur = (cur + n + imgs.length) % imgs.length; show(); }
    document.getElementById('lbClose').addEventListener('click', close);
    document.getElementById('lbPrev').addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
    document.getElementById('lbNext').addEventListener('click', function (e) { e.stopPropagation(); step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
    var tx = null;
    lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    }, { passive: true });
  })();

  /* ---------- RSVP (honest demo storage) ---------- */
  (function rsvp() {
    var form = document.getElementById('rsvpForm');
    if (!form) return;
    var ok = document.getElementById('rsvpOk');
    var wa = document.getElementById('rsvpWa');
    if (WEDDING.whatsapp && wa) {
      wa.hidden = false;
      wa.href = 'https://wa.me/' + WEDDING.whatsapp + '?text=' +
        encodeURIComponent('Hi! I would like to RSVP for the wedding.');
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var guests = Math.max(1, Math.min(20, parseInt(form.guests.value, 10) || 1));
      var err = form.querySelector('.field-err');
      if (name.length < 2) {
        if (err) err.textContent = 'Please enter your name.';
        form.name.focus();
        return;
      }
      if (err) err.textContent = '';
      var attend = form.querySelector('input[name="attend"]:checked').value;
      try {
        var all = JSON.parse(localStorage.getItem('site6_rsvp') || '[]');
        all.push({ name: name, guests: guests, attend: attend,
          message: form.message.value.trim(), at: new Date().toISOString() });
        localStorage.setItem('site6_rsvp', JSON.stringify(all));
      } catch (ex) {}
      if (wa && WEDDING.whatsapp) {
        wa.href = 'https://wa.me/' + WEDDING.whatsapp + '?text=' + encodeURIComponent(
          'Hi! ' + name + ' (' + guests + ' guest' + (guests > 1 ? 's' : '') + ') — ' +
          (attend === 'accept' ? 'accepts with pleasure.' : 'regretfully declines.'));
      }
      celebrate(70);
      form.hidden = true;
      ok.hidden = false;
      document.getElementById('rsvpSub').textContent =
        'Thank you, ' + name.split(' ')[0] + ' \u2014 your response is saved on this device (demo).' +
        (WEDDING.whatsapp ? '' : ' Add a WhatsApp number in the config to confirm instantly.');
      ok.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    });
  })();
})();
