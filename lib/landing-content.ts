// SEO landing page content — each page has unique, genuinely useful copy.
// No keyword stuffing: one primary intent per page, natural language.
export interface LandingFAQ {
  q: string;
  a: string;
}

export interface LandingPage {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: { h2: string; body: string[]; list?: string[] }[];
  faqs: LandingFAQ[];
  relatedSlugs: string[];
  demoSlug?: string;
  // Search-intent label used only for internal docs, never rendered as keyword stuffing.
  intent: string;
}

export const LANDING_PAGES: LandingPage[] = [
  {
    slug: "digital-wedding-invitations",
    title: "Digital Wedding Invitations in India — Cinematic & Shareable",
    description:
      "Cinematic digital wedding invitations for Indian celebrations — events, RSVP, maps & music in one link. View demos & order on WhatsApp.",
    h1: "Digital wedding invitations, made for India",
    intro:
      "Mehfill creates beautiful digital invitation experiences for weddings across India — Hindu, Muslim, Sikh, Christian and interfaith families. Instead of a paper card that gets lost, your guests open one elegant link with your story, events, venues, photos and RSVP.",
    sections: [
      {
        h2: "What you get in a Mehfill wedding invitation",
        body: [
          "Every invitation is custom-designed around your family, faith and functions — not a fixed template. A typical wedding invitation includes:",
        ],
        list: [
          "A cinematic opening with your names and date",
          "Haldi, Mehndi, Sangeet, wedding and reception schedules",
          "Venue addresses with maps guests can actually follow",
          "Photo galleries, blessings and family introductions",
          "One-tap RSVP so you know who is coming",
          "Music, Urdu/Hindi/English wording and bilingual options",
        ],
      },
      {
        h2: "How ordering works",
        body: [
          "Watch a live demo, message us on WhatsApp with your names, date, venue and photos, and we design your invitation. Essential delivery in 3 days, Signature in 2 days, and Royal in 24–48 hours on priority — with revisions included so you love the result.",
        ],
      },
      {
        h2: "Why families choose digital over paper",
        body: [
          "A link reaches every guest instantly on WhatsApp, updates are free when a venue or time changes, and guests always have directions and RSVP in their pocket. Many families still print a few keepsake cards — your Mehfill link handles everything digital beautifully.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is a digital wedding invitation?",
        a: "A digital wedding invitation is a personal web link with your names, story, event schedule, venues, photos, maps and RSVP — designed beautifully and shared on WhatsApp. Guests open it on any phone with no app needed.",
      },
      {
        q: "How do guests open and RSVP?",
        a: "Guests get one link. It opens beautifully on any phone, shows events and locations, and lets them confirm RSVP in one tap.",
      },
      {
        q: "Can I add photos, videos and maps?",
        a: "Yes. Share your photos, event schedule, venue addresses and wording on WhatsApp and we design them into your invitation with maps and directions.",
      },
      {
        q: "How long does it take?",
        a: "Essential in 3 days, Signature in 2 days, Royal in 24–48 hours on priority. If your function is tomorrow, message us and we will try our best.",
      },
      {
        q: "Can I request changes after delivery?",
        a: "Yes. Every plan includes revisions — 1 in Essential, 3 in Signature, and 7 days of revisions in Royal. We don't stop till you love it.",
      },
    ],
    relatedSlugs: ["nikah-invitations", "engagement-invitations", "birthday-invitations", "anniversary-invitations"],
    intent: "digital wedding invitation (broad)",
  },
  {
    slug: "nikah-invitations",
    title: "Nikah Invitations Online — Elegant Digital Nikah Cards",
    description:
      "Elegant digital Nikah invitations with Urdu and English wording, duas, venue maps and RSVP. Bilingual designs for Nikah, Walima and Dawat. View live demos.",
    h1: "Nikah invitations with adab and elegance",
    intro:
      "Mehfill designs digital Nikah invitations that honour the solemnity of the occasion — Bismillah and duas in beautiful Urdu calligraphy, clear English details for every guest, and venues, Walima and Dawat events in one respectful link.",
    sections: [
      {
        h2: "Designed for Muslim weddings",
        body: [
          "From the first Bismillah to the Walima details, every element follows your family's traditions:",
        ],
        list: [
          "Urdu, English or bilingual wording — including Noto Nastaliq Urdu",
          "Nikah, Dawat, Walima and reception schedules",
          "Duas, blessings and family introductions",
          "Gender-appropriate venue and timing notes where needed",
          "Maps, RSVP and WhatsApp sharing for elders and youth alike",
        ],
      },
      {
        h2: "Live Nikah demos to explore",
        body: [
          "Open our real Nikah demo invitations to feel the experience — a serene emerald design and a soft rose design, both with music, duas and event details. If you love one, we customise it with your names, dates and photos.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I create a Nikah invitation online?",
        a: "Yes. Message us on WhatsApp with your names, Nikah date, venue, Walima details and photos, and we design a bilingual digital invitation with duas, maps and RSVP.",
      },
      {
        q: "Do you support Urdu wording?",
        a: "Yes. We design Urdu, English or bilingual invitations with proper Nastaliq typography alongside clear English details.",
      },
      {
        q: "Can I include Walima and Dawat events?",
        a: "Yes. Nikah, Dawat, Walima and reception can each have their own date, time, venue and map inside the same invitation link.",
      },
      {
        q: "How do I share it with guests?",
        a: "You get one link to share on WhatsApp. Guests open it on any phone with no app needed and can RSVP in one tap.",
      },
    ],
    relatedSlugs: ["muslim-wedding-invitations", "digital-wedding-invitations", "engagement-invitations"],
    intent: "nikah / Muslim wedding invitation",
  },
  {
    slug: "muslim-wedding-invitations",
    title: "Muslim Wedding Invitations — Digital Cards for Nikah & Walima",
    description:
      "Digital Muslim wedding invitations for Nikah, Walima and family Dawats — respectful bilingual design, duas, photos, maps and RSVP in one link.",
    h1: "Muslim wedding invitations, thoughtfully designed",
    intro:
      "For Muslim families who want something modern yet respectful, Mehfill creates digital wedding invitations covering Nikah, Dawat and Walima — with duas, family names, venues and RSVP presented with care in Urdu and English.",
    sections: [
      {
        h2: "What makes them appropriate",
        body: [
          "We follow your guidance on wording, imagery and music. Most families include a Bismillah opening, Nikah and Walima schedules, family introductions, and clear venue directions so elders and outstation guests arrive comfortably.",
        ],
      },
      {
        h2: "From demo to your family",
        body: [
          "Browse our Nikah demos for inspiration, then share your details on WhatsApp. We adapt colours, wording and photos to your family — delivery in 1–3 days depending on plan, with revisions included.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is included in a Muslim wedding invitation?",
        a: "Typically a Bismillah opening, Nikah details, Walima and Dawat schedules, family names, venue maps, photos and RSVP — all in one shareable link, in Urdu, English or both.",
      },
      {
        q: "Can elders open it easily?",
        a: "Yes. Guests get one WhatsApp link that opens on any phone with no app or login. Large type, clear venues and one-tap directions help elders.",
      },
      {
        q: "How long does delivery take?",
        a: "Essential in 3 days, Signature in 2 days, Royal in 24–48 hours on priority, with revisions included.",
      },
    ],
    relatedSlugs: ["nikah-invitations", "digital-wedding-invitations", "anniversary-invitations"],
    intent: "Muslim wedding invitation (supporting, distinct from Nikah page)",
  },
  {
    slug: "birthday-invitations",
    title: "Birthday Invitations Online — Digital Birthday Cards",
    description:
      "Fun digital birthday invitations for kids and adults — theme reveal, venue maps, RSVP and photos in one WhatsApp-ready link. View live demos.",
    h1: "Birthday invitations that feel like a premiere",
    intro:
      "From first birthdays to fiftieths, Mehfill turns your birthday into a cinematic invite — a bold opening, party schedule, venue map, photos and RSVP in one link your friends will actually open.",
    sections: [
      {
        h2: "Perfect for every birthday",
        body: [
          "Kids' birthdays with playful colours, milestone birthdays with elegant storytelling, and late-night parties with a dark luxury feel — each invitation is designed around the birthday star.",
        ],
        list: [
          "Theme reveal and countdown-style opening",
          "Party schedule, venue and map",
          "Photos and a personal note",
          "One-tap RSVP for headcount",
          "WhatsApp-ready sharing",
        ],
      },
      {
        h2: "See live birthday demos",
        body: [
          "Open our live demo invitations to feel the experience — modern designs with party schedules and after-hours events. Love the vibe? We rebuild it with your name, age, date and venue.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I create a birthday invitation online?",
        a: "Yes. Share the birthday star's name, age, date, venue and photos on WhatsApp and we design a digital invitation link you can share with everyone.",
      },
      {
        q: "How do guests RSVP?",
        a: "Guests open your link on any phone and confirm RSVP in one tap — no app needed.",
      },
      {
        q: "How fast can I get it?",
        a: "Essential in 3 days, Signature in 2 days, Royal in 24–48 hours on priority. Urgent party tomorrow? Message us.",
      },
    ],
    relatedSlugs: ["digital-wedding-invitations", "engagement-invitations", "anniversary-invitations"],
    intent: "birthday invitation",
  },
  {
    slug: "engagement-invitations",
    title: "Engagement Invitations Online — Ring Ceremony Cards",
    description:
      "Elegant digital engagement invitations for ring ceremonies and proposals — soft floral design, events, venues, photos and RSVP. View live demos.",
    h1: "Engagement invitations like a love letter",
    intro:
      "Your ring ceremony deserves more than a forwarded message. Mehfill designs soft, editorial engagement invitations with your story, ceremony schedule, venue and RSVP in one beautiful link.",
    sections: [
      {
        h2: "Made for ring ceremonies",
        body: [
          "Whether an intimate family function or a grand engagement party, your invitation covers the ring ceremony, dinner, venues and dress notes with warmth.",
        ],
      },
      {
        h2: "See live engagement demos",
        body: [
          "Open our live demo invitations to feel the experience — modern, minimal and romantic designs. We customise them with your names, date and venue, or design something entirely new.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I create an engagement invitation online?",
        a: "Yes. Share your names, ceremony date, venue and photos on WhatsApp and we design a digital engagement invitation with schedule, maps and RSVP.",
      },
      {
        q: "Can I add both families' names?",
        a: "Yes. We include both families, blessings and any wording you prefer, in your language.",
      },
      {
        q: "How do I share it?",
        a: "You get one link to share on WhatsApp. Guests open it on any phone with no app needed.",
      },
    ],
    relatedSlugs: ["digital-wedding-invitations", "anniversary-invitations", "birthday-invitations"],
    intent: "engagement invitation",
  },
  {
    slug: "anniversary-invitations",
    title: "Anniversary Invitations Online — Silver, Golden & Beyond",
    description:
      "Warm digital anniversary invitations for silver, golden and milestone years — family photos, celebration details, venue maps and RSVP in one link.",
    h1: "Anniversaries worth gathering for",
    intro:
      "Silver, golden or simply another beautiful year — Mehfill creates warm anniversary invitations with your journey, family photos, celebration schedule and RSVP, so children and grandchildren near and far feel included.",
    sections: [
      {
        h2: "Celebrate the journey",
        body: [
          "Share your wedding photo alongside today's family, add blessings from children, and include dinner or prayer schedules with venue directions elders can follow easily.",
        ],
      },
      {
        h2: "Simple to order, easy to share",
        body: [
          "Message us on WhatsApp with names, years together, date, venue and photos. We design your invitation in 1–3 days with revisions, and you share one link with the whole family.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I create an anniversary invitation online?",
        a: "Yes. Share names, anniversary year, celebration date, venue and photos on WhatsApp and we design a warm digital invitation with maps and RSVP.",
      },
      {
        q: "Can elders open it?",
        a: "Yes. One WhatsApp link opens on any phone with no app needed, with large type and clear directions.",
      },
      {
        q: "Can I add family photos?",
        a: "Yes. Then-and-now photos, family introductions and blessings are a lovely part of anniversary invitations.",
      },
    ],
    relatedSlugs: ["digital-wedding-invitations", "birthday-invitations", "engagement-invitations"],
    intent: "anniversary invitation",
  },
  {
    slug: "digital-invitations",
    title: "Digital Invitations for Every Celebration in India",
    description:
      "One studio for all digital invitations — weddings, Nikah, Haldi-Mehndi, engagements, birthdays, anniversaries, baby showers and corporate events.",
    h1: "One link for every celebration",
    intro:
      "Mehfill is a digital invitation studio for every celebration in India. Weddings, Nikah, Haldi and Mehndi, Sangeet, engagements, birthdays, anniversaries, baby showers, faith ceremonies and corporate events — each gets a custom-designed link with schedule, venues, photos and RSVP.",
    sections: [
      {
        h2: "Browse by celebration",
        body: [
          "Start with the celebration closest to yours. Each page shows what is included, how ordering works and real demos to explore:",
        ],
        list: [
          "Weddings — cinematic multi-event invitations",
          "Nikah and Muslim weddings — bilingual, respectful design",
          "Engagements — ring ceremonies and proposals",
          "Birthdays — kids, milestones and parties",
          "Anniversaries — silver, golden and family gatherings",
        ],
      },
      {
        h2: "Why Mehfill",
        body: [
          "Custom design (not a DIY template), WhatsApp ordering, fast 1–3 day delivery with revisions, maps and RSVP built in, and sharing that simply works on Indian mobile networks.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is a digital invitation?",
        a: "A personal web link with your event story, schedule, venues, photos, maps and RSVP — designed beautifully and shared on WhatsApp. Guests open it on any phone with no app needed.",
      },
      {
        q: "Which events do you cover?",
        a: "Weddings, Nikah, Haldi, Mehndi, Sangeet, engagements, birthdays, anniversaries, baby showers, faith ceremonies and corporate events.",
      },
      {
        q: "How does ordering work?",
        a: "Watch a live demo, message us on WhatsApp with your details, pay online, and we design and deliver your shareable invitation link with revisions included.",
      },
      {
        q: "Can I share on WhatsApp?",
        a: "Yes. Every invitation is a single link with a beautiful preview, made for WhatsApp sharing.",
      },
    ],
    relatedSlugs: ["digital-wedding-invitations", "nikah-invitations", "birthday-invitations", "engagement-invitations", "anniversary-invitations", "haldi-invitations", "mehndi-invitations", "event-invitations"],
    intent: "broad digital invitation hub",
  },
  {
    slug: "event-invitations",
    title: "Digital Event Invitations Online — Parties, Pujas & Corporate Events",
    description:
      "Create digital event invitations for parties, pujas, baby showers, baptisms and corporate events — schedule, venue maps, photos and RSVP in one WhatsApp-ready link.",
    h1: "Digital event invitations for every gathering",
    intro:
      "Mehfill.in creates digital event invitations for everything beyond weddings — housewarmings, baby showers, pujas, dawat gatherings, corporate launches and festive parties. One beautiful link carries your schedule, venue, photos and RSVP, ready to share on WhatsApp.",
    sections: [
      {
        h2: "Made for all kinds of events",
        body: [
          "Every event gets the same care as a wedding — clear details guests can follow, and a design that matches the mood:",
        ],
        list: [
          "Baby showers, Godh Bharai and naming ceremonies",
          "Puja, Dawat, Baptism and prayer gatherings",
          "Housewarmings, birthdays and festive parties",
          "Corporate launches, farewells and team celebrations",
          "Venue maps and one-tap RSVP for headcount",
        ],
      },
      {
        h2: "How ordering works",
        body: [
          "Message us on WhatsApp with your event name, date, venue and photos. We design your digital invitation card in 1–3 days with revisions, and you share one link with every guest.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I create an event invitation online?",
        a: "Yes. Share your event name, date, venue and photos on WhatsApp and Mehfill.in designs a digital event invitation link with schedule, maps and RSVP.",
      },
      {
        q: "Can guests open it without an app?",
        a: "Yes. Guests open one link on any phone with no app or login needed, and can confirm RSVP in one tap.",
      },
      {
        q: "How fast is delivery?",
        a: "Essential in 3 days, Signature in 2 days, Royal in 24–48 hours on priority, with revisions included.",
      },
    ],
    relatedSlugs: ["digital-invitations", "birthday-invitations", "anniversary-invitations", "digital-wedding-invitations"],
    intent: "event invitation (broad non-wedding)",
  },
  {
    slug: "haldi-invitations",
    title: "Haldi Invitations Online — Bright Digital Haldi Cards",
    description:
      "Joyful digital Haldi invitations with yellow marigold themes — Haldi date, venue, family details, photos and RSVP in one shareable link. Order on WhatsApp.",
    h1: "Haldi invitations full of sunshine",
    intro:
      "Mehfill.in designs bright digital Haldi invitations that capture the morning's joy — marigold yellows, marigold motifs and playful family photos, with your Haldi date, venue and schedule in one link guests love to open.",
    sections: [
      {
        h2: "What your Haldi invitation includes",
        body: [
          "A focused card for the Haldi function — or part of a full wedding suite covering Haldi, Mehndi, Sangeet and wedding together:",
        ],
        list: [
          "Haldi date, time and venue with maps",
          "Family names and a warm welcome note",
          "Photos, colours and festive motifs",
          "Dress-code notes (yellows and whites)",
          "One-tap RSVP and WhatsApp sharing",
        ],
      },
      {
        h2: "Combine Haldi with Mehndi and Sangeet",
        body: [
          "Most families order Haldi together with Mehndi and Sangeet in one wedding invitation link, so guests see every function in order. Ask us on WhatsApp and we will bundle your pre-wedding functions beautifully.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I create a Haldi invitation online?",
        a: "Yes. Share your Haldi date, venue, family names and photos on WhatsApp and we design a bright digital Haldi invitation link with maps and RSVP.",
      },
      {
        q: "Can Haldi, Mehndi and Sangeet be in one invitation?",
        a: "Yes. We recommend one wedding link with Haldi, Mehndi, Sangeet, wedding and reception as separate events, each with its own time and venue.",
      },
      {
        q: "How do I share it?",
        a: "You get one link to share on WhatsApp. Guests open it on any phone with no app needed.",
      },
    ],
    relatedSlugs: ["mehndi-invitations", "digital-wedding-invitations", "event-invitations"],
    intent: "haldi invitation",
  },
  {
    slug: "mehndi-invitations",
    title: "Mehndi Invitations Online — Festive Digital Mehndi Cards",
    description:
      "Festive digital Mehndi invitations with green and colourful designs — Mehndi date, venue, Sangeet nights, photos and RSVP in one WhatsApp-ready link.",
    h1: "Mehndi invitations, festive and colourful",
    intro:
      "Mehfill.in creates festive digital Mehndi invitations — rich greens, folk patterns and dhol-night energy, with your Mehndi date, venue, Sangeet schedule and family details in one elegant link.",
    sections: [
      {
        h2: "What your Mehndi invitation includes",
        body: [
          "Everything your guests need for the Mehndi and Sangeet celebrations:",
        ],
        list: [
          "Mehndi and Sangeet dates, times and venues with maps",
          "Family names, welcome note and blessings",
          "Photos and festive artwork",
          "Music, dance-night and dress-code notes",
          "RSVP and WhatsApp sharing in one link",
        ],
      },
      {
        h2: "Part of your wedding story",
        body: [
          "Mehndi invitations work beautifully standalone or inside a full digital wedding invitation with Haldi, wedding and reception. Share your functions on WhatsApp and we will structure them in the right order.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I create a Mehndi invitation online?",
        a: "Yes. Share your Mehndi date, venue, Sangeet details and photos on WhatsApp and we design a festive digital Mehndi invitation with maps and RSVP.",
      },
      {
        q: "Can I include Sangeet with Mehndi?",
        a: "Yes. Mehndi and Sangeet are often combined in one invitation with separate timings and venues for each night.",
      },
      {
        q: "How long does delivery take?",
        a: "Essential in 3 days, Signature in 2 days, Royal in 24–48 hours on priority, with revisions included.",
      },
    ],
    relatedSlugs: ["haldi-invitations", "digital-wedding-invitations", "event-invitations"],
    intent: "mehndi invitation",
  },
];

export function getLanding(slug: string) {
  return LANDING_PAGES.find((l) => l.slug === slug);
}
