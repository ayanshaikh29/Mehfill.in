/* Arham & Zoya — animated invitation logic | mobile-first */
(function () {
  'use strict';
  var WEDDING = new Date('2026-12-28T11:00:00');
  var lang = 'en';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var STR = {
    en: {
      soon: 'Almost time — see you very soon.',
      one: 'Only 1 day to go.',
      many: function (d) { return 'Only ' + d + ' days of waiting left.'; },
      done: 'Just married — thank you for celebrating with us.',
      needName: 'Please enter your full name.',
      needAttend: 'Please choose Joyfully accepts / Regretfully declines.',
      thanksYes: function (n, g) { return 'Thank you, ' + n + ' — see you on Dec 28 (+' + g + ').'; },
      thanksNo: function (n) { return 'Thank you, ' + n + ' — you will be missed.'; }
    },
    ur: {
      soon: 'بس تھوڑا انتظار — جلد ملاقات ہوگی۔',
      one: 'بس ایک دن باقی۔',
      many: function (d) { return 'صرف ' + d + ' دن باقی۔'; },
      done: 'نکاح مبارک — شرکت کا شکریہ۔',
      needName: 'براہ کرم اپنا نام لکھیں۔',
      needAttend: 'براہ کرم شرکت کا انتخاب کریں۔',
      thanksYes: function (n, g) { return 'شکریہ، ' + n + ' — 28 دسمبر کو ملاقات ہوگی (+' + g + ')۔'; },
      thanksNo: function (n) { return 'شکریہ، ' + n + ' — آپ کی کمی محسوس ہوگی۔'; }
    }
  };

  function vibrate(ms){ try{ if(navigator.vibrate) navigator.vibrate(ms); }catch(e){} }

  /* ---------- iOS vh fix ---------- */
  function fixVH(){
    var vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', vh + 'px');
  }
  fixVH();
  var rT; window.addEventListener('resize', function(){ clearTimeout(rT); rT=setTimeout(function(){ fixVH(); size(); sizeSeal(); },150); });
  window.addEventListener('orientationchange', function(){ setTimeout(function(){ fixVH(); size(); sizeSeal(); },350); });

  /* ---------- language ---------- */
  function applyLang(l) {
    lang = l;
    document.querySelectorAll('#lang-toggle button').forEach(function (b) {
      b.classList.toggle('active', b.dataset.lang === l);
    });
    document.querySelectorAll('[data-en]').forEach(function (el) {
      var v = l === 'ur' ? el.getAttribute('data-ur') : el.getAttribute('data-en');
      if (v !== null) el.innerHTML = v;
    });
    document.documentElement.lang = l === 'ur' ? 'ur' : 'en';
    document.documentElement.dir = l === 'ur' ? 'rtl' : 'ltr';
    updateCountdown();
  }
  document.getElementById('lang-toggle').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b){ vibrate(10); applyLang(b.dataset.lang); }
  });

  /* ---------- preloader : simple elegant fade, no percentage ---------- */
  var pre = document.getElementById('preloader');
  function hidePre(){
    if(pre && !pre.classList.contains('done')) {
      pre.classList.add('done');
      // NOTE: music intentionally NOT started here.
      // It starts only after user taps "Tap to Open" (browser autoplay policy).
    }
  }
  window.addEventListener('load', function(){ setTimeout(hidePre, 900); });
  // Safety: never trap user in preloader
  setTimeout(hidePre, 2800);

  /* ---------- petals : responsive + sparkle ---------- */
  var cv = document.getElementById('petals'), ctx = cv.getContext('2d'), ps = [];
  var COLORS = ['#f7b9c1', '#fbdadd', '#ffffff', '#e9a7b0', '#f3cdd2', '#f6d789'];
  function petalCount(){
    var w = window.innerWidth;
    if (w < 380) return 14;
    if (w < 600) return 20;
    if (w < 900) return 30;
    return 42;
  }
  function size() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = window.innerWidth * dpr; cv.height = window.innerHeight * dpr;
    cv.style.width = window.innerWidth + 'px'; cv.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    var want = reduced ? 0 : petalCount();
    while (ps.length < want) ps.push(mk(true));
    ps = ps.slice(0, want);
  }
  function mk(init) {
    return { x: Math.random() * window.innerWidth, y: init ? Math.random() * window.innerHeight : -16,
      s: 4 + Math.random() * 7, vy: .25 + Math.random() * .65,
      vx: -.25 + Math.random() * .5, r: Math.random() * 6.28, vr: -.02 + Math.random() * .04,
      c: COLORS[Math.floor(Math.random() * COLORS.length)], a: .3 + Math.random() * .4,
      spark: Math.random() < .18 };
  }
  for (var i = 0; i < petalCount(); i++) ps.push(mk(true));
  (function tick() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if(!reduced){
      ps.forEach(function (o, k) {
        o.x += o.vx + Math.sin(o.y / 80) * .3; o.y += o.vy; o.r += o.vr;
        if (o.y > window.innerHeight + 24) { ps[k] = mk(false); return; }
        ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.r);
        ctx.globalAlpha = o.a; ctx.fillStyle = o.c;
        if(o.spark){ ctx.shadowColor = '#fff'; ctx.shadowBlur = 10; }
        ctx.beginPath(); ctx.ellipse(0, 0, o.s * .6, o.s, 0, 0, 6.29); ctx.fill();
        ctx.restore();
      });
    }
    requestAnimationFrame(tick);
  })();

  /* ---------- confetti burst (no library) ---------- */
  var cCv = document.getElementById('confetti'), cCtx = cCv.getContext('2d'), parts = [], cRun = false;
  function sizeConf(){
    var dpr = Math.min(window.devicePixelRatio||1, 2);
    cCv.width = window.innerWidth*dpr; cCv.height = window.innerHeight*dpr;
    cCv.style.width = window.innerWidth+'px'; cCv.style.height = window.innerHeight+'px';
    cCtx.setTransform(dpr,0,0,dpr,0,0);
  }
  sizeConf(); window.addEventListener('resize', sizeConf);
  var CCOLORS = ['#f2a7b1','#c4747f','#c6a15a','#ffffff','#fbdadd','#e86a7e','#f6d789'];
  function burst(x, y, n){
    if(reduced) return;
    sizeConf();
    for(var k=0;k<(n||90);k++){
      parts.push({x:x, y:y, vx:(Math.random()-.5)*11, vy:Math.random()*-9-2, g:.28+Math.random()*.12,
        s:4+Math.random()*6, r:Math.random()*6.28, vr:(Math.random()-.5)*.3,
        c:CCOLORS[Math.floor(Math.random()*CCOLORS.length)], life:90+Math.random()*50});
    }
    if(!cRun){ cRun=true; confTick(); }
  }
  function confTick(){
    cCtx.clearRect(0,0,window.innerWidth,window.innerHeight);
    parts = parts.filter(function(o){ return o.life>0 && o.y < window.innerHeight+30; });
    parts.forEach(function(o){
      o.vy += o.g; o.x += o.vx; o.y += o.vy; o.vx*=.99; o.r += o.vr; o.life--;
      cCtx.save(); cCtx.translate(o.x,o.y); cCtx.rotate(o.r);
      cCtx.globalAlpha = Math.min(1, o.life/40); cCtx.fillStyle = o.c;
      cCtx.fillRect(-o.s/2,-o.s/3,o.s,o.s*.66);
      cCtx.restore();
    });
    if(parts.length){ requestAnimationFrame(confTick); }
    else { cRun=false; cCtx.clearRect(0,0,window.innerWidth,window.innerHeight); }
  }

  /* ---------- floating petal bursts (soft, no emoji) ---------- */
  var heartsLayer = document.getElementById('hearts-layer');
  var PETALS = ['#f2a7b1','#e86a7e','#c6a15a','#ffffff'];
  function heartBurst(n){
    if(reduced) return;
    for(var k=0;k<(n||12);k++){
      (function(){
        var s = document.createElement('span');
        s.className='fly-heart';
        s.textContent = '❦';
        s.style.color = PETALS[Math.floor(Math.random()*PETALS.length)];
        s.style.left = (8+Math.random()*84)+'vw';
        s.style.fontSize = (16+Math.random()*22)+'px';
        s.style.animationDelay = (Math.random()*.5)+'s';
        heartsLayer.appendChild(s);
        setTimeout(function(){ s.remove(); }, 2600);
      })();
    }
  }

  /* ---------- video cover : tap -> video with sound -> site reveal ---------- */
  var cover = document.getElementById('cover');
  var coverVideo = document.getElementById('cover-video');
  var coverBar = document.getElementById('cover-bar');
  var opened = false, entered = false, endTimer = null;

  // Video stays paused behind the Tap to Open button — plays only after tap
  if (coverVideo) {
    try { coverVideo.pause(); } catch (e) {}
  }

  /* ---------- music : local mp3, starts ONLY after Tap to Open ---------- */
  var bgMusic = document.getElementById('bg-music');
  var musicOn = false;
  var mBtn = document.getElementById('music-toggle');
  function setMusicUI(on) {
    musicOn = !!on;
    if (mBtn) mBtn.classList.toggle('on', musicOn);
  }
  function playMusic(ducked) {
    if (!bgMusic) return;
    try {
      bgMusic.loop = true;
      bgMusic.muted = false;
      bgMusic.volume = ducked ? 0.15 : 0.8;
    } catch (e) {}
    // Already playing -> sirf volume adjust karo, restart MAT karo (double-play fix)
    try {
      if (!bgMusic.paused && !bgMusic.ended) { setMusicUI(true); return; }
    } catch (e) {}
    var pr = null;
    try { pr = bgMusic.play(); } catch (e) { pr = null; }
    if (pr && pr.then) {
      pr.then(function(){ setMusicUI(true); }).catch(function(){
        // Retry once on next user gesture (mobile autoplay safety)
        setMusicUI(false);
        var retry = function(){
          try {
            bgMusic.muted = false;
            var p2 = bgMusic.play();
            if (p2 && p2.catch) p2.catch(function(){});
          } catch (e2) {}
          document.removeEventListener('pointerdown', retry);
          document.removeEventListener('keydown', retry);
        };
        document.addEventListener('pointerdown', retry);
        document.addEventListener('keydown', retry);
      });
    }
  }
  function pauseMusic() {
    if (!bgMusic) return;
    try { bgMusic.pause(); } catch (e) {}
  }
  if (bgMusic) {
    bgMusic.addEventListener('play', function(){ setMusicUI(true); });
    bgMusic.addEventListener('pause', function(){ setMusicUI(false); });
    bgMusic.addEventListener('error', function(){
      // If bg-music.mp3 missing, try the original long filename as fallback
      try {
        if (bgMusic.src.indexOf('bg-music.mp3') !== -1) {
          bgMusic.src = 'Salim-Sulaiman_ Sonu Nigam_ Shreya Ghoshal_ Salim Sadruddin Merchant - Shukran Allah (Lyric Video)(MP3_160K).mp3';
          bgMusic.load();
        }
      } catch (e) {}
    });
  }
  if (mBtn) mBtn.addEventListener('click', function (e) {
    e.stopPropagation(); vibrate(10);
    if (musicOn) { pauseMusic(); }
    else { playMusic(false); }
  });

  function enterSite() {
    if (entered) return; entered = true;
    if (endTimer) { clearTimeout(endTimer); endTimer = null; }
    try { if (coverVideo) coverVideo.pause(); } catch (e) {}
    vibrate(20);
    // No lift/swap — the cover becomes the top hero, guest scrolls down
    cover.classList.add('docked');
    document.body.classList.remove('locked');
    document.body.classList.add('ready');
    // Music already tap par start ho chuki hai -> restart nahi, sirf full volume
    try {
      if (bgMusic && !bgMusic.paused && !bgMusic.ended) {
        bgMusic.muted = false; bgMusic.volume = 0.8; setMusicUI(true);
      } else {
        playMusic(false); // fallback: agar kisi reason se nahi chali to ab chalao
      }
    } catch (e) { try { playMusic(false); } catch (e2) {} }
    observe();
    burst(window.innerWidth/2, window.innerHeight*0.35, 80);
    heartBurst(10);
    setTimeout(function () { try { sizeSeal(); } catch (err) {} }, 400);
    window.scrollTo(0, 0);
  }

  function startVideo() {
    if (opened) return; opened = true;
    vibrate(15);
    // TAP = user gesture -> bg music ek hi baar start (continuous, no restart)
    try { playMusic(false); } catch (e) {}
    if (!coverVideo) { enterSite(); return; }
    cover.classList.add('playing');
    try { coverVideo.currentTime = 0; } catch (e) {}
    // Video FULL mute — sirf bg music sunai degi
    try { coverVideo.muted = true; coverVideo.volume = 0; } catch (e) {}
    try { coverVideo.setAttribute('muted', ''); } catch (e) {}
    try { coverVideo.defaultPlaybackRate = 0.7; coverVideo.playbackRate = 0.7; } catch (e) {}
    var pr = null;
    try { pr = coverVideo.play(); } catch (e) { pr = null; }
    if (pr && pr.catch) {
      pr.catch(function(){
        // Video failed -> go straight into site (music already started above)
        enterSite();
      });
    }
    // Safety: never trap the guest — auto-enter 20s after tap even if video stalls
    setTimeout(function(){ if (!entered) enterSite(); }, 20000);
  }

  document.getElementById('open-btn').addEventListener('click', function(e){ e.stopPropagation(); startVideo(); });
  // Whole tap area also works (button + anywhere on cover)
  document.getElementById('cover-tap').addEventListener('click', function(e){ e.stopPropagation(); startVideo(); });
  cover.addEventListener('click', function(){ if (!opened) startVideo(); });

  if (coverVideo) {
    // Video muted hai, isliye bg music ka volume change karne ki zaroorat nahi — continuous bajegi
    // After the video ends, dock the cover — guest scrolls down to the site
    coverVideo.addEventListener('ended', function(){
      if (entered) return;
      endTimer = setTimeout(enterSite, 1200);
    });
    coverVideo.addEventListener('error', function(){ enterSite(); });
    coverVideo.addEventListener('timeupdate', function(){
      try {
        if (coverVideo.duration && coverBar) {
          coverBar.style.width = (coverVideo.currentTime / coverVideo.duration * 100) + '%';
        }
      } catch (e) {}
    });
  }

  /* ---------- countdown with tick pop ---------- */
  var lastVals = {};
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function setNum(id, val){
    var el = document.getElementById(id);
    if(!el) return;
    if(lastVals[id] !== val){
      el.textContent = val;
      if(lastVals[id] !== undefined){
        el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick');
      }
      lastVals[id]=val;
    }
  }
  function updateCountdown() {
    var diff = WEDDING - new Date();
    var note = document.getElementById('cd-note');
    if (diff <= 0) {
      setNum('cd-d','00'); setNum('cd-h','00'); setNum('cd-m','00'); setNum('cd-s','00');
      if(note) note.textContent = STR[lang].done; return;
    }
    var dd = Math.floor(diff / 864e5), hh = Math.floor(diff % 864e5 / 36e5),
        mm = Math.floor(diff % 36e5 / 6e4), ss = Math.floor(diff % 6e4 / 1e3);
    setNum('cd-d', pad(dd)); setNum('cd-h', pad(hh)); setNum('cd-m', pad(mm)); setNum('cd-s', pad(ss));
    if(note) note.textContent = dd === 0 ? STR[lang].soon : dd === 1 ? STR[lang].one : STR[lang].many(dd);
  }
  updateCountdown(); setInterval(updateCountdown, 1000);

  /* ---------- scroll: progress + top-btn + timeline ---------- */
  var prog = document.querySelector('#scroll-progress span');
  var topBtn = document.getElementById('top-btn');
  var tFill = document.getElementById('timeline-fill');
  function onScroll(){
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var sc = max>0 ? (h.scrollTop/max) : 0;
    if(prog) prog.style.width = (sc*100)+'%';
    if(topBtn) topBtn.classList.toggle('show', h.scrollTop > window.innerHeight*0.9);
    if(tFill){
      var tl = tFill.parentElement.getBoundingClientRect();
      var vis = Math.min(1, Math.max(0, (window.innerHeight - tl.top) / (window.innerHeight*0.7)));
      tFill.style.width = (vis*100)+'%';
    }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
  topBtn.addEventListener('click', function(){ vibrate(10); window.scrollTo({top:0, behavior: reduced?'auto':'smooth'}); });

  // tap anywhere (opened) spawns tiny flourish — delightful but cheap
  var lastTap = 0;
  document.addEventListener('pointerdown', function(e){
    if(!document.body.classList.contains('ready') || reduced) return;
    var now = Date.now();
    if(now - lastTap < 900) return; lastTap = now;
    if(e.target.closest('button, a, input, textarea, canvas')) return;
    var s = document.createElement('span');
    s.className='fly-heart'; s.textContent='❦';
    s.style.left = e.clientX+'px'; s.style.bottom = (window.innerHeight - e.clientY)+'px';
    s.style.fontSize='16px'; s.style.color='#e86a7e';
    heartsLayer.appendChild(s);
    setTimeout(function(){ s.remove(); }, 2000);
  }, {passive:true});

  /* ---------- reveals ---------- */
  var seen = false;
  function observe() {
    if (seen) return; seen = true;
    var els = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      var ob = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); ob.unobserve(en.target); } });
      }, { threshold: .1, rootMargin: '0px 0px -6% 0px' });
      els.forEach(function (el) { ob.observe(el); });
    } else els.forEach(function (el) { el.classList.add('in'); });
  }
  // observe cover-adjacent content early so first paint animates even before open on tall screens
  setTimeout(function(){ if(!opened) observe(); }, 4500);

  /* ---------- sealed scratch ---------- */
  var sealCv = document.getElementById('seal-canvas');
  var sealHint = document.getElementById('seal-hint');
  var sealBar = document.getElementById('seal-bar');
  var sctx = sealCv ? sealCv.getContext('2d', { willReadFrequently: true }) : null;
  var sDown = false, sDone = false;
  function sizeSeal() {
    if (!sealCv || !sctx || !sealCv.parentElement) return;
    var r = sealCv.parentElement.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    sealCv.width = Math.round(r.width * dpr); sealCv.height = Math.round(r.height * dpr);
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintSeal(r.width, r.height);
  }
  function paintSeal(w, h) {
    sctx.globalCompositeOperation = 'source-over';
    sctx.globalAlpha = 1;
    var g = sctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#f9c3cb'); g.addColorStop(.5,'#f3a9b4'); g.addColorStop(1, '#e78f9b');
    sctx.fillStyle = g; sctx.fillRect(0, 0, w, h);
    // soft pattern
    sctx.strokeStyle = 'rgba(255,255,255,.9)'; sctx.lineWidth = 1.5;
    sctx.strokeRect(10.5, 10.5, w - 21, h - 21);
    sctx.fillStyle = 'rgba(255,255,255,.85)';
    for (var k = 0; k < 110; k++) {
      sctx.beginPath();
      sctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.6 + .5, 0, 6.29);
      sctx.fill();
    }
    // sparkles
    sctx.fillStyle = '#fff';
    for(var j=0;j<8;j++){
      var sx=Math.random()*w, sy=Math.random()*h;
      sctx.save(); sctx.translate(sx,sy); sctx.rotate(Math.PI/4);
      sctx.fillRect(-5,-.7,10,1.4); sctx.fillRect(-.7,-5,1.4,10);
      sctx.restore();
    }
    sctx.beginPath(); sctx.arc(w / 2, h / 2, 46, 0, 6.29);
    sctx.strokeStyle = 'rgba(255,255,255,.95)'; sctx.lineWidth = 2.5; sctx.stroke();
    sctx.beginPath(); sctx.arc(w / 2, h / 2, 35, 0, 6.29);
    sctx.strokeStyle = 'rgba(255,255,255,.6)'; sctx.lineWidth = 1; sctx.stroke();
    sctx.fillStyle = '#fff'; sctx.font = '600 22px Georgia, serif'; sctx.textAlign = 'center'; sctx.textBaseline = 'middle';
    sctx.fillText('A · Z', w / 2, h / 2 + 1);
    sctx.font = '10px sans-serif'; sctx.globalAlpha=.9;
    sctx.fillText('S C R A T C H', w/2, h/2+30); sctx.globalAlpha=1;
    sDone = false;
    sealCv.style.opacity = '1'; sealCv.style.pointerEvents = 'auto';
    sealCv.style.transition = 'none';
    if (sealHint) sealHint.classList.remove('hide');
    if (sealBar) sealBar.style.width = '0%';
  }
  function sealAt(cx, cy) {
    var r = sealCv.getBoundingClientRect();
    var x = cx - r.left, y = cy - r.top;
    sctx.globalCompositeOperation = 'destination-out';
    sctx.lineWidth = Math.max(38, r.width*0.11); sctx.lineCap = 'round'; sctx.lineJoin = 'round';
    sctx.beginPath();
    if (sealAt.last) { sctx.moveTo(sealAt.last.x, sealAt.last.y); sctx.lineTo(x, y); sctx.stroke(); }
    else { sctx.arc(x, y, 20, 0, 6.29); sctx.fill(); }
    sealAt.last = { x: x, y: y };
    if (sealHint) sealHint.classList.add('hide');
    sealProgress();
  }
  var progTick = 0;
  function sealProgress() {
    var now = Date.now();
    if(now - progTick < 180) return; progTick = now;
    try {
      var d = sctx.getImageData(0, 0, sealCv.width, sealCv.height).data;
      var tot = 0, clr = 0, step = 4 * 32;
      for (var i = 3; i < d.length; i += step) { tot++; if (d[i] === 0) clr++; }
      var pc = Math.round(clr / tot * 100);
      if (sealBar) sealBar.style.width = Math.min(pc, 100) + '%';
      if (pc > 42 && !sDone) {
        sDone = true; vibrate(25);
        sealCv.style.transition = 'opacity .8s ease';
        sealCv.style.opacity = '0'; sealCv.style.pointerEvents = 'none';
        heartBurst(10);
        burst(window.innerWidth/2, sealCv.getBoundingClientRect().top + 120, 55);
      }
    } catch (e) {}
  }
  function sealEnd() { sDown = false; sealAt.last = null; }
  if (sealCv && sctx) {
    sealCv.addEventListener('mousedown', function (e) { sDown = true; sealAt(e.clientX, e.clientY); });
    window.addEventListener('mousemove', function (e) { if (sDown) sealAt(e.clientX, e.clientY); });
    window.addEventListener('mouseup', sealEnd);
    sealCv.addEventListener('touchstart', function (e) { e.preventDefault(); sDown = true; sealAt(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    sealCv.addEventListener('touchmove', function (e) { e.preventDefault(); if (sDown) sealAt(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    sealCv.addEventListener('touchend', sealEnd);
    document.getElementById('seal-reset').addEventListener('click', function () {
      vibrate(10);
      var r = sealCv.parentElement.getBoundingClientRect();
      paintSeal(r.width, r.height);
    });
    setTimeout(sizeSeal, 500);
    setTimeout(sizeSeal, 2500);
    window.addEventListener('load', sizeSeal);
  }

  /* ---------- gallery lightbox + swipe ---------- */
  var lb = document.getElementById('lightbox'), lbImg = document.getElementById('lb-img');
  var gImgs = Array.prototype.slice.call(document.querySelectorAll('.grid img'));
  var gIdx = 0;
  function showLb(i){
    if(!gImgs.length) return;
    gIdx = (i+gImgs.length)%gImgs.length;
    lbImg.src = gImgs[gIdx].src; lb.hidden = false;
    document.body.style.overflow='hidden';
  }
  function hideLb(){ lb.hidden = true; if(!document.body.classList.contains('locked')) document.body.style.overflow=''; }
  gImgs.forEach(function (img, idx) {
    img.addEventListener('click', function () { vibrate(10); showLb(idx); });
  });
  document.getElementById('lb-x').addEventListener('click', hideLb);
  var np = document.getElementById('lb-next'), pv = document.getElementById('lb-prev');
  if(np) np.addEventListener('click', function(e){ e.stopPropagation(); showLb(gIdx+1); });
  if(pv) pv.addEventListener('click', function(e){ e.stopPropagation(); showLb(gIdx-1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) hideLb(); });
  document.addEventListener('keydown', function(e){
    if(lb.hidden) return;
    if(e.key==='Escape') hideLb();
    if(e.key==='ArrowRight') showLb(gIdx+1);
    if(e.key==='ArrowLeft') showLb(gIdx-1);
  });
  var tx0=null;
  lb.addEventListener('touchstart', function(e){ tx0 = e.touches[0].clientX; }, {passive:true});
  lb.addEventListener('touchend', function(e){
    if(tx0===null) return;
    var dx = e.changedTouches[0].clientX - tx0;
    if(Math.abs(dx)>45) showLb(gIdx + (dx<0?1:-1));
    tx0=null;
  }, {passive:true});

  /* ---------- RSVP ---------- */
  var attend = '', guests = 1;
  var gVal = document.getElementById('g-val');
  document.getElementById('attend-pills').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    attend = b.dataset.v; vibrate(10);
    this.querySelectorAll('button').forEach(function (x) { x.classList.toggle('sel', x === b); });
  });
  document.getElementById('g-minus').addEventListener('click', function () { guests = Math.max(1, guests - 1); gVal.textContent = guests; vibrate(8); });
  document.getElementById('g-plus').addEventListener('click', function () { guests = Math.min(10, guests + 1); gVal.textContent = guests; vibrate(8); });

  var rsvpNote = document.getElementById('rsvp-note');
  var nameInput = document.getElementById('f-name');
  var pills = document.getElementById('attend-pills');
  function flagError(el){
    el.classList.remove('shake','field-error'); void el.offsetWidth;
    el.classList.add(el === pills ? 'shake' : 'field-error');
  }
  if (nameInput) nameInput.addEventListener('input', function(){ nameInput.classList.remove('field-error'); });
  document.getElementById('rsvp').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = nameInput.value.trim();
    if (rsvpNote) rsvpNote.hidden = true;
    if (!name) { vibrate(30); flagError(nameInput); nameInput.focus(); return; }
    if (!attend) { vibrate(30); flagError(pills); return; }
    vibrate([20,40,20]);
    var msg = attend === 'yes' ? STR[lang].thanksYes(name, guests) : STR[lang].thanksNo(name);
    if (rsvpNote) { rsvpNote.textContent = msg; rsvpNote.hidden = false; }
    if(attend==='yes'){ heartBurst(16); burst(window.innerWidth/2, window.innerHeight*0.4, 90); }
    e.target.reset(); attend = ''; guests = 1; gVal.textContent = '1';
    document.querySelectorAll('#attend-pills button').forEach(function (x) { x.classList.remove('sel'); });
  });

  // expose
  window.__burst = burst;
  size(); sizeConf();
})();
