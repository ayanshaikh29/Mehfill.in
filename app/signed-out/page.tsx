"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, Users, Globe, Sparkles } from "lucide-react";

export default function SignOutPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#FBF7F0] flex flex-col justify-between">
      {/* Background Architectural Palace Image with Soft Fade */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero/auth_palace_bg.jpg"
          alt="Mehfill Palace Courtyard"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%] opacity-90 brightness-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FBF7F0]/85 via-[#FBF7F0]/65 to-[#FBF7F0]/80 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FBF7F0]/30 to-[#FBF7F0]/95" />
      </div>

      {/* Floating Gentle Petals */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
        {[
          { left: "12%", size: "13px", duration: "13s", delay: "0.5s", drift: "40px" },
          { left: "28%", size: "15px", duration: "15s", delay: "2s", drift: "-35px" },
          { left: "55%", size: "11px", duration: "11s", delay: "1s", drift: "45px" },
          { left: "78%", size: "14px", duration: "14s", delay: "3.5s", drift: "-30px" },
          { left: "90%", size: "12px", duration: "12s", delay: "4s", drift: "25px" },
        ].map((p, i) => (
          <span
            key={i}
            className="auth-petal"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              // @ts-expect-error CSS custom variable
              "--auth-duration": p.duration,
              "--auth-delay": p.delay,
              "--auth-drift": p.drift,
            }}
          />
        ))}
      </div>

      {/* Top Header */}
      <header className="relative z-20 w-full px-6 py-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="inline-block transition-transform hover:scale-[1.02]" aria-label="Mehfill.in Home">
          <span className="relative block w-[124px] sm:w-[144px]" style={{ aspectRatio: "901 / 319" }}>
            <Image
              src="/logo-transparent.png"
              alt="Mehfill.in"
              width={452}
              height={160}
              priority
              className="absolute inset-0 h-full w-full object-contain"
            />
          </span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold tracking-wide text-[#7C5A3E] hover:text-[#4A2F1B] transition-colors"
        >
          Back to Home <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {/* Main Signed Out Card Container */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-8">
        <div className="w-full max-w-[440px] text-center mb-5">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-[2.6rem] font-normal tracking-tight text-[#2B1F17] leading-[1.18]">
            You&apos;ve been <br />
            <span className="font-normal italic text-[#8B4828]">signed out.</span>
          </h1>
          <p className="mt-2 text-xs sm:text-[13px] text-[#695343] leading-relaxed max-w-sm mx-auto">
            Thank you for being a part of Mehfill. <br />
            We hope to see you celebrating again soon.
          </p>
        </div>

        {/* Glassmorphism Card Matching User's Design Exactly */}
        <div className="w-full max-w-[430px] rounded-[2rem] border border-white/70 bg-white/75 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(110,75,45,0.12)] text-center">
          {/* Elegant Archway Door Illustration */}
          <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-[#F7EFE4] border border-[#EADBCA]">
            <svg viewBox="0 0 80 80" className="h-16 w-16 text-[#A06E4A]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              {/* Outer archway */}
              <path d="M20 68 V32 C20 18 30 12 40 12 C50 12 60 18 60 32 V68" />
              {/* Open door panel */}
              <path d="M24 68 V34 C24 22 32 18 40 16 L56 22 V66 L40 68 Z" fill="#FDFBF7" />
              {/* Door knob */}
              <circle cx="48" cy="44" r="1.5" fill="#A06E4A" />
              {/* Decorative leafy branch */}
              <path d="M57 32 C62 30 65 35 63 42 C66 45 64 52 59 55" strokeWidth="1.2" stroke="#8B4828" />
            </svg>
          </div>

          {/* Three Feature Highlights with Icons */}
          <div className="space-y-3 text-left mb-6">
            <div className="flex items-center gap-3 rounded-xl bg-white/70 px-3.5 py-2.5 border border-[#EFE7DC]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5ECE0] text-[#8B4828]">
                <Heart className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-[#2B1F17]">Beautiful invitations</p>
                <p className="text-[11px] text-[#7A6353]">Handcrafted digital experiences</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white/70 px-3.5 py-2.5 border border-[#EFE7DC]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5ECE0] text-[#8B4828]">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-[#2B1F17]">For every special occasion</p>
                <p className="text-[11px] text-[#7A6353]">Weddings, receptions, nikah &amp; more</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white/70 px-3.5 py-2.5 border border-[#EFE7DC]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5ECE0] text-[#8B4828]">
                <Globe className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-[#2B1F17]">Trusted by families everywhere</p>
                <p className="text-[11px] text-[#7A6353]">Easy WhatsApp RSVP collection</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#8B4828] py-3 text-xs sm:text-sm font-bold text-white shadow-[0_6px_20px_rgba(139,72,40,0.32)] transition-all hover:bg-[#72391F] hover:shadow-[0_8px_24px_rgba(139,72,40,0.4)] active:scale-[0.99]"
            >
              Sign In Again →
            </Link>
            <Link
              href="/templates"
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#DECFC0] bg-white/60 py-2.5 text-xs sm:text-sm font-bold text-[#4A2F1B] hover:bg-white transition-all"
            >
              Explore Templates
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="relative z-20 w-full px-6 py-4 flex flex-wrap items-center justify-center gap-6 text-xs text-[#7A6353]/80 border-t border-[#E8DEC4]/40">
        <Link href="/privacy-policy" className="hover:text-[#4A2F1B] transition-colors">Privacy Policy</Link>
        <span>·</span>
        <Link href="/terms-and-conditions" className="hover:text-[#4A2F1B] transition-colors">Terms of Service</Link>
        <span>·</span>
        <Link href="/contact" className="hover:text-[#4A2F1B] transition-colors">Contact Us</Link>
      </footer>
    </main>
  );
}
