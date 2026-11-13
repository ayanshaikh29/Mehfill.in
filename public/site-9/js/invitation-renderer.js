/*
 * Mehfill.in — Site 9: Royal Floral Wedding Invitation
 * Central DOM Renderer & Live Preview Engine
 * Drives both public standalone invitation & live editor iframe preview
 */
(function (global) {
  "use strict";

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function parseISODate(iso) {
    if (!iso) return null;
    var parts = String(iso).split("-");
    if (parts.length < 3) return null;
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function fmtDateLong(iso) {
    var d = parseISODate(iso);
    if (!d) return String(iso || "");
    return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
  }

  function fmtTime12(t) {
    if (!t) return "";
    var s = String(t).trim();
    if (/am|pm/i.test(s)) return s;
    var parts = s.split(":");
    var h = Number(parts[0]);
    var m = parts[1] || "00";
    if (Number.isNaN(h)) return s;
    var suffix = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return h + ":" + m + " " + suffix;
  }

  function isSafeHttpUrl(url) {
    if (!url || typeof url !== "string") return false;
    var trimmed = url.trim();
    if (!trimmed) return false;
    try {
      var parsed = new URL(trimmed, global.location ? global.location.origin : "https://mehfill.in");
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch (e) {
      return false;
    }
  }

  function formatDisplayDate(val) {
    if (!val) return "";
    var s = String(val).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return fmtDateLong(s);
    }
    return s;
  }

  function applyThemeVariables(cfg) {
    var root = document.documentElement;
    var th = (cfg && cfg.theme) || {};

    if (th.emerald) root.style.setProperty("--color-emerald", th.emerald);
    if (th.deepGreen) root.style.setProperty("--color-deep-green", th.deepGreen);
    if (th.floralPink) root.style.setProperty("--color-floral-pink", th.floralPink);
    if (th.blushPink) root.style.setProperty("--color-blush-pink", th.blushPink);
    if (th.ivory) root.style.setProperty("--color-ivory", th.ivory);
    if (th.antiqueGold) root.style.setProperty("--color-gold", th.antiqueGold);
    if (th.softWhite) root.style.setProperty("--color-soft-white", th.softWhite);

    if (th.headingFont) root.style.setProperty("--font-heading", "'" + th.headingFont + "', 'Cormorant Garamond', Georgia, serif");
    if (th.namesFont) root.style.setProperty("--font-names", "'" + th.namesFont + "', 'Playfair Display', Georgia, serif");
    if (th.bodyFont) root.style.setProperty("--font-body", "'" + th.bodyFont + "', 'Montserrat', sans-serif");
  }

  function renderContent(cfg) {
    if (!cfg) return;
    applyThemeVariables(cfg);

    // Update Page Title
    var displayName = cfg.couple.displayName || [cfg.couple.brideName, cfg.couple.groomName].filter(Boolean).join(" & ");
    var title = (displayName ? displayName + " — " : "") + "Royal Wedding Invitation | Mehfill.in";
    document.title = title;

    // Couple & Names everywhere
    setTextAll("[data-bind='couple.displayName']", displayName);
    setTextAll("[data-bind='couple.brideName']", cfg.couple.brideName);
    setTextAll("[data-bind='couple.groomName']", cfg.couple.groomName);
    setTextAll("[data-bind='couple.initials']", cfg.couple.initials);
    setOptionalTextAll("[data-bind='couple.introduction']", cfg.couple.introduction);
    setTextAll("[data-bind='couple.invitationHeading']", cfg.couple.invitationHeading);
    setOptionalTextAll("[data-bind='couple.welcomeMessage']", cfg.couple.welcomeMessage);
    setOptionalTextAll("[data-bind='couple.familyInvitation']", cfg.couple.familyInvitation);
    setOptionalTextAll("[data-bind='couple.closingMessage']", cfg.couple.closingMessage);
    setOptionalTextAll("[data-bind='couple.footerMessage']", cfg.couple.footerMessage);

    // Bride & Groom specifics (hide missing optional parents, bios & photos cleanly)
    setOptionalTextAll("[data-bind='couple.brideParents']", cfg.couple.brideParents);
    setOptionalTextAll("[data-bind='couple.groomParents']", cfg.couple.groomParents);
    setOptionalTextAll("[data-bind='couple.brideBio']", cfg.couple.brideBio);
    setOptionalTextAll("[data-bind='couple.groomBio']", cfg.couple.groomBio);

    setCouplePhoto("[data-bind-img='media.bridePhoto']", cfg.media && cfg.media.bridePhoto, cfg.couple.brideName);
    setCouplePhoto("[data-bind-img='media.groomPhoto']", cfg.media && cfg.media.groomPhoto, cfg.couple.groomName);
    setImageAll("[data-bind-img='media.couplePortrait']", cfg.media && cfg.media.couplePortrait, displayName);

    // Hero Section
    setTextAll("[data-bind='hero.eyebrow']", cfg.hero.eyebrow);
    setTextAll("[data-bind='hero.subtitle']", cfg.hero.subtitle);
    setTextAll("[data-bind='hero.tagline']", cfg.hero.tagline);
    setTextAll("[data-bind='hero.badgeText']", cfg.hero.badgeText);
    setTextAll("[data-bind='hero.watchVideoLabel']", (cfg.hero && cfg.hero.watchVideoLabel) || "Watch Wedding Video");
    setTextAll("[data-bind='hero.rsvpButtonLabel']", (cfg.hero && cfg.hero.rsvpButtonLabel) || "Confirm RSVP");
    setImageAll("[data-bind-img='hero.mandapImage']", cfg.hero.mandapImage, "Royal Jaipur Wedding Mandap");
    var mandapSource = document.querySelector(".mandap-picture source");
    if (mandapSource && cfg.hero && cfg.hero.mandapLandscape) {
      mandapSource.srcset = cfg.hero.mandapLandscape;
    }
    setImageAll("[data-bind-img='hero.floralArch']", cfg.hero.floralArch, "Pink Bougainvillea Arch");
    setImageAll("[data-bind-img='hero.lanternImage']", cfg.hero.lanternImage, "Antique Hanging Golden Lantern");

    // Event & Venue
    var hasDate = Boolean(cfg.event && cfg.event.date && parseISODate(cfg.event.date));
    var dateFormatted = hasDate ? fmtDateLong(cfg.event.date) : "";
    var timeFormatted = cfg.event && cfg.event.time
      ? fmtTime12(cfg.event.time) + (cfg.event.endTime ? " – " + fmtTime12(cfg.event.endTime) : " onwards")
      : "";

    setTextAll("[data-bind='event.title']", cfg.event.title);
    setOptionalTextAll("[data-bind='event.dateFormatted']", dateFormatted);
    setOptionalTextAll("[data-bind='event.timeFormatted']", timeFormatted);
    setOptionalTextAll("[data-bind='event.venueName']", cfg.event.venueName);
    setOptionalTextAll("[data-bind='event.address']", cfg.event.address);
    setOptionalTextAll("[data-bind='event.dressCode']", cfg.event.dressCode);
    setOptionalTextAll("[data-bind='event.notes']", cfg.event.notes);
    setImageAll("[data-bind-img='media.venuePhoto']", cfg.media && cfg.media.venuePhoto, cfg.event.venueName);
    var venueImgWrap = document.querySelector(".venue-image-wrap");
    var venueCard = document.querySelector(".venue-showcase-card");
    var hasVenuePhoto = Boolean(cfg.media && cfg.media.venuePhoto);
    if (venueImgWrap) venueImgWrap.style.display = hasVenuePhoto ? "" : "none";
    if (venueCard) venueCard.classList.toggle("is-no-venue-photo", !hasVenuePhoto);

    var venueSec = document.querySelector("[data-section='venue']");
    if (venueSec) {
      var hasVenueInfo = Boolean((cfg.event.venueName && cfg.event.venueName.trim()) || (cfg.event.address && cfg.event.address.trim()));
      venueSec.style.display = hasVenueInfo ? "" : "none";
      if (cfg._isCustomInvitation) {
        var venueSub = venueSec.querySelector(".section-subtitle");
        var venueTag = venueSec.querySelector(".venue-tag");
        var venuePills = venueSec.querySelector(".venue-meta-pills");
        if (venueSub) venueSub.style.display = "none";
        if (venueTag) venueTag.style.display = "none";
        if (venuePills) venuePills.style.display = "none";
      }
    }

    var mapsLink = document.querySelector("[data-bind-href='event.mapsUrl']");
    if (mapsLink) {
      var customMaps = isSafeHttpUrl(cfg.event.mapsUrl) ? cfg.event.mapsUrl.trim() : "";
      var fallbackQuery = [cfg.event.venueName, cfg.event.address].filter(Boolean).join(" ").trim();
      var resolvedMap = customMaps || (fallbackQuery ? "https://maps.google.com/?q=" + encodeURIComponent(fallbackQuery) : "");
      if (resolvedMap) {
        mapsLink.href = resolvedMap;
        mapsLink.style.display = "";
      } else {
        mapsLink.removeAttribute("href");
        mapsLink.style.display = "none";
      }
    }

    // Surprise blessing line on scratch card
    var blessingEl = document.querySelector(".surprise-blessing");
    if (blessingEl) {
      var cityShort = cfg.event.address ? String(cfg.event.address).split(",")[0].trim() : "";
      var blessingParts = [displayName, cityShort].filter(Boolean);
      blessingEl.textContent = blessingParts.length ? "✨ " + blessingParts.join(" · ") + " ✨" : "";
    }

    // Hide countdown & scratch card when wedding date is missing
    var countdownSec = document.querySelector("[data-section='countdown']");
    if (countdownSec) {
      countdownSec.style.display = hasDate ? "" : "none";
    }
    var scratchSec = document.querySelector("[data-section='scratchCard']");
    if (scratchSec) {
      scratchSec.style.display = hasDate ? "" : "none";
    }

    // Video Gate & Theater
    setTextAll("[data-bind='video.heading']", cfg.video.heading);
    setTextAll("[data-bind='video.introHeading']", cfg.video.introHeading);
    setTextAll("[data-bind='video.introSubheading']", cfg.video.introSubheading);
    setTextAll("[data-bind='video.openButtonLabel']", cfg.video.openButtonLabel);
    setTextAll("[data-bind='video.skipLabel']", cfg.video.skipLabel);
    var videoEl = document.getElementById("intro-video") || document.getElementById("theater-video");
    if (videoEl && cfg.video && cfg.video.src) {
      if (videoEl.getAttribute("src") !== cfg.video.src) {
        videoEl.src = cfg.video.src;
      }
      if (cfg.video.poster) videoEl.poster = cfg.video.poster;
    }
    var theaterVideoEl = document.getElementById("theater-video");
    if (theaterVideoEl && cfg.video && cfg.video.src) {
      if (theaterVideoEl.getAttribute("src") !== cfg.video.src) {
        theaterVideoEl.src = cfg.video.src;
      }
      if (cfg.video.poster) theaterVideoEl.poster = cfg.video.poster;
    }

    // Countdown
    setTextAll("[data-bind='countdown.heading']", cfg.countdown.heading);
    setTextAll("[data-bind='countdown.subheading']", cfg.countdown.subheading);
    setTextAll("[data-bind='countdown.passedMessage']", cfg.countdown.passedMessage);

    // Scratch Card
    setTextAll("[data-bind='scratchCard.title']", cfg.scratchCard.title);
    setTextAll("[data-bind='scratchCard.subtitle']", cfg.scratchCard.subtitle);
    setTextAll("[data-bind='scratchCard.hiddenHeading']", cfg.scratchCard.hiddenHeading);
    setTextAll("[data-bind='scratchCard.hiddenSub']", cfg.scratchCard.hiddenSub);
    setTextAll("[data-bind='scratchCard.hiddenMessage']", cfg.scratchCard.hiddenMessage);

    // RSVP
    setTextAll("[data-bind='rsvp.heading']", cfg.rsvp.heading);
    setTextAll("[data-bind='rsvp.subheading']", cfg.rsvp.subheading);
    setTextAll("[data-bind='rsvp.submitLabel']", cfg.rsvp.submitLabel);

    // Love Story milestones
    renderMilestones(cfg.story.milestones);

    // Events cards
    renderEvents(cfg.event.events);

    // Gallery
    renderGallery(cfg.media.gallery);

    // Section Visibility Toggles
    renderSectionVisibility(cfg.sections && cfg.sections.visible);
  }

  function setTextAll(selector, text) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = text != null ? text : "";
    }
  }

  function setOptionalTextAll(selector, text) {
    var nodes = document.querySelectorAll(selector);
    var val = text != null ? String(text).trim() : "";
    for (var i = 0; i < nodes.length; i++) {
      if (val) {
        nodes[i].textContent = val;
        nodes[i].style.display = "";
      } else {
        nodes[i].textContent = "";
        nodes[i].style.display = "none";
      }
    }
  }

  function setCouplePhoto(selector, src, alt) {
    var nodes = document.querySelectorAll(selector);
    var cleanSrc = src ? String(src).trim() : "";
    for (var i = 0; i < nodes.length; i++) {
      var wrap = nodes[i].closest(".couple-img-wrap");
      if (cleanSrc) {
        nodes[i].src = cleanSrc;
        nodes[i].style.display = "";
        if (wrap) wrap.classList.remove("is-no-photo");
      } else {
        nodes[i].removeAttribute("src");
        nodes[i].style.display = "none";
        if (wrap) wrap.classList.add("is-no-photo");
      }
      if (alt) nodes[i].alt = alt;
    }
  }

  function setImageAll(selector, src, alt) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) {
      if (src) {
        nodes[i].src = src;
        nodes[i].style.display = "";
      } else {
        nodes[i].removeAttribute("src");
        nodes[i].style.display = "none";
      }
      if (alt) nodes[i].alt = alt;
    }
  }

  function renderMilestones(milestones) {
    var host = document.getElementById("story-timeline");
    var sec = document.querySelector("[data-section='story']");
    var valid = (milestones || []).filter(function (m) {
      return m && String(m.title || "").trim().length > 0;
    });
    if (sec) {
      sec.style.display = valid.length ? "" : "none";
    }
    if (!host) return;
    host.innerHTML = "";
    if (!valid.length) return;

    valid.forEach(function (m, idx) {
      var item = document.createElement("div");
      item.className = "story-item " + (idx % 2 === 0 ? "story-left" : "story-right") + " reveal";

      var content = document.createElement("div");
      content.className = "story-card";

      var cornerImg = document.createElement("img");
      cornerImg.src = "assets/images/floral-corner-tr.png";
      cornerImg.alt = "";
      cornerImg.className = "story-card-corner";
      cornerImg.setAttribute("aria-hidden", "true");
      content.appendChild(cornerImg);

      if (m.image) {
        var imgWrap = document.createElement("div");
        imgWrap.className = "story-img-wrap";
        var img = document.createElement("img");
        img.src = m.image;
        img.alt = m.title || "Our Story Milestone";
        img.loading = "lazy";
        imgWrap.appendChild(img);
        content.appendChild(imgWrap);
      }

      var dateText = formatDisplayDate(m.year || m.date);
      if (dateText) {
        var dateTag = document.createElement("span");
        dateTag.className = "story-date";
        dateTag.textContent = dateText;
        content.appendChild(dateTag);
      }

      var title = document.createElement("h3");
      title.className = "story-title";
      title.textContent = m.title || "";
      content.appendChild(title);

      if (m.description && String(m.description).trim()) {
        var desc = document.createElement("p");
        desc.className = "story-desc";
        desc.textContent = m.description;
        content.appendChild(desc);
      }

      var node = document.createElement("div");
      node.className = "story-node";
      node.innerHTML = "<span class='story-node-ring'></span><img src='assets/images/royal-rose-blossom.png' class='story-rose-icon' alt='' aria-hidden='true' />";

      item.appendChild(content);
      item.appendChild(node);
      host.appendChild(item);
    });
  }

  function renderEvents(events) {
    var host = document.getElementById("events-grid");
    var sec = document.querySelector("[data-section='events']");
    var valid = (events || []).filter(function (ev) {
      return ev && String(ev.title || ev.name || "").trim().length > 0;
    });
    if (sec) {
      sec.style.display = valid.length ? "" : "none";
    }
    if (!host) return;
    host.innerHTML = "";
    if (!valid.length) return;

    valid.forEach(function (ev) {
      var card = document.createElement("article");
      card.className = "event-card reveal";

      var evTitle = String(ev.title || ev.name || "").trim();
      var evDate = formatDisplayDate(ev.date);
      var evTime = ev.time ? fmtTime12(ev.time) : "";
      var evDesc = ev.description ? String(ev.description).trim() : "";
      var evVenue = ev.venue ? String(ev.venue).trim() : "";
      var evAddress = ev.address ? String(ev.address).trim() : "";
      var evMap = isSafeHttpUrl(ev.mapsUrl) ? ev.mapsUrl.trim() : "";

      if (ev.image) {
        var banner = document.createElement("div");
        banner.className = "event-banner";
        var bImg = document.createElement("img");
        bImg.src = ev.image;
        bImg.alt = evTitle || "Wedding Function";
        bImg.loading = "lazy";
        var cImg = document.createElement("img");
        cImg.src = "assets/images/floral-corner-tr.png";
        cImg.alt = "";
        cImg.className = "event-card-corner";
        cImg.setAttribute("aria-hidden", "true");
        banner.appendChild(bImg);
        banner.appendChild(cImg);
        card.appendChild(banner);
      }

      var body = document.createElement("div");
      body.className = "event-body";

      if (evDate || evTime) {
        var meta = document.createElement("div");
        meta.className = "event-meta";
        if (evDate) {
          var dc = document.createElement("span");
          dc.className = "event-date-chip";
          dc.textContent = evDate;
          meta.appendChild(dc);
        }
        if (evTime) {
          var tc = document.createElement("span");
          tc.className = "event-time-chip";
          tc.textContent = evTime;
          meta.appendChild(tc);
        }
        body.appendChild(meta);
      }

      var h3 = document.createElement("h3");
      h3.className = "event-title";
      h3.textContent = evTitle;
      body.appendChild(h3);

      if (evDesc) {
        var pDesc = document.createElement("p");
        pDesc.className = "event-desc";
        pDesc.textContent = evDesc;
        body.appendChild(pDesc);
      }

      if (evVenue || evAddress) {
        var vBox = document.createElement("div");
        vBox.className = "event-venue-box";
        vBox.innerHTML = "<svg viewBox='0 0 24 24' width='16' height='16' class='event-icon'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z' fill='currentColor'/></svg>";
        var vWrap = document.createElement("div");
        if (evVenue) {
          var vSpan = document.createElement("span");
          vSpan.className = "event-venue-name";
          vSpan.textContent = evVenue;
          vWrap.appendChild(vSpan);
        }
        if (evAddress) {
          var aSpan = document.createElement("span");
          aSpan.className = "event-address-text";
          aSpan.textContent = evAddress;
          vWrap.appendChild(aSpan);
        }
        vBox.appendChild(vWrap);
        body.appendChild(vBox);
      }

      if (evMap) {
        var aLink = document.createElement("a");
        aLink.href = evMap;
        aLink.target = "_blank";
        aLink.rel = "noopener noreferrer";
        aLink.className = "event-link";
        aLink.innerHTML = "<span>Map Location</span><svg viewBox='0 0 24 24' width='14' height='14'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z' fill='currentColor'/></svg>";
        body.appendChild(aLink);
      }

      card.appendChild(body);
      host.appendChild(card);
    });
  }

  function renderGallery(gallery) {
    var host = document.getElementById("gallery-grid");
    var sec = document.querySelector("[data-section='gallery']");
    var valid = (gallery || []).filter(function (item) {
      return item && item.src && String(item.src).trim().length > 0;
    });
    if (sec) {
      sec.style.display = valid.length ? "" : "none";
    }
    if (!host) return;
    host.innerHTML = "";
    if (!valid.length) return;

    valid.forEach(function (item, idx) {
      var fig = document.createElement("figure");
      fig.className = "gallery-item reveal";
      fig.setAttribute("data-gallery-index", idx);
      fig.tabIndex = 0;
      fig.setAttribute("role", "button");
      fig.setAttribute("aria-label", "View photo: " + (item.caption || item.alt || "Wedding Photo"));

      var img = document.createElement("img");
      img.src = item.src;
      img.alt = item.alt || item.caption || "Wedding Photo";
      img.loading = "lazy";
      fig.appendChild(img);

      var caption = document.createElement("figcaption");
      caption.className = "gallery-cap";
      var capTitle = document.createElement("span");
      capTitle.className = "gallery-cap-title";
      capTitle.textContent = item.caption || "";
      var zoomIcon = document.createElement("span");
      zoomIcon.className = "gallery-zoom-icon";
      zoomIcon.textContent = "✢";
      caption.appendChild(capTitle);
      caption.appendChild(zoomIcon);
      fig.appendChild(caption);

      host.appendChild(fig);
    });
  }

  function renderSectionVisibility(vis) {
    if (!vis) return;
    Object.keys(vis).forEach(function (key) {
      var sec = document.querySelector("[data-section='" + key + "']");
      if (sec) {
        sec.style.display = vis[key] === false ? "none" : "";
      }
    });
  }

  global.MehfillRenderer = {
    applyThemeVariables: applyThemeVariables,
    renderContent: renderContent,
    fmtDateLong: fmtDateLong,
    fmtTime12: fmtTime12,
    parseISODate: parseISODate
  };

})(typeof window !== "undefined" ? window : this);
