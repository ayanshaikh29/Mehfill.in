// Real, delivered client invitations showcased on the main site.
// These are EXTERNAL live sites (not /demos/[slug] templates), kept separate
// from TEMPLATES so cart/checkout ordering is never affected.
// To add more: append another entry — it appears automatically, newest first.

export interface Showcase {
  slug: string;
  names: string;
  occasion: string;
  title: string;
  description: string;
  url: string;
  image: string;
  badge: string;
  palette: { bg: string; ink: string; accent: string };
}

export const SHOWCASE: Showcase[] = [
  {
    slug: "hamza-maryam-nikah",
    names: "Hamza & Maryam",
    occasion: "Nikah · Wedding",
    title: "A Nikah invitation, live for real guests",
    description:
      "Bilingual English–Urdu experience with tap-to-open reveal, scratch-to-reveal save-the-date, live countdown, events, gallery and RSVP — designed for a real London Nikah celebration.",
    url: "https://mehfill.in/site-1/",
    // Custom cover provided.
    image: "/demos/site-1-cover.png",
    badge: "REAL INVITATION",
    palette: { bg: "#0c3b2e", ink: "#FDF9F3", accent: "#C9A86A" },
  },
  {
    slug: "aariz-zoya-wedding",
    names: "Aariz & Zoya",
    occasion: "Wedding · Shaadi",
    title: "A royal wedding invitation, live for real guests",
    description:
      "Cinematic wedding experience with tap-to-open reveal, live countdown, events, gallery and RSVP — a second live demo crafted for Indian wedding celebrations.",
    url: "https://mehfill.in/site-2/",
    // Custom cover provided (pink sunset terrace "You're Invited").
    image: "/demos/aariz-zoya-cover.jpg?v=2",
    badge: "LIVE DEMO",
    palette: { bg: "#3B0A0A", ink: "#FDF9F3", accent: "#C9A86A" },
  },
  {
    slug: "aarav-meera-botanical",
    names: "Aarav & Meera",
    occasion: "Wedding · Shaadi",
    title: "A botanical wedding invitation, live for real guests",
    description:
      "Sage-green luxury with fountain video reveal, heart scratch-to-reveal date, love-story timeline, countdown, gallery and RSVP — a universal botanical celebration.",
    url: "https://mehfill.in/site-3/",
    // Custom cover provided.
    image: "/demos/site-3-cover.png",
    badge: "LIVE DEMO",
    palette: { bg: "#303A29", ink: "#FFFDF7", accent: "#C7A75B" },
  },
  {
    slug: "aarav-meera-cinematic",
    names: "Aarav & Meera",
    occasion: "Wedding · Shaadi",
    title: "A cinematic wedding invitation, live for real guests",
    description:
      "Full-screen video cover with tap-to-open reveal, names showcase, events, venue, gallery and RSVP — a grand botanical wedding film for real guests.",
    url: "https://mehfill.in/site-4/",
    // Custom cover provided.
    image: "/demos/site-4-cover.jpeg",
    badge: "LIVE DEMO",
    palette: { bg: "#1F2A1D", ink: "#FFFDF7", accent: "#C7A75B" },
  },
];
