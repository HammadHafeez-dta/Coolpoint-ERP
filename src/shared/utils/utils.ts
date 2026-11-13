import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Today's date as yyyy-MM-dd in the local timezone (toISOString would shift it via UTC). */
export function todayLocalISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Returns the last day of the month for a given ISO date string (YYYY-MM-DD),
 * formatted as YYYY-MM-DD.
 */
export function getEndOfMonthDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length < 2) return "";
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  if (isNaN(year) || isNaN(month)) return "";
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}

/**
 * Returns the automatic academic session date range (1-April to 1-March of next year).
 * When March 1st arrives (month >= March / month index >= 2), it rolls over to the next session year.
 * e.g., in Sept 2026 -> { from: "2026-04-01", to: "2027-03-01" }
 * e.g., on 1-March-2027 -> { from: "2027-04-01", to: "2028-03-01" }
 */
export function getAcademicSessionDateRange(currentDate = new Date()): { from: string; to: string } {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0 = Jan, 1 = Feb, 2 = Mar, ...

  // From March 1st onwards (month >= 2), the session start year is current year.
  // In Jan/Feb (month < 2), it belongs to the session that started in previous year.
  const startYear = currentMonth >= 2 ? currentYear : currentYear - 1;
  const endYear = startYear + 1;

  return {
    from: `${startYear}-04-01`,
    to: `${endYear}-03-01`,
  };
}

/**
 * Returns the current calendar month date range (e.g. 2026-09-01 to 2026-09-30).
 */
export function getCurrentMonthDateRange(currentDate = new Date()): { from: string; to: string } {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();
  return {
    from: `${year}-${String(month).padStart(2, "0")}-01`,
    to: `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
  };
}

