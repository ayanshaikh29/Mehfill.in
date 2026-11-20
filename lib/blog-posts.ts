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
  {
    slug: "how-to-create-digital-wedding-invitation-india",
    title: "How to Create a Digital Wedding Invitation in India",
    description:
      "Step-by-step guide to creating a digital wedding invitation in India — picking a template, adding events and venues, RSVP setup, and sharing on WhatsApp.",
    date: "2026-11-18",
    h1: "How to create a digital wedding invitation in India",
    intro:
      "Creating a digital wedding invitation used to mean hiring a designer, waiting a week and paying thousands of rupees. Today you can do it yourself in an evening — pick a template, add your names, events and venue, and share a live link on WhatsApp the same night. Here is the complete step-by-step guide, from choosing your design to sending it to 500 guests.",
    sections: [
      {
        h2: "Step 1: Choose a template that matches your wedding style",
        body: [
          "Start by opening live demos — not screenshots, but real invitation websites you can tap through the way your guests will. Look for a design that matches the feeling of your wedding: a marigold-and-gold aesthetic for a traditional Hindu ceremony, an emerald-and-calligraphy design for a Nikah, or a minimal ivory look for a modern reception.",
          "Pay attention to how the demo handles multiple events (Haldi, Mehndi, Sangeet, wedding) and whether the RSVP feels comfortable. If you love a template but want it slightly different, note what you would change — most elements are fully editable after you choose.",
        ],
      },
      {
        h2: "Step 2: Add your couple details and events",
        body: [
          "Once you open the editor, work through it section by section. Start with the couple's names and a short introduction — something a guest who does not know both sides can read and understand. Then add each event in order:",
        ],
        list: [
          "Event name (Haldi, Mehndi, Sangeet, Wedding, Reception)",
          "Date and time (IST — many guests check details the morning of the function)",
          "Venue name and full address (the map auto-populates from the address)",
          "Any dress code or attendance notes (yellow for Haldi, ethnic for Sangeet)",
        ],
      },
      {
        h2: "Step 3: Add photos and personalise wording",
        body: [
          "Upload a couple photo for the opening and family photos for the gallery section. Keep file sizes under 4 MB per image so the invitation loads quickly on mobile data. For wording, use the template's default as a starting point and edit every line — the invitation should sound like your family, not a form letter.",
          "If your wedding involves Urdu or Hindi text, check that the template supports Noto Nastaliq or Devanagari. Bilingual invitations typically lead with the language elders prefer and follow with the English translation in a separate block.",
        ],
      },
      {
        h2: "Step 4: Preview it on a phone before publishing",
        body: [
          "Before paying, preview the invitation on your own phone — not just the desktop editor. Check that names are spelled correctly, every venue address pulls up the right map pin, and RSVP works. Send the preview link to one family member to review — a fresh pair of eyes catches typos that the editor misses.",
        ],
      },
      {
        h2: "Step 5: Pay, publish and share",
        body: [
          "Basic (₹999) goes live the moment your payment succeeds — UPI, card and net banking are all accepted. You receive a unique invitation link (like mehfill.in/i/rahul-weds-priya) that you share on WhatsApp. For Premium (₹1,500), the team reviews your design and delivers within 2–4 days with two rounds of revisions.",
          "Once your link is live, paste it into WhatsApp with a short personal message. For family groups, send it in the group chat. For friends, a direct message feels more personal. For the wider circle, WhatsApp Status with the link and a one-line caption reaches everyone without flooding inboxes.",
        ],
      },
      {
        h2: "What to do when details change after publishing",
        body: [
          "Venue changes, timing shifts and guest-list additions all happen in Indian wedding planning. With a digital invitation, open the editor from your dashboard, make the change, and save — every guest who opens the link from that moment onwards sees the updated version. No reprints, no group message corrections, no calls to explain the update.",
        ],
      },
    ],
    faqs: [
      {
        q: "How long does it take to create a digital wedding invitation?",
        a: "Most couples finish the editor in 30–60 minutes for a full multi-event wedding invitation. Basic publishes instantly after payment.",
      },
      {
        q: "Do I need design skills?",
        a: "No. The templates are pre-designed. You fill in your names, events, venues and photos — the design handles itself.",
      },
      {
        q: "Can I create a bilingual invitation in Hindi and English?",
        a: "Yes. Add Hindi or Urdu wording in the text fields alongside English. Templates support Devanagari and Nasto Nastaliq Urdu scripts.",
      },
      {
        q: "What if I make a mistake after publishing?",
        a: "Open the editor from your dashboard and edit — changes appear instantly for anyone who opens the link. Basic includes unlimited self-edits.",
      },
    ],
    relatedSlug: "digital-wedding-invitations",
    relatedLabel: "digital wedding invitations",
  },
  {
    slug: "wedding-invitation-templates-india-guide",
    title: "Wedding Invitation Templates: A Complete India Guide",
    description:
      "How to choose the right wedding invitation template in India — Hindu, Muslim, Sikh and modern styles, what to customise, and how templates save time vs custom design.",
    date: "2026-11-15",
    h1: "Wedding invitation templates: a complete guide for India",
    intro:
      "A wedding invitation template is a pre-designed layout you personalise with your names, events and photos. For Indian families planning weddings with four to eight functions, a well-chosen template does the heavy creative work in advance — you fill in the details, not the design. Here is how to choose the right template for your wedding style, faith and guest list.",
    sections: [
      {
        h2: "What Indian wedding invitation templates typically include",
        body: [
          "Modern digital wedding invitation templates for India come pre-structured for multi-event weddings — not just the main ceremony but all the functions that surround it:",
        ],
        list: [
          "An opening cover with the couple's names and a cinematic reveal",
          "Individual blocks for Haldi, Mehndi, Sangeet, wedding and reception",
          "Venue sections that auto-populate Google Maps from an address",
          "A photo gallery for couple and family photos",
          "RSVP and digital guest management",
          "Bilingual wording support (Hindi, Urdu, English)",
        ],
      },
      {
        h2: "Hindu wedding invitation templates",
        body: [
          "Traditional Hindu wedding templates draw from marigold motifs, red and gold colour palettes, Devanagari typography and mandala or rangoli design elements. The best ones feel festive without looking cluttered — a clean editorial layout with one or two strong design accents works better than heavy ornamentation that slows mobile loading.",
          "Look for templates that handle the full Hindu wedding suite: Haldi, Mehndi, Sangeet, main ceremony and reception as separate event blocks. Families from Gujarat, Rajasthan, Punjab and Maharashtra each have slightly different naming conventions for the functions — check that the template lets you rename every event heading.",
        ],
      },
      {
        h2: "Muslim and Nikah wedding invitation templates",
        body: [
          "Nikah invitation templates are built around different priorities: Bismillah openings, Urdu-script support, Noto Nastaliq typography and the ability to separate Nikah, Dawat and Walima into distinct event blocks. Music is optional — many families prefer a quiet open or a nasheed-style instrumental, and good Nikah templates let you disable music entirely.",
          "An emerald or ivory palette suits the solemnity of the Nikah better than the bright marigolds of a Haldi; the best Muslim wedding invitation templates balance elegance with clarity for guests of all ages.",
        ],
      },
      {
        h2: "Modern and minimal templates for urban weddings",
        body: [
          "For couples planning destination weddings, court ceremonies or receptions with a contemporary aesthetic, minimal templates work well: serif typography on a cream background, restrained colour accents and a layout that feels closer to editorial print than traditional Indian invitation design.",
          "These templates are equally useful for multicultural and interfaith weddings where you want a neutral, inclusive look — the design does not signal a specific religious tradition, so guests from both sides feel equally addressed.",
        ],
      },
      {
        h2: "Template vs. custom design: which is right for you?",
        body: [
          "A template personalised with your names, photos and wording is indistinguishable from a custom design for most guests — what they see is your family's story, not the underlying template. Custom design makes sense if you have a very specific visual concept (a particular motif, an unusual colour palette or a logo from your wedding stationery set) that no template closely matches.",
          "For the vast majority of Indian weddings, the right template saves 10–15 days and several thousand rupees in design fees. The practical test: open three templates as live demos. If one of them feels like your wedding, use it.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I change the colour palette in a template?",
        a: "Most Mehfill templates come in a curated palette designed to work at every screen brightness — the core colours are set, but all text, wording and photos are fully customisable.",
      },
      {
        q: "How many events can a template include?",
        a: "Every Mehfill template supports multiple events — Haldi, Mehndi, Sangeet, wedding, reception and more — each with its own date, time, venue and map.",
      },
      {
        q: "Can I see the template on mobile before buying?",
        a: "Yes. Every template has a live demo you can open on your phone and tap through exactly as your guests will — no account needed to explore.",
      },
      {
        q: "What is the difference between Basic and Premium templates?",
        a: "All templates are available at ₹999 (Basic, publishes instantly) or ₹1,500 (Premium, adds human design review and two revision rounds). The template design is the same; the difference is in service and delivery.",
      },
    ],
    relatedSlug: "templates",
    relatedLabel: "wedding invitation templates",
  },
  {
    slug: "muslim-wedding-invitation-card-guide",
    title: "Muslim Wedding Invitation Card: Digital Guide for India",
    description:
      "Complete guide to Muslim wedding invitation cards in India — what to include, Nikah and Walima wording, bilingual design, and switching from print to digital.",
    date: "2026-11-12",
    h1: "Muslim wedding invitation card: a digital guide",
    intro:
      "A Muslim wedding invitation card carries more than logistics — it carries the name of Allah, the honour of both families and the warmth of an invitation that extends to both worlds. As more Indian Muslim families move from printed cards to digital invitations, the question is not whether to go digital, but how to do it with the same respect the printed card always had. This guide covers what to include, how to word it, and what to look for in a digital Muslim wedding invitation.",
    sections: [
      {
        h2: "What a Muslim wedding invitation card must include",
        body: [
          "Whether printed or digital, a proper Muslim wedding invitation card includes these elements:",
        ],
        list: [
          "Bismillah ir-Rahman ir-Rahim — the opening blessing",
          "Both families' full names, with the relationship to the bride and groom",
          "Nikah date, time and venue with clear directions",
          "Walima and Dawat details if they are separate events",
          "An invitation line: 'Your presence and duas are warmly requested'",
          "RSVP details or a link where guests can confirm attendance",
        ],
      },
      {
        h2: "Wording: formal, warm and bilingual options",
        body: [
          "The wording on a Muslim wedding invitation card is shaped by family tradition more than any single rule. Formal cards begin in the third person: 'The families of [Bride's father] and [Groom's father] request the honour of your presence.' Warmer, more personal cards speak directly: 'With Allah's blessing, [Bride] and [Groom] invite you to their Nikah.'",
          "For bilingual invitations — which most urban Indian Muslim families prefer — lead with Urdu in proper Nasto Nastaliq script, then follow with an English block. Keep duas in their original Arabic or Urdu form rather than translating them line by line; the cadence matters as much as the meaning.",
        ],
      },
      {
        h2: "Covering Nikah, Walima and Dawat in one invitation",
        body: [
          "Muslim weddings often span multiple days and functions. A good digital Muslim wedding invitation card lists Nikah, Dawat and Walima as separate event blocks, each with its own date, time and venue. This prevents the confusion of guests who receive separate cards for each function and cannot coordinate their travel — particularly important for families spread across cities.",
          "The digital format also makes it easy to give each function the right tone: solemn and formal wording for the Nikah, warm and celebratory for the Walima, intimate and personal for a home Dawat.",
        ],
      },
      {
        h2: "From printed card to digital: what changes and what does not",
        body: [
          "The move from a printed Nikah card to a digital invitation is a logistics change, not a tradition change. The Bismillah stays. The family names stay. The duas stay. What changes is the delivery method: instead of a card in an envelope, guests receive a WhatsApp link that opens to the same respectful design on their phone.",
          "Elders who worry about a link feeling impersonal are often reassured when they see the digital card for themselves — it looks and reads like the printed version they expect, with the addition of a map they can tap and an RSVP they can confirm without calling anyone.",
        ],
      },
      {
        h2: "Choosing a digital design that feels appropriate",
        body: [
          "A Muslim wedding invitation card's design should feel respectful and appropriate for the occasion. Emerald greens, ivory, gold calligraphy and clean geometric patterns work well. Avoid overly festive or loud designs that feel more Bollywood than Bismillah.",
          "Music is optional — many families prefer no music, or a soft nasheed-style instrumental. The best digital Nikah templates let you disable music entirely, include proper Urdu script support, and allow you to list the imam's name and a formal dua at the top of the page.",
        ],
      },
    ],
    faqs: [
      {
        q: "Should a Muslim wedding invitation card start with Bismillah?",
        a: "Yes, it is traditional and respected — almost all Muslim wedding invitation cards, printed or digital, open with Bismillah ir-Rahman ir-Rahim.",
      },
      {
        q: "Can a digital card include Urdu script properly?",
        a: "Yes. Mehfill's Nikah and Muslim wedding templates support Noto Nastaliq Urdu typography, which renders Urdu in the correct right-to-left calligraphic style.",
      },
      {
        q: "Can the invitation cover Nikah and Walima together?",
        a: "Yes. Each event — Nikah, Dawat, Walima — gets its own section with date, time, venue and map, all inside one shareable link.",
      },
      {
        q: "How do elders open it without an app?",
        a: "Guests receive a WhatsApp link that opens in the phone's browser with no app download or login. Large text and simple navigation make it accessible for guests of all ages.",
      },
    ],
    relatedSlug: "muslim-wedding-invitations",
    relatedLabel: "Muslim wedding invitations",
  },
];

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
