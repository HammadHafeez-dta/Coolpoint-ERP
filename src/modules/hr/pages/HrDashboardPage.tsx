import { useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, CalendarDays, ClipboardCheck, RefreshCw, ArrowUpRight } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { usePermissionsStore } from "@/modules/user-management/store/permissionsStore";
import { authService } from "@/modules/auth/services/authService";
import { hrDashboardService, type DashboardSection } from "../services/hrDashboardService";
import { dateLabel, number, periodStart, todayInPakistan, hrDashboardError } from "../utils/hrDashboard";
import { WorkforceTrend, AttendancePanel, DepartmentPanel, ActivityPanel, EventsPanel } from "../components/HrDashboardPanels";

function Metric({ label, value, section, icon, caption, href }: { label: string; value: number | undefined; section: DashboardSection<unknown>; icon: ReactNode; caption: string; href?: string }) {
  const content = <><div className="flex items-start justify-between gap-2"><p className="text-xs font-medium text-muted-foreground">{label}</p><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span></div><p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">{value === undefined ? "—" : number(value)}</p><p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{section.status === "ready" ? caption : section.status === "restricted" ? "Access required" : "Temporarily unavailable"}</p>{href && section.data && <ArrowUpRight size={14} className="absolute bottom-5 right-5 text-primary" aria-hidden="true" />}</>;
  const style = "relative block h-full rounded-lg p-5";
  return <Card className="min-w-0 shadow-none">{href && section.data ? <Link to={href} className={`${style} pr-10 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}>{content}</Link> : <div className={style}>{content}</div>}</Card>;
}
export default function HrDashboardPage({ embedded = false }: { embedded?: boolean } = {}) {
  const permissions = usePermissionsStore(); const site = authService.getSite();
  const [params, setParams] = useSearchParams(); const today = todayInPakistan();
  const from = params.get("from") || periodStart(today, 6); const to = params.get("to") || today;
  const [custom, setCustom] = useState(false); const [filterError, setFilterError] = useState("");
  const query = useQuery({ queryKey: ["hr-dashboard", site, permissions.bundle?.userId, permissions.bundle, from, to], queryFn: ({ signal }) => hrDashboardService.get(from, to, signal), enabled: permissions.isLoaded, staleTime: 60_000, retry: 1 });
  const data = query.data; const retry = () => { void query.refetch(); };
  const can = (page: string) => permissions.canView("HRMS", page);
  const preset = [3, 6, 12].find(months => from === periodStart(today, months) && to === today)?.toString() || "custom";
  function applyRange(months: string) {
    setFilterError(""); setCustom(months === "custom"); if (months === "custom") return;
    const next = new URLSearchParams(params); next.set("from", periodStart(today, Number(months))); next.set("to", today); setParams(next, { replace: true });
  }
  return <div className="min-h-full w-full shrink-0">
    {!embedded && (
      <header className="sticky top-0 z-30 border-b border-border bg-card text-card-foreground">
        <div className="mx-auto flex min-h-14 w-full max-w-[1600px] items-center justify-between gap-2 px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="text-sm font-semibold leading-snug">HRMS overview</span>
          </div>
          {can("Employee") && <Link to="/hr/employees" className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-primary transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:px-3">Employee directory <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" /></Link>}
        </div>
      </header>
    )}
    <div className="mx-auto w-full max-w-[1600px] space-y-5 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0"><p className="mb-2 text-xs text-muted-foreground">Dashboard / Overview</p><h1 className="text-2xl font-bold tracking-tight">HR Dashboard</h1><p className="mt-2 text-sm text-muted-foreground">Workforce, attendance and what’s coming up.</p></div>
        <div className="flex max-w-full flex-wrap items-center gap-x-3 gap-y-2">
          <label htmlFor="hr-period" className="w-full text-xs font-medium text-muted-foreground sm:w-auto">Activity period</label>
          <select id="hr-period" aria-label="HR dashboard date range" value={custom ? "custom" : preset} onChange={e => applyRange(e.target.value)} className="h-10 min-w-0 flex-1 rounded-md border bg-card px-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-none"><option value="3">Last 3 months</option><option value="6">Last 6 months</option><option value="12">Last 12 months</option><option value="custom">Custom dates</option></select>
          <Button variant="outline" size="icon" className="shrink-0" aria-label="Refresh HR dashboard" disabled={query.isFetching} onClick={retry}><RefreshCw size={15} className={query.isFetching ? "animate-spin motion-reduce:animate-none" : ""} /></Button>
        </div>
      </div>
      {(custom || preset === "custom") && <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4" onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); const first = String(form.get("from")); const last = String(form.get("to")); if (!first || !last || first > last || last > today || (Date.parse(last) - Date.parse(first)) / 86400000 > 365) { setFilterError("Choose up to 366 days, ending today or earlier."); return; } setFilterError(""); const next = new URLSearchParams(params); next.set("from", first); next.set("to", last); setParams(next, { replace: true }); }}><label className="min-w-0 text-xs">From<Input name="from" type="date" required defaultValue={from} max={today} className="mt-1 w-40 max-w-full" /></label><label className="min-w-0 text-xs">To<Input name="to" type="date" required defaultValue={to} max={today} className="mt-1 w-40 max-w-full" /></label><Button type="submit" size="sm">Apply dates</Button>{filterError && <p role="alert" className="w-full text-xs text-destructive">{filterError}</p>}</form>}
      {query.isPending ? <div aria-label="Loading HR dashboard" aria-busy="true" className="space-y-5"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map(i => <div key={i} className="h-36 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />)}</div><div className="grid gap-4 lg:grid-cols-3">{[0, 1, 2].map(i => <div key={i} className="h-72 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />)}</div></div> : query.isError ? <div role="alert" className="rounded-lg border border-destructive/30 bg-card p-6"><h2 className="text-sm font-semibold">HR dashboard could not be loaded</h2><p className="mt-2 text-sm text-muted-foreground">{hrDashboardError(query.error)}</p><Button variant="outline" className="mt-4" onClick={retry}>Try again</Button></div> : data && <>
        <div className="flex flex-wrap justify-between gap-2 text-[11px] text-muted-foreground"><p>Today’s snapshot: {dateLabel(data.today)} · Asia/Karachi</p><p>Trends and activity: {dateLabel(data.from)} – {dateLabel(data.to)}</p></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Total employees" value={data.workforce.data?.activeEmployees} section={data.workforce} icon={<Users size={18} />} caption="Active employee records · today" href={can("Employee") ? "/hr/employees" : undefined} />
          <Metric label="Present today" value={data.attendance.data?.buckets.find(row => row.label === "Present")?.count} section={data.attendance} icon={<UserCheck size={18} />} caption="Marked present in the processed register" href={can("Daily Attendance Report") ? "/hr/reports/daily-attendance-report" : undefined} />
          <Metric label="On leave today" value={data.leaves.data?.onLeave} section={data.leaves} icon={<CalendarDays size={18} />} caption="Active employees with approved leave" href={can("Leave Approval") ? "/hr/leave-approval" : undefined} />
          <Metric label="Pending leave approvals" value={data.leaves.data?.pendingRequests} section={data.leaves} icon={<ClipboardCheck size={18} />} caption={data.leaves.data ? `Queue: ${dateLabel(data.leaves.data.pendingFrom)} – ${dateLabel(data.leaves.data.pendingTo)}` : "Current leave approval queue"} href={can("Leave Approval") && data.leaves.data ? `/hr/leave-approval?fromDate=${data.leaves.data.pendingFrom}&toDate=${data.leaves.data.pendingTo}` : undefined} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[1.35fr_1fr_1fr]"><WorkforceTrend section={data.workforce} from={data.from} to={data.to} retry={retry} /><AttendancePanel section={data.attendance} retry={retry} /><DepartmentPanel section={data.workforce} retry={retry} href={can("Department") ? "/hr/departments" : undefined} /></div>
        <div className="grid items-start gap-4 xl:grid-cols-12"><ActivityPanel data={data} retry={retry} /><EventsPanel data={data} retry={retry} /></div>
      </>}
    </div>
  </div>;
}
