import { adminTimeZone } from "@/lib/admin/config";

/** Date helpers for the owner admin. Times are shown in ADMIN_TIMEZONE
 * (IANA name, default UTC). */

export function formatDateTime(iso: string, tz: string = adminTimeZone()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso || "—";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(d);
}

export function formatDate(iso: string, tz: string = adminTimeZone()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso || "—";
  return new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", day: "numeric", month: "short" }).format(d);
}

/** "45 min", "5 h", "3 d" -- how long ago (or, for future dates, how long
 * until, prefixed "in"). */
export function relativeAge(iso: string, now: Date = new Date()): string {
  const ms = now.getTime() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return "—";
  const future = ms < 0;
  const abs = Math.abs(ms);
  const minutes = Math.round(abs / 60_000);
  const hours = Math.round(abs / 3_600_000);
  const days = Math.round(abs / 86_400_000);
  const label = minutes < 60 ? `${minutes} min` : hours < 48 ? `${hours} h` : `${days} d`;
  return future ? `in ${label}` : label;
}

export function hoursSince(iso: string, now: Date = new Date()): number {
  return (now.getTime() - new Date(iso).getTime()) / 3_600_000;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Owner visit days, ADMIN_VISIT_DAYS="Mon,Thu" by default
 * (docs/ops/weekly-operating-rhythm.md). */
export function visitDays(): number[] {
  const raw = process.env.ADMIN_VISIT_DAYS || "Mon,Thu";
  const days = raw
    .split(",")
    .map((d) => WEEKDAYS.findIndex((w) => w.toLowerCase() === d.trim().slice(0, 3).toLowerCase()))
    .filter((i) => i >= 0);
  return days.length > 0 ? [...new Set(days)].sort() : [1, 4];
}

function zonedParts(date: Date, tz: string): { weekday: number; msSinceMidnight: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  const weekday = WEEKDAYS.indexOf(get("weekday"));
  const ms = (Number(get("hour")) * 3600 + Number(get("minute")) * 60 + Number(get("second"))) * 1000;
  return { weekday, msSinceMidnight: ms };
}

/** The next visit day strictly after today (in the owner's timezone), and
 * the end of that day as the "before your next visit" horizon. DST shifts
 * can move the horizon by up to an hour -- fine for this purpose. */
export function nextVisit(now: Date = new Date(), tz: string = adminTimeZone()): { label: string; horizon: Date } {
  const { weekday, msSinceMidnight } = zonedParts(now, tz);
  const days = visitDays();
  let ahead = 7;
  for (const d of days) {
    const diff = (d - weekday + 7) % 7 || 7;
    ahead = Math.min(ahead, diff);
  }
  const startOfToday = now.getTime() - msSinceMidnight;
  const visitStart = new Date(startOfToday + ahead * 86_400_000);
  const horizon = new Date(startOfToday + (ahead + 1) * 86_400_000 - 1);
  return { label: formatDate(visitStart.toISOString(), tz), horizon };
}
