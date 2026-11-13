import { Outlet, useLocation } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import SideNavBar from "./SideNavBar";
import { useSidebarStore } from "../../stores/useSidebarStore";

const MainLayout = () => {
    const { isOpen } = useSidebarStore();
    const toggleSidebar = useSidebarStore((state) => state.toggle);
    const { pathname } = useLocation();
    const isHrms = pathname.startsWith("/hr/");

    return (
        <div className={`flex h-screen bg-background overflow-hidden ${isHrms ? "hrms-shell" : ""}`}>
            <SideNavBar />
            <main className={`app-sidebar-main flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto ${isHrms ? "hrms-main" : ""} ${isOpen ? 'md:ml-60 ml-0' : 'md:ml-16 ml-0'}`}>
                {isHrms && (
                    <header className="hrms-navigation-bar sticky top-0 z-[49] flex h-12 min-h-12 shrink-0 items-center border-b border-border bg-card px-3 sm:px-4">
                        <button
                            type="button"
                            aria-label={isOpen ? "Collapse HRMS navigation" : "Expand HRMS navigation"}
                            aria-expanded={isOpen}
                            onClick={toggleSidebar}
                            className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            {isOpen ? <PanelLeftClose className="size-4" aria-hidden="true" /> : <PanelLeftOpen className="size-4" aria-hidden="true" />}
                            <span>{isOpen ? "Hide navigation" : "Show navigation"}</span>
                        </button>
                    </header>
                )}
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
