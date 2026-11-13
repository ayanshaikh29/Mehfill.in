/*
 * Mehfill.in — Site 9: Royal Floral Wedding Invitation
 * Interactive Behaviours: Opening Envelope Gate, Video Theater Modal on Open,
 * Background Music, Auspicious Section (Countdown & Scratch Card),
 * Compact Filterable Gallery Lightbox, and RSVP form.
 */
(function () {
  "use strict";

  var Data = window.MehfillData;
  var R = window.MehfillRenderer;
  if (!Data || !R) return;

  var currentConfig = null;
  var countdownTimer = null;
  var petalAnimId = null;
  var isAudioPlaying = false;
  var audioElement = null;
  var lbCurrentIndex = 0;
  var filteredGalleryList = [];

  /* ---------- 1. Opening Gate & Direct Video Experience ---------- */
  function initOpeningExperience(cfg) {
    var introGate = document.getElementById("video-intro-gate");
    var introVideo = document.getElementById("intro-video");
    var invitedReveal = document.getElementById("intro-invited-reveal");
    var coupleReveal = document.getElementById("intro-couple-reveal");
    var openBtn = document.getElementById("btn-open-invitation");
    var enterBtn = document.getElementById("btn-enter-invitation");
    var skipBtn = document.getElementById("btn-skip-intro");
    var heroWatchBtn = document.getElementById("btn-hero-watch-video");
    var replayBtn = document.getElementById("btn-replay-video");

    var params = new URLSearchParams(window.location.search);
    var isEmbed = params.get("embed") === "1";

    if (isEmbed || (cfg.sections && cfg.sections.visible && cfg.sections.visible.videoIntro === false)) {
      if (introGate) introGate.style.display = "none";
      document.body.classList.remove("mf-locked");
      return;
    }

    // CRITICAL: Ensure video is paused on load - NO AUTOPLAY!
    if (introVideo) {
      introVideo.pause();
      introVideo.currentTime = 0;
      introVideo.muted = true;
    }

    var timer1 = null;
    var timer2 = null;

    function resetOverlays() {
      if (invitedReveal) invitedReveal.classList.remove("revealed");
      if (coupleReveal) coupleReveal.classList.remove("revealed");
      if (enterBtn) enterBtn.style.display = "none";
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
    }

    function showInvitedTypography() {
      if (invitedReveal) invitedReveal.classList.add("revealed");
    }

    function showCoupleTypography() {
      if (invitedReveal) invitedReveal.classList.remove("revealed");
      if (coupleReveal) coupleReveal.classList.add("revealed");
      if (enterBtn) enterBtn.style.display = "inline-flex";
    }

    function dismissGate() {
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
      if (introGate) {
        introGate.classList.add("fade-out");
        setTimeout(function () {
          introGate.style.display = "none";
        }, 800);
      }
      document.body.classList.remove("mf-locked");
      // Ensure background music keeps playing
      if (cfg.music && cfg.music.enabled && !isAudioPlaying) {
        playMusic();
      }
    }

    // STEP 2: USER CLICKS "PLAY INVITATION"
    function onPlayInvitationClick() {
      if (openBtn) openBtn.style.display = "none";

      // 1. Play background music
      if (cfg.music && cfg.music.enabled) {
        playMusic();
      }

      // 2. Start Video playback explicitly
      if (introVideo) {
        introVideo.muted = true;
        introVideo.currentTime = 0;
        var p = introVideo.play();
        if (p !== undefined) {
          p.catch(function (err) {
            console.log("Video playback exception:", err);
            // Fallback: reveal typography if playback blocked
            showCoupleTypography();
          });
        }

        // Exact timeupdate listener for sequence:
        // 0:01 - 0:03 -> "YOU'RE INVITED"
        // 0:03 onwards -> "The Wedding Celebration Of" + "Ananya & Kabir" + "18 December 2026"
        var onTimeUpdate = function () {
          var t = introVideo.currentTime;
          if (t >= 1.0 && t < 3.2) {
            showInvitedTypography();
          } else if (t >= 3.2) {
            showCoupleTypography();
          }
        };
        introVideo.addEventListener("timeupdate", onTimeUpdate);

        // STEP 3: VIDEO FINISHES
        // When video reaches its end, automatically transition to main site!
        introVideo.addEventListener("ended", function () {
          setTimeout(dismissGate, 1000);
        });
      }

      // Backup timers based on real wall clock
      timer1 = setTimeout(showInvitedTypography, 1000);
      timer2 = setTimeout(showCoupleTypography, 3400);
    }

    function replayIntroVideo() {
      if (!introGate) return;
      resetOverlays();
      if (openBtn) openBtn.style.display = "none";
      introGate.style.display = "block";
      introGate.classList.remove("fade-out");
      document.body.classList.add("mf-locked");

      if (introVideo) {
        introVideo.currentTime = 0;
        introVideo.play();
      }
      timer1 = setTimeout(showInvitedTypography, 1000);
      timer2 = setTimeout(showCoupleTypography, 3400);
    }

    if (openBtn) openBtn.addEventListener("click", onPlayInvitationClick);
    if (enterBtn) enterBtn.addEventListener("click", dismissGate);
    if (skipBtn) skipBtn.addEventListener("click", dismissGate);
    if (heroWatchBtn) heroWatchBtn.addEventListener("click", replayIntroVideo);
    if (replayBtn) replayBtn.addEventListener("click", replayIntroVideo);
  }

  /* ---------- 2. Live Wedding Countdown ---------- */
  function startCountdown(cfg) {
    if (countdownTimer) clearInterval(countdownTimer);

    var countdownSec = document.getElementById("countdown");
    var daysEl = document.getElementById("cd-days");
    var hoursEl = document.getElementById("cd-hours");
    var minsEl = document.getElementById("cd-minutes");
    var secsEl = document.getElementById("cd-seconds");
    var passedEl = document.getElementById("cd-passed-msg");
    var timerWrap = document.getElementById("cd-timer-wrap");

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    var dateStr = (cfg.event && cfg.event.date ? String(cfg.event.date).trim() : "");
    var dParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
    if (!dParts) {
      if (countdownSec) countdownSec.style.display = "none";
      return;
    }
    if (countdownSec) countdownSec.style.display = "";

    var timeStr = (cfg.event && cfg.event.time ? String(cfg.event.time).trim() : "");
    var tParts = /^(\d{1,2}):(\d{2})$/.exec(timeStr);
    var hour = tParts ? parseInt(tParts[1], 10) : 0;
    var minute = tParts ? parseInt(tParts[2], 10) : 0;
    var targetDate = new Date(
      parseInt(dParts[1], 10),
      parseInt(dParts[2], 10) - 1,
      parseInt(dParts[3], 10),
      hour,
      minute,
      0
    );

    function tick() {
      var now = new Date();
      var diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        if (timerWrap) timerWrap.style.display = "none";
        if (passedEl) passedEl.style.display = "block";
        clearInterval(countdownTimer);
        return;
      }

      if (timerWrap) timerWrap.style.display = "flex";
      if (passedEl) passedEl.style.display = "none";

      var d = Math.floor(diff / (1000 * 60 * 60 * 24));
      var h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      var s = Math.floor((diff % (1000 * 60)) / 1000);

      daysEl.textContent = d < 10 ? "0" + d : String(d);
      hoursEl.textContent = h < 10 ? "0" + h : String(h);
      minsEl.textContent = m < 10 ? "0" + m : String(m);
      secsEl.textContent = s < 10 ? "0" + s : String(s);
    }

    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  /* ---------- 3. Interactive Scratch Card ---------- */
  function initScratchCard(cfg) {
    var canvas = document.getElementById("scratch-canvas");
    var wrap = document.getElementById("scratch-wrap");
    if (!canvas || !wrap) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.style.display = "block";
    canvas.style.opacity = "1";
    wrap.classList.remove("celebration-glow");
    var banner = document.getElementById("scratch-celebration-banner");
    if (banner) banner.style.display = "none";

    var width = (canvas.width = wrap.clientWidth || 440);
    var height = (canvas.height = wrap.clientHeight || 220);

    function drawGoldFoil() {
      // Royal multi-stop metallic gold gradient
      var grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#E8D395");
      grad.addColorStop(0.25, "#C49A48");
      grad.addColorStop(0.5, "#F7E6B5");
      grad.addColorStop(0.75, "#BA8B36");
      grad.addColorStop(1, "#DFBE72");

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle royal shimmer lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
      ctx.lineWidth = 1;
      for (var l = -height; l < width + height; l += 24) {
        ctx.beginPath();
        ctx.moveTo(l, 0);
        ctx.lineTo(l + height, height);
        ctx.stroke();
      }

      // Elegant inner border with notched corners
      ctx.strokeStyle = "#8A6420";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(10, 10, width - 20, height - 20);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1;
      ctx.strokeRect(14, 14, width - 28, height - 28);

      // Corner stars
      ctx.fillStyle = "#6B4912";
      ctx.font = "14px serif";
      ctx.fillText("✦", 22, 26);
      ctx.fillText("✦", width - 22, 26);
      ctx.fillText("✦", 22, height - 18);
      ctx.fillText("✦", width - 22, height - 18);

      // Center decorative badge
      ctx.fillStyle = "rgba(62, 43, 8, 0.08)";
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(width / 2 - 120, height / 2 - 28, 240, 56, 12) : ctx.rect(width / 2 - 120, height / 2 - 28, 240, 56);
      ctx.fill();

      // Scratch Hint Label
      ctx.fillStyle = "#3E2B08";
      ctx.font = "bold 15px 'Montserrat', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var hint = (cfg.scratchCard && cfg.scratchCard.scratchHint) || "Scratch to Reveal Date ✨";
      ctx.fillText(hint, width / 2, height / 2);
    }

    drawGoldFoil();

    var isScratching = false;
    var totalPixels = width * height;
    var isRevealed = false;

    function playCelebrationChime() {
      try {
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        var actx = new AudioCtx();
        var notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Royal Arpeggio)
        notes.forEach(function (freq, i) {
          var osc = actx.createOscillator();
          var gain = actx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, actx.currentTime + i * 0.1);
          gain.gain.setValueAtTime(0.001, actx.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.18, actx.currentTime + i * 0.1 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + i * 0.1 + 0.7);
          osc.connect(gain);
          gain.connect(actx.destination);
          osc.start(actx.currentTime + i * 0.1);
          osc.stop(actx.currentTime + i * 0.1 + 0.75);
        });
      } catch (e) { /* ignore */ }
    }

    function triggerCelebrationConfetti() {
      var confettiCanvas = document.getElementById("scratch-confetti-canvas");
      if (!confettiCanvas) return;
      var cctx = confettiCanvas.getContext("2d");
      if (!cctx) return;

      var cw = (confettiCanvas.width = wrap.clientWidth || 440);
      var ch = (confettiCanvas.height = wrap.clientHeight || 220);

      var particles = [];
      var colors = ["#D9B866", "#C49A48", "#E85C83", "#F7DDE5", "#FFFFFF", "#FFD700", "#075E50"];

      for (var i = 0; i < 75; i++) {
        var angle = Math.random() * Math.PI * 2;
        var speed = Math.random() * 6 + 2.5;
        particles.push({
          x: cw / 2,
          y: ch / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.5,
          size: Math.random() * 7 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotSpeed: Math.random() * 12 - 6,
          shape: Math.random() > 0.4 ? "rect" : "circle",
          alpha: 1,
          gravity: 0.16
        });
      }

      var frameCount = 0;
      function animConfetti() {
        cctx.clearRect(0, 0, cw, ch);
        var alive = false;
        for (var pIdx = 0; pIdx < particles.length; pIdx++) {
          var p = particles[pIdx];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.vx *= 0.98;
          p.rotation += p.rotSpeed;
          p.alpha -= 0.012;

          if (p.alpha > 0) {
            alive = true;
            cctx.save();
            cctx.globalAlpha = Math.max(0, p.alpha);
            cctx.translate(p.x, p.y);
            cctx.rotate((p.rotation * Math.PI) / 180);
            cctx.fillStyle = p.color;
            if (p.shape === "rect") {
              cctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            } else {
              cctx.beginPath();
              cctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
              cctx.fill();
            }
            cctx.restore();
          }
        }

        frameCount++;
        if (alive && frameCount < 180) {
          requestAnimationFrame(animConfetti);
        } else {
          cctx.clearRect(0, 0, cw, ch);
        }
      }

      animConfetti();
    }

    function triggerCelebration() {
      wrap.classList.add("celebration-glow");
      var banner = document.getElementById("scratch-celebration-banner");
      if (banner) banner.style.display = "inline-flex";

      triggerCelebrationConfetti();
      playCelebrationChime();
    }

    function scratch(x, y) {
      if (isRevealed) return;
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 24, 0, Math.PI * 2);
      ctx.fill();

      checkScratched();
    }

    function checkScratched() {
      if (isRevealed) return;
      try {
        var imgData = ctx.getImageData(0, 0, width, height);
        var data = imgData.data;
        var transparent = 0;
        for (var i = 3; i < data.length; i += 16) {
          if (data[i] === 0) transparent++;
        }
        var pct = (transparent / (totalPixels / 4)) * 100;
        if (pct > 30) {
          isRevealed = true;
          canvas.style.transition = "opacity 0.7s ease-out";
          canvas.style.opacity = "0";
          setTimeout(function () {
            canvas.style.display = "none";
          }, 700);

          triggerCelebration();
        }
      } catch (e) { /* ignore */ }
    }

    function getPos(e) {
      var rect = canvas.getBoundingClientRect();
      var clientX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX);
      var clientY = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY);
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
      };
    }

    canvas.addEventListener("mousedown", function (e) {
      isScratching = true;
      var pos = getPos(e);
      scratch(pos.x, pos.y);
    });
    window.addEventListener("mousemove", function (e) {
      if (!isScratching) return;
      var pos = getPos(e);
      scratch(pos.x, pos.y);
    });
    window.addEventListener("mouseup", function () { isScratching = false; });

    canvas.addEventListener("touchstart", function (e) {
      isScratching = true;
      var pos = getPos(e);
      scratch(pos.x, pos.y);
      e.preventDefault();
    }, { passive: false });
    window.addEventListener("touchmove", function (e) {
      if (!isScratching) return;
      var pos = getPos(e);
      scratch(pos.x, pos.y);
    }, { passive: false });
    window.addEventListener("touchend", function () { isScratching = false; });
  }

  /* ---------- 4. Falling Rose Petals Canvas ---------- */
  function initFallingPetals(cfg) {
    var canvas = document.getElementById("petals-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (petalAnimId) cancelAnimationFrame(petalAnimId);

    var count = (cfg.theme && cfg.theme.petalDensity) || 24;
    var enabled = cfg.theme && cfg.theme.fallingPetals !== false;

    if (!enabled) {
      canvas.style.display = "none";
      return;
    }
    canvas.style.display = "block";

    var width = (canvas.width = window.innerWidth);
    var height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", function () {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    var petals = [];
    var petalColors = [
      "rgba(232, 92, 131, 0.75)",
      "rgba(247, 221, 229, 0.85)",
      "rgba(216, 70, 110, 0.70)",
      "rgba(255, 182, 193, 0.80)"
    ];

    for (var i = 0; i < count; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        size: Math.random() * 12 + 10,
        speedY: Math.random() * 1.3 + 0.7,
        speedX: Math.random() * 1.2 - 0.6,
        rotation: Math.random() * 360,
        rotSpeed: Math.random() * 1.5 - 0.75,
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
        flip: Math.random() * 360,
        flipSpeed: Math.random() * 2 + 1
      });
    }

    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.scale(Math.cos((p.flip * Math.PI) / 180), 1);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(p.size / 2, -p.size / 2, p.size, -p.size / 4, p.size, p.size / 2);
      ctx.bezierCurveTo(p.size, p.size, p.size / 2, p.size * 1.2, 0, p.size);
      ctx.bezierCurveTo(-p.size / 2, p.size * 1.2, -p.size, p.size, -p.size, p.size / 2);
      ctx.bezierCurveTo(-p.size, -p.size / 4, -p.size / 2, -p.size / 2, 0, 0);

      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    }

    function loop() {
      ctx.clearRect(0, 0, width, height);
      for (var i = 0; i < petals.length; i++) {
        var p = petals[i];
        p.y += p.speedY;
        p.x += Math.sin(p.y * 0.008) * 0.8 + p.speedX;
        p.rotation += p.rotSpeed;
        p.flip += p.flipSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;

        drawPetal(p);
      }
      petalAnimId = requestAnimationFrame(loop);
    }

    loop();
  }

  /* ---------- 5. Filterable Compact Gallery & Lightbox ---------- */
  function initGallery(cfg) {
    var grid = document.getElementById("gallery-grid");
    var tabsWrap = document.querySelector(".gallery-filter-tabs");
    var tabs = document.querySelectorAll(".tab-btn, .gal-tab");
    var modal = document.getElementById("gallery-lightbox");
    var imgEl = document.getElementById("lb-image");
    var capEl = document.getElementById("lb-caption");
    var countEl = document.getElementById("lb-counter");
    var prevBtn = document.getElementById("lb-prev");
    var nextBtn = document.getElementById("lb-next");
    var closeBtn = document.getElementById("lb-close");

    if (!grid) return;
    var allGallery = ((cfg.media && cfg.media.gallery) || []).filter(function (g) {
      return g && g.src;
    });
    filteredGalleryList = allGallery.slice();

    if (tabsWrap) {
      var hasCategories = allGallery.some(function (g) {
        return g.category && g.category !== "all";
      });
      tabsWrap.style.display = hasCategories ? "" : "none";
    }

    function renderFilteredGrid(items) {
      grid.innerHTML = "";
      items.forEach(function (item, idx) {
        var fig = document.createElement("figure");
        fig.className = "gallery-item reveal revealed";
        fig.setAttribute("data-gallery-index", idx);

        var img = document.createElement("img");
        img.src = item.src;
        img.alt = item.alt || item.caption || "Wedding Photo";
        img.loading = "lazy";
        fig.appendChild(img);

        var cap = document.createElement("figcaption");
        cap.className = "gallery-cap";
        var capTitle = document.createElement("span");
        capTitle.className = "gallery-cap-title";
        capTitle.textContent = item.caption || "";
        var zoomIcon = document.createElement("span");
        zoomIcon.className = "gallery-zoom-icon";
        zoomIcon.textContent = "✢";
        cap.appendChild(capTitle);
        cap.appendChild(zoomIcon);
        fig.appendChild(cap);

        grid.appendChild(fig);
      });
    }

    renderFilteredGrid(filteredGalleryList);

    // Tab Filtering
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.classList.remove("active", "is-active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("active", "is-active");
        tab.setAttribute("aria-selected", "true");
        var filter = tab.dataset.filter || "all";

        if (filter === "all") {
          filteredGalleryList = allGallery.slice();
        } else {
          filteredGalleryList = allGallery.filter(function (g) {
            if (g.category && g.category === filter) return true;
            var c = (g.caption || "").toLowerCase();
            if (filter === "couple") return c.includes("love") || c.includes("bride") || c.includes("groom") || c.includes("couple");
            if (filter === "ceremonies" || filter === "rituals") return c.includes("haldi") || c.includes("mehendi") || c.includes("sangeet") || c.includes("ceremony");
            if (filter === "palace" || filter === "celebrations") return c.includes("palace") || c.includes("courtyard") || c.includes("decor") || c.includes("banquet");
            return false;
          });
        }
        if (!filteredGalleryList.length) filteredGalleryList = allGallery.slice();
        renderFilteredGrid(filteredGalleryList);
      });
    });

    // Lightbox
    function showPhoto(idx) {
      if (!filteredGalleryList.length) return;
      lbCurrentIndex = (idx + filteredGalleryList.length) % filteredGalleryList.length;
      var item = filteredGalleryList[lbCurrentIndex];
      imgEl.src = item.src;
      imgEl.alt = item.alt || item.caption || "Royal Wedding Photo";
      if (capEl) capEl.textContent = item.caption || "";
      if (countEl) countEl.textContent = (lbCurrentIndex + 1) + " / " + filteredGalleryList.length;
    }

    grid.addEventListener("click", function (e) {
      var item = e.target.closest("[data-gallery-index]");
      if (!item) return;
      var idx = parseInt(item.getAttribute("data-gallery-index"), 10);
      showPhoto(idx);
      if (modal) {
        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener("click", function () { showPhoto(lbCurrentIndex - 1); });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () { showPhoto(lbCurrentIndex + 1); });
    }

    if (modal) {
      modal.addEventListener("click", function (e) {
        if (e.target === modal) {
          modal.classList.remove("active");
          modal.setAttribute("aria-hidden", "true");
        }
      });
    }
  }

  /* ---------- 6. Music Player ---------- */
  function initMusicPlayer(cfg) {
    var btn = document.getElementById("btn-music-toggle");
    audioElement = document.getElementById("bg-music");
    if (!btn || !audioElement) return;

    if (cfg.music && cfg.music.src) {
      audioElement.src = cfg.music.src;
    }

    btn.addEventListener("click", function () {
      if (isAudioPlaying) {
        pauseMusic();
      } else {
        playMusic();
      }
    });
  }

  function playMusic() {
    if (!audioElement) return;
    var btn = document.getElementById("btn-music-toggle");
    var p = audioElement.play();
    if (p !== undefined) {
      p.then(function () {
        isAudioPlaying = true;
        if (btn) btn.classList.add("is-playing");
      }).catch(function () {
        isAudioPlaying = false;
      });
    }
  }

  function pauseMusic() {
    if (!audioElement) return;
    var btn = document.getElementById("btn-music-toggle");
    audioElement.pause();
    isAudioPlaying = false;
    if (btn) btn.classList.remove("is-playing");
  }

  /* ---------- 7. Minimal RSVP Form Handling ---------- */
  function initRsvpForm(cfg) {
    var form = document.getElementById("rsvp-form");
    var statusMsg = document.getElementById("rsvp-status-msg");
    var submitBtn = document.getElementById("btn-submit-rsvp");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var nameInput = document.getElementById("rsvp-name");
      var phoneInput = document.getElementById("rsvp-phone");
      var guestsInput = document.getElementById("rsvp-guests");
      var attendanceInput = form.querySelector("input[name='rsvp-attendance']:checked");

      var name = nameInput ? nameInput.value.trim() : "";
      if (!name) {
        if (nameInput) nameInput.focus();
        if (statusMsg) {
          statusMsg.className = "rsvp-feedback-msg error";
          statusMsg.textContent = "Please enter your full name.";
        }
        return;
      }

      var phone = phoneInput ? phoneInput.value.trim() : "";
      if (!phone) {
        if (phoneInput) phoneInput.focus();
        if (statusMsg) {
          statusMsg.className = "rsvp-feedback-msg error";
          statusMsg.textContent = "Please enter your mobile or WhatsApp number.";
        }
        return;
      }

      var attendance = attendanceInput ? attendanceInput.value : "Joyfully Accept";
      var guests = guestsInput ? parseInt(guestsInput.value, 10) || 1 : 1;

      var rsvpEntry = {
        name: name,
        attendance: attendance,
        guests: guests,
        phone: phone,
        events: ["All Wedding Celebrations"],
        message: ""
      };

      Data.saveRsvp(rsvpEntry);

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "<span>RSVP Confirmed ✨</span>";
      }

      if (statusMsg) {
        statusMsg.className = "rsvp-feedback-msg success";
        var venueSuffix = cfg.event && cfg.event.venueName ? " at " + cfg.event.venueName : "";
        statusMsg.textContent = "Thank you, " + name + "! Your presence has been confirmed. We look forward to celebrating with you" + venueSuffix + ".";
      }

      var waPhone = (cfg.rsvp && cfg.rsvp.whatsappPhone) || "";
      var cleanPhone = waPhone.replace(/\D/g, "");
      var coupleName = (cfg.couple && cfg.couple.displayName) || "our";

      if (cleanPhone && !(window.__MEHFILL__ && window.__MEHFILL__.published)) {
        var textMsg = "🌸 *RSVP for " + coupleName + "'s Wedding Celebration* 🌸\n\n" +
          "*Guest Name:* " + name + "\n" +
          "*Attendance:* " + attendance + "\n" +
          "*Number of Guests:* " + guests + "\n" +
          "*Phone:* " + phone + "\n\n" +
          "_Confirmed via Mehfill.in Digital Invitation_";

        var waUrl = "https://wa.me/" + cleanPhone + "?text=" + encodeURIComponent(textMsg);

        setTimeout(function () {
          window.open(waUrl, "_blank", "noopener");
        }, 700);
      }
    });
  }

  /* ---------- 8. Scroll Reveal Animations ---------- */
  function initScrollReveals() {
    var reveals = document.querySelectorAll(".reveal");
    function checkReveals() {
      var triggerBottom = window.innerHeight * 0.92;
      for (var i = 0; i < reveals.length; i++) {
        var boxTop = reveals[i].getBoundingClientRect().top;
        if (boxTop < triggerBottom) {
          reveals[i].classList.add("revealed");
        }
      }
    }
    window.addEventListener("scroll", checkReveals, { passive: true });
    checkReveals();
  }

  /* ---------- Live Preview Bridge for Editor ---------- */
  window.MehfillPreview = {
    applyConfig: function (newConfig) {
      if (!newConfig) return;
      currentConfig = newConfig;
      R.renderContent(currentConfig);
      startCountdown(currentConfig);
      initFallingPetals(currentConfig);
      initScratchCard(currentConfig);
      initGallery(currentConfig);
    }
  };

  function buildConfigFromMehfill(c) {
    var bride = (c.brideName || "").trim();
    var groom = (c.groomName || "").trim();
    var displayName = [bride, groom].filter(Boolean).join(" & ");
    var bi = bride ? bride.charAt(0).toUpperCase() : "";
    var gi = groom ? groom.charAt(0).toUpperCase() : "";
    var initials = bi && gi ? (bi + " · " + gi) : (c.initials || "");

    var galleryItems = Array.isArray(c.galleryItems) && c.galleryItems.length
      ? c.galleryItems.map(function (item) {
          return {
            src: item.url,
            caption: item.caption || "",
            category: item.category || "all",
            alt: item.caption || "Wedding Photo"
          };
        })
      : (Array.isArray(c.gallery) ? c.gallery.filter(Boolean).map(function (u) {
          return { src: u, caption: "", category: "all", alt: "Wedding Photo" };
        }) : []);

    var events = Array.isArray(c.events)
      ? c.events.filter(function (ev) { return ev && String(ev.name || "").trim(); }).map(function (ev) {
          return {
            id: ev.id,
            title: ev.name,
            name: ev.name,
            date: ev.date || "",
            time: ev.time || "",
            venue: ev.venue || "",
            address: ev.address || "",
            mapsUrl: ev.mapsUrl || "",
            description: ev.description || "",
            image: ""
          };
        })
      : [];

    var milestones = Array.isArray(c.loveStory)
      ? c.loveStory.filter(function (m) { return m && String(m.title || "").trim(); }).map(function (m) {
          return {
            id: m.id,
            year: m.date || "",
            date: m.date || "",
            title: m.title,
            description: m.description || "",
            image: m.imageUrl || ""
          };
        })
      : [];

    var familyNames = (c.familyNames || "").trim();

    return {
      _isCustomInvitation: true,
      couple: {
        brideName: bride,
        groomName: groom,
        displayName: displayName,
        initials: initials,
        brideParents: (c.brideParents || "").trim(),
        groomParents: (c.groomParents || "").trim(),
        brideBio: (c.brideBio || "").trim(),
        groomBio: (c.groomBio || "").trim(),
        introduction: (c.intro || "").trim() || "Together With Their Families",
        invitationHeading: "You're Invited",
        welcomeMessage: (c.message || "").trim(),
        familyInvitation: familyNames,
        closingMessage: (c.message || "").trim(),
        footerMessage: familyNames ? ("With heartfelt gratitude from " + familyNames) : ""
      },
      hero: {
        eyebrow: "Royal Vivah Celebration",
        subtitle: "Invite You To Celebrate Their Wedding",
        tagline: "",
        badgeText: "Shubh Vivah",
        mandapImage: "assets/images/jaipur-mandap.jpg",
        mandapLandscape: "assets/images/jaipur-mandap-landscape.jpg",
        floralArch: "assets/images/floral-arch.jpg",
        lanternImage: "assets/images/golden-lantern.jpg",
        watchVideoLabel: "Watch Wedding Video",
        rsvpButtonLabel: "Confirm RSVP"
      },
      video: {
        enabled: true,
        src: "lv_0_20261018234041.mp4",
        poster: "assets/images/video-poster.jpg",
        heading: "A Royal Celebration of Love",
        introHeading: "YOU'RE INVITED",
        introSubheading: "The Wedding Celebration Of",
        openButtonLabel: "Play Invitation",
        skipLabel: "Skip"
      },
      event: {
        title: "The Wedding Celebration",
        date: (c.weddingDate || "").trim(),
        time: (c.startTime || "").trim(),
        endTime: (c.endTime || "").trim(),
        venueName: (c.venueName || "").trim(),
        address: (c.venueAddress || "").trim(),
        mapsUrl: (c.mapsUrl || "").trim(),
        dressCode: "",
        notes: "",
        events: events
      },
      story: {
        heading: "Our Love Story",
        description: "",
        milestones: milestones
      },
      media: {
        bridePhoto: (c.bridePhoto || "").trim(),
        groomPhoto: (c.groomPhoto || "").trim(),
        couplePortrait: "",
        venuePhoto: "",
        gallery: galleryItems
      },
      countdown: {
        heading: "Counting Down To Our Wedding",
        subheading: "Every heartbeat brings us closer to our sacred vows",
        passedMessage: "The celebrations have commenced! Thank you for showering your heartfelt love and blessings upon us."
      },
      scratchCard: {
        title: "A Special Keepsake For You",
        subtitle: "Scratch to reveal our special wedding date!",
        hiddenHeading: "Save The Date",
        hiddenSub: "Save The Date",
        hiddenMessage: (c.message || "").trim() || "Join us as we celebrate the beginning of our forever."
      },
      rsvp: {
        heading: "Will You Join Us?",
        subheading: (c.rsvp && c.rsvp.message) || "Kindly confirm your presence.",
        submitLabel: "Submit RSVP",
        whatsappPhone: (c.rsvp && c.rsvp.contactPhone) || ""
      },
      music: {
        enabled: Boolean(c.musicUrl),
        src: c.musicUrl || "assets/audio/music.mp3"
      },
      sections: {
        visible: {
          rsvp: !(c.rsvp && c.rsvp.enabled === false)
        }
      },
      theme: {}
    };
  }

  /* ---------- Boot Page ---------- */
  function boot() {
    if (window.__MEHFILL__ && window.__MEHFILL__.content) {
      currentConfig = buildConfigFromMehfill(window.__MEHFILL__.content);
    } else {
      var draft = Data.loadDraft();
      currentConfig = draft || Data.clone(Data.DEFAULT_INVITATION);
    }

    R.renderContent(currentConfig);
    initOpeningExperience(currentConfig);
    startCountdown(currentConfig);
    initScratchCard(currentConfig);
    initFallingPetals(currentConfig);
    initGallery(currentConfig);
    initMusicPlayer(currentConfig);
    initRsvpForm(currentConfig);
    initScrollReveals();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
