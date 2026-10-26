// Mehfill.in support knowledge base.
//
// This is the AI assistant's source of truth about the product. Two layers:
//   1. FACTS — generated at runtime from the actual product code (CATALOG,
//      PLANS), so template names and prices NEVER drift from the website.
//   2. DOCS  — hand-written troubleshooting/support articles. When product
//      behaviour changes, update the matching doc here (searchable, cited by
//      source id in every answer).
//
// Retrieval is lightweight keyword scoring (the corpus is small by design).
// `searchKnowledge` returns top hits with their source id so the model can
// cite verified facts and distinguish them from general advice.

import { CATALOG } from "@/lib/catalog";
import { PLANS, formatINR } from "@/lib/plans";

export interface KnowledgeDoc {
  id: string;
  title: string;
  category: "product" | "templates" | "editor" | "account" | "payments" | "troubleshooting" | "contact";
  keywords: string[];
  body: string;
}

/* ───────────────────────── Runtime facts (auto-synced) ───────────────────── */

export function templateFacts(): string {
  return CATALOG.map(
    (t) =>
      `- ${t.name} (slug: ${t.slug}) — ${t.occasion}. ${t.tagline}. Live demo: ${t.demoUrl || "/templates"}.`
  ).join("\n");
}

export function pricingFacts(): string {
  return PLANS.map(
    (p) =>
      `- ${p.name}: ${formatINR(p.price)} (MRP ${formatINR(p.mrp)}) — ${p.tagline}. ${p.delivery}. Workflow: ${p.workflow}.`
  ).join("\n");
}

/* ───────────────────────────────── Articles ─────────────────────────────── */

