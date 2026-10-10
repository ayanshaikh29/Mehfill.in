"use client";
import { SHOWCASE } from "@/lib/showcase";
import ShowcaseCard from "./ShowcaseCard";
import { Reveal } from "./Reveal";
import { WhatsAppIcon } from "./BrandIcons";
import { waLink, WA_MSG_GENERAL } from "@/lib/contact";

export default function DesignGallery() {
  return (
    <section id="designs" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-terracotta">LIVE DEMOS</p>
          <h2 className="mt-4 font-serif font-light text-4xl md:text-6xl leading-[1.02]">
            See what your celebration <span className="italic">could feel like.</span>
          </h2>
          <p className="mt-4 text-charcoal/60 leading-relaxed">
            Real, live invitations — open one and feel it.
          </p>
        </Reveal>

        {SHOWCASE.length > 0 && (
          <div className="mx-auto mt-6 md:mt-10 grid max-w-4xl grid-cols-2 gap-3 md:gap-7">
            {SHOWCASE.map((s, i) => (
              <ShowcaseCard key={s.slug} s={s} index={i} />
            ))}

          {/* More Demos Coming Soon Card */}
          <div className="group relative overflow-hidden rounded-[1.6rem] bg-charcoal text-ivory border border-white/10 shadow-[0_10px_40px_rgba(28,25,23,0.12)] p-4 md:p-7 flex flex-col justify-between min-h-[240px] md:min-h-[340px]">
            <div className="absolute inset-0 bg-gradient-to-br from-terracotta/20 via-transparent to-champagne/10 pointer-events-none" />
            <div>
              <span className="inline-block rounded-full bg-champagne/20 border border-champagne/30 backdrop-blur px-2.5 md:px-3.5 py-1 text-[9px] md:text-[11px] font-bold tracking-[0.14em] uppercase text-champagne-light">
                COMING SOON
              </span>
              <h3 className="mt-4 md:mt-6 font-serif font-light text-xl md:text-3xl leading-snug text-ivory">
                More Demos <span className="italic text-champagne-light">Coming Soon</span>
              </h3>
            </div>

            <div className="pt-4 md:pt-6 border-t border-white/10">
              <a
                href={waLink("Hi Mehfill! I want to request a custom invitation theme for my upcoming celebration.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-full bg-ivory py-2.5 md:py-3 text-[11px] md:text-sm font-bold text-charcoal hover:bg-champagne-light transition-colors"
              >
                <WhatsAppIcon className="h-4 w-4" /> Request Custom Design
              </a>
            </div>
          </div>
          </div>
        )}

        <Reveal className="mt-10 text-center">
          <a
            href={waLink(WA_MSG_GENERAL)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-charcoal px-8 py-4 text-sm font-bold text-ivory hover:bg-espresso transition-colors"
          >
            <WhatsAppIcon className="h-4 w-4" /> I liked a demo — make mine
          </a>
          <p className="mt-4 text-[13px] tracking-wide text-charcoal/50">
            Watch a demo → share your details on WhatsApp → we craft your invitation
          </p>
        </Reveal>
      </div>
    </section>
  );
}
