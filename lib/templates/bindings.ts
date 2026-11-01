// Per-template data-binding config.
//
// The customer's published invitation MUST be the EXACT original template
// (site-N) with only customer content swapped in — never a generic re-skin.
// Each entry declares the demo "anchors" so the personaliser can replace them
// with the customer's saved data while leaving layout, CSS, JS and animations
// intact.
//
// Name replacement rules (critical — prevents duplicates):
//   coupleAnchors  → "Bride & Groom"  (combined "X & Y" strings only)
//   brideAnchors   → bride name ONLY  (never the full couple label)
//   groomAnchors   → groom name ONLY  (never the full couple label)
// Never put a bare single-name anchor in coupleAnchors — that is what caused
// "Riya & Sachin & Riya & Sachin" on split-span templates.

export type EventsStyle =
  | "timeline" // site-5: <ol class="timeline">
  | "eventCard" // site-1: <article class="event-card"> inside .events
  | "evCard" // site-3: <article class="ev-card"> inside .events
  | "erow" // site-4: <article class="erow"> inside .elist
  | "miniRow" // site-2: <div class="mini-row"> inside .mini-list
  | "wedding"; // site-6/7: WEDDING.events in script config

/** Split-span couple title: original HTML → rebuild template with {{bride}}/{{groom}}
 *  so the markup (classes, data-attrs, amp span) is preserved while names swap
 *  and the order is forced bride-first. */
export interface CoupleSplit {
  original: string;
  template: string;
}

export interface TemplateBinding {
  /** Static directory under /public that holds the original template. */
  siteDir: string;
  /** Combined couple strings ("Arham & Zoya", "Amit &amp; Siya"). Always → "Bride & Groom". */
  coupleAnchors: string[];
  /** Full-HTML split-span couple titles → rebuild with bride first, groom second. */
  coupleSplit?: CoupleSplit[];
  /** Demo strings that displayed the BRIDE's name alone (replaced with customer bride only). */
  brideAnchors: string[];
  /** Demo strings that displayed the GROOM's name alone (replaced with customer groom only). */
  groomAnchors: string[];
  /** Monogram/initial anchors — rebuilt bride-first with the template's own
   *  separator/marker markup preserved ("A · Z" → "H · A"). */
  initialsAnchors?: string[];
  /** Structural initials: full-HTML monogram pairs rebuilt with positional
   *  {{bi}} (bride initial) / {{gi}} (groom initial) tokens — for split-span
   *  initials and per-person avatar letters where order is positional. */
  initialsSplit?: CoupleSplit[];
  /** "Amit and Siya" style (word-joined) name forms → "Bride and Groom". */
  andNameAnchors?: string[];
  /** Demo date strings that appear in the markup. */
  demoDates: string[];
  /** The demo wedding date itself (YYYY-MM-DD). The personaliser derives EVERY
   *  display form of that date (long, short, dotted, uppercase, weekday,
   *  Urdu…) from this value and rewrites them to the customer's saved date —
   *  including scratch-card reveals, split day/month/year cells, meta tags and
   *  strings inside the inlined script. */
  demoDateISO: string;
  /** Optional CSS-class split date cells (scratch-card day/month/year blocks)
   *  that must be rewritten positionally because the value is split across
   *  elements. `nth` targets the nth element carrying that class. */
  dateCells?: { cls: string; part: "day" | "month" | "year"; nth?: number }[];
  /** Demo venue name(s). */
  demoVenues: string[];
  /** Demo city / address string(s). */
  demoCities?: string[];
  /** Demo short time strings like "7:00 PM onwards". */
  demoTimes?: string[];
  /** How this template renders its event list. */
  eventsStyle?: EventsStyle;
  /** Whether the template keeps script.js/style.css as external files. */
  externalScript: boolean;
}

