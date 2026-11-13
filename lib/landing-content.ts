// SEO landing page content — each page has unique, genuinely useful copy.
// No keyword stuffing: one primary intent per page, natural language.
// Titles are raw: the root layout appends " | Mehfill.in" (13 chars), so keep
// them 37–47 chars to land the rendered <title> in the 50–60 char range.
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
  // Curated catalogue templates shown in the sample grid on this page.
  templateSlugs?: string[];
  demoSlug?: string;
  // Search-intent label used only for internal docs, never rendered as keyword stuffing.
  intent: string;
}

export const LANDING_PAGES: LandingPage[] = [
  {
    slug: "digital-wedding-invitations",
    title: "Digital Wedding Invitations — India Online",
    description:
      "Create digital wedding invitations for India — a cinematic e-invite with music, RSVP, maps and photos, ready to share as a WhatsApp wedding invitation.",
    h1: "Digital wedding invitations, made for India",
    intro:
      "Mehfill creates beautiful digital invitation experiences for weddings across India — Hindu, Muslim, Sikh, Christian and interfaith families. Instead of a paper card that gets lost in a drawer, your guests open one elegant link with your story, events, venues, photos and RSVP. It is the same warm invitation your family would have posted, simply better suited to how India communicates today: on WhatsApp.",
    sections: [
      {
        h2: "What you get in a Mehfill wedding invitation",
        body: [
          "Start from a designer-made template and make it yours — every detail stays editable. A typical wedding invitation includes:",
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
        h2: "Why the paper card becomes a better digital invitation",
        body: [
          "Indian families have always sent printed cards — hand-delivered, couriered or pasted on a fridge. The sentiment matters; the logistics do not. A digital wedding invitation reaches every guest the moment you publish it, costs a fraction of printing, and never runs out of stock when a cousin adds five more people to the list.",
          "More importantly, details change. Venues shift, timings move by an hour, a godh-bharai gets added the week before. With a paper card those changes mean reprints and phone calls. With your Mehfill link you edit once and every guest sees the update. Directions, RSVP and photos live in the same place, so nobody has to scroll back through WhatsApp messages to find the address.",
        ],
      },
      {
        h2: "E-invite with music, maps and RSVP in one link",
        body: [
          "Each invitation is a personal web page — an e-invite with music that opens with your names, unfolds your events in order, and ends with directions guests can tap straight into Google Maps. Guests RSVP without an account, and you track responses from your dashboard. Share it as a WhatsApp wedding invitation and it carries a rich preview, so it looks like an invitation the moment it lands in a chat, not a bare URL.",
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
        a: "Yes. Upload photos, add your event schedule, venue addresses and wording right in the editor — maps and directions are built in, and you can change anything later.",
      },
      {
        q: "How long does it take?",
        a: "Basic (₹999) publishes instantly after payment. Premium (₹1,500) adds human design review, typically delivered in 2–4 days with two revision rounds.",
      },
      {
        q: "Can I request changes after delivery?",
        a: "Yes. Basic includes self-editing from your dashboard for as long as your invitation is active. Premium adds two human revision rounds with design review.",
      },
      {
        q: "Can I still print cards for elders?",
        a: "Absolutely. Many families print a small set of keepsake cards for elders while sending the digital link to everyone else. Your Mehfill invitation handles the digital side beautifully.",
      },
    ],
    relatedSlugs: ["nikah-invitations", "engagement-invitations", "birthday-invitations", "anniversary-invitations"],
    templateSlugs: ["royal-marigold", "rose-royale", "botanical-sage", "blush-garden"],
    intent: "digital wedding invitation (broad)",
  },
  {
    slug: "nikah-invitations",
    title: "Nikah Invitations Online — Digital Cards",
    description:
      "Create an online nikah card with Urdu-English wording, duas, Walima and Dawat schedules, maps and RSVP. Elegant digital nikah invitations to view.",
    h1: "Nikah invitations with adab and elegance",
    intro:
      "Mehfill designs digital Nikah invitations that honour the solemnity of the occasion — Bismillah and duas in beautiful Urdu calligraphy, clear English details for every guest, and venues, Walima and Dawat events in one respectful link. Families searching for an online nikah card maker want two things: designs that feel traditional, and wording that can be trusted. Our Nikah templates deliver both, and you stay in control of every line.",
    sections: [
      {
        h2: "Designed around Muslim wedding traditions",
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
        h2: "From a printed nikah card to a digital one",
        body: [
          "Traditionally, nikah cards were printed in small batches and hand-delivered to relatives — a beautiful ritual that becomes stressful when guest lists grow or a venue changes at the last minute. A digital nikah invitation keeps the adab of the printed card while removing the logistics: publish once, share on WhatsApp, and update details without reprinting anything.",
          "Elders often worry that a link will feel unfamiliar. In practice, guests of every age open the invitation in their phone's browser with no app and no login — the same way they open any WhatsApp link. Clear large type, familiar Urdu phrasing and one-tap directions make it comfortable for dadi-nani as much as for cousins abroad.",
        ],
      },
      {
        h2: "Live Nikah demos to explore",
        body: [
          "Open our real Nikah demo invitations to feel the experience — a serene emerald design and a soft rose design, both with music, duas and event details. Choose the one you love and personalise it with your names, dates and photos in the editor.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I create a Nikah invitation online?",
        a: "Yes. Choose a Nikah design, add your names, Nikah date, venue, Walima details and photos in the editor, then publish a bilingual digital invitation with duas, maps and RSVP.",
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
      {
        q: "Can I add duas and blessings?",
        a: "Yes. Bismillah openings, duas and family blessings are part of the template wording and can be edited to match your family's preferred phrasing.",
      },
      {
        q: "How fast is delivery?",
        a: "Basic (₹999) publishes instantly after payment. Premium (₹1,500) adds human design review, typically delivered in 2–4 days with two revision rounds.",
      },
    ],
    relatedSlugs: ["muslim-wedding-invitations", "digital-wedding-invitations", "engagement-invitations"],
    templateSlugs: ["nikah-emerald", "rose-royale"],
    intent: "nikah / Muslim wedding invitation",
  },
  {
    slug: "muslim-wedding-invitations",
    title: "Muslim Wedding Invitations — Nikah & Walima",
    description:
      "Digital Muslim wedding invitations for Nikah, Walima and family Dawats — respectful bilingual design, duas, photos, maps and RSVP in one link.",
    h1: "Muslim wedding invitations, thoughtfully designed",
    intro:
      "For Muslim families who want something modern yet respectful, Mehfill creates digital wedding invitations covering Nikah, Dawat and Walima — with duas, family names, venues and RSVP presented with care in Urdu and English. Whether the celebration spans one evening or an entire weekend, guests receive a single link that holds every function in the right order, with wording your family approves before it goes out.",
    sections: [
      {
        h2: "What makes these invitations appropriate",
        body: [
          "We follow your guidance on wording, imagery and music. Most families include a Bismillah opening, Nikah and Walima schedules, family introductions, and clear venue directions so elders and outstation guests arrive comfortably.",
          "Islamic events often carry specific etiquette — from how names are listed to whether music is included at all. Every element in a Mehfill Muslim wedding invitation is editable, so you decide what appears. Prefer no music? Turn it off. Want the imam's name and a formal dua at the top? Add it. The invitation adapts to your family's practice rather than the other way around.",
        ],
      },
      {
        h2: "One link for the whole wedding",
        body: [
          "Muslim weddings in India frequently span several days — Mehndi, Nikah, Dawat and Walima, sometimes in different cities. Sending separate cards for each function confuses guests. Your digital invitation lists every event with its own date, time, venue and map, so outstation relatives can plan their travel from one page. And because it is a paper card to digital invitation move rather than a redesign of your traditions, the wording, blessings and family names stay exactly as your elders would write them.",
        ],
      },
      {
        h2: "From demo to your family",
        body: [
          "Browse our Nikah demos for inspiration, choose your design, then personalise colours, wording and photos in the editor — Basic publishes as soon as your payment succeeds.",
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
        a: "Basic (₹999) publishes instantly after payment. Premium (₹1,500) adds human design review, typically delivered in 2–4 days with two revision rounds.",
      },
      {
        q: "Can we include Walima in the same invitation?",
        a: "Yes. Nikah, Dawat, Walima and reception each get their own event block with date, time, venue and map inside one link.",
      },
      {
        q: "Is music allowed in the invitation?",
        a: "That is your choice. Music can be enabled or disabled per invitation, and many families prefer a quiet recitation-style opening instead.",
      },
      {
        q: "Can both families' names be shown?",
        a: "Yes. Bride and groom families, elders and blessings can all be listed with the wording your family prefers.",
      },
    ],
    relatedSlugs: ["nikah-invitations", "digital-wedding-invitations", "anniversary-invitations"],
    templateSlugs: ["nikah-emerald", "royal-marigold"],
    intent: "Muslim wedding invitation (supporting, distinct from Nikah page)",
  },
  {
    slug: "birthday-invitations",
    title: "Birthday Invitations Online — Digital Cards",
    description:
      "Create fun digital birthday invitations for kids and adults — theme reveal, venue map, photos and RSVP in one WhatsApp-ready link. Live demos to view.",
    h1: "Birthday invitations that feel like a premiere",
    intro:
      "From first birthdays to fiftieths, Mehfill turns your birthday into a cinematic invite — a bold opening, party schedule, venue map, photos and RSVP in one link your friends will actually open. Printed birthday cards get lost between the fridge and the bin; a digital birthday invitation lives in the chat where the party plan already is, with a countdown to the day and directions one tap away.",
    sections: [
      {
        h2: "Made for every kind of birthday",
        body: [
          "Kids' birthdays with playful colours, milestone birthdays with elegant storytelling, and late-night parties with a dark luxury feel — each invitation is designed around the birthday star:",
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
        h2: "Why digital beats paper for birthdays",
        body: [
          "Birthday plans change fast — the venue shifts, the cake order grows, a friend asks to bring two more kids. A printed card makes every one of those changes expensive. A digital invitation updates instantly, so the headcount you collect through RSVP is always based on the latest details.",
          "It also travels better. College friends in another city, relatives abroad, the neighbour who only has your number — everyone gets the same link at the same moment. No courier, no stamps, no last-minute print shop run on a Saturday afternoon.",
          "For children's birthdays, parents especially appreciate collecting RSVP before ordering cake and return gifts. One-tap confirmations replace the usual evening of follow-up messages, and the invitation itself becomes part of the excitement — kids love opening a link that reveals the theme with music.",
        ],
      },
      {
        h2: "See live birthday demos",
        body: [
          "Open our live demo invitations to feel the experience — modern designs with party schedules and after-hours events. Love the vibe? Choose it and add the birthday star's name, age, date and venue in the editor.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I create a birthday invitation online?",
        a: "Yes. Choose a design and add the birthday star's name, age, date, venue and photos in the editor, then publish a digital invitation link you can share with everyone.",
      },
      {
        q: "How do guests RSVP?",
        a: "Guests open your link on any phone and confirm RSVP in one tap — no app needed.",
      },
      {
        q: "How fast can I get it?",
        a: "Basic publishes the moment your payment succeeds. Premium is typically delivered in 2–4 days with two revision rounds.",
      },
      {
        q: "Can I add a theme or photos?",
        a: "Yes. Choose a template that matches your theme and upload photos of the birthday star, past parties or the surprise plan itself.",
      },
      {
        q: "Can I include the party schedule?",
        a: "Yes. Add cake-cutting, games, dinner and any other slots as separate times inside the same invitation, each with the venue map.",
      },
    ],
    relatedSlugs: ["digital-wedding-invitations", "engagement-invitations", "anniversary-invitations"],
    templateSlugs: ["midnight-gold", "ivory-editorial"],
    intent: "birthday invitation",
  },
  {
    slug: "engagement-invitations",
    title: "Engagement Invitations Online — Ring Cards",
    description:
      "Design elegant digital engagement invitations for ring ceremonies — story, schedule, venue maps, photos and RSVP in one beautiful link. View live demos.",
    h1: "Engagement invitations like a love letter",
    intro:
      "Your ring ceremony deserves more than a forwarded message. Mehfill designs soft, editorial engagement invitations with your story, ceremony schedule, venue and RSVP in one beautiful link. Families searching for engagement invitation cards online often settle for a generic image forwarded on WhatsApp — an invitation from Mehfill is personal, detailed and ready to share the moment your families agree on the date.",
    sections: [
      {
        h2: "Made for ring ceremonies",
        body: [
          "Whether an intimate family function or a grand engagement party, your invitation covers the ring ceremony, dinner, venues and dress notes with warmth. Include both families' names, how the couple met, and a blessing from the elders — the details that make an engagement feel like the beginning of a story rather than a formality.",
        ],
      },
      {
        h2: "From a paper card to a digital invitation",
        body: [
          "Engagement functions are often planned quickly — sometimes within weeks of the roka. Printing cards in that window means rushed orders and courier deadlines. A digital engagement invitation removes the clock entirely: choose a template in the evening, publish the same night, and start sharing on WhatsApp before the dinner invitations are even designed.",
          "Guests get directions, schedule and RSVP in the same place, and if the venue changes a day before, you edit once instead of making twenty phone calls.",
          "It is also the first introduction to your wedding story. Families often send the engagement link first and reuse the same names, photos and design language for the wedding invitation later, so guests recognise the celebration from the very first message.",
        ],
      },
      {
        h2: "See live engagement demos",
        body: [
          "Open our live demo invitations to feel the experience — modern, minimal and romantic designs. Choose the one you love and personalise it with your names, date and venue in the editor.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I create an engagement invitation online?",
        a: "Yes. Choose a design and add your names, ceremony date, venue and photos in the editor, then publish a digital engagement invitation with schedule, maps and RSVP.",
      },
      {
        q: "Can I add both families' names?",
        a: "Yes. We include both families, blessings and any wording you prefer, in your language.",
      },
      {
        q: "How do I share it?",
        a: "You get one link to share on WhatsApp. Guests open it on any phone with no app needed.",
      },
      {
        q: "Can the invitation include our engagement story?",
        a: "Yes. Add a short note about how you met, the proposal or a favourite photo — the personal details that make the invitation feel like yours.",
      },
      {
        q: "How quickly can I publish?",
        a: "Basic (₹999) publishes instantly after payment, which suits short engagement timelines. Premium adds design review within 2–4 days.",
      },
    ],
    relatedSlugs: ["digital-wedding-invitations", "anniversary-invitations", "birthday-invitations"],
    templateSlugs: ["blush-garden", "ivory-editorial"],
    intent: "engagement invitation",
  },
  {
    slug: "anniversary-invitations",
    title: "Anniversary Invitations Online — Digital Cards",
    description:
      "Create warm digital anniversary invitations for silver, golden and milestone years — family photos, celebration details, maps and RSVP in one link.",
    h1: "Anniversaries worth gathering for",
    intro:
      "Silver, golden or simply another beautiful year — Mehfill creates warm anniversary invitations with your journey, family photos, celebration schedule and RSVP, so children and grandchildren near and far feel included. An anniversary party is one of the few occasions where three generations travel from different cities; giving them one clear link with directions, timings and a place to RSVP makes the gathering easier for everyone.",
    sections: [
      {
        h2: "Celebrate the journey",
        body: [
          "Share your wedding photo alongside today's family, add blessings from children, and include dinner or prayer schedules with venue directions elders can follow easily. Milestone years — 25th, 40th, 50th — deserve a proper retelling: how the family grew, where the years took you, and who is coming to celebrate.",
          "For golden and diamond anniversaries, many families also include a short tribute from the children, a timeline of family milestones, and photos from the original wedding album. The invitation becomes a small story guests read forward in the family group long before the party itself.",
        ],
      },
      {
        h2: "Why families choose a digital card",
        body: [
          "Paper invitations for anniversaries usually have to be posted weeks ahead to reach relatives in other states. A digital anniversary invitation can go out the day the date is fixed — and if the banquet hall changes, everyone sees it immediately.",
          "Grandchildren especially appreciate a link they can open on a phone and share forward in family groups. Photos from the wedding day next to photos from this year turn the invitation into a small keepsake that lives in the chat instead of a drawer.",
        ],
      },
      {
        h2: "Simple to start, easy to share",
        body: [
          "Choose a design, add names, years together, date, venue and photos in the editor, pay securely, and publish in minutes — then share one link with the whole family.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I create an anniversary invitation online?",
        a: "Yes. Choose a design and add names, anniversary year, celebration date, venue and photos in the editor, then publish a warm digital invitation with maps and RSVP.",
      },
      {
        q: "Can elders open it?",
        a: "Yes. One WhatsApp link opens on any phone with no app needed, with large type and clear directions.",
      },
      {
        q: "Can I add family photos?",
        a: "Yes. Then-and-now photos, family introductions, children's blessings and a short tribute are a lovely part of anniversary invitations — guests often read them more than once.",
      },
      {
        q: "Which milestones do people use it for?",
        a: "Silver (25th), ruby (40th), golden (50th) and diamond (60th) anniversaries, as well as simple yearly celebrations with close family and friends.",
      },
      {
        q: "How do guests RSVP?",
        a: "Guests confirm attendance in one tap from the invitation, and you see the headcount from your dashboard.",
      },
    ],
    relatedSlugs: ["digital-wedding-invitations", "birthday-invitations", "engagement-invitations"],
    templateSlugs: ["ivory-editorial", "luxury-ivory-reception"],
    intent: "anniversary invitation",
  },
  {
    slug: "digital-invitations",
    title: "Digital Invitations for Every Celebration",
    description:
      "One studio for every digital invitation in India — weddings, Nikah, Haldi, birthdays, baby showers and more. Shareable links with RSVP, maps and photos.",
    h1: "One link for every celebration",
    intro:
      "Mehfill is a digital invitation studio for every celebration in India. Weddings, Nikah, Haldi and Mehndi, Sangeet, engagements, birthdays, anniversaries, baby showers, faith ceremonies and corporate events — each gets its own shareable link with schedule, venues, photos and RSVP. Whether you want a video invitation maker experience with music and cinematic reveals or a clean, minimal card, the process is the same: pick a design, make it yours, publish, share.",
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
          "Haldi, Mehndi and baby showers — joyful pre-wedding functions",
        ],
      },
      {
        h2: "Why the paper card moves to digital",
        body: [
          "A printed card tells guests where to be; a digital invitation tells them where to be, how to get there, what is happening at each hour, and whether you are expecting them — all in a link they already know how to open. Printing still has its place for keepsakes, but for everything logistical, the digital version is simply more useful.",
          "It is also kinder to the budget. One invitation design scales from thirty guests to three thousand at no extra cost, updates are free forever, and there is no minimum order quantity when a family function doubles in size.",
        ],
      },
      {
        h2: "Why Mehfill",
        body: [
          "Designer-made templates you personalise yourself, transparent one-time pricing, instant publishing after payment with Basic, maps and RSVP built in, and sharing that simply works on Indian mobile networks.",
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
        a: "Choose a template, add your details in the editor, pay securely at checkout, and publish your shareable invitation link — instantly with Basic.",
      },
      {
        q: "Can I share on WhatsApp?",
        a: "Yes. Every invitation is a single link with a beautiful preview, made for WhatsApp sharing.",
      },
      {
        q: "Can I add music and photos?",
        a: "Yes. Templates support music, photo galleries, event schedules and maps — all editable from your dashboard.",
      },
      {
        q: "Is there a subscription?",
        a: "No. Both Basic (₹999) and Premium (₹1,500) are one-time payments per invitation, with no recurring fees.",
      },
    ],
    relatedSlugs: [
      "digital-wedding-invitations",
      "nikah-invitations",
      "birthday-invitations",
      "engagement-invitations",
      "anniversary-invitations",
      "haldi-invitations",
      "mehndi-invitations",
      "event-invitations",
      "baby-shower-invitations",
    ],
    templateSlugs: ["royal-marigold", "nikah-emerald", "midnight-gold", "blush-garden"],
    intent: "broad digital invitation hub",
  },
  {
    slug: "event-invitations",
    title: "Digital Event Invitations — Parties & Pujas",
    description:
      "Create digital event invitations for parties, pujas, baby showers and corporate events — schedule, venue maps, photos and RSVP in one WhatsApp link.",
    h1: "Digital event invitations for every gathering",
    intro:
      "Mehfill.in creates digital event invitations for everything beyond weddings — housewarmings, baby showers, pujas, dawat gatherings, corporate launches and festive parties. One beautiful link carries your schedule, venue, photos and RSVP, ready to share on WhatsApp. If you have ever coordinated a puja or a party over a dozen phone calls, you know how much a single clear invitation saves everyone.",
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
        h2: "Why digital beats printed cards for events",
        body: [
          "Event invitations have the shortest lifespan of any printed card — bought for a date two weeks away, and obsolete the moment a timing changes. A digital event invitation costs less, lands faster and stays accurate. For office events especially, a link in the team group replaces the awkward 'please forward the card' chain and gives you an RSVP count for catering before the order goes in.",
          "Hosts also avoid the awkwardness of uninvited guests discovering the event from someone else's card. One link, shared deliberately with the people you invite, keeps the gathering the size you planned — and anyone who needs a plus-one can ask before the headcount is final.",
        ],
      },
      {
        h2: "How ordering works",
        body: [
          "Pick a template, add your event name, date, venue and photos in the editor, and publish your digital invitation card — then share one link with every guest. Basic (₹999) goes live the moment payment succeeds, which suits events coming up quickly.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I create an event invitation online?",
        a: "Yes. Choose a design and add your event name, date, venue and photos in the editor to publish a digital event invitation link with schedule, maps and RSVP.",
      },
      {
        q: "Can guests open it without an app?",
        a: "Yes. Guests open one link on any phone with no app or login needed, and can confirm RSVP in one tap.",
      },
      {
        q: "How fast is delivery?",
        a: "Basic (₹999) publishes instantly after payment. Premium (₹1,500) is typically delivered in 2–4 days with two revision rounds.",
      },
      {
        q: "Can I use it for office or corporate events?",
        a: "Yes. Launches, farewells, team celebrations and annual days work well — share the link in your work chat and track RSVPs for catering.",
      },
      {
        q: "Can one invitation cover multiple events?",
        a: "Yes. Add each function — for example puja, lunch and evening aarti — as separate events with their own times and venues.",
      },
    ],
    relatedSlugs: ["digital-invitations", "birthday-invitations", "anniversary-invitations", "digital-wedding-invitations", "baby-shower-invitations"],
    templateSlugs: ["midnight-gold", "botanical-sage"],
    intent: "event invitation (broad non-wedding)",
  },
  {
    slug: "haldi-invitations",
    title: "Haldi Invitations Online — Digital Cards",
    description:
      "Create joyful digital Haldi invitations with marigold themes — Haldi date, venue, family details, photos and RSVP in one shareable link. View demos.",
    h1: "Haldi invitations full of sunshine",
    intro:
      "Mehfill.in designs bright digital Haldi invitations that capture the morning's joy — marigold yellows, turmeric motifs and playful family photos, with your Haldi date, venue and schedule in one link guests love to open. The Haldi is the loosest, happiest function of an Indian wedding; the invitation should feel the same way before a single word is read.",
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
        h2: "Why send it digitally",
        body: [
          "Haldi functions are often decided later than the wedding itself — sometimes only weeks before, especially when families travel. Printing separate cards under that pressure is expensive and slow. A digital Haldi invitation can be published the same day the date is confirmed and shared across family groups instantly.",
          "It also solves the classic Haldi problem: everyone needs to know it is a 'yellow dress, expect to get messy' event. Putting the dress code, timing and venue in one link means fewer calls asking what to wear and when to arrive.",
          "Because the Haldi usually happens at a relative's home rather than a known banquet hall, the built-in map matters more than usual. Guests follow turn-by-turn directions straight from the invitation instead of asking the family to share locations the morning of the function.",
        ],
      },
      {
        h2: "Combine Haldi with Mehndi and Sangeet",
        body: [
          "Most families keep Haldi, Mehndi and Sangeet in one wedding invitation link, so guests see every function in order. Add each function as its own event in the editor — every function gets its own date, time, venue and map.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I create a Haldi invitation online?",
        a: "Yes. Choose a design and add your Haldi date, venue, family names and photos in the editor, then publish a bright digital Haldi invitation with maps and RSVP.",
      },
      {
        q: "Can Haldi, Mehndi and Sangeet be in one invitation?",
        a: "Yes. We recommend one wedding link with Haldi, Mehndi, Sangeet, wedding and reception as separate events, each with its own time and venue.",
      },
      {
        q: "How do I share it?",
        a: "You get one link to share on WhatsApp. Guests open it on any phone with no app needed.",
      },
      {
        q: "Can I mention the dress code?",
        a: "Yes. Add a yellow-and-white dress code note, timing for when haldi will be applied, and any other instructions right in the invitation.",
      },
      {
        q: "How fast can I publish a Haldi card?",
        a: "Basic publishes the moment payment succeeds — ideal when the Haldi date is confirmed late. Premium takes 2–4 days with design review.",
      },
    ],
    relatedSlugs: ["mehndi-invitations", "digital-wedding-invitations", "event-invitations"],
    templateSlugs: ["royal-marigold", "botanical-sage"],
    intent: "haldi invitation",
  },
  {
    slug: "mehndi-invitations",
    title: "Mehndi Invitations Online — Digital Cards",
    description:
      "Create festive digital Mehndi invitations with green designs — Mehndi date, venue, Sangeet nights, photos and RSVP in one WhatsApp-ready link.",
    h1: "Mehndi invitations, festive and colourful",
    intro:
      "Mehfill.in creates festive digital Mehndi invitations — rich greens, folk patterns and dhol-night energy, with your Mehndi date, venue, Sangeet schedule and family details in one elegant link. The Mehndi night is where the music starts and the whole wedding party relaxes; the invitation should carry that excitement the moment guests open it.",
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
        h2: "Why families send Mehndi invitations digitally",
        body: [
          "Mehndi guest lists are the most fluid of the wedding functions — friends invite friends, cousins bring cousins, and the number grows until the night itself. A digital Mehndi invitation welcomes that growth: there is no reprint cost when the list doubles, and RSVP tells you how many chairs to arrange.",
          "For guests coming from out of town, the same link also carries the wedding schedule, so a Mehndi invite doubles as their first look at the full celebration. Directions matter here too — Mehndi venues are often homes or banquet halls that guests do not visit regularly, and one-tap maps prevent the usual 'we are lost, send the location' calls.",
          "The night itself is photographed heavily, and guests often revisit the invitation link for the schedule when planning which functions to attend. A design with music and folk motifs sets the dhol-night mood before anyone arrives.",
        ],
      },
      {
        h2: "Part of your wedding story",
        body: [
          "Mehndi invitations work beautifully standalone or inside a full digital wedding invitation with Haldi, wedding and reception. Add each function as a separate event in the editor so guests see them in the right order.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I create a Mehndi invitation online?",
        a: "Yes. Choose a design and add your Mehndi date, venue, Sangeet details and photos in the editor, then publish a festive digital invitation with maps and RSVP.",
      },
      {
        q: "Can I include Sangeet with Mehndi?",
        a: "Yes. Mehndi and Sangeet are often combined in one invitation with separate timings and venues for each night.",
      },
      {
        q: "How long does delivery take?",
        a: "Basic (₹999) publishes instantly after payment. Premium (₹1,500) adds human design review, typically delivered in 2–4 days with two revision rounds.",
      },
      {
        q: "Can I add music to the invitation?",
        a: "Yes. Mehndi templates support music so guests hear the mood before they arrive — you choose the track.",
      },
      {
        q: "Can I share it in family groups?",
        a: "Yes. One WhatsApp link with a rich preview works in groups, statuses and direct chats alike.",
      },
    ],
    relatedSlugs: ["haldi-invitations", "digital-wedding-invitations", "event-invitations"],
    templateSlugs: ["nikah-emerald", "botanical-sage"],
    intent: "mehndi invitation",
  },
  {
    slug: "baby-shower-invitations",
    title: "Baby Shower Invitations Online — Digital",
    description:
      "Create sweet digital baby shower invitations — Godh Bharai details, venue maps, photos and RSVP in one WhatsApp-ready link. View live demos online.",
    h1: "Baby shower invitations as sweet as the news",
    intro:
      "Mehfill.in designs warm digital baby shower invitations for Godh Bharai, naming ceremonies and modern baby showers — soft colours, the parents-to-be's story, venue details and RSVP in one link your family will love forwarding. Whether the function is a quiet home gathering or a decorated hall full of aunts and cousins, the invitation sets the tenderness of the occasion before guests arrive.",
    sections: [
      {
        h2: "What your baby shower invitation includes",
        body: [
          "Everything guests need for the celebration, designed gently around the occasion:",
        ],
        list: [
          "Godh Bharai, baby shower or naming ceremony details",
          "Date, time and venue with maps",
          "Names of the parents-to-be and host family",
          "Photos, soft motifs and a personal note",
          "Dress-code or ritual notes for guests",
          "One-tap RSVP and WhatsApp sharing",
        ],
      },
      {
        h2: "Why digital beats paper for a baby shower",
        body: [
          "Baby showers are planned around the mother's comfort — often at short notice and with a guest list that changes as family travels in. A printed card adds courier stress nobody needs in the third trimester. A digital baby shower invitation goes out the day the date is fixed, updates for free if timings shift, and keeps every detail — including the ritual instructions elders ask for — in one place.",
          "Guests arriving from other cities also appreciate finding the venue map, parking note and schedule in the same link instead of digging through forwarded messages.",
          "New parents are often juggling advice from every direction; one less thing to coordinate is a genuine gift. Publish once, share in the family group, and let RSVP handle the headcount for lunch or dinner planning.",
        ],
      },
      {
        h2: "Part of the wider celebration",
        body: [
          "Many families host the Godh Bharai alongside other functions. Your baby shower invitation can stand alone or sit inside a broader family event invitation — add each function in the editor with its own time and venue.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I create a baby shower invitation online?",
        a: "Yes. Choose a design and add the parents-to-be's names, date, venue and photos in the editor, then publish a digital baby shower invitation with maps and RSVP.",
      },
      {
        q: "Do you have Godh Bharai designs?",
        a: "Yes. Traditional Godh Bharai and modern baby shower styles are both available, with wording you can edit to match your family's customs.",
      },
      {
        q: "How do I share it with guests?",
        a: "One link to share on WhatsApp — guests open it on any phone with no app needed and can RSVP in one tap.",
      },
      {
        q: "Can I include ritual or dress-code notes?",
        a: "Yes. Add what to bring, what to wear and any ceremony timings so guests arrive prepared.",
      },
      {
        q: "How fast can I publish?",
        a: "Basic (₹999) publishes instantly after payment — useful when the date is confirmed late. Premium adds design review in 2–4 days.",
      },
    ],
    relatedSlugs: ["birthday-invitations", "event-invitations", "digital-invitations", "anniversary-invitations"],
    templateSlugs: ["blush-garden", "ivory-editorial"],
    intent: "baby shower / Godh Bharai invitation",
  },
];

export function getLanding(slug: string) {
  return LANDING_PAGES.find((l) => l.slug === slug);
}
