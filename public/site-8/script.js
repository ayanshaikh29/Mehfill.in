/*
 * Mehfill.in — Luxury Ivory Reception template
 * Guest-facing behaviour: envelope reveal, live countdown, gallery,
 * music, RSVP via WhatsApp, calendar download and draft preview.
 *
 * The WEDDING object at the top is the template's demo content AND the
 * integration point used by Mehfill.in's publishing engine when a customer
 * personalises their purchased copy of this template.
 */
var WEDDING = {
  groom: "Aarav Mehta",
  bride: "Kiara Sharma",
  initials: "A · K",
  displayName: "Aarav & Kiara",
  introduction: "Together with our families",
  eventTitle: "Wedding Reception",
  dateISO: "2026-11-15T19:00:00+05:30",
  timeText: "7:00 PM onwards",
  endTimeText: "",
  venue: "The Grand Orchid Palace",
  address: "Trimbak Road, Nashik, Maharashtra 422002, India",
  dressCode: "Elegant Indian Festive / Formal",
  mapsQuery: "The Grand Orchid Palace, Trimbak Road, Nashik, Maharashtra 422002, India",
  music: "assets/audio/music.mp3",
  venuePhoto: "assets/images/reception-stage.jpg",
  heroPhoto: "assets/images/hero-couple.jpg",
  storyPhoto: "assets/images/couple-portrait.jpg",
  decorPhoto: "assets/images/reception-decor.jpg",
  detailsPhoto: "assets/images/wedding-details.jpg",
  storyHeading: "Our Story",
  quote: "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.",
  events: [
    { title: "Cocktail Hour", date: "15 November 2026", time: "7:00 PM", venue: "The Grand Orchid Palace", desc: "Welcome drinks & music" },
    { title: "Reception Ceremony", date: "15 November 2026", time: "8:00 PM", venue: "The Grand Orchid Palace", desc: "Blessings, cake & photographs" },
    { title: "Dinner & Dancing", date: "15 November 2026", time: "9:00 PM", venue: "The Grand Orchid Palace", desc: "An evening of celebration" }
  ],
  gallery: [
    { src: "assets/images/gallery-1.jpg", alt: "Aarav & Kiara pre-wedding royal sunset", caption: "Royal Sunset Heritage" },
    { src: "assets/images/gallery-2.jpg", alt: "Walking together in twilight palace courtyard", caption: "Courtyard of Lights" },
    { src: "assets/images/gallery-3.jpg", alt: "Intimate candid joy and laughter", caption: "Pure Joy & Laughter" },
    { src: "assets/images/gallery-4.jpg", alt: "Lake palace candlelit evening", caption: "Evening by the Lake" },
    { src: "assets/images/gallery-5.jpg", alt: "Regal vows under the pavilion", caption: "Promises in Red & Gold" },
    { src: "assets/images/gallery-6.jpg", alt: "Fort golden hour rooftop bliss", caption: "Forever & Always" }
  ]
};

