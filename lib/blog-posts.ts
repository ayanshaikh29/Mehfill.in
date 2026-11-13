// Blog posts — static data, same pattern as landing-content.ts.
// To publish a new post: add an entry here, and it appears on /blog,
// in the sitemap, and at its own URL automatically.
export interface BlogSection {
  h2: string;
  body: string[];
  list?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO date
  h1: string;
  intro: string;
  sections: BlogSection[];
  faqs?: { q: string; a: string }[];
  // Internal link to the relevant category page (the post's commercial target).
  relatedSlug: string;
  relatedLabel: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-send-wedding-invitation-on-whatsapp",
    title: "How to Send a Wedding Invitation on WhatsApp",
    description:
      "Step-by-step guide to sending a digital wedding invitation on WhatsApp — what to write, when to send, and mistakes to avoid. Works for Indian weddings.",
    date: "2026-11-10",
    h1: "How to send a wedding invitation on WhatsApp",
    intro:
      "WhatsApp is how India shares everything — and today it is also how most wedding invitations travel. Sending your invitation the right way matters: the message around the link sets the tone before guests even open it. Here is exactly how to send a digital wedding invitation on WhatsApp, what to write with it, and the mistakes that make invitations get ignored.",
    sections: [
      {
        h2: "Step 1: Publish your invitation link first",
        body: [
          "Before anything goes out, your invitation needs to be live. Create your invitation, add names, events, venues and photos, preview it exactly as guests will see, and publish. You will get a single link — that link is your invitation. Test it yourself on your own phone first: open it, check the maps, try the RSVP. If anything looks off, edit and republish before sending it to anyone.",
        ],
      },
      {
        h2: "Step 2: Write a message that frames the link",
        body: [
          "A bare link in a chat looks like spam. Always send a short personal message with it. Keep it warm and specific:",
        ],
        list: [
          "Open with the relationship: \"Dear Mama-Papa\" or \"Hi friends!\"",
          "Name the occasion and date clearly in the first two lines",
          "Mention that all details — events, venues, RSVP — are inside the link",
          "Close with a warm line: \"Your presence would mean the world to us\"",
        ],
      },
      {
        h2: "Step 3: Choose the right way to send it",
        body: [
          "For close family, send it as a direct message — it feels personal and gives them a chance to respond. For larger groups, share it in family and friend groups with the same message. WhatsApp Status is excellent for the wider circle: post the link with a one-line caption, and everyone who views your status sees it without you messaging hundreds of people individually.",
          "Avoid broadcasting to contacts who do not know you well — unsolicited broadcast messages get reported, and a reported account causes problems for every future message you send.",
        ],
      },
      {
        h2: "When to send it",
        body: [
          "For Indian weddings, four to six weeks ahead is ideal for digital invitations — enough time for travel plans, not so early that details are still shifting. Send save-the-dates earlier if guests travel from other cities, then the full invitation closer to the date. For functions like Haldi or Mehndi that get planned late, sending a week ahead is perfectly normal.",
        ],
      },
      {
        h2: "Mistakes to avoid",
        body: [
          "Do not send the link without a message. Do not send it at odd hours — mornings between 9 and 11 am see the best open rates in India. Do not forget to include the venue name in your message text; some guests will read the message and only open the link later, so the message itself should carry the essentials.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I send a wedding invitation link on WhatsApp Status?",
        a: "Yes. Status is ideal for the wider circle — post the link with a one-line caption and everyone viewing your status sees it. Keep direct messages for close family and friends.",
      },
      {
        q: "What should the message with the link say?",
        a: "Address the person, name the occasion and date, mention that all details are in the link, and close warmly. Two to four lines is enough.",
      },
      {
        q: "How far in advance should I send it?",
        a: "Four to six weeks before the wedding works well for most Indian celebrations. Send save-the-dates earlier for outstation guests.",
      },
    ],
    relatedSlug: "digital-wedding-invitations",
    relatedLabel: "digital wedding invitations",
  },
  {
    slug: "nikah-invitation-wording-ideas",
    title: "Nikah Invitation Wording Ideas for Every Family",
    description:
      "Nikah invitation wording ideas in English and Urdu tone — formal, warm and bilingual options for Nikah, Walima and Dawat, plus what to include.",
    date: "2026-11-08",
    h1: "Nikah invitation wording ideas",
    intro:
      "The wording of a Nikah invitation carries weight — it is the first formal announcement of the marriage, often read by elders who care deeply about how it is phrased. Whether you want something traditional with duas, a simple modern line, or bilingual wording in Urdu and English, these Nikah invitation wording ideas give you a starting point you can adapt to your family's voice.",
    sections: [
      {
        h2: "What a Nikah invitation should include",
        body: [
          "Before the phrasing, the essentials. Every Nikah invitation needs:",
        ],
        list: [
          "A respectful opening — Bismillah or a warm Islamic greeting",
          "The families' names (bride and groom, and the hosting families)",
          "The Nikah date, time and venue",
          "Walima and Dawat details if they are separate events",
          "An invitation line: \"request the honour of your presence\"",
          "RSVP contact or an in-link RSVP",
        ],
      },
      {
        h2: "Formal wording ideas",
        body: [
          "\"With the blessings of Allah, [Family names] request the honour of your presence at the Nikah ceremony of [Bride] daughter of [Father] with [Groom] son of [Father].\"",
          "\"Bismillah ir-Rahman ir-Rahim. [Family] joyfully invite you to the Nikah of [Names], followed by Walima at [Venue]. Your presence and duas are warmly requested.\"",
        ],
      },
      {
        h2: "Warm, personal wording ideas",
        body: [
          "\"Two families, one prayer. Join us as [Bride] and [Groom] begin their life together — Nikah at [time], Walima at [time], all at [Venue].\"",
          "\"Alhamdulillah, we are getting married! We would be honoured to celebrate the Nikah with you on [date]. Every detail is inside this invitation.\"",
        ],
      },
      {
        h2: "Bilingual wording tips",
        body: [
          "For bilingual invitations, lead with the language elders read most comfortably and follow with the English translation — usually Urdu first, English second, in separate blocks rather than mixed line by line. Keep the dua or blessing in its original Arabic or Urdu form; translating it line-by-line can feel awkward to read aloud.",
        ],
      },
      {
        h2: "Wording for separate Walima and Dawat",
        body: [
          "If Walima is on a different day, give it its own paragraph: \"Walima dinner on [date] at [venue] — kindly join us for the celebration.\" For intimate Dawat at home, a softer line works: \"A simple Dawat at our home follows — your company is the blessing.\"",
        ],
      },
    ],
    faqs: [
      {
        q: "Should the Nikah invitation start with Bismillah?",
        a: "It is traditional and appreciated by most families, but it is your choice. Many invitations open with Bismillah followed by a warm greeting.",
      },
      {
        q: "How do I phrase both families hosting?",
        a: "Use a joint line: \"The families of [Bride's family] and [Groom's family] request the honour of your presence...\" — it signals both sides equally.",
      },
      {
        q: "Can I write the wording myself?",
        a: "Absolutely. Use these ideas as a base, adjust the phrasing to your family's voice, and edit every line directly in the invitation before publishing.",
      },
    ],
    relatedSlug: "nikah-invitations",
    relatedLabel: "Nikah invitations",
  },
  {
    slug: "paper-vs-digital-wedding-invitation-cost",
    title: "Paper vs Digital Wedding Invitation Cost",
    description:
      "Honest cost comparison of paper cards vs digital wedding invitations in India — printing, courier, reprints and per-guest maths, with real numbers.",
    date: "2026-11-05",
    h1: "Paper vs digital wedding invitation cost",
    intro:
      "A printed wedding card in India can cost anywhere from ₹15 to ₹200 per guest once you include design, printing, envelopes and courier — and that is before the first reprint. A digital wedding invitation costs a flat one-time price. Here is the honest maths for Indian weddings, including the costs families forget to count.",
    sections: [
      {
        h2: "The real cost of paper cards",
        body: [
          "The sticker price of a card is never the full cost. Break it down for a 500-guest wedding:",
        ],
        list: [
          "Design + printing: ₹15–₹80 per card depending on paper and finish",
          "Envelope and insert cards: ₹5–₹15 per guest",
          "Courier or hand-delivery: ₹20–₹60 per outstation guest",
          "Reprints when details change: ₹3,000–₹15,000 per round",
          "Rush orders in the final fortnight: often 30–50% premium",
        ],
      },
      {
        h2: "The cost of a digital invitation",
        body: [
          "Mehfill's Basic plan is ₹999 and Premium is ₹1,500 — one-time, per invitation, regardless of guest count. Whether you share it with 50 guests or 5,000, the price does not change. Updates when a venue or timing shifts are free, and there is no courier, no envelopes and no rush fees.",
          "For most mid-size Indian weddings, that is the difference between ₹40,000–₹80,000 on paper logistics and under ₹2,000 digital.",
        ],
      },
      {
        h2: "What families actually do",
        body: [
          "The most common approach in 2026 is both: a digital invitation sent to everyone on WhatsApp, plus a small print run of premium cards for elders, the priest and close relatives who value the physical keepsake. That combination costs a fraction of full printing while keeping the tradition alive where it matters.",
        ],
      },
      {
        h2: "Beyond money: time and stress",
        body: [
          "Paper cards consume weeks — approvals, proofs, printing, addressing, couriering. A digital invitation can be published in an evening. For families planning weddings across cities, that time saving is often worth more than the money.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much does a digital wedding invitation cost?",
        a: "Basic is ₹999 (publishes instantly) and Premium is ₹1,500 (includes human design review). Both are one-time payments with no per-guest charges.",
      },
      {
        q: "Is it cheaper than printing for small weddings?",
        a: "For very small print runs under 50 cards, paper can be comparable — but once courier and reprint costs enter, digital is almost always cheaper.",
      },
      {
        q: "Can I still print keepsake cards?",
        a: "Yes. Many families send the digital link to everyone and print a small premium set for elders — the cost combination is still far below full printing.",
      },
    ],
    relatedSlug: "digital-wedding-invitations",
    relatedLabel: "digital wedding invitations",
  },
  {
    slug: "digital-invitation-with-music-how-to-add-songs",
    title: "Digital Invitation with Music: How to Add Songs",
    description:
      "How music works in digital invitations — picking the right track, volume, mute options and why an e-invite with music feels more personal to your guests.",
    date: "2026-11-02",
    h1: "Digital invitation with music: how to add songs",
    intro:
      "Music is what turns an invitation from a page into a moment. An e-invite with music opens with the same emotional lift as a favourite song because — in many cases — it literally is one. Here is how music works in digital invitations, how to choose the right track, and how to keep it tasteful for every guest.",
    sections: [
      {
        h2: "Why music changes the experience",
        body: [
          "Guests open your invitation inside WhatsApp, mid-conversation. Music signals immediately that this is not a forwarded message — it is an invitation with effort behind it. A shehnai opening for a wedding, a soft ghazal for a Nikah, an upbeat track for a birthday: the first three seconds set the mood before a single word is read.",
        ],
      },
      {
        h2: "Choosing the right track",
        body: [
          "Match the track to the occasion rather than your current favourite:",
        ],
        list: [
          "Weddings: instrumental shehnai, classical or a soft romantic melody",
          "Nikah: gentle nasheed-style or instrumental — avoid loud tracks",
          "Haldi and Mehndi: upbeat folk or dhol energy suits the night",
          "Birthdays: anything celebratory — theme songs work well",
          "Anniversaries: the song from your wedding or a timeless classic",
        ],
      },
      {
        h2: "Volume, autoplay and guest control",
        body: [
          "Good invitation design never blasts audio. Music starts softly when the guest opens the link, with an obvious pause control. Guests on office calls or in quiet places should be able to stop it instantly — and your invitation should never autoplay loudly in a family group where someone opens it during a meeting.",
        ],
      },
      {
        h2: "When not to add music",
        body: [
          "Some families prefer no music at all for religious functions, and some guests open invitations in quiet settings. Every Mehfill template lets you turn music off entirely — or leave it silent for solemn events and keep it for the celebratory ones. The choice stays with you, and it can be changed after publishing.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I use my own song?",
        a: "Yes. Templates support music, and you can choose a track that fits your celebration — from shehnai instrumentals to upbeat folk.",
      },
      {
        q: "Will the music play automatically and loudly?",
        a: "No. Music starts softly with an obvious pause control, so guests in quiet settings stay comfortable.",
      },
      {
        q: "Can I turn music off completely?",
        a: "Yes. Music can be disabled per invitation — a common choice for religious ceremonies and solemn events.",
      },
    ],
    relatedSlug: "digital-invitations",
    relatedLabel: "digital invitations",
  },
  {
    slug: "engagement-invitation-wording-ideas",
    title: "Engagement Invitation Wording Ideas & Tips",
    description:
      "Engagement invitation wording ideas for Indian ring ceremonies — formal, short and social-media-ready options, plus what details to include.",
    date: "2026-10-28",
    h1: "Engagement invitation wording ideas",
    intro:
      "Engagement announcements are the first formal word of your wedding story, and the wording sets the tone for everything that follows. Whether the roka is an intimate home function or a hall full of guests, these engagement invitation wording ideas — from traditional to short and modern — help you say it right.",
    sections: [
      {
        h2: "What to include in an engagement invitation",
        body: [
          "Every engagement invitation needs these essentials, however casual the tone:",
        ],
        list: [
          "Both families' names",
          "The couple's names",
          "Date, time and venue of the ring ceremony",
          "Any separate roka, mehndi or dinner details",
          "RSVP or a contact person",
        ],
      },
      {
        h2: "Traditional wording ideas",
        body: [
          "\"With the blessings of our elders, [Family] request the pleasure of your company at the engagement ceremony of [Bride] and [Groom] on [date] at [venue].\"",
          "\"Roka to ring, and now the beginning. Join us as [Families] celebrate the engagement of [Names] — your presence and blessings are warmly invited.\"",
        ],
      },
      {
        h2: "Short and modern wording",
        body: [
          "\"She said yes. Join us for the ring ceremony on [date] at [venue].\"",
          "\"Two rings, one promise. [Names] are getting engaged — come celebrate with us on [date].\"",
          "\"From best friends to forever. Our engagement party is on [date] at [venue], and it won't be the same without you.\"",
        ],
      },
      {
        h2: "Wording for social sharing",
        body: [
          "When the invitation travels as a WhatsApp forward or Instagram story, shorter works better. Lead with the date, keep the venue in the link, and use one warm closing line. Save the formal third-person phrasing for printed cards or the invitation page itself.",
        ],
      },
    ],
    faqs: [
      {
        q: "Should both families be named in the invitation?",
        a: "Yes — naming both families is standard for Indian engagements and signals that both sides are hosting together.",
      },
      {
        q: "Can the wording be casual?",
        a: "Absolutely. For friend-heavy engagement parties, short and playful lines work better than formal phrasing — match the wording to your guest list.",
      },
      {
        q: "Can I edit the wording after publishing?",
        a: "Yes. Every line in your invitation stays editable from your dashboard, and updates appear instantly for anyone who opens the link.",
      },
    ],
    relatedSlug: "engagement-invitations",
    relatedLabel: "engagement invitations",
  },
];

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
