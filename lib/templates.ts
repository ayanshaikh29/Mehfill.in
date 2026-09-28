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
    image:
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1610173826608-bd1f53a52db1?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595407753234-0882f1e77954?q=80&w=1200&auto=format&fit=crop",
    ],
    data: {
      names: "Ayan & Amara",
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
    slug: "riwaayat",
    name: "Riwaayat",
    occasion: "Weddings",
    tagline: "Traditional Indian elegance",
    description:
      "Ivory, gold and quiet tradition — for families who want heritage with restraint.",
    palette: { bg: "#FAF5EB", ink: "#1C1917", accent: "#96522F" },
    image:
      "https://images.unsplash.com/photo-1610173826608-bd1f53a52db1?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1610173826608-bd1f53a52db1?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1587271636175-90d58cdad458?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1200&auto=format&fit=crop",
    ],
    data: {
      names: "Kabir & Meher",
      date: "22 . 11 . 2026 — Jaipur",
      venue: "Samode Haveli, Jaipur",
      location: "Jaipur, Rajasthan",
      events: [
        { name: "Mehndi", date: "Nov 20", time: "11 AM", venue: "Sheesh Mahal" },
        { name: "Sangeet", date: "Nov 21", time: "7 PM", venue: "Durbar Hall" },
        { name: "Wedding", date: "Nov 22", time: "8 PM", venue: "Palace Courtyard" },
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
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1200&auto=format&fit=crop",
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
    image:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop",
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
  {
    slug: "moments",
    name: "Moments",
    occasion: "Anniversary",
    tagline: "Minimal romantic experience",
    description:
      "Quiet, warm and deeply personal — twenty-five years, told gently.",
    palette: { bg: "#EFE6D5", ink: "#1C1917", accent: "#7C7A5A" },
    image:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1200&auto=format&fit=crop",
    ],
    data: {
      names: "Rhea & Vikram — 25 Years",
      date: "05 . 12 . 2026 — Goa",
      venue: "Ahilya by the Sea, Goa",
      location: "Goa",
      events: [
        { name: "Vow Renewal", date: "Dec 05", time: "5 PM", venue: "Sea Deck" },
        { name: "Family Dinner", date: "Dec 05", time: "8 PM", venue: "Fig Tree" },
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
