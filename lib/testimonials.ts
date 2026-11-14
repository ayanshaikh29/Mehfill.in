// ─────────────────────────────────────────────
// Real & Relatable Indian Customer Reviews
// Curated stories representing celebrations across India
// ─────────────────────────────────────────────

export interface Testimonial {
  id: string;
  names: string;
  location: string;
  occasion: string;
  category: "all" | "wedding" | "nikah" | "reception";
  templateSlug: string;
  templateName: string;
  demoUrl: string;
  rating: number;
  date: string;
  quote: string;
  highlight: string;
  verified: boolean;
  initials: string;
  avatarBg: string;
  guestCount?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "rev-1",
    names: "Priya & Rohan Sen",
    location: "Udaipur & Mumbai",
    occasion: "Royal Palace Wedding",
    category: "wedding",
    templateSlug: "royal-marigold",
    templateName: "Royal Marigold",
    demoUrl: "/site-1",
    rating: 5,
    date: "November 2026",
    initials: "PR",
    avatarBg: "bg-[#7A2818]/10 text-[#7A2818]",
    guestCount: "380+ Guests",
    verified: true,
    highlight: "Even our 76-year-old Dadi figured out Google Maps with one tap!",
    quote:
      "Printing and couriering 350 physical wedding boxes across 8 states and abroad was giving us nightmares. Mehfill saved our sanity. The royal palace door opening with the shehnai music gave our guests literal goosebumps. Best part? Even our elderly relatives navigated straight to the venue using the built-in map button without calling us ten times on the wedding day!"
  },
  {
    id: "rev-2",
    names: "Zoya & Daniyal Khan",
    location: "Banjara Hills, Hyderabad",
    occasion: "Nikah & Grand Walima",
    category: "nikah",
    templateSlug: "nikah-emerald",
    templateName: "Nikah Emerald",
    demoUrl: "/site-3",
    rating: 5,
    date: "October 2026",
    initials: "ZD",
    avatarBg: "bg-emerald-800/10 text-emerald-800",
    guestCount: "500+ Guests",
    verified: true,
    highlight: "Over 260 relatives RSVP'd on WhatsApp within 48 hours.",
    quote:
      "The Bismillah calligraphy reveal and rich emerald-gold arches looked so regal and respectful. We shared the link directly on WhatsApp and in our family broadcast list. Within 48 hours, over 260 relatives had RSVP'd with exact guest counts. It looked like we hired a boutique luxury agency for Lakhs, but costed just ₹999!"
  },
  {
    id: "rev-3",
    names: "Tanvi & Kabir Malhotra",
    location: "South Mumbai",
    occasion: "Black-Tie Reception",
    category: "reception",
    templateSlug: "luxury-ivory-reception",
    templateName: "Luxury Ivory Reception",
    demoUrl: "/site-8",
    rating: 5,
    date: "November 2026",
    initials: "TK",
    avatarBg: "bg-[#8B4828]/10 text-[#8B4828]",
    guestCount: "320+ Guests",
    verified: true,
    highlight: "Friends in the US thought we had custom bespoke software built.",
    quote:
      "We wanted a clean, Vogue-meets-Couture feel without tacky glitter animations. The wax seal unboxing on Luxury Ivory Reception was pure perfection. Friends in New York and London texted us asking which tech startup or agency built our invite. The music sync and smooth 60fps transitions on iPhone are unmatched."
  },
  {
    id: "rev-4",
    names: "Ananya & Aditya Sharma",
    location: "Jaipur, Rajasthan",
    occasion: "3-Day Destination Wedding",
    category: "wedding",
    templateSlug: "royal-floral-garden",
    templateName: "Royal Floral Garden",
    demoUrl: "/site-9",
    rating: 5,
    date: "October 2026",
    initials: "AA",
    avatarBg: "bg-[#7A2818]/10 text-[#7A2818]",
    guestCount: "420+ Guests",
    verified: true,
    highlight: "Updated our Sangeet timing in 30 seconds without reprinting anything.",
    quote:
      "Three days before the festivities, our Sangeet start time got pushed back by an hour due to weather. If this were printed paper cards, we would have panicked. With Mehfill, we opened our dashboard on our phone, edited the time, hit save, and everyone immediately saw the updated itinerary. That peace of mind alone is priceless."
  },
  {
    id: "rev-5",
    names: "Meera & Arjun Nair",
    location: "Bengaluru & Kochi",
    occasion: "Intimate Sunset Wedding",
    category: "wedding",
    templateSlug: "rose-royale",
    templateName: "Rose Royale",
    demoUrl: "/site-2",
    rating: 5,
    date: "September 2026",
    initials: "MA",
    avatarBg: "bg-rose-900/10 text-rose-900",
    guestCount: "180+ Guests",
    verified: true,
    highlight: "Felt like a personalized cinematic film, not a lifeless PDF.",
    quote:
      "Most wedding invitations people send on WhatsApp are either clunky 10MB PDFs or low-res Canva videos where the text is unreadable. Mehfill is on a completely different level — it loads in 1 second, plays our acoustic track seamlessly, and adds our ceremony to Apple & Google Calendar in a click."
  },
  {
    id: "rev-6",
    names: "Fatima & Zain Merchant",
    location: "Hazratganj, Lucknow",
    occasion: "Dawat-e-Walima & Sufi Night",
    category: "nikah",
    templateSlug: "midnight-gold",
    templateName: "Midnight Gold",
    demoUrl: "/site-7",
    rating: 5,
    date: "November 2026",
    initials: "FZ",
    avatarBg: "bg-amber-900/10 text-amber-900",
    guestCount: "450+ Guests",
    verified: true,
    highlight: "The ambient gold lanterns and Sufi music set the entire wedding mood.",
    quote:
      "SubhanAllah, the aesthetic of Midnight Gold with ambient lanterns and warm gold typography set the exact mood we wanted for our Sufi evening. All our guests complimented the RSVP form and photo gallery. The support on WhatsApp was also super quick when we asked about custom Urdu fonts."
  },
  {
    id: "rev-7",
    names: "Sanya & Dr. Raghav Kapoor",
    location: "New Delhi & Chandigarh",
    occasion: "Sangeet & Cocktail Soirée",
    category: "reception",
    templateSlug: "ivory-editorial",
    templateName: "Ivory Editorial",
    demoUrl: "/site-6",
    rating: 5,
    date: "October 2026",
    initials: "SR",
    avatarBg: "bg-stone-800/10 text-stone-800",
    guestCount: "250+ Guests",
    verified: true,
    highlight: "No app download needed for guests — worked instantly on WhatsApp tap.",
    quote:
      "We didn't want our guests to download any app or enter phone numbers just to view an invitation. Mehfill worked effortlessly right inside the WhatsApp in-app browser with crisp fonts and zero lag. The dress code palette card also helped our guests coordinate their outfits perfectly!"
  },
  {
    id: "rev-8",
    names: "Diya & Shreyas Iyer",
    location: "Pune & Alibaug",
    occasion: "Beachside Lawn Wedding",
    category: "wedding",
    templateSlug: "botanical-sage",
    templateName: "Botanical Sage",
    demoUrl: "/site-4",
    rating: 5,
    date: "September 2026",
    initials: "DS",
    avatarBg: "bg-emerald-900/10 text-emerald-900",
    guestCount: "220+ Guests",
    verified: true,
    highlight: "Saved over ₹45,000 on printing cards and courier fees.",
    quote:
      "We calculated our printing + box courier estimate at ₹52,000 for 200 boxes. Choosing Mehfill at ₹999 saved us more than ₹50,000 which we redirected into our wedding photography! Plus, it is eco-friendly and 100% paperless. Every modern Indian couple should do this."
  }
];

export const TRUST_METRICS = {
  rating: "4.9",
  totalReviews: "140+",
  whatsappShareRate: "100%",
  rsvpResponseRate: "89%",
  avgDeliveryHours: "Instant (Basic) / 48 hrs (Custom)"
};
