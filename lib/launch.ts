// ─── MEHFILL.in launch gate ────────────────────────────────────────────────
// Launch: 2 Oct 2026, 3:00 PM IST (Asia/Kolkata) = 09:30 UTC.
// IST is UTC+5:30 with no DST, so this absolute epoch is timezone-independent:
// any device, any timezone compares Date.now() (UTC ms) against this value.

export const LAUNCH_TIMESTAMP_MS = Date.UTC(2026, 9, 2, 9, 30, 0);

export const LAUNCH_LABEL = "02.10.26 • 3:00 PM";

export function isLaunched(nowMs: number): boolean {
  return nowMs >= LAUNCH_TIMESTAMP_MS;
}

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  launched: boolean;
}

export function getCountdownParts(nowMs: number): CountdownParts {
  const totalMs = Math.max(0, LAUNCH_TIMESTAMP_MS - nowMs);
  const totalSec = Math.floor(totalMs / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    totalMs,
    launched: totalMs <= 0,
  };
}

export function pad2(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "00";
  return String(Math.floor(n)).padStart(2, "0");
}
