import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/contact";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms for using Mehfill.in and ordering custom digital invitations.",
  alternates: { canonical: canonical("/terms-and-conditions") },
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
        <li>
          Two packages are offered: <strong>Basic (₹999)</strong> — self-service template
          personalisation — and <strong>Premium (₹1,500)</strong> — a customisation service with
          human design review. Features of each are listed on the <Link href="/#pricing">pricing section</Link>{" "}
          and at checkout.
        </li>
        <li>
          Payment is accepted via Razorpay (card, net-banking, UPI) when enabled, or by direct
          UPI transfer with manual verification of your transaction ID and payment screenshot.
        </li>
        <li>
          For Razorpay payments, confirmation is automatic after server-side payment
          verification. For manual UPI, confirmation happens after we verify your payment.
        </li>
        <li>
          <strong>Basic:</strong> your personalisation editor unlocks after confirmation;
          publishing is done by you. <strong>Premium:</strong> after confirmation you submit a
          design brief; our team reviews it, confirms scope and shares a preview before
          publishing.
        </li>
        <li>The package price covers one selected design per order.</li>
      </ul>

      <h2>5. Customisation &amp; revisions</h2>
      <ul>
        <li>
          <strong>Basic:</strong> edit supported fields (names, dates, venue, events, photos,
          RSVP) anytime from your dashboard at no extra cost.
        </li>
        <li>
          <strong>Premium:</strong> includes 2 revision rounds after the first preview.
          Additional revisions are quoted separately before work continues.
        </li>
        <li>
          Revision requests should be shared together where possible so delivery stays on
          schedule.
        </li>
        <li>
          Premium delivery timelines are confirmed after brief review — typically 2–4 days.
          Festival/wedding-season rush may take longer; we will tell you upfront.
        </li>
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
        <li>Your invitation link stays hosted for as long as Mehfill.in operates the service. We may retire the hosting platform with advance notice; if that happens we will give you reasonable time to export or re-host your invitation content.</li>
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
