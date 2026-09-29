import { Reveal } from "./Reveal";
import { TESTIMONIALS } from "@/lib/testimonials";

export default function Testimonials() {
  return (
    <section className="bg-cream/70 border-y hairline py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="text-center max-w-xl mx-auto">
          <p className="eyebrow text-terracotta">EARLY ACCESS PREVIEW</p>
          <h2 className="mt-4 font-serif font-light text-4xl md:text-6xl">Crafted to be <span className="italic">loved.</span></h2>
          <p className="mt-4 text-sm text-charcoal/55">
            Sample words showing the feeling we design for — real client stories will appear here after launch.
          </p>
        </Reveal>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <figure className="flex h-full flex-col rounded-[1.6rem] bg-ivory border hairline p-8">
                <span className="font-serif text-5xl leading-none text-champagne">&ldquo;</span>
                <blockquote className="mt-2 flex-1 font-serif text-xl leading-relaxed italic">{t.quote}</blockquote>
                <figcaption className="mt-6">
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-[13px] text-charcoal/55">{t.detail}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
