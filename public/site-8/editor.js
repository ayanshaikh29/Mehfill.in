/*
 * Mehfill.in — Template Customization Studio (Luxury Ivory Reception)
 * Drives the live invitation preview through the shared renderer.
 */
(function () {
  "use strict";

  var Data = window.MehfillData;
  var R = window.MehfillRenderer;
  if (!Data || !R) return;

  var iframe = document.getElementById("preview");
  var panelsHost = document.getElementById("panels");
  var statusEl = document.getElementById("save-status");
  var toastEl = document.getElementById("toast");
  var modalEl = document.getElementById("modal");
  var modalTitle = document.getElementById("modal-title");
  var modalBody = document.getElementById("modal-body");
  var modalActions = document.getElementById("modal-actions");
  var fileDlg = document.getElementById("file-dialog");
  var deviceEl = document.getElementById("device");
  var sidebar = document.getElementById("sidebar");
  var scrim = document.getElementById("sidebar-scrim");

  var state = null;
  var history = [];
  var hIndex = -1;
  var histTimer = null;
  var saveTimer = null;
  var toastTimer = null;
  var objectUrls = {};
  var pendingFileCb = null;
  var tempMediaWarned = false;

  var SECTION_LABELS = {
    hero: "Hero",
    portrait: "Couple portrait",
    story: "Our Story",
    eventDetails: "Reception details",
    countdown: "Countdown",
    gallery: "Gallery",
    quote: "Quote",
    location: "Google Maps",
    rsvp: "RSVP",
    closing: "Closing invitation",
    footer: "Footer"
  };

  /* ---------- tiny helpers ---------- */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function toast(message, kind) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.className = "ed-toast" + (kind ? " " + kind : "");
    toastEl.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 4200);
  }

  function setStatus(mode) {
    if (!statusEl) return;
    statusEl.classList.remove("is-dirty", "is-saving", "is-saved");
    if (mode === "dirty") {
      statusEl.textContent = "Unsaved changes";
      statusEl.classList.add("is-dirty");
    } else if (mode === "saving") {
      statusEl.textContent = "Saving…";
      statusEl.classList.add("is-saving");
    } else if (mode === "saved") {
      var t = new Date();
      var hh = t.getHours() % 12 || 12;
      var mm = (t.getMinutes() < 10 ? "0" : "") + t.getMinutes();
      statusEl.textContent = "Saved locally · " + hh + ":" + mm + (t.getHours() >= 12 ? " PM" : " AM");
      statusEl.classList.add("is-saved");
    } else {
      statusEl.textContent = "Draft ready";
    }
  }

  function showModal(title, bodyNodes, actions) {
    modalTitle.textContent = title;
    modalBody.textContent = "";
    (bodyNodes || []).forEach(function (n) { modalBody.appendChild(n); });
    modalActions.textContent = "";
    (actions || []).forEach(function (a) {
      var b = el("button", a.primary ? "tool-primary" : "tool-btn", a.label);
      b.type = "button";
      b.addEventListener("click", function () {
        hideModal();
        if (a.onClick) a.onClick();
      });
      modalActions.appendChild(b);
    });
    modalEl.hidden = false;
  }

  function hideModal() {
    modalEl.hidden = true;
  }

  if (modalEl) {
    modalEl.addEventListener("click", function (e) { if (e.target === modalEl) hideModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modalEl.hidden) hideModal(); });
  }

  /* ---------- history ---------- */

  function snapshot() { return JSON.stringify(state); }

  function pushHistory() {
    if (histTimer) clearTimeout(histTimer);
    histTimer = setTimeout(function () {
      var snap = snapshot();
      if (hIndex >= 0 && history[hIndex] === snap) return;
      history = history.slice(0, hIndex + 1);
      history.push(snap);
      if (history.length > 60) history.shift();
      hIndex = history.length - 1;
      updateUndoRedo();
    }, 450);
  }

  function updateUndoRedo() {
    var undo = document.getElementById("btn-undo");
    var redo = document.getElementById("btn-redo");
    if (undo) undo.disabled = hIndex <= 0;
    if (redo) redo.disabled = hIndex >= history.length - 1;
  }

  function restoreHistory(index) {
    if (index < 0 || index >= history.length) return;
    hIndex = index;
    state = JSON.parse(history[hIndex]);
    rebuildPanels();
    applyToPreview();
    markDirty(false);
    updateUndoRedo();
  }

  function undo() { restoreHistory(hIndex - 1); }
  function redo() { restoreHistory(hIndex + 1); }

  /* ---------- state ---------- */

  function markDirty(recordHistory) {
    setStatus("dirty");
    if (recordHistory !== false) pushHistory();
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { saveDraft(true); }, 1100);
  }

  function saveDraft(auto) {
    setStatus("saving");
    window.setTimeout(function () {
      var res = Data.saveDraft(state);
      if (res.ok) {
        setStatus("saved");
        if (!auto) {
          if (Data.hasTempMedia(state)) {
            toast("Draft saved locally. Uploaded photos are temporary — connect cloud publishing on Mehfill.in to keep them.");
          } else {
            toast("Draft saved in this browser.");
          }
        }
      } else {
        setStatus("dirty");
        toast("Draft could not be saved in this browser.", "error");
      }
    }, 180);
  }

  function applyToPreview() {
    try {
      if (iframe && iframe.contentWindow && iframe.contentWindow.MehfillPreview) {
        iframe.contentWindow.MehfillPreview.applyConfig(state);
      }
    } catch (e) { /* preview still loading */ }
  }

  if (iframe) iframe.addEventListener("load", applyToPreview);

  /* ---------- file picker ---------- */

  function pickImage(cb) {
    pendingFileCb = cb;
    if (fileDlg) {
      fileDlg.value = "";
      fileDlg.click();
    }
  }

  if (fileDlg) {
    fileDlg.addEventListener("change", function () {
      var f = fileDlg.files && fileDlg.files[0];
      var cb = pendingFileCb;
      pendingFileCb = null;
      if (!f || !cb) return;
      if (!/^image\/(jpeg|png|webp)$/i.test(f.type)) {
        toast("Please choose a JPG, PNG or WebP image.", "error");
        return;
      }
      if (f.size > 12 * 1024 * 1024) {
        toast("That image is larger than 12 MB. Please choose a smaller file.", "error");
        return;
      }
      if (f.size > 4 * 1024 * 1024) {
        toast("Large image (" + (f.size / 1048576).toFixed(1) + " MB) — preview is fine, but compress it before publishing.", "warn");
      }
      cb(URL.createObjectURL(f), f);
    });
  }

  function setMediaUrl(path, url) {
    var old = Data.getPath(state, path);
    if (old && objectUrls[path] === old) {
      try { URL.revokeObjectURL(old); } catch (e) { /* ignore */ }
    }
    objectUrls[path] = url;
    Data.setPath(state, path, url);
  }

  function resetMedia(path, defaultPath) {
    var old = Data.getPath(state, path);
    if (old && objectUrls[path] === old) {
      try { URL.revokeObjectURL(old); } catch (e) { /* ignore */ }
    }
    delete objectUrls[path];
    Data.setPath(state, path, Data.getPath(Data.DEFAULT_INVITATION, defaultPath || path));
  }

  function revokeAllUrls() {
    Object.keys(objectUrls).forEach(function (k) {
      try { URL.revokeObjectURL(objectUrls[k]); } catch (e) { /* ignore */ }
    });
    objectUrls = {};
  }

  /* ---------- panel schema ---------- */

  function F(type, path, label, opts) {
    var f = { type: type, path: path, label: label };
    if (opts) Object.keys(opts).forEach(function (k) { f[k] = opts[k]; });
    return f;
  }

  var IMAGE_FIELDS = [
    { path: "media.hero", label: "Hero background photo", hint: "Portrait 9:16 · ≥ 1000 × 1600 px", posPath: "media.heroPosition", posLabel: "Background position", defaults: "assets/images/hero-couple.jpg" },
    { path: "media.couplePortrait", label: "Main couple portrait", hint: "Portrait 4:5 · faces near the top third", posPath: "media.portraitPosition", posLabel: "Focal point", fitPath: "media.portraitFit", defaults: "assets/images/couple-portrait.jpg" },
    { path: "media.stage", label: "Reception stage photo", hint: "Landscape 3:2 · ≥ 1100 px wide", defaults: "assets/images/reception-stage.jpg" },
    { path: "media.decoration", label: "Decoration photo", hint: "Landscape 3:2 · ≥ 1100 px wide", defaults: "assets/images/reception-decor.jpg" },
    { path: "media.details", label: "Wedding details photo", hint: "Landscape or square · ≥ 900 px", defaults: "assets/images/wedding-details.jpg" },
    { path: "media.customBackground", label: "Custom page background (optional)", hint: "Shown softly behind the invitation", defaults: "" }
  ];

  var PANELS = [
    {
      id: "couple", label: "Couple", icon: "❦", open: true,
      fields: [
        F("text", "couple.groomName", "Groom’s full name", { max: 80 }),
        F("text", "couple.brideName", "Bride’s full name", { max: 80 }),
        F("text", "couple.displayName", "Couple display name", { max: 120, hint: "Shown under the portrait." }),
        F("text", "couple.initials", "Monogram", { max: 12, hint: "Appears on the wax seal — e.g. A · K" }),
        F("text", "couple.introduction", "Introduction line", { max: 120 })
      ]
    },
    {
      id: "text", label: "Text & messages", icon: "✎",
      fields: [
        F("text", "text.heroEyebrow", "Hero eyebrow", { max: 80 }),
        F("text", "couple.invitationHeading", "Invitation heading", { max: 60 }),
        F("textarea", "couple.welcomeMessage", "Welcome message", { max: 200 }),
        F("textarea", "couple.customDescription", "Short description", { max: 400 }),
        F("textarea", "couple.familyInvitation", "Family invitation", { max: 400 }),
        F("textarea", "couple.closingMessage", "Closing message", { max: 400 }),
        F("text", "text.eventHeading", "Reception details heading", { max: 80 }),
        F("text", "text.galleryHeading", "Gallery heading", { max: 80 }),
        F("text", "text.locationHeading", "Map section heading", { max: 80 }),
        F("textarea", "quote.text", "Romantic quote", { max: 400 }),
        F("text", "quote.attribution", "Quote attribution", { max: 80 }),
        F("text", "story.heading", "Story heading", { max: 80 }),
        F("textarea", "story.description", "Story description", { max: 400 }),
        F("list-milestones", "story.milestones", "Story milestones")
      ]
    },
    {
      id: "photos", label: "Photos", icon: "✧",
      fields: [{ type: "images" }]
    },
    {
      id: "reception", label: "Reception details", icon: "❈",
      fields: [
        F("text", "event.title", "Event title", { max: 80 }),
        F("date", "event.date", "Event date"),
        F("time", "event.time", "Start time"),
        F("time", "event.endTime", "End time (optional)"),
        F("text", "event.venueName", "Venue name", { max: 120 }),
        F("textarea", "event.address", "Full address", { max: 240, hint: "Also used for Google Maps." }),
        F("url", "event.mapsUrl", "Custom Google Maps link (optional)", { placeholder: "https://www.google.com/maps/…" }),
        F("text", "event.dressCode", "Dress code", { max: 120 }),
        F("textarea", "event.notes", "Additional notes", { max: 400 }),
        F("textarea", "event.calendarDescription", "Calendar event description", { max: 400 }),
        F("list-events", "event.events", "Programme / schedule")
      ]
    },
    {
      id: "gallery", label: "Gallery", icon: "▦",
      fields: [
        F("text", "text.galleryHeading", "Gallery heading", { max: 80 }),
        F("list-gallery", "media.gallery", "Gallery photos", { hint: "Up to 12 photos. Drag order with the arrows." })
      ]
    },
    {
      id: "countdown", label: "Countdown", icon: "◷",
      fields: [
        F("toggle", "countdown.show", "Show countdown"),
        F("text", "countdown.label", "Countdown heading", { max: 120 }),
        F("textarea", "countdown.passedMessage", "Message after the event", { max: 300 }),
        F("note", null, null, { text: "The countdown uses the reception date and start time above, in India time (Asia/Kolkata)." })
      ]
    },
    {
      id: "rsvp", label: "RSVP", icon: "✉",
      fields: [
        F("text", "rsvp.heading", "RSVP heading", { max: 80 }),
        F("textarea", "rsvp.description", "RSVP description", { max: 400 }),
        F("tel", "rsvp.contactPhone", "Contact number", { placeholder: "+91 90000 12345" }),
        F("tel", "rsvp.whatsappPhone", "WhatsApp RSVP number", { placeholder: "Same as contact number" }),
        F("list-choices", "rsvp.choices", "Attendance choices"),
        F("number", "rsvp.maxGuests", "Maximum guests per response", { min: 1, max: 100 }),
        F("toggle", "rsvp.askPhone", "Ask for guest phone"),
        F("toggle", "rsvp.askMessage", "Allow a message field"),
        F("textarea", "rsvp.successText", "Success message", { max: 300, hint: "Shown after the guest sends their response." })
      ]
    },
    {
      id: "theme", label: "Theme", icon: "✺",
      fields: [
        F("color", "theme.background", "Background"),
        F("color", "theme.pearl", "Card / pearl"),
        F("color", "theme.accent", "Gold accent"),
        F("color", "theme.accentDeep", "Deep gold"),
        F("color", "theme.blush", "Blush"),
        F("color", "theme.text", "Heading colour"),
        F("color", "theme.muted", "Muted text"),
        F("select", "theme.scriptFont", "Couple-name font", { options: ["Allura", "Great Vibes", "Cormorant Garamond"] }),
        F("select", "theme.headingFont", "Heading font", { options: ["Cormorant Garamond", "Playfair Display", "Marcellus"] }),
        F("select", "theme.bodyFont", "Body font", { options: ["Montserrat", "Lato"] }),
        F("range", "theme.floralIntensity", "Floral intensity", { min: 0, max: 100 }),
        F("range", "theme.borderIntensity", "Gold border intensity", { min: 0, max: 100 }),
        F("toggle", "theme.texture", "Paper texture"),
        F("toggle", "theme.corners", "Corner florals"),
        F("actions", null, null, { actions: [{ id: "reset-theme", label: "Reset theme" }] })
      ]
    },
    {
      id: "sections", label: "Sections", icon: "☰",
      fields: [
        F("sections-visible", "sections.visible", "Show / hide sections"),
        F("sections-order", "sections.order", "Section order")
      ]
    },
    {
      id: "extras", label: "Opening & music", icon: "✉",
      fields: [
        F("toggle", "envelope.show", "Envelope opening animation"),
        F("text", "envelope.sealText", "Wax seal text", { max: 12 }),
        F("text", "envelope.hint", "Envelope hint", { max: 80 }),
        F("toggle", "video.enabled", "Opening film (video)"),
        F("text", "video.src", "Video file URL (mp4)", { max: 2000 }),
        F("text", "video.skipLabel", "Skip button label", { max: 40 }),
        F("toggle", "video.autoMusic", "Start music with the film"),
        F("toggle", "music.enabled", "Background music button"),
        F("text", "music.openLabel", "Play button label", { max: 40 }),
        F("text", "music.closeLabel", "Pause button label", { max: 40 })
      ]
    },
    {
      id: "footer", label: "Footer", icon: "✎",
      fields: [
        F("text", "couple.footerMessage", "Footer message", { max: 160 }),
        F("text", "branding.credit", "Credit line", { max: 80 }),
        F("text", "branding.brandName", "Brand name", { max: 40 }),
        F("url", "branding.brandUrl", "Brand link")
      ]
    }
  ];

  /* ---------- generic field builders ---------- */

  function withCounter(input, max, path) {
    var wrap = el("div");
    wrap.appendChild(input);
    var counter = el("div", "ed-counter");
    function upd() {
      var len = (input.value || "").length;
      counter.textContent = len + " / " + max;
      counter.classList.toggle("over", len >= max);
    }
    input.addEventListener("input", upd);
    upd();
    return { wrap: wrap, counter: counter, updateCounter: upd };
  }

  function buildGeneric(field) {
    var path = field.path;
    var value = Data.getPath(state, path);
    var wrap = el("div", "ed-field");
    var label = el("label", null, field.label);
    label.setAttribute("for", "f-" + path.replace(/\./g, "-"));

    if (field.type === "toggle") {
      var row = el("label", "ed-toggle");
      row.setAttribute("for", "f-" + path.replace(/\./g, "-"));
      var span = el("span", null, field.label);
      var input = el("input");
      input.type = "checkbox";
      input.id = "f-" + path.replace(/\./g, "-");
      input.checked = !!value;
      input.dataset.path = path;
      input.dataset.kind = "toggle";
      var sw = el("span", "ed-switch");
      row.appendChild(span);
      row.appendChild(input);
      row.appendChild(sw);
      return row;
    }

    wrap.appendChild(label);

    if (field.type === "note") {
      wrap.appendChild(el("p", "ed-hint", field.text || ""));
      return wrap;
    }

    var input2;
    if (field.type === "textarea") {
      input2 = el("textarea");
      input2.rows = 3;
    } else if (field.type === "select") {
      input2 = el("select");
      (field.options || []).forEach(function (opt) {
        var o = el("option", null, opt);
        o.value = opt;
        if (opt === value) o.selected = true;
        input2.appendChild(o);
      });
    } else if (field.type === "date") {
      input2 = el("input");
      input2.type = "date";
      input2.value = value || "";
    } else if (field.type === "time") {
      input2 = el("input");
      input2.type = "time";
      input2.value = value || "";
    } else if (field.type === "tel") {
      input2 = el("input");
      input2.type = "tel";
      input2.value = value || "";
    } else if (field.type === "url") {
      input2 = el("input");
      input2.type = "url";
      input2.value = value || "";
      input2.placeholder = field.placeholder || "https://";
    } else if (field.type === "number") {
      input2 = el("input");
      input2.type = "number";
      input2.value = value != null ? value : "";
      if (field.min != null) input2.min = String(field.min);
      if (field.max != null) input2.max = String(field.max);
    } else if (field.type === "range") {
      var rangeRow = el("div", "ed-range-row");
      input2 = el("input");
      input2.type = "range";
      input2.min = String(field.min != null ? field.min : 0);
      input2.max = String(field.max != null ? field.max : 100);
      input2.value = String(value != null ? value : 50);
      var val = el("span", "ed-range-val", input2.value);
      input2.addEventListener("input", function () { val.textContent = input2.value; });
      rangeRow.appendChild(input2);
      rangeRow.appendChild(val);
      wrap.appendChild(rangeRow);
      input2.id = "f-" + path.replace(/\./g, "-");
      input2.dataset.path = path;
      input2.dataset.kind = "range";
      return wrap;
    } else if (field.type === "color") {
      var colorRow = el("div", "ed-color-row");
      input2 = el("input");
      input2.type = "color";
      input2.value = /^#[0-9a-fA-F]{6}$/.test(String(value)) ? value : "#C6A46A";
      var hex = el("span", "ed-color-hex", String(value || "").toUpperCase());
      input2.addEventListener("input", function () { hex.textContent = input2.value.toUpperCase(); });
      colorRow.appendChild(input2);
      colorRow.appendChild(hex);
      wrap.appendChild(colorRow);
      input2.id = "f-" + path.replace(/\./g, "-");
      input2.dataset.path = path;
      input2.dataset.kind = "color";
      return wrap;
    } else {
      input2 = el("input");
      input2.type = "text";
      input2.value = value || "";
      if (field.placeholder) input2.placeholder = field.placeholder;
    }

    input2.id = "f-" + path.replace(/\./g, "-");
    input2.dataset.path = path;
    input2.dataset.kind = field.type === "textarea" ? "textarea" : "input";
    if (field.max) input2.maxLength = field.max;

    if ((field.type === "text" || field.type === "textarea") && field.max) {
      var c = withCounter(input2, field.max, path);
      wrap.appendChild(c.wrap);
      wrap.appendChild(c.counter);
    } else {
      wrap.appendChild(input2);
    }

    if (field.hint) wrap.appendChild(el("p", "ed-hint", field.hint));
    return wrap;
  }

  /* ---------- image controls ---------- */

  function buildImages() {
    var wrap = el("div");
    IMAGE_FIELDS.forEach(function (def) {
      wrap.appendChild(buildImageControl(def));
    });
    return wrap;
  }

  function buildImageControl(def) {
    var box = el("div", "ed-imgctl");
    box.dataset.imgPath = def.path;
    var top = el("div", "ed-imgctl-top");
    var img = el("img", "ed-thumb");
    img.src = Data.getPath(state, def.path) || Data.getPath(Data.DEFAULT_INVITATION, def.path) || "";
    img.alt = "";
    var meta = el("div");
    meta.appendChild(el("div", "ed-label", def.label));
    var name = el("div", "ed-imgctl-name", shortSrc(Data.getPath(state, def.path)));
    name.dataset.role = "img-name";
    meta.appendChild(name);
    meta.appendChild(el("div", "ed-hint", def.hint || ""));
    top.appendChild(img);
    top.appendChild(meta);
    box.appendChild(top);

    var actions = el("div", "ed-imgctl-actions");
    var pick = el("button", "mini-btn primary", "Upload photo");
    pick.type = "button";
    pick.dataset.act = "img-pick";
    var reset = el("button", "mini-btn", "Restore default");
    reset.type = "button";
    reset.dataset.act = "img-reset";
    reset.dataset.resetPath = def.path;
    reset.dataset.defaultPath = def.defaults || def.path;
    actions.appendChild(pick);
    if (Data.getPath(Data.DEFAULT_INVITATION, def.path) || def.defaults) actions.appendChild(reset);
    box.appendChild(actions);

    if (def.posPath) {
      var row = el("div", "ed-row");
      row.appendChild(buildGeneric({ type: "text", path: def.posPath, label: def.posLabel || "Position", max: 60, placeholder: "center 30%" }));
      if (def.fitPath) {
        row.appendChild(buildGeneric({ type: "select", path: def.fitPath, label: "Fit", options: ["cover", "contain"] }));
      } else {
        row.appendChild(el("div"));
      }
      box.appendChild(row);
    }
    return box;
  }

  function shortSrc(src) {
    if (!src) return "No image";
    if (/^blob:/.test(src)) return "Uploaded photo (temporary — this browser session)";
    if (/^data:/.test(src)) return "Embedded image data";
    return src;
  }

  function refreshImageControl(path) {
    var box = panelsHost.querySelector('[data-img-path="' + path + '"]');
    if (!box) return;
    var src = Data.getPath(state, path);
    var img = box.querySelector(".ed-thumb");
    if (img) img.src = src || "";
    var name = box.querySelector('[data-role="img-name"]');
    if (name) name.textContent = shortSrc(src);
  }

  /* ---------- list editors ---------- */

  function listShell(field, addLabel) {
    var wrap = el("div", "ed-field");
    wrap.appendChild(el("div", "ed-label", field.label));
    if (field.hint) wrap.appendChild(el("p", "ed-hint", field.hint));
    var list = el("div", "ed-list");
    list.dataset.listPath = field.path;
    wrap.appendChild(list);
    if (addLabel) {
      var actions = el("div", "ed-panel-actions");
      var add = el("button", "mini-btn primary", addLabel);
      add.type = "button";
      add.dataset.listAdd = field.path;
      actions.appendChild(add);
      wrap.appendChild(actions);
    }
    return { wrap: wrap, list: list };
  }

  function buildGalleryList() {
    var shell = listShell({ type: "list-gallery", path: "media.gallery", label: "Gallery photos", hint: "Up to 12 photos · JPG, PNG or WebP." }, "Add photo");
    renderGalleryList(shell.list);
    return shell.wrap;
  }

  function renderGalleryList(list) {
    list.textContent = "";
    var items = state.media.gallery || [];
    if (!items.length) {
      list.appendChild(el("div", "ed-empty", "No photos yet — add your favourite moments."));
      return;
    }
    items.forEach(function (item, index) {
      var row = el("div", "ed-list-item");
      var head = el("div", "ed-list-head");
      var thumb = el("img", "ed-gallery-thumb");
      thumb.src = item.src || "";
      thumb.alt = "";
      head.appendChild(thumb);
      head.appendChild(el("div", "ed-list-title", item.caption || "Photo " + (index + 1)));
      var acts = el("div", "ed-list-actions");
      acts.appendChild(iconBtn("↑", "Move up", "g-up", index));
      acts.appendChild(iconBtn("↓", "Move down", "g-down", index));
      acts.appendChild(iconBtn("✕", "Remove", "g-del", index, true));
      head.appendChild(acts);
      row.appendChild(head);

      var cap = el("div", "ed-field");
      cap.appendChild(el("label", null, "Caption"));
      var capInput = el("input");
      capInput.type = "text";
      capInput.value = item.caption || "";
      capInput.maxLength = 120;
      capInput.dataset.galField = "caption";
      capInput.dataset.galIndex = String(index);
      cap.appendChild(capInput);
      row.appendChild(cap);

      var alt = el("div", "ed-field");
      alt.appendChild(el("label", null, "Alternative text"));
      var altInput = el("input");
      altInput.type = "text";
      altInput.value = item.alt || "";
      altInput.maxLength = 160;
      altInput.dataset.galField = "alt";
      altInput.dataset.galIndex = String(index);
      alt.appendChild(altInput);
      alt.appendChild(el("p", "ed-hint", "Describe the photo for guests using screen readers."));
      row.appendChild(alt);

      var galActs = el("div", "ed-imgctl-actions");
      var rep = el("button", "mini-btn", "Replace photo");
      rep.type = "button";
      rep.dataset.act = "g-replace";
      rep.dataset.galIndex = String(index);
      galActs.appendChild(rep);
      var pos = el("input");
      pos.type = "text";
      pos.placeholder = "Position, e.g. center 30%";
      pos.value = item.position || "center";
      pos.maxLength = 60;
      pos.dataset.galField = "position";
      pos.dataset.galIndex = String(index);
      pos.className = "ed-pos-input";
      pos.style.cssText = "flex:1;min-width:140px;padding:6px 9px;border:1px solid var(--ed-line);border-radius:5px;font-size:11.5px;";
      galActs.appendChild(pos);
      row.appendChild(galActs);

      list.appendChild(row);
    });
  }

  function iconBtn(glyph, title, act, index, danger) {
    var b = el("button", "icon-btn" + (danger ? " danger" : ""), glyph);
    b.type = "button";
    b.title = title;
    b.setAttribute("aria-label", title);
    b.dataset.act = act;
    b.dataset.index = String(index);
    return b;
  }

  function buildMilestones() {
    var shell = listShell({ path: "story.milestones", label: "Story milestones", hint: "Up to 8 moments from your journey." }, "Add milestone");
    renderMilestones(shell.list);
    return shell.wrap;
  }

  function renderMilestones(list) {
    list.textContent = "";
    var items = state.story.milestones || [];
    items.forEach(function (m, index) {
      var row = el("div", "ed-list-item");
      var head = el("div", "ed-list-head");
      head.appendChild(el("div", "ed-list-title", (m.year ? m.year + " · " : "") + (m.title || "Milestone")));
      var acts = el("div", "ed-list-actions");
      acts.appendChild(iconBtn("↑", "Move up", "m-up", index));
      acts.appendChild(iconBtn("↓", "Move down", "m-down", index));
      acts.appendChild(iconBtn("✕", "Remove", "m-del", index, true));
      head.appendChild(acts);
      row.appendChild(head);

      var r1 = el("div", "ed-row");
      r1.appendChild(simpleInput("Year", m.year, 12, "ms-year", index));
      r1.appendChild(simpleInput("Title", m.title, 80, "ms-title", index));
      row.appendChild(r1);
      row.appendChild(simpleInput("Description", m.description, 300, "ms-desc", index, true));
      list.appendChild(row);
    });
    if (!items.length) list.appendChild(el("div", "ed-empty", "No milestones yet."));
  }

  function simpleInput(label, value, max, field, index, textarea) {
    var wrap = el("div", "ed-field");
    wrap.appendChild(el("label", null, label));
    var input = textarea ? el("textarea") : el("input");
    if (!textarea) input.type = "text";
    input.value = value || "";
    input.maxLength = max;
    input.dataset.msField = field;
    input.dataset.msIndex = String(index);
    if (textarea) input.rows = 2;
    wrap.appendChild(input);
    return wrap;
  }

  function buildEvents() {
    var shell = listShell({ path: "event.events", label: "Programme items", hint: "Optional running order shown on the invitation." }, "Add programme item");
    renderEventsList(shell.list);
    return shell.wrap;
  }

  function renderEventsList(list) {
    list.textContent = "";
    var items = state.event.events || [];
    items.forEach(function (ev, index) {
      var row = el("div", "ed-list-item");
      var head = el("div", "ed-list-head");
      head.appendChild(el("div", "ed-list-title", ev.title || "Item " + (index + 1)));
      var acts = el("div", "ed-list-actions");
      acts.appendChild(iconBtn("↑", "Move up", "e-up", index));
      acts.appendChild(iconBtn("↓", "Move down", "e-down", index));
      acts.appendChild(iconBtn("✕", "Remove", "e-del", index, true));
      head.appendChild(acts);
      row.appendChild(head);
      row.appendChild(eventInput("Title", ev.title, 80, "title", index));
      var r = el("div", "ed-row");
      r.appendChild(eventInput("Date label", ev.date, 40, "date", index));
      r.appendChild(eventInput("Time label", ev.time, 40, "time", index));
      row.appendChild(r);
      row.appendChild(eventInput("Note", ev.description, 200, "description", index, true));
      list.appendChild(row);
    });
    if (!items.length) list.appendChild(el("div", "ed-empty", "No programme items."));
  }

  function eventInput(label, value, max, field, index, textarea) {
    var wrap = el("div", "ed-field");
    wrap.appendChild(el("label", null, label));
    var input = textarea ? el("textarea") : el("input");
    if (!textarea) input.type = "text";
    input.value = value || "";
    input.maxLength = max;
    input.dataset.evField = field;
    input.dataset.evIndex = String(index);
    if (textarea) input.rows = 2;
    wrap.appendChild(input);
    return wrap;
  }

  function buildChoices() {
    var shell = listShell({ path: "rsvp.choices", label: "Attendance choices" }, null);
    var chips = el("div", "ed-chips");
    chips.dataset.listPath = "rsvp.choices";
    chips.dataset.chips = "1";
    renderChoices(chips);
    shell.wrap.appendChild(chips);
    var addRow = el("div", "ed-panel-actions");
    var add = el("input");
    add.type = "text";
    add.placeholder = "New choice…";
    add.maxLength = 60;
    add.dataset.choiceAdd = "1";
    add.style.cssText = "flex:1;min-width:140px;padding:8px 10px;border:1px solid var(--ed-line);border-radius:6px;font-size:12px;";
    var btn = el("button", "mini-btn", "Add");
    btn.type = "button";
    btn.dataset.act = "choice-add";
    addRow.appendChild(add);
    addRow.appendChild(btn);
    shell.wrap.appendChild(addRow);
    return shell.wrap;
  }

  function renderChoices(chips) {
    chips.textContent = "";
    (state.rsvp.choices || []).forEach(function (c, i) {
      var chip = el("span", "ed-chip");
      chip.appendChild(document.createTextNode(c));
      var x = el("button", null, "×");
      x.type = "button";
      x.setAttribute("aria-label", "Remove choice");
      x.dataset.act = "choice-del";
      x.dataset.index = String(i);
      chip.appendChild(x);
      chips.appendChild(chip);
    });
  }

  function buildSections() {
    var wrap = el("div");
    var vis = el("div", "ed-field");
    vis.appendChild(el("div", "ed-label", "Show / hide sections"));
    var visList = el("div");
    Object.keys(state.sections.visible).forEach(function (id) {
      var row = el("div", "ed-section-row");
      row.appendChild(el("span", null, SECTION_LABELS[id] || id));
      var label = el("label", "ed-toggle");
      var input = el("input");
      input.type = "checkbox";
      input.checked = !!state.sections.visible[id];
      input.dataset.sectionVis = id;
      input.setAttribute("aria-label", "Show " + (SECTION_LABELS[id] || id));
      label.appendChild(input);
      label.appendChild(el("span", "ed-switch"));
      row.appendChild(label);
      visList.appendChild(row);
    });
    vis.appendChild(visList);
    wrap.appendChild(vis);

    var ord = el("div", "ed-field");
    ord.appendChild(el("div", "ed-label", "Section order"));
    ord.appendChild(el("p", "ed-hint", "Top of the invitation first."));
    var ordList = el("div", "ed-order-list");
    ordList.dataset.listPath = "sections.order";
    renderOrder(ordList);
    ord.appendChild(ordList);
    wrap.appendChild(ord);
    return wrap;
  }

  function renderOrder(list) {
    list.textContent = "";
    state.sections.order.forEach(function (id, i) {
      var row = el("div", "ed-order-item");
      row.appendChild(el("span", "grip", "≡"));
      row.appendChild(el("span", "name", SECTION_LABELS[id] || id));
      var acts = el("div", "ed-list-actions");
      acts.appendChild(iconBtn("↑", "Move up", "o-up", i));
      acts.appendChild(iconBtn("↓", "Move down", "o-down", i));
      row.appendChild(acts);
      list.appendChild(row);
    });
  }

  /* ---------- panels ---------- */

  function buildPanel(panel) {
    var det = el("details", "ed-panel");
    if (panel.open) det.open = true;
    var sum = el("summary");
    var icon = el("span", "ed-panel-icon", panel.icon || "✦");
    sum.appendChild(icon);
    sum.appendChild(document.createTextNode(panel.label));
    det.appendChild(sum);
    var body = el("div", "ed-panel-body");
    panel.fields.forEach(function (field) {
      if (field.type === "images") body.appendChild(buildImages());
      else if (field.type === "list-gallery") body.appendChild(buildGalleryList());
      else if (field.type === "list-milestones") body.appendChild(buildMilestones());
      else if (field.type === "list-events") body.appendChild(buildEvents());
      else if (field.type === "list-choices") body.appendChild(buildChoices());
      else if (field.type === "sections-visible" || field.type === "sections-order") body.appendChild(buildSections());
      else body.appendChild(buildGeneric(field));
    });
    det.appendChild(body);
    return det;
  }

  var sectionsBuilt = false;

  function rebuildPanels() {
    panelsHost.textContent = "";
    PANELS.forEach(function (panel) {
      if (panel.id === "sections" && sectionsBuilt) {
        panelsHost.appendChild(buildPanelSectionsOnly(panel));
      } else {
        panelsHost.appendChild(buildPanel(panel));
      }
    });
    sectionsBuilt = true;
  }

  function buildPanelSectionsOnly(panel) {
    /* Sections panel is rebuilt fully anyway — keep simple */
    return buildPanel(panel);
  }

  /* ---------- input events ---------- */

  function onFieldValue(path, value) {
    Data.setPath(state, path, value);
    if (path.indexOf("sections.") === 0 || path.indexOf("countdown.") === 0 || path.indexOf("envelope.") === 0 || path.indexOf("music.") === 0) {
      /* visibility-ish — still just state + preview */
    }
    applyToPreview();
    markDirty();
  }

  panelsHost.addEventListener("input", function (e) {
    var t = e.target;

    if (t.dataset && t.dataset.galField) {
      var gi = parseInt(t.dataset.galIndex, 10);
      if (state.media.gallery[gi]) {
        state.media.gallery[gi][t.dataset.galField] = t.value;
        applyToPreview();
        markDirty();
        if (t.dataset.galField === "caption") {
          var title = t.closest(".ed-list-item").querySelector(".ed-list-title");
          if (title) title.textContent = t.value || "Photo " + (gi + 1);
        }
      }
      return;
    }
    if (t.dataset && t.dataset.msField) {
      var mi = parseInt(t.dataset.msIndex, 10);
      if (state.story.milestones[mi]) {
        state.story.milestones[mi][t.dataset.msField] = t.value;
        applyToPreview();
        markDirty();
      }
      return;
    }
    if (t.dataset && t.dataset.evField) {
      var ei = parseInt(t.dataset.evIndex, 10);
      if (state.event.events[ei]) {
        state.event.events[ei][t.dataset.evField] = t.value;
        applyToPreview();
        markDirty();
      }
      return;
    }
    if (!t.dataset || !t.dataset.path) return;

    var path = t.dataset.path;
    var kind = t.dataset.kind;
    var value;
    if (kind === "toggle") value = t.checked;
    else if (kind === "range" || t.type === "number") value = t.value === "" ? "" : Number(t.value);
    else value = t.value;

    if (path === "event.date" || path === "event.time" || path === "event.endTime") {
      t.classList.toggle("invalid", value !== "" && !Data.getPath(Data.validate(Data.deepMerge(state, {})).config, path));
    }
    if (path === "event.mapsUrl" || path === "branding.brandUrl") {
      var bad = value && !/^https?:\/\//i.test(String(value));
      t.classList.toggle("invalid", !!bad);
    }
    if (path === "rsvp.contactPhone" || path === "rsvp.whatsappPhone") {
      var digits = String(value || "").replace(/\D/g, "");
      var bad2 = String(value || "").trim() !== "" && (digits.length < 8 || digits.length > 15);
      t.classList.toggle("invalid", bad2);
    }
    onFieldValue(path, value);
  });

  panelsHost.addEventListener("change", function (e) {
    var t = e.target;
    if (t.dataset && t.dataset.path && (t.tagName === "SELECT" || t.type === "date" || t.type === "time" || t.type === "checkbox")) {
      var value = t.type === "checkbox" ? t.checked : t.value;
      onFieldValue(t.dataset.path, value);
    }
    if (t.dataset && t.dataset.sectionVis) {
      state.sections.visible[t.dataset.sectionVis] = t.checked;
      applyToPreview();
      markDirty();
    }
  });

  panelsHost.addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (!btn) return;
    var act = btn.dataset.act;

    if (btn.dataset.act === "img-pick") {
      var box = btn.closest("[data-img-path]");
      if (!box) return;
      var path = box.dataset.imgPath;
      pickImage(function (url) {
        setMediaUrl(path, url);
        refreshImageControl(path);
        applyToPreview();
        markDirty();
        toast("Photo applied to the preview.");
      });
      return;
    }
    if (act === "img-reset") {
      resetMedia(btn.dataset.resetPath, btn.dataset.defaultPath);
      refreshImageControl(btn.dataset.resetPath);
      applyToPreview();
      markDirty();
      toast("Default photo restored.");
      return;
    }

    if (btn.dataset.listAdd === "media.gallery") {
      if ((state.media.gallery || []).length >= Data.MAX_GALLERY) {
        toast("Gallery is limited to " + Data.MAX_GALLERY + " photos.", "warn");
        return;
      }
      pickImage(function (url, file) {
        state.media.gallery.push({
          id: Data.newId("g"),
          src: url,
          caption: "",
          alt: file && file.name ? file.name.replace(/\.[a-z0-9]+$/i, "").slice(0, 80) : "Wedding photo",
          position: "center"
        });
        renderGalleryList(panelsHost.querySelector('[data-list-path="media.gallery"]'));
        applyToPreview();
        markDirty();
        toast("Photo added to the gallery.");
      });
      return;
    }
    if (btn.dataset.listAdd === "story.milestones") {
      if ((state.story.milestones || []).length >= Data.MAX_MILESTONES) {
        toast("Up to " + Data.MAX_MILESTONES + " milestones.", "warn");
        return;
      }
      state.story.milestones.push({ id: Data.newId("m"), year: "", title: "New milestone", description: "" });
      renderMilestones(panelsHost.querySelector('[data-list-path="story.milestones"]'));
      applyToPreview();
      markDirty();
      return;
    }
    if (btn.dataset.listAdd === "event.events") {
      if ((state.event.events || []).length >= 10) {
        toast("Up to 10 programme items.", "warn");
        return;
      }
      state.event.events.push({ id: Data.newId("e"), title: "New item", date: "", time: "", venue: "", description: "" });
      renderEventsList(panelsHost.querySelector('[data-list-path="event.events"]'));
      applyToPreview();
      markDirty();
      return;
    }

    if (act && act.indexOf("g-") === 0) {
      var gi = parseInt(btn.dataset.index || btn.dataset.galIndex, 10);
      var gal = state.media.gallery;
      if (act === "g-up" && gi > 0) {
        var tmp = gal[gi]; gal[gi] = gal[gi - 1]; gal[gi - 1] = tmp;
      } else if (act === "g-down" && gi < gal.length - 1) {
        var tmp2 = gal[gi]; gal[gi] = gal[gi + 1]; gal[gi + 1] = tmp2;
      } else if (act === "g-del") {
        var removed = gal.splice(gi, 1)[0];
        if (removed && removed.src && objectUrls["gallery-" + removed.id] === removed.src) {
          try { URL.revokeObjectURL(removed.src); } catch (err) { /* ignore */ }
        }
      } else if (act === "g-replace") {
        (function (index) {
          pickImage(function (url) {
            var item = state.media.gallery[index];
            if (item) {
              if (/^blob:/.test(item.src)) { try { URL.revokeObjectURL(item.src); } catch (err) { /* ignore */ } }
              item.src = url;
              renderGalleryList(panelsHost.querySelector('[data-list-path="media.gallery"]'));
              applyToPreview();
              markDirty();
              toast("Gallery photo replaced.");
            }
          });
        })(gi);
        return;
      }
      renderGalleryList(panelsHost.querySelector('[data-list-path="media.gallery"]'));
      applyToPreview();
      markDirty();
      return;
    }

    if (act === "choice-add") {
      var input = panelsHost.querySelector("[data-choice-add]");
      var val = Data.safeText(input.value, 60);
      if (!val) return;
      if ((state.rsvp.choices || []).length >= 6) { toast("Up to 6 choices.", "warn"); return; }
      state.rsvp.choices.push(val);
      input.value = "";
      renderChoices(panelsHost.querySelector('[data-chips="1"]'));
      applyToPreview();
      markDirty();
      return;
    }
    if (act === "choice-del") {
      state.rsvp.choices.splice(parseInt(btn.dataset.index, 10), 1);
      if (!state.rsvp.choices.length) state.rsvp.choices = ["Joyfully accepts"];
      renderChoices(panelsHost.querySelector('[data-chips="1"]'));
      applyToPreview();
      markDirty();
      return;
    }

    if (act === "m-up" || act === "m-down" || act === "m-del") {
      var mi2 = parseInt(btn.dataset.index, 10);
      var ms = state.story.milestones;
      if (act === "m-up" && mi2 > 0) { var t3 = ms[mi2]; ms[mi2] = ms[mi2 - 1]; ms[mi2 - 1] = t3; }
      else if (act === "m-down" && mi2 < ms.length - 1) { var t4 = ms[mi2]; ms[mi2] = ms[mi2 + 1]; ms[mi2 + 1] = t4; }
      else if (act === "m-del") ms.splice(mi2, 1);
      renderMilestones(panelsHost.querySelector('[data-list-path="story.milestones"]'));
      applyToPreview();
      markDirty();
      return;
    }

    if (act === "e-up" || act === "e-down" || act === "e-del") {
      var ei2 = parseInt(btn.dataset.index, 10);
      var evs = state.event.events;
      if (act === "e-up" && ei2 > 0) { var t5 = evs[ei2]; evs[ei2] = evs[ei2 - 1]; evs[ei2 - 1] = t5; }
      else if (act === "e-down" && ei2 < evs.length - 1) { var t6 = evs[ei2]; evs[ei2] = evs[ei2 + 1]; evs[ei2 + 1] = t6; }
      else if (act === "e-del") evs.splice(ei2, 1);
      renderEventsList(panelsHost.querySelector('[data-list-path="event.events"]'));
      applyToPreview();
      markDirty();
      return;
    }

    if (act === "o-up" || act === "o-down") {
      var oi = parseInt(btn.dataset.index, 10);
      var ord = state.sections.order;
      if (act === "o-up" && oi > 0) { var t7 = ord[oi]; ord[oi] = ord[oi - 1]; ord[oi - 1] = t7; }
      else if (act === "o-down" && oi < ord.length - 1) { var t8 = ord[oi]; ord[oi] = ord[oi + 1]; ord[oi + 1] = t8; }
      renderOrder(panelsHost.querySelector('[data-list-path="sections.order"]'));
      applyToPreview();
      markDirty();
      return;
    }

    if (btn.dataset.act === "reset-theme") {
      var themeDefaults = Data.DEFAULT_INVITATION.theme;
      Object.keys(themeDefaults).forEach(function (k) {
        state.theme[k] = themeDefaults[k];
      });
      rebuildPanels();
      applyToPreview();
      markDirty();
      toast("Theme reset to the Luxury Ivory defaults.");
      return;
    }
  });

  /* ---------- toolbar ---------- */

  function bind(id, handler) {
    var b = document.getElementById(id);
    if (b) b.addEventListener("click", handler);
  }

  bind("btn-undo", undo);
  bind("btn-redo", redo);
  bind("btn-save", function () { saveDraft(false); });

  bind("btn-export", function () {
    var json = Data.serialize(state);
    var blob = new Blob([json], { type: "application/json;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "luxury-ivory-reception-invitation.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    toast("Configuration exported as JSON.");
  });

  bind("btn-import", function () {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.addEventListener("change", function () {
      var f = input.files && input.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        var result = Data.parseImport(String(reader.result || ""));
        if (!result.ok) {
          toast(result.errors[0] || "That file could not be imported.", "error");
          return;
        }
        var warn = el("p", null, "Replace the current draft with the imported configuration? Your current draft will be overwritten (you can still undo).");
        showModal("Import configuration?", [warn], [
          { label: "Cancel" },
          {
            label: "Import", primary: true, onClick: function () {
              revokeAllUrls();
              state = result.config;
              rebuildPanels();
              applyToPreview();
              markDirty();
              toast("Configuration imported." + (result.errors.length ? " (" + result.errors.length + " field warning(s))" : ""));
            }
          }
        ]);
      };
      reader.readAsText(f);
    });
    input.click();
  });

  bind("btn-reset", function () {
    var p1 = el("p", null, "Reset the invitation back to the original Luxury Ivory Reception demo? This clears your local draft and cannot be undone.");
    showModal("Reset to demo?", [p1], [
      { label: "Cancel" },
      {
        label: "Reset everything", primary: true, onClick: function () {
          revokeAllUrls();
          Data.clearDraft();
          state = Data.clone(Data.DEFAULT_INVITATION);
          history = [];
          hIndex = -1;
          rebuildPanels();
          applyToPreview();
          pushHistory();
          setStatus("idle");
          toast("Template reset to the demo content.");
        }
      }
    ]);
  });

  bind("btn-publish", function () {
    var p1 = el("p", null, "This preview studio saves a draft in your browser. A real public invitation is created after purchase and publishing on Mehfill.in — no live URL is generated from this demo alone.");
    var p2 = el("p");
    p2.appendChild(document.createTextNode("Next steps: export your configuration for safekeeping, then complete checkout on "));
    var a = el("a", null, "Mehfill.in/templates");
    a.href = "https://mehfill.in/templates";
    a.target = "_blank";
    a.rel = "noopener";
    p2.appendChild(a);
    p2.appendChild(document.createTextNode(" to publish your invitation at a shareable link."));
    showModal("Preview & share", [p1, p2], [
      { label: "Export JSON", onClick: function () { document.getElementById("btn-export").click(); } },
      { label: "Continue on Mehfill.in", primary: true, onClick: function () { window.open("https://mehfill.in/templates", "_blank", "noopener"); } }
    ]);
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-device]"), function (btn) {
    btn.addEventListener("click", function () {
      Array.prototype.forEach.call(document.querySelectorAll("[data-device]"), function (b) {
        b.classList.toggle("is-on", b === btn);
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      deviceEl.classList.toggle("mode-mobile", btn.dataset.device === "mobile");
      deviceEl.classList.toggle("mode-desktop", btn.dataset.device !== "mobile");
    });
  });

  /* mobile drawer */
  var fab = document.getElementById("sidebar-toggle");
  function setDrawer(open) {
    if (!sidebar) return;
    sidebar.classList.toggle("open", open);
    if (scrim) scrim.hidden = !open;
    if (fab) fab.setAttribute("aria-expanded", open ? "true" : "false");
  }
  if (fab) fab.addEventListener("click", function () { setDrawer(!sidebar.classList.contains("open")); });
  if (scrim) scrim.addEventListener("click", function () { setDrawer(false); });

  document.addEventListener("keydown", function (e) {
    var tag = (e.target && e.target.tagName) || "";
    var typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !typing) {
      e.preventDefault();
      if (e.shiftKey) redo(); else undo();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y" && !typing) {
      e.preventDefault();
      redo();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      saveDraft(false);
    }
  });

  /* ---------- boot ---------- */

  function boot() {
    var draft = Data.loadDraft();
    state = draft || Data.clone(Data.DEFAULT_INVITATION);
    state = Data.validate(state).config;
    rebuildPanels();
    history = [snapshot()];
    hIndex = 0;
    updateUndoRedo();
    applyToPreview();
    setStatus(draft ? "saved" : "idle");
    if (draft) toast("Local draft restored. Publish on Mehfill.in to make it live.");
    window.addEventListener("beforeunload", function () {
      if (statusEl && statusEl.classList.contains("is-dirty")) saveDraft(true);
    });
  }

  boot();
})();
