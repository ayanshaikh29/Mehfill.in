/*
 * Mehfill.in — Luxury Ivory Reception template
 * Central DOM renderer. The public invitation (index.html) and the editor
 * live preview both render through this module, so what the customer edits
 * is exactly what guests see.
 */
(function (global) {
  "use strict";

  var FONT_STACKS = {
    script: {
      "Allura": "'Allura', 'Great Vibes', cursive",
      "Great Vibes": "'Great Vibes', 'Allura', cursive",
      "Cormorant Garamond": "'Cormorant Garamond', Georgia, serif"
    },
    heading: {
      "Cormorant Garamond": "'Cormorant Garamond', Georgia, serif",
      "Playfair Display": "'Playfair Display', Georgia, serif",
      "Marcellus": "'Marcellus', 'Cormorant Garamond', serif"
    },
    body: {
      "Montserrat": "'Montserrat', 'Noto Sans Devanagari', 'Noto Nastaliq Urdu', system-ui, sans-serif",
      "Lato": "'Lato', 'Noto Sans Devanagari', 'Noto Nastaliq Urdu', system-ui, sans-serif"
    }
  };

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function fmtTime12(t) {
    if (!t) return "";
    var parts = String(t).split(":");
    var h = Number(parts[0]);
    var m = parts[1] || "00";
    if (!Number.isFinite(h)) return String(t);
    var suffix = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return h + ":" + m + " " + suffix;
  }

  function parseISODate(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso || ""))) return null;
    var parts = iso.split("-");
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }

  function fmtDateLong(iso) {
    var d = parseISODate(iso);
    if (!d) return String(iso || "");
    return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
  }

  function fmtDateDotted(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso || ""))) return String(iso || "");
    var p = iso.split("-");
    return p[2] + " . " + p[1] + " . " + p[0];
  }

  function fmtDateTight(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso || ""))) return String(iso || "");
    var p = iso.split("-");
    return p[2] + " · " + p[1] + " · " + p[0];
  }

  function fmtWeekday(iso) {
    var d = parseISODate(iso);
    if (!d) return "";
    return WEEKDAYS[d.getDay()];
  }

  /** Countdown target: event date + time in Asia/Kolkata (+05:30). */
  function countdownTarget(event) {
    if (!event || !event.date) return null;
    var time = /^([01]\d|2[0-3]):[0-5]\d$/.test(event.time || "") ? event.time : "19:00";
    var t = new Date(event.date + "T" + time + ":00+05:30");
    if (Number.isNaN(t.getTime())) return null;
    return t;
  }

  function timeRangeText(event) {
    if (!event) return "";
    var start = fmtTime12(event.time);
    if (event.endTime) return start + " – " + fmtTime12(event.endTime);
    return start ? start + " onwards" : "";
  }

  function initialsOf(first, second) {
    var a = String(first || "").trim().charAt(0).toUpperCase();
    var b = String(second || "").trim().charAt(0).toUpperCase();
    if (a && b) return a + " · " + b;
    return a || b || "";
  }

  function coupleLabel(cfg) {
    var c = cfg.couple || {};
    if (c.displayName) return c.displayName;
    var names = [c.groomName, c.brideName].filter(Boolean);
    return names.join(" & ");
  }

  function mapsSearchUrl(event) {
    if (!event) return "";
    if (event.mapsUrl) return event.mapsUrl;
    var q = [event.venueName, event.address].filter(Boolean).join(" ").trim();
    if (!q) return "";
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
  }

  function mapsEmbedUrl(event) {
    if (!event) return "";
    var q = [event.venueName, event.address].filter(Boolean).join(" ").trim();
    if (!q) return "";
    return "https://www.google.com/maps?q=" + encodeURIComponent(q) + "&output=embed";
  }

  function whatsappUrl(phone, message) {
    var digits = String(phone || "").replace(/\D/g, "");
    if (digits.length < 8) return "";
    if (digits.length === 10) digits = "91" + digits;
    return "https://wa.me/" + digits + "?text=" + encodeURIComponent(message || "");
  }

  function rsvpMessage(cfg, response) {
    var c = cfg.couple || {};
    var e = cfg.event || {};
    var names = [c.groomName, c.brideName].filter(Boolean).join(" & ") || c.displayName || "the couple";
    var lines = [
      "Namaste! " + names + " 🎉",
      "",
      "I am delighted to respond to your " + (e.title || "wedding invitation") + " invitation.",
      "Date: " + fmtDateLong(e.date),
      "Time: " + timeRangeText(e),
      "Venue: " + (e.venueName || ""),
      "",
      "Response: " + ((response && response.choice) || cfg.rsvp.defaultChoice),
      "Guests: " + ((response && response.guests) || 1)
    ];
    if (response && response.name) lines.splice(1, 0, "From: " + response.name, "");
    if (response && response.phone) lines.push("Phone: " + response.phone);
    if (response && response.note) lines.push("Message: " + response.note);
    lines.push("", "— Sent via Mehfill.in");
    return lines.join("\n");
  }

  function icsEscape(text) {
    return String(text || "")
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\r?\n/g, "\\n");
  }

  function icsStamp(date) {
    return (
      date.getUTCFullYear() +
      pad2(date.getUTCMonth() + 1) +
      pad2(date.getUTCDate()) + "T" +
      pad2(date.getUTCHours()) +
      pad2(date.getUTCMinutes()) +
      pad2(date.getUTCSeconds()) + "Z"
    );
  }

  function buildICS(cfg) {
    var e = cfg.event || {};
    var start = countdownTarget(e);
    if (!start) return "";
    var end = e.endTime ? countdownTarget({ date: e.date, time: e.endTime }) : new Date(start.getTime() + 4 * 60 * 60 * 1000);
    var summary = [coupleLabel(cfg), "—", e.title || "Wedding Reception"].filter(Boolean).join(" ");
    var location = [e.venueName, e.address].filter(Boolean).join(", ");
    var description = e.calendarDescription || cfg.couple.welcomeMessage || "";
    var lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Mehfill.in//Luxury Ivory Reception//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:" + Date.now() + "-luxury-ivory-reception@mehfill.in",
      "DTSTAMP:" + icsStamp(new Date()),
      "DTSTART:" + icsStamp(start),
      "DTEND:" + icsStamp(end),
      "SUMMARY:" + icsEscape(summary),
      "DESCRIPTION:" + icsEscape(description),
      "LOCATION:" + icsEscape(location),
      "END:VEVENT",
      "END:VCALENDAR"
    ];
    return lines.join("\r\n");
  }

  function downloadText(filename, text, mime) {
    var blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  /** Set textContent on every element carrying the given data-bind path. */
  function applyBind(doc, path, value) {
    var els = doc.querySelectorAll('[data-bind="' + path + '"]');
    var text = value == null ? "" : String(value);
    for (var i = 0; i < els.length; i++) els[i].textContent = text;
  }

  function setAttr(root, selector, attr, value) {
    var el = root.querySelector(selector);
    if (el) el.setAttribute(attr, value == null ? "" : String(value));
  }

  function applyTheme(doc, theme) {
    var root = doc.documentElement;
    var map = {
      "--color-ivory": theme.background,
      "--color-pearl": theme.pearl,
      "--color-gold": theme.accent,
      "--color-gold-deep": theme.accentDeep,
      "--color-blush": theme.blush,
      "--color-text": theme.text,
      "--color-muted": theme.muted,
      "--font-script": FONT_STACKS.script[theme.scriptFont] || FONT_STACKS.script.Allura,
      "--font-heading": FONT_STACKS.heading[theme.headingFont] || FONT_STACKS.heading["Cormorant Garamond"],
      "--font-body": FONT_STACKS.body[theme.bodyFont] || FONT_STACKS.body.Montserrat,
      "--floral-opacity": String(Math.max(0, Math.min(1, (theme.floralIntensity || 0) / 100))),
      "--border-strength": String(Math.max(0.15, Math.min(1, (theme.borderIntensity || 0) / 100))),
      "--texture-opacity": theme.texture ? "1" : "0",
      "--corner-opacity": theme.corners ? "1" : "0"
    };
    Object.keys(map).forEach(function (key) {
      root.style.setProperty(key, map[key]);
    });
    if (theme.texture) root.classList.add("has-texture");
    else root.classList.remove("has-texture");
  }

  function applySections(doc, sections) {
    var flow = doc.querySelector(".inv-flow");
    if (!flow) return;
    var order = sections.order || [];
    order.forEach(function (id, i) {
      var el = flow.querySelector('[data-section="' + id + '"]');
      if (!el) return;
      el.style.order = String(i + 1);
      if (sections.visible[id]) el.classList.remove("mf-hidden");
      else el.classList.add("mf-hidden");
    });
    Object.keys(sections.visible || {}).forEach(function (id) {
      if (id === "envelope" || order.indexOf(id) !== -1) return;
      var el = flow.querySelector('[data-section="' + id + '"]');
      if (!el) return;
      if (sections.visible[id]) el.classList.remove("mf-hidden");
      else el.classList.add("mf-hidden");
    });
  }

  /** Programme timeline — event items (display strings for date/time). */
  function renderEvents(doc, events) {
    var host = doc.getElementById("events-timeline");
    if (!host) return;
    host.textContent = "";
    (events || []).forEach(function (ev) {
      if (!ev || !ev.title) return;
      var li = doc.createElement("li");
      li.className = "tl-item reveal";
      var dot = doc.createElement("span");
      dot.className = "tl-dot";
      dot.setAttribute("aria-hidden", "true");
      var body = doc.createElement("div");
      body.className = "tl-body";
      var h = doc.createElement("h3");
      h.textContent = ev.title || "";
      var meta = [ev.time, ev.description].filter(Boolean).join(" · ");
      var p = doc.createElement("p");
      p.textContent = meta || ev.venue || "";
      body.appendChild(h);
      body.appendChild(p);
      li.appendChild(dot);
      li.appendChild(body);
      host.appendChild(li);
    });
  }

  function renderMilestones(doc, story) {
    var host = doc.getElementById("story-milestones");
    if (!host) return;
    host.textContent = "";
    (story.milestones || []).forEach(function (m) {
      var li = doc.createElement("li");
      li.className = "milestone reveal";
      var year = doc.createElement("span");
      year.className = "ms-year";
      year.textContent = m.year || "";
      var body = doc.createElement("div");
      body.className = "ms-body";
      var title = doc.createElement("h3");
      title.textContent = m.title || "";
      var desc = doc.createElement("p");
      desc.textContent = m.description || "";
      body.appendChild(title);
      body.appendChild(desc);
      li.appendChild(year);
      li.appendChild(body);
      host.appendChild(li);
    });
  }

  function renderGallery(doc, gallery) {
    var host = doc.getElementById("gallery-grid");
    if (!host) return;
    host.textContent = "";
    (gallery || []).forEach(function (item, index) {
      var fig = doc.createElement("figure");
      fig.className = "g-item reveal";
      fig.setAttribute("data-index", String(index));
      var img = doc.createElement("img");
      img.src = item.src;
      img.alt = item.alt || item.caption || "Wedding photo";
      img.loading = "lazy";
      img.decoding = "async";
      if (item.position) img.style.objectPosition = item.position;
      img.addEventListener("error", function onErr() {
        img.removeEventListener("error", onErr);
        img.src = "assets/images/hero-couple.jpg";
      });
      var cap = doc.createElement("figcaption");
      cap.textContent = item.caption || "";
      fig.appendChild(img);
      if (item.caption) fig.appendChild(cap);
      host.appendChild(fig);
    });
    if (!host.children.length) {
      var empty = doc.createElement("p");
      empty.className = "gallery-empty";
      empty.textContent = "Photos will appear here soon.";
      host.appendChild(empty);
    }
  }

  function applyImages(doc, media, cfg) {
    var heroEl = doc.querySelector('[data-image="hero"]');
    if (heroEl) {
      heroEl.style.backgroundImage = media.hero ? "url(\"" + media.hero + "\")" : "";
      heroEl.style.backgroundPosition = media.heroPosition || "center";
    }
    var portrait = doc.querySelector('[data-image="portrait"]');
    if (portrait) {
      portrait.src = media.couplePortrait || media.hero || "assets/images/couple-portrait.jpg";
      portrait.style.objectPosition = media.portraitPosition || "center 30%";
      portrait.style.objectFit = media.portraitFit || "cover";
    }
    var stage = doc.querySelector('[data-image="stage"]');
    if (stage) {
      stage.src = media.stage || "assets/images/reception-stage.jpg";
      stage.alt = (cfg.event.title || "Reception") + " at " + (cfg.event.venueName || "the venue");
    }
    var bgWrap = doc.querySelector(".inv-bg-custom");
    if (bgWrap) {
      if (media.customBackground) {
        bgWrap.style.backgroundImage = "url(\"" + media.customBackground + "\")";
        bgWrap.classList.add("on");
      } else {
        bgWrap.style.backgroundImage = "";
        bgWrap.classList.remove("on");
      }
    }
  }

  /**
   * Apply a full invitation config to a document.
   * Only plain text is written (textContent) — customer input can never inject markup.
   */
  function apply(config, doc) {
    doc = doc || (typeof document !== "undefined" ? document : null);
    if (!config || !doc) return null;
    var cfg = config;
    var root = doc.documentElement;
    var c = cfg.couple || {};
    var e = cfg.event || {};
    var names = [c.groomName, c.brideName].filter(Boolean);
    var label = coupleLabel(cfg);

    applyTheme(doc, cfg.theme || {});
    applySections(doc, cfg.sections || {});

    // Couple names — keep the n1 / amp / n2 structure intact everywhere.
    var n1s = doc.querySelectorAll(".n1");
    var n2s = doc.querySelectorAll(".n2");
    for (var ni = 0; ni < n1s.length; ni++) n1s[ni].textContent = c.groomName || "";
    for (var nj = 0; nj < n2s.length; nj++) n2s[nj].textContent = c.brideName || "";
    applyBind(doc, "couple.displayName", label);

    var ini = c.initials || initialsOf(c.groomName, c.brideName);
    var seals = doc.querySelectorAll(".env-seal span");
    for (var si = 0; si < seals.length; si++) seals[si].textContent = ini || "";
    applyBind(doc, "couple.initials", ini);

    var binds = {
      "couple.groomName": c.groomName || "",
      "couple.brideName": c.brideName || "",
      "couple.introduction": c.introduction,
      "couple.invitationHeading": c.invitationHeading,
      "couple.welcomeMessage": c.welcomeMessage,
      "couple.customDescription": c.customDescription,
      "couple.familyInvitation": c.familyInvitation,
      "couple.closingMessage": c.closingMessage,
      "couple.footerMessage": c.footerMessage,
      "event.title": e.title,
      "event.dateLong": fmtDateLong(e.date),
      "event.dateTight": fmtDateTight(e.date),
      "event.dateDotted": fmtDateDotted(e.date),
      "event.weekday": fmtWeekday(e.date),
      "event.timeText": timeRangeText(e),
      "event.startTime12": fmtTime12(e.time),
      "event.venueName": e.venueName,
      "event.address": e.address,
      "event.dressCode": e.dressCode,
      "event.notes": e.notes,
      "story.heading": cfg.story.heading,
      "story.description": cfg.story.description,
      "text.heroEyebrow": cfg.text.heroEyebrow,
      "text.galleryHeading": cfg.text.galleryHeading,
      "text.eventHeading": cfg.text.eventHeading,
      "text.locationHeading": cfg.text.locationHeading,
      "text.venueLabel": cfg.text.venueLabel,
      "text.addressLabel": cfg.text.addressLabel,
      "text.dressCodeLabel": cfg.text.dressCodeLabel,
      "text.timeLabel": cfg.text.timeLabel,
      "text.dateLabel": cfg.text.dateLabel,
      "text.calendarButton": cfg.text.calendarButton,
      "text.directionsButton": cfg.text.directionsButton,
      "countdown.heading": cfg.countdown.label,
      "countdown.days": cfg.countdown.daysLabel,
      "countdown.hours": cfg.countdown.hoursLabel,
      "countdown.minutes": cfg.countdown.minutesLabel,
      "countdown.seconds": cfg.countdown.secondsLabel,
      "quote.text": cfg.quote.text,
      "quote.attribution": cfg.quote.attribution ? "— " + cfg.quote.attribution : "",
      "rsvp.heading": cfg.rsvp.heading,
      "rsvp.description": cfg.rsvp.description,
      "rsvp.nameLabel": cfg.rsvp.nameLabel,
      "rsvp.guestsLabel": cfg.rsvp.guestsLabel,
      "rsvp.phoneLabel": cfg.rsvp.phoneLabel,
      "rsvp.messageLabel": cfg.rsvp.messageLabel,
      "rsvp.submitLabel": cfg.rsvp.submitLabel,
      "rsvp.successTitle": cfg.rsvp.successTitle,
      "rsvp.successText": cfg.rsvp.successText || cfg.rsvp.confirmationMessage,
      "branding.credit": cfg.branding.credit,
      "branding.brandName": cfg.branding.brandName,
      "envelope.hint": cfg.envelope.hint
    };
    Object.keys(binds).forEach(function (path) {
      applyBind(doc, path, binds[path]);
    });

    // Brand link
    var brandLinks = doc.querySelectorAll("[data-brand-link]");
    for (var bl = 0; bl < brandLinks.length; bl++) {
      brandLinks[bl].textContent = cfg.branding.brandName || "Mehfill.in";
      brandLinks[bl].setAttribute("href", cfg.branding.brandUrl || "https://mehfill.in/");
    }

    // RSVP phone row visibility + choices + limits
    var phoneRow = doc.getElementById("rsvp-phone-row");
    if (phoneRow) phoneRow.classList.toggle("mf-hidden", !cfg.rsvp.askPhone);
    var noteRow = doc.getElementById("rsvp-note-row");
    if (noteRow) noteRow.classList.toggle("mf-hidden", !cfg.rsvp.askMessage);
    var guestsInput = doc.getElementById("rsvp-guests");
    if (guestsInput) guestsInput.setAttribute("max", String(cfg.rsvp.maxGuests || 10));
    var choiceHost = doc.getElementById("rsvp-choices");
    if (choiceHost) {
      choiceHost.textContent = "";
      (cfg.rsvp.choices || []).forEach(function (choice, i) {
        var labelEl = doc.createElement("label");
        labelEl.className = "choice";
        var input = doc.createElement("input");
        input.type = "radio";
        input.name = "attendance";
        input.value = choice;
        if (i === 0) input.checked = true;
        var span = doc.createElement("span");
        span.textContent = choice;
        labelEl.appendChild(input);
        labelEl.appendChild(span);
        choiceHost.appendChild(labelEl);
      });
    }

    // Countdown visibility
    var cdSection = doc.querySelector('[data-section="countdown"]');
    if (cdSection) {
      var showCd = cfg.countdown.show !== false && cfg.sections.visible.countdown !== false;
      cdSection.classList.toggle("mf-hidden-cd", !showCd);
      if (!showCd) cdSection.classList.add("mf-hidden");
      else if (cfg.sections.visible.countdown !== false) cdSection.classList.remove("mf-hidden");
    }

    // Envelope visibility
    var gate = doc.getElementById("envelope-gate");
    if (gate) {
      if (cfg.envelope.show === false) gate.classList.add("mf-hidden");
    }

    // Maps
    var searchUrl = mapsSearchUrl(e);
    if (searchUrl) {
      var links = doc.querySelectorAll("[data-maps-search]");
      for (var i = 0; i < links.length; i++) links[i].setAttribute("href", searchUrl);
      var embed = doc.querySelector("[data-maps-embed]");
      if (embed) {
        var target = mapsEmbedUrl(e);
        if (target && embed.getAttribute("src") !== target) embed.setAttribute("src", target);
      }
    }

    // Music
    var audio = doc.getElementById("bg-music");
    if (audio && cfg.music && cfg.music.src) {
      if (audio.getAttribute("src") !== cfg.music.src) audio.setAttribute("src", cfg.music.src);
    }
    var musicBtn = doc.getElementById("music-toggle");
    if (musicBtn) {
      musicBtn.classList.toggle("mf-hidden", !cfg.music.enabled);
      musicBtn.setAttribute("aria-label", cfg.music.openLabel || "Play music");
    }

    renderMilestones(doc, cfg.story || {});
    renderEvents(doc, (cfg.event || {}).events || []);
    renderGallery(doc, (cfg.media || {}).gallery || []);
    applyImages(doc, cfg.media || {}, cfg);

    var cdTarget = countdownTarget(e);
    root.setAttribute("data-countdown-target", cdTarget ? cdTarget.toISOString() : "");

    try {
      doc.title = label + " — " + (e.title || "Wedding Reception") + " Invitation | Mehfill.in";
    } catch (err) { /* ignore */ }

    return { countdownTarget: cdTarget };
  }

  global.MehfillRenderer = {
    apply: apply,
    renderEvents: renderEvents,
    fmtTime12: fmtTime12,
    fmtDateLong: fmtDateLong,
    fmtDateDotted: fmtDateDotted,
    fmtDateTight: fmtDateTight,
    fmtWeekday: fmtWeekday,
    countdownTarget: countdownTarget,
    timeRangeText: timeRangeText,
    initialsOf: initialsOf,
    coupleLabel: coupleLabel,
    mapsSearchUrl: mapsSearchUrl,
    mapsEmbedUrl: mapsEmbedUrl,
    whatsappUrl: whatsappUrl,
    rsvpMessage: rsvpMessage,
    buildICS: buildICS,
    downloadText: downloadText
  };
})(typeof window !== "undefined" ? window : this);
