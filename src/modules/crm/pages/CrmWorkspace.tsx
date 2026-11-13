import SalesOverview from "./SalesOverview";
import Projects from "./Projects";
import { errorMessage, selectClass } from "../utils/crmUi";
import { hvacProducts } from "../services/equipmentCatalog";
import { useId, useState, type ReactNode } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, FileText, Plus, Phone, StickyNote, PanelLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { CoolpointLoadingBoundary } from "@/shared/components/CoolpointLoader";
import { usePermissionsStore } from "@/modules/user-management/store/permissionsStore";
import { useToast } from "@/shared/components/ui/use-toast";
import { crmService, type CrmLead, type CrmDeal, type CrmQuotation } from "../services/crmService";
import { DealEditor, LeadEditor, QuotationEditor, Field } from "../components/CrmEditors";
import { InquiryLifecycle } from "../components/InquiryLifecycle";
import { useSidebarStore } from "@/shared/stores/useSidebarStore";

const sections = [
  { path: "/crm", title: "Overview", page: "Sales Analytics" },
  { path: "/crm/leads", title: "Inquiries", page: "HVAC Inquiries" },
  { path: "/crm/deals", title: "Deals", page: "Deals Pipeline" },
  { path: "/crm/projects", title: "Projects", page: "Projects" },
  { path: "/crm/quotations", title: "Quotations", page: "Project Quotations" },
  { path: "/crm/customers", title: "Clients", page: "Commercial Clients" },
  { path: "/crm/equipment", title: "Equipment", page: "HVAC Inquiries" },
];
const stages = ["New", "Contacted", "Qualified", "ProposalSent", "Won", "Lost"];
const money = (value: number, currency = "PKR") => `${currency} ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 }).format(value)}`;
const caption = (text: string) => text.replace(/([a-z])([A-Z])/g, "$1 $2");
function Status({ value }: { value: string }) {
  const style = ["Won", "Accepted", "Qualified"].includes(value) ? "bg-success/10 text-foreground" : ["Lost", "Rejected", "Disqualified"].includes(value) ? "bg-destructive/10 text-foreground" : ["Sent", "ProposalSent", "Contacted"].includes(value) ? "bg-accent/10 text-foreground" : "bg-muted text-muted-foreground";
  return <span className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold whitespace-nowrap ${style}`}>{caption(value)}</span>;
}
function Empty({ children }: { children: ReactNode }) { return <p className="py-12 text-sm text-muted-foreground text-center">{children}</p>; }
function Failure({ error, retry }: { error: unknown; retry: () => unknown }) { return <div role="alert" className="my-4 rounded-lg border border-destructive/30 bg-destructive/5 p-5"><p className="text-sm text-destructive">{errorMessage(error)}</p><Button variant="outline" size="sm" className="mt-3" onClick={retry}>Try again</Button></div>; }
function Panel({ title, action, children, collapsible = false, className = "", contentClassName = "", scrollContent = false }: {
  title: string; action?: ReactNode; children: ReactNode; collapsible?: boolean;
  className?: string; contentClassName?: string; scrollContent?: boolean;
}) {
  const [expanded, setExpanded] = useState(false); const contentId = useId();
  return <section className={`flex flex-col rounded-xl border bg-card p-5 min-w-0 min-h-0 ${className}`}>
    <div className="mb-5 flex shrink-0 items-center justify-between gap-3">
      <h2 className="text-sm font-semibold">{title}</h2>{action}
      {collapsible && <Button size="sm" variant="ghost" className="xl:hidden" aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded(!expanded)}>{expanded ? "Hide details" : "Show details"}</Button>}
    </div>
    <div id={contentId} role={scrollContent ? "region" : undefined} aria-label={scrollContent ? title : undefined} tabIndex={scrollContent ? 0 : undefined}
      className={`min-h-0 ${collapsible && !expanded ? "hidden xl:block" : ""} ${scrollContent ? "xl:flex-1 xl:overflow-y-auto xl:overscroll-contain xl:pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm" : ""} ${contentClassName}`}>
      {children}
    </div>
  </section>;
}
function Table({ headings, children }: { headings: string[]; children: ReactNode }) { return <div className="overflow-x-auto rounded-xl border bg-card"><table className="w-full text-left text-sm"><thead className="bg-muted/60 text-xs text-muted-foreground"><tr>{headings.map(h => <th key={h} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>)}</tr></thead><tbody className="divide-y">{children}</tbody></table></div>; }
function Pager({ page, total, size = 25, change }: { page: number; total: number; size?: number; change: (n: number) => void }) { return <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground"><span>{total} records · Page {page} of {Math.max(1, Math.ceil(total / size))}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => change(page - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page * size >= total} onClick={() => change(page + 1)}>Next</Button></div></div>; }

export default function CrmWorkspace() {
  const { pathname } = useLocation(); const { id } = useParams(); const permissions = usePermissionsStore();
  const active = sections.find(s => s.path !== "/crm" && pathname.startsWith(s.path)) || sections[0];
  const allowed = permissions.canView("CRM", active.page);
  if (pathname === "/crm" && permissions.isLoaded && !allowed) {
    const first = sections.find(s => permissions.canView("CRM", s.page));
    if (first) return <Navigate to={first.path} replace />;
  }
  return <div className="min-h-full w-full shrink-0 text-foreground">
    <header className="sticky top-0 z-30 border-b border-sidebar-border bg-sidebar">
      <h1 className="sr-only">{active.path === "/crm/projects" ? "Projects" : id ? "Inquiry workspace" : active.title === "Overview" ? "Sales Overview" : active.title}</h1>
      <nav aria-label="CRM navigation" className="flex min-h-14 flex-wrap items-center gap-1 p-1.5 text-sidebar-foreground"><Button variant="ghost" size="icon" aria-label="Toggle navigation" className="shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:hidden" onClick={() => useSidebarStore.getState().toggle()}><PanelLeft /></Button>{sections.filter(s => permissions.canView("CRM", s.page)).map(s => <Link key={s.path} to={s.path} onClick={event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.currentTarget.closest("main")?.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      }} aria-current={active.path === s.path ? "page" : undefined} className={`flex min-h-11 shrink-0 items-center rounded-md px-4 text-sm whitespace-nowrap transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sidebar-ring ${active.path === s.path ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>{s.title}</Link>)}</nav>
    </header>
    <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
    {!allowed ? <Empty>You do not have access to this CRM page. Ask your administrator for access.</Empty> : active.path === "/crm/projects" ? <Projects key={id || "list"} projectId={id === undefined ? undefined : Number(id)} /> : id ? <LeadWorkspace id={Number(id)} /> : active.path === "/crm/leads" ? <Inquiries /> : active.path === "/crm/deals" ? <Deals /> : active.path === "/crm/quotations" ? <Quotations /> : active.path === "/crm/customers" ? <Clients /> : active.path === "/crm/equipment" ? <Equipment /> : <SalesOverview />}
    </div>
  </div>;
}

