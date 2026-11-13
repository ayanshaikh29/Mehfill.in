// Personalisation engine — the core fix.
//
// A customer's published invitation MUST be the exact original template they
// selected (site-N), with only their content swapped in. This module reads the
// original static HTML (+ external script when present), rewrites asset paths so
// they load from /site-N/, and performs *targeted string replacement* of the
// known demo anchors (names, date, venue, gallery, maps, countdown target) with
// the customer's saved data. Layout, CSS, animations, scratch cards, countdown
// mechanics, gallery masonry and every section stay byte-for-byte identical —
// only the content strings change. No generic re-skin is ever generated.

import { promises as fs } from "fs";
import path from "path";
import { getBinding, type TemplateBinding } from "./bindings";
import type { InvitationContent, InvitationEvent, LoveStoryMilestone } from "@/lib/invitation";
import { deriveInitials } from "@/lib/initials";
import {
  MONTHS_EN,
  dateTokenPairs,
  formatTime12 as fmtTime12,
  isValidCalendarDate,
  parseCalendarDate,
  type TokenPair,
} from "./date-format";

const PUBLIC_DIR = path.join(process.cwd(), "public");

// Cache raw template files so repeated renders don't hit disk each time.
const fileCache = new Map<string, string>();
async function readTemplateFile(siteDir: string, file: string): Promise<string> {
  const key = `${siteDir}/${file}`;
  if (fileCache.has(key)) return fileCache.get(key)!;
  const abs = path.join(PUBLIC_DIR, siteDir, file);
  const raw = await fs.readFile(abs, "utf8");
  fileCache.set(key, raw);
  return raw;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Escape a value for safe insertion inside a double-quoted JS string literal. */
function escJs(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/<\//g, "<\\/");
}

/** Cleanly remove a matching section/element block from HTML without leaving broken artifacts */
function cleanOmit(html: string, pattern: RegExp): string {
  return html.replace(pattern, "");
}

/** JSON.stringify safe for inline <script> blocks — escapes `<` so payloads
 *  cannot break out of the script element or inject markup. */
function jsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

/** "Saturday · 20 December 2026" — matches template "·"-separated style. */
function formatWeekdayDotDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  const weekday = d.toLocaleDateString("en-IN", { weekday: "long" });
  const dmy = d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  return `${weekday} · ${dmy}`;
}

function weekdayOf(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { weekday: "long" });
}

function formatDotted(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d} . ${m} . ${y}`;
}

function formatDottedTight(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d} · ${m} · ${y}`;
}

