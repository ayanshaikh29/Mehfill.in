import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/contact";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: "When Mehfill.in orders are confirmed, cancelled or refunded.",
  alternates: { canonical: canonical("/refund-policy") },
  robots: { index: false, follow: true },
};

export default function RefundPolicyPage() {
  return (
    <LegalPage eyebrow="LEGAL" title="Refund & Cancellation Policy" updated="20 October 2026">
      <h2>1. How ordering works</h2>
      <ul>
        <li>
          You choose a design and a package — <strong>Basic (₹999)</strong> self-service
          personalisation or <strong>Premium (₹1,500)</strong> custom design service.
        </li>
        <li>
          Payment is made either through Razorpay (card, net-banking, UPI) or by direct UPI
          transfer with transaction-ID verification.
        </li>
        <li>
          For Razorpay payments, your order is confirmed automatically after server-side payment
          verification. For manual UPI, confirmation happens after we verify your transaction —
          usually within a few hours on business days.
        </li>
        <li>
          <strong>Basic:</strong> after confirmation, your personalisation editor unlocks
          immediately and you publish the invitation yourself.
        </li>
        <li>
          <strong>Premium:</strong> after confirmation, you submit a design brief. Our team
          reviews it, confirms scope, shares a preview and publishes after your approval.
        </li>
      </ul>

      <h2>2. Cancellation before confirmation</h2>
      <p>
        If you paid but your order has <strong>not yet been confirmed</strong> (for example a
        failed payment, or a UPI transaction we could not verify), you may cancel for a full
        refund of the amount received.
      </p>

      <h2>3. Cancellation after confirmation</h2>
      <ul>
        <li>
          <strong>Basic package:</strong> because the Basic package is an instant self-service
          product, cancellations are accepted only <strong>before you publish</strong> your
          invitation. Once published, the order is complete and non-refundable. You may still
          edit your details anytime after publishing at no extra cost.
        </li>
        <li>
          <strong>Premium package:</strong> cancellations accepted before design work begins —
          full refund. After design work has begun, the effort already put in is
          non-refundable; any remaining balance for unstarted work is refunded with an honest,
          itemised split.
        </li>
        <li>
          Design switching: the package price covers <strong>one selected design</strong>.
          Switching to a completely different design after publication may attract a
          design-change fee, discussed with you in advance — or you may purchase a new package.
        </li>
      </ul>

      <h2>4. Revisions</h2>
      <ul>
        <li>
          <strong>Basic:</strong> unlimited self-service edits to supported fields via your
          dashboard, for as long as your invitation stays live.
        </li>
        <li>
          <strong>Premium:</strong> 2 revision rounds are included after the first preview.
          Additional revisions are quoted separately before work continues. If we cannot
          deliver what was agreed even after the included revisions, we will make it right —
          including a partial or full refund where fair.
        </li>
      </ul>

      <h2>5. Failed &amp; duplicate payments</h2>
      <ul>
        <li>
          <strong>Failed payment</strong> (money debited but the payment did not complete) —
          no order is created. For Razorpay payments, the amount is auto-reversed by your bank
          per RBI guidelines. For UPI, claim reversal through your UPI app/bank; we will help
          with any proof you need from our side.
        </li>
        <li>
          <strong>Duplicate payment</strong> (paid twice for one order) — the extra amount is
          refunded in full within <strong>7 working days</strong> of you informing us with both
          transaction/payment IDs.
        </li>
      </ul>

      <h2>6. Technical failures on our side</h2>
      <p>
        If we cannot deliver your invitation due to our own technical failure, you choose:
        priority rework, or a full refund.
      </p>

      <h2>7. How refunds are paid &amp; how long they take</h2>
      <ul>
        <li>
          <strong>Razorpay payments</strong> are refunded to the original payment method
          through Razorpay&apos;s refund system; banks typically take 5–7 working days.
        </li>
        <li>
          <strong>Manual UPI payments</strong> are refunded via UPI to the same VPA that paid,
          within <strong>7 working days</strong> of approval.
        </li>
        <li>
          To start a refund, write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>{" "}
          or message us on WhatsApp with your order reference and payment ID.
        </li>
      </ul>

      <h2>8. What is never refundable</h2>
      <ul>
        <li>Basic-package orders after the invitation has been published.</li>
        <li>Premium custom design work already completed and approved by you.</li>
        <li>Third-party costs already incurred for your order, if any were agreed upfront.</li>
      </ul>

      <h2>9. Note on business status</h2>
      <p>
        Mehfill.in is operated by an individual (unregistered sole proprietorship). Payments are
        processed via Razorpay and/or direct UPI. This policy is written in plain language and
        complies with standard consumer-fairness expectations; it does not limit any rights you
        have under applicable Indian consumer law. Professional legal review is recommended
        before treating this page as final.
      </p>
    </LegalPage>
  );
}
