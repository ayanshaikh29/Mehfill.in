import { renderPersonalizedInvitation } from "../lib/templates/personalize";
import { BINDINGS } from "../lib/templates/bindings";
import type { InvitationContent } from "../lib/invitation";

const content: InvitationContent = {
  brideName: "Hina",
  groomName: "Ayaan",
  initials: "",
  familyNames: "",
  message: "",
  intro: "",
  weddingDate: "2026-12-18",
  startTime: "19:00",
  endTime: "",
  venueName: "Palace Hall",
  venueAddress: "Mumbai",
  mapsUrl: "",
  events: [],
  gallery: [],
  rsvp: { enabled: true },
};

async function checkAll() {
  for (const [slug, binding] of Object.entries(BINDINGS)) {
    console.log(`=== ${slug} (${binding.siteDir}) ===`);
    const res = await renderPersonalizedInvitation(slug, content, "hina-ayaan");
    if (!res) {
      console.log("NULL RESULT");
      continue;
    }
    const html = res.html;
    const staleAnchors = [
      "A · Z", "A&nbsp;·&nbsp;Z", "A · M", "A&nbsp;·&nbsp;M", "A  ♡  M",
      "A  ·  S", "A&nbsp;·&nbsp;S", "A · S", "A <span>|</span> M", "A&nbsp;|&nbsp;M",
      "H · M", "H&nbsp;·&nbsp;M", "A · V", "D · A", "A & Z", "A&amp;Z", "A &amp; Z",
    ];
    for (const t of staleAnchors) {
      if (html.includes(t)) {
        console.log(`  STALE ANCHOR FOUND: "${t}"`);
      }
    }
    const derivedMatches = html.match(/(?:H\s*(?:·|&|&amp;|\||♡)\s*A|A\s*(?:·|&|&amp;|\||♡)\s*H)/g);
    console.log("  Derived initials in HTML:", derivedMatches);

    // Look for ring or avatar or seal
    const ringMatches = html.match(/<(?:div|span|p)[^>]*class="[^"]*(?:pre-ring|avatar|seal)[^"]*"[^>]*>[\s\S]{0,80}?<\/(?:div|span|p)>/gi);
    if (ringMatches) {
      console.log("  Ring/avatar/seal tags:", ringMatches);
    }
  }
}

checkAll().catch(console.error);
