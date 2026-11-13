import React from "react";
import { PanelLeftClose, ChevronLeft, LayoutGrid } from "lucide-react";
import { ModuleConfig } from "../types";
import { useSidebarStore } from "@/shared/stores/useSidebarStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

interface SidebarHeaderProps {
    config: ModuleConfig;
    isOpen: boolean;
    onNavigate: (path: string) => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
    config,
    isOpen,
    onNavigate,
}) => {
    const { toggle } = useSidebarStore();

    if (!isOpen) {
        return (
            <div className="h-14 flex flex-col items-center justify-center border-b border-sidebar-border gap-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            onClick={toggle}
                            className="size-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 group focus:outline-none"
                            aria-label={`Expand ${config.title} Sidebar`}
                        >
                            <img
                                src="/coolpoint-emblem-white.svg"
                                alt="CoolPoint"
                                className="size-7.5 object-contain rounded-full shadow-xs"
                            />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12} className="font-semibold text-xs">
                        Expand {config.title}
                    </TooltipContent>
                </Tooltip>
            </div>
        );
    }

    return (
        <div className="h-14 px-3 flex items-center justify-between border-b border-sidebar-border bg-sidebar">
            <div
                className="flex items-center gap-2.5 cursor-pointer transition-all duration-200 group min-w-0"
                onClick={() => onNavigate(config.dashboardPath)}
                title={`Go to ${config.title} Workspace`}
            >
                <div className="size-8 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <img
                        src="/coolpoint-emblem-white.svg"
                        alt="CoolPoint"
                        className="size-7.5 object-contain rounded-full shadow-xs"
                    />
                </div>
                <div className="flex flex-col overflow-hidden min-w-0">
                    <h1 className="text-xs font-display font-black leading-tight text-white tracking-tight whitespace-nowrap truncate group-hover:text-white transition-colors">
                        {config.title}
                    </h1>
                    <p className="text-[9px] text-white/70 font-sans uppercase tracking-wider whitespace-nowrap truncate">
                        {config.subtitle}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            onClick={() => onNavigate("/modules")}
                            className="p-1.5 rounded-lg text-sidebar-foreground hover:text-white hover:bg-white/10 transition-colors"
                            aria-label="Back to Launchpad"
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                        Enterprise Launchpad
                    </TooltipContent>
                </Tooltip>

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggle();
                    }}
                    className="p-1.5 rounded-lg text-sidebar-foreground hover:text-white hover:bg-white/10 transition-colors"
                    title="Collapse Sidebar"
                    aria-label="Collapse Sidebar"
                >
                    <PanelLeftClose className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
