"use client";
import { motion } from "framer-motion";
import { WhatsAppIcon } from "./BrandIcons";
import { waLink, WA_MSG_GENERAL } from "@/lib/contact";

// Floating WhatsApp button — visible on every page.
export default function WhatsAppFloat() {
  return (
    <motion.a
      href={waLink(WA_MSG_GENERAL)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Mehfill on WhatsApp"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 18 }}
      className="group fixed bottom-5 right-5 md:bottom-7 md:right-7 z-[70] flex items-center gap-0 rounded-full bg-[#25D366] p-0 shadow-[0_12px_35px_rgba(37,211,102,0.45)] hover:shadow-[0_16px_45px_rgba(37,211,102,0.6)] transition-shadow"
    >
      {/* expanding label on hover (desktop) */}
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold text-white transition-all duration-300 group-hover:ml-4 group-hover:max-w-[140px]">
        Chat with us
      </span>
      <span className="relative flex h-14 w-14 md:h-16 md:w-16 items-center justify-center">
        {/* ping ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
        <WhatsAppIcon className="relative h-7 w-7 md:h-8 md:w-8 text-white" />
      </span>
    </motion.a>
  );
}