function InquiryRow({ lead, owner }: { lead: CrmLead; owner: string }) {
  const navigate = useNavigate();
  const href = `/crm/leads/${lead.id}`;
  return <tr className="group cursor-pointer transition-colors hover:bg-primary/5 focus-within:bg-primary/5" onClick={event => {
    // The title remains a native link for keyboard use and opening another tab.
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (event.target instanceof Element && event.target.closest("a, button, input, textarea, select")) return;
    if (window.getSelection()?.toString()) return;
    navigate(href);
  }}>
    <td className="p-4"><Link className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm" to={href}>{lead.title}</Link><p className="mt-1 text-xs text-muted-foreground">{lead.customerName}</p></td>
    <td className="p-4 text-xs">{lead.contactPerson || "—"}<p className="text-muted-foreground mt-1">{lead.email || lead.phone}</p></td>
    <td className="p-4 text-xs">{owner}</td>
    <td className="p-4"><InquiryLifecycle lead={lead}><Status value={lead.lifecycleStatus} /></InquiryLifecycle></td>
    <td className="p-4 tabular-nums whitespace-nowrap text-xs">{money(lead.estimatedValue, lead.currencyCode)}</td>
    <td className="p-4"><ArrowRight size={16} aria-hidden="true" className="text-muted-foreground transition-colors group-hover:text-primary group-focus-within:text-primary" /></td>
  </tr>;
}

