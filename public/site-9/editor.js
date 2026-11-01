/*
 * Mehfill.in — Site 9 Customization Studio Engine
 * Drives the 3-part layout: Section Nav | Live Iframe Preview | Deep Inspector
 */
(function () {
  "use strict";

  var Data = window.MehfillData;
  if (!Data) return;

  var iframe = document.getElementById("preview-iframe");
  var inspectorContent = document.getElementById("inspector-content");
  var statusEl = document.getElementById("save-status");
  var fileInput = document.getElementById("ed-file-input");
  var deviceFrame = document.getElementById("device-frame");
  var toastEl = document.getElementById("ed-toast");
  var btnUndo = document.getElementById("btn-undo");
  var btnRedo = document.getElementById("btn-redo");
  var btnSave = document.getElementById("btn-save");
  var btnExport = document.getElementById("btn-export");
  var btnImport = document.getElementById("btn-import");
  var btnReset = document.getElementById("btn-reset");
  var btnPreviewLink = document.getElementById("btn-preview-link");

  var state = null;
  var currentTab = "general";
  var historyStack = [];
  var historyIndex = -1;
  var autoSaveTimer = null;
  var pendingUploadCallback = null;
  var toastTimer = null;

  /* ---------- Helpers ---------- */
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.style.display = "block";
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.style.display = "none";
    }, 3500);
  }

  function setStatus(mode) {
    if (!statusEl) return;
    statusEl.classList.remove("dirty", "saving");
    if (mode === "dirty") {
      statusEl.textContent = "Unsaved changes";
      statusEl.classList.add("dirty");
    } else if (mode === "saving") {
      statusEl.textContent = "Saving…";
      statusEl.classList.add("saving");
    } else {
      var d = new Date();
      var h = d.getHours() % 12 || 12;
      var m = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
      var ampm = d.getHours() >= 12 ? "PM" : "AM";
      statusEl.textContent = "Saved locally · " + h + ":" + m + " " + ampm;
    }
  }

  function applyToPreview() {
    try {
      if (iframe && iframe.contentWindow && iframe.contentWindow.MehfillPreview) {
        iframe.contentWindow.MehfillPreview.applyConfig(state);
      }
    } catch (e) {
      /* iframe still loading or cross-origin */
    }
  }

  if (iframe) {
    iframe.addEventListener("load", applyToPreview);
  }

  function pushHistory() {
    if (historyIndex < historyStack.length - 1) {
      historyStack = historyStack.slice(0, historyIndex + 1);
    }
    historyStack.push(JSON.stringify(state));
    historyIndex = historyStack.length - 1;
    updateUndoRedoButtons();
  }

  function updateUndoRedoButtons() {
    if (btnUndo) btnUndo.disabled = historyIndex <= 0;
    if (btnRedo) btnRedo.disabled = historyIndex >= historyStack.length - 1;
  }

  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      state = JSON.parse(historyStack[historyIndex]);
      applyToPreview();
      renderActiveInspector();
      updateUndoRedoButtons();
      setStatus("dirty");
      scheduleAutoSave();
    }
  }

  function redo() {
    if (historyIndex < historyStack.length - 1) {
      historyIndex++;
      state = JSON.parse(historyStack[historyIndex]);
      applyToPreview();
      renderActiveInspector();
      updateUndoRedoButtons();
      setStatus("dirty");
      scheduleAutoSave();
    }
  }

  function scheduleAutoSave() {
    setStatus("dirty");
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(function () {
      saveDraft();
    }, 1200);
  }

  function saveDraft() {
    setStatus("saving");
    setTimeout(function () {
      var res = Data.saveDraft(state);
      if (res.ok) {
        setStatus("saved");
      }
    }, 200);
  }

  function mutateField(path, value) {
    Data.setPath(state, path, value);
    applyToPreview();
    pushHistory();
    scheduleAutoSave();
  }

  /* Image Upload Dialog */
  function requestImageUpload(cb) {
    pendingUploadCallback = cb;
    if (fileInput) {
      fileInput.value = "";
      fileInput.click();
    }
  }

  if (fileInput) {
    fileInput.addEventListener("change", function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file || !pendingUploadCallback) return;

      var reader = new FileReader();
      reader.onload = function (e) {
        var dataUrl = e.target.result;
        if (pendingUploadCallback) {
          pendingUploadCallback(dataUrl);
          pendingUploadCallback = null;
          toast("Photo updated successfully!");
        }
      };
      reader.readAsDataURL(file);
    });
  }

  /* ---------- Inspector Field Builders ---------- */
  function createHeader(title, desc) {
    var wrap = document.createElement("div");
    wrap.className = "inspector-section-header";
    wrap.innerHTML = "<h2 class='inspector-section-title'>" + title + "</h2><p class='inspector-section-desc'>" + desc + "</p>";
    return wrap;
  }

  function createTextInput(label, path, placeholder, hint) {
    var group = document.createElement("div");
    group.className = "ed-field-group";

    var lbl = document.createElement("label");
    lbl.className = "ed-field-label";
    lbl.textContent = label;

    var input = document.createElement("input");
    input.type = "text";
    input.className = "ed-input-text";
    input.value = Data.getPath(state, path) || "";
    if (placeholder) input.placeholder = placeholder;

    input.addEventListener("input", function () {
      mutateField(path, input.value);
    });

    group.appendChild(lbl);
    group.appendChild(input);
    if (hint) {
      var h = document.createElement("p");
      h.className = "ed-field-hint";
      h.textContent = hint;
      group.appendChild(h);
    }
    return group;
  }

  function createTextarea(label, path, rows, placeholder, hint) {
    var group = document.createElement("div");
    group.className = "ed-field-group";

    var lbl = document.createElement("label");
    lbl.className = "ed-field-label";
    lbl.textContent = label;

    var textarea = document.createElement("textarea");
    textarea.className = "ed-input-textarea";
    textarea.rows = rows || 3;
    textarea.value = Data.getPath(state, path) || "";
    if (placeholder) textarea.placeholder = placeholder;

    textarea.addEventListener("input", function () {
      mutateField(path, textarea.value);
    });

    group.appendChild(lbl);
    group.appendChild(textarea);
    if (hint) {
      var h = document.createElement("p");
      h.className = "ed-field-hint";
      h.textContent = hint;
      group.appendChild(h);
    }
    return group;
  }

  function createToggle(label, path, hint) {
    var group = document.createElement("div");
    group.className = "ed-field-group";

    var wrap = document.createElement("label");
    wrap.className = "ed-toggle-label";

    var txt = document.createElement("span");
    txt.textContent = label;

    var input = document.createElement("input");
    input.type = "checkbox";
    input.className = "ed-toggle-input";
    input.checked = !!Data.getPath(state, path);

    input.addEventListener("change", function () {
      mutateField(path, input.checked);
    });

    wrap.appendChild(txt);
    wrap.appendChild(input);
    group.appendChild(wrap);
    if (hint) {
      var h = document.createElement("p");
      h.className = "ed-field-hint";
      h.textContent = hint;
      group.appendChild(h);
    }
    return group;
  }

  function createSelect(label, path, options) {
    var group = document.createElement("div");
    group.className = "ed-field-group";

    var lbl = document.createElement("label");
    lbl.className = "ed-field-label";
    lbl.textContent = label;

    var select = document.createElement("select");
    select.className = "ed-input-select";

    var currentVal = Data.getPath(state, path);
    options.forEach(function (opt) {
      var val = typeof opt === "string" ? opt : opt.value;
      var text = typeof opt === "string" ? opt : opt.label;
      var optEl = document.createElement("option");
      optEl.value = val;
      optEl.textContent = text;
      if (val === currentVal) optEl.selected = true;
      select.appendChild(optEl);
    });

    select.addEventListener("change", function () {
      mutateField(path, select.value);
    });

    group.appendChild(lbl);
    group.appendChild(select);
    return group;
  }

  function createImagePicker(label, path, hint) {
    var group = document.createElement("div");
    group.className = "ed-field-group";

    var lbl = document.createElement("label");
    lbl.className = "ed-field-label";
    lbl.textContent = label;

    var box = document.createElement("div");
    box.className = "ed-image-picker-box";

    var img = document.createElement("img");
    img.className = "ed-image-thumb";
    img.src = Data.getPath(state, path) || "assets/images/emerald-door.jpg";
    img.alt = label;

    var actions = document.createElement("div");
    actions.className = "ed-image-picker-actions";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn-upload-img";
    btn.textContent = "Upload / Replace Photo";

    btn.addEventListener("click", function () {
      requestImageUpload(function (dataUrl) {
        img.src = dataUrl;
        mutateField(path, dataUrl);
      });
    });

    actions.appendChild(btn);
    box.appendChild(img);
    box.appendChild(actions);

    group.appendChild(lbl);
    group.appendChild(box);
    if (hint) {
      var h = document.createElement("p");
      h.className = "ed-field-hint";
      h.textContent = hint;
      group.appendChild(h);
    }
    return group;
  }

  function createColorPicker(label, path) {
    var item = document.createElement("div");
    item.className = "color-picker-item";

    var input = document.createElement("input");
    input.type = "color";
    input.className = "color-picker-input";
    input.value = Data.getPath(state, path) || "#C49A48";

    var lbl = document.createElement("span");
    lbl.className = "color-picker-label";
    lbl.textContent = label;

    input.addEventListener("input", function () {
      mutateField(path, input.value);
    });

    item.appendChild(input);
    item.appendChild(lbl);
    return item;
  }

  /* ---------- Tab Inspectors Renderer ---------- */
  function renderActiveInspector() {
    inspectorContent.innerHTML = "";

    switch (currentTab) {
      case "general":
        inspectorContent.appendChild(createHeader("General & Couple Settings", "Names, titles and primary greeting messages."));
        inspectorContent.appendChild(createTextInput("Bride Full Name", "couple.brideName"));
        inspectorContent.appendChild(createTextInput("Groom Full Name", "couple.groomName"));
        inspectorContent.appendChild(createTextInput("Display Combined Name", "couple.displayName", "e.g. Ananya & Kabir"));
        inspectorContent.appendChild(createTextInput("Initials Monogram", "couple.initials", "A · K"));
        inspectorContent.appendChild(createTextInput("Introduction Header", "couple.introduction"));
        inspectorContent.appendChild(createTextarea("Family Invitation Announcement", "couple.familyInvitation", 3));
        inspectorContent.appendChild(createTextarea("Welcome Greeting Message", "couple.welcomeMessage", 3));
        inspectorContent.appendChild(createTextarea("Closing Blessings Message", "couple.closingMessage", 3));
        inspectorContent.appendChild(createTextInput("Footer Family Credit", "couple.footerMessage"));
        break;

      case "hero":
        inspectorContent.appendChild(createHeader("Hero & Royal Jaipur Mandap", "Customize the majestic Jaipur palace mandap, floral decor, and couple typography."));
        inspectorContent.appendChild(createTextInput("Badge Text", "hero.badgeText", "Shubh Vivah"));
        inspectorContent.appendChild(createTextInput("Family Introduction", "couple.introduction", "Together with their families"));
        inspectorContent.appendChild(createTextInput("Bride Name (Mandap Display)", "couple.brideName", "Ananya Roy"));
        inspectorContent.appendChild(createTextInput("Groom Name (Mandap Display)", "couple.groomName", "Kabir Singhania"));
        inspectorContent.appendChild(createTextInput("Combined Display Name", "couple.displayName", "Ananya & Kabir"));
        inspectorContent.appendChild(createTextInput("Invitation Subtitle", "hero.subtitle", "Invite You To Celebrate Their Wedding"));
        inspectorContent.appendChild(createTextInput("Wedding Date (YYYY-MM-DD)", "event.date", "2026-12-18"));
        inspectorContent.appendChild(createTextInput("Palace Venue Name", "event.venueName", "The Grand Heritage Palace & Royal Gardens"));
        inspectorContent.appendChild(createTextInput("Watch Video Button Text", "hero.watchVideoLabel", "Watch Wedding Video"));
        inspectorContent.appendChild(createTextInput("RSVP Button Text", "hero.rsvpButtonLabel", "Confirm RSVP"));
        inspectorContent.appendChild(document.createElement("hr"));
        inspectorContent.appendChild(createImagePicker("Royal Jaipur Mandap (Portrait / Mobile)", "hero.mandapImage", "Traditional carved sandstone pillars and pink floral mandap."));
        inspectorContent.appendChild(createImagePicker("Royal Jaipur Mandap (Landscape / Desktop)", "hero.mandapLandscape", "Panoramic mandap background image."));
        break;

      case "introVideo":
        inspectorContent.appendChild(createHeader("Opening Video Experience", "Cinematic intro video with static poster, animated text reveal and Play Invitation button."));
        inspectorContent.appendChild(createToggle("Enable Intro Video Experience", "sections.visible.videoIntro", "Show cinematic full-screen video before entering site."));
        inspectorContent.appendChild(createTextInput("Video File / URL", "video.src", "lv_0_20261018234041.mp4", "Path to video file or URL."));
        inspectorContent.appendChild(createImagePicker("Cinematic Static Poster Image", "video.poster", "Poster shown on initial load before user clicks play."));
        inspectorContent.appendChild(createTextInput("Initial Poster Tagline", "video.heading", "A Royal Celebration of Love"));
        inspectorContent.appendChild(createTextInput("Stage 1 Reveal Text (0:01-0:03)", "video.introHeading", "YOU'RE INVITED"));
        inspectorContent.appendChild(createTextInput("Stage 2 Reveal Subheading (0:03+)", "video.introSubheading", "The Wedding Celebration Of"));
        inspectorContent.appendChild(createTextInput("Play Button Label", "video.openButtonLabel", "Play Invitation"));
        inspectorContent.appendChild(createTextInput("Skip Button Label", "video.skipLabel", "Skip Intro"));
        break;

      case "couple":
        inspectorContent.appendChild(createHeader("Bride & Groom Profiles", "Portraits, lineage and romantic biographies of the couple."));
        inspectorContent.appendChild(createImagePicker("Bride Editorial Portrait", "media.bridePhoto", "Portrait 4:5 ratio image."));
        inspectorContent.appendChild(createTextInput("Bride Full Name", "couple.brideName", "Ananya Roy"));
        inspectorContent.appendChild(createTextInput("Bride Parents' Lineage", "couple.brideParents", "Mr. Rajesh & Mrs. Madhuri Roy"));
        inspectorContent.appendChild(createTextarea("Bride Biography", "couple.brideBio", 2));
        inspectorContent.appendChild(document.createElement("hr"));
        inspectorContent.appendChild(createImagePicker("Groom Editorial Portrait", "media.groomPhoto", "Portrait 4:5 ratio image."));
        inspectorContent.appendChild(createTextInput("Groom Full Name", "couple.groomName", "Kabir Singhania"));
        inspectorContent.appendChild(createTextInput("Groom Parents' Lineage", "couple.groomParents", "Mr. Vikram & Mrs. Sunita Singhania"));
        inspectorContent.appendChild(createTextarea("Groom Biography", "couple.groomBio", 2));
        break;

      case "story":
        inspectorContent.appendChild(createHeader("Our Love Story Timeline", "Milestones of how you met, fell in love and decided forever."));
        inspectorContent.appendChild(createTextInput("Story Heading", "story.heading"));
        inspectorContent.appendChild(createTextarea("Story Description", "story.description", 2));
        renderMilestoneList(inspectorContent);
        break;

      case "events":
        inspectorContent.appendChild(createHeader("Wedding Events & Functions", "Haldi, Mehendi, Sangeet, Ceremony and Reception details."));
        inspectorContent.appendChild(createTextInput("Overall Wedding Date (YYYY-MM-DD)", "event.date"));
        inspectorContent.appendChild(createTextInput("Overall Wedding Time (HH:MM)", "event.time"));
        inspectorContent.appendChild(createTextInput("Dress Code / Attire", "event.dressCode"));
        inspectorContent.appendChild(createTextarea("Special Hospitality Notes", "event.notes", 2));
        renderEventsList(inspectorContent);
        break;

      case "countdown":
        inspectorContent.appendChild(createHeader("Live Countdown Timer", "Real-time tick towards the auspicious wedding moment."));
        inspectorContent.appendChild(createToggle("Show Countdown Section", "countdown.show"));
        inspectorContent.appendChild(createTextInput("Countdown Heading", "countdown.heading"));
        inspectorContent.appendChild(createTextInput("Countdown Subheading", "countdown.subheading"));
        inspectorContent.appendChild(createTextarea("Celebration Message (Post Wedding)", "countdown.passedMessage", 2));
        break;

      case "scratch":
        inspectorContent.appendChild(createHeader("Interactive Scratch Card", "Surprise wedding keepsake revealed when scratched on mobile or desktop."));
        inspectorContent.appendChild(createToggle("Enable Scratch Card", "scratchCard.enabled"));
        inspectorContent.appendChild(createTextInput("Card Title", "scratchCard.title"));
        inspectorContent.appendChild(createTextInput("Card Subtitle", "scratchCard.subtitle"));
        inspectorContent.appendChild(createTextInput("Scratch Surface Hint", "scratchCard.scratchHint", "Scratch Here ✨"));
        inspectorContent.appendChild(createTextInput("Hidden Reveal Heading", "scratchCard.hiddenHeading"));
        inspectorContent.appendChild(createTextarea("Hidden Reveal Body", "scratchCard.hiddenMessage", 3));
        break;

      case "venue":
        inspectorContent.appendChild(createHeader("Venue & Google Maps", "Palace destination, location details and map directions."));
        inspectorContent.appendChild(createImagePicker("Venue Palace Photograph", "media.venuePhoto"));
        inspectorContent.appendChild(createTextInput("Palace Venue Name", "event.venueName"));
        inspectorContent.appendChild(createTextarea("Full Address", "event.address", 2));
        inspectorContent.appendChild(createTextInput("Google Maps Link", "event.mapsUrl", "https://maps.google.com/?q=..."));
        break;

      case "gallery":
        inspectorContent.appendChild(createHeader("Photo Gallery", "Curated pre-wedding and celebration memories with full lightbox."));
        renderGalleryList(inspectorContent);
        break;

      case "rsvp":
        inspectorContent.appendChild(createHeader("RSVP & Guest Book", "Manage RSVP settings and review submitted guest attendance."));
        inspectorContent.appendChild(createToggle("Enable RSVP Form", "rsvp.enabled"));
        inspectorContent.appendChild(createTextInput("RSVP Section Heading", "rsvp.heading"));
        inspectorContent.appendChild(createTextInput("RSVP Subheading / Deadline", "rsvp.subheading"));
        inspectorContent.appendChild(createTextInput("WhatsApp Contact Number", "rsvp.whatsappPhone", "+91 98765 43210"));
        renderRsvpGuestTable(inspectorContent);
        break;

      case "theme":
        inspectorContent.appendChild(createHeader("Theme Colours & Fonts", "Emerald Green, Pink Bougainvillea, Antique Gold & Typography."));
        var colorGrid = document.createElement("div");
        colorGrid.className = "color-picker-grid";
        colorGrid.appendChild(createColorPicker("Emerald Green", "theme.emerald"));
        colorGrid.appendChild(createColorPicker("Deep Green", "theme.deepGreen"));
        colorGrid.appendChild(createColorPicker("Floral Pink", "theme.floralPink"));
        colorGrid.appendChild(createColorPicker("Blush Pink", "theme.blushPink"));
        colorGrid.appendChild(createColorPicker("Ivory Cream", "theme.ivory"));
        colorGrid.appendChild(createColorPicker("Antique Gold", "theme.antiqueGold"));
        colorGrid.appendChild(createColorPicker("Soft White", "theme.softWhite"));
        inspectorContent.appendChild(colorGrid);

        inspectorContent.appendChild(document.createElement("hr"));
        inspectorContent.appendChild(createSelect("Headings Font", "theme.headingFont", ["Cormorant Garamond", "Playfair Display", "Marcellus"]));
        inspectorContent.appendChild(createSelect("Couple Names Font", "theme.namesFont", ["Playfair Display", "Cormorant Garamond", "Allura"]));
        inspectorContent.appendChild(createSelect("Body Text Font", "theme.bodyFont", ["Montserrat", "Lato", "Poppins"]));
        break;

      case "animations":
        inspectorContent.appendChild(createHeader("Animations & Effects", "Falling rose petals particle engine, lantern glow and reveals."));
        inspectorContent.appendChild(createToggle("Falling Rose Petals", "theme.fallingPetals", "Render dynamic 60fps falling rose petals on canvas."));
        inspectorContent.appendChild(createToggle("Hanging Lantern Warm Glow", "theme.lanternGlow", "Subtle breathing amber lantern light."));
        inspectorContent.appendChild(createToggle("Scroll Reveal Animations", "theme.animationsEnabled", "Graceful entrance transitions for cards."));
        break;

      case "music":
        inspectorContent.appendChild(createHeader("Background Music", "Shehnai & sitar melodies playing in the background."));
        inspectorContent.appendChild(createToggle("Enable Background Music", "music.enabled"));
        inspectorContent.appendChild(createTextInput("Audio File / URL", "music.src", "assets/audio/music.mp3"));
        inspectorContent.appendChild(createTextInput("Song Title / Credit", "music.songTitle", "Royal Shehnai & Sitar Harmony"));
        break;
    }
  }

  /* ---------- List Renderers for Complex Collections ---------- */

  // 1. Milestones
  function renderMilestoneList(container) {
    var wrap = document.createElement("div");
    wrap.className = "ed-item-list";

    var milestones = state.story.milestones || [];
    milestones.forEach(function (m, idx) {
      var card = document.createElement("div");
      card.className = "ed-list-card";

      var hdr = document.createElement("div");
      hdr.className = "ed-list-card-header";
      hdr.innerHTML = "<span class='ed-list-card-title'>Milestone " + (idx + 1) + ": " + (m.title || "Untitled") + "</span>";

      var tools = document.createElement("div");
      tools.className = "ed-list-card-tools";

      if (idx > 0) {
        var btnUp = document.createElement("button");
        btnUp.type = "button";
        btnUp.className = "btn-card-tool";
        btnUp.textContent = "▲";
        btnUp.title = "Move Up";
        btnUp.addEventListener("click", function () {
          var tmp = milestones[idx];
          milestones[idx] = milestones[idx - 1];
          milestones[idx - 1] = tmp;
          mutateField("story.milestones", milestones);
          renderActiveInspector();
        });
        tools.appendChild(btnUp);
      }

      if (idx < milestones.length - 1) {
        var btnDown = document.createElement("button");
        btnDown.type = "button";
        btnDown.className = "btn-card-tool";
        btnDown.textContent = "▼";
        btnDown.title = "Move Down";
        btnDown.addEventListener("click", function () {
          var tmp = milestones[idx];
          milestones[idx] = milestones[idx + 1];
          milestones[idx + 1] = tmp;
          mutateField("story.milestones", milestones);
          renderActiveInspector();
        });
        tools.appendChild(btnDown);
      }

      var btnDel = document.createElement("button");
      btnDel.type = "button";
      btnDel.className = "btn-card-tool btn-delete";
      btnDel.textContent = "✕";
      btnDel.title = "Delete Milestone";
      btnDel.addEventListener("click", function () {
        milestones.splice(idx, 1);
        mutateField("story.milestones", milestones);
        renderActiveInspector();
      });
      tools.appendChild(btnDel);

      hdr.appendChild(tools);
      card.appendChild(hdr);

      card.appendChild(createTextInput("Date / Year", "story.milestones." + idx + ".year"));
      card.appendChild(createTextInput("Milestone Title", "story.milestones." + idx + ".title"));
      card.appendChild(createTextarea("Description", "story.milestones." + idx + ".description", 2));
      card.appendChild(createImagePicker("Milestone Photo", "story.milestones." + idx + ".image"));

      wrap.appendChild(card);
    });

    var addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn-add-item";
    addBtn.textContent = "+ Add New Story Milestone";
    addBtn.addEventListener("click", function () {
      if (!state.story.milestones) state.story.milestones = [];
      state.story.milestones.push({
        id: Data.newId("m"),
        year: "New Date",
        title: "New Story Moment",
        description: "Describe this romantic milestone here...",
        image: "assets/images/couple-portrait.jpg"
      });
      mutateField("story.milestones", state.story.milestones);
      renderActiveInspector();
    });

    container.appendChild(wrap);
    container.appendChild(addBtn);
  }

  // 2. Events List
  function renderEventsList(container) {
    var wrap = document.createElement("div");
    wrap.className = "ed-item-list";

    var events = state.event.events || [];
    events.forEach(function (ev, idx) {
      var card = document.createElement("div");
      card.className = "ed-list-card";

      var hdr = document.createElement("div");
      hdr.className = "ed-list-card-header";
      hdr.innerHTML = "<span class='ed-list-card-title'>Event " + (idx + 1) + ": " + (ev.title || "Untitled") + "</span>";

      var tools = document.createElement("div");
      tools.className = "ed-list-card-tools";

      if (idx > 0) {
        var btnUp = document.createElement("button");
        btnUp.type = "button";
        btnUp.className = "btn-card-tool";
        btnUp.textContent = "▲";
        btnUp.title = "Move Up";
        btnUp.addEventListener("click", function () {
          var tmp = events[idx];
          events[idx] = events[idx - 1];
          events[idx - 1] = tmp;
          mutateField("event.events", events);
          renderActiveInspector();
        });
        tools.appendChild(btnUp);
      }

      if (idx < events.length - 1) {
        var btnDown = document.createElement("button");
        btnDown.type = "button";
        btnDown.className = "btn-card-tool";
        btnDown.textContent = "▼";
        btnDown.title = "Move Down";
        btnDown.addEventListener("click", function () {
          var tmp = events[idx];
          events[idx] = events[idx + 1];
          events[idx + 1] = tmp;
          mutateField("event.events", events);
          renderActiveInspector();
        });
        tools.appendChild(btnDown);
      }

      var btnDel = document.createElement("button");
      btnDel.type = "button";
      btnDel.className = "btn-card-tool btn-delete";
      btnDel.textContent = "✕";
      btnDel.title = "Delete Function";
      btnDel.addEventListener("click", function () {
        events.splice(idx, 1);
        mutateField("event.events", events);
        renderActiveInspector();
      });
      tools.appendChild(btnDel);

      hdr.appendChild(tools);
      card.appendChild(hdr);

      card.appendChild(createTextInput("Function Title", "event.events." + idx + ".title"));
      card.appendChild(createTextInput("Date", "event.events." + idx + ".date"));
      card.appendChild(createTextInput("Time", "event.events." + idx + ".time"));
      card.appendChild(createTextInput("Venue Location", "event.events." + idx + ".venue"));
      card.appendChild(createTextarea("Description", "event.events." + idx + ".description", 2));
      card.appendChild(createImagePicker("Event Banner Image", "event.events." + idx + ".image"));

      wrap.appendChild(card);
    });

    var addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn-add-item";
    addBtn.textContent = "+ Add Wedding Ceremony";
    addBtn.addEventListener("click", function () {
      if (!state.event.events) state.event.events = [];
      state.event.events.push({
        id: Data.newId("e"),
        title: "New Ceremony",
        date: "18 December 2026",
        time: "6:00 PM",
        venue: "Palace Pavilion",
        description: "Celebrations, rituals and family feast.",
        image: "assets/images/venue.jpg"
      });
      mutateField("event.events", state.event.events);
      renderActiveInspector();
    });

    container.appendChild(wrap);
    container.appendChild(addBtn);
  }

  // 3. Gallery List
  function renderGalleryList(container) {
    var wrap = document.createElement("div");
    wrap.className = "ed-item-list";

    var gallery = state.media.gallery || [];
    gallery.forEach(function (g, idx) {
      var card = document.createElement("div");
      card.className = "ed-list-card";

      var hdr = document.createElement("div");
      hdr.className = "ed-list-card-header";
      hdr.innerHTML = "<span class='ed-list-card-title'>Photo " + (idx + 1) + ": " + (g.caption || "Untitled") + "</span>";

      var tools = document.createElement("div");
      tools.className = "ed-list-card-tools";

      if (idx > 0) {
        var btnUp = document.createElement("button");
        btnUp.type = "button";
        btnUp.className = "btn-card-tool";
        btnUp.textContent = "▲";
        btnUp.title = "Move Up";
        btnUp.addEventListener("click", function () {
          var tmp = gallery[idx];
          gallery[idx] = gallery[idx - 1];
          gallery[idx - 1] = tmp;
          mutateField("media.gallery", gallery);
          renderActiveInspector();
        });
        tools.appendChild(btnUp);
      }

      if (idx < gallery.length - 1) {
        var btnDown = document.createElement("button");
        btnDown.type = "button";
        btnDown.className = "btn-card-tool";
        btnDown.textContent = "▼";
        btnDown.title = "Move Down";
        btnDown.addEventListener("click", function () {
          var tmp = gallery[idx];
          gallery[idx] = gallery[idx + 1];
          gallery[idx + 1] = tmp;
          mutateField("media.gallery", gallery);
          renderActiveInspector();
        });
        tools.appendChild(btnDown);
      }

      var btnDel = document.createElement("button");
      btnDel.type = "button";
      btnDel.className = "btn-card-tool btn-delete";
      btnDel.textContent = "✕";
      btnDel.title = "Delete Photo";
      btnDel.addEventListener("click", function () {
        gallery.splice(idx, 1);
        mutateField("media.gallery", gallery);
        renderActiveInspector();
      });
      tools.appendChild(btnDel);

      hdr.appendChild(tools);
      card.appendChild(hdr);

      card.appendChild(createImagePicker("Photo", "media.gallery." + idx + ".src"));
      card.appendChild(createTextInput("Caption", "media.gallery." + idx + ".caption"));

      wrap.appendChild(card);
    });

    var addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn-add-item";
    addBtn.textContent = "+ Add Gallery Photo";
    addBtn.addEventListener("click", function () {
      if (!state.media.gallery) state.media.gallery = [];
      state.media.gallery.push({
        id: Data.newId("g"),
        src: "assets/images/couple-portrait.jpg",
        caption: "Royal Wedding Memory",
        alt: "Wedding photo"
      });
      mutateField("media.gallery", state.media.gallery);
      renderActiveInspector();
    });

    container.appendChild(wrap);
    container.appendChild(addBtn);
  }

  // 4. RSVP Guest Table
  function renderRsvpGuestTable(container) {
    var heading = document.createElement("h3");
    heading.style.marginTop = "24px";
    heading.style.fontSize = "0.85rem";
    heading.style.color = "var(--ed-gold-light)";
    heading.textContent = "Guest Responses (Local Submissions)";
    container.appendChild(heading);

    var rsvps = Data.loadRsvps();
    if (!rsvps.length) {
      var empty = document.createElement("p");
      empty.style.color = "var(--ed-text-muted)";
      empty.style.fontSize = "0.78rem";
      empty.style.marginTop = "8px";
      empty.textContent = "No guest RSVPs submitted yet. Responses submitted by guests via the RSVP form will appear here.";
      container.appendChild(empty);
      return;
    }

    var tableWrap = document.createElement("div");
    tableWrap.className = "rsvp-table-container";

    var table = document.createElement("table");
    table.className = "rsvp-table";
    table.innerHTML = "<thead><tr><th>Guest</th><th>Status</th><th>Guests</th><th>Phone</th></tr></thead><tbody></tbody>";
    var tbody = table.querySelector("tbody");

    rsvps.forEach(function (r) {
      var tr = document.createElement("tr");
      var isAccept = (r.attendance || "").indexOf("Accept") >= 0;
      tr.innerHTML = "<td><strong>" + (r.name || "Guest") + "</strong></td>" +
        "<td><span class='" + (isAccept ? "rsvp-badge-accept" : "rsvp-badge-decline") + "'>" + (isAccept ? "Attending" : "Declined") + "</span></td>" +
        "<td>" + (r.guests || 1) + "</td>" +
        "<td>" + (r.phone || "-") + "</td>";
      tbody.appendChild(tr);
    });

    tableWrap.appendChild(table);
    container.appendChild(tableWrap);

    var exportBtn = document.createElement("button");
    exportBtn.type = "button";
    exportBtn.className = "ed-btn-tool";
    exportBtn.style.marginTop = "12px";
    exportBtn.innerHTML = "<span>Download RSVP List as CSV</span>";
    exportBtn.addEventListener("click", function () {
      var csv = Data.exportRsvpsCSV();
      var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "royal-wedding-rsvps.csv";
      a.click();
      URL.revokeObjectURL(url);
    });
    container.appendChild(exportBtn);
  }

  /* ---------- Nav Tab Switching ---------- */
  var navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(function (item) {
    item.addEventListener("click", function () {
      navItems.forEach(function (n) { n.classList.remove("is-active"); });
      item.classList.add("is-active");
      currentTab = item.dataset.tab;
      renderActiveInspector();
    });
  });

  /* ---------- Device Preview Toggle ---------- */
  var segBtns = document.querySelectorAll(".btn-seg");
  segBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      segBtns.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var dev = btn.dataset.device;
      deviceFrame.className = "device-frame mode-" + dev;
    });
  });

  /* ---------- Top Toolbar Actions ---------- */
  if (btnUndo) btnUndo.addEventListener("click", undo);
  if (btnRedo) btnRedo.addEventListener("click", redo);
  if (btnSave) {
    btnSave.addEventListener("click", function () {
      saveDraft();
      toast("Draft saved in this browser!");
    });
  }

  if (btnExport) {
    btnExport.addEventListener("click", function () {
      var json = Data.exportJSON(state);
      var blob = new Blob([json], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "royal-floral-garden-config.json";
      a.click();
      URL.revokeObjectURL(url);
      toast("Configuration exported!");
    });
  }

  if (btnImport) {
    btnImport.addEventListener("click", function () {
      var fileSelector = document.createElement("input");
      fileSelector.type = "file";
      fileSelector.accept = ".json,application/json";
      fileSelector.addEventListener("change", function () {
        var file = fileSelector.files && fileSelector.files[0];
        if (!file) return;
        var r = new FileReader();
        r.onload = function (e) {
          var res = Data.parseImport(e.target.result);
          if (res.ok) {
            state = res.config;
            applyToPreview();
            pushHistory();
            renderActiveInspector();
            toast("Configuration successfully imported!");
          } else {
            alert("Error importing file: " + res.error);
          }
        };
        r.readAsText(file);
      });
      fileSelector.click();
    });
  }

  if (btnReset) {
    btnReset.addEventListener("click", function () {
      if (confirm("Reset the entire invitation back to default Royal Floral Garden demo? Any unsaved changes will be cleared.")) {
        Data.clearDraft();
        state = Data.clone(Data.DEFAULT_INVITATION);
        applyToPreview();
        pushHistory();
        renderActiveInspector();
        toast("Template reset to original demo!");
      }
    });
  }

  if (btnPreviewLink) {
    btnPreviewLink.addEventListener("click", function () {
      window.open("index.html", "_blank", "noopener");
    });
  }

  /* Keyboard Shortcuts */
  document.addEventListener("keydown", function (e) {
    var tag = (e.target && e.target.tagName) || "";
    var isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !isInput) {
      e.preventDefault();
      if (e.shiftKey) redo(); else undo();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y" && !isInput) {
      e.preventDefault();
      redo();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      saveDraft();
      toast("Draft saved!");
    }
  });

  /* ---------- Boot Editor ---------- */
  function boot() {
    var draft = Data.loadDraft();
    state = draft || Data.clone(Data.DEFAULT_INVITATION);
    historyStack = [JSON.stringify(state)];
    historyIndex = 0;
    updateUndoRedoButtons();
    renderActiveInspector();
    applyToPreview();
    setStatus(draft ? "saved" : "idle");
  }

  boot();

})();
