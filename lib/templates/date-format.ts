// Single source of truth for calendar-date parsing and display formatting.
//
// Rules (applies to every template):
//   * A date-only value is always "YYYY-MM-DD" and is parsed as a LOCAL
//     calendar date (new Date(y, m-1, d)) — never Date.parse / UTC — so a
//     saved wedding date can never render as the previous or next day.
//   * Invalid calendar dates (Feb 30, Feb 29 in a non-leap year…) are
//     rejected instead of silently rolling over.
//   * `dateVariants()` produces every display form a template may use for a
//     given date, in English AND Urdu, so the personaliser can rewrite demo
//     dates even when the demo string is split across formats the bindings
//     list does not know about ("August 31, 2026", "15 NOV 2026",
//     "14 FEBRUARY 2027", "31 اگست 2026" …).

export const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const MONTHS_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Urdu month names as used by the bilingual templates (sites 1 & 2). */
export const MONTHS_UR = [
  "جنوری", "فروری", "مارچ", "اپریل", "مئی", "جون",
  "جولائی", "اگست", "ستمبر", "اکتوبر", "نومبر", "دسمبر",
];

/** Index 0 = Sunday … 6 = Saturday (matches Date#getDay()). */
export const WEEKDAYS_EN = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

export const WEEKDAYS_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Urdu weekday names in the same Sunday-first order. */
export const WEEKDAYS_UR = ["اتوار", "پیر", "منگل", "بدھ", "جمعرات", "جمعہ", "ہفتہ"];

export interface CalendarDate {
  y: number;
  m: number; // 1-12
  d: number; // 1-31
  date: Date; // local midnight
}

/** Parse "YYYY-MM-DD" as a local calendar date. Returns null when the value
 *  is missing, malformed or not a real calendar date (leap-day safe). */
