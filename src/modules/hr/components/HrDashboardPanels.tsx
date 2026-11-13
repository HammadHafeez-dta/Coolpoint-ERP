import { HrActivityAvatar } from "./HrActivityAvatar";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ArrowUpRight, CalendarCheck2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import type { DashboardSection, WorkforceOverview, AttendanceOverview, HrDashboardData } from "../services/hrDashboardService";
import { dateLabel, number, recentActivities, upcomingEvents } from "../utils/hrDashboard";
import { useState } from "react";

export function HrPanel({ title, caption, action, children, className = "" }: { title: string; caption: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <Card className={`min-w-0 shadow-none ${className}`}><CardHeader className="flex-row flex-wrap items-start justify-between gap-2 space-y-0 p-5"><div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{caption}</p></div>{action}</CardHeader><CardContent className="px-5 pb-5 pt-0">{children}</CardContent></Card>;
}
export function SourceState({ section, retry }: { section: DashboardSection<unknown>; retry: () => void }) {
  return <div className="flex min-h-36 flex-col items-center justify-center gap-3 py-6 text-center text-sm text-muted-foreground" role={section.status === "unavailable" ? "alert" : undefined}><p>{section.message || "No information available."}</p>{section.status === "unavailable" && <Button size="sm" variant="outline" onClick={retry}>Retry</Button>}</div>;
}
export function WorkforceTrend({ section, from, to, retry }: { section: DashboardSection<WorkforceOverview>; from: string; to: string; retry: () => void }) {
  const rows = section.data?.joiners.map(row => ({ ...row, label: dateLabel(row.month + "-01", true) })) || [];
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  return <HrPanel title="Recorded joiners" caption={`${dateLabel(from)} – ${dateLabel(to)}`}>
    {!section.data ? <SourceState section={section} retry={retry} /> : <>
      <p className="mb-4 text-xs text-muted-foreground"><strong className="text-lg font-semibold tabular-nums text-foreground">{number(total)}</strong> joining dates in this period</p>
      {total ? <div className="h-48 min-w-0" role="img" aria-label="Employee joining dates by month. Exact counts are in the chart data below."><ResponsiveContainer width="100%" height="100%"><BarChart data={rows} margin={{ top: 8, left: -24, right: 4 }} accessibilityLayer>
        <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} minTickGap={16} />
        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
        <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={({ active, payload }) => active && payload?.length ? <div className="rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-sm">{payload[0].payload.label}: {number(Number(payload[0].value))} joiners</div> : null} />
        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} maxBarSize={42} isAnimationActive={false} />
      </BarChart></ResponsiveContainer></div> : <p className="flex min-h-40 items-center justify-center text-center text-sm text-muted-foreground">No joining dates recorded in this period.</p>}
      <p className="mt-3 text-[11px] text-muted-foreground">Recorded employees, including leavers; this is not historical headcount.{section.data.missingJoiningDates > 0 && ` ${number(section.data.missingJoiningDates)} records have no joining date.`}</p>
      {total > 0 && <details className="mt-3 text-xs"><summary className="cursor-pointer text-primary">View chart data</summary><table className="mt-2 w-full text-left text-xs"><thead><tr><th scope="col">Month</th><th scope="col">Joiners</th></tr></thead><tbody>{rows.map(row => <tr key={row.month}><td className="py-1">{row.label}</td><td>{number(row.count)}</td></tr>)}</tbody></table></details>}
    </>}
  </HrPanel>;
}
const attendanceColors: Record<string, string> = { Present: "hsl(var(--primary))", "On leave": "hsl(var(--primary) / 0.55)", Absent: "hsl(var(--destructive))", "Rest / holiday": "hsl(var(--warning))", "Other / not marked": "hsl(var(--muted-foreground))" };
export function AttendancePanel({ section, retry }: { section: DashboardSection<AttendanceOverview>; retry: () => void }) {
  const data = section.data;
  return <HrPanel title="Attendance overview" caption="Today · processed attendance register">
    {!data ? <SourceState section={section} retry={retry} /> : !data.total ? <p className="py-12 text-center text-sm text-muted-foreground">No active employees to report.</p> : <>
      <div className="relative mx-auto h-40 w-40" role="img" aria-label={`${number(data.total)} active employees. Attendance counts and percentages follow.`}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.buckets.filter(row => row.count)} dataKey="count" nameKey="label" innerRadius={52} outerRadius={73} stroke="hsl(var(--card))" strokeWidth={2} isAnimationActive={false}>{data.buckets.filter(row => row.count).map(row => <Cell key={row.label} fill={attendanceColors[row.label]} />)}</Pie></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><strong className="text-2xl font-semibold tabular-nums">{number(data.total)}</strong><span className="text-[10px] text-muted-foreground">Active employees</span></div></div>
      <ul className="mt-3 space-y-2">{data.buckets.map(row => <li key={row.label} className="flex items-center gap-2 text-xs"><span className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: attendanceColors[row.label] }} /><span className="flex-1">{row.label}</span><strong className="tabular-nums">{number(row.count)}</strong><span className="w-10 text-right tabular-nums text-muted-foreground">{new Intl.NumberFormat("en", { maximumFractionDigits: 1 }).format(row.count / data.total * 100)}%</span></li>)}</ul>
      <p className="mt-4 text-[11px] text-muted-foreground">Shares use all active employees, including rest days. Missing or unrecognized register entries stay “Other / not marked”; they are not inferred absent.</p>
    </>}
  </HrPanel>;
}
export function DepartmentPanel({ section, retry, href }: { section: DashboardSection<WorkforceOverview>; retry: () => void; href?: string }) {
  const total = section.data?.activeEmployees || 0;
  return <HrPanel title="Department headcount" caption="Active employees · today" action={href && <Link to={href} className="text-xs font-medium text-primary hover:underline">Departments <ArrowUpRight className="inline size-3" /></Link>}>
    {!section.data ? <SourceState section={section} retry={retry} /> : !total ? <p className="py-12 text-center text-sm text-muted-foreground">No active employees assigned yet.</p> : <><ul className="space-y-5">{section.data.departments.map(row => <li key={row.label}><div className="mb-2 flex items-start justify-between gap-3 text-xs"><span className="break-words">{row.label}</span><strong className="tabular-nums">{number(row.count)}</strong></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${row.count / total * 100}%` }} /></div></li>)}</ul><p className="mt-5 text-[11px] text-muted-foreground">{number(total)} active employees across all listed groups. Unassigned records are included.</p></>}
  </HrPanel>;
}
export function ActivityPanel({ data, retry }: { data: HrDashboardData; retry: () => void }) {
  const sources = [data.employeeActivity, data.leaveActivity];
  const rows = recentActivities(data.employeeActivity.data || [], data.leaveActivity.data || []);
  return <HrPanel title="Recent HR activity" caption="Recorded employee creation and leave submission dates" className="xl:col-span-7">
    {sources.every(s => !s.data) ? <SourceState section={sources.find(s => s.status === "unavailable") || sources[0]} retry={retry} /> : <>
      {sources.filter(s => s.status === "unavailable").map((s, i) => <p key={i} role="alert" className="mb-3 text-xs text-destructive">One activity source is unavailable. <button onClick={retry} className="underline">Retry</button></p>)}
      {!rows.length ? <p className="py-10 text-center text-sm text-muted-foreground">No recorded activity in this period.</p> : <ul aria-label="Recent HR activity list" tabIndex={0} className="max-h-80 overflow-y-auto overscroll-contain divide-y pr-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{rows.map(row => <li key={row.id}><Link to={row.href} className="group flex items-start gap-3 rounded-md py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><HrActivityAvatar employeeId={row.employeeId} name={row.employee} /><div className="min-w-0 flex-1"><p className="break-words text-xs font-semibold group-hover:text-primary">{row.employee}</p><p className="mt-1 text-xs text-muted-foreground">{row.action}</p><time className="mt-1 block text-[11px] text-muted-foreground" dateTime={row.date}>{dateLabel(row.date)}</time></div><span className="shrink-0 rounded-md bg-muted px-2 py-1 text-[10px] font-medium">{row.status}</span></Link></li>)}</ul>}
      <p className="mt-3 text-[11px] text-muted-foreground">Statuses reflect the current state of each record.</p>
    </>}
  </HrPanel>;
}
export function EventsPanel({ data, retry }: { data: HrDashboardData; retry: () => void }) {
  const [all, setAll] = useState(false);
  const sources = [data.holidays, data.scheduledLeave]; const rows = upcomingEvents(data.holidays.data || [], data.scheduledLeave.data || []);
  return <HrPanel title="Upcoming events & deadlines" caption="Next 30 days · gazetted holidays and approved leave" className="xl:col-span-5">
    {sources.every(s => !s.data) ? <SourceState section={sources.find(s => s.status === "unavailable") || sources[0]} retry={retry} /> : <>
      {sources.some(s => s.status === "unavailable") && <p role="alert" className="mb-3 text-xs text-destructive">One event source is unavailable. <button onClick={retry} className="underline">Retry</button></p>}
      {!rows.length ? <div className="py-10 text-center"><CalendarCheck2 className="mx-auto mb-3 size-7 text-muted-foreground" aria-hidden="true" /><p className="text-sm text-muted-foreground">No upcoming HR events in the next 30 days.</p></div> : <ul className="divide-y">{rows.slice(0, all ? undefined : 5).map(row => <li key={row.id}><Link to={row.href} className="group flex items-start gap-3 rounded-md py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{row.kind === "holiday" ? <CalendarDays size={17} aria-hidden="true" /> : <CalendarCheck2 size={17} aria-hidden="true" />}</span><div className="min-w-0 flex-1"><h3 className="break-words text-xs font-semibold group-hover:text-primary">{row.title}</h3><p className="mt-1 break-words text-xs text-muted-foreground">{row.detail}</p><time dateTime={row.date} className="mt-2 inline-block rounded-md bg-muted px-2 py-1 text-[11px]">{row.date.slice(0, 10) === data.today ? "Today" : dateLabel(row.date)}</time></div></Link></li>)}</ul>}
      {rows.length > 5 && <Button size="sm" variant="outline" className="mt-3 w-full" aria-expanded={all} onClick={() => setAll(!all)}>{all ? "Show fewer events" : `View all ${rows.length} events`}</Button>}
    </>}
  </HrPanel>;
}