function Inquiries() {
  const [urlParams] = useSearchParams(); const currency = urlParams.get("currency") || "";
  const [search, setSearch] = useState(""); const [status, setStatus] = useState(""); const [owner, setOwner] = useState(""); const [page, setPage] = useState(1); const [editing, setEditing] = useState(false);
  const permissions = usePermissionsStore(); const navigate = useNavigate(); const cache = useQueryClient();
  const query = useQuery({ queryKey: ["crm", "leads", search, status, owner, page, currency], queryFn: () => crmService.listLeads({ search, status, owner, page, pageSize: 25, currency }), retry: false });
  const owners = useQuery({ queryKey: ["crm", "owners"], queryFn: crmService.owners, retry: false });
  return <>
    <div className="mb-5 flex flex-wrap justify-between gap-3"><p className="text-sm text-muted-foreground max-w-xl">Track commercial inquiries from the first conversation to a qualified opportunity.</p>{permissions.canAdd("CRM", "HVAC Inquiries") && <Button onClick={() => setEditing(true)}><Plus size={16} className="mr-2" />Create inquiry</Button>}</div>
    <div className="mb-4 grid sm:grid-cols-[minmax(180px,1fr)_180px_180px] gap-3"><Input aria-label="Search inquiries" placeholder="Search company, contact or inquiry" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /><select aria-label="Lifecycle filter" className={selectClass} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">All lifecycle states</option>{["New", "Contacted", "Qualified", "Disqualified"].map(s => <option key={s}>{s}</option>)}</select><select aria-label="Owner filter" className={selectClass} value={owner} onChange={e => { setOwner(e.target.value); setPage(1); }}><option value="">All owners</option>{owners.data?.map(o => <option value={o.userId} key={o.userId}>{o.name}</option>)}</select></div>
    {query.isError ? <Failure error={query.error} retry={query.refetch} /> : <CoolpointLoadingBoundary loading={query.isPending}><Table headings={["Inquiry / company", "Contact", "Owner", "Lifecycle", "Estimated value", "Details"]}>{query.data?.items.map(lead => <InquiryRow key={lead.id} lead={lead} owner={owners.data?.find(o => o.userId === lead.ownerUserId)?.name || lead.ownerUserId || "Unassigned"} />)}</Table>{!query.isPending && !query.data?.items.length && <Empty>{search || status || owner ? "No inquiries match these filters." : "Create your first inquiry to start tracking a sales opportunity."}</Empty>}<Pager page={page} total={query.data?.totalCount || 0} change={setPage} /></CoolpointLoadingBoundary>}
    {editing && <LeadEditor close={() => setEditing(false)} saved={async lead => { await cache.invalidateQueries({ queryKey: ["crm"] }); navigate(`/crm/leads/${lead.id}`); }} />}
  </>;
}

