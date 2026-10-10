import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";
import EmailLink from "@/components/EmailLink";
import { canonical } from "@/lib/seo";
import { INSTAGRAM_URL, waLink, WA_MSG_GENERAL } from "@/lib/contact";

const SLUG = "about";

export function generateMetadata(): Metadata {
  const url = canonical(`/${SLUG}`);
  const title = "About Mehfill.in — Digital Wedding & Event Invitation Platform";
  const description =
    "Mehfill.in is a digital invitation platform for weddings, events and celebrations in India. Learn what we do, how ordering works, and how to contact us.";
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Mehfill.in",
      locale: "en_IN",
      type: "website",
      images: [{ url: "/og-cover.png", width: 1200, height: 630, alt: "About Mehfill.in — digital wedding and event invitation platform" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-cover.png"],
    },
  };
}

const FAQS = [
  {
    q: "What is Mehfill.in?",
    a: "Mehfill.in is a digital invitation platform for weddings, events and celebrations. We design beautiful online invitations — a personal shareable link with your story, event schedule, venue maps, photos, music and RSVP — that you send to guests on WhatsApp.",
  },
  {
    q: "What kinds of invitations does Mehfill.in make?",
    a: "Digital wedding invitations (including Nikah, Haldi, Mehndi, Sangeet and multi-event weddings), engagement invitations, birthday invitations, anniversary invitations and event invitations for baby showers, pujas, gatherings and corporate events.",
  },
  {
    q: "How does ordering work?",
    a: "Explore our live demos, choose a plan, and share your names, date, venue and photos with us on WhatsApp. We design your invitation, include revisions, and deliver one link you can share with every guest. The full process is explained on our How It Works page.",
  },
  {
    q: "How can I contact Mehfill.in?",
    a: "Message us on WhatsApp for orders and support, email us anytime, or follow our Instagram for new designs. Every order is confirmed personally on WhatsApp or email before design begins.",
  },
];

