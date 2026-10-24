"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Reveal } from "./Reveal";
import { useT } from "./i18n/I18nProvider";

import { FAQS } from "@/lib/faq-data";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const t = useT();
  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <Reveal className="text-center">
          <p className="eyebrow text-terracotta">{t("faq.eyebrow")}</p>
          <h2 className="mt-4 font-serif font-light text-4xl md:text-6xl">{t("faq.title")} <span className="italic">{t("faq.accent")}</span></h2>
        </Reveal>
        <div className="mt-10 divide-y divide-charcoal/10 border-y hairline">
          {FAQS.map((_, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="font-serif text-xl md:text-2xl">{t(`faq.q${i + 1}`)}</span>
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
                      <p className="pb-6 pr-10 text-[15px] leading-relaxed text-charcoal/65">{t(`faq.a${i + 1}`)}</p>
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
