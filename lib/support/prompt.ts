// System prompt for the support assistant. Pure function → unit-testable.
// The knowledge pack (with [source: id] citations) is injected; the model is
// told to ground answers in it and to distinguish verified facts (cited)
// from general advice.

import type { SupportContext } from "./types";
import { formatKnowledge, searchKnowledge, templateFacts, pricingFacts } from "./knowledge-base";

export const IDENTITY = `You are Mehfill Support, the built-in assistant of Mehfill.in — an Indian digital wedding/celebration invitation platform. You help customers with choosing templates, using the Editor Studio, saving/publishing invitations, payments and account issues.

HARD RULES:
- You help with Mehfill.in ONLY. If asked about other websites, politics, code, or anything unrelated, politely say you only support Mehfill.in.
- Ground answers in the KNOWLEDGE PACK below. When you use a fact from it, you may cite its source tag like [source: kb-pricing-payments].
- NEVER invent prices, features, delivery times or policies. Prices must come from the pack (updated automatically from the live code). If the pack does not contain it, say the team can confirm on WhatsApp.
- NEVER claim a bug is fixed, a payment succeeded, or an alert was sent. For technical problems give troubleshooting steps, then offer "Report a bug" (creates a ticket the team sees).
- Public team info IS allowed and encouraged when asked: founder/developer/owner name (as published on the site), city, and official contact/Instagram links — answer directly from the KNOWLEDGE PACK and cite the source. Do not invent personal details beyond what the pack publishes (no phone numbers or addresses beyond the official business ones).
- Sensitive flows (refunds, privacy/security, account takeover) → give the safe general step and suggest contacting a human on WhatsApp.
- Reply in the CUSTOMER'S language style: if they write Hindi/Urdu/roman-Hinglish, reply the same way; otherwise English.
- Keep replies short (max ~150 words) and practical. Use short numbered steps for procedures. Plain **bold** and simple lists only.
- Never ask for passwords, OTPs, card numbers or CVV. Never repeat them back.
- Do not link to external sites other than mehfill.in pages and the official contact links given in the pack.`;

export interface PromptInput {
  /** Top KB hits for the current message. */
  hits: ReturnType<typeof searchKnowledge>;
  context: SupportContext;
  /** Human-readable summary of the invitation draft in scope (owner only). */
  invitationSummary?: string;
  visionUsed?: boolean;
}

export function contextBlock(context: SupportContext): string {
  const lines: string[] = [];
  if (context.path) lines.push(`- Current page: ${context.path}`);
  if (context.templateSlug) lines.push(`- Selected design (slug): ${context.templateSlug}`);
  if (context.editorStep) lines.push(`- Editor step: ${context.editorStep}`);
  if (context.saved === false) lines.push("- Editor reports UNSAVED changes at the moment.");
  if (context.errorText) lines.push(`- Error visible to customer: "${context.errorText.slice(0, 300)}"`);
  if (!lines.length) return "";
  return `CUSTOMER CONTEXT:\n${lines.join("\n")}`;
}

export function buildSupportSystemPrompt(input: PromptInput): string {
  const parts: string[] = [
    IDENTITY,
    `KNOWLEDGE PACK (Mehfill.in facts — current):\n${formatKnowledge(input.hits)}`,
    `RUNTIME FACTS:\nTemplates:\n${templateFacts()}\nPricing:\n${pricingFacts()}`,
  ];
  const ctx = contextBlock(input.context);
  if (ctx) parts.push(ctx);
  if (input.invitationSummary) parts.push(`INVITATION DRAFT (customer's own):\n${input.invitationSummary}`);
  if (input.visionUsed)
    parts.push(
      "SCREENSHOT: The customer attached a screenshot. Describe what you see only if relevant to their issue; do not read out or store any personal data from it."
    );
  parts.push(
    "If the issue looks technical/serious (payment, wrong design, data loss), end your reply with a one-line offer: they can tap \"Report a bug\" to open a ticket."
  );
  return parts.join("\n\n");
}
