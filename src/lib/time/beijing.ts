const BEIJING_OFFSET_MINUTES = 8 * 60;

export interface BeijingParts {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number; // 0-59
}

/**
 * Creates a JS Date that represents the given *Beijing time* (UTC+8).
 *
 * Internally we store it as an absolute timestamp (UTC ms). This ensures that
 * later calculations can reliably derive Beijing calendar fields regardless of
 * the viewer's device timezone.
 */
export function makeBeijingDate(parts: BeijingParts): Date {
  const utcMs = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0, 0);
  // Convert Beijing local time -> UTC timestamp
  return new Date(utcMs - BEIJING_OFFSET_MINUTES * 60_000);
}

/**
 * Extract Beijing (UTC+8) calendar fields from any Date.
 */
export function getBeijingParts(date: Date): BeijingParts {
  // Shift timestamp forward by +8h, then read via UTC getters.
  const shifted = new Date(date.getTime() + BEIJING_OFFSET_MINUTES * 60_000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}

/**
 * Parse YYYY-MM-DD (commonly stored in DB) into Y/M/D without timezone surprises.
 */
export function parseYmd(dateStr: string): { year: number; month: number; day: number } {
  const m = /^\s*(\d{4})-(\d{2})-(\d{2})\s*$/.exec(dateStr);
  if (!m) throw new Error(`Invalid date string: ${dateStr}`);
  return {
    year: Number(m[1]),
    month: Number(m[2]),
    day: Number(m[3]),
  };
}

/**
 * Safely create a local Date from a YYYY-MM-DD string for display purposes.
 * Avoids the UTC midnight issue of `new Date("YYYY-MM-DD")`.
 */
export function safeParseDate(dateStr: string): Date {
  const { year, month, day } = parseYmd(dateStr);
  return new Date(year, month - 1, day);
}

/**
 * Format a Date into yyyyMMddHH based on Beijing time.
 */
export function formatBeijingDatetime10(date: Date): string {
  const p = getBeijingParts(date);
  return (
    String(p.year).padStart(4, '0') +
    String(p.month).padStart(2, '0') +
    String(p.day).padStart(2, '0') +
    String(p.hour).padStart(2, '0')
  );
}
