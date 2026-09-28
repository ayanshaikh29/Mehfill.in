"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Reveal } from "./Reveal";

const FAQS = [
  {
    q: "How do I order an invitation?",
    a: "Watch a live demo, message us on WhatsApp with your celebration details, and pay online or on chat. We design your custom invitation and deliver one beautiful shareable link.",
  },
  {
    q: "Do you make invitations for all religions?",
    a: "Yes — Hindu, Muslim, Sikh, Christian and interfaith families. Nikah, Pheras, Anand Karaj, Church weddings, Puja, Dawat, Baptism and more, in your language and customs.",
  },
  {
    q: "What details do you need from me?",
    a: "Names, date, venue, event schedule, photos, and any special wording, blessings or music. Just forward everything on WhatsApp — we handle the rest.",
  },
  {
    q: "How long does delivery take?",
    a: "Essential in 3 days, Signature in 2 days, Royal in 24–48 hours on priority. Need it urgently for tomorrow's function? Message us — we will try our best.",
  },
  {
    q: "How do payments work?",
    a: "Pay directly to our UPI ID from any app — GPay, PhonePe, Paytm or BHIM — then submit your transaction ID on this site. We verify every payment manually and confirm on WhatsApp before starting your design. GST invoice available on request.",
  },
  {
    q: "Can I request changes after delivery?",
    a: "Of course. Every plan includes revisions (1 in Essential, 3 in Signature, 7 days of revisions in Royal). We don't stop till you love it.",
  },
  {
    q: "How do guests open and RSVP?",
    a: "Guests get one link — it opens beautifully on any phone, no app needed. They can view events, locations and confirm RSVP in one tap.",
  },
  {
    q: "Do I need an account to order?",
    a: "No. You can order directly on WhatsApp. An account simply lets you track your orders and revisit your invitations anytime.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <Reveal className="text-center">
          <p className="eyebrow text-terracotta">QUESTIONS</p>
          <h2 className="mt-4 font-serif font-light text-4xl md:text-6xl">Everything, <span className="italic">answered.</span></h2>
        </Reveal>
        <div className="mt-10 divide-y divide-charcoal/10 border-y hairline">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="font-serif text-xl md:text-2xl">{f.q}</span>
                  <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="shrink-0 rounded-full border hairline p-2">
                    <Plus className="h-4 w-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-10 text-[15px] leading-relaxed text-charcoal/65">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
