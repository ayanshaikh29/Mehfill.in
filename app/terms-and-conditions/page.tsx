import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Terms & Conditions — Mehfill.in",
  description: "The terms for using Mehfill.in and ordering custom digital invitations.",
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="LEGAL" title="Terms & Conditions" updated="28 September 2026">
      <h2>1. What Mehfill is</h2>
      <p>
        Mehfill.in provides custom-made digital invitations — a personal web link for your
        celebration, designed from the details, photos and content you share with us. By using the
        website or placing an order, you agree to these terms.
      </p>
      <p>
        Operator: <code>[LEGAL BUSINESS NAME]</code> · Support:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>

      <h2>2. Your account</h2>
      <ul>
        <li>You must be 18 or older to create an account or place an order.</li>
        <li>Keep your password private. You are responsible for activity under your account.</li>
        <li>Give accurate contact details so we can reach you about your order.</li>
      </ul>

      <h2>3. Your content &amp; responsibilities</h2>
      <ul>
        <li>
          You must have the right to share everything you send us — photos, videos, music, names,
          logos and artwork (yours, your family&apos;s, or properly licensed).
        </li>
        <li>
          You keep ownership of your content. You give Mehfill only the limited permission needed to
          design, host and display your invitation and to show it to your guests.
        </li>
        <li>Prohibited: unlawful, hateful, defamatory, obscene or infringing content, and content that violates anyone&apos;s privacy.</li>
        <li>We may decline or remove content that breaks these rules, with a refund handled per our <a href="/refund-policy">Refund Policy</a>.</li>
      </ul>

      <h2>4. Orders &amp; payments</h2>
      <ul>
        <li>Prices are shown on the <a href="/#pricing">pricing section</a> and at checkout. Prices may be negotiated on WhatsApp — the confirmed price is what you actually pay.</li>
        <li>Payment is currently by direct UPI transfer, followed by manual verification of your transaction ID and payment screenshot.</li>
        <li>Your order is <strong>confirmed</strong> only after we verify your payment and confirm on WhatsApp/email.</li>
        <li>After confirmation, our design work begins as discussed with you.</li>
      </ul>

      <h2>5. Customisation &amp; revisions</h2>
      <ul>
        <li>Each plan includes a fair number of design revisions: <code>[NUMBER OF REVISIONS]</code>.</li>
        <li>Revision requests should be shared together where possible so delivery stays on schedule.</li>
        <li>Delivery timelines are estimates shared before confirmation: <code>[DELIVERY TIMELINE]</code>. Festival/wedding-season rush may take longer — we will tell you upfront.</li>
      </ul>

      <h2>6. Cancellations &amp; refunds</h2>
      <p>
        Covered in detail in our <a href="/refund-policy">Refund &amp; Cancellation Policy</a>,
        which forms part of these terms.
      </p>

      <h2>7. Service availability</h2>
      <ul>
        <li>We aim to keep the website and hosted invitations available, but we do not guarantee uninterrupted uptime.</li>
        <li>Maintenance, hosting issues or third-party outages (for example Supabase or Vercel) may cause temporary unavailability.</li>
        <li>Your invitation link stays hosted for the period included in your plan: <code>[HOSTING PERIOD]</code>.</li>
      </ul>

      <h2>8. Intellectual property</h2>
      <ul>
        <li>The Mehfill website design, logo, text and demo templates belong to Mehfill.</li>
        <li>Your finished invitation is made for your personal, non-commercial celebration use.</li>
        <li>Demo designs on this site are samples. Sample quotes shown pre-launch are illustrative, not real customer reviews.</li>
      </ul>

      <h2>9. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Mehfill&apos;s total liability for any order is
        limited to the amount you paid for that order. We are not liable for indirect losses such as
        disappointment caused by delayed guest responses or third-party service failures.
      </p>

      <h2>10. Termination</h2>
      <p>
        We may suspend accounts or refuse service for fraud, abuse or breach of these terms. You may
        stop using the service and request deletion of your data per our{" "}
        <a href="/privacy-policy">Privacy Policy</a>.
      </p>

      <h2>11. Changes</h2>
      <p>
        We may update these terms as the service evolves. Continued use after the
        &ldquo;Last updated&rdquo; date changes means you accept the updated terms.
      </p>

      <h2>12. Contact &amp; legal review</h2>
      <p>
        Questions: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. These terms are written
        in plain English for transparency and are <strong>not legal advice</strong> — they require
        review by a qualified Indian lawyer before being treated as final.
      </p>
    </LegalPage>
  );
}
