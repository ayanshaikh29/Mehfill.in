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
    image: "/demos/aariz-zoya-cover.jpg",
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
  {
    slug: "amit-siya-reception",
    names: "Amit & Siya",
    occasion: "Wedding · Reception",
    title: "A minimalist luxury reception invitation",
    description:
      "Ivory editorial luxury with animated hero, scratch-to-reveal date, live countdown, love story, reception details, gallery, maps and RSVP — a premium reception invitation.",
    url: "https://mehfill.in/site-5/",
    // Cover = actual film frame (local poster, fast).
    image: "/site-5/opening-poster.jpg",
    badge: "LIVE DEMO",
    palette: { bg: "#EFE9DD", ink: "#24211D", accent: "#B89B63" },
  },
  {
    slug: "vihaan-anaya-garden",
    names: "Vihaan & Anaya",
    occasion: "Wedding · Garden",
    title: "A blush-garden wedding invitation",
    description:
      "Ivory and champagne florals with cinematic video opening, triple scratch date reveal, countdown, gallery, events, maps and RSVP — a neutral garden celebration.",
    url: "https://mehfill.in/site-6/",
    // Cover = actual film frame (local poster, fast).
    image: "/site-6/cover.jpg",
    badge: "LIVE DEMO",
    palette: { bg: "#FFF9F0", ink: "#44352D", accent: "#C6A15B" },
  },
  {
    slug: "aditya-diya-mandap",
    names: "Aditya & Diya",
    occasion: "Wedding · Traditional",
    title: "A royal mandap wedding invitation",
    description:
      "Deep red and antique gold with cinematic video opening, triple scratch date reveal, countdown, ceremonies, gallery, maps and RSVP — a traditional celebration.",
    url: "https://mehfill.in/site-7/",
    // Cover = actual film frame (local poster, fast).
    image: "/site-7/cover.jpg",
    badge: "LIVE DEMO",
    palette: { bg: "#FFF4E2", ink: "#38251B", accent: "#B8893B" },
  },
];