const DOCS: KnowledgeDoc[] = [
  {
    id: "kb-how-it-works",
    title: "How Mehfill.in works (end to end)",
    category: "product",
    keywords: ["how", "work", "start", "create", "begin", "process", "steps", "kaise", "banao", "banane"],
    body: `Mehfill.in is a digital invitation platform. The full flow:
1. Browse designs at /templates (or the homepage design gallery).
2. Click "Choose This Template" / "Continue with This Design" — this creates a DRAFT invitation saved to your account with that exact design.
3. Editor Studio opens at /dashboard/edit/<id> with 9 steps: Couple, Date, Venue, Events, Photos, Love Story, Music, RSVP, Publish.
4. Changes autosave ~1.2s after you stop typing (you can also press Save). The footer shows saved/unsaved state.
5. Click "Preview" to see the REAL design exactly as guests will see it.
6. Publish after payment — you get a shareable link like mehfill.in/i/your-slug for WhatsApp.`,
  },
  {
    id: "kb-choose-template",
    title: "Choosing a template and starting an invitation",
    category: "templates",
    keywords: ["template", "design", "choose", "select", "nikah", "emerald", "browse", "gallery", "start"],
    body: `Templates live at /templates and in the homepage gallery. 8 designs are available:
${"{{TEMPLATES}}"}
Each card has "Preview Demo" (opens the live demo site) and "Choose This Template" (starts your draft with that design). Your selection is saved to the invitation record itself — the design cannot silently change to another template. If you already have an unfinished draft for the same design, "Continue with This Design" resumes it instead of creating a duplicate.`,
  },
  {
    id: "kb-editor-steps",
    title: "Editor Studio — all 9 steps explained",
    category: "editor",
    keywords: ["editor", "studio", "step", "fields", "names", "couple", "venue", "events", "photos", "rsvp", "music", "love", "story"],
    body: `Editor steps in order:
1. Couple — custom invitation URL (required), bride name, groom name, optional family names + message.
2. Date — wedding date (calendar picker, required) + start time (required, 12-hour picker).
3. Venue — venue name + full address (both required) + optional Google Maps link.
4. Events — optional extra event cards (name, date, time, venue, note). Blank events are cleared from the design.
5. Photos — gallery images (upload/replace/remove, up to 20 images).
6. Love Story — optional milestone cards (title, date, description, photo), up to 10.
7. Music — optional background track upload (MP3/audio you have rights to).
8. RSVP — RSVP toggle, contact name, phone (with country code), deadline, guest options.
9. Publish — review, full-screen preview, payment and go-live.
Advancing to the next step validates the current step's required fields; manual Save never blocks drafts.`,
  },
  {
    id: "kb-editor-date-names",
    title: "Changing names, dates and times",
    category: "editor",
    keywords: ["date", "name", "names", "change", "wrong", "time", "weekday", "month", "bride", "groom", "incorrect"],
    body: `To change names: step 1 (Couple) → edit Bride's name / Groom's name → autosave, or press Save.
To change the wedding date: step 2 (Date) → pick the date + start time → Save.
The date appears everywhere on the design — countdown, calendar links, weekday, month cells, scratch-card day/month/year blocks — and updates automatically when you save. Weekday (Monday/Sunday), month name and countdown all derive from the saved date; you never edit them separately. If the design still shows an old date, press Save once and reopen Preview (the preview reloads the freshly rendered page).`,
  },
  {
    id: "kb-photos-upload",
    title: "Uploading and removing photos",
    category: "editor",
    keywords: ["photo", "photos", "upload", "image", "gallery", "picture", "file", "nahi", "ho", "raha"],
    body: `Gallery photos: step 5 (Photos) → upload from your device (JPG/PNG/WebP). Up to 20 images per invitation; oldest extras are trimmed. Click an uploaded image to remove it. Music upload accepts audio files you have rights to (stored under /invitation-assets/).
If upload fails: check your internet connection, try a smaller image (very large photos can fail), and make sure you are logged in and on YOUR draft (not a demo page). Refresh once and retry.`,
  },
  {
    id: "kb-save-autosave",
    title: "Saving drafts — autosave, refresh recovery, unsaved changes",
    category: "editor",
    keywords: ["save", "saving", "autosave", "disappear", "disappearing", "lost", "refresh", "reload", "vanish", "nia", "gayab"],
    body: `The editor autosaves ~1.2 seconds after you stop typing AND when you click Save. The footer shows the true state: "All changes saved", "Saving…", "Unsaved changes", or "Couldn't save".
If your details disappear after refresh: the footer earlier said unsaved (save didn't complete — network blip) or you were on a DIFFERENT draft (check the dashboard list — drafts are per design). Your data lives on the server, not in the browser — refreshing never deletes saved data.
Recovery steps: 1) Open /dashboard and open the draft from the list. 2) Check the footer save state. 3) If something is genuinely missing, note the draft name and report a bug with a screenshot — do NOT delete the draft.`,
  },
  {
    id: "kb-preview-publish",
    title: "Preview and publish workflow",
    category: "editor",
    keywords: ["preview", "publish", "live", "link", "share", "url", "guests", "go", "online"],
    body: `Preview: the "Preview" button (top-right of the editor) opens the actual template renderer — the exact page guests will open. Drafts are private; only you (or an admin) can view them.
Publish: step 9 → required details must be complete (bride, groom, date, start time, venue name, venue address) or publishing is blocked with a clear message. After verified payment the invitation goes live at mehfill.in/i/<your-slug>. Preview and published output use the SAME renderer, so they are always identical.
You can change the custom URL in step 1 (must be unique, 3–50 characters).`,
  },
  {
    id: "kb-pricing-payments",
    title: "Packages, pricing and payment methods",
    category: "payments",
    keywords: ["price", "pricing", "cost", "plan", "package", "₹", "rate", "charge", "payment", "pay", "upi", "razorpay", "card"],
    body: `Current packages (all billing happens in INR):
${"{{PRICING}}"}
Payment methods: UPI (manual — pay, submit the form/screenshot, owner verifies within a few hours) and online card/net-banking/wallets via Razorpay when configured. 100% discount coupons activate instantly. Publishing requires a VERIFIED payment — an invitation never goes live without it. Payment status shows on the dashboard (paid / pending verification).`,
  },
  {
    id: "kb-payment-trouble",
    title: "Payment troubleshooting — pending, failed, deducted",
    category: "payments",
    keywords: ["payment", "failed", "deducted", "money", "charged", "pending", "refund", "order", "checkout", "razorpay", "verify", "paisa"],
    body: `Payment troubleshooting:
- "Money deducted but nothing happened": banks sometimes take minutes. Check /dashboard → Orders. If it stays pending for UPI, the owner verifies manually (usually within a few hours) — keep your Txn ID.
- Razorpay window closed/failed: no charge settles for failed orders; retry from checkout, or use the UPI flow.
- Order shows paid but publish locked: refresh the dashboard once; if still locked, report a bug with the Txn ID (never share card numbers or OTPs).
- Refunds follow the refund policy at /refund-policy.
NEVER claim a payment succeeded without the dashboard showing it paid.`,
  },
  {
    id: "kb-account-login",
    title: "Sign in, sign up and Google login",
    category: "account",
    keywords: ["login", "sign", "signup", "register", "google", "account", "password", "session", "logout", "auth", "email"],
    body: `Account basics:
- Sign up / sign in at /login (email or Google). After login you land on /dashboard.
- Google button not working: pop-up blockers block the Google window — allow pop-ups for mehfill.in and retry, or use email sign-in.
- Not logged in while opening a dashboard link: you are redirected to /login and brought BACK to the same page (including your selected template) after sign-in.
- Password issues: use the reset option on the login screen; if the reset email doesn't arrive, check spam and check that you typed the same email you signed up with.
Drafts and published invitations stay with your account.`,
  },
  {
    id: "kb-trouble-design",
    title: "Troubleshooting: selected design not showing / wrong design",
    category: "troubleshooting",
    keywords: ["template", "design", "not", "showing", "wrong", "different", "loaded", "opens", "applies", "emerald", "mismatch", "dikh", "nahi"],
    body: `If the design you selected doesn't appear:
1. The editor header shows the design NAME (e.g. "Nikah Emerald · basic") — confirm it matches your choice.
2. Open Preview (top-right) — this renders the real selected template with your data. The side live-preview panel (desktop) shows the same thing while you type.
3. "Preview Live Demo" opens the live demo of the SAME design in a new tab.
4. Still wrong? Open the dashboard card for the draft — the draft stores its own design slug. Report a bug with: which design you picked, which one appeared, and a screenshot — that is a critical issue and gets escalated immediately.
Do not create a second draft first — check the existing one, your details are already saved there.`,
  },
  {
    id: "kb-trouble-dates",
    title: "Troubleshooting: scratch-card date / old dates / wrong weekday",
    category: "troubleshooting",
    keywords: ["scratch", "card", "date", "wrong", "old", "weekday", "countdown", "calendar", "showing", "incorrect", "purana"],
    body: `If any part of the design shows an old or wrong date:
1. Confirm the Date step shows the right date + time and the footer says "All changes saved".
2. Press Save once, then reopen Preview (preview reloads the fresh render).
3. The scratch-card day/month/year cells, weekday, month name and countdown all rewrite from the saved date — they are never edited separately.
4. Publishing locks if the date is invalid (e.g. 31 February) — pick a real calendar date.
If after a confirmed save the design still shows the OLD date, that is a bug — report it with a screenshot of the Date step and the preview.`,
  },
  {
    id: "kb-trouble-generic",
    title: "Troubleshooting: general errors, loading, mobile layout",
    category: "troubleshooting",
    keywords: ["error", "loading", "slow", "broken", "blank", "mobile", "layout", "browser", "refresh", "404", "crash", "kaam", "nahi"],
    body: `General troubleshooting checklist:
1. Refresh once — most transient errors clear immediately.
2. Use an up-to-date Chrome/Edge/Safari; disable aggressive ad-blockers on mehfill.in (they can block uploads and payment scripts).
3. Mobile layout: rotate/zoom to 100% — the editor uses a step layout designed for phones and desktops both.
4. Login/checkout redirect loops: allow third-party cookies for mehfill.in, then retry.
5. 404 on an invitation link: it may have been unpublished — ask the sender to check their dashboard.
6. Still stuck? Report a technical problem with the exact error text or a screenshot — attach the page URL.`,
  },
  {
    id: "kb-contact",
    title: "Contacting human support",
    category: "contact",
    keywords: ["human", "contact", "support", "call", "whatsapp", "email", "agent", "person", "baat", "team"],
    body: `Human support channels:
- WhatsApp: https://wa.me/917499827349 (fastest — support hours are handled by the Mehfill team).
- Email: mehfill.in029@gmail.com
- Instagram: https://www.instagram.com/mehfill.inn
For order/payment issues include your Txn ID or order reference. For invitation issues include your invitation link (mehfill.in/i/...). Never share passwords, OTPs or card details with anyone, including support.`,
  },
  {
    id: "kb-about-team",
    title: "Who runs Mehfill.in — founder & developer",
    category: "product",
    keywords: [
      "developer", "founder", "owner", "made", "created", "built", "who",
      "ayan", "shaikh", "team", "company", "studio", "credit", "banaya",
      "kisne", "bana", "founder", "about",
    ],
    body: `Mehfill.in is founded and built by **Ayan Shaikh** — this is published on the site itself (About page, Contact page, Privacy Policy operator line, the footer line "Founded by Ayan Shaikh · Nashik, Maharashtra, India", and the Organization schema on every page).
- Founder / developer / designer: Ayan Shaikh (the template credits also say "Designed with care by Ayan Shaikh").
- Based in Nashik, Maharashtra, India — serving customers across India.
- Team Instagram: https://www.instagram.com/mehfill.inn · Ayan's Instagram: https://www.instagram.com/_ayan_shaikh_29
- Support and queries go through the official channels: WhatsApp https://wa.me/917499827349 or email mehfill.in029@gmail.com.
You can share these public details when a customer asks who owns/develops/created the site.`,
  },
  {
    id: "kb-ticket-flow",
    title: "Reporting a bug — what happens",
    category: "product",
    keywords: ["report", "bug", "ticket", "escalate", "issue", "reference", "serious", "critical"],
    body: `When you report a technical problem:
1. The assistant captures your description, the page you are on, and (with your consent) your screenshot.
2. A support ticket is created with a reference like MF-26-A1B2C3 — quote it in any follow-up.
3. Serious issues (payments, privacy, data loss, wrong designs) are escalated to the Mehfill team immediately; others are queued for review.
4. You can continue the conversation about your own ticket here.
The assistant gives troubleshooting steps but never claims a bug is FIXED until the team confirms it.`,
  },
];

