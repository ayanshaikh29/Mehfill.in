import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/contact";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "What cookies and local storage Mehfill.in actually uses — and nothing more.",
  alternates: { canonical: canonical("/cookie-policy") },
};

export default function CookiePolicyPage() {
  return (
    <LegalPage eyebrow="LEGAL" title="Cookie Policy" updated="28 September 2026">
      <h2>1. What cookies are</h2>
      <p>
        Cookies are small text files stored in your browser. Websites also use similar technologies
        such as your browser&apos;s local storage (data saved on your own device by the site). This
        page honestly lists everything Mehfill.in uses.
      </p>

      <h2>2. What we actually use</h2>
      <ul>
        <li>
          <strong>Strictly necessary — login session (Supabase).</strong> When you sign in, our
          authentication provider stores session cookies so you stay signed in and your account stays
          secure. Without these, sign-in cannot work.
        </li>
        <li>
          <strong>Strictly necessary — shopping cart (local storage).</strong> Your selected designs
          are saved in your own browser under keys like <code>mehfill_cart_…</code> so your cart
          survives a refresh. This never leaves your device until checkout.
        </li>
        <li>
          <strong>Strictly necessary — cookie choice (local storage).</strong> Your cookie-notice
          choice is remembered in your own browser under <code>mehfill_cookie_choice</code>.
        </li>
      </ul>

      <h2>3. What we do NOT use</h2>
      <p>As of the date above, Mehfill.in uses:</p>
      <ul>
        <li>No Google Analytics, Meta Pixel, Hotjar or advertising trackers.</li>
        <li>No marketing or cross-site tracking cookies.</li>
        <li>No social-media tracking embeds.</li>
      </ul>
      <p>If this ever changes, we will update this page first and ask for consent where required.</p>

      <h2>4. Third parties that may set their own cookies</h2>
      <ul>
        <li>
          <strong>Google Fonts / QR-code service</strong> — these load fonts and
          the payment QR. They may process standard technical data per their own policies, but we do
          not use them for tracking you.
        </li>
        <li>
          <strong>WhatsApp / Instagram links</strong> — only if you click through to those apps;
          their own cookie rules then apply.
        </li>
      </ul>

      <h2>5. Managing cookies</h2>
      <ul>
        <li>You can clear site data anytime from your browser settings (this will sign you out and empty your cart).</li>
        <li>You can re-open our cookie notice anytime via the &ldquo;Cookie Settings&rdquo; link in the footer.</li>
        <li>Blocking all cookies will break sign-in; browsing designs and demos still works.</li>
      </ul>

      <h2>6. Contact</h2>
      <p>
        Cookie questions: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
