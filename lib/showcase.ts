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
    slug: "aariz-zoya-wedding",
    names: "Aariz & Zoya",
    occasion: "Wedding · Shaadi",
    title: "A royal wedding invitation, live for real guests",
    description:
      "Cinematic wedding experience with tap-to-open reveal, live countdown, events, gallery and RSVP — a second live demo crafted for Indian wedding celebrations.",
    url: "https://mehfill-demo-2.netlify.app/",
    // Custom cover you provided (sunset terrace "You're Invited").
    image: "/demos/demo-2.png",
    badge: "LIVE DEMO",
    palette: { bg: "#3B0A0A", ink: "#FDF9F3", accent: "#C9A86A" },
  },
  {
    slug: "hamza-maryam-nikah",
    names: "Hamza & Maryam",
    occasion: "Nikah · Wedding",
    title: "A Nikah invitation, live for real guests",
    description:
      "Bilingual English–Urdu experience with tap-to-open reveal, scratch-to-reveal save-the-date, live countdown, events, gallery and RSVP — designed for a real London Nikah celebration.",
    url: "https://mehfill-demo-sites.netlify.app/",
    // Live homepage screenshot as cover (WordPress mshots, free, no key).
    image:
      "https://s0.wp.com/mshots/v1/https%3A%2F%2Fmehfill-demo-sites.netlify.app%2F?w=1200",
    badge: "REAL INVITATION",
    palette: { bg: "#0c3b2e", ink: "#FDF9F3", accent: "#C9A86A" },
  },
];
