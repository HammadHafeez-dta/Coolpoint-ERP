import { useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, CalendarDays, Check, FileText, History, RefreshCw, Trophy, Users, Wallet } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { usePermissionsStore } from "@/modules/user-management/store/permissionsStore";
import { salesOverviewService, type SalesOverviewData } from "../services/salesOverviewService";
import { DashboardCard, DealsStatus, InquiryFunnel, SalesTrend } from "../components/SalesOverviewCharts";
import { daysBefore, formatAmount, localDate, pakistanDay, stageLabels } from "../utils/salesOverview";
import { errorMessage, selectClass } from "../utils/crmUi";
import { cn } from "@/shared/utils/utils";

function MetricCard({ label, value, help, icon, href, footnote }: { label: string; value: string | number; help: string; icon: ReactNode; href?: string; footnote: string }) {
  const content = <><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 break-words text-xl font-semibold tracking-tight tabular-nums 2xl:text-2xl">{value}</p></div><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</span></div><div className="mt-5 flex items-center justify-between gap-2"><p className="text-[11px] text-muted-foreground">{footnote}</p>{href && <ArrowRight size={14} aria-hidden="true" className="text-primary" />}</div></>;
  const style = "block min-w-0 rounded-[16px] border border-border/70 bg-card p-5 shadow-[0_2px_4px_rgb(15_23_42_/_3%)]";
  return href ? <Link to={href} title={help} className={`${style} transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}>{content}</Link> : <div title={help} className={style}>{content}</div>;
}

function DashboardSkeleton() {
  return <div aria-label="Loading sales overview" role="status" className="space-y-5"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map(i => <div key={i} className="h-36 rounded-[16px] border bg-card p-5"><div className="h-3 w-28 rounded bg-muted" /><div className="mt-5 h-7 w-40 rounded bg-muted" /><div className="mt-5 h-3 w-24 rounded bg-muted" /></div>)}</div><div className="grid gap-4 lg:grid-cols-3"><div className="h-80 rounded-[16px] border bg-card" /><div className="h-80 rounded-[16px] border bg-card" /><div className="h-80 rounded-[16px] border bg-card" /></div><span className="sr-only">Loading current totals, charts and recent records.</span></div>;
}

export default function SalesOverview() {
  const [params, setParams] = useSearchParams();
  const permissions = usePermissionsStore();
  const [customError, setCustomError] = useState("");
  const today = pakistanDay(); const preset = params.get("period") || "30";
  const from = preset === "custom" ? params.get("from") || daysBefore(today, 29) : daysBefore(today, (Number(preset) || 30) - 1);
  const to = preset === "custom" ? params.get("to") || today : today;
  const requestedCurrency = params.get("currency") || undefined;
  const query = useQuery({ queryKey: ["crm", "sales-overview", from, to, requestedCurrency],
    queryFn: ({ signal }) => salesOverviewService.get({ from, to, currency: requestedCurrency }, signal), retry: false });
  const data = query.data;
  const currency = requestedCurrency || data?.currencyCode || "PKR";
  const update = (changes: Record<string, string>) => setParams(current => { const next = new URLSearchParams(current); Object.entries(changes).forEach(([key, value]) => next.set(key, value)); return next; });
  return <div className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium">Your commercial position</p><p className="mt-1 text-xs text-muted-foreground">Current totals across all dates. Trend and recent records use the selected period.</p></div><div className="flex flex-wrap items-center gap-2">
      <CalendarDays size={16} className="hidden text-muted-foreground sm:block" aria-hidden="true" />
      <select aria-label="Dashboard date range" className={cn(selectClass, "w-40 bg-card text-xs")} value={preset} onChange={e => { setCustomError(""); update({ period: e.target.value }); }}><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">Last 12 months</option><option value="custom">Custom dates</option></select>
      <select aria-label="Dashboard currency" className={cn(selectClass, "w-24 bg-card text-xs")} disabled={!data} value={currency} onChange={e => update({ currency: e.target.value })}>{(data?.availableCurrencies || [currency]).map(code => <option key={code} value={code}>{code === "UNK" ? "Unspecified" : code}</option>)}</select>
      <Button variant="outline" size="icon" aria-label="Refresh sales overview" disabled={query.isFetching} onClick={() => query.refetch()}><RefreshCw size={15} /></Button>
    </div></div>
    {preset === "custom" && <form className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4" onSubmit={event => {
      event.preventDefault(); const form = new FormData(event.currentTarget); const start = String(form.get("from")); const end = String(form.get("to"));
      const span = (Date.parse(end) - Date.parse(start)) / 86400000;
      if (!Number.isFinite(span) || span < 0 || span > 365) { setCustomError("Choose a valid range of up to 366 days."); return; }
      setCustomError(""); update({ from: start, to: end });
    }}><label className="grid gap-1.5 text-xs font-medium">From<Input key={`from-${from}`} name="from" type="date" required defaultValue={from} className="w-44 bg-card" /></label><label className="grid gap-1.5 text-xs font-medium">To<Input key={`to-${to}`} name="to" type="date" required defaultValue={to} className="w-44 bg-card" /></label><Button type="submit" variant="outline">Apply dates</Button>{customError && <p role="alert" className="text-sm text-destructive">{customError}</p>}</form>}
    {query.isError && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4"><p className="text-sm text-destructive">{errorMessage(query.error)}</p><Button className="mt-3" variant="outline" size="sm" onClick={() => query.refetch()}>Retry dashboard</Button></div>}
    {!data ? query.isPending ? <DashboardSkeleton /> : null : <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Open pipeline" value={formatAmount(data.openPipeline, data.currencyCode)} help="Current estimated value of deals that are neither Won nor Lost, in the selected currency." icon={<Wallet size={23} />} href={permissions.canView("CRM", "Deals Pipeline") ? `/crm/deals?scope=open&currency=${data.currencyCode}` : undefined} footnote="Current open deal value" />
        <MetricCard label="Open opportunities" value={data.openOpportunities} help="Current count of unresolved deals in the selected currency." icon={<BriefcaseBusiness size={23} />} href={permissions.canView("CRM", "Deals Pipeline") ? `/crm/deals?scope=open&currency=${data.currencyCode}` : undefined} footnote={`Open deals in ${data.currencyCode}`} />
        <MetricCard label="Accepted value" value={formatAmount(data.acceptedValue, data.currencyCode)} help="Recorded won-deal value. Each deal is counted once; quotation revisions are not added separately." icon={<BadgeCheck size={23} />} href={permissions.canView("CRM", "Deals Pipeline") ? `/crm/deals?stage=Won&currency=${data.currencyCode}` : undefined} footnote={data.missingWonValues ? `${data.missingWonValues} won deals have no recorded value` : "Recorded value of won deals"} />
        <MetricCard label="Won deals" value={data.wonDeals} help="All currently Won deals in the selected currency, including legacy wins without recorded amounts." icon={<Trophy size={23} />} href={permissions.canView("CRM", "Deals Pipeline") ? `/crm/deals?stage=Won&currency=${data.currencyCode}` : undefined} footnote="Confirmed won outcomes" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground"><span>Activity period: {localDate(data.from)} – {localDate(data.to)} · Asia/Karachi</span><span>Current position and status counts are all-time snapshots.</span></div>
      <div className="grid items-stretch gap-4 lg:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr]"><SalesTrend data={data} /><InquiryFunnel data={data} /><div className="lg:col-span-2 xl:col-span-1"><DealsStatus data={data} canOpen={permissions.canView("CRM", "Deals Pipeline")} /></div></div>
      <div className="grid items-start gap-5 xl:grid-cols-[1.6fr_1fr]"><RecentInquiries data={data} /><RecentActivity data={data} /></div>
      <p className="text-[10px] text-muted-foreground">Updated {localDate(data.asOf, true)} · Values shown in {data.currencyCode}. No currency conversion applied.</p>
    </>}
  </div>;
}

function RecentInquiries({ data }: { data: SalesOverviewData }) {
  const navigate = useNavigate();
  return <DashboardCard title="Recent inquiries" action={data.recentInquiries !== null && <Link to={`/crm/leads?currency=${data.currencyCode}`} className="inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-primary">View all <ArrowRight size={13} /></Link>}>
    {data.recentInquiries === null ? <p className="py-8 text-sm text-muted-foreground">Inquiry access is required to view these records.</p> : !data.recentInquiries.length ? <div className="py-10 text-center"><Users size={25} aria-hidden="true" className="mx-auto text-muted-foreground" /><p className="mt-3 text-sm font-medium">No inquiries in this period</p><p className="mt-1 text-xs text-muted-foreground">Choose a wider date range or open inquiries to get started.</p></div> : <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-y bg-muted/40 text-muted-foreground">{["Client / inquiry", "Received", "Lifecycle"].map(label => <th key={label} scope="col" className="px-2 py-3 font-medium">{label}</th>)}</tr></thead><tbody className="divide-y">{data.recentInquiries.map(inquiry => <tr key={inquiry.id} className="cursor-pointer hover:bg-muted/40" onClick={event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || (event.target instanceof Element && event.target.closest("a")) || window.getSelection()?.toString()) return;
      navigate(`/crm/leads/${inquiry.id}`);
    }}><td className="max-w-64 px-2 py-3"><Link className="font-semibold text-foreground hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" to={`/crm/leads/${inquiry.id}`}>{inquiry.company || inquiry.title}</Link><p className="mt-1 break-words text-[11px] text-muted-foreground">{inquiry.company ? inquiry.title : "Company not recorded"}</p></td><td className="whitespace-nowrap px-2 py-3 text-[11px] text-muted-foreground">{localDate(inquiry.createdAt)}</td><td className="px-2 py-3"><span className={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-medium ${inquiry.lifecycleStatus === "Qualified" ? "bg-primary/10 text-primary" : inquiry.lifecycleStatus === "Disqualified" ? "bg-destructive/10 text-foreground" : "bg-primary/10 text-primary"}`}>{stageLabels[inquiry.lifecycleStatus] || inquiry.lifecycleStatus}</span></td></tr>)}</tbody></table></div>}
  </DashboardCard>;
}

