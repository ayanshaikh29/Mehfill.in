import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/contact";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Mehfill.in collects, uses, stores and protects your personal information.",
  alternates: { canonical: canonical("/privacy-policy") },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage eyebrow="LEGAL" title="Privacy Policy" updated="28 September 2026">
      <h2>1. Who operates Mehfill</h2>
      <p>
        Mehfill.in (&ldquo;Mehfill&rdquo;, &ldquo;we&rdquo;) is a digital invitation service that
        creates custom online invitations for weddings, engagements, birthdays, anniversaries and
        other celebrations.
      </p>
      <p>
        Operator: <code>[LEGAL BUSINESS NAME]</code>
        <br />
        Address: <code>[BUSINESS ADDRESS]</code>
        <br />
        Support email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        <br />
        Contact number: <code>[CONTACT NUMBER]</code>
      </p>
      <p>
        If you have any question about your personal information, write to us at the support email
        above.
      </p>

      <h2>2. What data we collect</h2>
      <p>We collect only what the service actually needs:</p>
      <ul>
        <li>
          <strong>Account details</strong> — name, email address, mobile number and password
          (stored securely) when you sign up or sign in.
        </li>
        <li>
          <strong>Order &amp; event details</strong> — event type, event date, venue name and
          address, city, state, pincode, and names/photos you share for your invitation.
        </li>
        <li>
          <strong>Payment details</strong> — UPI transaction ID (UTR), amount, plan, and the payment
          screenshot you upload so we can verify your payment manually. We never ask for your UPI
          PIN or bank password.
        </li>
        <li>
          <strong>Support messages</strong> — what you share with us on WhatsApp, email or chat.
        </li>
        <li>
          <strong>Technical data</strong> — pages you visit on our site (page path only). Our
          hosting/authentication provider may additionally process standard server data such as IP
          addresses for security purposes.
        </li>
        <li>
          <strong>Demo RSVP entries</strong> — names entered in demo invitation previews stay in
          your own browser and are not sent to us.
        </li>
      </ul>

      <h2>3. Why we collect it</h2>
      <ul>
        <li>To create your account and keep it secure.</li>
        <li>To design, personalise and host your digital invitation.</li>
        <li>To process your order and verify your UPI payment.</li>
        <li>To contact you about your order on WhatsApp, email or phone.</li>
        <li>To prevent fraud and keep the service safe.</li>
        <li>To understand which pages are visited so we can improve the site.</li>
        <li>To meet accounting and legal record-keeping needs where applicable.</li>
      </ul>

      <h2>4. Data sharing &amp; third parties</h2>
      <p>We do not sell your personal information. It is processed through these services:</p>
      <ul>
        <li>
          <strong>Supabase</strong> — authentication, database and file storage (account, order and
          screenshot data).
        </li>
        <li>
          <strong>Vercel</strong> — website hosting.
        </li>
        <li>
          <strong>WhatsApp</strong> — order communication, when you message us or we confirm your
          order.
        </li>
        <li>
          <strong>api.qrserver.com</strong> — generates the UPI payment QR image in your browser (it
          receives the payment details encoded in the QR request).
        </li>
        <li>
          <strong>Google Fonts</strong> — loads site fonts.
        </li>
      </ul>
      <p>
        We do not use Google Analytics, Meta Pixel, Hotjar or any advertising trackers. If that
        changes, this policy will be updated first.
      </p>

      <h2>5. How long we keep data</h2>
      <ul>
        <li>Account and order records — kept while your account is active and for a reasonable period afterwards for support, accounting and dispute handling.</li>
        <li>Payment screenshots and transaction records — kept as proof of payment for a reasonable period.</li>
        <li>Uploaded invitation content — kept while your invitation is hosted, plus a reasonable backup period.</li>
        <li>Page-visit logs — kept in aggregate for site improvement.</li>
      </ul>
      <p>
        Exact retention schedules are being finalised with professional advice. You may request
        deletion of your data at any time (see section 6) — we delete what the law allows us to
        delete.
      </p>

      <h2>6. Your rights</h2>
      <p>Under India&apos;s Digital Personal Data Protection Act, 2023 and applicable law, you may:</p>
      <ul>
        <li>Ask what personal data we hold about you.</li>
        <li>Ask us to correct inaccurate data.</li>
        <li>Ask us to delete your data (subject to legal record-keeping duties).</li>
        <li>Withdraw consent for optional communications at any time.</li>
        <li>Raise a grievance about how your data is handled.</li>
      </ul>
      <p>
        To exercise any of these, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>{" "}
        with the subject &ldquo;Privacy Request&rdquo;. We aim to respond within a reasonable time.
      </p>

      <h2>7. Children</h2>
      <p>
        Mehfill accounts and orders are meant for adults (18+). Event details may of course mention
        children (for example birthdays), provided by the ordering adult.
      </p>

      <h2>8. Changes to this policy</h2>
      <p>
        If we change this policy, the &ldquo;Last updated&rdquo; date above will change. Significant
        changes will be highlighted on the website.
      </p>

      <h2>9. Legal review</h2>
      <p>
        This policy is a good-faith, plain-English description of actual practices. It is{" "}
        <strong>not legal advice</strong>. Data-protection, e-commerce and tax obligations depend on
        the final business structure — professional legal review is required (see{" "}
        <code>[LEGAL REVIEW REQUIRED]</code> items shared with the business owner).
      </p>
    </LegalPage>
  );
}
