// Dates and times for appointments. Appointments are stored as a date string
// ("2026-10-01") and a time label ("9:30 AM") in the hospital's local time,
// so "today" and "now" must be worked out in that time zone, not the server's
// (Render runs in UTC).

export const HOSPITAL_TIMEZONE = process.env.HOSPITAL_TIMEZONE || "Africa/Lagos";
export const SLOT_MINUTES = Number(process.env.APPOINTMENT_SLOT_MINUTES) || 30;

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// "2026-10-01" in the hospital's time zone.
export function todayInHospital(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: HOSPITAL_TIMEZONE }).format(now);
}

// Minutes since midnight, hospital time.
export function minutesNowInHospital(now = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: HOSPITAL_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const value = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return value("hour") * 60 + value("minute");
}

export function isDateString(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

// The weekday of a date string. Uses UTC so the server's own time zone can't
// shift it to the day before.
export function dayNameOf(date: string): string {
  return DAY_NAMES[new Date(`${date}T00:00:00Z`).getUTCDay()];
}

// Days from `from` to `to` (both date strings); negative when `to` is earlier.
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

// "9:30 AM" -> 570. Accepts "9:30am", "09:30 AM" and 24-hour "14:00". Null if unreadable.
export function parseTimeLabel(label: unknown): number | null {
  if (typeof label !== "string") return null;
  const match = label.trim().match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])?$/);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (minutes > 59) return null;
  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    if (meridiem === "AM" && hours === 12) hours = 0;
    if (meridiem === "PM" && hours !== 12) hours += 12;
  } else if (hours > 23) {
    return null;
  }
  return hours * 60 + minutes;
}

// 570 -> "9:30 AM". The one format appointment times are stored in.
export function formatTimeLabel(totalMinutes: number): string {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(minutes).padStart(2, "0")} ${hours24 < 12 ? "AM" : "PM"}`;
}

// Start times of every slot in a window, e.g. 9:00 AM–1:00 PM in 30-minute
// slots gives 9:00 AM ... 12:30 PM. A slot must finish by the window's end.
export function slotStartsInWindow(start: string, end: string, slotMinutes = SLOT_MINUTES): number[] {
  const from = parseTimeLabel(start);
  const to = parseTimeLabel(end);
  if (from === null || to === null || to <= from) return [];

  const starts: number[] = [];
  for (let t = from; t + slotMinutes <= to; t += slotMinutes) starts.push(t);
  return starts;
}

// For sorting appointments: date, then time of day ("9:00 AM" before "10:00 AM").
export function compareDateTime(a: { date: string; time: string }, b: { date: string; time: string }): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  return (parseTimeLabel(a.time) ?? 0) - (parseTimeLabel(b.time) ?? 0);
}
