import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronLeft, ChevronRight, PanelLeft, RefreshCw, Search, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { authService } from "@/modules/auth/services/authService";
import { useSidebarStore } from "@/shared/stores/useSidebarStore";
import { usePermissionsStore } from "../store/permissionsStore";
import { userService, type UserListItem } from "../services/userService";
import { userRightsService } from "../services/userRightsService";
import { ASSIGNABLE_MODULES, normalizeWorkspaceModule } from "../utils/moduleAccess";

const level = (user: UserListItem) => (user.userLevel || "").trim().toUpperCase();
const roleName = (user: UserListItem) => level(user) === "A" ? "Administrator" : level(user) === "U" ? "Limited" : "Other / unspecified";
const format = (value: number) => value.toLocaleString();
const pageSize = 8;

export default function UamDashboardPage() {
  const site = authService.getSite();
  const bundle = usePermissionsStore(state => state.bundle);
  const isAdmin = bundle?.isAdmin || authService.getUserLevel().trim().toUpperCase() === "A";
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const users = useQuery({ queryKey: ["uam-dashboard-users", bundle?.userId, site], queryFn: userService.getAllUsers, enabled: !!isAdmin, staleTime: 60_000, retry: 1 });
  const assignments = useQuery({ queryKey: ["uam-dashboard-assignments", bundle?.userId, site], queryFn: () => userRightsService.getSiteAssignments(site), enabled: !!isAdmin && !!site, staleTime: 60_000, retry: 1 });
  const allUsers = users.data || [];
  const admins = allUsers.filter(user => level(user) === "A").length;
  const limited = allUsers.filter(user => level(user) === "U").length;
  const other = allUsers.length - admins - limited;
  const access = useMemo(() => {
    const assigned = new Set<number>();
    const byModule = new Map<string, Set<number>>(ASSIGNABLE_MODULES.map(module => [module.key, new Set<number>()]));
    const knownUsers = new Set((users.data || []).map(user => user.userNo));
    for (const row of assignments.data || []) {
      const key = normalizeWorkspaceModule(row.softwareName);
      if ((row.site || "").trim().toUpperCase() !== site.trim().toUpperCase() || !key || !knownUsers.has(row.userNo) || !byModule.has(key)) continue;
      byModule.get(key)!.add(row.userNo);
      assigned.add(row.userNo);
    }
    return { byModule, unassigned: (users.data || []).filter(user => level(user) === "U" && !assigned.has(user.userNo)).length };
  }, [users.data, assignments.data, site]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (users.data || []).filter(user => (role === "all" || (role === "other" ? !["A", "U"].includes(level(user)) : level(user) === role)) && (!term || `${user.userId || user.userID || ""} ${user.userName || ""} ${user.userNo}`.toLowerCase().includes(term)));
  }, [users.data, search, role]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const refresh = () => { void users.refetch(); if (site) void assignments.refetch(); };
  const refreshing = users.isFetching || assignments.isFetching;
  const metrics = [
    { label: "Total accounts", value: allUsers.length },
    { label: "Administrators", value: admins },
    { label: "Limited accounts", value: limited },
    { label: "Web-enabled accounts", value: allUsers.filter(user => user.webUser === true).length },
  ];

  return <div className="min-h-full w-full shrink-0">
    <header className="sticky top-0 z-30 border-b bg-card text-card-foreground">
      <div className="mx-auto flex min-h-14 max-w-[1600px] items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0 md:hidden" aria-label="Toggle navigation" onClick={() => useSidebarStore.getState().toggle()}><PanelLeft /></Button>
          <ShieldCheck className="hidden size-4 text-primary sm:block" aria-hidden="true" /><span className="text-sm font-semibold">User access management</span>
        </div>
        <span className="shrink-0 rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium">Admin workspace</span>
      </div>
    </header>
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">UAM Dashboard</h1><p className="mt-2 max-w-prose text-sm text-muted-foreground">Manage accounts and review access across your workspaces.</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Refresh UAM dashboard" disabled={refreshing} onClick={refresh}><RefreshCw className={refreshing ? "animate-spin motion-reduce:animate-none" : ""} /></Button>
          <Button variant="outline" asChild><Link to="/user-access/user-rights">Manage rights</Link></Button>
          <Button asChild><Link to="/user-access/create-user"><UserPlus />Create user</Link></Button>
        </div>
      </div>

      {users.isError && !users.data ? <div role="alert" className="rounded-xl border border-destructive/30 bg-card p-6"><h2 className="font-semibold">Accounts could not be loaded</h2><p className="mt-2 text-sm text-muted-foreground">Refresh to try again. Account totals are unavailable until the directory loads.</p><Button variant="outline" className="mt-4" onClick={refresh}>Try again</Button></div> : users.isPending ? <div aria-label="Loading UAM dashboard" aria-busy="true" className="space-y-6"><div className="h-28 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" /><div className="h-96 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" /></div> : <>
        {users.isRefetchError && <p role="alert" className="text-sm text-destructive">Refresh failed. Showing the last loaded accounts.</p>}
        <section aria-label="Account summary" className="overflow-hidden rounded-xl border bg-card">
          <dl className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">{metrics.map(metric => <div key={metric.label} className="min-w-0 bg-card p-4 sm:p-5"><dt className="text-xs font-medium text-muted-foreground">{metric.label}</dt><dd className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{format(metric.value)}</dd></div>)}</dl>
          <p className="border-t px-4 py-3 text-xs text-muted-foreground sm:px-5">All registered accounts · {users.dataUpdatedAt ? `Updated ${new Intl.DateTimeFormat("en-PK", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Karachi" }).format(users.dataUpdatedAt)} (Asia/Karachi)` : ""}</p>
        </section>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <section className="min-w-0 rounded-xl border bg-card" aria-labelledby="uam-users-title">
            <div className="flex flex-wrap items-center justify-between gap-3 p-5"><div><h2 id="uam-users-title" className="text-base font-semibold">User directory</h2><p className="mt-1 text-xs text-muted-foreground">Find an account to view or update its details.</p></div><Link to="/user-access/existing-users" className="inline-flex min-h-10 items-center gap-2 rounded-md px-2 text-xs font-medium text-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Full directory<ArrowRight className="size-3.5" /></Link></div>
            <div className="flex flex-col gap-3 px-5 pb-5 sm:flex-row">
              <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" aria-hidden="true" /><Input aria-label="Search users" placeholder="Search name, user ID or number" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} className="pl-9" /></div>
              <select aria-label="Filter by access level" value={role} onChange={event => { setRole(event.target.value); setPage(1); }} className="h-10 max-w-full rounded-md border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="all">All access levels</option><option value="A">Administrators</option><option value="U">Limited accounts</option><option value="other">Other / unspecified</option></select>
            </div>
            {visible.length ? <ul className="divide-y border-t">{visible.map(user => <li key={user.userNo} className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3"><span className="hidden size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary sm:flex" aria-hidden="true">{(user.userName || user.userId || user.userID || "?").trim().slice(0, 2).toUpperCase()}</span><div className="min-w-0"><p className="break-words text-sm font-medium">{user.userName || user.userId || user.userID || `Account ${user.userNo}`}</p><p className="mt-1 break-words text-xs text-muted-foreground">{user.userId || user.userID || `#${user.userNo}`}<span className="sm:hidden"> · {roleName(user)}</span></p></div></div>
              <div className="flex shrink-0 items-center gap-4"><span className={`hidden text-xs sm:inline ${level(user) === "A" ? "font-medium text-primary" : "text-muted-foreground"}`}>{roleName(user)}</span><Button variant="outline" size="sm" asChild><Link to={`/user-access/create-user?userNo=${user.userNo}`} aria-label={`Edit ${user.userName || user.userId || user.userID || `account ${user.userNo}`}`}>Edit</Link></Button></div>
            </li>)}</ul> : <div className="border-t px-5 py-10 text-center"><h3 className="text-sm font-semibold">{allUsers.length ? "No matching accounts" : "No accounts found"}</h3><p className="mt-2 text-sm text-muted-foreground">{allUsers.length ? "Try another name or access level." : "Create a user to get started."}</p>{(search || role !== "all") && <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setRole("all"); setPage(1); }}>Clear filters</Button>}</div>}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3"><p className="text-xs text-muted-foreground" role="status">{format(filtered.length)} accounts · Page {currentPage} of {pages}</p><div className="flex gap-1"><Button variant="outline" size="icon" aria-label="Previous users" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft /></Button><Button variant="outline" size="icon" aria-label="Next users" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}><ChevronRight /></Button></div></div>
          </section>

          <div className="min-w-0 space-y-6">
            <section className="rounded-xl border bg-card p-5" aria-labelledby="uam-access-title">
              <h2 id="uam-access-title" className="text-base font-semibold">Workspace access</h2><p className="mt-1 break-words text-xs text-muted-foreground">Explicit module assignments · {site || "No site selected"}</p>
              {!site ? <p className="mt-5 text-sm text-muted-foreground">Select a site at sign-in to review its assignments.</p> : assignments.isError ? <div role="alert" className="mt-5"><p className="text-sm text-muted-foreground">Module assignments could not be loaded.</p><Button variant="outline" size="sm" className="mt-3" onClick={() => { void assignments.refetch(); }}>Retry access summary</Button></div> : assignments.isPending ? <p className="mt-5 text-sm text-muted-foreground" role="status">Loading module assignments…</p> : <>
                <dl className="mt-5 divide-y">{ASSIGNABLE_MODULES.map(module => <div key={module.key} className="flex items-center justify-between gap-3 py-3"><dt className="text-sm">{module.label}</dt><dd className="font-semibold tabular-nums">{format(access.byModule.get(module.key)?.size || 0)}</dd></div>)}</dl>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Counts include saved assignments only. Administrators have full module access without an assignment.</p>
                <div className="mt-5 border-t pt-4"><p className="text-sm"><strong className="tabular-nums">{format(access.unassigned)}</strong> limited accounts with no HRMS or CRM assignment at this site.</p><Link to="/user-access/user-rights" className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md px-2 text-xs font-medium text-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Review user rights<ArrowRight className="size-3.5" /></Link></div>
              </>}
            </section>
            <section className="rounded-xl border bg-card p-5" aria-labelledby="uam-levels-title"><h2 id="uam-levels-title" className="text-base font-semibold">Access levels</h2><dl className="mt-4 space-y-4">{[{ label: "Administrator", count: admins, detail: "Full access to modules and user management." }, { label: "Limited", count: limited, detail: "Access depends on assigned modules and page rights." }, ...(other ? [{ label: "Other / unspecified", count: other, detail: "Review the account’s configured access level." }] : [])].map(item => <div key={item.label}><div className="flex justify-between gap-3 text-sm"><dt className="font-medium">{item.label}</dt><dd className="tabular-nums">{format(item.count)}</dd></div><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.detail}</p></div>)}</dl></section>
          </div>
        </div>
      </>}
    </div>
  </div>;
}
