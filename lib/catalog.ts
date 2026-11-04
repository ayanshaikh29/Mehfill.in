// Purchasable invitation templates. Each entry declares the renderer
// variant, theme palette and which editable fields the Basic editor
// exposes for that design. Static showcase demos (site-1..7) stay on
// /demos as inspiration; these are the product templates.

export type RendererVariant = "royal" | "botanical" | "ivory" | "emerald";

export interface TemplateFieldFlags {
  names: boolean;
  familyNames: boolean;
  message: boolean;
  date: boolean;
  events: boolean;
  venue: boolean;
  maps: boolean;
  gallery: boolean;
  rsvp: boolean;
  music: boolean;
}

export interface CatalogTemplate {
  slug: string;
  name: string;
  occasion: string;
  tagline: string;
  description: string;
  image: string;
  variant: RendererVariant;
  palette: { bg: string; ink: string; accent: string; muted: string };
  coverImage: string;
  fields: TemplateFieldFlags;
  demoUrl?: string;
}

const ALL_FIELDS: TemplateFieldFlags = {
  names: true,
  familyNames: true,
  message: true,
  date: true,
  events: true,
  venue: true,
  maps: true,
  gallery: true,
  rsvp: true,
  music: false,
};

export const CATALOG: CatalogTemplate[] = [
  {
    slug: "royal-marigold",
    name: "Royal Marigold",
    occasion: "Wedding",
    tagline: "Deep maroon & antique gold grandeur",
    description:
      "A regal mandap-inspired design with rich maroon, gold accents and a cinematic tap-to-open reveal — perfect for traditional Indian weddings.",
    image: "/site-7/cover.jpg",
    variant: "royal",
    palette: { bg: "#2A0F0F", ink: "#FFF4E2", accent: "#C9A86A", muted: "#F4E4C8" },
    coverImage: "/images/hero/cinematic_banner.jpg",
    fields: { ...ALL_FIELDS, music: true },
    demoUrl: "/site-7",
  },
  {
    slug: "rose-royale",
    name: "Rose Royale",
    occasion: "Wedding · Shaadi",
    tagline: "Sunset pinks with royal gold",
    description:
      "Blush-rose and deep wine tones with golden flourishes and a grand reveal — a royal wedding told at sunset.",
    image: "/demos/aariz-zoya-cover.jpg",
    variant: "royal",
    palette: { bg: "#3B0A0A", ink: "#FDF9F3", accent: "#C9A86A", muted: "#F2DCD4" },
    coverImage: "/images/hero/hero_wedding.jpg",
    fields: { ...ALL_FIELDS, music: true },
    demoUrl: "/site-2",
  },
  {
    slug: "nikah-emerald",
    name: "Nikah Emerald",
    occasion: "Nikah · Wedding",
    tagline: "Emerald green bilingual elegance",
    description:
      "Deep emerald and gold with refined Arabic-inspired ornamentation — crafted for Nikah and Muslim wedding celebrations.",
    image: "/demos/site-1-cover.png",
    variant: "royal",
    palette: { bg: "#0C3B2E", ink: "#FDF9F3", accent: "#C9A86A", muted: "#E8D5A8" },
    coverImage: "/images/hero/cinematic_banner.jpg",
    fields: { ...ALL_FIELDS, music: true },
    demoUrl: "/site-1",
  },
  {
    slug: "botanical-sage",
    name: "Botanical Sage",
    occasion: "Wedding",
    tagline: "Sage-green garden luxury",
    description:
      "Fresh sage greens and warm gold with soft floral accents — a botanical garden wedding told with quiet luxury.",
    image: "/demos/site-3-cover.png",
    variant: "botanical",
    palette: { bg: "#303A29", ink: "#FFFDF7", accent: "#C7A75B", muted: "#E4E8D8" },
    coverImage: "/images/occasions/haldi_mehndi.jpg",
    fields: { ...ALL_FIELDS, music: true },
    demoUrl: "/site-3",
  },
  {
    slug: "blush-garden",
    name: "Blush Garden",
    occasion: "Wedding",
    tagline: "Ivory & champagne romantic florals",
    description:
      "Soft ivory, champagne and blush florals with a gentle cinematic opening — a romantic garden celebration.",
    image: "/site-6/cover.jpg",
    variant: "botanical",
    palette: { bg: "#FFF9F0", ink: "#44352D", accent: "#C6A15B", muted: "#F3E6D8" },
    coverImage: "/images/hero/hero_wedding.jpg",
    fields: { ...ALL_FIELDS, music: true },
    demoUrl: "/site-6",
  },
  {
    slug: "ivory-editorial",
    name: "Ivory Editorial",
    occasion: "Wedding · Reception",
    tagline: "Minimalist luxury, magazine-style",
    description:
      "Ivory editorial luxury with refined typography and airy layouts — a modern reception invitation that feels like a couture lookbook.",
    image: "/site-5/opening-poster.jpg",
    variant: "ivory",
    palette: { bg: "#EFE9DD", ink: "#24211D", accent: "#B89B63", muted: "#D9CFBC" },
    coverImage: "/images/occasions/engagements.jpg",
    fields: { ...ALL_FIELDS, music: true },
    demoUrl: "/site-5",
  },
  {
    slug: "midnight-gold",
    name: "Midnight Gold",
    occasion: "Wedding · Sangeet",
    tagline: "Charcoal, champagne & bold type",
    description:
      "Charcoal night tones with champagne gold and bold editorial type — a sangeet or evening reception that feels like a premiere.",
    image: "/demos/site-4-cover.jpeg",
    variant: "ivory",
    palette: { bg: "#111110", ink: "#F5F0E6", accent: "#C9A86A", muted: "#2A2A28" },
    coverImage: "/images/occasions/parties.jpg",
    fields: { ...ALL_FIELDS, music: true },
    demoUrl: "/site-4",
  },
  {
    slug: "luxury-ivory-reception",
    name: "Luxury Ivory Reception",
    occasion: "Wedding · Reception",
    tagline: "Champagne gold, botanical arch & letter reveal",
    description:
      "A couture wedding reception invitation with an animated luxury envelope letter reveal, floral corner accents, romantic timeline, interactive gallery and live WhatsApp RSVP.",
    image: "/site-8/cover.jpg",
    variant: "ivory",
    palette: { bg: "#F8F3EA", ink: "#30251F", accent: "#C6A46A", muted: "#EAD5CC" },
    coverImage: "/images/hero/hero_wedding.jpg",
    fields: { ...ALL_FIELDS, music: true },
    demoUrl: "/site-8",
  },
  {
    slug: "royal-floral-garden",
    name: "Royal Floral Garden",
    occasion: "Royal Wedding · Vivah",
    tagline: "Full-screen Jaipur Mandap, cascading rose garlands & royal gold",
    description:
      "A majestic royal Indian wedding invitation featuring full-screen Jaipur Mandap, cascading floral garland torans, hanging golden lanterns, falling rose petals, romantic story milestones, interactive scratch card, countdown and live RSVP.",
    image: "/site-9/cover.jpg",
    variant: "emerald",
    palette: { bg: "#FFF7E9", ink: "#075E50", accent: "#C49A48", muted: "#E85C83" },
    coverImage: "/site-9/cover.jpg",
    fields: { ...ALL_FIELDS, music: true },
    demoUrl: "/site-9",
  },
];

export function getCatalogTemplate(slug: string): CatalogTemplate | undefined {
  return CATALOG.find((t) => t.slug === slug);
}