function JsonLd() {
  const url = canonical(`/${SLUG}`);
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: canonical("/") },
      { "@type": "ListItem", position: 2, name: "About Mehfill.in", item: url },
    ],
  };
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://mehfill.in/#service",
    name: "Digital wedding and event invitations",
    provider: { "@id": "https://mehfill.in/#organization" },
    areaServed: { "@type": "Country", name: "India" },
    url: "https://mehfill.in/",
    description:
      "Custom-designed digital invitations for weddings, engagements, birthdays, anniversaries and events in India, delivered as a shareable link with schedule, venues, photos and RSVP.",
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
    </>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <JsonLd />
      <Navbar />
      <article className="mx-auto max-w-4xl px-5 md:px-8 pt-28 md:pt-36 pb-10">
        <nav aria-label="Breadcrumb" className="text-[12px] tracking-[0.14em] font-semibold text-charcoal/45">
          <Link href="/" className="hover:text-terracotta">HOME</Link>
          <span className="mx-2">/</span>
          <span className="text-charcoal/70">ABOUT</span>
        </nav>
        <p className="eyebrow mt-5 text-terracotta">ABOUT MEHFILL.IN</p>
        <h1 className="mt-4 font-serif font-light text-4xl md:text-6xl leading-[1.02] tracking-tight text-balance">
          A digital invitation platform for weddings &amp; celebrations
        </h1>
        <p className="mt-5 text-[16px] md:text-lg leading-relaxed text-charcoal/70">
          Mehfill.in is a digital invitation platform for weddings, events and celebrations.
          We help people across India create and share beautiful online wedding and event
          invitations — one elegant link with your story, schedule, venues, photos, music and
          RSVP, designed around your family, faith and language, and shared on WhatsApp in seconds.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/demos"
            className="inline-flex items-center rounded-full bg-charcoal px-7 py-3.5 text-sm font-semibold text-ivory hover:bg-espresso"
          >
            Explore Invitations
          </Link>
          <Link
            href="/how-it-works"
            className="inline-flex items-center rounded-full border hairline px-7 py-3.5 text-sm font-semibold bg-white/40"
          >
            How It Works
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full border hairline px-7 py-3.5 text-sm font-semibold bg-white/40"
          >
            Contact Us
          </Link>
        </div>

        <section className="mt-12">
          <h2 className="font-serif font-light text-3xl md:text-4xl">The problem we solve</h2>
          <p className="mt-4 leading-relaxed text-charcoal/70">
            Paper cards get lost in drawers, and plain forwarded messages bury the details that
            matter — the venue address, the Haldi timing, the RSVP. Guests end up calling the
            family for directions the morning of the function. Mehfill.in replaces all of that
            with one beautiful link: every event, map, photo and RSVP in the guest&apos;s pocket,
            updatable in minutes if a venue or time changes.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-serif font-light text-3xl md:text-4xl">What we make</h2>
          <p className="mt-4 leading-relaxed text-charcoal/70">
            Every invitation is custom-designed — not a do-it-yourself template. Our core work:
          </p>
          <ul className="mt-4 grid gap-2.5">
            {[
              "Digital wedding invitations — cinematic multi-event designs for Hindu, Muslim, Sikh, Christian and interfaith weddings",
              "Nikah and Muslim wedding invitations — respectful bilingual design in Urdu and English",
              "Haldi, Mehndi and Sangeet invitations — joyful pre-wedding functions, standalone or bundled",
              "Engagement invitations for ring ceremonies and proposals",
              "Birthday invitations for kids, milestones and parties",
              "Anniversary invitations for silver, golden and family gatherings",
              "Event invitations — baby showers, pujas, gatherings and corporate events",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-charcoal/75 leading-relaxed">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 leading-relaxed text-charcoal/70">
            Browse them by occasion:{" "}
            <Link href="/digital-wedding-invitations" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">digital wedding invitations</Link>
            {", "}
            <Link href="/engagement-invitations" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">engagements</Link>
            {", "}
            <Link href="/birthday-invitations" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">birthdays</Link>
            {", "}
            <Link href="/event-invitations" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">events</Link>
            {" "}— or <Link href="/demos" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">open a live demo</Link>{" "}
            to feel the experience.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-serif font-light text-3xl md:text-4xl">How the service works</h2>
          <p className="mt-4 leading-relaxed text-charcoal/70">
            Explore invitations on this website, choose a plan with transparent pricing, and share
            your celebration details with us on WhatsApp. Pay securely by UPI — every payment is
            verified manually and your order is confirmed personally before design begins. We
            design your invitation with revisions included, then deliver one shareable link.
            Read the full process on <Link href="/how-it-works" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">How It Works</Link>.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-serif font-light text-3xl md:text-4xl">Why families choose Mehfill.in</h2>
          <ul className="mt-4 grid gap-2.5">
            {[
              "Custom design for your family, faith and language — never a template dump",
              "Transparent pricing on the website, with delivery timelines per plan",
              "Design revisions included, so the invitation is right before it goes out",
              "Manual payment verification with personal confirmation — no silent checkout",
              "Privacy-respecting website: no advertising trackers, per our cookie policy",
              "Real demos you can open before paying anything",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-charcoal/75 leading-relaxed">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 leading-relaxed text-charcoal/70">
            We are a newly launching platform. Instead of borrowed claims, we show our work:
            open the demos, read the policies, and talk to us directly. Verified customer reviews
            will be published on our <Link href="/reviews" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">reviews page</Link>{" "}
            as orders are delivered.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-serif font-light text-3xl md:text-4xl">Who runs Mehfill.in</h2>
          <p className="mt-4 leading-relaxed text-charcoal/70">
            Mehfill.in was founded by Ayan Shaikh and is based in Nashik, Maharashtra, serving
            customers across India online. It is a new, independent venture — currently
            unregistered — growing one celebration at a time through personal service and
            word of mouth rather than big claims.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-serif font-light text-3xl md:text-4xl">Contact and support</h2>
          <p className="mt-4 leading-relaxed text-charcoal/70">
            Reach Ayan and the team on{" "}
            <a href={waLink(WA_MSG_GENERAL)} target="_blank" rel="noopener noreferrer" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">WhatsApp</a>
            {" "}for orders and support, by email at{" "}
            <EmailLink className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta" />
            {", "}or follow <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">our Instagram</a>{" "}
            for new designs. Full details on the <Link href="/contact" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">contact page</Link>.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-serif font-light text-3xl md:text-4xl">Questions, answered</h2>
          <div className="mt-6 divide-y divide-charcoal/10 border-y hairline">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="cursor-pointer font-serif text-xl md:text-2xl list-none flex items-center justify-between gap-4">
                  {f.q}
                  <span className="shrink-0 rounded-full border hairline px-2.5 py-1 text-lg leading-none group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 pr-10 text-[15px] leading-relaxed text-charcoal/65">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </article>
      <CTA />
      <Footer />
    </main>
  );
}
