/* eslint-disable @typescript-eslint/no-require-imports */
require("../.smoke/register.js");
const assert = require("assert");
const { renderPersonalizedInvitation } = require("../.smoke/lib/templates/personalize.js");
const { defaultContent, validateForPublish, isSafeHttpUrl } = require("../.smoke/lib/invitation.js");

let passed = 0;
function test(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      console.log(`PASS ${name}`);
      passed++;
    })
    .catch((err) => {
      console.error(`FAIL ${name}:`, err && err.message ? err.message : err);
      process.exitCode = 1;
    });
}

function baseSite9Content(overrides = {}) {
  return {
    ...defaultContent("royal-floral-garden"),
    brideName: "Meera",
    groomName: "Vikramaditya",
    weddingDate: "2027-05-20",
    ...overrides,
  };
}

async function run() {
  await test("defaultContent for royal-floral-garden has 0 ceremonies and no demo data", () => {
    const c = defaultContent("royal-floral-garden");
    assert.strictEqual(c.events.length, 0);
    assert.strictEqual(c.gallery.length, 0);
    assert.strictEqual(c.loveStory.length, 0);
    assert.strictEqual(c.brideName, "");
    assert.strictEqual(c.groomName, "");
    assert.strictEqual(c.weddingDate, "");
    assert.strictEqual(c.useTemplateImages, false);
  });

  await test("Couple: both names without images hides bride.jpg/groom.jpg and adds is-no-photo", async () => {
    const res = await renderPersonalizedInvitation("royal-floral-garden", baseSite9Content(), "meera-vikramaditya");
    assert.ok(res && res.html);
    assert.ok(!res.html.includes("Ananya"), "Ananya leaked");
    assert.ok(!res.html.includes("Kabir"), "Kabir leaked");
    assert.ok(!res.html.includes("assets/images/bride.jpg"), "demo bride.jpg leaked");
    assert.ok(!res.html.includes("assets/images/groom.jpg"), "demo groom.jpg leaked");
    assert.strictEqual((res.html.match(/is-no-photo/g) || []).length >= 2, true);
  });

  await test("Couple: both names + both images renders both uploaded URLs", async () => {
    const res = await renderPersonalizedInvitation(
      "royal-floral-garden",
      baseSite9Content({
        bridePhoto: "https://example.com/bride-real.jpg",
        groomPhoto: "https://example.com/groom-real.jpg",
        brideParents: "Daughter of Mr. & Mrs. Nair",
        groomParents: "Son of Mr. & Mrs. Rao",
        brideBio: "Classical pianist.",
        groomBio: "Astrophysicist.",
      }),
      "meera-vikramaditya"
    );
    assert.ok(res.html.includes("https://example.com/bride-real.jpg"));
    assert.ok(res.html.includes("https://example.com/groom-real.jpg"));
    assert.ok(res.html.includes("Daughter of Mr. &amp; Mrs. Nair"));
    assert.ok(res.html.includes("Son of Mr. &amp; Mrs. Rao"));
    assert.ok(res.html.includes("Classical pianist."));
    assert.ok(res.html.includes("Astrophysicist."));
    assert.ok(!res.html.includes("is-no-photo"));
  });

  await test("Couple: only bride image hides groom image cleanly", async () => {
    const res = await renderPersonalizedInvitation(
      "royal-floral-garden",
      baseSite9Content({ bridePhoto: "https://example.com/bride-only.jpg" }),
      "meera-vikramaditya"
    );
    assert.ok(res.html.includes("https://example.com/bride-only.jpg"));
    assert.ok(!res.html.includes("assets/images/groom.jpg"));
    assert.ok(res.html.includes("is-no-photo"));
  });

  await test("Couple: only groom image hides bride image cleanly", async () => {
    const res = await renderPersonalizedInvitation(
      "royal-floral-garden",
      baseSite9Content({ groomPhoto: "https://example.com/groom-only.jpg" }),
      "meera-vikramaditya"
    );
    assert.ok(res.html.includes("https://example.com/groom-only.jpg"));
    assert.ok(!res.html.includes("assets/images/bride.jpg"));
    assert.ok(res.html.includes("is-no-photo"));
  });

  await test("Ceremonies: 0 ceremonies hides events section and omits demo ceremonies", async () => {
    const res = await renderPersonalizedInvitation("royal-floral-garden", baseSite9Content({ events: [] }), "meera-vikramaditya");
    assert.ok(/data-section="events"[^>]*style="display:none"/i.test(res.html));
    assert.ok(!res.html.includes("Shubh Haldi"));
    assert.ok(!res.html.includes("Mehendi Ki Raat"));
    assert.ok(!res.html.includes("Sangeet & Musical Gala"));
  });

  await test("Ceremonies: 2 custom ceremonies are preserved in window.__MEHFILL__.content", async () => {
    const res = await renderPersonalizedInvitation(
      "royal-floral-garden",
      baseSite9Content({
        events: [
          { id: "c1", name: "Haldi", date: "2027-05-18", time: "10:00", venue: "Garden Lawn" },
          { id: "c2", name: "Mehendi", date: "2027-05-19", time: "", venue: "" },
        ],
      }),
      "meera-vikramaditya"
    );
    assert.ok(!/data-section="events"[^>]*style="display:none"/i.test(res.html));
    assert.ok(res.html.includes('"name":"Haldi"'));
    assert.ok(res.html.includes('"name":"Mehendi"'));
  });

  await test("URL safety: rejects javascript: and data: protocols, accepts https:", () => {
    assert.strictEqual(isSafeHttpUrl("javascript:alert(1)"), false);
    assert.strictEqual(isSafeHttpUrl("data:text/html,<script>"), false);
    assert.strictEqual(isSafeHttpUrl("https://maps.google.com/?q=Udaipur"), true);
    assert.strictEqual(isSafeHttpUrl("http://maps.google.com/?q=Udaipur"), true);
  });

  await test("Missing wedding date hides countdown and scratch card", async () => {
    const res = await renderPersonalizedInvitation(
      "royal-floral-garden",
      baseSite9Content({ weddingDate: "" }),
      "meera-vikramaditya"
    );
    assert.ok(/data-section="countdown"[^>]*style="display:none"/i.test(res.html));
    assert.ok(/data-section="scratchCard"[^>]*style="display:none"/i.test(res.html));
    assert.ok(!res.html.includes("18 December 2026"));
  });

  await test("Love story & Gallery & Venue hidden when empty, Jaipur never leaks", async () => {
    const res = await renderPersonalizedInvitation("royal-floral-garden", baseSite9Content(), "meera-vikramaditya");
    assert.ok(!res.html.includes('data-section="story"') || /data-section="story"[^>]*style="display:none"/i.test(res.html));
    assert.ok(!res.html.includes('data-section="gallery"') || /data-section="gallery"[^>]*style="display:none"/i.test(res.html));
    assert.ok(/data-section="venue"[^>]*style="display:none"/i.test(res.html));
    assert.ok(!res.html.includes("The Grand Heritage Palace"));
    assert.ok(!res.html.includes("Palace Road, Civil Lines"));
    assert.ok(!res.html.includes("Singhania"));
  });

  await test("Publish validation: site-9 allows optional time/venue while other templates require them", () => {
    const s9Problems = validateForPublish(baseSite9Content(), "royal-floral-garden");
    assert.deepStrictEqual(s9Problems, []);
    const otherProblems = validateForPublish(baseSite9Content(), "royal-marigold");
    assert.ok(otherProblems.includes("start time"));
    assert.ok(otherProblems.includes("venue name"));
    assert.ok(otherProblems.includes("venue address"));
  });

  await test("Exact user scenario (rahul & priya, grand rio, abc apartment, Haldi only): zero demo leaks", async () => {
    const res = await renderPersonalizedInvitation(
      "royal-floral-garden",
      baseSite9Content({
        brideName: "rahul",
        groomName: "priya",
        weddingDate: "2026-12-25",
        venueName: "grand rio",
        venueAddress: "abc apartment",
        events: [{ id: "haldi-1", name: "Haldi", date: "", time: "", venue: "", address: "", mapsUrl: "", description: "" }],
      }),
      "rahul-priya"
    );
    const forbidden = [
      "Ananya", "Kabir", "Rajesh", "Madhuri", "Vikram", "Sunita",
      "Shubh Haldi", "Mehendi Ki Raat", "Sangeet & Musical Gala",
      "Royal Vivah Ceremony", "Grand Wedding Reception",
      "Courtyard of Sunflowers", "Bougainvillea Terrace", "Crystal Chandelier",
      "Emerald Mandap Pavilion", "Palace Grand Courtyard",
      "Palace Road", "Civil Lines", "Jaipur", "Rajasthan", "302006",
      "bride.jpg", "groom.jpg", "event-haldi.jpg", "event-mehendi.jpg",
      "event-sangeet.jpg", "couple-portrait.jpg", "gallery-heritage.jpg",
      "venue.jpg", "Valet Parking", "Royal Rajput", "High Tea",
      "18 December 2026", "Five sacred celebrations", "Singhania",
    ];
    const leaked = forbidden.filter((s) => res.html.toLowerCase().includes(s.toLowerCase()));
    assert.deepStrictEqual(leaked, [], `Leaked demo strings: ${leaked.join(", ")}`);
    assert.ok(res.html.includes("rahul"));
    assert.ok(res.html.includes("priya"));
    assert.ok(res.html.includes("grand rio"));
    assert.ok(res.html.includes("abc apartment"));
    assert.ok(res.html.includes('"name":"Haldi"'));
  });

  console.log(`\n${passed} Site-9 dynamic tests passed.`);
}

run();

