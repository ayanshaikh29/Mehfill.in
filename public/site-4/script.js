/* Mehfill.in — A | M premium invitation (vanilla JS) */
(function () {
  'use strict';

  /* botanical corners */
  var cornerSVG = {
    1: '<svg viewBox="0 0 200 320" fill="none" style="width:100%;height:auto"><path d="M100 310 C 96 230, 104 150, 100 15" stroke="#7C8668" stroke-width="2.5" stroke-linecap="round" opacity=".7"/><g opacity=".55" fill="#7C8668"><ellipse cx="78" cy="70" rx="20" ry="13" transform="rotate(-28 78 70)"/><ellipse cx="122" cy="110" rx="20" ry="13" transform="rotate(26 122 110)"/><ellipse cx="78" cy="155" rx="20" ry="13" transform="rotate(-26 78 155)"/><ellipse cx="122" cy="200" rx="20" ry="13" transform="rotate(24 122 200)"/></g><g fill="#FFFDF8" stroke="#E8B9AE" stroke-width=".7"><circle cx="40" cy="60" r="3.2"/><circle cx="150" cy="90" r="3"/><circle cx="60" cy="190" r="3.4"/></g><ellipse cx="60" cy="230" rx="20" ry="11" fill="#E8B9AE" opacity=".65" transform="rotate(-22 60 230)"/></svg>',
    2: '<svg viewBox="0 0 200 200" fill="none" style="width:100%;height:auto"><g stroke="#7C8668" stroke-width=".7" opacity=".55"><line x1="100" y1="110" x2="50" y2="55"/><line x1="100" y1="110" x2="140" y2="40"/><line x1="100" y1="110" x2="165" y2="105"/></g><g fill="#FFFDF8" stroke="#E8B9AE" stroke-width=".7"><circle cx="50" cy="55" r="4"/><circle cx="140" cy="40" r="3.6"/><circle cx="165" cy="105" r="4"/></g><ellipse cx="120" cy="140" rx="22" ry="12" fill="#E8B9AE" opacity=".6" transform="rotate(14 120 140)"/><g fill="#C8A86B" opacity=".55"><circle cx="60" cy="120" r="1.6"/><circle cx="150" cy="150" r="1.3"/></g></svg>',
    3: '<svg viewBox="0 0 200 260" fill="none" style="width:100%;height:auto"><path d="M100 250 C 98 180, 102 120, 100 30" stroke="#7C8668" stroke-width="2" opacity=".6"/><g fill="#AAB39A" opacity=".6"><ellipse cx="80" cy="90" rx="18" ry="12" transform="rotate(-26 80 90)"/><ellipse cx="120" cy="130" rx="18" ry="12" transform="rotate(24 120 130)"/></g><g fill="#C8A86B" opacity=".5"><circle cx="50" cy="60" r="1.6"/><circle cx="150" cy="70" r="1.8"/></g></svg>'
  };
  document.querySelectorAll('.corner').forEach(function (el) {
    var v = el.getAttribute('data-variant') || '1';
    el.innerHTML = cornerSVG[v] || cornerSVG[1];
    if (el.classList.contains('tr') || el.classList.contains('br')) el.style.transform = 'scaleX(-1)';
  });
  document.querySelectorAll('.card-corner').forEach(function (el) {
    el.innerHTML = '<svg viewBox="0 0 70 70" fill="none"><path d="M2 68 V14 Q2 2 14 2 H68" stroke="#7C8668" stroke-width="1.4"/><circle cx="14" cy="14" r="2.4" fill="#C8A86B"/><ellipse cx="30" cy="30" rx="9" ry="5.5" fill="#E8B9AE" opacity=".6" transform="rotate(-24 30 30)"/></svg>';
  });

  /* ---------- video cover: tap middle -> play video + music from 0:32 ---------- */
  var cover = document.getElementById('cover');
  var coverVideo = document.getElementById('coverVideo');
  var openBtn = document.getElementById('openBtn');
  var coverBar = document.getElementById('coverBar');
  var coverSkip = document.getElementById('coverSkip');
  var opened = false, entered = false;
  document.body.style.overflow = 'hidden';

  function enterSite() {
    if (entered) return; entered = true;
    try { if (coverVideo) coverVideo.pause(); } catch (e) {}
    cover.classList.add('open');
    document.body.style.overflow = '';
    window.scrollTo(0, 0);
  }

  function startShow() {
    if (opened) return; opened = true;
    cover.classList.add('playing');
    if (coverSkip) coverSkip.hidden = false;
    setTimeout(function () { if (!entered) cover.classList.add('show-names'); }, 2500);
    playMusic();
    if (coverVideo) {
      try { coverVideo.currentTime = 0; } catch (e) {}
      try { coverVideo.muted = true; } catch (e) {}
      var pr = null;
      try { pr = coverVideo.play(); } catch (e) { pr = null; }
      if (pr && pr.catch) pr.catch(function () { enterSite(); });
    } else enterSite();
    setTimeout(function () { if (!entered) enterSite(); }, 90000); // safety
  }

  if (openBtn) openBtn.addEventListener('click', function (e) { e.stopPropagation(); startShow(); });
  if (cover) cover.addEventListener('click', function () { if (!opened) startShow(); });
  if (coverSkip) coverSkip.addEventListener('click', function (e) { e.stopPropagation(); enterSite(); });
  if (coverVideo) {
    coverVideo.addEventListener('ended', function () {
      setTimeout(function () {
        enterSite();
        setTimeout(function () {
          celebrateBurst(window.innerWidth / 2, window.innerHeight * 0.32, 110);
          celebrateRain(2800);
          vibrate([20, 40, 20]);
        }, 850);
      }, 900);
    });
    coverVideo.addEventListener('error', function () { if (!opened) enterSite(); });
    coverVideo.addEventListener('timeupdate', function () {
      try {
        if (coverVideo.duration && coverBar) {
          coverBar.style.width = (coverVideo.currentTime / coverVideo.duration * 100) + '%';
        }
      } catch (e) {}
    });
    try { coverVideo.pause(); } catch (e) {}
  }

  /* reveals */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* heart draw */
  var heartFrame = document.getElementById('heartFrame');
  if (heartFrame) {
    new IntersectionObserver(function (es, obs) {
      es.forEach(function (e) { if (e.isIntersecting) { heartFrame.classList.add('drawn'); obs.disconnect(); } });
    }, { threshold: 0.35 }).observe(heartFrame);
  }

  /* hero arch tilt + scroll progress + top button */
  var arch = document.getElementById('heroArch');
  var tProg = document.getElementById('tProgress');
  var timeline = document.getElementById('timeline');
  var scrollFill = document.getElementById('scrollFill');
  var scrollBar = document.getElementById('scrollBar');
  var topBtn = document.getElementById('topBtn');
  function onScroll() {
    if (timeline && tProg) {
      var r = timeline.getBoundingClientRect();
      var seen = Math.min(Math.max((window.innerHeight * 0.7 - r.top) / Math.max(r.height, 1), 0), 1);
      tProg.style.height = (seen * 100) + '%';
    }
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var sc = max > 0 ? h.scrollTop / max : 0;
    if (scrollFill && max > 0) scrollFill.style.height = (30 + sc * 70) + '%';
    if (scrollBar) scrollBar.style.width = (sc * 100) + '%';
    if (topBtn) topBtn.classList.toggle('show', h.scrollTop > window.innerHeight * 0.9);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (topBtn) topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });
  /* chapters light up as they arrive */
  if ('IntersectionObserver' in window) {
    var litObs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('lit'); litObs.unobserve(e.target); } });
    }, { threshold: 0.5 });
    document.querySelectorAll('.chapter').forEach(function (c) { litObs.observe(c); });
  } else {
    document.querySelectorAll('.chapter').forEach(function (c) { c.classList.add('lit'); });
  }
  if (arch) {
    document.getElementById('top').addEventListener('pointermove', function (e) {
      var r = arch.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      arch.style.transform = 'perspective(800px) rotateY(' + (dx * 7) + 'deg)';
    });
  }

  /* countdown — tick pop on change + note */
  var target = new Date('2026-12-18T19:00:00+05:30').getTime();
  var cdD = document.getElementById('cdD'), cdH = document.getElementById('cdH'),
      cdM = document.getElementById('cdM'), cdS = document.getElementById('cdS');
  var cdNote = document.getElementById('cdNote');
  var lastVals = {};
  function pad(n, l) { n = String(n); while (n.length < (l || 2)) n = '0' + n; return n; }
  function setNum(el, id, v) {
    if (!el) return;
    if (lastVals[id] !== v) {
      el.textContent = v;
      if (lastVals[id] !== undefined) { el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); }
      lastVals[id] = v;
    }
  }
  function tick() {
    var diff = Math.max(0, target - Date.now());
    var d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24,
        m = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
    setNum(cdD, 'd', pad(d, 3)); setNum(cdH, 'h', pad(h));
    setNum(cdM, 'm', pad(m)); setNum(cdS, 's', pad(s));
    if (cdNote) {
      if (diff <= 0) cdNote.textContent = 'Just married — thank you for celebrating with us.';
      else if (d === 0) cdNote.textContent = 'Almost time — see you very soon.';
      else if (d === 1) cdNote.textContent = 'Only 1 day to go.';
      else cdNote.textContent = 'Only ' + d + ' days of waiting left.';
    }
  }
  tick(); setInterval(tick, 1000);

  /* scratch card */
  (function scratch() {
    var cv = document.getElementById('scratchCanvas');
    if (!cv) return;
    var hint = document.getElementById('scratchHint');
    var bar = document.getElementById('scratchBar');
    var done = document.getElementById('scratchDone');
    var resetBtn = document.getElementById('scratchReset');
    var wrap = cv.parentElement;
    function size() {
      var r = wrap.getBoundingClientRect();
      cv.width = r.width * 2; cv.height = r.height * 2;
      var ctx = cv.getContext('2d');
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      var g = ctx.createLinearGradient(0, 0, r.width, r.height);
      g.addColorStop(0, '#7C8668'); g.addColorStop(0.5, '#4D5A45'); g.addColorStop(1, '#6c755c');
      ctx.fillStyle = g; ctx.fillRect(0, 0, r.width, r.height);
      ctx.fillStyle = 'rgba(248,244,234,.85)';
      ctx.font = '10px DM Sans, sans-serif'; ctx.textAlign = 'center';
      for (var y = 16; y < r.height; y += 28)
        for (var x = 16; x < r.width; x += 48) { ctx.fillText('A · M ✦', x, y); }
      ctx.fillStyle = 'rgba(230,207,154,.55)';
      for (var k = 0; k < 26; k++) { ctx.beginPath(); ctx.arc(Math.random() * r.width, Math.random() * r.height, 1.3, 0, 7); ctx.fill(); }
    }
    size(); window.addEventListener('resize', size);
    var ctx = cv.getContext('2d');
    var drawing = false, revealed = false;
    function pos(e) {
      var r = cv.getBoundingClientRect();
      var t = e.touches && e.touches[0] ? e.touches[0] : e;
      return { x: (t.clientX - r.left), y: (t.clientY - r.top) };
    }
    function erase(e) {
      if (!drawing || revealed) return;
      if (e.cancelable) e.preventDefault();
      var c = cv.getContext('2d');
      var pp = pos(e);
      c.globalCompositeOperation = 'destination-out';
      c.beginPath(); c.arc(pp.x, pp.y, 28, 0, 7); c.fill();
      check();
    }
    function check() {
      var data = ctx.getImageData(0, 0, cv.width, cv.height).data;
      var clear = 0, total = 0;
      for (var j = 3; j < data.length; j += 4 * 41) { total++; if (data[j] === 0) clear++; }
      var pct = clear / total;
      if (bar) bar.style.width = Math.min(100, Math.round(pct / 0.6 * 100)) + '%';
      if (pct > 0.42 && !revealed) {
        revealed = true;
        cv.style.transition = 'opacity .8s'; cv.style.opacity = '0';
        if (hint) hint.classList.add('hide');
        setTimeout(function () { cv.style.display = 'none'; }, 850);
        if (done) done.hidden = false;
        var hr = wrap.getBoundingClientRect();
        celebrateBurst(hr.left + hr.width / 2, hr.top + hr.height / 2, 85);
        celebrateRain(2200);
        vibrate(25);
      } else if (hint) hint.style.opacity = String(Math.max(0, 1 - pct * 2));
    }
    ['mousedown', 'touchstart', 'pointerdown'].forEach(function (ev) {
      cv.addEventListener(ev, function (e) { drawing = true; erase(e); }, { passive: false });
    });
    ['mousemove', 'touchmove', 'pointermove'].forEach(function (ev) {
      cv.addEventListener(ev, erase, { passive: false });
    });
    ['mouseup', 'touchend', 'pointerup', 'mouseleave'].forEach(function (ev) {
      window.addEventListener(ev, function () { drawing = false; });
    });
    if (resetBtn) resetBtn.addEventListener('click', function () {
      revealed = false; drawing = false;
      cv.style.display = ''; cv.style.transition = 'none'; cv.style.opacity = '1';
      if (hint) { hint.classList.remove('hide'); hint.style.opacity = '1'; }
      if (bar) bar.style.width = '0%';
      if (done) done.hidden = true;
      size();
    });
  })();

  /* gallery lightbox + swipe */
  var imgs = Array.prototype.slice.call(document.querySelectorAll('.ed-grid .g img'));
  var lb = document.getElementById('lightbox'), lbImg = document.getElementById('lbImg'), idx = 0;
  function show(k) {
    idx = (k + imgs.length) % imgs.length;
    lbImg.src = imgs[idx].src; lb.hidden = false; document.body.style.overflow = 'hidden';
  }
  function hide() { lb.hidden = true; document.body.style.overflow = ''; }
  imgs.forEach(function (im, k) { im.parentElement.addEventListener('click', function () { show(k); }); });
  document.getElementById('lbClose').addEventListener('click', hide);
  document.getElementById('lbPrev').addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
  document.getElementById('lbNext').addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) hide(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') hide();
    if (e.key === 'ArrowRight') show(idx + 1);
    if (e.key === 'ArrowLeft') show(idx - 1);
  });
  var tx = 0;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - tx;
    if (dx > 40) show(idx - 1); else if (dx < -40) show(idx + 1);
  }, { passive: true });

  /* ribbon sweep */
  var sweep = document.getElementById('ribbonSweep');
  var lastSweep = 0;
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && Date.now() - lastSweep > 6000) {
        lastSweep = Date.now();
        sweep.classList.remove('go'); void sweep.offsetWidth; sweep.classList.add('go');
      }
    });
  }, { threshold: 0.3 }).observe(document.getElementById('events'));

  /* drifting petals — real petal colors */
  var field = document.getElementById('petalField');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var colors = ['#E8B9AE', '#C98F87', '#e6cf9a', '#F3D9D3'];
  function petal() {
    if (reduced || document.hidden) { setTimeout(petal, 4000); return; }
    if (field.childElementCount >= 7) { setTimeout(petal, 2200); return; }
    var el = document.createElement('i');
    var s = 9 + Math.random() * 9;
    el.style.left = Math.random() * 92 + 'vw';
    el.style.width = s + 'px'; el.style.height = (s * 0.72) + 'px';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.opacity = '0.6';
    el.style.boxShadow = '0 2px 6px rgba(0,0,0,.12)';
    el.style.setProperty('--sway', (Math.random() * 120 - 60) + 'px');
    el.style.animationDuration = (9 + Math.random() * 6) + 's';
    field.appendChild(el);
    setTimeout(function () { el.remove(); }, 16000);
    setTimeout(petal, 2000 + Math.random() * 2200);
  }
  setTimeout(petal, 2200);

  /* RSVP */
  document.getElementById('rsvpForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = this.name.value.trim();
    if (!name) { this.name.focus(); this.name.style.borderColor = '#C98F87'; return; }
    this.style.display = 'none';
    document.getElementById('rsvpDone').hidden = false;
  });

  /* menu */
  var menuBtn = document.getElementById('menuBtn'), menu = document.getElementById('floatMenu');
  menuBtn.addEventListener('click', function () { menu.classList.toggle('show'); });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { menu.classList.remove('show'); });
  });

  /* music — Tenu Leke mp3, starts at 0:32, loops */
  var bgMusic = document.getElementById('bgMusic');
  var musicBtn = document.getElementById('musicBtn');
  var musicOn = false, userMuted = false;
  function setMusicUI(on) {
    musicOn = !!on;
    musicBtn.classList.toggle('playing', musicOn);
    musicBtn.textContent = musicOn ? '♡' : '♪';
  }
  function playMusic() {
    if (!bgMusic || musicOn) return;
    try { bgMusic.loop = true; bgMusic.volume = 0.85; } catch (e) {}
    var pr = null;
    try {
      if (bgMusic.readyState > 0) {
        try { bgMusic.currentTime = 32; } catch (e) {}
        pr = bgMusic.play();
      } else {
        var onMeta = function () {
          try { bgMusic.currentTime = 32; } catch (e) {}
          var p2 = null;
          try { p2 = bgMusic.play(); } catch (e2) {}
          if (p2 && p2.catch) p2.catch(function () { setMusicUI(false); });
          bgMusic.removeEventListener('loadedmetadata', onMeta);
        };
        bgMusic.addEventListener('loadedmetadata', onMeta);
        try { bgMusic.load(); } catch (e) {}
      }
    } catch (e) { pr = null; }
    if (pr && pr.catch) pr.catch(function () { setMusicUI(false); });
  }
  function pauseMusic() { if (bgMusic) { try { bgMusic.pause(); } catch (e) {} } }
  if (bgMusic) {
    bgMusic.addEventListener('play', function () { setMusicUI(true); });
    bgMusic.addEventListener('pause', function () { setMusicUI(false); });
  }
  if (musicBtn) musicBtn.addEventListener('click', function () {
    if (musicOn) { userMuted = true; pauseMusic(); }
    else { userMuted = false; playMusic(); }
  });

  /* celebration confetti — hearts + petals + gold dust */
  var cel = document.getElementById('celebrate'), cctx = cel ? cel.getContext('2d') : null;
  var cparts = [], cRun = false;
  var CC = ['#7C8668', '#AAB39A', '#C8A86B', '#E8B9AE', '#C98F87', '#FFFDF8'];
  function vibrate(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }
  function sizeCelebrate() {
    if (!cel) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cel.width = window.innerWidth * dpr; cel.height = window.innerHeight * dpr;
    cel.style.width = window.innerWidth + 'px'; cel.style.height = window.innerHeight + 'px';
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function cTick() {
    cctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    cparts = cparts.filter(function (o) { return o.life > 0 && o.y < window.innerHeight + 30; });
    cparts.forEach(function (o) {
      o.vy += o.g; o.x += o.vx + Math.sin(o.y / 60) * 0.4; o.y += o.vy; o.vx *= 0.99; o.r += o.vr; o.life--;
      cctx.save(); cctx.translate(o.x, o.y); cctx.rotate(o.r);
      cctx.globalAlpha = Math.min(1, o.life / 40); cctx.fillStyle = o.c;
      if (o.heart) { cctx.font = (o.s * 3) + 'px serif'; cctx.fillText('♡', -o.s, o.s * 0.5); }
      else if (o.round) { cctx.beginPath(); cctx.arc(0, 0, o.s * 0.45, 0, 6.29); cctx.fill(); }
      else { cctx.beginPath(); cctx.ellipse(0, 0, o.s * 0.55, o.s, 0, 0, 6.29); cctx.fill(); }
      cctx.restore();
    });
    if (cparts.length) requestAnimationFrame(cTick);
    else { cRun = false; cctx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
  }
  function celebrateBurst(x, y, n) {
    if (reduced || !cctx) return;
    sizeCelebrate();
    for (var k = 0; k < (n || 80); k++) {
      var roll = Math.random();
      cparts.push({ x: x, y: y,
        vx: (Math.random() - 0.5) * 11, vy: Math.random() * -9 - 2,
        g: 0.26 + Math.random() * 0.12, s: 4 + Math.random() * 6,
        r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3,
        c: CC[(Math.random() * CC.length) | 0], life: 90 + Math.random() * 50,
        heart: roll < 0.25, round: roll >= 0.25 && roll < 0.45 });
    }
    if (!cRun) { cRun = true; cTick(); }
  }
  function celebrateRain(ms) {
    if (reduced || !cctx) return;
    sizeCelebrate();
    var end = Date.now() + (ms || 2500);
    (function drop() {
      if (Date.now() > end) return;
      for (var k = 0; k < 4; k++) {
        var roll = Math.random();
        cparts.push({ x: Math.random() * window.innerWidth, y: -16,
          vx: -0.4 + Math.random() * 0.8, vy: 1 + Math.random() * 2,
          g: 0.03, s: 4 + Math.random() * 5,
          r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.2,
          c: CC[(Math.random() * CC.length) | 0], life: 400,
          heart: roll < 0.2, round: roll >= 0.2 && roll < 0.4 });
      }
      if (!cRun) { cRun = true; cTick(); }
      setTimeout(drop, 120);
    })();
  }

  /* falling eucalyptus leaves (ambient) */
  (function leaves() {
    var cv = document.getElementById('leafCanvas');
    if (!cv) return;
    var ctx = cv.getContext('2d'), W = 0, H = 0, parts = [];
    var PC = ['#7C8668', '#AAB39A', '#C8A86B', '#E8B9AE', '#C98F87'];
    function want() { return W < 380 ? 16 : (W < 600 ? 22 : 30); }
    function mk(init) {
      return { x: Math.random() * W, y: init ? Math.random() * H : -24,
        s: 7 + Math.random() * 10, vy: 0.35 + Math.random() * 0.75,
        ph: Math.random() * 6.28, sw: 0.4 + Math.random() * 0.8,
        r: Math.random() * 6.28, vr: -0.02 + Math.random() * 0.04,
        c: PC[(Math.random() * PC.length) | 0], a: 0.4 + Math.random() * 0.3 };
    }
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = reduced ? 0 : want();
      while (parts.length < n) parts.push(mk(true));
      parts = parts.slice(0, n);
    }
    size(); window.addEventListener('resize', size);
    (function tick() {
      requestAnimationFrame(tick);
      if (reduced || document.hidden) return;
      ctx.clearRect(0, 0, W, H);
      for (var k = 0; k < parts.length; k++) {
        var o = parts[k];
        o.ph += 0.012; o.x += Math.sin(o.ph) * o.sw * 0.45; o.y += o.vy; o.r += o.vr;
        if (o.y > H + 26) { parts[k] = mk(false); continue; }
        ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.r);
        ctx.globalAlpha = o.a; ctx.fillStyle = o.c;
        ctx.beginPath(); ctx.ellipse(0, 0, o.s * 0.55, o.s, 0, 0, 6.29); ctx.fill();
        ctx.strokeStyle = o.c; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, -o.s); ctx.lineTo(0, o.s); ctx.stroke();
        ctx.restore();
      }
    })();
  })();
})();
