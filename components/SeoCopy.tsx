// Server component — static, crawlable copy for search + AI engines.
// A concise editorial strip: what Mehfill is, who it serves, and how to
// explore further. Rendered as plain HTML with descriptive internal links.
import Link from "next/link";

export default function SeoCopy() {
  return (
    <section aria-label="About Mehfill digital invitations" className="border-t hairline bg-cream/40">
      <div className="mx-auto max-w-3xl px-5 md:px-8 py-14 md:py-20 text-center">
        <p className="eyebrow text-terracotta">THE MEHFILL WAY</p>
        <h2 className="mt-4 font-serif font-light text-3xl md:text-5xl leading-tight">
          One link, <span className="italic">every detail.</span>
        </h2>
        <p className="mt-5 text-[15px] md:text-base leading-relaxed text-charcoal/65">
          Mehfill.in is a digital wedding and event invitation platform for
          celebrations across India — an online wedding invitation and wedding
          invitation website for Indian weddings, engagements, birthdays,
          anniversaries and festive events. Instead of a paper card that gets
          lost in a drawer, your guests open one beautiful link — your story,
          event schedule, venue maps, photos, music and RSVP, designed around
          your family, faith and language, and shared on WhatsApp in seconds.
        </p>
        <p className="mt-4 text-[15px] md:text-base leading-relaxed text-charcoal/65">
          From cinematic{" "}
          <Link href="/digital-wedding-invitations" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">
            digital wedding invitations
          </Link>{" "}
          and bilingual{" "}
          <Link href="/nikah-invitations" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">
            Nikah invitations
          </Link>{" "}
          to{" "}
          <Link href="/birthday-invitations" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">
            birthdays
          </Link>
          ,{" "}
          <Link href="/engagement-invitations" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">
            engagements
          </Link>{" "}
          ,{" "}
          <Link href="/anniversary-invitations" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">
            anniversaries
          </Link>
          ,{" "}
          <Link href="/haldi-invitations" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">
            Haldi
          </Link>
          ,{" "}
          <Link href="/mehndi-invitations" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">
            Mehndi
          </Link>{" "}
          and{" "}
          <Link href="/event-invitations" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">
            events
          </Link>{" "}
          — every digital invitation card is custom-made, delivered in 1–3 days, and ready
          to open on any phone with no app needed.{" "}
          <Link href="/demos" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">
            Open a live demo
          </Link>{" "}
          and feel the difference.
        </p>
      </div>
    </section>
  );
}
