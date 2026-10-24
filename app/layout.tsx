import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, Noto_Nastaliq_Urdu, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import SmoothScrollLoader from "@/components/SmoothScrollLoader";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import IntroReveal from "@/components/IntroReveal";
import VisitTracker from "@/components/VisitTracker";
import LaunchGate from "@/components/LaunchGate";
import PostLaunch from "@/components/PostLaunch";
import CookieNotice from "@/components/CookieNotice";
import I18nProvider from "@/components/i18n/I18nProvider";
import CurrencyProvider from "@/components/i18n/CurrencyProvider";
import Script from "next/script";
import { INSTAGRAM_URL, SOCIAL_PROFILES } from "@/lib/contact";

// Social profiles for schema sameAs — only live URLs are emitted,
// so the Organization graph never claims profiles that don't exist.
const SOCIAL_URLS = [
  INSTAGRAM_URL,
  SOCIAL_PROFILES.facebook,
  SOCIAL_PROFILES.x,
  SOCIAL_PROFILES.linkedin,
  SOCIAL_PROFILES.youtube,
].filter((u): u is string => Boolean(u));

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Scripts & locales beyond Latin — swapped in per language via CSS
// (html[lang="hi"] etc.), so Devanagari/Nastaliq readers get proper glyphs.
const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const nastaliq = Noto_Nastaliq_Urdu({
  variable: "--font-nastaliq",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mehfill.in"),
  title: {
    default: "Mehfill.in | Digital Wedding & Event Invitations",
    template: "%s | Mehfill.in",
  },
  description:
    "Create beautiful digital wedding and event invitations with Mehfill.in. Modern, elegant and shareable invitations for weddings, engagements, birthdays and special celebrations.",
  authors: [{ name: "Mehfill.in" }],
  creator: "Mehfill.in",
  publisher: "Mehfill.in",
  alternates: {
    canonical: "https://mehfill.in/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Mehfill.in | Digital Wedding & Event Invitations",
    description:
      "Create beautiful digital wedding and event invitations with Mehfill.in. Modern, elegant and shareable invitations for weddings, engagements, birthdays and special celebrations.",
    url: "https://mehfill.in/",
    siteName: "Mehfill.in",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-cover.png",
        width: 1200,
        height: 630,
        alt: "Mehfill.in — digital wedding and event invitations for celebrations in India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mehfill.in | Digital Wedding & Event Invitations",
    description:
      "Create beautiful digital wedding and event invitations with Mehfill.in — elegant, WhatsApp-ready links with RSVP, maps and photos.",
    images: ["/og-cover.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Mehfill.in",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  category: "events",
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://mehfill.in/#organization",
      name: "Mehfill.in",
      url: "https://mehfill.in/",
      logo: "https://mehfill.in/logo.png",
      description:
        "Mehfill.in is a digital invitation platform for weddings, events and celebrations. We create beautiful digital wedding invitations, engagement invitations, birthday invitations and event invitations that are easy to share on WhatsApp.",
      sameAs: SOCIAL_URLS,
      founder: {
        "@type": "Person",
        name: "Ayan Shaikh",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Nashik",
        addressRegion: "Maharashtra",
        addressCountry: "IN",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://mehfill.in/#website",
      url: "https://mehfill.in/",
      name: "Mehfill.in",
      alternateName: "Mehfill",
      publisher: { "@id": "https://mehfill.in/#organization" },
      inLanguage: "en-IN",
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://mehfill.in/#local-business",
      name: "Mehfill.in — Digital Wedding & Event Invitations",
      url: "https://mehfill.in/",
      image: "https://mehfill.in/og-cover.png",
      description:
        "Mehfill.in is an online digital invitation website for Indian weddings, Nikah, engagements, birthdays and events. Custom WhatsApp wedding invitations with RSVP and maps in one shareable link. An online invitation studio — not a restaurant or venue.",
      priceRange: "₹₹",
      areaServed: { "@type": "Country", name: "India" },
      availableLanguage: ["en", "hi", "ur"],
      sameAs: SOCIAL_URLS,
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).substring(2);

  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${devanagari.variable} ${nastaliq.variable}`}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#FDF9F3" />
        {/* Apply the stored language before first paint so RTL (Urdu) never
            flashes LTR. Kept tiny and dependency-free. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var m=document.cookie.match(/(?:^|;\\s*)mf_locale=([a-z]{2})/);var l=m&&m[1]||null;if(!l){l=localStorage.getItem('mf_locale')}if(l==='hi'||l==='mr'||l==='ur'){document.documentElement.lang=l;if(l==='ur'){document.documentElement.dir='rtl'}}}catch(e){}})();",
          }}
        />
        <meta httpEquiv="Content-Security-Policy" content={[
          "default-src 'self'",
          // NOTE: only services actually used are allowlisted. Razorpay checkout
          // is loaded on /checkout when gateway keys are configured.
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com data:",
          "img-src 'self' data: https: blob:",
          "media-src 'self' https: blob:",
          "connect-src 'self' https://owrylcdcaywlsolqszho.supabase.co https://api.qrserver.com https://api.razorpay.com https://lumberjack.razorpay.com",
          "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
          "upgrade-insecure-requests",
        ].join("; ")} />
        <link rel="security.txt" href="/.well-known/security.txt" />
        {/* NOTE: no <link rel="preload"> for videos or images here.
            next/image `priority` emits exactly one preload for the real LCP
            image. The intro film is deferred until after first paint
            (see IntroReveal) so it never blocks LCP. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-ivory text-charcoal antialiased">
        <I18nProvider>
          <CurrencyProvider>
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <SmoothScrollLoader />
            <VisitTracker />
            <LaunchGate>
              <div id="main-content" tabIndex={-1}>
                {children}
              </div>
            </LaunchGate>
            <CookieNotice />
            <PostLaunch>
              <IntroReveal />
              <WhatsAppFloat />
            </PostLaunch>
          </CurrencyProvider>
        </I18nProvider>
        <Script
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                  document.addEventListener('keydown', function(e) {
                    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || (e.ctrlKey && e.key === 'U')) {
                      e.preventDefault();
                      return false;
                    }
                  });
                  document.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                    return false;
                  });
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
