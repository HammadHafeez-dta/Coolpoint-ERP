import type { OverviewBucket } from "../services/salesOverviewService";

export const dashboardTimeZone = "Asia/Karachi";
export function pakistanDay(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: dashboardTimeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
export function daysBefore(day: string, days: number): string {
  const date = new Date(day + "T00:00:00Z"); date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}
export function formatAmount(value: number, currency: string): string {
  return `${currency} ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 }).format(value)}`;
}
export function localDate(value: string, withTime = false): string {
  const input = value.length === 10 ? value + "T12:00:00Z" : /Z$|[+-]\d\d:\d\d$/.test(value) ? value : value + "Z";
  return new Intl.DateTimeFormat("en-PK", { timeZone: dashboardTimeZone, day: "numeric", month: "short", year: "numeric", ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}) }).format(new Date(input));
}
export function chartSeries(rows: OverviewBucket[]) {
  if (!rows.length) return [];
  const monthly = rows.length > 90; const weekly = rows.length > 14 && !monthly;
  const groups = new Map<string, OverviewBucket>();
  rows.forEach((row, index) => {
    const key = monthly ? row.date.slice(0, 7) + "-01" : weekly ? rows[Math.floor(index / 7) * 7].date : row.date;
    const group = groups.get(key) || { date: key, amount: 0, deals: 0, missingValues: 0 };
    group.amount += row.amount; group.deals += row.deals; group.missingValues += row.missingValues;
    groups.set(key, group);
  });
  return [...groups.values()].map(row => ({ ...row, label: new Intl.DateTimeFormat("en-PK", { timeZone: "UTC", month: "short", ...(monthly ? {} : { day: "numeric" }) }).format(new Date(row.date + "T12:00:00Z")) }));
}
export const stageLabels: Record<string, string> = { New: "New", Contacted: "Contacted", Qualified: "Qualified", ProposalSent: "Proposal sent", Won: "Won", Lost: "Lost", Disqualified: "Disqualified" };
export const stageColors: Record<string, string> = { New: "#aab6ca", Contacted: "#8199c2", Qualified: "#5276ae", ProposalSent: "#345a92", Won: "hsl(var(--primary))", Lost: "#d0d5df" };
