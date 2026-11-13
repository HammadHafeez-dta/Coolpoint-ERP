import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Users,
  ShieldCheck,
  LogOut,
  ArrowRight,
  ThermometerSnowflake,
  Database,
  LoaderCircle,
  Wallet,
  Package,
  ShoppingCart,
  Factory,
  Clock3,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { authService } from "@/modules/auth/services/authService";
import { logoutWithTransition } from "@/modules/auth/services/logoutTransition";
import { usePermissionsStore } from "@/modules/user-management/store/permissionsStore";
import { getAccessibleModuleIds, WORKSPACE_MODULES } from "@/modules/user-management/utils/moduleAccess";

export const Modules: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const { isAdmin: hasAdminAccess, hasModuleAccess, isLoaded } = usePermissionsStore();
  const isAdmin = authService.getUserLevel().toUpperCase() === "A" || hasAdminAccess();

  const handleLogout = () => {
    logoutWithTransition(() => navigate("/", { replace: true }));
  };

  const getInitials = (name?: string) => {
    if (!name) return "CP";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const userName = currentUser?.userName || currentUser?.username || "System Operator";
  const accessibleModuleIds = getAccessibleModuleIds(hasModuleAccess);
  const canAccessExecutiveDashboard =
    isAdmin || (hasModuleAccess("HRMS") && hasModuleAccess("CRM"));
  const singleWorkspacePath = accessibleModuleIds.length === 1
    ? WORKSPACE_MODULES.find(module => module.id === accessibleModuleIds[0])?.path
    : undefined;

  const modules = [
    {
      id: "hrms",
      key: "HRMS",
      adminOnly: false,
      title: "Human Resources (HRMS)",
      tag: "Workforce & Payroll Operations",
      badge: "Core System",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Users,
      iconBg: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      description:
        "Complete enterprise workforce operations, including employee master profiles, daily biometric attendance synchronization, shift rosters, and automated monthly payroll registers.",
      primaryAction: {
        label: "Open HRMS",
        path: "/hr/employees",
      },
    },
    {
      id: "crm",
      key: "CRM",
      adminOnly: false,
      title: "Commercial CRM",
      tag: "HVAC Engineering & Bids",
      badge: "Commercial",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      icon: ThermometerSnowflake,
      iconBg: "bg-blue-500/10 text-[#171858] border-blue-500/20",
      description:
        "Industrial HVAC quotation engine, customer tender tracking, equipment technical sizing for water-cooled screw chillers and cleanroom AHUs, and itemized GST bids.",
      primaryAction: {
        label: "Open Commercial CRM",
        path: "/crm",
      },
    },
    {
      id: "uam",
      key: "UAM",
      adminOnly: true,
      title: "Access Control (UAM)",
      tag: "Enterprise Security & RBAC",
      badge: "Governance",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
      icon: ShieldCheck,
      iconBg: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      description:
        "Granular role based authorization matrix controlling module, screen, and action level rights across CoolPoint International plant sites and corporate offices.",
      primaryAction: {
        label: "Open Access Control",
        path: "/user-access/dashboard",
      },
    },
    {
      id: "executive-dashboard",
      key: "EXECUTIVE",
      adminOnly: false,
      title: "Executive Dashboard",
      tag: "Cross-Module Overview",
      badge: "Executive",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
      icon: BarChart3,
      iconBg: "bg-[#171858]/10 text-[#171858] border-[#171858]/20",
      description:
        "View workforce and commercial performance dashboards together, with additional module dashboards planned.",
      primaryAction: {
        label: "Open Executive Dashboard",
        path: "/executive-dashboard",
      },
    },
  ];

  const visibleModules = modules.filter(module => {
    if (module.id === "executive-dashboard") return canAccessExecutiveDashboard;
    return isAdmin || (!module.adminOnly && hasModuleAccess(module.key));
  });

  const comingSoonModules = [
    { id: "account", title: "Account", icon: Wallet },
    { id: "inventory", title: "Inventory", icon: Package },
    { id: "sale-after-sale", title: "Sale After Sale", icon: ShoppingCart },
    { id: "production", title: "Production", icon: Factory },
  ];

  useEffect(() => {
    if (!isAdmin && isLoaded && singleWorkspacePath) {
      navigate(singleWorkspacePath, { replace: true });
    }
  }, [isAdmin, isLoaded, singleWorkspacePath, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans selection:bg-[#171858]/15 selection:text-[#171858]">
      {/* Top Header Matching the Corporate Navy Theme */}
      <header className="sticky top-0 z-30 bg-[#171858] border-b border-white/10 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/coolpoint-logo-white.png"
              alt="CoolPoint International"
              className="h-8 w-auto object-contain cursor-pointer"
              onClick={() => navigate("/modules")}
            />
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-xs border border-white/15 shadow-xs">
                {getInitials(userName)}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-none">
                  {userName}
                </span>
                <span className="text-[10px] text-white font-sans mt-0.5">
                  {isAdmin ? "Super Administrator" : "Standard Operator"}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              aria-label="Sign out"
              className="h-8 text-xs border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-white/80" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14 flex flex-col justify-center w-full">
        {/* Title & Introduction */}
        <div className="mb-8 md:mb-10 text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Workspaces
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5 max-w-xl">
            Select an operational system to access records and tools.
          </p>
        </div>

        {/* 3-Column Balanced Grid with Light Cards Matching Inner System */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {!isAdmin && !isLoaded ? (
            <div role="status" className="col-span-full flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-10 text-sm text-slate-600">
              <LoaderCircle className="size-4 animate-spin" /> Loading your assigned workspaces…
            </div>
          ) : visibleModules.length === 0 ? (
            <div role="status" className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <h2 className="text-base font-semibold text-slate-900">No workspace access assigned</h2>
              <p className="mt-2 text-sm text-slate-600">Contact your administrator to request access to HRMS or Commercial CRM.</p>
            </div>
          ) : visibleModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => navigate(mod.primaryAction.path)}
                className="group bg-white rounded-2xl border border-slate-200/90 p-7 lg:p-8 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer"
              >
                <div>
                  {/* Card Header: Icon & Category Badge */}
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div
                      className={`size-12 rounded-xl flex items-center justify-center shrink-0 border ${mod.iconBg} shadow-xs group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${mod.badgeColor}`}
                    >
                      {mod.badge}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h2 className="text-xl font-display font-bold text-slate-900 group-hover:text-[#171858] transition-colors leading-snug">
                    {mod.title}
                  </h2>
                  <div className="mt-1 mb-3 text-xs font-sans font-semibold leading-relaxed text-[#171858]">
                    {mod.tag}
                  </div>

                  {/* Overview Text */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                {/* Primary Action Button */}
                <div className="mt-8 pt-5 border-t border-slate-100">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(mod.primaryAction.path);
                    }}
                    className="w-full h-11 text-xs sm:text-sm font-bold rounded-xl bg-[#171858] hover:bg-[#121344] text-white gap-2 shadow-xs group-hover:bg-[#121344] transition-colors"
                  >
                    <span>{mod.primaryAction.label}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            );
          })}
          {comingSoonModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                aria-disabled="true"
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-7 lg:p-8"
              >
                <div>
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-500">
                      <Icon className="size-6" />
                    </div>
                    <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Coming Soon
                    </span>
                  </div>
                  <h2 className="text-xl font-display font-bold leading-snug text-slate-800">
                    {mod.title}
                  </h2>
                  <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    This workspace is under construction and will be available soon.
                  </p>
                </div>
                <div className="mt-8 border-t border-slate-200 pt-5">
                  <Button
                    type="button"
                    disabled
                    className="h-11 w-full cursor-not-allowed gap-2 rounded-xl bg-slate-200 text-xs font-bold text-slate-600 opacity-100 sm:text-sm"
                  >
                    <span>Under Construction</span>
                    <Clock3 className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-bold text-slate-800">CoolPoint International (Pvt.) Ltd.</span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <div className="flex items-center gap-3 font-sans text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Database className="w-3 h-3 text-emerald-600" /> Coolpoint_Common (Live)
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Database className="w-3 h-3 text-emerald-600" /> Coolpoint_HRMS (Active)
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Database className="w-3 h-3 text-emerald-600" /> Coolpoint_CRM (Active)
              </span>
            </div>
          </div>

          <div className="text-[11px] font-sans text-slate-500">
            AHRI Certified &bull; ISO 9001:2015 &bull; CE Compliant Operations
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Modules;
