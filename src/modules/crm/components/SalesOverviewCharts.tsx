import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Info } from "lucide-react";
import type { SalesOverviewData } from "../services/salesOverviewService";
import { chartSeries, formatAmount, stageColors, stageLabels } from "../utils/salesOverview";

export function DashboardCard({ title, help, action, children, className = "" }: { title: string; help?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`min-w-0 rounded-[16px] border border-border/70 bg-card p-5 shadow-[0_2px_4px_rgb(15_23_42_/_3%)] ${className}`}>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><h2 className="text-sm font-semibold tracking-tight">{title}</h2>{help && <span tabIndex={0} title={help} aria-label={help} className="rounded-full text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Info size={14} aria-hidden="true" /></span>}</div>{action}</div>
    {children}
  </section>;
}
function ChartEmpty({ children }: { children: ReactNode }) { return <div className="flex min-h-48 items-center justify-center px-4 text-center text-sm text-muted-foreground">{children}</div>; }

export function SalesTrend({ data }: { data: SalesOverviewData }) {
  const [mode, setMode] = useState<"amount" | "deals">("amount");
  const series = useMemo(() => chartSeries(data.trend), [data.trend]);
  const closedCount = data.trend.reduce((sum, item) => sum + item.deals, 0);
  const knownCount = closedCount - data.trend.reduce((sum, item) => sum + item.missingValues, 0);
  const hasData = mode === "deals" ? closedCount > 0 : knownCount > 0;
  return <DashboardCard className="h-full" title="Sales trend" help="Won deals grouped by their recorded close date in Asia/Karachi. Value uses the recorded won amount, counted once per deal."
    action={<div role="group" aria-label="Sales trend measure" className="inline-flex rounded-full border bg-muted/50 p-0.5">{(["amount", "deals"] as const).map(value => <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)} className={`min-h-9 rounded-full px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${mode === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{value === "amount" ? "Value" : "Deals"}</button>)}</div>}>
    <p className="-mt-2 mb-3 text-[11px] text-muted-foreground">Won deals · {data.trend.length > 90 ? "monthly" : data.trend.length > 14 ? "weekly" : "daily"} close dates · {data.currencyCode}</p>
    {hasData ? <div className="h-44 w-full min-w-0" role="img" aria-label={`Won deal ${mode === "amount" ? "value" : "count"} by close date; exact values in the data table below.`}>
      <ResponsiveContainer width="100%" height="100%"><BarChart data={series} margin={{ left: -12, right: 8, top: 10, bottom: 0 }} accessibilityLayer>
        <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
        <XAxis dataKey="label" axisLine={false} tickLine={false} minTickGap={20} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
        <YAxis axisLine={false} tickLine={false} allowDecimals={mode === "amount"} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={value => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value))} />
        <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={({ active, payload }) => active && payload?.length ? <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md"><p className="font-medium">{payload[0].payload.label}</p><p className="mt-1">{mode === "amount" ? formatAmount(Number(payload[0].value), data.currencyCode) : `${payload[0].value} won deals`}</p></div> : null} />
        <Bar dataKey={mode} radius={[4, 4, 0, 0]} maxBarSize={46} isAnimationActive={false}>{series.map((bucket, i) => <Cell key={bucket.date} fill={i === series.length - 1 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.65)"} />)}</Bar>
      </BarChart></ResponsiveContainer>
    </div> : <ChartEmpty>{mode === "amount" && closedCount ? "No recorded won amounts for these close dates." : "No recorded wins in this date range."}</ChartEmpty>}
    {(data.missingWonDates > 0 || data.missingWonValues > 0) && <p className="mt-2 text-[11px] text-muted-foreground">{data.missingWonDates > 0 && `${data.missingWonDates} won deals have no close date. `}{data.missingWonValues > 0 && `${data.missingWonValues} have no recorded won amount.`}</p>}
    {hasData && <details className="mt-3 text-[11px] text-muted-foreground"><summary className="cursor-pointer hover:text-foreground">View chart data</summary><table className="mt-2 w-full text-left"><thead><tr><th scope="col" className="py-1">Period starting</th><th scope="col">Value ({data.currencyCode})</th><th scope="col">Won deals</th></tr></thead><tbody>{series.map(item => <tr key={item.date}><td className="py-1">{item.date}</td><td>{formatAmount(item.amount, data.currencyCode)}</td><td>{item.deals}</td></tr>)}</tbody></table></details>}
  </DashboardCard>;
}

export function InquiryFunnel({ data }: { data: SalesOverviewData }) {
  const { inquiries, dealsCreated, quotationsSent, dealsWon } = data.funnel;
  const stages = [{ label: "Inquiries created", count: inquiries }, { label: "Deals created", count: dealsCreated }, { label: "Quotation sent", count: quotationsSent }, { label: "Deals won", count: dealsWon }];
  return <DashboardCard className="h-full" title="Inquiry to deal" help="A cohort of inquiries created in the selected period. Each step counts distinct inquiries with linked deals, recorded sends and wins by the end of the period. Legacy wins without send/close timestamps are excluded.">
    <p className="-mt-2 mb-5 text-[11px] text-muted-foreground">Created-in-period cohort · {data.currencyCode}</p>
    {inquiries ? <div>
      <svg viewBox="0 0 320 224" className="mx-auto h-56 w-full max-w-xs" role="img" aria-labelledby="inquiry-funnel-title inquiry-funnel-description">
        <title id="inquiry-funnel-title">Inquiry to deal funnel</title>
        <desc id="inquiry-funnel-description">{stages.map(stage => stage.label + ": " + stage.count).join(". ")}. Stages run from top to bottom; segment widths indicate the sequence, not the counts.</desc>
        {stages.map((stage, index) => {
          const top = 4 + index * 55;
          const inset = 8 + index * 28;
          return <g key={stage.label}>
            <path d={"M " + inset + " " + top + " H " + (320 - inset) + " L " + (320 - inset - 26) + " " + (top + 51) + " H " + (inset + 26) + " Z"} fill={["hsl(var(--primary))", "color-mix(in srgb, hsl(var(--primary)) 78%, white)", "color-mix(in srgb, hsl(var(--primary)) 28%, white)", "color-mix(in srgb, hsl(var(--primary)) 12%, white)"][index]} />
            <text x="160" y={top + 21} textAnchor="middle" fill={index < 2 ? "white" : "#162e58"} fontSize="13" fontWeight="500">{stage.label}</text>
            <text x="160" y={top + 41} textAnchor="middle" fill={index < 2 ? "white" : "#162e58"} fontSize="18" fontWeight="700" className="tabular-nums">{stage.count}</text>
          </g>;
        })}
      </svg>
      <div className="mt-3 flex items-baseline justify-center gap-2 border-t pt-3"><p className="text-xl font-semibold tabular-nums text-primary">{new Intl.NumberFormat("en", { maximumFractionDigits: 1 }).format(dealsWon / inquiries * 100)}%</p><p className="mt-1 text-[11px] text-muted-foreground">Inquiry to win conversion</p></div>
    </div> : <ChartEmpty>No inquiries were created in this period. Conversion is unavailable.</ChartEmpty>}
  </DashboardCard>;
}

export function DealsStatus({ data, canOpen }: { data: SalesOverviewData; canOpen: boolean }) {
  const total = data.dealDistribution.reduce((sum, item) => sum + item.count, 0);
  const chart = data.dealDistribution.filter(item => item.count > 0);
  return <DashboardCard className="h-full" title="Deals by status" help="Current deal counts for the selected currency, across all dates. These counts do not use the trend date range.">
    <p className="-mt-2 mb-3 text-[11px] text-muted-foreground">Current snapshot · {data.currencyCode}</p>
    {total ? <div className="flex items-center gap-3"><div className="relative h-32 w-32 shrink-0" role="img" aria-label={`${total} deals; status counts and percentages in the legend below.`}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chart} dataKey="count" nameKey="status" innerRadius={43} outerRadius={61} strokeWidth={2} stroke="hsl(var(--card))" isAnimationActive={false}>{chart.map(item => <Cell key={item.status} fill={stageColors[item.status] || "#64748b"} />)}</Pie></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><strong className="text-2xl tabular-nums">{total}</strong><span className="text-[10px] text-muted-foreground">Total deals</span></div></div>
      <ul className="min-w-0 flex-1 space-y-1">{data.dealDistribution.map(item => {
        const label = <><span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: stageColors[item.status] || "#64748b" }} /><span className="flex-1">{stageLabels[item.status] || item.status}</span><span className="font-semibold tabular-nums">{item.count}</span><span className="w-9 text-right tabular-nums text-muted-foreground">{Math.round(item.count / total * 100)}%</span></>;
        return <li key={item.status}>{canOpen ? <Link className="flex min-h-7 items-center gap-1.5 rounded-md px-1 text-[11px] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" to={`/crm/deals?stage=${encodeURIComponent(item.status)}&currency=${data.currencyCode}`}>{label}</Link> : <div className="flex items-center gap-2 py-1.5 text-[11px]">{label}</div>}</li>;
      })}</ul></div> : <ChartEmpty>No deals in {data.currencyCode} yet.</ChartEmpty>}
  </DashboardCard>;
}
