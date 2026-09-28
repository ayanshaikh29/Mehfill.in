export interface Plan {
  id: string;
  name: string;
  price: number;
  mrp: number;
  blurb: string;
  features: string[];
  popular?: boolean;
  delivery: string;
}

export const PLANS: Plan[] = [
  {
    id: "essential",
    name: "Essential",
    price: 999,
    mrp: 1999,
    blurb: "A beautiful single celebration, done right.",
    delivery: "Delivery in 3 days",
    features: [
      "Tap-to-reveal opening",
      "1-page digital invitation",
      "Names, date, venue & story",
      "Photo gallery (up to 10 photos)",
      "WhatsApp-ready share link",
      "1 design revision",
    ],
  },
  {
    id: "signature",
    name: "Signature",
    price: 1700,
    mrp: 2999,
    blurb: "Our most loved experience — cinematic and complete.",
    delivery: "Delivery in 2 days",
    popular: true,
    features: [
      "Everything in Essential",
      "Cinematic tap-to-enter reveal",
      "Background music & event timeline",
      "RSVP + Maps & venue",
      "Gallery up to 30 photos",
      "3 design revisions",
    ],
  },
  {
    id: "royal",
    name: "Royal",
    price: 2500,
    mrp: 4999,
    blurb: "Fully custom, white-glove, unforgettable.",
    delivery: "Priority delivery in 24–48 hrs",
    features: [
      "Everything in Signature",
      "Fully custom design, made from scratch",
      "Unlimited photos & events",
      "Dedicated designer on WhatsApp",
      "Revisions for 7 days",
    ],
  },
];

export function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}