function formatDayMonthYear(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function formatTime12(t?: string): string {
  if (!t) return "";
  const [hRaw, m] = t.split(":");
  let h = Number(hRaw);
  if (Number.isNaN(h)) return t;
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m || "00"} ${suffix}`;
}

// Couple initials ALWAYS derive from the saved names (bride first). The
// optional manual `content.initials` field is only consulted when the names
// are blank — a stale saved value must never override the real names.
function initialsOf(bride: string, groom: string, provided?: string): string {
  const derived = deriveInitials(bride, groom);
  if (derived.combined) return derived.combined;
  // Ignore stale demo defaults like "A & Z" or "A · Z" if passed in provided
  const prov = (provided || "").trim();
  if (/^[a-z]\s*(?:&|·|\||♡)\s*[a-z]$/i.test(prov) && /^a\s*(&|·)\s*z$/i.test(prov)) {
    return "";
  }
  return prov;
}

function buildMapsQuery(venueName: string, venueAddress: string, mapsUrl?: string): string {
  if (mapsUrl && /^https?:\/\//.test(mapsUrl)) return mapsUrl;
  const q = [venueName, venueAddress].filter(Boolean).join(" ").trim();
  if (!q) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function buildMapsEmbed(venueName: string, venueAddress: string): string {
  const q = [venueName, venueAddress].filter(Boolean).join(" ").trim();
  if (!q) return "";
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
}

// Replace every occurrence of each demo anchor with the customer value.
// Values are HTML-escaped to prevent stored XSS via names/venue fields.
// Longer anchors are replaced FIRST so "Amit & Siya" is consumed before the
// bare "Amit" / "Siya" anchors can double-substitute inside it.
function replaceAnchors(html: string, anchors: string[], value: string): string {
  let out = html;
  const safe = esc(value);
  const ordered = [...anchors].filter(Boolean).sort((a, b) => b.length - a.length);
  for (const a of ordered) {
    // Split-span anchors (contain markup) are replaced verbatim.
    if (a.includes("<")) {
      out = out.split(a).join(safe);
      continue;
    }
    // Plain text anchors: replace both raw and &amp;-escaped forms.
    const amp = a.replace(/&/g, "&amp;");
    out = out.split(a).join(safe);
    out = out.split(amp).join(safe);
  }
  return out;
}

// Rewrite a couple monogram anchor ("A · Z", "A&nbsp;|&nbsp;M",
// "A <span>|</span> M", "A  ♡  M", "A · M ✦") with the CUSTOMER's bride-first initials
// while preserving the template's own separator/marker markup between them.
// Unicode letters are detected; the middle (separator, spans, entities) and tail
// stay byte-for-byte identical.
function replaceInitialsAnchors(html: string, anchors: string[], bi: string, gi: string): string {
  let out = html;
  const ordered = [...new Set(anchors.filter(Boolean))].sort((a, b) => b.length - a.length);
  for (const a of ordered) {
    // Match leading spaces, first initial letter, separator (greedily matching across
    // tags/entities like <span>|</span>), second initial letter, and trailing non-letters (like ✦).
    const m = a.match(/^(\s*)(\p{L})([\s\S]*)(\p{L})([^\p{L}]*)$/u);
    let value = "";
    if (m) {
      const leading = m[1] || "";
      const sep = m[3] || " & ";
      const tail = m[5] || "";
      if (bi && gi) {
        value = `${leading}${esc(bi)}${sep}${esc(gi)}${tail}`;
      } else if (bi || gi) {
        value = `${leading}${esc(bi || gi)}${tail}`;
      } else {
        value = "";
      }
    } else {
      value = bi && gi ? `${esc(bi)} & ${esc(gi)}` : esc(bi || gi || "");
    }

    out = out.split(a).join(value);
    const amp = a.replace(/&/g, "&amp;");
    if (amp !== a) out = out.split(amp).join(value);
    if (a.includes("&nbsp;")) {
      const decoded = a.replace(/&nbsp;/g, "\u00A0");
      out = out.split(decoded).join(value);
      const nbspAmp = a.replace(/&nbsp;/g, "&amp;nbsp;");
      if (nbspAmp !== a) out = out.split(nbspAmp).join(value);
    }
  }
  return out;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Apply demo→customer token pairs, longest form first so full dates are
 *  consumed before bare month/weekday tokens. `word` pairs only match on word
 *  boundaries so a bare "May" can never hit part of another word. */
function applyTokenPairs(html: string, pairs: TokenPair[]): string {
  const ordered = pairs
    .filter((p) => p.from && p.to && p.from !== p.to)
    .sort(
      (a, b) =>
        Math.max(b.from.length, b.to.length) - Math.max(a.from.length, a.to.length)
    );
  let out = html;
  for (const p of ordered) {
    // \b boundaries only work for pure-ASCII word tokens ("May", "Mon").
    // Urdu month/weekday names (and mixed pairs) fall back to plain
    // split/join — JS \b is defined over [A-Za-z0-9_] so "پیر" never matches.
    const asciiWords =
      p.word &&
      /^[A-Za-z0-9_]+$/.test(p.from) &&
      /^[A-Za-z0-9_]+$/.test(p.to);
    if (asciiWords) {
      out = out.replace(new RegExp(`\\b${escapeRe(p.from)}\\b`, "g"), () => p.to);
    } else {
      out = out.split(p.from).join(p.to);
      const amp = p.from.replace(/&/g, "&amp;");
      if (amp !== p.from) out = out.split(amp).join(p.to);
    }
  }
  return out;
}

/** Rewrite every display form of the template's demo date (long, short,
 *  dotted, uppercase, weekday composites, Urdu, YYYYMMDD calendar stamps,
 *  strings inside inlined scripts) to the customer's saved wedding date. */
function replaceDemoDateTokens(html: string, binding: TemplateBinding, customerIso: string): string {
  if (!binding.demoDateISO || !isValidCalendarDate(customerIso)) return html;
  return applyTokenPairs(html, dateTokenPairs(binding.demoDateISO, customerIso));
}

/** Same rewrite for inlined SCRIPT text — but skips bare month/weekday word
 *  tokens: sites 6/7 carry `var MONTHS = ['January', …]` arrays (and site-8's
 *  renderer carries WEEKDAYS) that must never be rewritten. Full date forms
 *  ("31 August 2026", "See you on Aug 31") are still rewritten. */
function replaceDemoDateTokensInScript(
  html: string,
  binding: TemplateBinding,
  customerIso: string
): string {
  if (!binding.demoDateISO || !isValidCalendarDate(customerIso)) return html;
  return applyTokenPairs(
    html,
    dateTokenPairs(binding.demoDateISO, customerIso).filter((p) => !p.word)
  );
}

/** Rewrite demo clock times ("7:00 PM", "11 AM", "صبح 10:30 بجے") to the
 *  saved start time. Runs before any customer value is inserted. */
function replaceDemoTimeTokens(html: string, startTime?: string): string {
  if (!startTime || !/^\d{1,2}:\d{2}$/.test(startTime)) return html;
  const t12 = fmtTime12(startTime);
  if (!t12) return html;
  let out = html.replace(/\b\d{1,2}(?::\d{2})?\s*(?:AM|PM)\b/gi, () => t12);
  const hour = Number(startTime.split(":")[0]);
  const urPrefix = hour >= 12 ? "شام" : "صبح";
  out = out.replace(
    /(?:صبح|شام|رات)\s*\d{1,2}(?::\d{2})?\s*بجے/g,
    `${urPrefix} ${t12} بجے`
  );
  return out;
}

/** The bilingual templates (sites 1 & 2) carry personal data inside
 *  data-en / data-ur attributes. Dates/times/weekdays in data-ur are handled
 *  by the token layer; names, venues and cities have no Urdu equivalent we
 *  can fabricate, so when the English side carries a personal token we mirror
 *  the corrected English value into data-ur — the guest then sees the real
 *  customer data instead of the demo couple. */
function mirrorBilingualPersonalData(
  html: string,
  binding: TemplateBinding,
  vals: { bride: string; groom: string; coupleLabel: string; andLabel: string; venue: string; city: string }
): string {
  const tokens = [
    ...(binding.andNameAnchors || []),
    ...(binding.coupleAnchors || []),
    ...(binding.brideAnchors || []),
    ...(binding.groomAnchors || []),
    ...(binding.demoVenues || []),
    ...(binding.demoCities || []),
  ].filter(Boolean);
  if (!tokens.length) return html;

  return html.replace(/data-en="([^"]*)"(\s+data-ur="([^"]*)")/g, (match, en: string) => {
    if (!tokens.some((t) => en.includes(t))) return match;
    let next = en;
    if (vals.andLabel) next = replaceAnchors(next, binding.andNameAnchors || [], vals.andLabel);
    if (vals.coupleLabel) next = replaceAnchors(next, binding.coupleAnchors || [], vals.coupleLabel);
    if (vals.bride) next = replaceAnchors(next, binding.brideAnchors || [], vals.bride);
    if (vals.groom) next = replaceAnchors(next, binding.groomAnchors || [], vals.groom);
    if (vals.venue) next = replaceAnchors(next, binding.demoVenues || [], vals.venue);
    if (vals.city) next = replaceAnchors(next, binding.demoCities || [], vals.city);
    if (next === en) return match;
    return `data-en="${next}" data-ur="${next}"`;
  });
}

/** Split scratch-card date cells (day / month / year in separate elements). */
function replaceDateCells(html: string, binding: TemplateBinding, customerIso: string): string {
  if (!binding.dateCells?.length || !isValidCalendarDate(customerIso)) return html;
  const c = parseCalendarDate(customerIso)!;
  let out = html;
  for (const cell of binding.dateCells) {
    const value =
      cell.part === "day" ? String(c.d) : cell.part === "month" ? MONTHS_EN[c.m - 1] : String(c.y);
    const re = new RegExp(
      `(<([a-z0-9]+)[^>]*\\bclass="[^"]*\\b${escapeRe(cell.cls)}\\b[^"]*"[^>]*>)([\\s\\S]*?)(</\\2>)`,
      "gi"
    );
    let i = 0;
    out = out.replace(re, (m, open: string) => {
      const current = i++;
      if (cell.nth !== undefined && current !== cell.nth) return m;
      const tagMatch = /^<([a-z0-9]+)/.exec(open);
      const close = tagMatch ? `</${tagMatch[1]}>` : "</p>";
      return `${open}${esc(value)}${close}`;
    });
  }
  return out;
}

/** Google Calendar buttons carry the demo couple, demo venue and a demo
 *  UTC window. Rewrite the date window from the saved date + start time and
 *  the encoded text/details/location fields from the customer's data. */
function patchCalendarLinks(html: string, binding: TemplateBinding, content: InvitationContent): string {
  const c = parseCalendarDate(content.weddingDate);
  if (!c) return html;

  const enc = (s: string) => s.replace(/&/g, "%26").replace(/ /g, "+");
  const enc20 = (s: string) => s.replace(/&/g, "%26").replace(/ /g, "%20");

  return html.replace(/href="https:\/\/calendar\.google\.com\/[^"]*"/g, (tag) => {
    let out = tag;

    const dm = /dates=(\d{8})T(\d{2})(\d{2})(\d{2})Z\/(\d{8})T(\d{2})(\d{2})(\d{2})Z/.exec(out);
    if (dm) {
      const startUTC = Date.UTC(
        Number(dm[1].slice(0, 4)), Number(dm[1].slice(4, 6)) - 1, Number(dm[1].slice(6, 8)),
        Number(dm[2]), Number(dm[3]), Number(dm[4])
      );
      const endUTC = Date.UTC(
        Number(dm[5].slice(0, 4)), Number(dm[5].slice(4, 6)) - 1, Number(dm[5].slice(6, 8)),
        Number(dm[6]), Number(dm[7]), Number(dm[8])
      );
      const duration = Math.max(endUTC - startUTC, 60 * 60 * 1000);
      // The template's demo window is IST (+05:30); keep the same local clock
      // unless the customer supplied their own start time.
      let localH: number;
      let localM: number;
      const validStart = content.startTime && /^\d{1,2}:\d{2}$/.test(content.startTime)
        ? content.startTime
        : null;
      if (validStart) {
        const [h, m] = validStart.split(":").map(Number);
        localH = h;
        localM = m;
      } else {
        const demoLocal = new Date(startUTC + 5.5 * 60 * 60 * 1000);
        localH = demoLocal.getUTCHours();
        localM = demoLocal.getUTCMinutes();
      }
      const newStart = Date.UTC(c.y, c.m - 1, c.d, localH, localM) - 5.5 * 60 * 60 * 1000;
      const stamp = (ms: number) => {
        const d = new Date(ms);
        const p = (n: number) => String(n).padStart(2, "0");
        return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
      };
      out = out.replace(/dates=[^&"]*/, `dates=${stamp(newStart)}/${stamp(newStart + duration)}`);
    }

    // Encoded personal tokens in text=/details=/location=.
    const couple = [content.brideName, content.groomName].filter((n) => n && n.trim()).join(" & ");
    const swap = (demo: string | undefined, value: string) => {
      if (!demo || !value) return;
      for (const form of [enc(demo), enc20(demo)]) {
        if (form && out.includes(form)) out = out.split(form).join(enc(value));
      }
    };
    for (const a of binding.andNameAnchors || []) swap(a, couple ? couple.replace(" & ", " and ") : "");
    for (const a of binding.coupleAnchors || []) swap(a, couple);
    if (content.venueName) for (const v of binding.demoVenues || []) swap(v, content.venueName);
    if (content.venueAddress) for (const city of binding.demoCities || []) swap(city, content.venueAddress);

    return out;
  });
}

// Rewrite relative asset references so they resolve from /site-N/ when the
// personalised page is served at /i/<slug>.
function rewriteAssetPaths(html: string, siteDir: string): string {
  return html.replace(
    /(src|href)="((?!http|\/\/|#|mailto|tel|data:)[^"]+)"/g,
    (match, attr: string, url: string) => {
      // Leave pure anchors / already-absolute alone.
      if (url.startsWith("/")) return match;
      return `${attr}="/${siteDir}/${url}"`;
    }
  );
}

// Inline an external script.js with the demo countdown target swapped for the
// customer's wedding date+time, so the countdown mechanics stay identical.
function patchScript(script: string, content: InvitationContent): string {
  let out = script;
  if (content.weddingDate) {
    const [y, m, d] = content.weddingDate.split("-");
    const time = content.startTime && /^\d{2}:\d{2}$/.test(content.startTime)
      ? content.startTime + ":00"
      : "19:00:00";
    const iso = `${y}-${m}-${d}T${time}+05:30`;
    // Replace any countdown-style new Date('...') target.
    out = out.replace(/new Date\('(\d{4}-\d{2}-\d{2}[^']*)'\)/g, () => `new Date('${iso}')`);
  }
  return out;
}

/** First word of venue address / venue name — used for marquee "Nashik" slots. */
function cityWord(content: InvitationContent): string {
  const src = (content.venueAddress || content.venueName || "").trim();
  if (!src) return "";
  return src.split(/[\s,]+/)[0];
}

// ── Event list rebuilders (preserve each template's exact markup) ────────────

function validEvents(events: InvitationEvent[] | undefined): InvitationEvent[] {
  return (events || []).filter((e) => e && e.name && String(e.name).trim());
}

function rebuildTimeline(html: string, events: InvitationEvent[]): string {
  const named = validEvents(events);
  if (!named.length) {
    // No customer events — never leave the demo timeline behind.
    return html.replace(/<ol class="timeline">[\s\S]*?<\/ol>/, `<ol class="timeline"></ol>`);
  }
  const items = named
    .map((e) => {
      const time = formatTime12(e.time) || (e.time ? esc(e.time) : "");
      const shortDate = e.date
        ? new Date(e.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })
        : "";
      const right = [shortDate, time].filter(Boolean).join(" · ");
      return `<li><span class="t">${esc(e.name)}</span><span class="dot"></span><span class="h">${esc(right)}</span></li>`;
    })
    .join("\n      ");
  return html.replace(
    /<ol class="timeline">[\s\S]*?<\/ol>/,
    `<ol class="timeline">\n      ${items}\n    </ol>`
  );
}

function rebuildEventCards(html: string, events: InvitationEvent[]): string {
  const named = validEvents(events);
  if (!named.length) {
    return html.replace(
      /(<div class="events">)[\s\S]*?(<\/div>\s*<!--|<\/div>\s*<div class="dress-strip"|<\/div>\s*<\/section>)/,
      (match, open: string, close: string) => `${open}${close}`
    );
  }
  const cards = named
    .map((e, i) => {
      const when = [
        e.date ? formatDayMonthYear(e.date) : "",
        e.time ? formatTime12(e.time) : "",
      ].filter(Boolean).join(" · ");
      const featured = i === 0 ? " featured" : "";
      const ribbon = i === 0 ? `<div class="event-ribbon">Main Event</div>` : "";
      const desc = e.description ? esc(e.description) : "";
      const venueLine = e.venue ? esc(e.venue) : "";
      return `<article class="event-card${featured}">
        ${ribbon}
        <div class="event-emoji">💍</div>
        <h4>${esc(e.name)}</h4>
        <p class="event-when">${esc(when)}</p>
        ${venueLine ? `<p>${venueLine}</p>` : ""}
        ${desc ? `<p>${desc}</p>` : ""}
      </article>`;
    })
    .join("\n      ");
  return html.replace(
    /(<div class="events">)[\s\S]*?(<\/div>\s*<!--|<\/div>\s*<div class="dress-strip"|<\/div>\s*<\/section>)/,
    (match, open: string, close: string) => `${open}\n      ${cards}\n    ${close}`
  );
}

function rebuildEvCards(html: string, events: InvitationEvent[]): string {
  const named = validEvents(events);
  if (!named.length) {
    return html.replace(
      /(<div class="events">)[\s\S]*?(<\/div>\s*<\/section>)/,
      (match, open: string, close: string) => `${open}${close}`
    );
  }
  const corners = `<span class="ev-corner tl"></span><span class="ev-corner tr"></span><span class="ev-corner bl"></span><span class="ev-corner br"></span>`;
  const cards = named
    .map((e, i) => {
      const when = [
        e.date ? formatDayMonthYear(e.date) : "",
        e.time ? formatTime12(e.time) : "",
      ].filter(Boolean).join(" · ");
      const main = i === 0 ? " main" : "";
      const star = i === 0 ? `<span class="ev-star">★ Main</span>` : "";
      const q = encodeURIComponent([e.venue, content_venue_default()].filter(Boolean).join(" "));
      return `<article class="ev-card reveal rv-up${main}">
        ${corners}
        ${star}
        <p class="ev-tag">Day ${["One", "Two", "Three", "Four", "Five", "Six", "Seven"][i] || i + 1}</p>
        <h4>${esc(e.name)}</h4>
        <p class="ev-date">${esc(when)}</p>
        ${e.venue ? `<p class="ev-venue">${esc(e.venue)}</p>` : ""}
        ${e.description ? `<p class="ev-note">${esc(e.description)}</p>` : ""}
        <a class="ev-link" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${q}">View map <span>→</span></a>
      </article>`;
    })
    .join("\n      ");
  return html.replace(
    /(<div class="events">)[\s\S]*?(<\/div>\s*<\/section>)/,
    (match, open: string, close: string) => `${open}\n      ${cards}\n    ${close}`
  );
}

function content_venue_default(): string {
  return "";
}

function rebuildErows(html: string, events: InvitationEvent[]): string {
  const named = validEvents(events);
  if (!named.length) {
    return html.replace(
      /(<div class="elist">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/section>)/,
      (match, open: string, close: string) => `${open}${close}`
    );
  }
  const rows = named
    .map((e, i) => {
      const day = e.date ? String(new Date(e.date + "T00:00:00").getDate()) : "";
      const monTime = [
        e.date
          ? new Date(e.date + "T00:00:00").toLocaleDateString("en-IN", { month: "short" })
          : "",
        e.time ? formatTime12(e.time).replace(":00", "") : "",
      ].filter(Boolean).join(" · ");
      const side = i % 2 === 0 ? "rv-left" : "rv-right";
      const body = [
        e.venue ? esc(e.venue) : "",
        e.description ? esc(e.description) : "",
      ].filter(Boolean).join(" — ");
      const q = encodeURIComponent(e.venue || e.name);
      return `<article class="erow reveal ${side}">
          <div class="erow-date"><span>${esc(day)}</span><small>${esc(monTime)}</small></div>
          <div class="erow-body"><h3>${esc(e.name)}</h3>${body ? `<p>${body}</p>` : ""}<a target="_blank" rel="noopener" href="https://maps.google.com/?q=${q}">Location <span>→</span></a></div>
        </article>`;
    })
    .join("\n        ");
  return html.replace(
    /(<div class="elist">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/section>)/,
    (match, open: string, close: string) => `${open}\n        ${rows}\n      ${close}`
  );
}

function rebuildMiniRows(html: string, events: InvitationEvent[]): string {
  const named = validEvents(events);
  if (!named.length) {
    return html.replace(
      /(<div class="mini-list">)[\s\S]*?(<\/div>\s*<p class="dress)/,
      (match, open: string, close: string) => `${open}${close}`
    );
  }
  const rows = named
    .map((e, i) => {
      const d = e.date ? new Date(e.date + "T00:00:00") : null;
      const day = d ? String(d.getDate()) : "";
      const mon = d ? d.toLocaleDateString("en-IN", { month: "short" }) : "";
      const weekday = d ? d.toLocaleDateString("en-IN", { weekday: "short" }) : "";
      const time = e.time ? formatTime12(e.time).replace(":00", "") : "";
      const main = i === 0 ? " main" : "";
      const glow = i === 0 ? " glow" : "";
      const tagCls = i === 0 ? "tag" : "tag gold";
      const q = encodeURIComponent(e.venue || e.name);
      const meta = [weekday, time, e.venue].filter(Boolean).join(" · ");
      return `<div class="mini-row reveal rv-left d${i + 1}${main}">
        <div class="mini-date${glow}"><b>${esc(day)}</b><span>${esc(mon)}</span></div>
        <div class="mini-body">
          <span class="${tagCls}"><span>${esc(e.name)}</span></span>
          <h4>${esc(e.name)}</h4>
          <p>${esc(meta)}</p>
          <a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${q}">View map →</a>
        </div>
      </div>`;
    })
    .join("\n      ");
  return html.replace(
    /(<div class="mini-list">)[\s\S]*?(<\/div>\s*<p class="dress)/,
    (match, open: string, close: string) => `${open}\n      ${rows}\n    ${close}`
  );
}

/** site-3 keeps content in `var wedding = { groom: '…', bride: '…', … }`
 *  (lowercase, single-quoted). Patch names/date/venue/city/countdown target. */
function patchSite3Wedding(html: string, content: InvitationContent): string {
  if (!html.includes("var wedding")) return html;
  let out = html;
  const setSq = (key: string, value: string) => {
    const re = new RegExp(`(\\b${key}:\\s*')([^']*)(')`);
    out = out.replace(re, (_m, a: string, _b: string, c: string) => `${a}${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}${c}`);
  };
  if (content.brideName) setSq("bride", content.brideName);
  if (content.groomName) setSq("groom", content.groomName);
  if (content.weddingDate) {
    const [y, m, d] = content.weddingDate.split("-");
    const time = content.startTime && /^\d{2}:\d{2}$/.test(content.startTime) ? content.startTime : "19:00";
    setSq("date", formatDayMonthYear(content.weddingDate));
    out = out.replace(/new Date\('(\d{4}-\d{2}-\d{2}[^']*)'\)/g, () => `new Date('${y}-${m}-${d}T${time}:00')`);
  }
  if (content.venueName) setSq("venue", content.venueName);
  if (content.venueAddress) setSq("city", content.venueAddress.split(/[\s,]+/)[0] || content.venueAddress);
  return out;
}

