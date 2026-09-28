"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PremiumSelectProps {
  value: string;
  options: { value: string; label: string }[];
  placeholder: string;
  onChange: (value: string) => void;
  error?: boolean;
  label?: string;
  name: string;
}

export default function PremiumSelect({ value, options, placeholder, onChange, error, label, name }: PremiumSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue = options.find(o => o.value === value)?.label || placeholder;

  return (
    <div className="relative" ref={ref}>
      {label && <label className="block text-[12px] font-bold tracking-[0.1em] text-charcoal/55 mb-1.5">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between rounded-2xl border px-4 py-3.5 text-sm outline-none transition-all ${
          error
            ? "border-terracotta-deep bg-white focus:border-terracotta-deep"
            : "border hairline bg-white hover:border-charcoal/30 focus:border-terracotta"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
      >
        <span className={`truncate ${value ? "text-charcoal" : "text-charcoal/40"}`}>
          {displayValue}
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-charcoal/60 shrink-0 ml-2" /> : <ChevronDown className="h-4 w-4 text-charcoal/60 shrink-0 ml-2" />}
      </button>

      {open && (
        <AnimatePresence>
          <motion.ul
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-20 mt-1.5 w-full max-h-60 overflow-y-auto rounded-2xl border hairline bg-white shadow-[0_12px_30px_rgba(28,25,23,0.15)] py-1"
            role="listbox"
          >
            {options.map((opt) => (
              <motion.li
                key={opt.value}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.1, delay: options.indexOf(opt) * 0.02 }}
              >
                <button
                  role="option"
                  aria-selected={value === opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full px-4 py-3 text-sm text-left transition-colors ${
                    value === opt.value
                      ? "bg-terracotta/10 text-terracotta font-semibold"
                      : "text-charcoal/80 hover:bg-cream hover:text-charcoal"
                  }`}
                >
                  {opt.label}
                </button>
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>
      )}
    </div>
  );
}