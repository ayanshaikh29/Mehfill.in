// ─────────────────────────────────────────────
//  TODO: Replace these SAMPLES with real client words.
//  Bhai — jaise hi real reviews milen, yahan paste kar dena:
//  { quote, name, detail } — bas, section khud update ho jayega.
// ─────────────────────────────────────────────
export interface Testimonial {
  quote: string;
  name: string;
  detail: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Guests kept messaging us just to say how beautiful the invitation was — before the wedding even began.",
    name: "Sample Client",
    detail: "Wedding invitation · Udaipur",
  },
  {
    quote:
      "We only shared photos and details on WhatsApp. A few days later our full cinematic invitation was ready.",
    name: "Sample Client",
    detail: "Engagement invitation · Delhi",
  },
  {
    quote:
      "The tap-to-enter reveal gave everyone goosebumps. It felt like our film, not a card.",
    name: "Sample Client",
    detail: "Birthday invitation · Mumbai",
  },
];
