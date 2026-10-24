export interface Plan {
  id: string;
  name: string;
  price: number;
  mrp: number;
  blurb: string;
  tagline: string;
  features: string[];
  exclusions: string[];
  popular?: boolean;
  delivery: string;
  workflow: "self_service" | "custom_service";
}

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 999,
    mrp: 1299,
    blurb: "Choose a design. Make it yours. Share your celebration.",
    tagline: "Template personalisation",
    features: [
      "Choose one pre-designed invitation template",
      "Personalise bride & groom names",
      "Edit family names and invitation message",
      "Edit wedding date, time & events",
      "Venue name, address & Google Maps link",
      "Upload & replace photos in gallery slots",
      "Configure RSVP options",
      "Preview before publishing",
      "Unique shareable invitation URL",
      "WhatsApp & link sharing",
      "Customer dashboard — edit anytime",
    ],
    exclusions: [
      "Custom theme or colour redesign",
      "Custom animation changes",
      "Layout rearrangement beyond the template",
      "Human design review",
    ],
    delivery: "Publish instantly after payment",
    workflow: "self_service",
  },
  {
    id: "premium",
    name: "Premium",
    price: 1500,
    mrp: 2999,
    blurb: "Your story. Your style. Your invitation.",
    tagline: "Fully customised design service",
    popular: true,
    features: [
      "Everything in Basic",
      "Customised visual theme & colour palette",
      "Personalised typography & decorative styling",
      "Custom animations & transitions (within scope)",
      "Custom section layout & arrangement",
      "Personalised opening experience & cover",
      "Custom gallery, countdown & RSVP styling",
      "Human design review by Mehfill team",
      "Preview & approval before publishing",
      "Unique shareable invitation URL",
      "2 revision rounds included",
    ],
    exclusions: [
      "Unlimited revisions (extra revisions priced separately)",
      "Delivery timelines confirmed after brief review",
    ],
    delivery: "Delivered after brief review · 2–4 days typical",
    workflow: "custom_service",
  },
];

export function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}
