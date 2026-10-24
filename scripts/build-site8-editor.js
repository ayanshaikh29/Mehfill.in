const fs = require('fs');
const path = require('path');

const editorHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Mehfill.in · Invitation Customization Studio</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
  :root {
    --bg-dark: #141312;
    --bg-sidebar: #1d1b19;
    --bg-card: #262421;
    --bg-input: #171615;
    --border: #38332c;
    --border-light: #4a443b;
    --gold: #d4af37;
    --gold-light: #f3e5ab;
    --gold-hover: #b8972e;
    --text-primary: #f5f2eb;
    --text-secondary: #b5ad9e;
    --text-muted: #7d7568;
    --success: #4ade80;
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
    --transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Montserrat', -apple-system, sans-serif;
    background: var(--bg-dark);
    color: var(--text-primary);
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    font-size: 13px;
  }

  /* TOP TOOLBAR */
  .toolbar {
    height: 58px;
    background: var(--bg-sidebar);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    flex-shrink: 0;
    z-index: 10;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .brand-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--gold-light);
    text-transform: uppercase;
  }
  .brand-badge {
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    background: rgba(212,175,55,0.15);
    color: var(--gold);
    border: 1px solid rgba(212,175,55,0.3);
    padding: 3px 8px;
    border-radius: 999px;
  }
  .toolbar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .btn {
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text-primary);
    transition: var(--transition);
  }
  .btn:hover {
    background: #322f2b;
    border-color: var(--border-light);
    color: #fff;
  }
  .btn-gold {
    background: linear-gradient(135deg, #d4af37, #aa820a);
    border: none;
    color: #120e03;
    font-weight: 600;
  }
  .btn-gold:hover {
    background: linear-gradient(135deg, #e5c158, #c69b1e);
    color: #000;
  }
  .btn-icon {
    padding: 7px 9px;
  }
  .save-status {
    font-size: 11px;
    color: var(--text-muted);
    margin-right: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--success);
    box-shadow: 0 0 6px rgba(74,222,128,0.5);
  }

  /* MAIN WORKSPACE */
  .workspace {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  /* SIDEBAR */
  .sidebar {
    width: 440px;
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    overflow: hidden;
  }

  /* TABS NAV */
  .tabs-nav {
    display: flex;
    background: var(--bg-dark);
    border-bottom: 1px solid var(--border);
    overflow-x: auto;
    scrollbar-width: none;
    flex-shrink: 0;
  }
  .tabs-nav::-webkit-scrollbar { display: none; }
  .tab-btn {
    flex: 1;
    min-width: 60px;
    padding: 12px 6px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--text-muted);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    cursor: pointer;
    text-align: center;
    transition: var(--transition);
    white-space: nowrap;
  }
  .tab-btn:hover {
    color: var(--text-secondary);
  }
  .tab-btn.active {
    color: var(--gold);
    border-bottom-color: var(--gold);
    background: rgba(212,175,55,0.04);
  }

  /* TABS CONTENT */
  .tabs-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }
  .tab-panel {
    display: none;
  }
  .tab-panel.active {
    display: block;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* FORM CONTROLS */
  .form-group {
    margin-bottom: 16px;
  }
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }
  .help-hint {
    font-size: 10px;
    color: var(--text-muted);
    margin-top: 4px;
    line-height: 1.4;
  }
  input[type="text"],
  input[type="date"],
  input[type="time"],
  input[type="tel"],
  input[type="url"],
  textarea,
  select {
    width: 100%;
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    padding: 9px 12px;
    font-size: 13px;
    font-family: inherit;
    transition: var(--transition);
    outline: none;
  }
  input:focus, textarea:focus, select:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 2px rgba(212,175,55,0.15);
  }
  textarea {
    resize: vertical;
    min-height: 70px;
  }

  /* PREVIEW CANVAS */
  .canvas-container {
    flex: 1;
    background: #0d0c0a;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .canvas-bar {
    height: 44px;
    background: var(--bg-sidebar);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    flex-shrink: 0;
  }
  .view-modes {
    display: flex;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 2px;
    gap: 2px;
  }
  .view-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;
    cursor: pointer;
    transition: var(--transition);
  }
  .view-btn.active {
    background: var(--bg-input);
    color: var(--gold);
    font-weight: 600;
  }
  .canvas-stage {
    flex: 1;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    position: relative;
    background: radial-gradient(circle at center, #1a1816 0%, #0d0c0a 100%);
  }
  .device-mockup {
    transition: var(--transition);
    background: #000;
    box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06);
    position: relative;
    overflow: hidden;
  }
  .device-mockup.mobile {
    width: 390px;
    height: 780px;
    border-radius: 44px;
    border: 10px solid #2a2723;
  }
  .device-mockup.desktop {
    width: 100%;
    height: 100%;
    max-width: 1180px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
  }
  .device-iframe {
    width: 100%;
    height: 100%;
    border: none;
    background: #f8f3ea;
  }

  /* COLOR SWATCHES & PICKERS */
  .color-picker-row {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 6px 10px;
    margin-bottom: 10px;
  }
  .color-swatch-input {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    background: transparent;
  }
  .color-label {
    flex: 1;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-primary);
  }
  .color-hex {
    font-size: 11px;
    color: var(--text-muted);
    font-family: monospace;
  }

  /* SECTION TOGGLE SWITCH */
  .switch-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    margin-bottom: 8px;
  }
  .switch-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-primary);
  }
  .switch {
    position: relative;
    display: inline-block;
    width: 36px;
    height: 20px;
  }
  .switch input { opacity: 0; width: 0; height: 0; }
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: #38332c;
    transition: .2s;
    border-radius: 20px;
  }
  .slider:before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .2s;
    border-radius: 50%;
  }
  input:checked + .slider { background-color: var(--gold); }
  input:checked + .slider:before { transform: translateX(16px); }

  /* GALLERY CARDS */
  .gallery-item-card {
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px;
    margin-bottom: 10px;
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .gallery-thumb {
    width: 50px;
    height: 50px;
    border-radius: 4px;
    object-fit: cover;
    background: #000;
  }
  .gallery-fields {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  /* NOTICE BANNER */
  .notice-box {
    background: rgba(212,175,55,0.08);
    border: 1px solid rgba(212,175,55,0.25);
    border-radius: var(--radius-md);
    padding: 12px 14px;
    margin-bottom: 18px;
  }
  .notice-title {
    color: var(--gold-light);
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .notice-desc {
    color: var(--text-secondary);
    font-size: 11px;
    line-height: 1.4;
  }
</style>
</head>
<body>

<header class="toolbar">
  <div class="brand">
    <div class="brand-logo">Mehfill.in</div>
    <div class="brand-badge">Template 08 Studio</div>
  </div>

  <div class="toolbar-actions">
    <div class="save-status">
      <span class="status-dot"></span>
      <span id="saveText">Saved to local session</span>
    </div>
    <button class="btn btn-icon" id="btnUndo" title="Undo (Ctrl+Z)">↶</button>
    <button class="btn btn-icon" id="btnRedo" title="Redo (Ctrl+Y)">↷</button>
    <button class="btn" id="btnReset">Reset Demo</button>
    <button class="btn" id="btnExport">Export JSON</button>
    <button class="btn" id="btnImport">Import JSON</button>
    <input type="file" id="importFileInput" accept=".json" style="display:none;" />
    <button class="btn btn-gold" id="btnPublish">Preview Fullscreen</button>
  </div>
</header>

<main class="workspace">
  <!-- SIDEBAR CONTROLS -->
  <aside class="sidebar">
    <nav class="tabs-nav">
      <button class="tab-btn active" data-tab="tab-couple">Couple</button>
      <button class="tab-btn" data-tab="tab-event">Reception</button>
      <button class="tab-btn" data-tab="tab-story">Story</button>
      <button class="tab-btn" data-tab="tab-gallery">Gallery</button>
      <button class="tab-btn" data-tab="tab-quote">Quote</button>
      <button class="tab-btn" data-tab="tab-theme">Theme</button>
      <button class="tab-btn" data-tab="tab-sections">Sections</button>
      <button class="tab-btn" data-tab="tab-rsvp">RSVP</button>
    </nav>

    <div class="tabs-content">
      <!-- TAB: COUPLE -->
      <div class="tab-panel active" id="tab-couple">
        <div class="notice-box">
          <div class="notice-title">Couple & Monogram Identity</div>
          <div class="notice-desc">Names update the hero section, letter opening, story, footer, and automated monogram across the invitation.</div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Groom First Name</label>
            <input type="text" id="groomName" value="Aarav" />
          </div>
          <div class="form-group">
            <label>Bride First Name</label>
            <input type="text" id="brideName" value="Kiara" />
          </div>
        </div>

        <div class="form-group">
          <label>Full Names / Tagline (Optional)</label>
          <input type="text" id="coupleSubtitle" value="Aarav Mehta & Kiara Sharma" />
          <div class="help-hint">Displayed under the main couple headline in the hero</div>
        </div>

        <div class="form-group">
          <label>Custom Monogram (Optional)</label>
          <input type="text" id="monogramText" value="A · K" />
          <div class="help-hint">Leave blank to auto-generate from first initials (e.g. A · K)</div>
        </div>

        <div class="form-group">
          <label>Hero Portrait Image URL</label>
          <input type="url" id="heroPhoto" value="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80" />
          <div class="help-hint">Direct link to high-res portrait (vertical portrait works best)</div>
        </div>
      </div>

      <!-- TAB: RECEPTION -->
      <div class="tab-panel" id="tab-event">
        <div class="form-group">
          <label>Event Title</label>
          <input type="text" id="eventTitle" value="Wedding Reception" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Date</label>
            <input type="text" id="eventDate" value="Sunday, 15 November 2026" />
          </div>
          <div class="form-group">
            <label>ISO Date (For Countdown & Calendar)</label>
            <input type="text" id="eventIsoDate" value="2026-11-15T19:00:00" />
            <div class="help-hint">Format: YYYY-MM-DDTHH:MM:SS</div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Time</label>
            <input type="text" id="eventTime" value="7:00 PM Onwards" />
          </div>
          <div class="form-group">
            <label>Dress Code</label>
            <input type="text" id="eventDress" value="Black Tie / Traditional Elegance" />
          </div>
        </div>

        <div class="form-group">
          <label>Venue Name</label>
          <input type="text" id="venueName" value="The Grand Orchid Palace" />
        </div>

        <div class="form-group">
          <label>Venue Sub-location / Hall</label>
          <input type="text" id="venueHall" value="The Royal Ballroom, Level 2" />
        </div>

        <div class="form-group">
          <label>Full Address / City</label>
          <textarea id="venueAddress">Golf Club Road, Anadvali, Nashik, Maharashtra 422002</textarea>
        </div>

        <div class="form-group">
          <label>Google Maps Directions URL</label>
          <input type="url" id="mapsUrl" value="https://maps.google.com/?q=The+Grand+Orchid+Palace+Nashik" />
        </div>
      </div>

      <!-- TAB: STORY -->
      <div class="tab-panel" id="tab-story">
        <div class="notice-box">
          <div class="notice-title">Our Story Timeline</div>
          <div class="notice-desc">Customize the 3 signature story cards highlighting your journey.</div>
        </div>

        <!-- Story 1 -->
        <div style="border: 1px solid var(--border); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 12px;">
          <div class="form-group">
            <label>Chapter 1 — Tagline</label>
            <input type="text" id="story1Tag" value="The First Glance · 2020" />
          </div>
          <div class="form-group">
            <label>Chapter 1 — Title</label>
            <input type="text" id="story1Title" value="A serendipitous meeting in Mumbai" />
          </div>
          <div class="form-group">
            <label>Chapter 1 — Narrative</label>
            <textarea id="story1Text">What began over a quiet cup of filter coffee on a rainy monsoon afternoon soon blossomed into endless midnight conversations.</textarea>
          </div>
        </div>

        <!-- Story 2 -->
        <div style="border: 1px solid var(--border); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 12px;">
          <div class="form-group">
            <label>Chapter 2 — Tagline</label>
            <input type="text" id="story2Tag" value="The Journey · 2023" />
          </div>
          <div class="form-group">
            <label>Chapter 2 — Title</label>
            <input type="text" id="story2Title" value="Travels, shared laughter & quiet sunsets" />
          </div>
          <div class="form-group">
            <label>Chapter 2 — Narrative</label>
            <textarea id="story2Text">From coastal escapes in Goa to high mountain roads, every shared horizon proved we were each other's home.</textarea>
          </div>
        </div>

        <!-- Story 3 -->
        <div style="border: 1px solid var(--border); padding: 12px; border-radius: var(--radius-sm);">
          <div class="form-group">
            <label>Chapter 3 — Tagline</label>
            <input type="text" id="story3Tag" value="The Promise · 2025" />
          </div>
          <div class="form-group">
            <label>Chapter 3 — Title</label>
            <input type="text" id="story3Title" value="Under the starlit skies of Udaipur" />
          </div>
          <div class="form-group">
            <label>Chapter 3 — Narrative</label>
            <textarea id="story3Text">With quiet reverence and full hearts, a heartfelt question was asked — and with happy tears, the easiest 'Yes' was given.</textarea>
          </div>
        </div>
      </div>

      <!-- TAB: GALLERY -->
      <div class="tab-panel" id="tab-gallery">
        <div class="notice-box">
          <div class="notice-title">Moments Gallery</div>
          <div class="notice-desc">Set photo URLs and captions for the 5 interactive gallery tiles.</div>
        </div>

        <div id="galleryContainer"></div>
      </div>

      <!-- TAB: QUOTE -->
      <div class="tab-panel" id="tab-quote">
        <div class="form-group">
          <label>Inspirational Wedding Quote</label>
          <textarea id="quoteText">"Whatever our souls are made of, his and mine are the same."</textarea>
        </div>
        <div class="form-group">
          <label>Quote Attribution / Author</label>
          <input type="text" id="quoteAuthor" value="— Emily Brontë" />
        </div>
      </div>

      <!-- TAB: THEME -->
      <div class="tab-panel" id="tab-theme">
        <div class="notice-box">
          <div class="notice-title">Luxury Color Palette Customization</div>
          <div class="notice-desc">Fine-tune the custom CSS variables to match your personal wedding palette.</div>
        </div>

        <div class="color-picker-row">
          <input type="color" class="color-swatch-input" id="colorIvory" value="#f8f3ea" />
          <div class="color-label">Primary Ivory Background</div>
          <div class="color-hex" id="hexIvory">#F8F3EA</div>
        </div>

        <div class="color-picker-row">
          <input type="color" class="color-swatch-input" id="colorGold" value="#c6a46a" />
          <div class="color-label">Champagne Gold Accent</div>
          <div class="color-hex" id="hexGold">#C6A46A</div>
        </div>

        <div class="color-picker-row">
          <input type="color" class="color-swatch-input" id="colorGoldDark" value="#a68148" />
          <div class="color-label">Deep Gold Hover</div>
          <div class="color-hex" id="hexGoldDark">#A68148</div>
        </div>

        <div class="color-picker-row">
          <input type="color" class="color-swatch-input" id="colorEspresso" value="#30251f" />
          <div class="color-label">Espresso Ink / Text</div>
          <div class="color-hex" id="hexEspresso">#30251F</div>
        </div>

        <div class="color-picker-row">
          <input type="color" class="color-swatch-input" id="colorBlush" value="#ead5cc" />
          <div class="color-label">Soft Blush Subtle Card</div>
          <div class="color-hex" id="hexBlush">#EAD5CC</div>
        </div>
      </div>

      <!-- TAB: SECTIONS -->
      <div class="tab-panel" id="tab-sections">
        <div class="notice-box">
          <div class="notice-title">Section Visibility</div>
          <div class="notice-desc">Show or hide entire invitation sections to tailor the experience.</div>
        </div>

        <div class="switch-row">
          <div class="switch-label">Envelope Opening Animation</div>
          <label class="switch">
            <input type="checkbox" id="secEnvelope" checked />
            <span class="slider"></span>
          </label>
        </div>

        <div class="switch-row">
          <div class="switch-label">Our Story Timeline</div>
          <label class="switch">
            <input type="checkbox" id="secStory" checked />
            <span class="slider"></span>
          </label>
        </div>

        <div class="switch-row">
          <div class="switch-label">Countdown Clock</div>
          <label class="switch">
            <input type="checkbox" id="secCountdown" checked />
            <span class="slider"></span>
          </label>
        </div>

        <div class="switch-row">
          <div class="switch-label">Moments Photo Gallery</div>
          <label class="switch">
            <input type="checkbox" id="secGallery" checked />
            <span class="slider"></span>
          </label>
        </div>

        <div class="switch-row">
          <div class="switch-label">Romantic Quote Feature</div>
          <label class="switch">
            <input type="checkbox" id="secQuote" checked />
            <span class="slider"></span>
          </label>
        </div>

        <div class="switch-row">
          <div class="switch-label">Interactive Map Section</div>
          <label class="switch">
            <input type="checkbox" id="secMap" checked />
            <span class="slider"></span>
          </label>
        </div>

        <div class="switch-row">
          <div class="switch-label">RSVP Form & WhatsApp</div>
          <label class="switch">
            <input type="checkbox" id="secRsvp" checked />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <!-- TAB: RSVP -->
      <div class="tab-panel" id="tab-rsvp">
        <div class="notice-box">
          <div class="notice-title">RSVP & WhatsApp Integration</div>
          <div class="notice-desc">When guests RSVP, confirmation sends directly to this WhatsApp contact.</div>
        </div>

        <div class="form-group">
          <label>Host WhatsApp Number (With Country Code)</label>
          <input type="tel" id="whatsappPhone" value="919876543210" />
          <div class="help-hint">E.g., 919876543210 without '+' or dashes</div>
        </div>

        <div class="form-group">
          <label>RSVP Deadline Date</label>
          <input type="text" id="rsvpDeadline" value="1 November 2026" />
        </div>

        <div class="form-group">
          <label>Host Contact Name</label>
          <input type="text" id="rsvpContactName" value="Mehta & Sharma Families" />
        </div>
      </div>
    </div>
  </aside>

  <!-- PREVIEW CANVAS -->
  <section class="canvas-container">
    <div class="canvas-bar">
      <div class="view-modes">
        <button class="view-btn active" id="btnViewMobile">Mobile iPhone</button>
        <button class="view-btn" id="btnViewDesktop">Desktop 16:9</button>
      </div>
      <div style="font-size: 11px; color: var(--text-muted);">
        Interactive Live Preview (Changes reflect immediately)
      </div>
    </div>

    <div class="canvas-stage">
      <div class="device-mockup mobile" id="deviceMockup">
        <iframe class="device-iframe" id="previewIframe" src="index.html"></iframe>
      </div>
    </div>
  </section>
</main>

<script>
(function() {
  // DEFAULT STATE
  const DEFAULT_STATE = {
    groomName: "Aarav",
    brideName: "Kiara",
    coupleSubtitle: "Aarav Mehta & Kiara Sharma",
    monogramText: "A · K",
    heroPhoto: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80",
    eventTitle: "Wedding Reception",
    eventDate: "Sunday, 15 November 2026",
    eventIsoDate: "2026-11-15T19:00:00",
    eventTime: "7:00 PM Onwards",
    eventDress: "Black Tie / Traditional Elegance",
    venueName: "The Grand Orchid Palace",
    venueHall: "The Royal Ballroom, Level 2",
    venueAddress: "Golf Club Road, Anadvali, Nashik, Maharashtra 422002",
    mapsUrl: "https://maps.google.com/?q=The+Grand+Orchid+Palace+Nashik",
    story1Tag: "The First Glance · 2020",
    story1Title: "A serendipitous meeting in Mumbai",
    story1Text: "What began over a quiet cup of filter coffee on a rainy monsoon afternoon soon blossomed into endless midnight conversations.",
    story2Tag: "The Journey · 2023",
    story2Title: "Travels, shared laughter & quiet sunsets",
    story2Text: "From coastal escapes in Goa to high mountain roads, every shared horizon proved we were each other's home.",
    story3Tag: "The Promise · 2025",
    story3Title: "Under the starlit skies of Udaipur",
    story3Text: "With quiet reverence and full hearts, a heartfelt question was asked — and with happy tears, the easiest 'Yes' was given.",
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
        caption: "Golden hour celebrations"
      },
      {
        url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
        caption: "A quiet promise forever"
      },
      {
        url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
        caption: "Surrounded by florals"
      },
      {
        url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
        caption: "Laughter in every step"
      },
      {
        url: "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=800&q=80",
        caption: "The beginning of always"
      }
    ],
    quoteText: '"Whatever our souls are made of, his and mine are the same."',
    quoteAuthor: "— Emily Brontë",
    colors: {
      ivory: "#f8f3ea",
      gold: "#c6a46a",
      goldDark: "#a68148",
      espresso: "#30251f",
      blush: "#ead5cc"
    },
    sections: {
      secEnvelope: true,
      secStory: true,
      secCountdown: true,
      secGallery: true,
      secQuote: true,
      secMap: true,
      secRsvp: true
    },
    whatsappPhone: "919876543210",
    rsvpDeadline: "1 November 2026",
    rsvpContactName: "Mehta & Sharma Families"
  };

  let state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  let historyStack = [];
  let redoStack = [];

  // TABS NAVIGATION
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId)?.classList.add('active');
    });
  });

  // DEVICE VIEW MODES
  const btnMobile = document.getElementById('btnViewMobile');
  const btnDesktop = document.getElementById('btnViewDesktop');
  const mockup = document.getElementById('deviceMockup');

  btnMobile.addEventListener('click', () => {
    btnMobile.classList.add('active');
    btnDesktop.classList.remove('active');
    mockup.className = 'device-mockup mobile';
  });
  btnDesktop.addEventListener('click', () => {
    btnDesktop.classList.add('active');
    btnMobile.classList.remove('active');
    mockup.className = 'device-mockup desktop';
  });

  // RENDER GALLERY FIELDS IN SIDEBAR
  const galleryContainer = document.getElementById('galleryContainer');
  function renderGalleryFields() {
    galleryContainer.innerHTML = '';
    state.gallery.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'gallery-item-card';
      card.innerHTML = 
        '<img class="gallery-thumb" src="' + item.url + '" onerror="this.src=\\'https://placehold.co/100x100?text=Photo\\'" />' +
        '<div class="gallery-fields">' +
          '<input type="url" data-gidx="' + idx + '" class="gallery-url-input" value="' + item.url + '" placeholder="Photo URL" />' +
          '<input type="text" data-gidx="' + idx + '" class="gallery-cap-input" value="' + item.caption + '" placeholder="Caption" />' +
        '</div>';
      galleryContainer.appendChild(card);
    });

    galleryContainer.querySelectorAll('.gallery-url-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const i = e.target.getAttribute('data-gidx');
        state.gallery[i].url = e.target.value;
        const thumb = e.target.closest('.gallery-item-card').querySelector('.gallery-thumb');
        if (thumb) thumb.src = e.target.value;
        pushHistoryAndSync();
      });
    });

    galleryContainer.querySelectorAll('.gallery-cap-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const i = e.target.getAttribute('data-gidx');
        state.gallery[i].caption = e.target.value;
        pushHistoryAndSync();
      });
    });
  }

  // SYNC STATE TO FORM INPUTS
  function syncStateToInputs() {
    const scalarFields = [
      'groomName','brideName','coupleSubtitle','monogramText','heroPhoto',
      'eventTitle','eventDate','eventIsoDate','eventTime','eventDress',
      'venueName','venueHall','venueAddress','mapsUrl',
      'story1Tag','story1Title','story1Text',
      'story2Tag','story2Title','story2Text',
      'story3Tag','story3Title','story3Text',
      'quoteText','quoteAuthor',
      'whatsappPhone','rsvpDeadline','rsvpContactName'
    ];
    scalarFields.forEach(id => {
      const el = document.getElementById(id);
      if (el && state[id] !== undefined) el.value = state[id];
    });

    // Theme Colors
    if (state.colors) {
      document.getElementById('colorIvory').value = state.colors.ivory;
      document.getElementById('hexIvory').textContent = state.colors.ivory.toUpperCase();
      document.getElementById('colorGold').value = state.colors.gold;
      document.getElementById('hexGold').textContent = state.colors.gold.toUpperCase();
      document.getElementById('colorGoldDark').value = state.colors.goldDark;
      document.getElementById('hexGoldDark').textContent = state.colors.goldDark.toUpperCase();
      document.getElementById('colorEspresso').value = state.colors.espresso;
      document.getElementById('hexEspresso').textContent = state.colors.espresso.toUpperCase();
      document.getElementById('colorBlush').value = state.colors.blush;
      document.getElementById('hexBlush').textContent = state.colors.blush.toUpperCase();
    }

    // Section toggles
    if (state.sections) {
      Object.keys(state.sections).forEach(key => {
        const el = document.getElementById(key);
        if (el) el.checked = state.sections[key];
      });
    }

    renderGalleryFields();
  }

  // UPDATE IFRAME PREVIEW
  const iframe = document.getElementById('previewIframe');
  function updateIframe() {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      if (!doc || !doc.body) return;

      // 1. Couple Names & Monogram
      const g = state.groomName || 'Aarav';
      const b = state.brideName || 'Kiara';
      const mono = state.monogramText || (g.charAt(0) + ' · ' + b.charAt(0));

      // Monogram anchors
      doc.querySelectorAll('.env-seal span, .hero-monogram, .closing-monogram').forEach(el => {
        el.textContent = mono;
      });

      // Split names (Hero & Envelope)
      doc.querySelectorAll('.hero-title, .closing-couple').forEach(el => {
        el.innerHTML = '<span class="n1">' + g + '</span><em class="amp">&amp;</em><span class="n2">' + b + '</span>';
      });
      doc.querySelectorAll('.env-couple').forEach(el => {
        el.innerHTML = g + '<em>&amp;</em>' + b;
      });

      // Hero portrait
      const portraitImg = doc.querySelector('.hero-portrait-frame img, .hero-portrait img');
      if (portraitImg && state.heroPhoto) {
        portraitImg.src = state.heroPhoto;
      }

      // Event details
      const dateEl = doc.querySelector('.detail-date, .event-date');
      if (dateEl) dateEl.textContent = state.eventDate;

      const timeEl = doc.querySelector('.detail-time, .event-time');
      if (timeEl) timeEl.textContent = state.eventTime;

      const dressEl = doc.querySelector('.detail-dress, .event-dress');
      if (dressEl) dressEl.textContent = state.eventDress;

      const venueNameEl = doc.querySelector('.detail-venue-name, .venue-title');
      if (venueNameEl) venueNameEl.textContent = state.venueName;

      const venueHallEl = doc.querySelector('.detail-venue-hall');
      if (venueHallEl) venueHallEl.textContent = state.venueHall;

      const venueAddrEl = doc.querySelector('.detail-venue-address');
      if (venueAddrEl) venueAddrEl.textContent = state.venueAddress;

      // Directions Map Link
      const mapsBtn = doc.querySelector('.btn-directions, .map-btn');
      if (mapsBtn && state.mapsUrl) {
        mapsBtn.href = state.mapsUrl;
      }

      // Story Cards
      const storyCards = doc.querySelectorAll('.story-card');
      if (storyCards[0]) {
        const tag = storyCards[0].querySelector('.story-tag');
        const h3 = storyCards[0].querySelector('h3');
        const p = storyCards[0].querySelector('p');
        if (tag) tag.textContent = state.story1Tag;
        if (h3) h3.textContent = state.story1Title;
        if (p) p.textContent = state.story1Text;
      }
      if (storyCards[1]) {
        const tag = storyCards[1].querySelector('.story-tag');
        const h3 = storyCards[1].querySelector('h3');
        const p = storyCards[1].querySelector('p');
        if (tag) tag.textContent = state.story2Tag;
        if (h3) h3.textContent = state.story2Title;
        if (p) p.textContent = state.story2Text;
      }
      if (storyCards[2]) {
        const tag = storyCards[2].querySelector('.story-tag');
        const h3 = storyCards[2].querySelector('h3');
        const p = storyCards[2].querySelector('p');
        if (tag) tag.textContent = state.story3Tag;
        if (h3) h3.textContent = state.story3Title;
        if (p) p.textContent = state.story3Text;
      }

      // Gallery Images
      const galleryItems = doc.querySelectorAll('.gallery-tile, .gallery-item');
      state.gallery.forEach((gItem, idx) => {
        if (galleryItems[idx]) {
          const img = galleryItems[idx].querySelector('img');
          const cap = galleryItems[idx].querySelector('.tile-caption, .gallery-caption');
          if (img && gItem.url) img.src = gItem.url;
          if (cap && gItem.caption) cap.textContent = gItem.caption;
        }
      });

      // Quote
      const quoteEl = doc.querySelector('.quote-blockquote p, .wedding-quote blockquote');
      if (quoteEl) quoteEl.textContent = state.quoteText;
      const authorEl = doc.querySelector('.quote-author, .quote-attribution');
      if (authorEl) authorEl.textContent = state.quoteAuthor;

      // CSS Custom Properties for Colors
      if (state.colors) {
        doc.documentElement.style.setProperty('--ivory', state.colors.ivory);
        doc.documentElement.style.setProperty('--gold', state.colors.gold);
        doc.documentElement.style.setProperty('--gold-dark', state.colors.goldDark);
        doc.documentElement.style.setProperty('--espresso', state.colors.espresso);
        doc.documentElement.style.setProperty('--blush', state.colors.blush);
      }

      // Sections Visibility
      if (state.sections) {
        const secMap = {
          secEnvelope: doc.getElementById('envelope'),
          secStory: doc.getElementById('story') || doc.querySelector('.section-story'),
          secCountdown: doc.getElementById('countdown') || doc.querySelector('.section-countdown'),
          secGallery: doc.getElementById('gallery') || doc.querySelector('.section-gallery'),
          secQuote: doc.getElementById('quote') || doc.querySelector('.section-quote'),
          secMap: doc.getElementById('location') || doc.querySelector('.section-location'),
          secRsvp: doc.getElementById('rsvp') || doc.querySelector('.section-rsvp')
        };
        Object.keys(state.sections).forEach(key => {
          const el = secMap[key];
          if (el) {
            el.style.display = state.sections[key] ? '' : 'none';
          }
        });
      }

      // Save to localStorage
      localStorage.setItem('mehfill_site8_config', JSON.stringify(state));
    } catch (err) {
      console.warn("Live preview iframe sync error:", err);
    }
  }

  iframe.addEventListener('load', () => {
    updateIframe();
  });

  // HISTORY & STATE MANAGEMENT
  function pushHistoryAndSync() {
    historyStack.push(JSON.stringify(state));
    if (historyStack.length > 50) historyStack.shift();
    redoStack = [];
    updateIframe();
  }

  // INPUT LISTENERS
  const scalarFields = [
    'groomName','brideName','coupleSubtitle','monogramText','heroPhoto',
    'eventTitle','eventDate','eventIsoDate','eventTime','eventDress',
    'venueName','venueHall','venueAddress','mapsUrl',
    'story1Tag','story1Title','story1Text',
    'story2Tag','story2Title','story2Text',
    'story3Tag','story3Title','story3Text',
    'quoteText','quoteAuthor',
    'whatsappPhone','rsvpDeadline','rsvpContactName'
  ];
  scalarFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', (e) => {
        state[id] = e.target.value;
        pushHistoryAndSync();
      });
    }
  });

  // COLOR LISTENERS
  const colorMap = [
    { input: 'colorIvory', hex: 'hexIvory', key: 'ivory' },
    { input: 'colorGold', hex: 'hexGold', key: 'gold' },
    { input: 'colorGoldDark', hex: 'hexGoldDark', key: 'goldDark' },
    { input: 'colorEspresso', hex: 'hexEspresso', key: 'espresso' },
    { input: 'colorBlush', hex: 'hexBlush', key: 'blush' }
  ];
  colorMap.forEach(c => {
    const el = document.getElementById(c.input);
    const hexEl = document.getElementById(c.hex);
    if (el) {
      el.addEventListener('input', (e) => {
        state.colors[c.key] = e.target.value;
        if (hexEl) hexEl.textContent = e.target.value.toUpperCase();
        pushHistoryAndSync();
      });
    }
  });

  // SECTION SWITCH LISTENERS
  ['secEnvelope','secStory','secCountdown','secGallery','secQuote','secMap','secRsvp'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', (e) => {
        state.sections[id] = e.target.checked;
        pushHistoryAndSync();
      });
    }
  });

  // UNDO / REDO
  document.getElementById('btnUndo').addEventListener('click', () => {
    if (historyStack.length > 0) {
      redoStack.push(JSON.stringify(state));
      const prev = historyStack.pop();
      state = JSON.parse(prev);
      syncStateToInputs();
      updateIframe();
    }
  });

  document.getElementById('btnRedo').addEventListener('click', () => {
    if (redoStack.length > 0) {
      historyStack.push(JSON.stringify(state));
      const next = redoStack.pop();
      state = JSON.parse(next);
      syncStateToInputs();
      updateIframe();
    }
  });

  // RESET DEMO
  document.getElementById('btnReset').addEventListener('click', () => {
    if (confirm("Reset invitation customizations back to original demo values?")) {
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      syncStateToInputs();
      pushHistoryAndSync();
      localStorage.removeItem('mehfill_site8_config');
    }
  });

  // EXPORT JSON
  document.getElementById('btnExport').addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", "mehfill-wedding-invitation-config.json");
    dl.click();
  });

  // IMPORT JSON
  const importInput = document.getElementById('importFileInput');
  document.getElementById('btnImport').addEventListener('click', () => {
    importInput.click();
  });
  importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        state = Object.assign({}, DEFAULT_STATE, imported);
        syncStateToInputs();
        pushHistoryAndSync();
        alert("Configuration imported successfully!");
      } catch (err) {
        alert("Invalid JSON configuration file: " + err.message);
      }
    };
    reader.readAsText(file);
  });

  // PREVIEW FULLSCREEN
  document.getElementById('btnPublish').addEventListener('click', () => {
    window.open('index.html', '_blank');
  });

  // INITIAL LOAD FROM LOCALSTORAGE
  const saved = localStorage.getItem('mehfill_site8_config');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state = Object.assign({}, DEFAULT_STATE, parsed);
    } catch(e) {}
  }

  syncStateToInputs();
})();
</script>

</body>
</html>
`;

const dest = path.join(process.cwd(), 'public', 'site-8', 'editor.html');
fs.writeFileSync(dest, editorHtml, 'utf8');
console.log('SUCCESS: Written', dest, 'size:', fs.statSync(dest).size);
