import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, LogOut, LayoutGrid } from "lucide-react";
import { authService } from "@/modules/auth/services/authService";
import { logoutWithTransition } from "@/modules/auth/services/logoutTransition";
import { usePermissionsStore } from "@/modules/user-management/store/permissionsStore";
import { filterHrLinks } from "@/modules/user-management/utils/hrPageAccess";
import { gazettedLeavesService } from "@/modules/hr/services/gazettedLeavesService";
import { useSidebarStore } from "../../stores/useSidebarStore";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { useToast } from "@/shared/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

import { SidebarLink, SidebarChildLink, ModuleType } from "./sidebar/types";
import {
    hrDefineLinks,
    hrTransactionLinks,
    hrLeaveLinks,
    hrEmployeeReportLinks,
    hrSalaryReportLinks,
    hrLeaveReportLinks,
    hrAttendanceReportLinks,
    hrLoanReportLinks,
    hrSettingLinks,
    crmDefineLinks,
    crmTransactionLinks,
    crmReportLinks,
    userAccessDefineLinks,
    moduleConfigs,
} from "./sidebar/config/sidebarLinks";

import { SidebarHeader } from "./sidebar/components/SidebarHeader";
import { SidebarSection } from "./sidebar/components/SidebarSection";
import { SidebarNavItem } from "./sidebar/components/SidebarNavItem";
import { SidebarUserProfile } from "./sidebar/components/SidebarUserProfile";

