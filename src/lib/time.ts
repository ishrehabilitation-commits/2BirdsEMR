// All dates in the UI are shown in the agency's local time zone, regardless of
// where the server runs (Vercel servers run in UTC).
export const AGENCY_TZ = "America/Chicago";

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: AGENCY_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function zonedParts(date: Date) {
  const p = Object.fromEntries(partsFormatter.formatToParts(date).map((x) => [x.type, x.value]));
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour),
    minute: Number(p.minute),
    second: Number(p.second),
  };
}

/** Today's calendar date in the agency time zone, as YYYY-MM-DD. */
export function todayISO(now = new Date()): string {
  const { year, month, day } = zonedParts(now);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Adds whole days to a YYYY-MM-DD date. */
export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Converts a wall-clock time in the agency time zone to a UTC instant. */
export function zonedTimeToUtc(isoDate: string, hour: number, minute: number): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, hour, minute);
  const p = zonedParts(new Date(guess));
  const asIfUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return new Date(guess - (asIfUtc - guess));
}

/** Calendar date (YYYY-MM-DD) of an instant, in the agency time zone. */
export function dateOf(instant: string | Date): string {
  return todayISO(typeof instant === "string" ? new Date(instant) : instant);
}

export function daysBetween(fromISODate: string, toISODate: string): number {
  return Math.round(
    (new Date(`${toISODate}T00:00:00Z`).getTime() - new Date(`${fromISODate}T00:00:00Z`).getTime()) /
      86_400_000,
  );
}

export function formatTime(instant: string): string {
  return new Date(instant).toLocaleTimeString("en-US", {
    timeZone: AGENCY_TZ,
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(isoDateOrInstant: string): string {
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(isoDateOrInstant);
  const d = new Date(isDateOnly ? `${isoDateOrInstant}T12:00:00Z` : isoDateOrInstant);
  return d.toLocaleDateString("en-US", {
    timeZone: isDateOnly ? "UTC" : AGENCY_TZ,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatWeekday(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
