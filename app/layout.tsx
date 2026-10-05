import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import SmoothScrollLoader from "@/components/SmoothScrollLoader";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import IntroReveal from "@/components/IntroReveal";
import VisitTracker from "@/components/VisitTracker";
import LaunchGate from "@/components/LaunchGate";
import PostLaunch from "@/components/PostLaunch";
import CookieNotice from "@/components/CookieNotice";
import Script from "next/script";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://mehfill.in"),
  title: {
    default: "Digital Invitations for Weddings & Celebrations | Mehfill",
    template: "%s | Mehfill",
  },
  description:
    "Mehfill creates beautiful digital invitation experiences for weddings, Nikah, birthdays, engagements, anniversaries and celebrations in India. Cinematic designs, WhatsApp ordering, RSVP, maps & music in one shareable link.",
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
    title: "Digital Invitations for Weddings & Celebrations | Mehfill",
    description:
      "Beautiful digital invitation experiences for weddings, Nikah, birthdays, engagements, anniversaries and celebrations. Open a live demo and feel it.",
    url: "https://mehfill.in/",
    siteName: "Mehfill.in",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-cover.png",
        width: 1200,
        height: 630,
        alt: "Mehfill — digital invitations for weddings and celebrations in India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Invitations for Weddings & Celebrations | Mehfill",
    description:
      "Cinematic digital invitations for Indian weddings & celebrations. Open a live demo.",
    images: ["/og-cover.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Mehfill",
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
      name: "Mehfill",
      alternateName: "Mehfill.in",
      url: "https://mehfill.in/",
      logo: "https://mehfill.in/logo.png",
      description:
        "Mehfill creates beautiful digital invitation experiences for weddings, Nikah, birthdays, engagements, anniversaries and celebrations in India.",
      sameAs: ["https://www.instagram.com/mehfill.inn"],
    },
    {
      "@type": "WebSite",
      "@id": "https://mehfill.in/#website",
      url: "https://mehfill.in/",
      name: "Mehfill",
      publisher: { "@id": "https://mehfill.in/#organization" },
      inLanguage: "en-IN",
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
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#FDF9F3" />
        <meta httpEquiv="Content-Security-Policy" content={[
          "default-src 'self'",
          // NOTE: only services actually used are allowlisted. No Google
          // Analytics, Meta Pixel, YouTube embeds or Razorpay checkout exists
          // in the codebase — if added later, extend this list deliberately.
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com data:",
          "img-src 'self' data: https: blob:",
          "media-src 'self' https: blob:",
          "connect-src 'self' https://owrylcdcaywlsolqszho.supabase.co https://api.qrserver.com",
          "frame-src 'self'",
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
