import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — Mehfill.in",
  description: "When Mehfill.in orders are confirmed, cancelled or refunded.",
};

export default function RefundPolicyPage() {
  return (
    <LegalPage eyebrow="LEGAL" title="Refund & Cancellation Policy" updated="28 September 2026">
      <h2>1. How ordering works</h2>
      <ul>
        <li>You choose a design and plan, share your details, and pay by direct UPI transfer.</li>
        <li>You then submit your UPI transaction ID and payment screenshot for verification.</li>
        <li>Your order is <strong>confirmed</strong> only after we verify the payment and confirm back to you on WhatsApp or email.</li>
        <li>Design work begins after confirmation, exactly as discussed with you.</li>
      </ul>

      <h2>2. Cancellation before confirmation</h2>
      <p>
        If you paid but we have <strong>not yet confirmed</strong> your order (for example payment
        could not be verified), you may cancel for a full refund of the amount received.
      </p>

      <h2>3. Cancellation after confirmation</h2>
      <ul>
        <li>
          Within <code>[CANCELLATION PERIOD]</code> of confirmation and <strong>before design work
          begins</strong> — full refund of the amount received.
        </li>
        <li>
          After design work has begun — the effort already put in is non-refundable; any remaining
          balance for unstarted work is refunded. We will give you an honest, itemised split.
        </li>
        <li>Once your final invitation link is delivered and approved, the order is complete and non-refundable.</li>
      </ul>

      <h2>4. Revisions</h2>
      <p>
        Each plan includes <code>[NUMBER OF REVISIONS]</code> fair design revisions. If we cannot
        deliver what was promised even after revisions, we will make it right — including a partial
        or full refund where fair.
      </p>

      <h2>5. Failed &amp; duplicate payments</h2>
      <ul>
        <li><strong>Failed payment</strong> (money left your account but never reached us) — no order is created; please claim reversal through your UPI app/bank. We will help with any proof you need from our side.</li>
        <li><strong>Duplicate payment</strong> (paid twice for one order) — the extra amount is refunded in full within <code>[REFUND WINDOW]</code> of you informing us with both transaction IDs.</li>
      </ul>

      <h2>6. Technical failures on our side</h2>
      <p>
        If we cannot deliver your invitation due to our own technical failure, you choose: rework
        with priority delivery, or a full refund.
      </p>

      <h2>7. How refunds are paid &amp; how long they take</h2>
      <p>
        Refunds go back via UPI to the same account that paid, within <code>[REFUND WINDOW]</code>{" "}
        of approval. Write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or message us
        on WhatsApp with your transaction ID to start a refund.
      </p>

      <h2>8. What is never refundable</h2>
      <ul>
        <li>Custom design work already completed and approved by you.</li>
        <li>Third-party costs already incurred for your order, if any were agreed upfront.</li>
      </ul>

      <h2>9. Please note</h2>
      <p>
        Time windows and revision counts marked like <code>[THIS]</code> are the business rules
        being finalised with the owner — they will be replaced with exact commitments before
        launch-scale sales. Nothing here creates a legal guarantee beyond what consumer law already
        provides. Professional legal/CA review is required before treating this page as final.
      </p>
    </LegalPage>
  );
}
