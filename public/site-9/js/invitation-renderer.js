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
    var parts = String(t).split(":");
    var h = Number(parts[0]);
    var m = parts[1] || "00";
    if (Number.isNaN(h)) return String(t);
    var suffix = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return h + ":" + m + " " + suffix;
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
    var title = cfg.couple.displayName + " — Royal Wedding Invitation | Mehfill.in";
    document.title = title;

    // Couple & Names everywhere
    setTextAll("[data-bind='couple.displayName']", cfg.couple.displayName || (cfg.couple.brideName + " & " + cfg.couple.groomName));
    setTextAll("[data-bind='couple.brideName']", cfg.couple.brideName);
    setTextAll("[data-bind='couple.groomName']", cfg.couple.groomName);
    setTextAll("[data-bind='couple.initials']", cfg.couple.initials);
    setTextAll("[data-bind='couple.introduction']", cfg.couple.introduction);
    setTextAll("[data-bind='couple.invitationHeading']", cfg.couple.invitationHeading);
    setTextAll("[data-bind='couple.welcomeMessage']", cfg.couple.welcomeMessage);
    setTextAll("[data-bind='couple.familyInvitation']", cfg.couple.familyInvitation);
    setTextAll("[data-bind='couple.closingMessage']", cfg.couple.closingMessage);
    setTextAll("[data-bind='couple.footerMessage']", cfg.couple.footerMessage);

    // Bride & Groom specifics
    setTextAll("[data-bind='couple.brideParents']", cfg.couple.brideParents);
    setTextAll("[data-bind='couple.groomParents']", cfg.couple.groomParents);
    setTextAll("[data-bind='couple.brideBio']", cfg.couple.brideBio);
    setTextAll("[data-bind='couple.groomBio']", cfg.couple.groomBio);

    setImageAll("[data-bind-img='media.bridePhoto']", cfg.media.bridePhoto, cfg.couple.brideName);
    setImageAll("[data-bind-img='media.groomPhoto']", cfg.media.groomPhoto, cfg.couple.groomName);
    setImageAll("[data-bind-img='media.couplePortrait']", cfg.media.couplePortrait, cfg.couple.displayName);

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
    setTextAll("[data-bind='event.title']", cfg.event.title);
    setTextAll("[data-bind='event.dateFormatted']", fmtDateLong(cfg.event.date));
    setTextAll("[data-bind='event.timeFormatted']", fmtTime12(cfg.event.time) + (cfg.event.endTime ? " – " + fmtTime12(cfg.event.endTime) : " onwards"));
    setTextAll("[data-bind='event.venueName']", cfg.event.venueName);
    setTextAll("[data-bind='event.address']", cfg.event.address);
    setTextAll("[data-bind='event.dressCode']", cfg.event.dressCode);
    setTextAll("[data-bind='event.notes']", cfg.event.notes);
    setImageAll("[data-bind-img='media.venuePhoto']", cfg.media.venuePhoto, cfg.event.venueName);

    var mapsLink = document.querySelector("[data-bind-href='event.mapsUrl']");
    if (mapsLink) {
      mapsLink.href = cfg.event.mapsUrl || ("https://maps.google.com/?q=" + encodeURIComponent(cfg.event.venueName + " " + cfg.event.address));
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

  function setImageAll(selector, src, alt) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) {
      if (src) {
        nodes[i].src = src;
        nodes[i].style.display = "";
      } else {
        nodes[i].style.display = "none";
      }
      if (alt) nodes[i].alt = alt;
    }
  }

  function renderMilestones(milestones) {
    var host = document.getElementById("story-timeline");
    if (!host) return;
    host.innerHTML = "";

    (milestones || []).forEach(function (m, idx) {
      var item = document.createElement("div");
      item.className = "story-item " + (idx % 2 === 0 ? "story-left" : "story-right") + " reveal";

      var content = document.createElement("div");
      content.className = "story-card";

      // Subtle floral corner ornament on story card
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

      var dateTag = document.createElement("span");
      dateTag.className = "story-date";
      dateTag.textContent = m.year || "";
      content.appendChild(dateTag);

      var title = document.createElement("h3");
      title.className = "story-title";
      title.textContent = m.title || "";
      content.appendChild(title);

      var desc = document.createElement("p");
      desc.className = "story-desc";
      desc.textContent = m.description || "";
      content.appendChild(desc);

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
    if (!host) return;
    host.innerHTML = "";

    (events || []).forEach(function (ev) {
      var card = document.createElement("article");
      card.className = "event-card reveal";

      var bannerHtml = "";
      if (ev.image) {
        bannerHtml = "<div class='event-banner'><img src='" + ev.image + "' alt='" + (ev.title || "Wedding Function") + "' loading='lazy' /><img src='assets/images/floral-corner-tr.png' alt='' class='event-card-corner' aria-hidden='true' /></div>";
      }

      var mapsBtnHtml = "";
      if (ev.venue) {
        var query = encodeURIComponent(ev.venue + " " + (ev.date || ""));
        mapsBtnHtml = "<a href='https://maps.google.com/?q=" + query + "' target='_blank' rel='noopener' class='event-link'><span>Map Location</span><svg viewBox='0 0 24 24' width='14' height='14'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z' fill='currentColor'/></svg></a>";
      }

      card.innerHTML = bannerHtml +
        "<div class='event-body'>" +
          "<div class='event-meta'>" +
            "<span class='event-date-chip'>" + (ev.date || "") + "</span>" +
            "<span class='event-time-chip'>" + (ev.time || "") + "</span>" +
          "</div>" +
          "<h3 class='event-title'>" + (ev.title || "") + "</h3>" +
          "<p class='event-desc'>" + (ev.description || "") + "</p>" +
          "<div class='event-venue-box'>" +
            "<svg viewBox='0 0 24 24' width='16' height='16' class='event-icon'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z' fill='currentColor'/></svg>" +
            "<span class='event-venue-name'>" + (ev.venue || "") + "</span>" +
          "</div>" +
          mapsBtnHtml +
        "</div>";

      host.appendChild(card);
    });
  }

  function renderGallery(gallery) {
    var host = document.getElementById("gallery-grid");
    if (!host) return;
    host.innerHTML = "";

    (gallery || []).forEach(function (item, idx) {
      var fig = document.createElement("figure");
      fig.className = "gallery-item reveal";
      fig.setAttribute("data-gallery-index", idx);
      fig.tabIndex = 0;
      fig.setAttribute("role", "button");
      fig.setAttribute("aria-label", "View photo: " + (item.caption || item.alt || "Wedding Photo"));

      var img = document.createElement("img");
      img.src = item.src;
      img.alt = item.alt || item.caption || "Royal Wedding Photo";
      img.loading = "lazy";
      fig.appendChild(img);

      var caption = document.createElement("figcaption");
      caption.className = "gallery-cap";
      caption.innerHTML = "<span class='gallery-cap-title'>" + (item.caption || "") + "</span><span class='gallery-zoom-icon'>✢</span>";
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
