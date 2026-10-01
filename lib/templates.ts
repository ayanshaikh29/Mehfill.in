export type TemplateCategory =
  | "Weddings"
  | "Birthdays"
  | "Engagement"
  | "Haldi & Mehndi"
  | "Anniversary"
  | "Baby Shower"
  | "Parties"
  | "Other Events";

export interface DemoEvent {
  name: string;
  date: string;
  time: string;
  venue: string;
}

export interface Template {
  slug: string;
  name: string;
  occasion: TemplateCategory;
  tagline: string;
  description: string;
  palette: { bg: string; ink: string; accent: string };
  image: string;
  gallery: string[];
  data: {
    names: string;
    date: string;
    venue: string;
    location: string;
    events: DemoEvent[];
  };
}

export const TEMPLATES: Template[] = [
  {
    slug: "eternal",
    name: "Eternal",
    occasion: "Weddings",
    tagline: "Elegant cinematic wedding experience",
    description:
      "Antique doors, marigold light and a slow reveal — a wedding that begins before guests arrive.",
    palette: { bg: "#1C1917", ink: "#FDF9F3", accent: "#C9A86A" },
    image: "/images/templates/eternal_cover.jpg",
    gallery: [
      "/images/templates/eternal_cover.jpg",
      "/images/occasions/haldi_mehndi.jpg",
      "/images/hero/cinematic_banner.jpg",
    ],
    data: {
      names: "Aarav & Amara",
      date: "14 . 02 . 2027 — Udaipur",
      venue: "The Leela Palace, Udaipur",
      location: "Udaipur, Rajasthan",
      events: [
        { name: "Haldi", date: "Feb 12", time: "10 AM", venue: "Courtyard" },
        { name: "Mehndi", date: "Feb 13", time: "4 PM", venue: "Poolside Lawns" },
        { name: "Wedding", date: "Feb 14", time: "7 PM", venue: "Darbar Hall" },
        { name: "Reception", date: "Feb 15", time: "7 PM", venue: "Grand Terrace" },
      ],
    },
  },
  {
    slug: "bloom",
    name: "Bloom",
    occasion: "Engagement",
    tagline: "Soft floral celebration",
    description:
      "Blush editorial minimalism — a modern engagement told like a love letter.",
    palette: { bg: "#FDF9F3", ink: "#1C1917", accent: "#B96A4B" },
    image: "/images/occasions/engagements.jpg",
    gallery: [
      "/images/occasions/engagements.jpg",
      "/images/occasions/anniversaries.jpg",
      "/images/hero/hero_wedding.jpg",
    ],
    data: {
      names: "Zoya & Arham",
      date: "09 . 01 . 2027 — Delhi",
      venue: "The Lodhi, New Delhi",
      location: "New Delhi",
      events: [
        { name: "Ring Ceremony", date: "Jan 09", time: "6 PM", venue: "The Verandah" },
        { name: "Dinner", date: "Jan 09", time: "8 PM", venue: "Private Lawns" },
      ],
    },
  },
  {
    slug: "midnight",
    name: "Midnight",
    occasion: "Birthdays",
    tagline: "Modern dark luxury experience",
    description:
      "Charcoal, champagne and bold type — a birthday that feels like a premiere.",
    palette: { bg: "#111110", ink: "#F5F0E6", accent: "#C9A86A" },
    image: "/images/occasions/birthdays.jpg",
    gallery: [
      "/images/occasions/birthdays.jpg",
      "/images/occasions/parties.jpg",
      "/images/occasions/corporate.jpg",
    ],
    data: {
      names: "Aria turns 25",
      date: "18 . 07 . 2026 — Mumbai",
      venue: "Soho House, Juhu",
      location: "Mumbai",
      events: [
        { name: "Cocktails", date: "Jul 18", time: "7 PM", venue: "Rooftop" },
        { name: "After Hours", date: "Jul 18", time: "10 PM", venue: "Listening Bar" },
      ],
    },
  },
];

export const CATEGORIES: ("All" | TemplateCategory)[] = [
  "All",
  "Weddings",
  "Birthdays",
  "Engagement",
  "Haldi & Mehndi",
  "Anniversary",
  "Baby Shower",
  "Parties",
  "Other Events",
];

export function getTemplate(slug: string): Template | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}
