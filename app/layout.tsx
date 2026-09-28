import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import IntroReveal from "@/components/IntroReveal";
import VisitTracker from "@/components/VisitTracker";
import LaunchGate from "@/components/LaunchGate";
import PostLaunch from "@/components/PostLaunch";
import Script from "next/script";

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mehfill.in — More Than an Invitation. An Experience.",
  description:
    "Create beautiful digital invitations for weddings, birthdays, engagements and every celebration that matters.",
  keywords: [
    "digital invitation",
    "wedding invitation",
    "indian wedding",
    "birthday invitation",
    "mehfill",
  ],
  openGraph: {
    title: "Mehfill.in — More Than an Invitation. An Experience.",
    description:
      "Beautiful digital invitations crafted for the moments that matter.",
    type: "website",
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
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
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://www.google-analytics.com https://www.googletagmanager.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com data:",
          "img-src 'self' data: https: blob:",
          "media-src 'self' https: blob:",
          "connect-src 'self' https://owrylcdcaywlsolqszho.supabase.co https://api.qrserver.com https://checkout.razorpay.com",
          "frame-src 'self' https://checkout.razorpay.com https://www.youtube.com https://www.youtube-nocookie.com",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self' https://checkout.razorpay.com",
          "frame-ancestors 'none'",
          "upgrade-insecure-requests",
        ].join("; ")} />
        <link rel="preload" as="video" href="/intro-desktop-opt.mp4" media="(min-width: 768px)" />
        <link rel="preload" as="video" href="/intro-mobile-opt.mp4" media="(max-width: 767px)" />
        <link rel="preload" as="image" href="/icon.png" />
        <link rel="security.txt" href="/.well-known/security.txt" />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-ivory text-charcoal antialiased">
        <SmoothScroll />
        <VisitTracker />
        <LaunchGate>
          {children}
        </LaunchGate>
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
