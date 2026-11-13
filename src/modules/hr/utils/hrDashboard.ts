import type { HrActivity, HrEvent } from "../services/hrDashboardService";
import { isAxiosError } from "axios";

export function hrDashboardError(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status === 403) return "You do not have access to this HR information.";
    if (error.response?.status === 401) return "Your session has expired. Sign in again.";
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
  }
  return "The HR dashboard could not be loaded. Check your connection and try again.";
}

export const hrTimeZone = "Asia/Karachi";
export const number = (value: number) => new Intl.NumberFormat("en-PK").format(value);
export function todayInPakistan(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: hrTimeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  return ["year", "month", "day"].map(type => parts.find(part => part.type === type)?.value).join("-");
}
export function periodStart(today: string, months: number) {
  const date = new Date(today + "T12:00:00Z"); date.setUTCDate(1); date.setUTCMonth(date.getUTCMonth() - months + 1);
  return date.toISOString().slice(0, 10);
}
export function dateLabel(value: string, monthOnly = false) {
  // HR fields are local business dates. Do not convert midnight dates through UTC.
  return new Intl.DateTimeFormat("en-PK", { timeZone: "UTC", month: "short", ...(monthOnly ? { year: "2-digit" } : { day: "numeric", year: "numeric" }) }).format(new Date(value.slice(0, 10) + "T12:00:00Z"));
}
export function recentActivities(employee: HrActivity[], leave: HrActivity[]) {
  return [...new Map([...employee, ...leave].map(item => [item.id, item])).values()]
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id)).slice(0, 8);
}
export function upcomingEvents(holidays: HrEvent[], leaves: HrEvent[]) {
  return [...new Map([...holidays, ...leaves].map(item => [item.id, item])).values()]
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}