// NOTE: demo values are read from the actual template files. If a template is
// re-designed, update its anchors here. The personaliser only ever replaces
// these known demo strings.
//
// Order of names in coupleAnchors is irrelevant — replacement ALWAYS produces
// `${bride} & ${groom}` (bride first) per product requirement.
export const BINDINGS: Record<string, TemplateBinding> = {
  // site-1 · Hamza & Maryam (groom listed first in template)
  "nikah-emerald": {
    siteDir: "site-1",
    coupleAnchors: [
      "Hamza &amp; Maryam",
      "Hamza & Maryam",
    ],
    coupleSplit: [
      {
        original:
          '<span data-en="Hamza" data-ur="حمزہ">Hamza</span><span class="amp-line" data-en="&amp;" data-ur="و">&amp;</span><span data-en="Maryam" data-ur="مریم">Maryam</span>',
        template:
          '<span data-en="{{bride}}" data-ur="">{{bride}}</span><span class="amp-line" data-en="&amp;" data-ur="">&amp;</span><span data-en="{{groom}}" data-ur="">{{groom}}</span>',
      },
      {
        original:
          '<span data-en="Hamza" data-ur="حمزہ">Hamza</span> &nbsp;·&nbsp; <span data-en="Maryam" data-ur="مریم">Maryam</span>',
        template:
          '<span data-en="{{bride}}" data-ur="">{{bride}}</span> &nbsp;·&nbsp; <span data-en="{{groom}}" data-ur="">{{groom}}</span>',
      },
    ],
    brideAnchors: ["Maryam", "Maryam Khan"],
    groomAnchors: ["Hamza", "Hamza Ahmed"],
    initialsAnchors: ["H&nbsp;·&nbsp;M", "H · M", "H & M", "H &amp; M"],
    andNameAnchors: ["Hamza and Maryam", "Maryam and Hamza"],
    demoDates: ["31 August 2026", "31 . 08 . 2026", "31/08/2026"],
    demoDateISO: "2026-08-31",
    demoVenues: ["Grand Palace Hall"],
    demoCities: ["London"],
    demoTimes: ["10:30 AM"],
    eventsStyle: "eventCard",
    externalScript: true,
  },
  // site-2 · Arham & Zoya (groom listed first in split spans)
  "rose-royale": {
    siteDir: "site-2",
    coupleAnchors: ["Arham &amp; Zoya", "Arham & Zoya", "Zoya &amp; Arham", "Zoya & Arham"],
    coupleSplit: [
      {
        original:
          '<span class="n1" data-en="Arham" data-ur="ارحم">Arham</span><em>&</em><span class="n2" data-en="Zoya" data-ur="زویا">Zoya</span>',
        template:
          '<span class="n1" data-en="{{bride}}" data-ur="">{{bride}}</span><em>&</em><span class="n2" data-en="{{groom}}" data-ur="">{{groom}}</span>',
      },
    ],
    brideAnchors: ["Zoya", "Zoya Khan"],
    groomAnchors: ["Arham", "Arham Sheikh"],
    initialsAnchors: [
      "A · Z",
      "A&nbsp;·&nbsp;Z",
      "A&amp;nbsp;·&amp;nbsp;Z",
      "A & Z",
      "A &amp; Z",
      "Z · A",
      "Z&nbsp;·&nbsp;A",
    ],
    initialsSplit: [
      // Preloader ring: demo shows groom & bride (A & Z) — forced bride-first.
      {
        original: '<div class="pre-ring"><span>A</span><em>&</em><span>Z</span></div>',
        template: '<div class="pre-ring"><span>{{bi}}</span><em>&</em><span>{{gi}}</span></div>',
      },
      // Person cards: left card is the GROOM (Arham), right card the BRIDE (Zoya).
      { original: '<span class="avatar">A</span>', template: '<span class="avatar">{{gi}}</span>' },
      { original: '<span class="avatar">Z</span>', template: '<span class="avatar">{{bi}}</span>' },
    ],
    andNameAnchors: ["Arham and Zoya", "Zoya and Arham"],
    demoDates: ["28 December 2026", "28 . 12 . 2026"],
    demoDateISO: "2026-12-28",
    demoVenues: ["Lakeview Rose Lawns"],
    // Longest first — "Shamshabad Road, Hyderabad" appears inside address
    // lines and maps URLs that only list the venue as "Lakeview Rose Lawns".
    demoCities: [
      "Shamshabad Road, Near Gandipet Lake, Hyderabad",
      "Shamshabad Road, Hyderabad",
      "Shamshabad Road",
      "Shamshabad",
      "Hyderabad",
    ],
    demoTimes: ["11:00 AM"],
    eventsStyle: "miniRow",
    externalScript: true,
  },
  // site-3 · Aarav & Meera (also title mentions Aariz & Zoya)
  "botanical-sage": {
    siteDir: "site-3",
    coupleAnchors: [
      "Aarav &amp; Meera",
      "Aarav & Meera",
      "Aariz &amp; Zoya",
      "Aariz & Zoya",
    ],
    coupleSplit: [
      {
        original: '<span class="n1">Aarav</span><em>&</em><span class="n2">Meera</span>',
        template: '<span class="n1">{{bride}}</span><em>&</em><span class="n2">{{groom}}</span>',
      },
      {
        original: "<span>Aarav</span><em>&</em><span>Meera</span>",
        template: "<span>{{bride}}</span><em>&</em><span>{{groom}}</span>",
      },
    ],
    brideAnchors: ["Meera", "Zoya"],
    groomAnchors: ["Aarav", "Aariz"],
    initialsAnchors: [
      "A  ♡  M",
      "A ♡ M",
      "A&nbsp;·&nbsp;M",
      "A · M",
      "A&nbsp;·&nbsp;Z",
      "A · Z",
    ],
    andNameAnchors: ["Aarav and Meera", "Aariz and Zoya", "Meera and Aarav"],
    demoDates: ["18 December 2026", "18 . 12 . 2026"],
    demoDateISO: "2026-12-18",
    // Scratch-card reveal splits the date across three elements.
    dateCells: [
      { cls: "sr-num", part: "day" },
      { cls: "sr-month", part: "month" },
      { cls: "sr-year", part: "year" },
    ],
    demoVenues: ["Sangeet Garden", "The Garden Estate", "The Grand Hall"],
    demoCities: ["Mumbai"],
    demoTimes: ["7:00 PM"],
    eventsStyle: "evCard",
    externalScript: true,
  },
  // site-4 · Aarav & Meera
  "midnight-gold": {
    siteDir: "site-4",
    coupleAnchors: ["Aarav &amp; Meera", "Aarav & Meera"],
    coupleSplit: [
      {
        original: "<span>Aarav</span><em>&amp;</em><span>Meera</span>",
        template: "<span>{{bride}}</span><em>&amp;</em><span>{{groom}}</span>",
      },
      {
        original: "Aarav <em>&amp;</em> Meera",
        template: "{{bride}} <em>&amp;</em> {{groom}}",
      },
      {
        original: "Meera <em>&amp;</em> Aarav",
        template: "{{bride}} <em>&amp;</em> {{groom}}",
      },
    ],
    brideAnchors: ["Meera"],
    groomAnchors: ["Aarav"],
    initialsAnchors: [
      "A · M ✦",
      "A&nbsp;·&nbsp;M ✦",
      "A <span>|</span> M",
      "A&nbsp;|&nbsp;M",
      "A | M",
      "A&nbsp;·&nbsp;M",
      "A · M",
    ],
    andNameAnchors: ["Aarav and Meera", "Meera and Aarav"],
    demoDates: ["18 December 2026", "18 . 12 . 2026"],
    demoDateISO: "2026-12-18",
    // Heart scratch reveal splits the date across three elements.
    dateCells: [
      { cls: "big-day", part: "day" },
      { cls: "big-month", part: "month" },
      { cls: "big-year", part: "year" },
    ],
    demoVenues: ["The Garden Estate"],
    demoCities: ["Mumbai"],
    demoTimes: ["7 PM", "7:00 PM"],
    eventsStyle: "erow",
    externalScript: true,
  },
  // site-5 · Amit & Siya (groom listed first in vn-title span)
  "ivory-editorial": {
    siteDir: "site-5",
    coupleAnchors: ["Amit &amp; Siya", "Amit & Siya"],
    coupleSplit: [
      {
        original: 'Amit<span class="vn-amp">&amp;</span>Siya',
        template: '{{bride}}<span class="vn-amp">&amp;</span>{{groom}}',
      },
    ],
    brideAnchors: ["Siya"],
    groomAnchors: ["Amit"],
    initialsAnchors: [
      "A  ·  S",
      "A&nbsp;·&nbsp;S",
      "A&amp;nbsp;·&amp;nbsp;S",
      "A · S",
      "A & S",
      "A &amp; S",
    ],
    andNameAnchors: ["Amit and Siya", "Siya and Amit"],
    demoDates: ["18 December 2026", "18 · 12 · 2026", "18 . 12 . 2026"],
    demoDateISO: "2026-12-18",
    demoVenues: ["The Grand Celebration Hall"],
    demoCities: ["Nashik, Maharashtra", "Nashik"],
    demoTimes: ["7:00 PM onwards", "7:00 PM"],
    eventsStyle: "timeline",
    externalScript: false,
  },
  // site-6 · Anaya & Vihaan (groom listed first in HTML spans)
  "blush-garden": {
    siteDir: "site-6",
    coupleAnchors: [
      "Anaya &amp; Vihaan",
      "Vihaan &amp; Anaya",
      "Anaya & Vihaan",
      "Vihaan & Anaya",
    ],
    coupleSplit: [
      {
        original: "<span>Vihaan</span><em>&amp;</em><span>Anaya</span>",
        template: "<span>{{bride}}</span><em>&amp;</em><span>{{groom}}</span>",
      },
      {
        original: "Vihaan <em>&amp;</em> Anaya",
        template: "{{bride}} <em>&amp;</em> {{groom}}",
      },
      {
        original: "Anaya <em>&amp;</em> Vihaan",
        template: "{{bride}} <em>&amp;</em> {{groom}}",
      },
    ],
    brideAnchors: ["Anaya"],
    groomAnchors: ["Vihaan"],
    initialsAnchors: ["A&nbsp;·&nbsp;V", "V&nbsp;·&nbsp;A", "A · V", "V · A"],
    andNameAnchors: ["Anaya and Vihaan", "Vihaan and Anaya"],
    demoDates: ["14 February 2027", "14 . 02 . 2027"],
    demoDateISO: "2027-02-14",
    demoVenues: ["The Celebration Gardens"],
    demoCities: ["Mumbai, Maharashtra"],
    demoTimes: ["7:00 PM onwards"],
    eventsStyle: "wedding",
    externalScript: true,
  },
  // site-7 · Diya & Aditya (bride listed first in HTML spans)
  "royal-marigold": {
    siteDir: "site-7",
    coupleAnchors: [
      "Diya &amp; Aditya",
      "Aditya &amp; Diya",
      "Diya & Aditya",
      "Aditya & Diya",
    ],
    coupleSplit: [
      {
        original: "<span>Aditya</span><em>&amp;</em><span>Diya</span>",
        template: "<span>{{bride}}</span><em>&amp;</em><span>{{groom}}</span>",
      },
      {
        original: "Aditya <em>&amp;</em> Diya",
        template: "{{bride}} <em>&amp;</em> {{groom}}",
      },
      {
        original: "Diya <em>&amp;</em> Aditya",
        template: "{{bride}} <em>&amp;</em> {{groom}}",
      },
    ],
    brideAnchors: ["Diya"],
    groomAnchors: ["Aditya"],
    initialsAnchors: ["D&nbsp;·&nbsp;A", "A&nbsp;·&nbsp;D", "D · A", "A · D"],
    andNameAnchors: ["Diya and Aditya", "Aditya and Diya"],
    demoDates: ["28 November 2027", "28 . 11 . 2027"],
    demoDateISO: "2027-11-28",
    demoVenues: ["Shree Celebration Lawns"],
    demoCities: ["Pune, Maharashtra"],
    demoTimes: ["7:00 PM onwards"],
    eventsStyle: "wedding",
    externalScript: true,
  },
  // site-8 · Aarav & Kiara — Luxury Ivory Reception (bride listed first)
  "luxury-ivory-reception": {
    siteDir: "site-8",
    coupleAnchors: [
      "Aarav &amp; Kiara",
      "Aarav & Kiara",
      "Kiara &amp; Aarav",
      "Kiara & Aarav",
    ],
    coupleSplit: [
      {
        original: '<span class="n1">Aarav</span><em class="amp">&amp;</em><span class="n2">Kiara</span>',
        template: '<span class="n1">{{bride}}</span><em class="amp">&amp;</em><span class="n2">{{groom}}</span>',
      },
      {
        original: '<span class="p-groom" data-bind="couple.groomName">Aarav</span>\n                <span class="p-amp">&amp;</span>\n                <span class="p-bride" data-bind="couple.brideName">Kiara</span>',
        template: '<span class="p-groom" data-bind="couple.groomName">{{groom}}</span>\n                <span class="p-amp">&amp;</span>\n                <span class="p-bride" data-bind="couple.brideName">{{bride}}</span>',
      },
      {
        original: "Aarav<em>&amp;</em>Kiara",
        template: "{{bride}}<em>&amp;</em>{{groom}}",
      },
    ],
    brideAnchors: ["Kiara", "Kiara Sharma"],
    groomAnchors: ["Aarav", "Aarav Mehta"],
    initialsAnchors: ["A · K", "A&nbsp;·&nbsp;K", "K · A"],
    andNameAnchors: ["Aarav and Kiara", "Kiara and Aarav"],
    demoDates: ["15 November 2026", "15 . 11 . 2026", "15 · 11 · 2026"],
    demoDateISO: "2026-11-15",
    demoVenues: ["The Grand Orchid Palace"],
    demoCities: ["Nashik, Maharashtra 422002", "Nashik"],
    demoTimes: ["7:00 PM onwards", "7:00 PM"],
    eventsStyle: "wedding",
    externalScript: true,
  },
  // site-9 · Ananya & Kabir — Royal Floral Garden (Jaipur Mandap)
  "royal-floral-garden": {
    siteDir: "site-9",
    coupleAnchors: [
      "Ananya &amp; Kabir",
      "Ananya & Kabir",
      "Kabir &amp; Ananya",
      "Kabir & Ananya",
    ],
    coupleSplit: [
      {
        original: '<span class="bride-first" data-bind="couple.brideName">Ananya</span>\n            <span class="mandap-ampersand">&amp;</span>\n            <span class="groom-first" data-bind="couple.groomName">Kabir</span>',
        template: '<span class="bride-first" data-bind="couple.brideName">{{bride}}</span>\n            <span class="mandap-ampersand">&amp;</span>\n            <span class="groom-first" data-bind="couple.groomName">{{groom}}</span>',
      },
    ],
    brideAnchors: ["Ananya", "Ananya Roy"],
    groomAnchors: ["Kabir", "Kabir Singhania"],
    initialsAnchors: ["A · K", "A&nbsp;·&nbsp;K", "K · A"],
    andNameAnchors: ["Ananya and Kabir", "Kabir and Ananya"],
    demoDates: ["18 December 2026", "18 . 12 . 2026", "18 · 12 · 2026"],
    demoDateISO: "2026-12-18",
    demoVenues: ["The Grand Heritage Palace & Royal Gardens", "The Grand Heritage Palace, Jaipur"],
    demoCities: ["Jaipur, Rajasthan", "Jaipur"],
    demoTimes: ["5:30 PM onwards", "5:30 PM"],
    eventsStyle: "wedding",
    externalScript: true,
  },
};

export function getBinding(templateSlug: string): TemplateBinding | undefined {
  return BINDINGS[templateSlug];
}
