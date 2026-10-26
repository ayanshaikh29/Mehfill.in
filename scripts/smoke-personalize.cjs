/* eslint-disable @typescript-eslint/no-require-imports */
/* Smoke test: personalize all 8 templates with a customer whose date, time,
   venue, names differ from every demo — then assert:
   1. no demo couple names / demo dates / demo venues remain
   2. customer names/date/venue are present
   3. scratch-card date cells show the customer's day/month/year
   4. demo event lists are cleared when the customer has none
   Plus: the product catalog (what customers SELECT) must map 1:1 onto the
   personaliser bindings (what actually RENDERS) — the selection→editor bug.
*/
require("../.smoke/register.js");
const { renderPersonalizedInvitation } = require("../.smoke/lib/templates/personalize.js");
const { getBinding } = require("../.smoke/lib/templates/bindings.js");
const { CATALOG } = require("../.smoke/lib/catalog.js");

const SLUGS = [
  "nikah-emerald",
  "rose-royale",
  "botanical-sage",
  "midnight-gold",
  "ivory-editorial",
  "blush-garden",
  "royal-marigold",
  "luxury-ivory-reception",
];

const DEMO_COUPLE = ["Hamza", "Maryam", "Arham", "Zoya", "Rehan", "Ishita", "Aarav", "Kiara"];
const DEMO_DATES = [
  "2026-08-31", "2026-12-28", "2026-12-18", "2026-11-15", "2027-02-14", "2027-11-28",
  "August 31", "31 August 2026", "28 December 2026", "December 28", "18 December 2026",
  "15 November 2026", "14 February 2027", "28 November 2027", "31 اگست 2026",
  "20261228T053000Z", "20260831", "20261218", "20261115",
];
const DEMO_VENUES = [
  "Lakeview Rose Lawns", "The Grand Orchid Palace", "Nashik", "Shamshabad",
  "Hyderabad", "Flower Pavilion",
];
// Demo weekday of every demo date — must be gone only when the customer
// weekday differs. Customer date below is Sunday 2027-03-07.
const DEMO_WEEKDAYS = ["Monday", "Friday", "پیر", "جمعرات"];

const content = {
  brideName: "Priya",
  groomName: "Kabir",
  weddingDate: "2027-03-07",
  startTime: "18:30",
  venueName: "Sunrise Palace",
  venueAddress: "Malviya Nagar, Jaipur",
  mapsUrl: "",
  events: [],
  gallery: [],
  loveStory: [],
  useTemplateImages: false,
  musicUrl: "",
  familyNames: "",
  initials: "",
  rsvp: { enabled: true, contactPhone: "+91 9876543210" },
};

function stripScripts(html) {
  // Demo tokens inside stripped renderer files / comments are out of scope;
  // check the visible text + config + scripts we inline.
  return html;
}

