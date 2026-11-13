import React from "react";
import { User, LogOut } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

interface SidebarUserProfileProps {
    isOpen: boolean;
    username?: string;
    site?: string;
    onLogout: () => void;
}

export const SidebarUserProfile: React.FC<SidebarUserProfileProps> = ({
    isOpen,
    username,
    site,
    onLogout,
}) => {
    if (!isOpen) {
        return (
            <div className="p-2 border-t border-sidebar-border/80 mt-auto flex flex-col items-center gap-1.5">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="size-9 rounded-xl bg-primary/20 border border-primary/25 flex items-center justify-center overflow-hidden shrink-0 cursor-default hover:bg-primary/30 transition-colors">
                            <User className="w-4 h-4 text-primary-foreground" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12} className="text-xs">
                        <p className="font-semibold text-primary-foreground">{username || "Guest"}</p>
                        <p className="text-[10px] text-muted-foreground">{site || "No Site"}</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            onClick={onLogout}
                            className="size-8 rounded-lg flex items-center justify-center text-sidebar-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            aria-label="Logout"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12} className="text-xs font-medium">
                        Sign Out
                    </TooltipContent>
                </Tooltip>
            </div>
        );
    }

    return (
        <div className="p-3 border-t border-sidebar-border mt-auto bg-sidebar">
            <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0 border border-white/10 text-white font-bold text-xs">
                    <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-[11px] font-semibold truncate text-white leading-tight">
                        {username || "Guest"}
                    </p>
                    <p className="text-[9px] text-white/70 truncate leading-tight mt-0.5">
                        {site || "Operations"}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onLogout}
                    className="p-1 rounded-md text-sidebar-foreground hover:text-red-400 hover:bg-white/10 transition-colors shrink-0"
                    title="Logout"
                    aria-label="Logout"
                >
                    <LogOut className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
};
