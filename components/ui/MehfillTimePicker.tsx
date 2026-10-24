"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, ChevronDown, Check } from "lucide-react";

interface MehfillTimePickerProps {
  value: string; // "HH:MM" (24-hour e.g. "19:30") or ""
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
const MINUTES = ["00", "15", "30", "45"];
const POPULAR_SLOTS = [
  { label: "Morning (10:00 AM)", value: "10:00" },
  { label: "Afternoon (1:00 PM)", value: "13:00" },
  { label: "High Tea (4:30 PM)", value: "16:30" },
  { label: "Sunset / Barat (6:30 PM)", value: "18:30" },
  { label: "Dinner / Reception (8:00 PM)", value: "20:00" },
  { label: "Night Celebration (9:30 PM)", value: "21:30" },
];

function parse24(val: string): { hour12: number; minute: string; ampm: "AM" | "PM" } {
  if (!val) return { hour12: 7, minute: "00", ampm: "PM" };
  const [hStr, mStr] = val.split(":");
  let h = parseInt(hStr || "0", 10);
  const m = mStr ? mStr.padStart(2, "0") : "00";
  const ampm: "AM" | "PM" = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return { hour12: h, minute: m, ampm };
}

function to24(hour12: number, minute: string, ampm: "AM" | "PM"): string {
  let h = hour12;
  if (ampm === "AM" && h === 12) h = 0;
  if (ampm === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

function formatDisplayTime(val: string): string {
  if (!val) return "";
  const { hour12, minute, ampm } = parse24(val);
  return `${hour12}:${minute} ${ampm}`;
}

export function MehfillTimePicker({
  value,
  onChange,
  placeholder = "Select event timing",
  className = "",
}: MehfillTimePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const parsed = parse24(value);
  const [selectedHour, setSelectedHour] = useState(parsed.hour12);
  const [selectedMinute, setSelectedMinute] = useState(parsed.minute);
  const [selectedAmpm, setSelectedAmpm] = useState(parsed.ampm);

  useEffect(() => {
    if (value) {
      const p = parse24(value);
      setSelectedHour(p.hour12);
      setSelectedMinute(p.minute);
      setSelectedAmpm(p.ampm);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const applyChange = (h: number, m: string, ap: "AM" | "PM") => {
    setSelectedHour(h);
    setSelectedMinute(m);
    setSelectedAmpm(ap);
    onChange(to24(h, m, ap));
  };

  const clearTime = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-[#DECFC0] bg-white/95 px-4 py-2.5 text-left text-xs sm:text-sm text-[#2B1F17] transition-all hover:border-[#8B4828] focus:border-[#8B4828] focus:ring-2 focus:ring-[#8B4828]/15 ${className}`}
      >
        <span className={value ? "font-medium text-[#2B1F17]" : "text-[#B5A496]"}>
          {value ? formatDisplayTime(value) : placeholder}
        </span>
        <Clock className="h-4 w-4 text-[#8B4828] shrink-0" />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-72 sm:w-80 rounded-2xl border border-[#DECFC0] bg-[#FFFDF9] p-4 shadow-[0_20px_45px_rgba(70,45,25,0.18)] animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#EFE5D8]">
            <span className="font-serif text-base font-bold text-[#2B1F17]">Select Timing</span>
            <span className="rounded-full bg-[#FAF6EE] border border-[#DECFC0] px-2.5 py-0.5 text-[11px] font-bold text-[#8B4828]">
              {selectedHour}:{selectedMinute} {selectedAmpm}
            </span>
          </div>

          {/* Quick presets */}
          <div className="mt-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#9E8B7C] mb-1.5">
              Popular Wedding Slots
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {POPULAR_SLOTS.map((slot) => {
                const isSelected = value === slot.value;
                return (
                  <button
                    key={slot.value}
                    type="button"
                    onClick={() => {
                      onChange(slot.value);
                      const p = parse24(slot.value);
                      setSelectedHour(p.hour12);
                      setSelectedMinute(p.minute);
                      setSelectedAmpm(p.ampm);
                      setOpen(false);
                    }}
                    className={`truncate rounded-lg px-2 py-1.5 text-left text-[11px] font-medium transition-all ${
                      isSelected
                        ? "bg-[#8B4828] text-white font-bold"
                        : "bg-[#FAF6EE] text-[#4A2F1B] hover:bg-[#F3E7D8]"
                    }`}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom selector */}
          <div className="mt-4 pt-3 border-t border-[#EFE5D8]">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#9E8B7C] mb-2">
              Custom Time
            </span>
            <div className="grid grid-cols-3 gap-2">
              {/* Hour selector */}
              <div>
                <label className="block text-[10px] text-[#7A6353] font-bold mb-1">Hour</label>
                <div className="max-h-28 overflow-y-auto space-y-1 rounded-xl border border-[#DECFC0] bg-white p-1">
                  {HOURS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => applyChange(h, selectedMinute, selectedAmpm)}
                      className={`w-full rounded-md py-1 text-center text-xs font-semibold transition-all ${
                        selectedHour === h
                          ? "bg-[#8B4828] text-white font-bold"
                          : "text-[#2B1F17] hover:bg-[#FAF6EE]"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minute selector */}
              <div>
                <label className="block text-[10px] text-[#7A6353] font-bold mb-1">Min</label>
                <div className="max-h-28 overflow-y-auto space-y-1 rounded-xl border border-[#DECFC0] bg-white p-1">
                  {MINUTES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => applyChange(selectedHour, m, selectedAmpm)}
                      className={`w-full rounded-md py-1 text-center text-xs font-semibold transition-all ${
                        selectedMinute === m
                          ? "bg-[#8B4828] text-white font-bold"
                          : "text-[#2B1F17] hover:bg-[#FAF6EE]"
                      }`}
                    >
                      :{m}
                    </button>
                  ))}
                </div>
              </div>

              {/* AM/PM toggle */}
              <div>
                <label className="block text-[10px] text-[#7A6353] font-bold mb-1">Period</label>
                <div className="space-y-1">
                  {(["AM", "PM"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => applyChange(selectedHour, selectedMinute, p)}
                      className={`w-full rounded-xl py-2 text-center text-xs font-bold transition-all border ${
                        selectedAmpm === p
                          ? "bg-[#8B4828] text-white border-[#8B4828] shadow-sm"
                          : "bg-white text-[#4A2F1B] border-[#DECFC0] hover:bg-[#FAF6EE]"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="mt-3 flex items-center justify-between border-t border-[#EFE5D8] pt-2 text-[11px] font-bold">
            <button
              type="button"
              onClick={clearTime}
              className="text-[#9E8B7C] hover:text-[#A63C26] transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-[#8B4828] px-3.5 py-1 text-white hover:bg-[#72391F] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
