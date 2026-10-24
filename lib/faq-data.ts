// Single source for the visible FAQs — app/page.tsx maps these to FAQPage
// JSON-LD. When adding a question, it appears in both the UI and the schema.
// Kept in a plain (server-safe) module so the RSC layer never imports a
// client component just for data.
export const FAQS = [
  {
    q: "How do I order an invitation?",
    a: "Browse the designs, choose the one you love, sign in, and pay securely at checkout. Your editor unlocks instantly and you publish your invitation link when you're ready to share.",
  },
  {
    q: "Do you make invitations for all religions?",
    a: "Yes — Hindu, Muslim, Sikh, Christian and interfaith families. Nikah, Pheras, Anand Karaj, Church weddings, Puja, Dawat, Baptism and more, in your language and customs.",
  },
  {
    q: "What details do I need to add?",
    a: "Names, date, venue, event schedule, photos, wording and optional music — all added by you in a simple step-by-step editor. You can edit and republish anytime from your dashboard.",
  },
  {
    q: "How quickly does my invitation go live?",
    a: "Basic is self-service — publish the moment your payment succeeds. Premium includes design work and is typically delivered in 2–4 days after your brief is reviewed.",
  },
  {
    q: "How do payments work?",
    a: "Pay securely through Razorpay at checkout (card, net-banking, UPI, wallets) or by direct UPI transfer. Every payment is verified on our server before your order unlocks. GST invoice available on request.",
  },
  {
    q: "Can I request changes after publishing?",
    a: "Yes. Basic includes self-editing from your dashboard for as long as your invitation is active. Premium adds two human revision rounds with design review before publishing.",
  },
  {
    q: "How do guests open and RSVP?",
    a: "Guests get one link — it opens beautifully on any phone, no app needed. They can view events, locations and confirm RSVP in one tap.",
  },
  {
    q: "Do I need an account?",
    a: "Yes — a quick sign-in with email or Google keeps your order, draft and published invitation saved, so you can edit and reshare anytime.",
  },
];
export type FaqEntry = { q: string; a: string };
