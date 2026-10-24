"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

interface MehfillDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  min?: string;
  placeholder?: string;
  className?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseDate(str: string): Date | null {
  if (!str) return null;
  const parts = str.split("-").map(Number);
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(str: string): string {
  const d = parseDate(str);
  if (!d) return "";
  const day = d.getDate();
  const month = MONTH_NAMES[d.getMonth()].slice(0, 3);
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
}

export function MehfillDatePicker({
  value,
  onChange,
  min,
  placeholder = "Select wedding date",
  className = "",
}: MehfillDatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedDate = parseDate(value);
  const minDate = min ? parseDate(min) : null;

  const [currentYear, setCurrentYear] = useState(() => selectedDate ? selectedDate.getFullYear() : new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => selectedDate ? selectedDate.getMonth() : new Date().getMonth());

  useEffect(() => {
    if (selectedDate) {
      setCurrentYear(selectedDate.getFullYear());
      setCurrentMonth(selectedDate.getMonth());
    }
  }, [value]);

  // Click outside listener
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

  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Calendar matrix calculation
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const cells: { dateStr: string; dayNum: number; isCurrentMonth: boolean; disabled: boolean; isToday: boolean; isSelected: boolean }[] = [];

  const todayStr = formatDate(new Date());

  // Prev month padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const m = currentMonth === 0 ? 11 : currentMonth - 1;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dStr = formatDate(new Date(y, m, day));
    const disabled = !!(minDate && new Date(y, m, day) < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()));
    cells.push({
      dateStr: dStr,
      dayNum: day,
      isCurrentMonth: false,
      disabled,
      isToday: dStr === todayStr,
      isSelected: dStr === value,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const dStr = formatDate(new Date(currentYear, currentMonth, d));
    const disabled = !!(minDate && new Date(currentYear, currentMonth, d) < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()));
    cells.push({
      dateStr: dStr,
      dayNum: d,
      isCurrentMonth: true,
      disabled,
      isToday: dStr === todayStr,
      isSelected: dStr === value,
    });
  }

  // Next month padding to fill grid
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const m = currentMonth === 11 ? 0 : currentMonth + 1;
    const y = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dStr = formatDate(new Date(y, m, d));
    cells.push({
      dateStr: dStr,
      dayNum: d,
      isCurrentMonth: false,
      disabled: false,
      isToday: dStr === todayStr,
      isSelected: dStr === value,
    });
  }

  const handleSelect = (dateStr: string, disabled: boolean) => {
    if (disabled) return;
    onChange(dateStr);
    setOpen(false);
  };

  const handleSetToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const t = formatDate(new Date());
    onChange(t);
    setCurrentYear(new Date().getFullYear());
    setCurrentMonth(new Date().getMonth());
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
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
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <CalendarIcon className="h-4 w-4 text-[#8B4828] shrink-0" />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-72 sm:w-80 rounded-2xl border border-[#DECFC0] bg-[#FFFDF9] p-4 shadow-[0_20px_45px_rgba(70,45,25,0.18)] animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#EFE5D8]">
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-lg font-bold text-[#2B1F17]">
                {MONTH_NAMES[currentMonth]}
              </span>
              <span className="font-serif text-lg font-light text-[#8B4828]">
                {currentYear}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Previous month"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#DECFC0] bg-white text-[#4A2F1B] hover:bg-[#FAF6EE] transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                aria-label="Next month"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#DECFC0] bg-white text-[#4A2F1B] hover:bg-[#FAF6EE] transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 pt-3 pb-1 text-center">
            {WEEKDAYS.map((w, idx) => (
              <span
                key={w}
                className={`text-[11px] font-bold ${
                  idx === 0 || idx === 6 ? "text-[#8B4828]" : "text-[#9E8B7C]"
                }`}
              >
                {w}
              </span>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((c, i) => (
              <button
                key={i}
                type="button"
                disabled={c.disabled}
                onClick={() => handleSelect(c.dateStr, c.disabled)}
                className={`flex h-8 sm:h-9 w-full items-center justify-center rounded-xl text-xs font-semibold transition-all ${
                  c.isSelected
                    ? "bg-[#8B4828] text-white shadow-sm ring-2 ring-[#8B4828]/30 font-bold"
                    : c.isToday
                    ? "border border-[#8B4828] text-[#8B4828] bg-[#FAF6EE]"
                    : c.disabled
                    ? "opacity-25 cursor-not-allowed text-[#B5A496]"
                    : c.isCurrentMonth
                    ? "text-[#2B1F17] hover:bg-[#F4ECE1] hover:text-[#8B4828]"
                    : "text-[#C4B3A4] hover:bg-[#FAF6EE]"
                }`}
              >
                {c.dayNum}
              </button>
            ))}
          </div>

          {/* Footer actions */}
          <div className="mt-3 flex items-center justify-between border-t border-[#EFE5D8] pt-2 text-[11px] font-bold">
            <button
              type="button"
              onClick={handleClear}
              className="text-[#9E8B7C] hover:text-[#A63C26] transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSetToday}
              className="text-[#8B4828] hover:text-[#642E16] transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
