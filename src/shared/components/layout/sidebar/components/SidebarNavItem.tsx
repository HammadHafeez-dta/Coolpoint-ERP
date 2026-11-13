import React from "react";
import { SidebarLink, SidebarChildLink } from "../types";
import { ChevronDown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { useSidebarStore } from "@/shared/stores/useSidebarStore";

interface SidebarNavItemProps {
    link: SidebarLink;
    isOpen: boolean;
    isActive: (path?: string) => boolean;
    itemKey?: string;
    isExpanded?: boolean;
    onToggleExpand?: (label: string) => void;
    onLinkClick: (link: SidebarLink | SidebarChildLink) => void;
    expandedItems?: Record<string, boolean>;
    generatingReport?: boolean;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
    link,
    isOpen,
    isActive,
    itemKey,
    isExpanded,
    onToggleExpand,
    onLinkClick,
    expandedItems = {},
    generatingReport = false,
}) => {
    const hasChildren = Boolean(link.children && link.children.length > 0);
    const currentItemKey = itemKey || link.label;

    const isChildActive = (children?: SidebarChildLink[]): boolean => {
        if (!children) return false;
        return children.some(child => isActive(child.path) || isChildActive(child.children));
    };

    const isItemActive = isActive(link.path) || (hasChildren && isChildActive(link.children));

    if (hasChildren) {
        return (
            <div className="space-y-0.5">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            onClick={() => {
                                if (!isOpen) {
                                    useSidebarStore.getState().setOpen(true);
                                    onToggleExpand?.(currentItemKey);
                                } else {
                                    onToggleExpand?.(currentItemKey);
                                }
                            }}
                            title={link.label}
                            aria-label={link.label}
                            className={isOpen
                                ? `w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                    isItemActive
                                        ? "bg-white/10 text-primary-foreground font-semibold"
                                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                                  } hover:text-sidebar-foreground`
                                : `size-9 mx-auto flex items-center justify-center rounded-xl transition-all duration-200 relative group ${
                                    isItemActive
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                                        : "text-sidebar-foreground hover:bg-white/10"
                                  } hover:text-sidebar-foreground`
                            }
                        >
                            {isOpen ? (
                                <>
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <link.icon className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{link.label}</span>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: isExpanded ? 0 : -90 }}
                                        transition={{ duration: 0.2 }}
                                        className="shrink-0 ml-1"
                                    >
                                        <ChevronDown className="w-3 h-3" />
                                    </motion.div>
                                </>
                            ) : (
                                <>
                                    <link.icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                                    <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-white/20 group-hover:bg-primary transition-colors" />
                                </>
                            )}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12} className="font-medium text-xs">
                        {link.label}
                    </TooltipContent>
                </Tooltip>

                <AnimatePresence>
                    {isOpen && isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden ml-4 border-l border-sidebar-border mt-0.5 pl-2 space-y-0.5"
                        >
                            {link.children?.map((child) => {
                                const childKey = `${currentItemKey}_child_${child.label}`;
                                return (
                                    <SidebarChildItem
                                        key={child.label}
                                        child={child}
                                        itemKey={childKey}
                                        isActive={isActive}
                                        onLinkClick={onLinkClick}
                                        onToggleExpand={onToggleExpand}
                                        isExpanded={Boolean(expandedItems[childKey] ?? expandedItems[`child_${child.label}`])}
                                        generatingReport={generatingReport}
                                    />
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    onClick={() => onLinkClick(link)}
                    title={link.label}
                    aria-label={link.label}
                    data-sidebar-active={isActive(link.path) ? "true" : undefined}
                    className={isOpen
                        ? `w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            isActive(link.path)
                                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30 font-semibold"
                                : "text-sidebar-foreground hover:bg-sidebar-accent"
                          } hover:text-sidebar-foreground`
                        : `size-9 mx-auto flex items-center justify-center rounded-xl transition-all duration-200 relative group ${
                            isActive(link.path)
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                                : "text-sidebar-foreground hover:bg-white/10"
                          } hover:text-sidebar-foreground`
                    }
                >
                    {link.action === "update-inventory" && generatingReport ? (
                        <Loader2 className="w-4 h-4 shrink-0 animate-spin text-primary-foreground" />
                    ) : (
                        <link.icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                    )}
                    <span aria-hidden={!isOpen} className={`app-sidebar-label truncate ${isOpen ? "max-w-48 opacity-100" : "max-w-0 opacity-0"}`}>{link.label}</span>
                    {isOpen && link.action === "update-inventory" && generatingReport && (
                        <span className="text-[10px] opacity-75 ml-auto">Updating...</span>
                    )}
                </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12} className="font-medium text-xs">
                {link.label}
            </TooltipContent>
        </Tooltip>
    );
};


interface SidebarChildItemProps {
    child: SidebarChildLink;
    itemKey?: string;
    isActive: (path?: string) => boolean;
    onLinkClick: (link: SidebarLink | SidebarChildLink) => void;
    onToggleExpand?: (label: string) => void;
    isExpanded?: boolean;
    generatingReport?: boolean;
}

export const SidebarChildItem: React.FC<SidebarChildItemProps> = ({
    child,
    itemKey,
    isActive,
    onLinkClick,
    onToggleExpand,
    isExpanded,
    generatingReport,
}) => {
    const currentChildKey = itemKey || `child_${child.label}`;
    if (child.children && child.children.length > 0) {
        return (
            <div className="space-y-0.5">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => onToggleExpand?.(currentChildKey)}
                            title={child.label}
                            className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-medium rounded-md transition-colors relative text-sidebar-foreground"
                        >
                            <div className="flex items-center gap-2 relative min-w-0 flex-1">
                                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-[1px] bg-sidebar-border" />
                                <span className="truncate">{child.label}</span>
                            </div>
                            <motion.div
                                animate={{ rotate: isExpanded ? 0 : -90 }}
                                transition={{ duration: 0.2 }}
                                className="shrink-0 ml-1"
                            >
                                <ChevronDown className="w-2.5 h-2.5" />
                            </motion.div>
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>{child.label}</TooltipContent>
                </Tooltip>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden ml-3 border-l border-sidebar-border mt-0.5 pl-2 space-y-0.5"
                        >
                            {child.children.map((grandchild) => (
                                <Tooltip key={grandchild.label}>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => onLinkClick(grandchild)}
                                            title={grandchild.label}
                                            className={`w-full flex items-center gap-2 px-2 py-1 text-[10px] font-medium rounded-md transition-colors relative ${isActive(grandchild.path)
                                                ? "bg-primary text-primary-foreground"
                                                : "text-sidebar-foreground"
                                                } hover:text-sidebar-foreground`}
                                        >
                                            <div className={`absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-[1px] ${isActive(grandchild.path) ? "bg-primary" : "bg-sidebar-border"}`} />
                                            <span className="truncate">{grandchild.label}</span>
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" sideOffset={8}>{grandchild.label}</TooltipContent>
                                </Tooltip>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    onClick={() => onLinkClick(child)}
                    title={child.label}
                    data-sidebar-active={isActive(child.path) ? "true" : undefined}
                    className={`w-full flex items-center gap-2 px-2 py-1 text-[11px] font-medium rounded-md transition-colors relative ${isActive(child.path)
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-foreground"
                        } hover:text-sidebar-foreground`}
                >
                    <div className={`absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-[1px] ${isActive(child.path) ? "bg-primary" : "bg-sidebar-border"}`} />
                    <span className="truncate">{child.label}</span>
                    {child.action === "gazetted-report" && generatingReport && (
                        <Loader2 className="w-3 h-3 animate-spin text-primary ml-auto shrink-0" />
                    )}
                </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>{child.label}</TooltipContent>
        </Tooltip>
    );
};