function RecentActivity({ data }: { data: SalesOverviewData }) {
  return <DashboardCard title="Recent activity" help="Recorded CRM events in the selected date range, for inquiries in the selected currency. Open an event to view its inquiry history.">
    {data.recentActivity === null ? <p className="py-8 text-sm text-muted-foreground">Inquiry access is required to view activity.</p> : !data.recentActivity.length ? <div className="py-10 text-center"><History size={25} aria-hidden="true" className="mx-auto text-muted-foreground" /><p className="mt-3 text-sm font-medium">No recorded activity</p><p className="mt-1 text-xs text-muted-foreground">Saved notes and lifecycle actions will appear here.</p></div> : <ol className="space-y-1">{data.recentActivity.map(event => {
      const positive = event.type.includes("Accepted") || event.summary.includes("Won");
      const Icon = positive ? Check : event.type.includes("Quotation") ? FileText : event.type.includes("Lead") ? Users : History;
      return <li key={event.id}><Link to={`/crm/leads/${event.leadId}`} className="group flex min-w-0 gap-3 rounded-lg py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${positive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}><Icon size={15} aria-hidden="true" /></span><div className="min-w-0"><h3 className="text-xs font-semibold group-hover:text-primary">{event.summary.replace(/([a-z])([A-Z])/g, "$1 $2")}</h3><p className="mt-1 break-words text-[11px] text-muted-foreground">{event.company || event.inquiryTitle} · {event.actorUserId}</p><time dateTime={event.occurredAt} title={localDate(event.occurredAt, true)} className="mt-1 block text-[10px] text-muted-foreground">{localDate(event.occurredAt, true)}</time></div></Link></li>;
    })}</ol>}
  </DashboardCard>;
}
