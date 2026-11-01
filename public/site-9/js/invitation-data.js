/*
 * Mehfill.in — Site 9: Royal Floral Wedding Invitation
 * Central Data Model & Storage Engine
 * Pink Floral + Emerald Green + Cream + Golden Royal Theme
 */
(function (global) {
  "use strict";

  var TEMPLATE_ID = "royal-floral-garden";
  var STORAGE_KEY = "mehfill:" + TEMPLATE_ID + ":draft:v3";
  var RSVP_KEY = "mehfill:" + TEMPLATE_ID + ":rsvps";
  var CONFIG_VERSION = 3;

  var DEFAULT_INVITATION = {
    templateId: TEMPLATE_ID,
    templateName: "Royal Floral Garden",
    version: CONFIG_VERSION,

    couple: {
      groomName: "Kabir Singhania",
      brideName: "Ananya Roy",
      displayName: "Ananya & Kabir",
      initials: "A · K",
      groomParents: "Mr. Vikram & Mrs. Sunita Singhania",
      brideParents: "Mr. Rajesh & Mrs. Madhuri Roy",
      groomBio: "An architect drawn to ancient heritage, starry nights and life's quiet poetry.",
      brideBio: "A classical dancer and botanical artist who finds music in every blooming rose.",
      introduction: "Together with their families",
      invitationHeading: "You're Invited",
      welcomeMessage: "We invite you to celebrate the beginning of our forever amidst royal heritage and blooming roses.",
      familyInvitation: "With overflowing joy and gratitude, the Singhania and Roy families invite you to share our happiest celebration as our beloved children unite in holy matrimony.",
      closingMessage: "Your presence, warm smiles and sacred blessings will be the greatest ornament on our special day.",
      footerMessage: "Designed with royal devotion for our beloved guests"
    },

    hero: {
      eyebrow: "Royal Vivah Celebration",
      subtitle: "Invite You To Celebrate Their Wedding",
      tagline: "Step into our royal celebration of love",
      badgeText: "Shubh Vivah",
      mandapImage: "assets/images/jaipur-mandap.jpg",
      mandapLandscape: "assets/images/jaipur-mandap-landscape.jpg",
      floralArch: "assets/images/floral-arch.jpg",
      lanternImage: "assets/images/golden-lantern.jpg",
      bgImage: ""
    },

    video: {
      enabled: true,
      src: "lv_0_20261018234041.mp4",
      poster: "assets/images/video-poster.jpg",
      introHeading: "A Royal Celebration of Love",
      introSubheading: "YOU'RE INVITED",
      openButtonLabel: "Play Invitation",
      skipLabel: "Skip Intro",
      replayLabel: "Replay Video"
    },

    event: {
      title: "The Royal Wedding Celebration",
      date: "2026-12-18",
      time: "17:30",
      endTime: "23:30",
      timeZone: "Asia/Kolkata",
      venueName: "The Grand Heritage Palace & Royal Gardens",
      address: "Palace Road, Civil Lines, Jaipur, Rajasthan 302006, India",
      mapsUrl: "https://maps.google.com/?q=The+Grand+Heritage+Palace+Jaipur",
      dressCode: "Royal Indian Festive · Emerald Green, Blush Pink & Antique Gold",
      notes: "Royal Shehnai welcome, valet parking and a lavish gala banquet at the Maharaja Courtyard.",
      events: [
        {
          id: "e1",
          title: "Shubh Haldi",
          date: "16 December 2026",
          time: "10:30 AM",
          venue: "Courtyard of Sunflowers",
          description: "A sunlit celebration of fresh turmeric paste, golden marigolds, dhol beats and joyous blessings.",
          image: "assets/images/event-haldi.jpg"
        },
        {
          id: "e2",
          title: "Mehendi Ki Raat",
          date: "16 December 2026",
          time: "05:00 PM",
          venue: "The Bougainvillea Terrace",
          description: "Intricate bridal henna artistry, soulful folk melodies, fragrant rose tea and sweets under fairy lights.",
          image: "assets/images/event-mehendi.jpg"
        },
        {
          id: "e3",
          title: "Sangeet & Musical Gala",
          date: "17 December 2026",
          time: "07:30 PM",
          venue: "The Crystal Chandelier Ballroom",
          description: "An evening of dazzling choreographies, family songs, live royal sitar raga and exuberant dancing.",
          image: "assets/images/event-sangeet.jpg"
        },
        {
          id: "e4",
          title: "Royal Vivah Ceremony",
          date: "18 December 2026",
          time: "05:30 PM",
          venue: "The Emerald Mandap Pavilion",
          description: "The sacred saat pheras around the holy fire, varmala amidst cascading rose petals and Vedic mantras.",
          image: "assets/images/venue.jpg"
        },
        {
          id: "e5",
          title: "Grand Wedding Reception",
          date: "18 December 2026",
          time: "08:30 PM",
          venue: "The Palace Grand Courtyard",
          description: "Gourmet multi-course Rajasthani & Mughlai feast, royal toast and celebratory music under glowing lanterns.",
          image: "assets/images/venue.jpg"
        }
      ]
    },

    story: {
      heading: "Our Royal Love Story",
      description: "Two souls brought together by destiny, walking hand in hand through gardens of love and whispered promises.",
      milestones: [
        {
          id: "m1",
          year: "October 2021",
          title: "The First Meeting",
          description: "A chance encounter at a Jaipur heritage art pavilion over a painting of pink bougainvilleas.",
          image: "assets/images/gallery-heritage.jpg"
        },
        {
          id: "m2",
          year: "March 2022",
          title: "The Endless Conversation",
          description: "What began as evening tea turned into five hours of effortless laughter, shared values and unspoken warmth.",
          image: "assets/images/couple-portrait.jpg"
        },
        {
          id: "m3",
          year: "December 2023",
          title: "The Proposal Under The Stars",
          description: "On a quiet palace terrace beneath a canopy of stars and flickering lanterns, Kabir asked the forever question.",
          image: "assets/images/venue.jpg"
        },
        {
          id: "m4",
          year: "April 2024",
          title: "The Roka Ceremony",
          description: "Our families united with auspicious sweets, ancestral blessings and vows of eternal companionship.",
          image: "assets/images/event-mehendi.jpg"
        },
        {
          id: "m5",
          year: "December 2026",
          title: "The Wedding Day",
          description: "Stepping through the grand emerald doors hand in hand into a lifetime of cherished devotion.",
          image: "assets/images/couple-portrait.jpg"
        }
      ]
    },

    media: {
      bridePhoto: "assets/images/bride.jpg",
      groomPhoto: "assets/images/groom.jpg",
      couplePortrait: "assets/images/couple-portrait.jpg",
      venuePhoto: "assets/images/venue.jpg",
      gallery: [
        { id: "g1", src: "assets/images/couple-portrait.jpg", caption: "Balcony of Eternal Love", alt: "Ananya & Kabir under bougainvillea arch" },
        { id: "g2", src: "assets/images/gallery-heritage.jpg", caption: "Walking in Royal Splendour", alt: "Pre-wedding heritage walk" },
        { id: "g3", src: "assets/images/bride.jpg", caption: "The Radiant Bride", alt: "Ananya in blush pink lehenga" },
        { id: "g4", src: "assets/images/groom.jpg", caption: "The Regal Groom", alt: "Kabir in emerald sherwani" },
        { id: "g5", src: "assets/images/venue.jpg", caption: "The Grand Royal Courtyard", alt: "Banquet illuminated with lanterns" },
        { id: "g6", src: "assets/images/event-sangeet.jpg", caption: "Sangeet Celebration Night", alt: "Dance performances and music" },
        { id: "g7", src: "assets/images/event-haldi.jpg", caption: "Golden Sunflowers & Haldi", alt: "Haldi ceremony urli" },
        { id: "g8", src: "assets/images/event-mehendi.jpg", caption: "Intricate Mehendi Artistry", alt: "Bridal henna hands" }
      ]
    },

    countdown: {
      show: true,
      heading: "Counting Down To Our Wedding",
      subheading: "Every heartbeat brings us closer to our sacred vows",
      daysLabel: "Days",
      hoursLabel: "Hours",
      minutesLabel: "Minutes",
      secondsLabel: "Seconds",
      passedMessage: "The celebrations have commenced! Thank you for showering your heartfelt love and blessings upon us."
    },

    rsvp: {
      enabled: true,
      heading: "Will You Join Us?",
      subheading: "Kindly confirm your presence.",
      contactPhone: "+91 98765 43210",
      whatsappPhone: "+91 98765 43210",
      askPhone: true,
      askGuests: true,
      maxGuests: 6,
      choices: ["Joyfully Accept", "Regretfully Decline"],
      defaultChoice: "Joyfully Accept",
      successTitle: "RSVP Confirmed with Joy!",
      successMessage: "Thank you for confirming your presence. We look forward to celebrating with you in Jaipur!",
      submitLabel: "Submit RSVP"
    },

    scratchCard: {
      enabled: true,
      title: "A Special Keepsake For You",
      subtitle: "Scratch to reveal our special wedding date!",
      scratchHint: "Scratch to Reveal ✨",
      hiddenHeading: "18 DECEMBER 2026",
      hiddenSub: "Save The Date",
      hiddenMessage: "Join us as we unite under Jaipur's royal skies. Your presence and blessings are our greatest treasure.",
      goldColor: "#C49A48"
    },

    music: {
      enabled: true,
      src: "assets/audio/music.mp3",
      playLabel: "Play Royal Shehnai",
      pauseLabel: "Pause Music",
      songTitle: "Royal Shehnai & Sitar Harmony"
    },

    theme: {
      emerald: "#075E50",
      deepGreen: "#064A40",
      floralPink: "#E85C83",
      blushPink: "#F7DDE5",
      ivory: "#FFF7E9",
      antiqueGold: "#C49A48",
      softWhite: "#FFFCF7",
      headingFont: "Cormorant Garamond",
      namesFont: "Playfair Display",
      bodyFont: "Montserrat",
      fallingPetals: true,
      petalDensity: 24,
      lanternGlow: true,
      animationsEnabled: true,
      doorEntrance: true
    },

    sections: {
      visible: {
        videoIntro: true,
        hero: true,
        couple: true,
        story: true,
        events: true,
        countdown: true,
        scratchCard: true,
        gallery: true,
        venue: true,
        rsvp: true,
        closing: true,
        footer: true
      },
      order: [
        "hero",
        "couple",
        "story",
        "events",
        "countdown",
        "scratchCard",
        "gallery",
        "venue",
        "rsvp",
        "closing",
        "footer"
      ]
    },

    branding: {
      brandName: "Mehfill.in",
      brandUrl: "https://mehfill.in/",
      tagline: "Luxury Digital Wedding Invitations"
    }
  };

  /* ---------- Deep Utility Functions ---------- */

  function clone(obj) {
    if (obj === null || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) {
      return obj.map(function (item) { return clone(item); });
    }
    var copy = {};
    Object.keys(obj).forEach(function (k) {
      copy[k] = clone(obj[k]);
    });
    return copy;
  }

  function deepMerge(target, source) {
    if (!source || typeof source !== "object") return target;
    Object.keys(source).forEach(function (k) {
      if (source[k] && typeof source[k] === "object" && !Array.isArray(source[k])) {
        if (!target[k] || typeof target[k] !== "object") target[k] = {};
        deepMerge(target[k], source[k]);
      } else {
        target[k] = source[k];
      }
    });
    return target;
  }

  function getPath(obj, pathStr) {
    if (!obj || !pathStr) return undefined;
    var parts = pathStr.split(".");
    var curr = obj;
    for (var i = 0; i < parts.length; i++) {
      if (curr == null) return undefined;
      curr = curr[parts[i]];
    }
    return curr;
  }

  function setPath(obj, pathStr, value) {
    if (!obj || !pathStr) return false;
    var parts = pathStr.split(".");
    var curr = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      var k = parts[i];
      if (curr[k] == null || typeof curr[k] !== "object") {
        curr[k] = {};
      }
      curr = curr[k];
    }
    curr[parts[parts.length - 1]] = value;
    return true;
  }

  function safeText(str, max) {
    if (str == null) return "";
    var s = String(str).trim();
    if (max && s.length > max) s = s.slice(0, max);
    return s;
  }

  function newId(prefix) {
    return (prefix || "id") + "_" + Math.random().toString(36).substring(2, 9);
  }

  /* ---------- LocalStorage Draft & RSVP Storage ---------- */

  function loadDraft() {
    try {
      var raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return deepMerge(clone(DEFAULT_INVITATION), parsed);
    } catch (e) {
      console.warn("MehfillData: failed to read draft from localStorage", e);
      return null;
    }
  }

  function saveDraft(config) {
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      return { ok: true };
    } catch (e) {
      console.warn("MehfillData: failed to save draft to localStorage", e);
      return { ok: false, error: e };
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

  function loadRsvps() {
    try {
      var raw = global.localStorage.getItem(RSVP_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveRsvp(entry) {
    try {
      var list = loadRsvps();
      entry.id = newId("rsvp");
      entry.timestamp = new Date().toISOString();
      list.unshift(entry);
      global.localStorage.setItem(RSVP_KEY, JSON.stringify(list));
      return { ok: true, entry: entry };
    } catch (e) {
      return { ok: false, error: e };
    }
  }

  function clearRsvps() {
    try {
      global.localStorage.removeItem(RSVP_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }

  function exportRsvpsCSV() {
    var list = loadRsvps();
    if (!list.length) return "";
    var headers = ["Timestamp", "Name", "Attendance", "Guests", "Phone", "Email", "Events", "Message"];
    var rows = list.map(function (r) {
      return [
        r.timestamp || "",
        (r.name || "").replace(/"/g, '""'),
        (r.attendance || "").replace(/"/g, '""'),
        r.guests || 1,
        (r.phone || "").replace(/"/g, '""'),
        (r.email || "").replace(/"/g, '""'),
        (Array.isArray(r.events) ? r.events.join(", ") : r.events || "").replace(/"/g, '""'),
        (r.message || "").replace(/"/g, '""')
      ].map(function (v) { return '"' + v + '"'; }).join(",");
    });
    return [headers.join(",")].concat(rows).join("\r\n");
  }

  function exportJSON(config) {
    return JSON.stringify(config || DEFAULT_INVITATION, null, 2);
  }

  function parseImport(jsonStr) {
    try {
      var parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== "object") {
        return { ok: false, error: "Invalid JSON configuration." };
      }
      var merged = deepMerge(clone(DEFAULT_INVITATION), parsed);
      return { ok: true, config: merged };
    } catch (err) {
      return { ok: false, error: "Syntax error in uploaded JSON file." };
    }
  }

  /* ---------- Export Global API ---------- */

  global.MehfillData = {
    TEMPLATE_ID: TEMPLATE_ID,
    DEFAULT_INVITATION: DEFAULT_INVITATION,
    clone: clone,
    deepMerge: deepMerge,
    getPath: getPath,
    setPath: setPath,
    safeText: safeText,
    newId: newId,
    loadDraft: loadDraft,
    saveDraft: saveDraft,
    clearDraft: clearDraft,
    loadRsvps: loadRsvps,
    saveRsvp: saveRsvp,
    clearRsvps: clearRsvps,
    exportRsvpsCSV: exportRsvpsCSV,
    exportJSON: exportJSON,
    parseImport: parseImport
  };

})(typeof window !== "undefined" ? window : this);