/**
 * site-6/7 keep all content in a `var WEDDING = { … }` config at the top of
 * script.js (or inlined). Patching that object in-place is the most reliable
 * way to swap names, date, venue, events, gallery and music while every
 * animation and render function stays byte-identical.
 */
function patchWeddingConfig(html: string, content: InvitationContent, musicUrl?: string): string {
  if (!html.includes("var WEDDING")) return html;
  let out = html;
  const setField = (key: string, value: string) => {
    const re = new RegExp(`(\\b${key}:\\s*")([^"]*)(")`);
    out = out.replace(re, (_m, a: string, _b: string, c: string) => `${a}${escJs(value)}${c}`);
  };

  if (content.brideName) setField("bride", content.brideName);
  if (content.groomName) setField("groom", content.groomName);
  // site-8 renders "Aarav & Kiara" via WEDDING.displayName / .initials.
  const couplePair = [content.brideName, content.groomName].filter((n) => n && n.trim());
  if (couplePair.length === 2) setField("displayName", couplePair.join(" & "));
  const ini = deriveInitials(content.brideName || "", content.groomName || "");
  if (ini.bride || ini.groom) setField("initials", `${ini.bride} · ${ini.groom}`);
  if (content.weddingDate) {
    const [y, m, d] = content.weddingDate.split("-");
    const time = content.startTime && /^\d{2}:\d{2}$/.test(content.startTime) ? content.startTime : "19:00";
    setField("dateISO", `${y}-${m}-${d}T${time}:00+05:30`);
  }
  if (content.startTime) setField("timeText", `${formatTime12(content.startTime)} onwards`);
  if (content.venueName) setField("venue", content.venueName);
  if (content.venueAddress) setField("address", content.venueAddress);
  if (content.venueName || content.venueAddress) {
    setField("mapsQuery", [content.venueName, content.venueAddress].filter(Boolean).join(" "));
  }
  if (musicUrl) setField("music", musicUrl);
  if (content.gallery?.[0]) setField("venuePhoto", content.gallery[0]);

  const named = validEvents(content.events);
  if (named.length) {
    const eventsJs = named
      .map(
        (e) =>
          `    { title: ${JSON.stringify(e.name)}, date: ${JSON.stringify(e.date ? formatDayMonthYear(e.date) : "")}, time: ${JSON.stringify(e.time ? formatTime12(e.time) : "")}, venue: ${JSON.stringify(e.venue || "")}, desc: ${JSON.stringify(e.description || "")} },`
      )
      .join("\n");
    out = out.replace(/(events:\s*\[)[\s\S]*?(\n\s*\])/, (_m, a: string, b: string) => `${a}\n${eventsJs}\n  ${b}`);
  } else {
    // If customer has no events saved, don't leave demo events behind
    out = out.replace(/(events:\s*\[)[\s\S]*?(\n\s*\])/, "$1$2");
  }

  const allowDemoPhotos = Boolean(content.useTemplateImages);
  if (content.gallery?.length) {
    const galJs = content.gallery
      .map((u) => `    { src: ${JSON.stringify(u)}, alt: ${JSON.stringify("Wedding photo")} },`)
      .join("\n");
    out = out.replace(/(gallery:\s*\[)[\s\S]*?(\n\s*\])/, (_m, a: string, b: string) => `${a}\n${galJs}\n  ${b}`);
  } else if (!allowDemoPhotos) {
    // If customer uploaded no photos and did NOT choose original template images, clear gallery
    out = out.replace(/(gallery:\s*\[)[\s\S]*?(\n\s*\])/, "$1$2");
    // Also clear sample couple portrait references in config
    setField("venuePhoto", "");
    setField("heroPhoto", "");
    setField("storyPhoto", "");
  }

  const namedMilestones = (content.loveStory || []).filter((m) => m && String(m.title).trim());
  if (!namedMilestones.length) {
    setField("storyHeading", "");
  }

  return out;
}