/* ─────────────────────────────── Retrieval ──────────────────────────────── */

function interpolate(doc: KnowledgeDoc): string {
  return doc.body
    .replace("{{TEMPLATES}}", templateFacts())
    .replace("{{PRICING}}", pricingFacts());
}

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "to", "of", "in", "on", "my", "i", "it", "and",
  "for", "with", "this", "that", "not", "no", "me", "ho", "raha", "nahi", "se", "ke",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9₹#]+/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

/** Keyword-scoring search. Returns top docs with their source ids. */
export function searchKnowledge(query: string, max = 4): KnowledgeDoc[] {
  const qTokens = tokenize(query);
  if (!qTokens.length) return [];
  const scored = DOCS.map((doc) => {
    const title = doc.title.toLowerCase();
    const body = doc.body.toLowerCase();
    const kw = doc.keywords.join(" ");
    let score = 0;
    for (const t of qTokens) {
      if (kw.includes(t)) score += 3;
      if (title.includes(t)) score += 3;
      if (body.includes(t)) score += 1;
    }
    return { doc, score };
  })
    .filter((s) => s.score >= 3)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, max).map((s) => s.doc);
}

/** Format retrieved docs for the system prompt, with source ids. */
export function formatKnowledge(docs: KnowledgeDoc[]): string {
  if (!docs.length) return "(no specific article matched this message)";
  return docs
    .map((d) => `[source: ${d.id}] ${d.title}\n${interpolate(d)}`)
    .join("\n\n---\n\n");
}

export function allKnowledgeDocs(): KnowledgeDoc[] {
  return DOCS;
}