export function parseCalendarDate(iso?: string | null): CalendarDate | null {
  if (!iso || typeof iso !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (!y || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null; // e.g. 2026-02-30 or 2025-02-29
  }
  return { y, m, d, date };
}

export function isValidCalendarDate(iso?: string | null): boolean {
  return parseCalendarDate(iso) !== null;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** A single "demo string → customer string" rewrite pair. */
export interface DateVariant {
  en: string;
  ur: string;
}

/** Every English/Urdu display form of a date, so demo dates in any format
 *  (including scratch-card reveals, split day/month/year cells, meta tags and
 *  inlined script strings) can be rewritten to the saved date. */
export function dateVariants(iso: string): DateVariant[] {
  const c = parseCalendarDate(iso);
  if (!c) return [];
  const { y, m, d, date } = c;
  const monthEn = MONTHS_EN[m - 1];
  const monthAbbr = MONTHS_ABBR[m - 1];
  const monthUpper = monthEn.toUpperCase();
  const monthAbbrUpper = monthAbbr.toUpperCase();
  const monthUr = MONTHS_UR[m - 1];
  const wd = date.getDay();
  const weekdayEn = WEEKDAYS_EN[wd];
  const weekdayAbbr = WEEKDAYS_ABBR[wd];
  const weekdayUr = WEEKDAYS_UR[wd];
  const dd = pad2(d);
  const mm = pad2(m);

  const list: DateVariant[] = [
    // Long forms (day first / month first)
    { en: `${d} ${monthEn} ${y}`, ur: `${d} ${monthUr} ${y}` },
    { en: `${monthEn} ${d}, ${y}`, ur: `${monthUr} ${d}، ${y}` },
    { en: `${d} ${monthAbbr} ${y}`, ur: `${d} ${monthUr} ${y}` },
    { en: `${monthAbbr} ${d}, ${y}`, ur: `${monthUr} ${d}، ${y}` },
    { en: `${d} ${monthUpper} ${y}`, ur: `${d} ${monthUr} ${y}` },
    { en: `${d} ${monthAbbrUpper} ${y}`, ur: `${d} ${monthUr} ${y}` },
    // Weekday composites
    { en: `${weekdayEn}, ${d} ${monthEn} ${y}`, ur: `${weekdayUr}، ${d} ${monthUr} ${y}` },
    { en: `${weekdayEn}, ${monthAbbr} ${d}, ${y}`, ur: `${weekdayUr}، ${d} ${monthUr} ${y}` },
    { en: `${weekdayEn}, ${d} ${monthAbbr} ${y}`, ur: `${weekdayUr}، ${d} ${monthUr} ${y}` },
    { en: `${weekdayAbbr}, ${d} ${monthAbbr} ${y}`, ur: `${weekdayUr}، ${d} ${monthUr} ${y}` },
    { en: `${weekdayAbbr}, ${monthAbbr} ${d}, ${y}`, ur: `${weekdayUr}، ${d} ${monthUr} ${y}` },
    { en: `${weekdayEn} · ${d} ${monthEn} ${y}`, ur: `${weekdayUr} · ${d} ${monthUr} ${y}` },
    { en: `${weekdayEn} · ${d} ${monthAbbr} ${y}`, ur: `${weekdayUr} · ${d} ${monthUr} ${y}` },
    // Numeric / dotted forms (identical in both languages)
    { en: `${dd} . ${mm} . ${y}`, ur: `${dd} . ${mm} . ${y}` },
    { en: `${dd} · ${mm} · ${y}`, ur: `${dd} · ${mm} · ${y}` },
    { en: `${d} . ${m} . ${y}`, ur: `${d} . ${m} . ${y}` },
    { en: `${dd}/${mm}/${y}`, ur: `${dd}/${mm}/${y}` },
    { en: `${dd}-${mm}-${y}`, ur: `${dd}-${mm}-${y}` },
    { en: `${y}-${mm}-${dd}`, ur: `${y}-${mm}-${dd}` },
    { en: `${y}${mm}${dd}`, ur: `${y}${mm}${dd}` },
    // Short forms without a year (RSVP thanks strings, countdown notes)
    { en: `${monthAbbr} ${d}`, ur: `${monthUr} ${d}` },
    { en: `${d} ${monthAbbr}`, ur: `${d} ${monthUr}` },
    { en: `${monthEn} ${d}`, ur: `${monthUr} ${d}` },
    { en: `${d} ${monthEn}`, ur: `${d} ${monthUr}` },
    { en: `${monthAbbrUpper} ${d}`, ur: `${monthUr} ${d}` },
  ];

  // Drop duplicate pairs while preserving order.
  const seen = new Set<string>();
  return list.filter((v) => {
    if (!v.en || !v.ur) return false;
    const key = `${v.en}\u0000${v.ur}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Bare weekday display forms of a date: full, abbreviated, uppercase, Urdu. */
export function weekdayVariants(iso: string): DateVariant[] {
  const c = parseCalendarDate(iso);
  if (!c) return [];
  const w = c.date.getDay();
  return [
    { en: WEEKDAYS_EN[w], ur: WEEKDAYS_UR[w] },
    { en: WEEKDAYS_ABBR[w], ur: WEEKDAYS_ABBR[w] },
    { en: WEEKDAYS_EN[w].toUpperCase(), ur: WEEKDAYS_UR[w] },
  ];
}

/** Bare month display forms of a date: full, abbreviated, uppercase, Urdu. */
export function monthVariants(iso: string): DateVariant[] {
  const c = parseCalendarDate(iso);
  if (!c) return [];
  const i = c.m - 1;
  return [
    { en: MONTHS_EN[i], ur: MONTHS_UR[i] },
    { en: MONTHS_ABBR[i], ur: MONTHS_ABBR[i] },
    { en: MONTHS_EN[i].toUpperCase(), ur: MONTHS_UR[i] },
  ];
}

/** One "demo string → customer string" rewrite. `word` = replace only on
 *  word boundaries (bare month/weekday tokens like "May", "Sun"). */
export interface TokenPair {
  from: string;
  to: string;
  word?: boolean;
}

function pairForms(
  demo: DateVariant[],
  customer: DateVariant[],
  word: boolean
): TokenPair[] {
  const pairs: TokenPair[] = [];
  const n = Math.min(demo.length, customer.length);
  for (let i = 0; i < n; i++) {
    const d = demo[i];
    const c = customer[i];
    if (d.en && c.en && d.en !== c.en) pairs.push({ from: d.en, to: c.en, word });
    if (d.ur && c.ur && d.ur !== c.ur) pairs.push({ from: d.ur, to: c.ur, word });
  }
  return pairs;
}

/** Every demo-date/weekday/month token in the template → the saved date, in
 *  English and Urdu. Sorted longest-first by the caller so full forms are
 *  consumed before bare month/weekday tokens. */
export function dateTokenPairs(
  demoIso: string,
  customerIso?: string | null
): TokenPair[] {
  if (!parseCalendarDate(demoIso) || !parseCalendarDate(customerIso)) return [];
  const pairs: TokenPair[] = [];
  pairs.push(...pairForms(dateVariants(demoIso), dateVariants(customerIso!), false));
  pairs.push(...pairForms(weekdayVariants(demoIso), weekdayVariants(customerIso!), true));
  pairs.push(...pairForms(monthVariants(demoIso), monthVariants(customerIso!), true));
  return pairs;
}

export function weekdayLongOf(iso?: string | null): string {
  const c = parseCalendarDate(iso);
  return c ? WEEKDAYS_EN[c.date.getDay()] : "";
}

export function formatTime12(t?: string): string {
  if (!t) return "";
  const [hRaw, m] = t.split(":");
  let h = Number(hRaw);
  if (Number.isNaN(h)) return t;
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m || "00"} ${suffix}`;
}
