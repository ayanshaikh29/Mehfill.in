/*
 * Mehfill.in — Luxury Ivory Reception template
 * Central invitation data model. Single source of truth for every
 * customer-editable value on the invitation.
 */
(function (global) {
  "use strict";

  var TEMPLATE_ID = "luxury-ivory-reception";
  var STORAGE_KEY = "mehfill:" + TEMPLATE_ID + ":draft";
  var CONFIG_VERSION = 1;

  var DEFAULT_INVITATION = {
    templateId: TEMPLATE_ID,
    templateName: "Luxury Ivory Reception",
    version: CONFIG_VERSION,

    couple: {
      groomName: "Aarav Mehta",
      brideName: "Kiara Sharma",
      displayName: "Aarav & Kiara",
      initials: "A · K",
      introduction: "Together with our families",
      invitationHeading: "You're Invited",
      welcomeMessage: "We invite you to celebrate our forever.",
      customDescription:
        "Two hearts, one beautiful evening. Join us as we begin our forever surrounded by the people we love most.",
      familyInvitation:
        "Mr. & Mrs. Mehta and Mr. & Mrs. Sharma request the pleasure of your company at the wedding reception of their children.",
      closingMessage:
        "Your presence is the greatest gift of all. Come, bless our beginning and celebrate with us.",
      footerMessage: "Designed with love for our guests"
    },

    event: {
      title: "Wedding Reception",
      date: "2026-11-15",
      time: "19:00",
      endTime: "",
      timeZone: "Asia/Kolkata",
      venueName: "The Grand Orchid Palace",
      address: "Trimbak Road, Nashik, Maharashtra 422002, India",
      mapsUrl: "",
      dressCode: "Elegant Indian Festive / Formal",
      notes: "Dinner, dancing and celebrations to follow. Valet parking available at the venue.",
      calendarDescription:
        "Aarav & Kiara request the pleasure of your company at their Wedding Reception.",
      events: [
        {
          id: "e1",
          title: "Cocktail Hour",
          date: "15 November 2026",
          time: "7:00 PM",
          venue: "The Grand Orchid Palace",
          description: "Welcome drinks & music"
        },
        {
          id: "e2",
          title: "Reception Ceremony",
          date: "15 November 2026",
          time: "8:00 PM",
          venue: "The Grand Orchid Palace",
          description: "Blessings, cake & photographs"
        },
        {
          id: "e3",
          title: "Dinner & Dancing",
          date: "15 November 2026",
          time: "9:00 PM",
          venue: "The Grand Orchid Palace",
          description: "An evening of celebration"
        }
      ]
    },

    story: {
      heading: "Our Story",
      description:
        "A journey of laughter, long walks and quiet promises — written one beautiful day at a time.",
      milestones: [
        {
          id: "m1",
          year: "2019",
          title: "The First Hello",
          description: "A warm introduction on a rainy evening turned into hours of effortless conversation."
        },
        {
          id: "m2",
          year: "2022",
          title: "Endless Adventures",
          description: "From midnight drives to sunrise chai, every ordinary day became an adventure together."
        },
        {
          id: "m3",
          year: "2025",
          title: "The Proposal",
          description: "Under a canopy of stars, a little question became our forever answer."
        }
      ]
    },

    media: {
      hero: "assets/images/hero-couple.jpg",
      heroPosition: "center 42%",
      couplePortrait: "assets/images/couple-portrait.jpg",
      portraitPosition: "center 30%",
      portraitFit: "cover",
      stage: "assets/images/reception-stage.jpg",
      decoration: "assets/images/reception-decor.jpg",
      details: "assets/images/wedding-details.jpg",
      customBackground: "",
      envelopeArt: "",
      gallery: [
        { id: "g1", src: "assets/images/gallery-1.jpg", caption: "Royal Sunset Heritage", alt: "Aarav & Kiara pre-wedding royal sunset", position: "center" },
        { id: "g2", src: "assets/images/gallery-2.jpg", caption: "Courtyard of Lights", alt: "Walking together in twilight palace courtyard", position: "center" },
        { id: "g3", src: "assets/images/gallery-3.jpg", caption: "Pure Joy & Laughter", alt: "Intimate candid joy and laughter", position: "center" },
        { id: "g4", src: "assets/images/gallery-4.jpg", caption: "Evening by the Lake", alt: "Lake palace candlelit evening", position: "center" },
        { id: "g5", src: "assets/images/gallery-5.jpg", caption: "Promises in Red & Gold", alt: "Regal vows under the pavilion", position: "center" },
        { id: "g6", src: "assets/images/gallery-6.jpg", caption: "Forever & Always", alt: "Fort golden hour rooftop bliss", position: "center" }
      ]
    },

    text: {
      heroEyebrow: "Wedding Reception",
      galleryHeading: "Moments of Celebration",
      eventHeading: "Reception Details",
      locationHeading: "Find Your Way",
      venueLabel: "Venue",
      addressLabel: "Address",
      dressCodeLabel: "Dress Code",
      timeLabel: "Time",
      dateLabel: "Date",
      calendarButton: "Add to Calendar",
      directionsButton: "Get Directions",
      countdownHeading: "Counting Down To Our Celebration",
      mapHeading: "Venue on the Map"
    },

    quote: {
      text: "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.",
      attribution: "Maya Angelou"
    },

    countdown: {
      show: true,
      label: "The evening begins in",
      daysLabel: "Days",
      hoursLabel: "Hours",
      minutesLabel: "Minutes",
      secondsLabel: "Seconds",
      passedMessage: "What a beautiful evening it has been. Thank you for celebrating with us."
    },

    rsvp: {
      heading: "Will You Join Us?",
      description:
        "Kindly confirm your presence so we may welcome you personally. Tap below and your response will open in WhatsApp.",
      contactPhone: "+91 90000 12345",
      whatsappPhone: "+91 90000 12345",
      confirmationMessage: "Thank you! Your response is ready in WhatsApp — just press send.",
      successTitle: "Almost done!",
      successText: "WhatsApp has opened with your response. Press send to confirm — we can't wait to celebrate with you.",
      choices: ["Joyfully accepts", "Regretfully declines"],
      defaultChoice: "Joyfully accepts",
      maxGuests: 10,
      askPhone: true,
      askMessage: true,
      nameLabel: "Your name",
      guestsLabel: "Number of guests",
      phoneLabel: "Phone (optional)",
      messageLabel: "A message for us (optional)",
      submitLabel: "Send via WhatsApp",
      buttonLabel: "RSVP"
    },

    music: {
      src: "assets/audio/music.mp3",
      enabled: true,
      openLabel: "Play music",
      closeLabel: "Pause music"
    },

    envelope: {
      show: true,
      sealText: "A · K",
      hint: "Tap anywhere to open",
      openLabel: "Open the invitation"
    },

    video: {
      enabled: true,
      src: "lv_0_20261023155820.mp4",
      poster: "assets/images/hero-couple.jpg",
      skipLabel: "Skip intro",
      autoMusic: true
    },

    theme: {
      background: "#F8F3EA",
      pearl: "#FFFCF7",
      accent: "#C6A46A",
      accentDeep: "#A68148",
      blush: "#EAD5CC",
      text: "#30251F",
      muted: "#8A7968",
      scriptFont: "Allura",
      headingFont: "Cormorant Garamond",
      bodyFont: "Montserrat",
      floralIntensity: 100,
      borderIntensity: 100,
      texture: true,
      corners: true
    },

    sections: {
      visible: {
        envelope: true,
        hero: true,
        portrait: true,
        story: true,
        eventDetails: true,
        countdown: true,
        gallery: true,
        quote: true,
        location: true,
        rsvp: true,
        closing: true,
        footer: true
      },
      order: [
        "hero",
        "portrait",
        "story",
        "eventDetails",
        "countdown",
        "gallery",
        "quote",
        "location",
        "rsvp",
        "closing",
        "footer"
      ]
    },

    branding: {
      credit: "Designed & published with",
      brandName: "Mehfill.in",
      brandUrl: "https://mehfill.in/"
    }
  };

  var LIMITS = {
    "couple.groomName": 80,
    "couple.brideName": 80,
    "couple.displayName": 120,
    "couple.initials": 12,
    "couple.introduction": 120,
    "couple.invitationHeading": 60,
    "couple.welcomeMessage": 200,
    "couple.customDescription": 400,
    "couple.familyInvitation": 400,
    "couple.closingMessage": 400,
    "couple.footerMessage": 160,
    "event.title": 80,
    "event.venueName": 120,
    "event.address": 240,
    "event.dressCode": 120,
    "event.notes": 400,
    "event.calendarDescription": 400,
    "story.heading": 80,
    "story.description": 400,
    "text.galleryHeading": 80,
    "text.eventHeading": 80,
    "text.locationHeading": 80,
    "text.heroEyebrow": 80,
    "countdown.label": 120,
    "countdown.passedMessage": 300,
    "quote.text": 400,
    "quote.attribution": 80,
    "rsvp.heading": 80,
    "rsvp.description": 400,
    "rsvp.confirmationMessage": 300,
    "rsvp.successTitle": 80,
    "rsvp.successText": 300,
    "branding.credit": 80,
    "branding.brandName": 40
  };

  var MAX_GALLERY = 12;
  var MAX_MILESTONES = 8;
  var MAX_CHOICES = 6;

  function isObject(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v);
  }

  function clone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function getPath(obj, path) {
    var parts = String(path).split(".");
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function setPath(obj, path, value) {
    var parts = String(path).split(".");
    var cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      if (!isObject(cur[parts[i]])) cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
  }

  function deepMerge(base, patch) {
    var out = clone(base);
    if (!isObject(patch)) return out;
    (function walk(target, src) {
      Object.keys(src).forEach(function (key) {
        var sv = src[key];
        if (isObject(sv) && isObject(target[key])) {
          walk(target[key], sv);
        } else if (Array.isArray(sv)) {
          target[key] = clone(sv);
        } else if (sv !== undefined) {
          target[key] = sv;
        }
      });
    })(out, patch);
    return out;
  }

  /* Strip angle brackets so no customer text can smuggle markup; the
     renderer also uses textContent, this is defence in depth. */
  function safeText(v, max) {
    if (v == null) return "";
    var s = String(v)
      .replace(/[<>]/g, "")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
      .trim();
    if (max && s.length > max) s = s.slice(0, max);
    return s;
  }

  function safeColor(v, fallback) {
    var s = String(v || "").trim();
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s)) return s;
    if (/^#([0-9a-fA-F]{8})$/.test(s)) return "#" + s.slice(1, 7);
    return fallback;
  }

  function safeUrl(v) {
    var s = String(v || "").trim();
    if (!s) return "";
    if (/^https?:\/\/[^\s<>"']+$/i.test(s)) return s;
    return "";
  }

  function safePhone(v) {
    var digits = String(v || "").replace(/[^\d]/g, "");
    if (digits.length < 8 || digits.length > 15) return "";
    var s = String(v || "").replace(/[<>"']/g, "").trim();
    return s;
  }

  function safeDate(v, fallback) {
    var s = String(v || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return fallback;
    var d = new Date(s + "T00:00:00");
    if (Number.isNaN(d.getTime())) return fallback;
    if (d.getFullYear() < 1990 || d.getFullYear() > 2100) return fallback;
    return s;
  }

  function safeTime(v, fallback) {
    var s = String(v || "").trim();
    if (/^([01]\d|2[0-3]):[0-5]\d$/.test(s)) return s;
    return fallback;
  }

  function clampNumber(v, min, max, fallback) {
    var n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, Math.round(n)));
  }

  function isHexColor(v) {
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(String(v || "").trim());
  }

  function looksLikeHtml(v) {
    return /<[a-z!/][^>]*>/i.test(String(v || ""));
  }

  function newId(prefix) {
    return (prefix || "id") + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  /**
   * Validate + normalise an arbitrary object into a complete, safe config.
   * Returns { config, errors }. Never throws.
   */
  function validate(input) {
    var errors = [];
    var src = isObject(input) ? input : {};
    var cfg = deepMerge(DEFAULT_INVITATION, {});

    Object.keys(LIMITS).forEach(function (path) {
      if (getPath(src, path) !== undefined) {
        var raw = getPath(src, path);
        if (looksLikeHtml(raw)) errors.push(path + " must be plain text");
        setPath(cfg, path, safeText(raw, LIMITS[path]));
        if (raw != null && String(raw).trim() && !getPath(cfg, path)) {
          errors.push(path + " was empty after sanitising");
        }
      }
    });

    if (isObject(src.couple)) {
      if (src.couple.initials !== undefined) {
        cfg.couple.initials = safeText(src.couple.initials, 12);
      }
    }

    if (isObject(src.event)) {
      if (src.event.date !== undefined) cfg.event.date = safeDate(src.event.date, cfg.event.date);
      if (src.event.time !== undefined) cfg.event.time = safeTime(src.event.time, cfg.event.time);
      if (src.event.endTime !== undefined) {
        cfg.event.endTime = safeTime(src.event.endTime, "");
      }
      if (src.event.timeZone) cfg.event.timeZone = "Asia/Kolkata";
      if (src.event.mapsUrl !== undefined) {
        cfg.event.mapsUrl = safeUrl(src.event.mapsUrl);
        if (String(src.event.mapsUrl || "").trim() && !cfg.event.mapsUrl) {
          errors.push("event.mapsUrl must be a valid http(s) link");
        }
      }
      if (src.event.events !== undefined) {
        var evs = Array.isArray(src.event.events) ? src.event.events.slice(0, 10) : [];
        cfg.event.events = evs
          .filter(function (ev) { return isObject(ev) && safeText(ev.title, 80); })
          .map(function (ev) {
            return {
              id: safeText(ev.id, 40) || newId("e"),
              title: safeText(ev.title, 80),
              date: safeText(ev.date, 40),
              time: safeText(ev.time, 40),
              venue: safeText(ev.venue, 120),
              description: safeText(ev.description, 200)
            };
          });
      }
    }

    if (isObject(src.quote)) {
      if (src.quote.text !== undefined) cfg.quote.text = safeText(src.quote.text, LIMITS["quote.text"]);
      if (src.quote.attribution !== undefined) {
        cfg.quote.attribution = safeText(src.quote.attribution, LIMITS["quote.attribution"]);
      }
    }

    if (isObject(src.countdown)) {
      if (src.countdown.show !== undefined) cfg.countdown.show = !!src.countdown.show;
      ["daysLabel", "hoursLabel", "minutesLabel", "secondsLabel"].forEach(function (k) {
        if (src.countdown[k] !== undefined) cfg.countdown[k] = safeText(src.countdown[k], 24);
      });
    }

    if (isObject(src.story)) {
      var ms = Array.isArray(src.story.milestones) ? src.story.milestones.slice(0, MAX_MILESTONES) : null;
      if (ms) {
        cfg.story.milestones = ms
          .filter(function (m) { return isObject(m); })
          .map(function (m) {
            return {
              id: safeText(m.id, 40) || newId("m"),
              year: safeText(m.year, 12),
              title: safeText(m.title, 80),
              description: safeText(m.description, 300)
            };
          });
      }
    }

    if (isObject(src.rsvp)) {
      ["whatsappPhone", "contactPhone"].forEach(function (k) {
        if (src.rsvp[k] !== undefined) {
          var p = safePhone(src.rsvp[k]);
          cfg.rsvp[k] = p || cfg.rsvp[k];
          if (String(src.rsvp[k] || "").trim() && !p) errors.push("rsvp." + k + " must be a valid phone number");
        }
      });
      if (src.rsvp.choices !== undefined) {
        var choices = (Array.isArray(src.rsvp.choices) ? src.rsvp.choices : [])
          .slice(0, MAX_CHOICES)
          .map(function (c) { return safeText(c, 60); })
          .filter(Boolean);
        if (choices.length) cfg.rsvp.choices = choices;
      }
      if (src.rsvp.maxGuests !== undefined) {
        cfg.rsvp.maxGuests = clampNumber(src.rsvp.maxGuests, 1, 100, cfg.rsvp.maxGuests);
      }
      ["askPhone", "askMessage"].forEach(function (k) {
        if (src.rsvp[k] !== undefined) cfg.rsvp[k] = !!src.rsvp[k];
      });
    }

    if (isObject(src.media)) {
      ["hero", "couplePortrait", "stage", "decoration", "details", "customBackground", "envelopeArt"].forEach(function (k) {
        if (src.media[k] !== undefined) {
          var v = String(src.media[k] || "").trim();
          cfg.media[k] = /^data:image\//i.test(v) || /^blob:/.test(v) || /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i.test(v) || /^https?:\/\//i.test(v)
            ? v.slice(0, 4000)
            : "";
        }
      });
      ["heroPosition", "portraitPosition"].forEach(function (k) {
        if (src.media[k] !== undefined) cfg.media[k] = safeText(src.media[k], 60);
      });
      if (src.media.portraitFit !== undefined) {
        cfg.media.portraitFit = src.media.portraitFit === "contain" ? "contain" : "cover";
      }
      if (src.media.gallery !== undefined) {
        var gal = Array.isArray(src.media.gallery) ? src.media.gallery.slice(0, MAX_GALLERY) : [];
        cfg.media.gallery = gal
          .filter(function (g) { return isObject(g) && (g.src || ""); })
          .map(function (g) {
            var s = String(g.src || "");
            var ok = /^data:image\//i.test(s) || /^blob:/.test(s) || /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i.test(s) || /^https?:\/\//i.test(s);
            return {
              id: safeText(g.id, 40) || newId("g"),
              src: ok ? s.slice(0, 4000) : "",
              caption: safeText(g.caption, 120),
              alt: safeText(g.alt, 160),
              position: safeText(g.position, 60) || "center"
            };
          })
          .filter(function (g) { return g.src; });
      }
    }

    if (isObject(src.theme)) {
      var t = src.theme;
      var themeDefaults = DEFAULT_INVITATION.theme;
      ["background", "pearl", "accent", "accentDeep", "blush", "text", "muted"].forEach(function (k) {
        if (t[k] !== undefined) cfg.theme[k] = safeColor(t[k], themeDefaults[k]);
      });
      var scriptFonts = ["Allura", "Great Vibes", "Cormorant Garamond"];
      var headingFonts = ["Cormorant Garamond", "Playfair Display", "Marcellus"];
      var bodyFonts = ["Montserrat", "Lato"];
      if (t.scriptFont && scriptFonts.indexOf(t.scriptFont) !== -1) cfg.theme.scriptFont = t.scriptFont;
      if (t.headingFont && headingFonts.indexOf(t.headingFont) !== -1) cfg.theme.headingFont = t.headingFont;
      if (t.bodyFont && bodyFonts.indexOf(t.bodyFont) !== -1) cfg.theme.bodyFont = t.bodyFont;
      if (t.floralIntensity !== undefined) cfg.theme.floralIntensity = clampNumber(t.floralIntensity, 0, 100, 100);
      if (t.borderIntensity !== undefined) cfg.theme.borderIntensity = clampNumber(t.borderIntensity, 0, 100, 100);
      if (t.texture !== undefined) cfg.theme.texture = !!t.texture;
      if (t.corners !== undefined) cfg.theme.corners = !!t.corners;
    }

    if (isObject(src.sections)) {
      if (isObject(src.sections.visible)) {
        Object.keys(DEFAULT_INVITATION.sections.visible).forEach(function (k) {
          if (src.sections.visible[k] !== undefined) cfg.sections.visible[k] = !!src.sections.visible[k];
        });
      }
      if (Array.isArray(src.sections.order)) {
        var known = Object.keys(DEFAULT_INVITATION.sections.visible).filter(function (k) { return k !== "envelope"; });
        var ordered = src.sections.order.filter(function (k) { return known.indexOf(k) !== -1; });
        known.forEach(function (k) { if (ordered.indexOf(k) === -1) ordered.push(k); });
        cfg.sections.order = ordered;
      }
    }

    if (isObject(src.music)) {
      if (src.music.src !== undefined) {
        var m = String(src.music.src || "").trim();
        cfg.music.src = /^(https?:\/\/|blob:|data:audio\/)/i.test(m) || /\.(mp3|m4a|aac|ogg|wav)(\?|#|$)/i.test(m)
          ? m.slice(0, 4000)
          : cfg.music.src;
      }
      if (src.music.enabled !== undefined) cfg.music.enabled = !!src.music.enabled;
    }

    if (isObject(src.envelope)) {
      if (src.envelope.show !== undefined) cfg.envelope.show = !!src.envelope.show;
      if (src.envelope.sealText !== undefined) cfg.envelope.sealText = safeText(src.envelope.sealText, 12);
      if (src.envelope.hint !== undefined) cfg.envelope.hint = safeText(src.envelope.hint, 80);
    }

    if (isObject(src.video)) {
      if (src.video.enabled !== undefined) cfg.video.enabled = !!src.video.enabled;
      if (src.video.autoMusic !== undefined) cfg.video.autoMusic = !!src.video.autoMusic;
      if (src.video.src !== undefined) {
        var v = String(src.video.src || "").trim();
        cfg.video.src = /^(https?:\/\/|blob:)/i.test(v) || /\.(mp4|webm|mov)(\?|#|$)/i.test(v)
          ? v.slice(0, 2000)
          : cfg.video.src;
      }
      if (src.video.poster !== undefined) {
        var vp = String(src.video.poster || "").trim();
        cfg.video.poster = /^data:image\//i.test(vp) || /^blob:/.test(vp) || /\.(jpe?g|png|webp)(\?|#|$)/i.test(vp) || /^https?:\/\//i.test(vp)
          ? vp.slice(0, 2000)
          : cfg.video.poster;
      }
      if (src.video.skipLabel !== undefined) cfg.video.skipLabel = safeText(src.video.skipLabel, 40);
    }

    if (isObject(src.text)) {
      Object.keys(src.text).forEach(function (k) {
        if (typeof DEFAULT_INVITATION.text[k] === "string") {
          cfg.text[k] = safeText(src.text[k], 120);
        }
      });
    }

    return { config: cfg, errors: errors };
  }

  function loadDraft() {
    try {
      var raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!isObject(parsed) || parsed.templateId !== TEMPLATE_ID) return null;
      return validate(parsed).config;
    } catch (e) {
      return null;
    }
  }

  function saveDraft(config) {
    var result = validate(config);
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(result.config));
      return { ok: true, errors: result.errors };
    } catch (e) {
      return { ok: false, errors: ["Draft could not be saved to this browser"] };
    }
  }

  function clearDraft() {
    try {
      global.localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }

  function hasTempMedia(config) {
    try {
      var media = config.media || {};
      if (/^blob:/.test(media.hero || "") || /^blob:/.test(media.couplePortrait || "") ||
          /^blob:/.test(media.stage || "") || /^blob:/.test(media.decoration || "") ||
          /^blob:/.test(media.details || "") || /^blob:/.test(media.customBackground || "")) return true;
      return (media.gallery || []).some(function (g) { return /^blob:/.test(g.src || ""); });
    } catch (e) {
      return false;
    }
  }

  function serialize(config) {
    var result = validate(config);
    return JSON.stringify(result.config, null, 2);
  }

  function parseImport(json) {
    var parsed;
    try {
      parsed = JSON.parse(json);
    } catch (e) {
      return { ok: false, config: null, errors: ["File is not valid JSON"] };
    }
    if (!isObject(parsed)) return { ok: false, config: null, errors: ["File must contain a JSON object"] };
    if (parsed.templateId && parsed.templateId !== TEMPLATE_ID) {
      return { ok: false, config: null, errors: ["File belongs to a different template (" + parsed.templateId + ")"] };
    }
    var result = validate(parsed);
    if (!isObject(parsed.couple) && !isObject(parsed.event) && !isObject(parsed.theme)) {
      return { ok: false, config: null, errors: ["File does not look like an invitation configuration"] };
    }
    return { ok: true, config: result.config, errors: result.errors };
  }

  global.MehfillData = {
    TEMPLATE_ID: TEMPLATE_ID,
    STORAGE_KEY: STORAGE_KEY,
    DEFAULT_INVITATION: DEFAULT_INVITATION,
    LIMITS: LIMITS,
    MAX_GALLERY: MAX_GALLERY,
    MAX_MILESTONES: MAX_MILESTONES,
    clone: clone,
    getPath: getPath,
    setPath: setPath,
    deepMerge: deepMerge,
    validate: validate,
    loadDraft: loadDraft,
    saveDraft: saveDraft,
    clearDraft: clearDraft,
    hasTempMedia: hasTempMedia,
    serialize: serialize,
    parseImport: parseImport,
    newId: newId,
    safeText: safeText
  };
})(typeof window !== "undefined" ? window : this);