function Deals() {
  const [page, setPage] = useState(1); const [filters, setFilters] = useSearchParams();
  const stage = filters.get("stage") || ""; const currency = filters.get("currency") || undefined; const scope = filters.get("scope") || undefined;
  const query = useQuery({ queryKey: ["crm", "deals", page, stage, currency, scope], queryFn: () => crmService.deals(page, stage || undefined, currency, scope), retry: false });
  return <><div className="mb-5 flex flex-wrap justify-between gap-3"><p className="text-sm text-muted-foreground">Open an inquiry to manage its deal and quotation decisions. {currency && <span className="font-semibold">Currency: {currency}.</span>}</p><select aria-label="Deal stage" className={`${selectClass} max-w-52`} value={scope === "open" ? "open" : stage} onChange={e => { setPage(1); setFilters(previous => { const next = new URLSearchParams(previous); next.delete("stage"); next.delete("scope"); if (e.target.value === "open") next.set("scope", "open"); else if (e.target.value) next.set("stage", e.target.value); return next; }); }}><option value="">All deal stages</option><option value="open">Open deals</option>{stages.map(s => <option value={s} key={s}>{caption(s)}</option>)}</select></div>{query.isError ? <Failure error={query.error} retry={query.refetch} /> : <CoolpointLoadingBoundary loading={query.isPending}><Table headings={["Opportunity", "Stage", "Owner", "Value"]}>{query.data?.items.map(d => <tr key={d.id} className="hover:bg-muted/40"><td className="p-4"><Link to={`/crm/leads/${d.leadId}`} className="text-primary font-semibold hover:underline">{d.title}</Link></td><td className="p-4"><Status value={d.stage} /></td><td className="p-4 text-xs">{d.ownerUserId || "Unassigned"}</td><td className="p-4 text-xs tabular-nums whitespace-nowrap">{money(d.stage === "Won" ? d.wonValue || 0 : d.value, d.currencyCode)}</td></tr>)}</Table>{!query.isPending && !query.data?.items.length && <Empty>No deals in this view. Create a deal from an inquiry.</Empty>}<Pager page={page} total={query.data?.totalCount || 0} change={setPage} /></CoolpointLoadingBoundary>}</>;
}
function Quotations() {
  const query = useQuery({ queryKey: ["crm", "quotations"], queryFn: crmService.getQuotations, retry: false });
  return <>{query.isError ? <Failure error={query.error} retry={query.refetch} /> : <CoolpointLoadingBoundary loading={query.isPending}><Table headings={["Quotation", "Client", "Status", "Total"]}>{query.data?.map(q => <tr key={q.id} className="hover:bg-muted/40"><td className="p-4">{q.leadId ? <Link className="text-primary font-semibold hover:underline" to={`/crm/leads/${q.leadId}`}>{q.projectTitle}</Link> : <span>{q.projectTitle}</span>}<p className="text-xs text-muted-foreground mt-1">{q.quotationNo} · v{q.version}{!q.dealId && " · Legacy record"}</p></td><td className="p-4 text-xs">{q.customerName}</td><td className="p-4"><Status value={q.status} /></td><td className="p-4 text-xs tabular-nums whitespace-nowrap">{money(q.totalAmount, q.currencyCode)}</td></tr>)}</Table>{!query.isPending && !query.data?.length && <Empty>No quotations yet. Prepare a quotation from an open deal.</Empty>}<p className="text-xs text-muted-foreground mt-3">Showing the most recent 100 quotations. Legacy records remain unchanged.</p></CoolpointLoadingBoundary>}</>;
}
function Clients() {
  const query = useQuery({ queryKey: ["crm", "customers"], queryFn: crmService.getCustomers, retry: false });
  return <><p className="text-sm text-muted-foreground mb-5">Commercial clients are linked when you create or edit an inquiry.</p>{query.isError ? <Failure error={query.error} retry={query.refetch} /> : <CoolpointLoadingBoundary loading={query.isPending}><Table headings={["Company", "Contact", "Email / phone", "City"]}>{query.data?.map(c => <tr key={c.id}><td className="p-4 font-semibold">{c.companyName}</td><td className="p-4 text-xs">{c.contactPerson || "—"}</td><td className="p-4 text-xs">{c.email || c.phone || "—"}</td><td className="p-4 text-xs">{c.city || "—"}</td></tr>)}</Table>{!query.isPending && !query.data?.length && <Empty>Create an inquiry with a company name to add your first client.</Empty>}<p className="text-xs text-muted-foreground mt-3">Showing up to 100 clients in company order.</p></CoolpointLoadingBoundary>}</>;
}