(function () {
  "use strict";

  var Data = window.MehfillData;
  var R = window.MehfillRenderer;
  if (!Data || !R) return;

  var params = new URLSearchParams(window.location.search);
  var isEmbedded = params.get("embed") === "1";
  var isFresh = params.get("fresh") === "1";
  var published = !!window.__MEHFILL__;
  var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var activeConfig = null;
  var cdTimer = null;
  var lbIndex = 0;
  var lbReturnFocus = null;

  function sessionGet(key) {
    try { return window.sessionStorage.getItem(key); } catch (e) { return null; }
  }
  function sessionSet(key, value) {
    try { window.sessionStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  function weddingEvents() {
    return (WEDDING.events || [])
      .filter(function (ev) { return ev && ev.title; })
      .map(function (ev) {
        return {
          id: Data.newId("e"),
          title: String(ev.title || ""),
          date: String(ev.date || ""),
          time: String(ev.time || ""),
          venue: String(ev.venue || ""),
          description: String(ev.desc || ev.description || "")
        };
      });
  }

  function weddingGallery() {
    return (WEDDING.gallery || [])
      .filter(function (g) { return g && g.src; })
      .map(function (g) {
        return {
          id: Data.newId("g"),
          src: String(g.src),
          caption: String(g.caption || ""),
          alt: String(g.alt || "Wedding photo"),
          position: "center"
        };
      });
  }

  function weddingToConfig() {
    var cfg = Data.clone(Data.DEFAULT_INVITATION);
    if (WEDDING.groom) cfg.couple.groomName = WEDDING.groom;
    if (WEDDING.bride) cfg.couple.brideName = WEDDING.bride;
    if (WEDDING.displayName) cfg.couple.displayName = WEDDING.displayName;
    if (WEDDING.initials) cfg.couple.initials = WEDDING.initials;
    if (WEDDING.introduction) cfg.couple.introduction = WEDDING.introduction;
    if (WEDDING.eventTitle) cfg.event.title = WEDDING.eventTitle;
    if (typeof WEDDING.dateISO === "string" && WEDDING.dateISO.length >= 16) {
      cfg.event.date = WEDDING.dateISO.slice(0, 10);
      cfg.event.time = WEDDING.dateISO.slice(11, 16);
    }
    if (WEDDING.venue) cfg.event.venueName = WEDDING.venue;
    if (WEDDING.address) cfg.event.address = WEDDING.address;
    if (WEDDING.dressCode) cfg.event.dressCode = WEDDING.dressCode;
    if (WEDDING.music) cfg.music.src = WEDDING.music;
    if (WEDDING.heroPhoto) cfg.media.hero = WEDDING.heroPhoto;
    if (WEDDING.storyPhoto) cfg.media.couplePortrait = WEDDING.storyPhoto;
    if (WEDDING.venuePhoto) cfg.media.stage = WEDDING.venuePhoto;
    if (WEDDING.decorPhoto) cfg.media.decoration = WEDDING.decorPhoto;
    if (WEDDING.detailsPhoto) cfg.media.details = WEDDING.detailsPhoto;
    if (WEDDING.storyHeading) cfg.story.heading = WEDDING.storyHeading;
    if (WEDDING.quote) cfg.quote.text = WEDDING.quote;
    cfg.event.events = weddingEvents();
    cfg.media.gallery = weddingGallery();
    return cfg;
  }

  function buildActiveConfig() {
    var cfg = weddingToConfig();
    if (!published && !isFresh) {
      var draft = Data.loadDraft();
      if (draft) cfg = draft;
    }
    return Data.validate(cfg).config;
  }

  /* ---------- countdown ---------- */

  function countdownDate() {
    var attr = document.documentElement.getAttribute("data-countdown-target");
    if (attr) {
      var d = new Date(attr);
      if (!Number.isNaN(d.getTime())) return d;
    }
    return R.countdownTarget(activeConfig.event);
  }

  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  function tickCountdown() {
    var box = document.getElementById("countdown");
    if (!box || box.classList.contains("mf-hidden")) return;
    var target = countdownDate();
    var passed = document.getElementById("countdown-passed");
    if (!target) return;
    var diff = target.getTime() - Date.now();
    if (diff <= 0) {
      box.classList.add("mf-hidden");
      if (passed) passed.hidden = false;
      return;
    }
    if (passed) passed.hidden = true;
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var minutes = Math.floor((diff % 3600000) / 60000);
    var seconds = Math.floor((diff % 60000) / 1000);
    var map = { days: days, hours: hours, minutes: minutes, seconds: seconds };
    Object.keys(map).forEach(function (key) {
      var el = box.querySelector('[data-cd="' + key + '"]');
      if (el) el.textContent = pad2(map[key]);
    });
  }

  function startCountdown() {
    tickCountdown();
    if (cdTimer) clearInterval(cdTimer);
    cdTimer = setInterval(tickCountdown, 1000);
  }

  /* ---------- opening sequence: tap to enter → film & music → invitation ---------- */

  function finishOpening() {
    document.body.classList.remove("mf-locked");
  }

  function startMusic() {
    var audio = document.getElementById("bg-music");
    if (!audio || !activeConfig.music.enabled) return;
    if (audio.paused) {
      var p = audio.play();
      if (p && p.catch) p.catch(function () { /* user gesture required */ });
    }
  }

  function playIntroVideo() {
    var gate = document.getElementById("video-gate");
    var video = document.getElementById("intro-video");
    var prompt = document.getElementById("video-tap-prompt");
    if (!gate || !video) return false;

    gate.classList.remove("mf-hidden", "gone");
    if (prompt) prompt.classList.add("is-playing");

    if (activeConfig.video && activeConfig.video.poster) video.setAttribute("poster", activeConfig.video.poster);
    var srcEl = video.querySelector("source");
    var want = (activeConfig.video && activeConfig.video.src) || "lv_0_20261023155820.mp4";
    if (want && (!srcEl || srcEl.getAttribute("src") !== want)) {
      if (!srcEl) {
        srcEl = document.createElement("source");
        srcEl.type = "video/mp4";
        video.appendChild(srcEl);
      }
      srcEl.setAttribute("src", want);
      video.load();
    }
    var done = false;
    function finishVideo() {
      if (done) return;
      done = true;
      try { video.pause(); } catch (e) { /* ignore */ }
      gate.classList.add("gone");
      sessionSet("mf-video-seen", "1");
      window.setTimeout(function () {
        gate.classList.add("mf-hidden");
        finishOpening();
      }, 550);
    }

    video.addEventListener("ended", finishVideo, { once: true });
    var skip = document.getElementById("video-skip");
    if (skip) {
      skip.addEventListener("click", function (e) {
        e.stopPropagation();
        finishVideo();
      }, { once: true });
    }

    // Try playing video with audio, fallback to muted if required by browser policy
    var attempt = video.play();
    if (attempt && attempt.catch) {
      attempt.catch(function () {
        try {
          video.muted = true;
          var retry = video.play();
          if (retry && retry.catch) retry.catch(function () { finishVideo(); });
        } catch (e) {
          finishVideo();
        }
      });
    }

    // Simultaneously start background mp3 music upon tap
    startMusic();
    return true;
  }

  function initOpening() {
    var videoGate = document.getElementById("video-gate");
    var envGate = document.getElementById("envelope-gate");
    var tapGate = document.getElementById("tap-gate");

    if (envGate) {
      envGate.classList.add("gone");
      envGate.style.display = "none";
    }
    if (tapGate) {
      tapGate.classList.add("gone");
      tapGate.style.display = "none";
    }

    if (isEmbedded || reducedMotion) {
      if (videoGate) videoGate.classList.add("gone", "mf-hidden");
      finishOpening();
      return;
    }

    if (videoGate) {
      document.body.classList.add("mf-locked");
      videoGate.classList.remove("mf-hidden", "gone");

      var hasTapped = false;
      var onScreenTap = function (e) {
        if (hasTapped) return;
        // Don't intercept skip button click
        if (e.target && e.target.closest("#video-skip")) return;
        hasTapped = true;
        videoGate.removeEventListener("click", onScreenTap);
        playIntroVideo();
      };

      videoGate.addEventListener("click", onScreenTap);
      videoGate.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onScreenTap(e);
        }
      });
    } else {
      finishOpening();
    }
  }

  /* ---------- gallery lightbox ---------- */

  function lbItems() {
    var imgs = document.querySelectorAll("#gallery-grid figure img");
    return Array.prototype.map.call(imgs, function (img) {
      var cap = img.closest("figure");
      return {
        src: img.currentSrc || img.src,
        alt: img.alt || "",
        caption: cap && cap.querySelector("figcaption") ? cap.querySelector("figcaption").textContent : ""
      };
    });
  }

  function lbShow(index) {
    var items = lbItems();
    if (!items.length) return;
    lbIndex = (index + items.length) % items.length;
    var img = document.getElementById("lightbox-img");
    var cap = document.getElementById("lightbox-cap");
    if (img) {
      img.src = items[lbIndex].src;
      img.alt = items[lbIndex].alt;
    }
    if (cap) cap.textContent = items[lbIndex].caption || "";
  }

  function lbOpen(index, trigger) {
    var box = document.getElementById("lightbox");
    if (!box) return;
    lbReturnFocus = trigger || null;
    box.hidden = false;
    document.body.classList.add("mf-locked");
    lbShow(index);
    var close = box.querySelector(".lb-close");
    if (close) try { close.focus(); } catch (e) { /* ignore */ }
  }

  function lbClose() {
    var box = document.getElementById("lightbox");
    if (!box || box.hidden) return;
    box.hidden = true;
    document.body.classList.remove("mf-locked");
    if (lbReturnFocus && lbReturnFocus.focus) {
      try { lbReturnFocus.focus(); } catch (e) { /* ignore */ }
    }
  }

  function initLightbox() {
    var grid = document.getElementById("gallery-grid");
    if (grid) {
      grid.addEventListener("click", function (e) {
        var fig = e.target.closest("figure");
        if (!fig || !grid.contains(fig)) return;
        var index = Array.prototype.indexOf.call(grid.children, fig);
        if (index >= 0) lbOpen(index, fig);
      });
      grid.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        var fig = e.target.closest("figure");
        if (!fig) return;
        e.preventDefault();
        var index = Array.prototype.indexOf.call(grid.children, fig);
        lbOpen(index >= 0 ? index : 0, fig);
      });
    }
    var box = document.getElementById("lightbox");
    if (!box) return;
    box.addEventListener("click", function (e) {
      if (e.target === box) lbClose();
    });
    var close = box.querySelector(".lb-close");
    if (close) close.addEventListener("click", lbClose);
    var prev = box.querySelector(".lb-prev");
    if (prev) prev.addEventListener("click", function () { lbShow(lbIndex - 1); });
    var next = box.querySelector(".lb-next");
    if (next) next.addEventListener("click", function () { lbShow(lbIndex + 1); });
    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") lbClose();
      else if (e.key === "ArrowLeft") lbShow(lbIndex - 1);
      else if (e.key === "ArrowRight") lbShow(lbIndex + 1);
    });
  }

  /* ---------- music ---------- */

  function initMusic() {
    var audio = document.getElementById("bg-music");
    var btn = document.getElementById("music-toggle");
    if (!audio || !btn) return;
    if (!activeConfig.music.enabled) {
      btn.classList.add("mf-hidden");
      return;
    }
    btn.addEventListener("click", function () {
      if (audio.paused) {
        var play = audio.play();
        if (play && play.catch) play.catch(function () { /* autoplay blocked */ });
      } else {
        audio.pause();
      }
    });
    audio.addEventListener("play", function () {
      btn.setAttribute("aria-pressed", "true");
      btn.setAttribute("aria-label", activeConfig.music.closeLabel || "Pause music");
    });
    audio.addEventListener("pause", function () {
      btn.setAttribute("aria-pressed", "false");
      btn.setAttribute("aria-label", activeConfig.music.openLabel || "Play music");
    });
  }

  /* ---------- RSVP ---------- */

  function initRsvp() {
    var form = document.getElementById("rsvp-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      if (form.dataset.__mf) return; /* Mehfill.in publishing engine takes over */
      e.preventDefault();
      var nameInput = document.getElementById("rsvp-name");
      var name = nameInput ? nameInput.value.trim() : "";
      if (!name) {
        if (nameInput) {
          nameInput.setAttribute("aria-invalid", "true");
          nameInput.focus();
        }
        return;
      }
      if (nameInput) nameInput.removeAttribute("aria-invalid");
      var choice = form.querySelector('input[name="attendance"]:checked');
      var guestsInput = document.getElementById("rsvp-guests");
      var phoneInput = document.getElementById("rsvp-phone");
      var noteInput = document.getElementById("rsvp-note");
      var maxGuests = activeConfig.rsvp.maxGuests || 10;
      var guests = guestsInput ? Math.min(maxGuests, Math.max(1, parseInt(guestsInput.value, 10) || 1)) : 1;
      if (guestsInput) guestsInput.value = String(guests);
      var phone = phoneInput ? phoneInput.value.trim() : "";
      var msg = R.rsvpMessage(activeConfig, {
        name: name,
        choice: choice ? choice.value : activeConfig.rsvp.defaultChoice,
        guests: guests,
        phone: phone,
        note: noteInput ? noteInput.value.trim() : ""
      });
      var phoneTarget = activeConfig.rsvp.whatsappPhone || activeConfig.rsvp.contactPhone;
      var url = R.whatsappUrl(phoneTarget, msg);
      if (url) window.open(url, "_blank", "noopener");
      var ok = document.getElementById("rsvp-ok");
      if (ok) {
        ok.hidden = false;
        try { ok.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" }); } catch (err) { /* ignore */ }
      }
    });
    document.addEventListener("click", function (e) {
      var again = e.target.closest('[data-action="rsvp-again"]');
      if (!again) return;
      var ok = document.getElementById("rsvp-ok");
      if (ok) ok.hidden = true;
      var nameInput = document.getElementById("rsvp-name");
      if (nameInput) nameInput.focus();
    });
  }

  /* ---------- calendar ---------- */

  function initCalendar() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest('[data-action="calendar"]');
      if (!btn) return;
      e.preventDefault();
      var ics = R.buildICS(activeConfig);
      if (!ics) return;
      var slug = (activeConfig.couple.groomName || "groom").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      var slug2 = (activeConfig.couple.brideName || "bride").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      R.downloadText(slug + "-" + slug2 + "-reception.ics", ics, "text/calendar;charset=utf-8");
    });
  }

  /* ---------- reveal + progress ---------- */

  var revealObserver = null;

  function observeReveals() {
    var nodes = document.querySelectorAll(".reveal:not(.in)");
    if (reducedMotion || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(nodes, function (n) { n.classList.add("in"); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    }
    Array.prototype.forEach.call(nodes, function (n) { revealObserver.observe(n); });
  }

  /* ---------- scratch to reveal card ---------- */

  function initScratchCard() {
    var canvas = document.getElementById("scratch-canvas");
    var hint = document.getElementById("scratch-instruction");
    var revealBtn = document.getElementById("scratch-reveal-btn");
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    var isDrawing = false;
    var scratchedPixels = 0;
    var totalPixels = width * height;
    var isRevealed = false;

    // Draw luxury golden scratch foil
    function drawFoil() {
      var grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#F2E2BE");
      grad.addColorStop(0.25, "#C6A46A");
      grad.addColorStop(0.5, "#ECCF98");
      grad.addColorStop(0.75, "#A68148");
      grad.addColorStop(1, "#D6B87B");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Add subtle golden shimmer specks
      for (var i = 0; i < 400; i++) {
        var x = Math.random() * width;
        var y = Math.random() * height;
        var r = Math.random() * 2 + 0.8;
        ctx.fillStyle = i % 2 === 0 ? "rgba(255, 255, 255, 0.45)" : "rgba(120, 85, 30, 0.25)";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add text on the foil
      ctx.save();
      ctx.font = "600 13px Montserrat, sans-serif";
      ctx.fillStyle = "#4D3618";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.letterSpacing = "3px";
      ctx.fillText("✦ SCRATCH TO REVEAL DATE ✦", width / 2, height / 2);
      ctx.restore();
    }

    drawFoil();

    function getPos(e) {
      var rect = canvas.getBoundingClientRect();
      var clientX = e.clientX;
      var clientY = e.clientY;
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    var scratchCount = 0;
    var checkTimeout = null;

    function scratch(pos) {
      if (isRevealed) return;
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 28, 0, Math.PI * 2, false);
      ctx.fill();

      if (hint && !hint.style.opacity) {
        hint.style.opacity = "0";
      }

      scratchCount++;
      // Auto reveal immediately after 2-3 scratch strokes/points
      if (scratchCount >= 3) {
        revealAll();
        return;
      }

      checkPercent();
    }

    function checkPercent() {
      if (checkTimeout || isRevealed) return;
      checkTimeout = setTimeout(function () {
        checkTimeout = null;
        try {
          var imgData = ctx.getImageData(0, 0, width, height);
          var pixels = imgData.data;
          var clear = 0;
          for (var i = 3; i < pixels.length; i += 16) {
            if (pixels[i] === 0) clear++;
          }
          var percent = clear / (pixels.length / 16);
          if (percent > 0.08) {
            revealAll();
          }
        } catch (err) { /* ignore security sandbox if applicable */ }
      }, 50);
    }

    function triggerCelebration() {
      var container = document.getElementById("scratch-card-box");
      if (!container) return;

      // Add golden party glow & bounce to card
      container.classList.add("party-celebrate");

      // Spawn festive confetti pieces
      var colors = ["#C6A46A", "#ECCF98", "#D4AF37", "#FFFFFF", "#EAD5CC", "#FFD700", "#FF6B6B"];
      var rect = container.getBoundingClientRect();
      var count = 48;

      for (var i = 0; i < count; i++) {
        var conf = document.createElement("span");
        conf.className = "sc-confetti";
        var col = colors[Math.floor(Math.random() * colors.length)];
        conf.style.backgroundColor = col;

        var startX = 50 + (Math.random() * 30 - 15);
        var startY = 50 + (Math.random() * 20 - 10);
        conf.style.left = startX + "%";
        conf.style.top = startY + "%";

        var destX = (Math.random() - 0.5) * 320;
        var destY = -120 - Math.random() * 160;
        var rot = Math.random() * 720 - 360;
        var delay = Math.random() * 0.15;
        var dur = 0.9 + Math.random() * 0.7;

        conf.style.setProperty("--tx", destX + "px");
        conf.style.setProperty("--ty", destY + "px");
        conf.style.setProperty("--rot", rot + "deg");
        conf.style.animation = "confettiBlast " + dur + "s cubic-bezier(0.2, 0.8, 0.3, 1) " + delay + "s forwards";

        container.appendChild(conf);

        (function (el) {
          setTimeout(function () {
            if (el.parentNode) el.parentNode.removeChild(el);
          }, 2200);
        })(conf);
      }
    }

    function revealAll() {
      if (isRevealed) return;
      isRevealed = true;
      canvas.style.transition = "opacity 0.6s ease";
      canvas.style.opacity = "0";
      if (hint) hint.style.display = "none";
      if (revealBtn) {
        revealBtn.textContent = "Date Revealed! 🎉";
        revealBtn.disabled = true;
        revealBtn.classList.add("btn-gold");
      }
      triggerCelebration();
      setTimeout(function () {
        canvas.style.display = "none";
      }, 650);
    }

    function onStart(e) {
      isDrawing = true;
      scratch(getPos(e));
    }
    function onMove(e) {
      if (!isDrawing) return;
      e.preventDefault();
      scratch(getPos(e));
    }
    function onEnd() {
      isDrawing = false;
    }

    canvas.addEventListener("mousedown", onStart);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);

    canvas.addEventListener("touchstart", onStart, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);

    if (revealBtn) {
      revealBtn.addEventListener("click", function () {
        revealAll();
      });
    }
  }

  function initProgress() {
    var bar = document.getElementById("scroll-progress");
    if (!bar) return;
    var ticking = false;
    function update() {
      ticking = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)) + ")";
    }
    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  /* ---------- romantic love effects ---------- */

  function initLoveEffects() {
    var container = document.getElementById("love-effects-container");
    if (!container || reducedMotion) return;

    var heartSVG = '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
    var petalSVG = '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M12 2C8 6 4 11 4 15a8 8 0 0016 0c0-4-4-9-8-13z"/></svg>';
    var sparkles = ["#E8A598", "#D98282", "#C6A46A", "#ECCF98", "#F4C2C2", "#C94A6E", "#E69A8D"];

    // Continuous ambient floating hearts and rose petals
    var count = 16;
    for (var i = 0; i < count; i++) {
      spawnLoveParticle(i * 0.7);
    }

    function spawnLoveParticle(initialDelay) {
      var el = document.createElement("div");
      el.className = "love-floating-element";
      var isPetal = Math.random() > 0.45;
      el.innerHTML = isPetal ? petalSVG : heartSVG;

      var size = Math.floor(13 + Math.random() * 16);
      var color = sparkles[Math.floor(Math.random() * sparkles.length)];
      var left = Math.random() * 96;
      var drift = (Math.random() - 0.5) * 140;
      var rot = (Math.random() - 0.5) * 360;
      var duration = 9 + Math.random() * 8;
      var delay = typeof initialDelay === "number" ? initialDelay : 0;

      el.style.width = size + "px";
      el.style.height = size + "px";
      el.style.color = color;
      el.style.left = left + "vw";
      el.style.setProperty("--drift", drift + "px");
      el.style.setProperty("--rot", rot + "deg");
      el.style.animationDuration = duration + "s";
      el.style.animationDelay = delay + "s";

      container.appendChild(el);

      el.addEventListener("animationiteration", function () {
        var newLeft = Math.random() * 96;
        var newDrift = (Math.random() - 0.5) * 140;
        var newRot = (Math.random() - 0.5) * 360;
        var newDuration = 9 + Math.random() * 8;
        el.style.left = newLeft + "vw";
        el.style.setProperty("--drift", newDrift + "px");
        el.style.setProperty("--rot", newRot + "deg");
        el.style.animationDuration = newDuration + "s";
      });
    }

    // Interactive Tap / Click romantic love hearts
    function createTapHeart(x, y) {
      var num = 3;
      for (var k = 0; k < num; k++) {
        var heart = document.createElement("div");
        heart.className = "love-tap-heart";
        heart.innerHTML = heartSVG;
        var s = Math.floor(16 + Math.random() * 14);
        heart.style.width = s + "px";
        heart.style.height = s + "px";
        heart.style.left = x + "px";
        heart.style.top = y + "px";
        heart.style.color = sparkles[Math.floor(Math.random() * sparkles.length)];
        var tx = (Math.random() - 0.5) * 70;
        var ty = -50 - Math.random() * 70;
        var trot = (Math.random() - 0.5) * 60;
        heart.style.setProperty("--tap-tx", tx + "px");
        heart.style.setProperty("--tap-ty", ty + "px");
        heart.style.setProperty("--tap-rot", trot + "deg");
        document.body.appendChild(heart);
        (function (h) {
          setTimeout(function () {
            if (h.parentNode) h.parentNode.removeChild(h);
          }, 1000);
        })(heart);
      }
    }

    window.addEventListener("pointerdown", function (e) {
      // Don't interfere with video gate prompt clicks
      createTapHeart(e.clientX, e.clientY);
    }, { passive: true });
  }

  /* ---------- public preview API (used by editor.html) ---------- */

  window.MehfillPreview = {
    applyConfig: function (cfg) {
      var merged = Data.deepMerge(Data.DEFAULT_INVITATION, cfg || {});
      var result = Data.validate(merged);
      activeConfig = result.config;
      R.apply(activeConfig, document);
      observeReveals();
      tickCountdown();
      return { ok: true, errors: result.errors };
    },
    getConfig: function () {
      return Data.clone(activeConfig);
    },
    isPublished: function () { return published; },
    isEmbedded: function () { return isEmbedded; }
  };

  /* ---------- boot ---------- */

  function boot() {
    activeConfig = buildActiveConfig();

    if (published) {
      R.renderEvents(document, weddingEvents());
      var target = R.countdownTarget({
        date: String(WEDDING.dateISO || "").slice(0, 10),
        time: String(WEDDING.dateISO || "").slice(11, 16) || "19:00"
      });
      if (target) document.documentElement.setAttribute("data-countdown-target", target.toISOString());
    } else {
      R.apply(activeConfig, document);
    }

    initOpening();
    startCountdown();
    initScratchCard();
    initLightbox();
    initMusic();
    initRsvp();
    initCalendar();
    initProgress();
    observeReveals();
    initLoveEffects();

    window.addEventListener("storage", function (e) {
      if (published || e.key !== Data.STORAGE_KEY) return;
      activeConfig = buildActiveConfig();
      R.apply(activeConfig, document);
      observeReveals();
      tickCountdown();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