/** Swap the template's default <audio> source for the customer's track. */
function swapMusic(html: string, musicUrl: string): string {
  let out = html;
  // <audio … src="music.m4a" …> or <source src="…">
  out = out.replace(/(<audio\b[^>]*\bsrc=")([^"]+)(")/i, (_m, a: string, _b: string, c: string) => `${a}${esc(musicUrl)}${c}`);
  out = out.replace(/(<audio[^>]*>\s*<source\s+src=")([^"]+)(")/i, (_m, a: string, _b: string, c: string) => `${a}${esc(musicUrl)}${c}`);
  return out;
}

/** Drop demo onerror fallbacks once a customer photo is in place. */
function clearImgOnerror(html: string): string {
  return html.replace(/\s+onerror="this\.onerror=null;this\.src='[^']*'"/g, "");
}

/** Cleanly patch all Site-9 static HTML placeholders so zero demo content
 *  (Ananya/Kabir, demo photos, Jaipur address, demo dates/ceremonies) ever
 *  appears in the rendered HTML even before client JS runs. */
function patchSite9StaticHtml(html: string, content: InvitationContent, coupleLabel: string): string {
  let out = html;
  const bride = (content.brideName || "").trim();
  const groom = (content.groomName || "").trim();
  const bridePhoto = (content.bridePhoto || "").trim();
  const groomPhoto = (content.groomPhoto || "").trim();
  const brideParents = (content.brideParents || "").trim();
  const groomParents = (content.groomParents || "").trim();
  const brideBio = (content.brideBio || "").trim();
  const groomBio = (content.groomBio || "").trim();
  const family = (content.familyNames || "").trim();
  const weddingDate = (content.weddingDate || "").trim();
  const venueName = (content.venueName || "").trim();
  const venueAddress = (content.venueAddress || "").trim();

  // Couple photos: never emit demo bride.jpg / groom.jpg
  if (bridePhoto) {
    out = out.replace(
      /(<img[^>]*data-bind-img="media\.bridePhoto"[^>]*\bsrc=")[^"]*(")/i,
      (_m, a: string, b: string) => `${a}${esc(bridePhoto)}${b}`
    );
  } else {
    out = out.replace(/<img[^>]*data-bind-img="media\.bridePhoto"[^>]*>/i, (tag) =>
      tag.replace(/\s+src="[^"]*"/i, "").replace(/class="([^"]*)"/i, 'class="$1" style="display:none"')
    );
    out = out.replace(
      /(<article class="couple-card bride-card[^>]*>[\s\S]*?<div class="couple-img-wrap)(")/i,
      '$1 is-no-photo$2'
    );
  }

  if (groomPhoto) {
    out = out.replace(
      /(<img[^>]*data-bind-img="media\.groomPhoto"[^>]*\bsrc=")[^"]*(")/i,
      (_m, a: string, b: string) => `${a}${esc(groomPhoto)}${b}`
    );
  } else {
    out = out.replace(/<img[^>]*data-bind-img="media\.groomPhoto"[^>]*>/i, (tag) =>
      tag.replace(/\s+src="[^"]*"/i, "").replace(/class="([^"]*)"/i, 'class="$1" style="display:none"')
    );
    out = out.replace(
      /(<article class="couple-card groom-card[^>]*>[\s\S]*?<div class="couple-img-wrap)(")/i,
      '$1 is-no-photo$2'
    );
  }

  // Optional parents & bios
  out = out.replace(
    /(<p class="couple-parents-text"[^>]*data-bind="couple\.brideParents"[^>]*>)[\s\S]*?(<\/p>)/i,
    (_m, a: string, b: string) => (brideParents ? `${a}${esc(brideParents)}${b}` : `${a.replace(/>$/, ' style="display:none">')}${b}`)
  );
  out = out.replace(
    /(<p class="couple-parents-text"[^>]*data-bind="couple\.groomParents"[^>]*>)[\s\S]*?(<\/p>)/i,
    (_m, a: string, b: string) => (groomParents ? `${a}${esc(groomParents)}${b}` : `${a.replace(/>$/, ' style="display:none">')}${b}`)
  );
  out = out.replace(
    /(<div class="couple-bio-quote"[^>]*data-bind="couple\.brideBio"[^>]*>)[\s\S]*?(<\/div>)/i,
    (_m, a: string, b: string) => (brideBio ? `${a}${esc(brideBio)}${b}` : `${a.replace(/>$/, ' style="display:none">')}${b}`)
  );
  out = out.replace(
    /(<div class="couple-bio-quote"[^>]*data-bind="couple\.groomBio"[^>]*>)[\s\S]*?(<\/div>)/i,
    (_m, a: string, b: string) => (groomBio ? `${a}${esc(groomBio)}${b}` : `${a.replace(/>$/, ' style="display:none">')}${b}`)
  );

  // Scratch card message & blessing
  out = out.replace(
    /(<p class="scratch-reveal-msg"[^>]*>)[\s\S]*?(<\/p>)/i,
    (_m, a: string, b: string) => `${a}${esc((content.message || "").trim() || "Join us as we celebrate the beginning of our forever.")}${b}`
  );
  out = out.replace(
    /(<div class="surprise-blessing">)[\s\S]*?(<\/div>)/i,
    (_m, a: string, b: string) => `${a}${coupleLabel ? `✨ ${esc(coupleLabel)} ✨` : ""}${b}`
  );

  // Venue section static demo copy & address
  out = out.replace(
    /(<p class="venue-address"[^>]*data-bind="event\.address"[^>]*>)[\s\S]*?(<\/p>)/i,
    (_m, a: string, b: string) => (venueAddress ? `${a}${esc(venueAddress)}${b}` : `${a.replace(/>$/, ' style="display:none">')}${b}`)
  );
  if (!venueName) {
    out = out.replace(/The Grand Heritage Palace &amp; Royal Gardens/gi, "");
    out = out.replace(/The Grand Heritage Palace & Royal Gardens/gi, "");
    out = out.replace(/The Grand Heritage Palace, Jaipur/gi, "");
    out = out.replace(/The Grand Heritage Palace/gi, "");
    out = out.replace(
      /(<h3 class="venue-palace-name"[^>]*data-bind="event\.venueName"[^>]*>)[\s\S]*?(<\/h3>)/i,
      (_m, a: string, b: string) => `${a.replace(/>$/, ' style="display:none">')}${b}`
    );
    out = out.replace(
      /(<p class="mandap-venue-text[^>]*data-bind="event\.venueName"[^>]*>)[\s\S]*?(<\/p>)/i,
      (_m, a: string, b: string) => `${a.replace(/>$/, ' style="display:none">')}${b}`
    );
  }
  if (!venueAddress) {
    out = out.replace(/Palace Road, Civil Lines,?\s*/gi, "");
  }
  out = out.replace(/<div class="venue-tag">[\s\S]*?<\/div>/i, "");
  out = out.replace(/<div class="venue-meta-pills">[\s\S]*?<\/div>/i, "");
  out = out.replace(/<p class="venue-notes"[^>]*>[\s\S]*?<\/p>/i, "");
  out = out.replace(/<div class="venue-image-wrap">[\s\S]*?<\/div>\s*(?=<div class="venue-details-body">)/i, "");
  out = out.replace(/class="venue-showcase-card([^"]*)"/i, 'class="venue-showcase-card$1 is-no-venue-photo"');
  out = out.replace(/Find your way to the grand palace celebration in the Pink City/gi, "");
  out = out.replace(/Five sacred celebrations of music, colour and timeless vows/gi, "Sacred celebrations of love, music and timeless vows");
  out = out.replace(
    /(<meta property="og:image" content=")https:\/\/mehfill\.in\/site-9\/cover\.jpg(")/i,
    (_m, a: string, b: string) => `${a}${esc(bridePhoto || groomPhoto || content.gallery?.[0] || "https://mehfill.in/og-cover.png")}${b}`
  );

  // Footer family gratitude
  out = out.replace(
    /(<p class="closing-footer-family"[^>]*data-bind="couple\.footerMessage"[^>]*>)[\s\S]*?(<\/p>)/i,
    (_m, a: string, b: string) =>
      family ? `${a}With heartfelt gratitude from ${esc(family)}${b}` : `${a.replace(/>$/, ' style="display:none">')}${b}`
  );

  // Section visibility when optional sections are empty
  if (!weddingDate) {
    out = out.replace(/18\s+December\s+2026/gi, "");
    out = out.replace(/(<section[^>]*data-section="countdown"[^>]*)(>)/i, '$1 style="display:none"$2');
    out = out.replace(/(<section[^>]*data-section="scratchCard"[^>]*)(>)/i, '$1 style="display:none"$2');
    out = out.replace(/(<span class="intro-date-badge"[^>]*>)[\s\S]*?(<\/span>)/i, '<span class="intro-date-badge" data-bind="event.dateFormatted" style="display:none"></span>');
    out = out.replace(/(<div class="mandap-date-badge[^>]*>)[\s\S]*?(<\/div>)/i, '<div class="mandap-date-badge reveal" data-bind="event.dateFormatted" style="display:none"></div>');
  }
  if (!content.events?.some((e) => e && String(e.name || "").trim())) {
    out = out.replace(/(<section[^>]*data-section="events"[^>]*)(>)/i, '$1 style="display:none"$2');
  }
  if (!content.loveStory?.some((m) => m && String(m.title || "").trim())) {
    out = out.replace(/(<section[^>]*data-section="story"[^>]*)(>)/i, '$1 style="display:none"$2');
  }
  if (!content.gallery?.length && !content.galleryItems?.length) {
    out = out.replace(/(<section[^>]*data-section="gallery"[^>]*)(>)/i, '$1 style="display:none"$2');
  }
  if (!venueName && !venueAddress) {
    out = out.replace(/(<section[^>]*data-section="venue"[^>]*)(>)/i, '$1 style="display:none"$2');
  }

  // Strip any leftover demo strings in static markup
  if (bride || groom) {
    out = out.replace(/Ananya Roy/gi, esc(bride));
    out = out.replace(/Kabir Singhania/gi, esc(groom));
    out = out.replace(/\bRoy\b/g, "");
    out = out.replace(/\bSinghania\b/g, "");
    out = out.replace(/Jaipur, Rajasthan 302006, India/gi, esc(venueAddress));
    out = out.replace(/Jaipur's royal skies/gi, "our joyous celebration");
    out = out.replace(/\bJaipur\b/gi, esc(venueAddress ? venueAddress.split(",")[0].trim() : ""));
  }

  return out;
}

// Build the tiny runtime override that finishes the content swap in-browser
// (things too dynamic for pure string replacement: RSVP wiring, gallery image
// sources when the customer uploaded photos, seal initials, love story images).
function buildOverrideScript(
  content: InvitationContent,
  slug: string,
  opts: { hasGallery: boolean; storyPhoto?: string; loveStory?: LoveStoryMilestone[]; nativeRsvp?: boolean; isSite9?: boolean }
): string {
  const loveStory = opts.loveStory || [];
  const loveStoryJson = JSON.stringify(loveStory).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
  const bride = content.brideName || "";
  const groom = content.groomName || "";
  const ini = initialsOf(content.brideName, content.groomName, content.initials);
  const gallery = jsonForScript(Array.isArray(content.gallery) ? content.gallery : []);
  const rsvpEnabled = content.rsvp?.enabled !== false;
  const phoneDigits = (content.rsvp?.contactPhone || "").replace(/\D/g, "");
  const waNumber = phoneDigits.length >= 10 ? phoneDigits.slice(-12) : "";
  const story = opts.storyPhoto ? jsonForScript(opts.storyPhoto) : "null";
  return `<script>(function(){
try{
var __M={bride:${jsonForScript(bride)},groom:${jsonForScript(groom)},ini:${jsonForScript(ini)},gallery:${gallery},slug:${jsonForScript(slug)},story:${story}};
window.__MEHFILL__=Object.assign(window.__MEHFILL__||{},__M);
${opts.hasGallery && !opts.isSite9 ? `
/* Swap gallery images the customer uploaded, preserving the template's own
   figure/masonry markup — we only change the <img src> of existing slots.
   Extra photos beyond the slot count are appended as new figures. */
if(__M.gallery && __M.gallery.length){
  var figs=document.querySelectorAll('#masonry figure img, .masonry figure img, #gallery figure img, .gallery figure img, .grid figure img');
  for(var i=0;i<figs.length;i++){
    if(__M.gallery[i]){ figs[i].src=__M.gallery[i]; figs[i].removeAttribute('onerror'); }
  }
  /* Append surplus photos into the first matching gallery container. */
  var host=document.querySelector('#masonry, .masonry, #gallery .wrap, #gallery, .grid');
  if(host && __M.gallery.length>figs.length){
    for(var j=figs.length;j<__M.gallery.length;j++){
      var fig=document.createElement('figure');
      var im=document.createElement('img');
      im.src=__M.gallery[j]; im.alt='Wedding photo'; im.loading='lazy';
      fig.appendChild(im);
      if(host.classList.contains('grid')) fig.className='reveal rv-zoom';
      host.appendChild(fig);
    }
  }
}` : ""}
${opts.storyPhoto && !opts.isSite9 ? `
/* Story / hero portrait — first customer photo replaces the demo portrait. */
var st=document.querySelector('.img-frame img, .story-img img, #story img');
if(st && __M.story){ st.src=__M.story; st.removeAttribute('onerror'); }` : ""}
${loveStoryJson && !opts.isSite9 ? `
/* Love story milestone images — first image replaces the demo portrait, rest appended */
var __L=${loveStoryJson};
if(__L && __L.length){
  var st=document.querySelector('.img-frame img, .story-img img, #story img');
  if(st && __L[0] && __L[0].imageUrl){ st.src=__L[0].imageUrl; st.removeAttribute('onerror'); }
  /* Append surplus photos into the first matching gallery container. */
  var host=document.querySelector('#masonry, .masonry, #gallery .wrap, #gallery, .grid');
  if(host && __L.length>1){
    for(var j=1;j<__L.length;j++){
      var fig=document.createElement('figure');
      var im=document.createElement('img');
      im.src=__L[j].imageUrl; im.alt='Wedding photo'; im.loading='lazy';
      fig.appendChild(im);
      if(host.classList.contains('grid')) fig.className='reveal rv-zoom';
      host.appendChild(fig);
    }
  }
}` : ""}
${rsvpEnabled ? (
  opts.nativeRsvp
    ? `
/* site-8 wires its own RSVP form (opens WhatsApp + success panel). We only
   record the response — never preventDefault, never open a second WhatsApp. */
var f=document.getElementById('rsvp-form');
if(f && !f.dataset.__mf){
  f.dataset.__mf='1';
  f.addEventListener('submit',function(e){
    try{
      var fd=new FormData(f);
      fd.set('slug',__M.slug);
      fetch('/api/rsvp',{method:'POST',body:fd}).catch(function(){});
    }catch(err){}
  });
}`
    : `
/* Point the template's own RSVP form at our API without touching its markup. */
var f=document.getElementById('rsvp-form');
if(f && !f.dataset.__mf){
  f.dataset.__mf='1';
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var fd=new FormData(f);
    fd.set('slug',__M.slug);
    var nm=(fd.get('name')||fd.get('guestName')||'').toString();
    var at=(fd.get('attendance')||fd.get('attend')||fd.get('attending')||'').toString();
    var g=(fd.get('guests')||fd.get('guestCount')||'1').toString();
    var ph=(fd.get('phone')||fd.get('guestPhone')||'').toString();
    var nt=(fd.get('note')||fd.get('message')||'').toString();
    var msg='RSVP from '+nm+'\\nAttending: '+at+'\\nGuests: '+g+(ph?'\\nPhone: '+ph:'')+(nt?'\\nMessage: '+nt:'');
    ${waNumber ? `window.open('https://wa.me/${waNumber}?text='+encodeURIComponent(msg),'_blank');` : ""}
    fetch('/api/rsvp',{method:'POST',body:fd}).then(function(r){
      if(!r.ok) throw new Error('rsvp-failed');
      var ok=document.getElementById('rsvp-ok');
      var form=document.getElementById('rsvp-form');
      if(form){form.style.display='none';}
      if(ok){ok.hidden=false;ok.scrollIntoView({behavior:'smooth',block:'center'});}
    }).catch(function(){});
  });
}`
) : ""}
${waNumber ? `
/* Ensure a WhatsApp fallback exists if the template has a contact button. */
try{var wa=document.querySelector('a[href*="wa.me"]');if(wa&&!wa.dataset.locked){wa.href='https://wa.me/${waNumber}';}}catch(e){}` : ""}
}catch(e){})();<\/script>`;
}

export interface PersonalizeResult {
  html: string;
}

export async function renderPersonalizedInvitation(
  templateSlug: string,
  content: InvitationContent,
  slug: string
): Promise<PersonalizeResult | null> {
  const binding = getBinding(templateSlug);
  if (!binding) return null;

  const { siteDir } = binding;
  let html: string;
  try {
    html = await readTemplateFile(siteDir, "index.html");
  } catch {
    return null;
  }

  const bride = (content.brideName || "").trim();
  const groom = (content.groomName || "").trim();
  const coupleLabel = [bride, groom].filter(Boolean).join(" & ");
  const andLabel = [bride, groom].filter(Boolean).join(" and ");

  const weddingIso = (content.weddingDate || "").trim();
  const startTime =
    content.startTime && /^\d{1,2}:\d{2}$/.test(content.startTime) ? content.startTime : "";

  // 1. DEMO TOKEN LAYER — rewrite every display form of the template's demo
  //    date/weekday/month ("August 31, 2026", "31 · 08 · 2026", "Monday",
  //    "صبح 10:30 بجे", strings inside inlined scripts…) to the saved values
  //    BEFORE any customer text is inserted, so a customer venue or name can
  //    never be mangled by the rewrite (e.g. a venue containing "August").
  html = replaceDemoDateTokens(html, binding, weddingIso);
  html = replaceDemoTimeTokens(html, startTime);

  // 2. External script: inline it so we can patch the countdown target while
  //    keeping every animation/function identical.
  if (binding.externalScript) {
    try {
      const script = await readTemplateFile(siteDir, "script.js");
      // Same demo-token layer on the raw script text first ("See you on Aug
      // 31" / "31 August 2026" live there), THEN the config patches. Word
      // tokens (bare month/weekday) are skipped — site-6/7 scripts contain
      // `var MONTHS = [...]` arrays that must stay intact.
      let patched = replaceDemoDateTokensInScript(script, binding, weddingIso);
      patched = replaceDemoTimeTokens(patched, startTime);
      patched = patchScript(patched, content);
      // site-6/7/8: patch the WEDDING config object inside the inlined script.
      if (binding.eventsStyle === "wedding") {
        patched = patchWeddingConfig(patched, content, content.musicUrl || undefined);
      }
      // site-3: patch the lowercase `var wedding = { … }` config.
      if (binding.eventsStyle === "evCard") {
        patched = patchSite3Wedding(patched, content);
      }
      html = html.replace(
        /<script[^>]*src="script\.js"[^>]*>\s*<\/script>/i,
        () => `<script>\n${patched}\n</script>`
      );
      html = html.replace(/<script[^>]*src="script\.js"[^>]*><\/script>/i, "");
    } catch {
      // No external script — leave as-is.
    }
    // site-8 loads js/invitation-data.js, which still holds the demo couple
    // and the demo RSVP phone numbers — inline and patch it too.
    // For site-9, we inject window.__MEHFILL__.content directly and stub
    // MehfillData so zero demo data from DEFAULT_INVITATION is ever emitted.
    if (/src="js\/invitation-data\.js"/i.test(html)) {
      if (siteDir === "site-9") {
        html = html.replace(/<script[^>]*src="js\/invitation-data\.js"[^>]*>\s*<\/script>/i, "");
        html = html.replace(/<script[^>]*src="js\/invitation-data\.js"[^>]*><\/script>/i, "");
      } else {
        try {
          const dataSrc = await readTemplateFile(siteDir, "js/invitation-data.js");
          const phone = (content.rsvp?.contactPhone || "").replace(/['"\\]/g, "");
          let data = dataSrc;
          if (phone) {
            // The data module uses single OR double quotes depending on the key.
            data = data.replace(/(contactPhone|whatsappPhone):\s*(['"])[^'"]*\2/g, (_m, key: string) => `${key}: '${phone}'`);
          }
          data = replaceDemoDateTokensInScript(data, binding, weddingIso);
          data = replaceDemoTimeTokens(data, startTime);
          html = html.replace(
            /<script[^>]*src="js\/invitation-data\.js"[^>]*>\s*<\/script>/i,
            () => `<script>\n${data}\n</script>`
          );
          html = html.replace(/<script[^>]*src="js\/invitation-data\.js"[^>]*><\/script>/i, "");
        } catch {
          // No data module — leave as-is.
        }
      }
    }
  } else {
    // Inline script (site-5): patch the countdown ISO directly in the HTML.
    html = patchScript(html, content);
    if (binding.eventsStyle === "wedding") {
      html = patchWeddingConfig(html, content, content.musicUrl || undefined);
    }
  }

  // 2b. site-8 & site-9 read window.__MEHFILL__ at boot to decide whether to
  //     load a localStorage draft or the saved customer invitation.
  if (binding.externalScript) {
    const mehfillBoot =
      siteDir === "site-9"
        ? `window.__MEHFILL__=window.__MEHFILL__||{slug:${jsonForScript(slug)},published:true,isSite9:true,content:${jsonForScript(content)}};window.MehfillData=window.MehfillData||{saveRsvp:function(){return{ok:true};}};`
        : `window.__MEHFILL__=window.__MEHFILL__||{slug:${jsonForScript(slug)},published:true};`;
    html = html.replace(
      /<head([^>]*)>/i,
      (m) => `${m}<script>${mehfillBoot}</script>`
    );
  }

  // 2c. Bilingual templates (sites 1 & 2) keep personal data inside data-en /
  //     data-ur attributes. Dates/times/weekdays in data-ur were already fixed
  //     by the token layer; names, venues and cities have no Urdu equivalent
  //     we can fabricate, so when the English side carries a personal token we
  //     mirror the corrected English into data-ur — guests then see the real
  //     customer data instead of the demo couple.
  html = mirrorBilingualPersonalData(html, binding, {
    bride,
    groom,
    coupleLabel,
    andLabel,
    venue: content.venueName || "",
    city: content.venueAddress || "",
  });

  // 2d. Rewrite relative asset paths → /site-N/.
  html = rewriteAssetPaths(html, siteDir);

  // 2. Names — replace demo anchors with the customer's, only when provided.
  //    CRITICAL order (prevents "Riya & Sachin · Riya & Sachin" duplication):
  //      a) coupleSplit  — full-HTML split-span titles → rebuild bride-first
  //      b) andNameAnchors — "Hamza and Maryam" → "Bride and Groom"
  //      c) coupleAnchors — "Hamza & Maryam" / "Hamza &amp; Maryam" → "Bride & Groom"
  //      d) brideAnchors — bare bride name ONLY → bride (never couple label)
  //      e) groomAnchors — bare groom name ONLY → groom (never couple label)
  //    (f) initials run after the name gate — see below.
  //    Bare single-name anchors are NEVER put in coupleAnchors — that was the
  //    root cause of "Riya & Sachin & Riya & Sachin" on split-span templates.
  if (bride || groom) {
    // a) Split-span couple titles — preserve markup, force bride-first order.
    for (const split of binding.coupleSplit || []) {
      if (!split.original) continue;
      const rebuilt = split.template
        .replace(/\{\{bride\}\}/g, esc(bride))
        .replace(/\{\{groom\}\}/g, esc(groom));
      html = html.split(split.original).join(rebuilt);
    }
    // b) "X and Y" forms.
    if (andLabel && binding.andNameAnchors?.length) {
      html = replaceAnchors(html, binding.andNameAnchors, andLabel);
    }
    // c) Combined couple labels ("X & Y", "X &amp; Y").
    if (coupleLabel && binding.coupleAnchors?.length) {
      html = replaceAnchors(html, binding.coupleAnchors, coupleLabel);
    }
    // d) Bare bride name → bride only (person cards, data-en, etc).
    if (bride && binding.brideAnchors?.length) {
      html = replaceAnchors(html, binding.brideAnchors, bride);
    }
    // e) Bare groom name → groom only.
    if (groom && binding.groomAnchors?.length) {
      html = replaceAnchors(html, binding.groomAnchors, groom);
    }
  }

  // f) Initials — ONE source of truth (lib/initials.ts), always derived from
  //    the actual names, bride first. The manual `content.initials` field is
  //    consulted only when the names are blank, so a stale saved value can
  //    never override the real names (the "A & Z" bug).
  const initials = deriveInitials(bride, groom);
  const manualInitials = (content.initials || "").trim();
  const isStaleManual = /^[a-z]\s*(?:&|·|\||♡)\s*[a-z]$/i.test(manualInitials) && /^a\s*(&|·)\s*z$/i.test(manualInitials);
  const cleanManual = isStaleManual ? "" : manualInitials;

  if (initials.bride || initials.groom) {
    // Structural splits: full-HTML pairs rebuilt with positional {{bi}}/{{gi}}
    // tokens (e.g. site-2 pre-ring, per-person avatars). A missing side is
    // substituted empty and adjacent empty separators collapse — never
    // fabricated, never "undefined".
    for (const split of binding.initialsSplit || []) {
      if (!split.original) continue;
      const rebuilt = split.template
        .replace(/\{\{bi\}\}/g, esc(initials.bride))
        .replace(/\{\{gi\}\}/g, esc(initials.groom))
        // Drop now-empty separators: "<em>&</em><span></span>" / "<span></span><em>&</em>".
        .replace(/\s*<em>(?:&|&amp;|\|)<\/em>\s*<span>\s*<\/span>/g, "")
        .replace(/<span>\s*<\/span>\s*<em>(?:&|&amp;|\|)<\/em>\s*/g, "");
      html = html.split(split.original).join(rebuilt);
    }
    // Flat monogram anchors ("A · Z", "A <span>|</span> M", scratch fillText…)
    // rebuilt with the template's own separator, bride first.
    if (binding.initialsAnchors?.length) {
      html = replaceInitialsAnchors(html, binding.initialsAnchors, initials.bride, initials.groom);
    }
  } else if (cleanManual && binding.initialsAnchors?.length) {
    // Names blank — the customer's manual field is the safe fallback.
    html = replaceAnchors(html, binding.initialsAnchors, cleanManual);
  } else {
    // Both names are blank and no valid manual initials — collapse/remove demo initials so
    // stale letters (like "A · Z") never leak into unpersonalized or blank invitations
    for (const split of binding.initialsSplit || []) {
      if (!split.original) continue;
      const collapsed = split.template
        .replace(/\{\{bi\}\}/g, "")
        .replace(/\{\{gi\}\}/g, "")
        .replace(/\s*<em>(?:&|&amp;|\|)<\/em>\s*/g, "");
      html = html.split(split.original).join(collapsed);
    }
    if (binding.initialsAnchors?.length) {
      html = replaceInitialsAnchors(html, binding.initialsAnchors, "", "");
    }
  }

  // 3. Date — swap every demo date string for the customer's wedding date.
  if (content.weddingDate) {
    const dotted = formatDotted(content.weddingDate); // "20 . 12 . 2026"
    const dottedTight = formatDottedTight(content.weddingDate); // "20 · 12 · 2026"
    const dmy = formatDayMonthYear(content.weddingDate); // "20 December 2026"
    const weekdayDot = formatWeekdayDotDate(content.weddingDate); // "Saturday · 20 December 2026"
    // Dotted / tight forms first, then long forms, then composite weekday lines.
    html = replaceAnchors(html, binding.demoDates.filter((d) => d.includes(" . ")), dotted);
    html = replaceAnchors(html, binding.demoDates.filter((d) => d.includes(" · ") && !d.includes(" . ")), dottedTight);
    html = replaceAnchors(html, binding.demoDates.filter((d) => !d.includes(" . ") && !d.includes(" · ")), dmy);
    // "Weekday · D Month YYYY" composites (scratch-done, countdown, eyebrows).
    html = html.replace(
      /(Saturday|Sunday|Monday|Tuesday|Wednesday|Thursday|Friday)\s*·\s*\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/g,
      weekdayDot
    );
    // Scratch-card day cell.
    html = html.replace(
      /(<p class="su-day">)[^<]*(<\/p>)/,
      (_m, a: string, b: string) => `${a}${weekdayOf(content.weddingDate)}${b}`
    );
  }

  // 4. Start time — templates that show "7:00 PM onwards".
  if (content.startTime && binding.demoTimes?.length) {
    const t12 = formatTime12(content.startTime);
    html = replaceAnchors(html, binding.demoTimes, `${t12} onwards`);
    html = replaceAnchors(html, binding.demoTimes.map((t) => t.replace(" onwards", "")), t12);
  }

  // 5. Venue + city + maps.
  if (content.venueName) {
    html = replaceAnchors(html, binding.demoVenues, content.venueName);
  }
  if (content.venueAddress && binding.demoCities?.length) {
    html = replaceAnchors(html, binding.demoCities, content.venueAddress);
  }
  // Marquee-style bare city word (e.g. site-5 ribbon "Nashik").
  const cw = cityWord(content);
  if (cw && binding.demoCities?.length) {
    for (const city of binding.demoCities) {
      const bare = city.split(",")[0].trim();
      if (bare && bare.length > 3 && bare.toLowerCase() !== cw.toLowerCase()) {
        html = html.replace(new RegExp(`\\b${bare}\\b`, "g"), esc(cw));
      }
    }
  }
  // A demo line may list venue + district + city ("Lakeview Rose Lawns,
  // Shamshabad Road, Hyderabad"); once each token is replaced independently
  // the customer's address can appear twice in a row — collapse it.
  if (content.venueAddress) {
    const addr = esc(content.venueAddress);
    for (let i = 0; i < 2; i++) {
      html = html.split(`${addr}, ${addr}`).join(addr);
    }
  }
  const mapsUrl = buildMapsQuery(content.venueName, content.venueAddress, content.mapsUrl);
  if (mapsUrl) {
    html = html.replace(/https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=[^"']*/g, mapsUrl);
    html = html.replace(/https:\/\/www\.google\.com\/maps\?q=[^"']*/g, buildMapsEmbed(content.venueName, content.venueAddress) || mapsUrl);
    html = html.replace(/https:\/\/maps\.google\.com\/\?q=[^"']*/g, mapsUrl);
  }

  // 5b. Google Calendar buttons (sites 2 & 3) carry the demo couple, demo
  //     venue and a demo UTC window — rewrite the window from the saved date
  //     + start time and the encoded text fields from the customer's data.
  html = patchCalendarLinks(html, binding, content);

  // 5c. Scratch-card split date cells (site-3 sr-num/sr-month/sr-year, site-4
  //     big-day/big-month/big-year) have no runtime overwrite — patch them
  //     directly from the customer's wedding date.
  html = replaceDateCells(html, binding, weddingIso);

  // 6. Customer event list — rebuild inside the template's own markup.
  //    When the customer has NO named events the demo list must be cleared,
  //    never left behind.
  if (binding.eventsStyle) {
    switch (binding.eventsStyle) {
      case "timeline":
        html = rebuildTimeline(html, content.events);
        break;
      case "eventCard":
        html = rebuildEventCards(html, content.events);
        break;
      case "evCard":
        html = rebuildEvCards(html, content.events);
        break;
      case "erow":
        html = rebuildErows(html, content.events);
        break;
      case "miniRow":
        html = rebuildMiniRows(html, content.events);
        break;
      case "wedding":
        // Already patched via WEDDING config above.
        break;
    }
  }

  const allowDemoPhotos = Boolean(content.useTemplateImages);

  // 7. Music — customer track replaces the template default (optional).
  if (content.musicUrl) {
    html = swapMusic(html, content.musicUrl);
  } else {
    // If no music provided, hide music toggle button on templates that support it
    html = html.replace(/<button[^>]*id="musicBtn"[^>]*>[\s\S]*?<\/button>/i, "");
    html = html.replace(/<button[^>]*id="music-toggle"[^>]*>[\s\S]*?<\/button>/i, "");
  }

  // 8. Story portrait + gallery — first photo is the portrait, rest fill gallery.
  const gallery = Array.isArray(content.gallery) ? content.gallery.filter((u) => typeof u === "string" && u) : [];
  const hasGallery = gallery.length > 0;
  if (hasGallery) {
    html = clearImgOnerror(html);
  }

  // 8a. Conditional Gallery Rendering (Option A vs Option B)
  // If the customer has NOT uploaded any photos and has NOT explicitly opted into template images:
  // Remove demo gallery containers cleanly so no broken photo boxes or demo couple photos show.
  if (!hasGallery && !allowDemoPhotos) {
    // site-1: #slider
    html = cleanOmit(html, /<div[^>]*class="slider"[^>]*id="slider"[\s\S]*?<\/div>\s*<\/div>/i);
    html = cleanOmit(html, /<div[^>]*id="slider"[\s\S]*?<\/div>\s*<\/div>/i);
    // site-2: .grid gallery section
    html = cleanOmit(html, /<section[^>]*class="sec reveal rv-right"[^>]*>[\s\S]*?<h3[^>]*>Gallery<\/h3>[\s\S]*?<\/section>/i);
    // site-3: #gallery section
    html = cleanOmit(html, /<section[^>]*id="gallery"[^>]*>[\s\S]*?<\/section>/i);
    // site-4: #gallery section
    html = cleanOmit(html, /<section[^>]*class="section"[^>]*id="gallery"[\s\S]*?<\/section>/i);
    // site-5: #gallery section (and preceding ornament)
    html = cleanOmit(html, /<div class="orn"[^>]*>[\s\S]*?<\/div>\s*<section id="gallery" class="section alt">[\s\S]*?<\/section>/i);
    html = cleanOmit(html, /<section id="gallery" class="section alt">[\s\S]*?<\/section>/i);
    // site-6 & site-7: #gallery section
    html = cleanOmit(html, /<section class="sec alt" id="gallery">[\s\S]*?<\/section>/i);
    // site-8: data-section="gallery" and data-section="portrait"
    html = html.replace(/(<section[^>]*data-section="gallery"[^>]*class="[^"]*)/i, '$1 mf-hidden');
    html = html.replace(/(<section[^>]*data-section="portrait"[^>]*class="[^"]*)/i, '$1 mf-hidden');
  }

  // 8b. Love story milestone cards — rendered inside the template's own markup
  // When customer has NOT provided any love story milestones, cleanly remove demo story sections
  const loveStory: LoveStoryMilestone[] = Array.isArray(content.loveStory) ? content.loveStory : [];
  const namedMilestones = loveStory.filter((m) => m && String(m.title).trim());
  if (namedMilestones.length) {
    const cards = namedMilestones
      .map((m) => {
        const d = m.date ? new Date(m.date + "T00:00:00") : null;
        const dateLine = d ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
        const img = m.imageUrl ? `<img src="${esc(m.imageUrl)}" class="story-milestone-img" alt="Story photo" loading="lazy" />` : "";
        return `<div class="story-milestones">\n      <div class="milestone">${img}${dateLine ? `<span class="ms-year">${esc(dateLine)}</span>` : ""}<div class="ms-body"><h4 class="ms-body-h3">${esc(m.title)}</h4>${m.description ? `<p class="ms-body-p">${esc(m.description)}</p>` : ""}</div></div>\n    </div>`;
      })
      .join("\n      ");
    const storyBlock = `<div class="story-milestones">\n      ${cards}\n    </div>`;
    if (/<div[^>]*class="[^"]*story[^"]*"[^>]*>[\s\S]*?<\/div>/i.test(html)) {
      html = html.replace(
        /(<div[^>]*class="[^"]*story[^"]*"[^>]*>)[\s\S]*?(<\/div>)/i,
        (_m, open: string, close: string) => `${open}\n      ${cards}\n    ${close}`
      );
    } else if (/<div class="events">/i.test(html)) {
      const msInner = /(\.milestones\b[\s\S]*?)<\/ol>/.exec(html) || /<ol[^>]*class="[^"]*milestones[^"]*"[^>]*>[\s\S]*?<\/ol>/.exec(html);
      if (msInner && msInner[1]) {
        html = html.replace(msInner[1], `\n      ${storyBlock}`);
      } else {
        html = html.replace(
          /(<div class="events">[\s\S]*?<\/div>)/,
          (m: string) => m.replace(/<\/div>\s*$/, `${storyBlock}\n    </div>`)
        );
      }
    } else {
      html = html.replace(/<\/main>/i, `${storyBlock}\n  </main>`);
    }
  } else {
    // No customer milestones entered -> OMIT all demo story sections completely!
    // site-3: #story-photo and #story
    html = cleanOmit(html, /<section[^>]*id="story-photo"[\s\S]*?<\/section>/i);
    html = cleanOmit(html, /<section[^>]*id="story"[\s\S]*?<\/section>/i);
    // site-5: #story section
    html = cleanOmit(html, /<div class="orn"[^>]*>[\s\S]*?<\/div>\s*<section id="story" class="section">[\s\S]*?<\/section>/i);
    html = cleanOmit(html, /<section id="story" class="section">[\s\S]*?<\/section>/i);
    // site-8: data-section="story"
    html = cleanOmit(html, /<section[^>]*data-section="story"[^>]*>[\s\S]*?<\/section>/i);
  }

  // 8c. Family Details — conditionally render only when provided by customer
  const family = (content.familyNames || "").trim();
  if (family) {
    // If provided, replace demo family lines across templates
    html = html.replace(/<div class="couple-lines">[\s\S]*?<\/div>/i, `<div class="couple-lines"><p>${esc(family)}</p></div>`);
    html = html.replace(/<div class="couple-mini">[\s\S]*?<\/div>/i, `<div class="couple-mini"><p>${esc(family)}</p></div>`);
    html = html.replace(/<div class="fam reveal rv-up">[\s\S]*?<\/div>/i, `<div class="fam reveal rv-up"><p>${esc(family)}</p></div>`);
    html = html.replace(/<p class="finale-fam">[\s\S]*?<\/p>/i, `<p class="finale-fam">${esc(family)}</p>`);
    html = html.replace(/(data-bind="couple\.familyInvitation">)[^<]*(<\/p>)/i, `$1${esc(family)}$2`);
    // When the customer supplied family details, also drop any demo person
    // lines the template still carries (they name the demo couple's parents).
    html = html.replace(/<small data-en="Son of [^"]*"[^>]*>[\s\S]*?<\/small>/gi, "");
    html = html.replace(/<small data-en="Daughter of [^"]*"[^>]*>[\s\S]*?<\/small>/gi, "");
  } else {
    // If not provided, cleanly remove demo family details
    html = cleanOmit(html, /<div class="couple-lines">[\s\S]*?<\/div>/i);
    html = cleanOmit(html, /<div class="couple-mini">[\s\S]*?<\/div>/i);
    html = cleanOmit(html, /<div class="fam reveal rv-up">[\s\S]*?<\/div>/i);
    html = cleanOmit(html, /<p class="finale-fam">[\s\S]*?<\/p>/i);
    html = html.replace(/<small data-en="Son of [^"]*"[^>]*>[^<]*<\/small>/gi, "");
    html = html.replace(/<small data-en="Daughter of [^"]*"[^>]*>[^<]*<\/small>/gi, "");
    html = html.replace(/<p class="cover-sub">Together with their families<\/p>/gi, "");
    html = html.replace(/<p class="closing-family"[^>]*>[^<]*<\/p>/gi, "");
  }

  // 8d. RSVP Section — conditionally omit if explicitly disabled
  if (content.rsvp && content.rsvp.enabled === false) {
    html = cleanOmit(html, /<section[^>]*class="section reveal"[^>]*>[\s\S]*?<form id="rsvp-form"[\s\S]*?<\/section>/i);
    html = cleanOmit(html, /<section[^>]*class="sec reveal rv-right"[^>]*>[\s\S]*?<form id="rsvp"[\s\S]*?<\/section>/i);
    html = cleanOmit(html, /<section[^>]*id="rsvp"[^>]*>[\s\S]*?<\/section>/i);
    html = html.replace(/(<section[^>]*data-section="rsvp"[^>]*class="[^"]*)/i, '$1 mf-hidden');
  }

  if (siteDir === "site-9") {
    html = patchSite9StaticHtml(html, content, coupleLabel);
  }

  // 9. Title / meta — reflect the couple and date for sharing previews.
  if (coupleLabel) {
    html = html.replace(/<title>[^<]*<\/title>/i, () => `<title>${esc(coupleLabel)} — You're Invited | Mehfill.in</title>`);
    const metaDesc = content.weddingDate
      ? `${coupleLabel} request the pleasure of your company. ${formatDayMonthYear(content.weddingDate)}${content.venueName ? `, ${content.venueName}` : ""}. A digital invitation by Mehfill.in.`
      : `${coupleLabel} request the pleasure of your company. A digital invitation by Mehfill.in.`;
    html = html.replace(
      /(<meta name="description" content=")[^"]*(")/i,
      (_m, a: string, b: string) => `${a}${esc(metaDesc)}${b}`
    );
    // Share previews (WhatsApp/Facebook/X) must show the customer's couple,
    // never the demo couple baked into the template's OG tags.
    const ogTitle = `${esc(coupleLabel)} — You're Invited`;
    const ogDesc = esc(metaDesc);
    if (/<meta property="og:title"/i.test(html)) {
      html = html.replace(
        /(<meta property="og:title" content=")[^"]*(")/i,
        (_m, a: string, b: string) => `${a}${ogTitle}${b}`
      );
    } else {
      html = html.replace(/<\/head>/i, `<meta property="og:title" content="${ogTitle}" /></head>`);
    }
    if (/<meta property="og:description"/i.test(html)) {
      html = html.replace(
        /(<meta property="og:description" content=")[^"]*(")/i,
        (_m, a: string, b: string) => `${a}${ogDesc}${b}`
      );
    } else {
      html = html.replace(/<\/head>/i, `<meta property="og:description" content="${ogDesc}" /></head>`);
    }
    html = html.replace(
      /(<meta name="twitter:card" content=")[^"]*(")/i,
      (m, a: string, b: string) => `${a}summary_large_image${b}`
    );
    const twTags =
      `<meta name="twitter:title" content="${ogTitle}" />` +
      `<meta name="twitter:description" content="${ogDesc}" />`;
    if (!/<meta name="twitter:title"/i.test(html)) {
      html = html.replace(/<\/head>/i, `${twTags}</head>`);
    } else {
      html = html
        .replace(/(<meta name="twitter:title" content=")[^"]*(")/i, (_m, a: string, b: string) => `${a}${ogTitle}${b}`)
        .replace(/(<meta name="twitter:description" content=")[^"]*(")/i, (_m, a: string, b: string) => `${a}${ogDesc}${b}`);
    }
  }

  // 10. Inject the runtime override just before </body> (or before the closing
  //     of the last script) to wire RSVP + gallery + seal without touching design.
  const override = buildOverrideScript(content, slug, {
    hasGallery,
    storyPhoto: gallery[0],
    loveStory: content.loveStory || [],
    // site-8 and site-9 already own their RSVP form UX (WhatsApp + success panel) — only
    // record the response, never open a second WhatsApp window.
    nativeRsvp: binding.siteDir === "site-8" || binding.siteDir === "site-9",
    isSite9: binding.siteDir === "site-9",
  });
  if (html.includes("</body>")) {
    html = html.replace("</body>", `${override}\n</body>`);
  } else {
    html += override;
  }

  return { html };
}