function LeadWorkspace({ id }: { id: number }) {
  const cache = useQueryClient(); const permissions = usePermissionsStore(); const { toast } = useToast();
  const [edit, setEdit] = useState(false); const [newDeal, setNewDeal] = useState(false);
  const [quoteEditor, setQuoteEditor] = useState<{ deal: CrmDeal; quotation?: CrmQuotation } | null>(null);
  const [confirm, setConfirm] = useState<{ title: string; description: string; task: (note: string) => Promise<unknown> } | null>(null);
  const [note, setNote] = useState(""); const [activityType, setActivityType] = useState("Note"); const [body, setBody] = useState("");
  const detail = useQuery({ queryKey: ["crm", "detail", id], queryFn: () => crmService.detail(id), retry: false });
  const history = useInfiniteQuery({ queryKey: ["crm", "activities", id], initialPageParam: undefined as number | undefined,
    queryFn: ({ pageParam }) => crmService.activities(id, pageParam), getNextPageParam: last => last.nextCursor ?? undefined, retry: false });
  const refresh = async () => { await cache.invalidateQueries({ queryKey: ["crm"] }); };
  const mutation = useMutation({ mutationFn: (task: () => Promise<unknown>) => task(), onSuccess: async () => { await refresh(); toast({ title: "CRM updated" }); }, onError: e => toast({ title: "Update failed", description: errorMessage(e), variant: "destructive" }) });
  const ask = (title: string, description: string, task: (note: string) => Promise<unknown>) => { if (mutation.isPending) return; mutation.reset(); setNote(""); setConfirm({ title, description, task }); };
  if (detail.isError) return <Failure error={detail.error} retry={detail.refetch} />;
  if (!detail.data) return <CoolpointLoadingBoundary loading><div className="min-h-64" /></CoolpointLoadingBoundary>;
  const { lead, deals, quotations } = detail.data;
  const canEdit = permissions.canEdit("CRM", "HVAC Inquiries");
  const canDeal = permissions.canEdit("CRM", "Deals Pipeline");
  const canQuote = permissions.canEdit("CRM", "Project Quotations") && canDeal;
  const closed = (d: CrmDeal) => ["Won", "Lost"].includes(d.stage);
  return <>
    <Link to="/crm/leads" className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-primary"><ArrowLeft size={14} />All inquiries</Link>
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><h2 className="text-xl font-display font-semibold break-words">{lead.title}</h2><p className="text-sm text-muted-foreground mt-2">{lead.customerName}</p>{detail.data?.projectId && permissions.canView("CRM", "Projects") && <Link to={`/crm/projects/${detail.data.projectId}`} className="mt-3 inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-primary hover:underline">Open linked project<ArrowRight className="size-4" /></Link>}</div><div className="flex items-center gap-3"><InquiryLifecycle lead={lead}><Status value={lead.lifecycleStatus} /></InquiryLifecycle>{canEdit && <Button variant="outline" size="sm" onClick={() => setEdit(true)}>Edit inquiry</Button>}</div></div>
    <div className="grid xl:grid-cols-[240px_minmax(0,1fr)_minmax(300px,400px)] gap-5 items-start xl:items-stretch xl:h-[clamp(34rem,calc(100dvh-22rem),56rem)]">
      <Panel title="Contact & inquiry" collapsible scrollContent className="xl:h-full xl:overflow-hidden"><dl className="space-y-5 text-xs">{[["Contact", lead.contactPerson], ["Company", lead.customerName], ["Email", lead.email], ["Phone", lead.phone], ["Owner", lead.ownerUserId || "Unassigned"], ["Category", lead.category], ["Source", lead.source], ["Estimate", money(lead.estimatedValue, lead.currencyCode)]].map(([label, value]) => <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 font-medium break-words">{value || "—"}</dd></div>)}</dl>{lead.notes && <p className="mt-5 border-t pt-4 text-xs whitespace-pre-wrap break-words">{lead.notes}</p>}
        
      </Panel>
      <Panel title="Activity history" className="xl:h-full xl:overflow-hidden" contentClassName="xl:flex xl:flex-1 xl:flex-col">
        {canEdit && <form className="mb-5 shrink-0 space-y-3 border-b pb-5" onSubmit={e => { e.preventDefault(); if (!body.trim() || mutation.isPending) return; mutation.mutate(() => crmService.activity(id, activityType, body), { onSuccess: () => setBody("") }); }}><div className="flex gap-2">{["Note", "Call"].map(t => <Button key={t} type="button" size="sm" variant={activityType === t ? "default" : "outline"} onClick={() => setActivityType(t)}>{t === "Call" ? <Phone size={14} className="mr-2" /> : <StickyNote size={14} className="mr-2" />}{t === "Call" ? "Log call" : "Note"}</Button>)}</div><Field label={activityType === "Call" ? "Manual call notes" : "Internal note"}><Textarea required maxLength={4000} value={body} onChange={e => setBody(e.target.value)} placeholder={activityType === "Call" ? "Who did you speak to, and what was agreed?" : "Add context for the next conversation."} /></Field><Button size="sm" disabled={mutation.isPending || !body.trim()}>Save {activityType === "Call" ? "call log" : "note"}</Button></form>}
        <div id="crm-activity-timeline" role="region" aria-label="Inquiry activity timeline" tabIndex={0} className="xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:overscroll-contain xl:pr-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {history.isError ? <Failure error={history.error} retry={history.refetch} /> : <><ol className="space-y-4">{history.data?.pages.flatMap(p => p.items).map(a => <li key={a.id} className="relative border-b pb-4 last:border-0"><div className="flex gap-3 items-start"><span className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" /><div className="min-w-0"><h3 className="text-sm font-semibold">{caption(a.summary)}</h3><p className="text-[11px] text-muted-foreground mt-1 break-words">{new Date(a.occurredAt.endsWith("Z") ? a.occurredAt : a.occurredAt + "Z").toLocaleString()} · {a.actorUserId} · {a.source}</p>{a.body && <p className="mt-3 whitespace-pre-wrap break-words text-sm">{a.body}</p>}</div></div></li>)}</ol>{history.isPending && <p className="text-sm text-muted-foreground">Loading history…</p>}{!history.isPending && !history.data?.pages[0].items.length && <Empty>No recorded activity yet.</Empty>}{history.hasNextPage && <Button variant="outline" size="sm" disabled={history.isFetchingNextPage} onClick={() => history.fetchNextPage()}>Load earlier activity</Button>}</>}
        </div>
      </Panel>
      <div className="space-y-5 xl:space-y-0 xl:flex xl:flex-col xl:gap-5 xl:h-full min-h-0 min-w-0">
        <Panel title="Deals" scrollContent className="xl:flex-1 xl:overflow-hidden" action={permissions.canAdd("CRM", "Deals Pipeline") && lead.lifecycleStatus !== "Disqualified" && <Button size="sm" variant="outline" onClick={() => setNewDeal(true)}><Plus size={14} className="mr-1" />Deal</Button>}>
          {!deals.length && <p className="text-xs text-muted-foreground">Create a deal to prepare a quotation for this inquiry.</p>}{deals.map(d => <div key={d.id} className="border-b last:border-0 pb-5 mb-5 last:mb-0 last:pb-0"><div className="flex justify-between items-start gap-3"><h3 className="text-sm font-semibold break-words">{d.title}</h3><Status value={d.stage} /></div><p className="mt-2 text-sm tabular-nums">{money(d.stage === "Won" ? d.wonValue || 0 : d.value, d.currencyCode)}</p>{d.stage === "Won" && <p className="text-xs text-muted-foreground mt-2">Ready for onboarding</p>}{d.lossReason && <p className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">{d.lossReason}</p>}
            {!closed(d) && <div className="mt-4 flex flex-wrap gap-2">{canDeal && ["New", "Contacted"].includes(d.stage) && <Button size="sm" variant="outline" disabled={mutation.isPending} onClick={() => mutation.mutate(() => crmService.dealState(d, d.stage === "New" ? "Contacted" : "Qualified"))}>{d.stage === "New" ? "Mark contacted" : "Qualify deal"}</Button>}{permissions.canAdd("CRM", "Project Quotations") && canDeal && d.stage !== "New" && <Button size="sm" onClick={() => setQuoteEditor({ deal: d })}>Prepare quotation</Button>}{canDeal && <Button size="sm" variant="ghost" onClick={() => ask("Close deal as lost?", "This closes the opportunity. Existing quotation history will be preserved.", n => crmService.dealState(d, "Lost", n))}>Mark lost</Button>}</div>}
          </div>)}
        </Panel>
        <Panel title="Project quotations" scrollContent className="xl:flex-1 xl:overflow-hidden">{!quotations.length && <p className="text-xs text-muted-foreground">Quotations and revisions will appear here.</p>}{quotations.map(q => {
          const deal = deals.find(d => d.id === q.dealId); return <article key={q.id} className="border-b last:border-0 mb-5 pb-5 last:mb-0 last:pb-0"><div className="flex gap-3 justify-between"><h3 className="font-semibold text-sm flex items-start gap-2"><FileText size={15} className="shrink-0 mt-0.5" />{q.projectTitle}</h3><Status value={q.status} /></div><p className="text-[11px] text-muted-foreground mt-2 break-all">{q.quotationNo} · Revision {q.version}</p><p className="font-semibold mt-3 text-sm tabular-nums">{money(q.totalAmount, q.currencyCode)}</p>
            <details className="mt-3 text-xs"><summary className="cursor-pointer text-primary font-semibold">View items & terms</summary><div className="mt-3 space-y-3">{q.items.map((i, index) => <div key={index}><p className="font-medium">{i.itemDescription}</p><p className="text-muted-foreground">{[i.equipmentModel, i.capacity].filter(Boolean).join(" · ")}</p><p className="mt-1 tabular-nums">{i.quantity} × {money(i.unitPrice, q.currencyCode)}</p></div>)}<p>Subtotal: {money(q.subTotal, q.currencyCode)}</p><p>Tax ({q.taxPercent}%): {money(q.taxAmount, q.currencyCode)}</p><p>{q.validityDays == null ? "Validity not recorded" : `Valid for ${q.validityDays} days`}</p>{q.terms && <p className="whitespace-pre-wrap break-words">{q.terms}</p>}{q.decisionNote && <p className="whitespace-pre-wrap">Decision note: {q.decisionNote}</p>}</div></details>
            {!deal && <p className="text-xs text-muted-foreground mt-3">Legacy quotation · no linked deal</p>}
            {deal && !closed(deal) && canQuote && <div className="flex flex-wrap gap-2 mt-4">{q.status === "Draft" && <><Button size="sm" variant="outline" onClick={() => setQuoteEditor({ deal, quotation: q })}>Edit draft</Button><Button size="sm" onClick={() => ask("Mark quotation sent?", "Confirm the offer was shared outside CRM. Sent terms and items will be locked.", n => crmService.quoteState(q, "send", n))}>Mark sent</Button></>}{q.status === "Sent" && <><Button size="sm" onClick={() => ask("Accept quotation and win deal?", `Record the client's manual acceptance of ${q.quotationNo}. This marks the linked deal Won for ${money(q.totalAmount, q.currencyCode)}.`, n => crmService.quoteState(q, "accept", n))}>Mark accepted</Button><Button size="sm" variant="outline" onClick={() => ask("Request revision?", "Keep this sent version and create a new editable draft with the same items and terms.", n => crmService.quoteState(q, "request-revision", n))}>Revise</Button><Button size="sm" variant="ghost" onClick={() => ask("Reject quotation?", "The quotation will be rejected. The deal remains open.", n => crmService.quoteState(q, "reject", n))}>Reject</Button></>}</div>}
          </article>;
        })}</Panel>
      </div>
    </div>
    {edit && <LeadEditor lead={lead} close={() => setEdit(false)} saved={refresh} />}
    {newDeal && <DealEditor lead={lead} close={() => setNewDeal(false)} saved={refresh} />}
    {quoteEditor && <QuotationEditor {...quoteEditor} close={() => setQuoteEditor(null)} saved={refresh} />}
    <Dialog open={!!confirm} onOpenChange={open => { if (!open && !mutation.isPending) setConfirm(null); }}><DialogContent><DialogHeader><DialogTitle>{confirm?.title}</DialogTitle><DialogDescription>{confirm?.description}</DialogDescription></DialogHeader><Field label="Decision note (optional)"><Textarea value={note} maxLength={4000} onChange={e => setNote(e.target.value)} /></Field>{mutation.isError && <p role="alert" className="text-sm text-destructive">{errorMessage(mutation.error)}</p>}<div className="flex justify-end gap-2"><Button variant="outline" disabled={mutation.isPending} onClick={() => setConfirm(null)}>Cancel</Button><Button disabled={mutation.isPending} onClick={() => { if (confirm) mutation.mutate(() => confirm.task(note), { onSuccess: () => setConfirm(null) }); }}>{mutation.isPending ? "Saving…" : "Confirm"}</Button></div></DialogContent></Dialog>
  </>;
}

function Equipment() { return <div className="space-y-5">{hvacProducts.map(product => <Panel key={product.id} title={product.name}><p className="text-sm text-muted-foreground">{product.category}</p><dl className="mt-4 grid gap-4 sm:grid-cols-2 text-xs"><div><dt className="text-muted-foreground">Capacity range</dt><dd className="mt-1 font-medium">{product.capacityRange}</dd></div><div><dt className="text-muted-foreground">Refrigerant / system</dt><dd className="mt-1 font-medium">{product.refrigerant}</dd></div><div><dt className="text-muted-foreground">Applications</dt><dd className="mt-1">{product.applications}</dd></div><div><dt className="text-muted-foreground">Engineering specification</dt><dd className="mt-1">{product.cop}</dd></div></dl><ul className="mt-4 list-disc pl-4 space-y-2 text-xs">{product.features.map(feature => <li key={feature}>{feature}</li>)}</ul></Panel>)}</div>; }