async function main() {
  let failures = 0;

  // 0. Catalog ↔ binding consistency — the selection→editor root-cause guard:
  //    every purchasable slug must render (binding exists) and its demo link
  //    must point at the same site-N the personaliser loads.
  for (const t of CATALOG) {
    const b = getBinding(t.slug);
    if (!b) {
      console.log(`FAIL catalog: '${t.slug}' has no personaliser binding`);
      failures++;
      continue;
    }
    if (t.demoUrl !== `/${b.siteDir}`) {
      console.log(`FAIL catalog: '${t.slug}' demoUrl ${t.demoUrl} != binding siteDir /${b.siteDir}`);
      failures++;
    }
    if (!SLUGS.includes(t.slug)) {
      console.log(`FAIL catalog: '${t.slug}' missing from render smoke list`);
      failures++;
    }
  }
  for (const s of SLUGS) {
    if (!CATALOG.some((t) => t.slug === s)) {
      console.log(`FAIL smoke list: '${s}' not in product catalog`);
      failures++;
    }
  }
  console.log(
    failures ? "FAIL catalog ↔ binding consistency" : `PASS catalog ↔ binding consistency (${CATALOG.length} templates)`
  );

  for (const slug of SLUGS) {
    const res = await renderPersonalizedInvitation(slug, content, "priya-kabir");
    if (!res) {
      console.log(`FAIL ${slug}: renderPersonalizedInvitation returned null`);
      failures++;
      continue;
    }
    const html = stripScripts(res.html);
    const problems = [];

    // 1. Customer data present.
    for (const need of ["Priya", "Kabir", "Sunrise Palace"]) {
      if (!html.includes(need)) problems.push(`missing customer value: ${need}`);
    }
    if (!/7 March 2027/.test(html) && !/7 March 2027/.test(html)) {
      problems.push("missing customer date '7 March 2027'");
    }

    // 2. No demo leftovers (demo couple names + demo dates + demo venues).
    for (const t of DEMO_COUPLE) {
      const re = new RegExp(`\\b${t}\\b`);
      if (re.test(html)) problems.push(`demo name leaked: ${t}`);
    }
    for (const t of DEMO_DATES) {
      if (html.includes(t)) problems.push(`demo date leaked: ${t}`);
    }
    for (const t of DEMO_VENUES) {
      if (html.includes(t)) problems.push(`demo venue leaked: ${t}`);
    }
    // Demo weekdays only matter when they differ from the customer's weekday
    // (2027-03-07 is a Sunday). Check outside <script> bodies where weekday
    // arrays are allowed.
    const visible = html.replace(/<script[\s\S]*?<\/script>/gi, "");
    for (const t of DEMO_WEEKDAYS) {
      if (visible.includes(t)) problems.push(`demo weekday leaked in visible HTML: ${t}`);
    }

    // 3. Site-6/7 MONTHS arrays must stay intact inside inlined scripts
    //    (site-8 has no MONTHS array in its inlined scripts — only the
    //    non-inlined renderer does).
    if (["blush-garden", "royal-marigold"].includes(slug)) {
      const scripts = (html.match(/<script>[\s\S]*?<\/script>/gi) || []).join("\n");
      for (const m of ["January", "February", "March", "April", "May", "June",
                       "July", "August", "September", "October", "November", "December"]) {
        if (!scripts.includes(`'${m}'`) && !scripts.includes(`"${m}"`)) {
          problems.push(`MONTHS array corrupted — missing '${m}' in inlined script`);
        }
      }
    }

    // 4. Calendar link (sites 2 & 3) must carry the customer date window.
    const cal = /dates=(\d{8})T/.exec(html);
    if (cal && cal[1] !== "20270307") problems.push(`calendar dates= still ${cal[1]}`);

    // 5. Scratch-card split date cells — no runtime overwrite exists for
    //    these, the personaliser must patch them directly.
    if (slug === "botanical-sage") {
      const day = /class="[^"]*\bsr-num\b[^"]*"[^>]*>([^<]*)</.exec(html);
      const month = /class="[^"]*\bsr-month\b[^"]*"[^>]*>([^<]*)</.exec(html);
      const year = /class="[^"]*\bsr-year\b[^"]*"[^>]*>([^<]*)</.exec(html);
      if (!day || day[1].trim() !== "7") problems.push(`sr-num is ${day?.[1]} (want 7)`);
      if (!month || month[1].trim() !== "March") problems.push(`sr-month is ${month?.[1]} (want March)`);
      if (!year || year[1].trim() !== "2027") problems.push(`sr-year is ${year?.[1]} (want 2027)`);
    }
    if (slug === "midnight-gold") {
      const day = /class="[^"]*\bbig-day\b[^"]*"[^>]*>([^<]*)</.exec(html);
      const month = /class="[^"]*\bbig-month\b[^"]*"[^>]*>([^<]*)</.exec(html);
      const year = /class="[^"]*\bbig-year\b[^"]*"[^>]*>([^<]*)</.exec(html);
      if (!day || day[1].trim() !== "7") problems.push(`big-day is ${day?.[1]} (want 7)`);
      if (!month || month[1].trim() !== "March") problems.push(`big-month is ${month?.[1]} (want March)`);
      if (!year || year[1].trim() !== "2027") problems.push(`big-year is ${year?.[1]} (want 2027)`);
    }
    if (slug === "ivory-editorial") {
      const wd = /class="[^"]*\bsu-day\b[^"]*"[^>]*>([^<]*)</.exec(html);
      if (!wd || wd[1].trim() !== "Sunday") problems.push(`su-day is ${wd?.[1]} (want Sunday)`);
    }

    if (problems.length) {
      failures++;
      console.log(`FAIL ${slug}`);
      for (const p of problems) console.log(`   - ${p}`);
    } else {
      console.log(`PASS ${slug}`);
    }
  }

  // 5. Events present → rebuild path (site-1 timeline).
  const withEvents = await renderPersonalizedInvitation(
    "nikah-emerald",
    { ...content, events: [{ id: "e1", name: "Sangeet Night", date: "2027-03-06", time: "20:00", venue: "Sunrise Terrace", description: "" }] },
    "priya-kabir"
  );
  if (withEvents && !withEvents.html.includes("Sangeet Night")) {
    console.log("FAIL nikah-emerald: customer event not rebuilt");
    failures++;
  } else if (withEvents) {
    console.log("PASS nikah-emerald (with events)");
  }

  // 6. Wedding-style template (site-6) with events → WEDDING.events patched.
  const w6 = await renderPersonalizedInvitation(
    "blush-garden",
    { ...content, events: [{ id: "e1", name: "Sangeet Night", date: "2027-03-06", time: "20:00", venue: "Sunrise Terrace", description: "" }] },
    "priya-kabir"
  );
  if (w6 && !w6.html.includes("Sangeet Night")) {
    console.log("FAIL blush-garden: WEDDING.events not patched");
    failures++;
  } else if (w6) {
    console.log("PASS blush-garden (with events)");
  }

  // 7. Site-8: demo RSVP phone must be gone, customer phone present.
  const s8 = await renderPersonalizedInvitation("luxury-ivory-reception", content, "priya-kabir");
  if (s8) {
    if (s8.html.includes("90000 12345")) {
      console.log("FAIL site-8: demo RSVP phone leaked");
      failures++;
    } else if (!s8.html.includes("9876543210")) {
      console.log("FAIL site-8: customer RSVP phone missing");
      failures++;
    } else if (!s8.html.includes("Priya & Kabir")) {
      console.log("FAIL site-8: WEDDING.displayName not patched");
      failures++;
    } else {
      console.log("PASS site-8 (rsvp phone + displayName)");
    }
  }

  console.log(failures ? `\n${failures} FAILURE(S)` : "\nALL PASS");
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
