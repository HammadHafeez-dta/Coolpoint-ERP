import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Factory,
  Package,
  ShieldCheck,
  ShoppingCart,
  ThermometerSnowflake,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { authService } from "@/modules/auth/services/authService";
import { logoutWithTransition } from "@/modules/auth/services/logoutTransition";
import { usePermissionsStore } from "@/modules/user-management/store/permissionsStore";
import HrDashboardPage from "@/modules/hr/pages/HrDashboardPage";
import SalesOverview from "@/modules/crm/pages/SalesOverview";

const moduleTabs: { value: string; label: string; icon: LucideIcon; disabled?: boolean }[] = [
  { value: "hrms", label: "HRMS", icon: Users },
  { value: "crm", label: "CRM", icon: ThermometerSnowflake },
  { value: "uam", label: "Access Control", icon: ShieldCheck, disabled: true },
  { value: "account", label: "Account", icon: Wallet, disabled: true },
  { value: "inventory", label: "Inventory", icon: Package, disabled: true },
  { value: "after-sales", label: "Sale After Sale", icon: ShoppingCart, disabled: true },
  { value: "production", label: "Production", icon: Factory, disabled: true },
];

function DashboardOverviewHeader({
  title,
  href,
  action,
  compactAction,
}: {
  title: string;
  href: string;
  action: string;
  compactAction: string;
}) {
  return (
    <header className="sticky top-16 z-20 mb-5 flex min-h-14 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm sm:px-5">
      <h2 className="text-sm font-semibold leading-snug text-slate-900">{title}</h2>
      <Link
        to={href}
        className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-[#171858] transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171858] focus-visible:ring-offset-2 sm:px-3"
      >
        <span className="sm:hidden">{compactAction}</span>
        <span className="hidden sm:inline">{action}</span>
        <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
      </Link>
    </header>
  );
}

export default function ExecutiveDashboardPage() {
  const navigate = useNavigate();
  const permissions = usePermissionsStore();
  const [compactNavigation, setCompactNavigation] = useState(false);
  const isAdmin =
    authService.getUserLevel().trim().toUpperCase() === "A" || permissions.isAdmin();
  const hasDashboardAccess =
    isAdmin ||
    (permissions.hasModuleAccess("HRMS") && permissions.hasModuleAccess("CRM"));

  useEffect(() => {
    const breakpoint = window.matchMedia("(max-width: 1023px)");
    const updateNavigation = () => setCompactNavigation(breakpoint.matches);
    updateNavigation();
    breakpoint.addEventListener("change", updateNavigation);
    return () => breakpoint.removeEventListener("change", updateNavigation);
  }, []);

  if (!isAdmin && !permissions.isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-sm text-slate-600">
        <div role="status" className="flex items-center gap-2">
          <BarChart3 className="size-4 animate-pulse text-[#171858]" aria-hidden="true" />
          Loading dashboard access…
        </div>
      </main>
    );
  }

  if (!hasDashboardAccess) return <Navigate to="/modules" replace />;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#171858] text-white shadow-sm">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/modules")}
              className="h-10 shrink-0 gap-2 px-2 text-white hover:bg-white/10 hover:text-white sm:px-3"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Workspaces</span>
            </Button>
            <span className="hidden h-6 w-px bg-white/20 sm:block" aria-hidden="true" />
            <img
              src="/coolpoint-logo-white.png"
              alt="CoolPoint International"
              className="h-7 w-auto object-contain"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => logoutWithTransition(() => navigate("/", { replace: true }))}
            className="h-9 shrink-0 border-white/20 bg-white/10 px-3 text-xs text-white hover:bg-white/20 hover:text-white"
          >
            Sign Out
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold tracking-tight sm:text-3xl">
            Executive Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Review HRMS and CRM performance in one place. Other module dashboards are marked as coming soon.
          </p>
        </div>

        <Tabs
          defaultValue="hrms"
          orientation={compactNavigation ? "horizontal" : "vertical"}
          className="grid w-full gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start"
        >
          <aside className="min-w-0 rounded-xl border border-[#171858] bg-[#171858] p-3 text-white shadow-sm lg:sticky lg:top-24">
            <h2 className="px-2 pt-1 text-sm font-semibold text-white">Module dashboards</h2>
            <p className="px-2 pt-1 text-xs text-white/75">Choose a dashboard to view.</p>
            <TabsList
              aria-label="Executive dashboard modules"
              className={`mt-3 flex h-auto w-full gap-1 bg-transparent p-0 text-white/90 ${
                compactNavigation
                  ? "flex-row justify-start overflow-x-auto"
                  : "flex-col items-stretch justify-start"
              }`}
            >
              {moduleTabs.map(({ value, label, icon: Icon, disabled }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  disabled={disabled}
                  title={disabled ? `${label} dashboard coming soon` : undefined}
                  className={`min-h-11 gap-3 rounded-md border border-transparent text-xs transition-colors focus-visible:ring-white ${
                    compactNavigation
                      ? "shrink-0 px-3"
                      : "w-full justify-start px-3 text-left"
                  } text-white/90 hover:bg-white/10 hover:text-white data-[state=active]:bg-white data-[state=active]:text-[#171858] data-[state=active]:shadow-sm data-[state=active]:hover:bg-white data-[state=active]:hover:text-[#171858] disabled:cursor-not-allowed disabled:opacity-100 disabled:text-white/80`}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                  {disabled && (
                    <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/90">
                      Soon
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </aside>

          <TabsContent value="hrms" className="m-0 min-w-0 lg:col-start-2 lg:row-start-1">
            <DashboardOverviewHeader
              title="HRMS overview"
              href="/hr/employees"
              action="Employee directory"
              compactAction="Employees"
            />
            <HrDashboardPage embedded />
          </TabsContent>
          <TabsContent value="crm" className="m-0 min-w-0 lg:col-start-2 lg:row-start-1">
            <DashboardOverviewHeader
              title="CRM overview"
              href="/crm"
              action="Open CRM workspace"
              compactAction="CRM workspace"
            />
            <SalesOverview />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