const SideNavBar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isOpen } = useSidebarStore();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const currentUser = authService.getCurrentUser();
    const site = authService.getSite();
    const permissions = usePermissionsStore();
    const [generatingReport, setGeneratingReport] = useState(false);

    const getModuleFromPath = (path: string): ModuleType => {
        if (path.startsWith('/crm')) return 'crm';
        if (path.startsWith('/user-access')) return 'user-access';
        return 'hr';
    };

    const lastMatchedModuleRef = React.useRef<ModuleType>(getModuleFromPath(location.pathname));

    const currentModule: ModuleType = useMemo(() => {
        const matched = getModuleFromPath(location.pathname);
        if (matched) {
            lastMatchedModuleRef.current = matched;
            return matched;
        }
        return lastMatchedModuleRef.current;
    }, [location.pathname]);

    const isHrModule = currentModule === 'hr';

    // Module configuration (title, subtitle, icon, dashboard path)
    const moduleConfig = useMemo(() => moduleConfigs[currentModule] || moduleConfigs.hr, [currentModule]);

    // Active path checker
    const isActive = useCallback((path?: string) => {
        if (!path) return false;
        if (path.includes('?')) {
            return (location.pathname + location.search) === path;
        }
        return location.pathname === path;
    }, [location.pathname, location.search]);

    // Module links calculation via configuration
    const defineLinks = useMemo<SidebarLink[]>(() => {
        switch (currentModule) {
            case 'crm':
                return crmDefineLinks;
            case 'user-access':
                return userAccessDefineLinks;
            case 'hr':
            default:
                return hrDefineLinks;
        }
    }, [currentModule]);

    const transactionLinks = useMemo<SidebarLink[]>(() => {
        switch (currentModule) {
            case 'crm':
                return crmTransactionLinks;
            case 'user-access':
                return [];
            case 'hr':
            default:
                return [...hrTransactionLinks, ...hrLeaveLinks, ...hrSettingLinks];
        }
    }, [currentModule]);

    const reportLinks = useMemo<SidebarLink[]>(() => {
        switch (currentModule) {
            case 'crm':
                return crmReportLinks;
            case 'user-access':
                return [];
            case 'hr':
            default:
                return [
                    ...hrEmployeeReportLinks,
                    ...hrSalaryReportLinks,
                    ...hrLeaveReportLinks,
                    ...hrAttendanceReportLinks,
                    ...hrLoanReportLinks
                ];
        }
    }, [currentModule]);

    const filterLinks = (links: SidebarLink[]) => currentModule === 'hr'
        ? filterHrLinks(links, page => permissions.canView('HRMS', page))
        : currentModule === 'crm' ? links.filter(link => permissions.canView('CRM', link.label)) : links;
    const visibleDefineLinks = filterLinks(defineLinks);
    const visibleTransactionLinks = filterLinks(transactionLinks);
    const visibleReportLinks = filterLinks(reportLinks);
    const showDashboard = currentModule !== "hr"
        && (currentModule !== "crm" || permissions.canView("CRM", "Sales Analytics"));

    // State to track expanded dropdowns
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
        "SECTION_DEFINE": true,
        "SECTION_TRANSACTION": true,
        "SECTION_REPORTS": true,
        "SECTION_SYSTEM": true,
    });

    const toggleExpand = useCallback((label: string) => {
        setExpandedItems(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    }, []);

    // Auto-expand sections or links if a child is active
    useEffect(() => {
        const newExpanded = { ...expandedItems };
        let changed = false;

        const checkLinks: SidebarLink[] = [
            ...defineLinks,
            ...transactionLinks,
            ...reportLinks,
            ...hrLeaveLinks,
            ...hrEmployeeReportLinks,
            ...hrSalaryReportLinks,
            ...hrLeaveReportLinks,
            ...hrAttendanceReportLinks,
            ...hrLoanReportLinks,
            ...hrSettingLinks,
        ];

        checkLinks.forEach(link => {
            if (link.children) {
                const hasActiveChild = link.children.some(child => isActive(child.path));
                if (hasActiveChild) {
                    if (!newExpanded[link.label]) {
                        newExpanded[link.label] = true;
                        changed = true;
                    }
                    link.children.forEach(child => {
                        if (child.children && child.children.some(c => isActive(c.path))) {
                            newExpanded[child.label] = true;
                            changed = true;
                        }
                    });
                }
            }
        });

        // Auto-expand sections if active
        const isDefineActive = defineLinks.some(link =>
            isActive(link.path) || link.children?.some(c => isActive(c.path))
        );
        if (isDefineActive && !newExpanded["SECTION_DEFINE"]) {
            newExpanded["SECTION_DEFINE"] = true;
            changed = true;
        }

        const isTransactionActive = transactionLinks.some(link =>
            isActive(link.path) || link.children?.some(c => isActive(c.path))
        );
        if (isTransactionActive && !newExpanded["SECTION_TRANSACTION"]) {
            newExpanded["SECTION_TRANSACTION"] = true;
            changed = true;
        }

        const isReportActive = reportLinks.some(link =>
            isActive(link.path) || link.children?.some(c => isActive(c.path))
        );
        if (isReportActive && !newExpanded["SECTION_REPORTS"]) {
            newExpanded["SECTION_REPORTS"] = true;
            changed = true;
        }

        if (changed) {
            setExpandedItems(newExpanded);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname, location.search, defineLinks, transactionLinks, reportLinks, isActive]);

    // Auto-scroll the active nav item into view in the sidebar
    useEffect(() => {
        const timer = setTimeout(() => {
            const activeEl = document.querySelector('[data-sidebar-active="true"]');
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 150);
        return () => clearTimeout(timer);
    }, [location.pathname, location.search]);

    const handleLogout = useCallback(() => {
        logoutWithTransition(() => navigate("/", { replace: true }));
    }, [navigate]);

    const handleLinkClick = useCallback(async (link: SidebarLink | SidebarChildLink) => {
        if (link.action === "gazetted-report") {
            setGeneratingReport(true);
            try {
                await gazettedLeavesService.viewReportPdf();
            } catch (error) {
                console.error("Report generation failed:", error);
            } finally {
                setGeneratingReport(false);
            }
            return;
        }
        if (link.path) {
            navigate(link.path);
        }
    }, [navigate]);

    const dashboardLink: SidebarLink = useMemo(() => ({
        icon: LayoutDashboard,
        label: "Dashboard",
        path: moduleConfig.dashboardPath,
    }), [moduleConfig.dashboardPath]);

    const defineSectionTitle = currentModule === "crm" ? "Sales workflow" : "Define";
    const transactionSectionTitle = currentModule === "crm" ? "Directory" : "Transactions";

    // Auto-close sidebar on mobile viewport route navigation
    useEffect(() => {
        if (window.innerWidth < 768 && isOpen) {
            useSidebarStore.getState().setOpen(false);
        }
    }, [location.pathname, location.search]);

    useEffect(() => {
        const viewport = window.matchMedia("(max-width: 767px)");
        const syncSidebar = () => {
            if (viewport.matches) useSidebarStore.getState().setOpen(false);
        };
        syncSidebar();
        viewport.addEventListener("change", syncSidebar);
        return () => viewport.removeEventListener("change", syncSidebar);
    }, []);

    return (
        <>
            {/* Mobile backdrop overlay */}
            <button
                type="button"
                aria-label="Close navigation"
                aria-hidden={!isOpen}
                tabIndex={isOpen ? 0 : -1}
                className={`app-sidebar-backdrop md:hidden fixed inset-0 bg-black/60 z-40 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => useSidebarStore.getState().setOpen(false)}
            />

            <aside aria-label="Main navigation" data-open={isOpen} className={`app-sidebar bg-sidebar text-sidebar-foreground flex flex-col fixed inset-y-0 left-0 z-50 border-r border-sidebar-border ${isOpen ? 'w-60' : 'w-60 md:w-16 -translate-x-full md:translate-x-0'}`}>
                <TooltipProvider delayDuration={0}>
                    <SidebarHeader
                        config={moduleConfig}
                        isOpen={isOpen}
                        onNavigate={navigate}
                    />

                    <div className={`flex-1 overflow-y-auto py-3 sidebar-scrollbar ${isOpen ? 'pl-2 pr-1.5 space-y-4' : 'px-2 space-y-2 flex flex-col items-center'}`}>
                        {/* Dashboard entry follows the active module permissions. */}
                        {showDashboard && (
                            <nav className={isOpen ? "space-y-0.5 w-full" : "w-full flex justify-center"}>
                                <SidebarNavItem
                                    link={dashboardLink}
                                    isOpen={isOpen}
                                    isActive={isActive}
                                    onLinkClick={handleLinkClick}
                                />
                            </nav>
                        )}

                        {/* Section: Define */}
                        {visibleDefineLinks.length > 0 && <SidebarSection
                            title={defineSectionTitle}
                            sectionKey="SECTION_DEFINE"
                            links={visibleDefineLinks}
                            isOpen={isOpen}
                            expandedItems={expandedItems}
                            onToggleExpand={toggleExpand}
                            isActive={isActive}
                            onLinkClick={handleLinkClick}
                        />}

                        {/* Section: Transaction */}
                        {visibleTransactionLinks.length > 0 && <SidebarSection
                            title={transactionSectionTitle}
                            sectionKey="SECTION_TRANSACTION"
                            links={visibleTransactionLinks}
                            isOpen={isOpen}
                            expandedItems={expandedItems}
                            onToggleExpand={toggleExpand}
                            isActive={isActive}
                            onLinkClick={handleLinkClick}
                        />}

                        {/* Section: Reports */}
                        {visibleReportLinks.length > 0 && <SidebarSection
                            title="Reports"
                            sectionKey="SECTION_REPORTS"
                            links={visibleReportLinks}
                            isOpen={isOpen}
                            expandedItems={expandedItems}
                            onToggleExpand={toggleExpand}
                            isActive={isActive}
                            onLinkClick={handleLinkClick}
                            generatingReport={generatingReport}
                        />}

                        {/* Section: System Switcher */}
                        {permissions.isAdmin() && <SidebarSection
                            title="System"
                            sectionKey="SECTION_SYSTEM"
                            links={[
                                {
                                    icon: LayoutGrid,
                                    label: "Switch Workspace",
                                    path: "/modules",
                                }
                            ]}
                            isOpen={isOpen}
                            expandedItems={expandedItems}
                            onToggleExpand={toggleExpand}
                            isActive={isActive}
                            onLinkClick={handleLinkClick}
                        />}
                    </div>

                    <SidebarUserProfile
                        isOpen={isOpen}
                        username={currentUser?.username}
                        site={site}
                        onLogout={handleLogout}
                    />
                </TooltipProvider>
            </aside>
        </>
    );
};

export default SideNavBar;
