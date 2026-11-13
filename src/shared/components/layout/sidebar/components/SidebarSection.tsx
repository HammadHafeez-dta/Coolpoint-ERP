import React from "react";
import { SidebarLink, SidebarChildLink } from "../types";
import { SidebarNavItem } from "./SidebarNavItem";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarSectionProps {
    title: string;
    sectionKey: string;
    links: SidebarLink[];
    isOpen: boolean;
    expandedItems: Record<string, boolean>;
    onToggleExpand: (label: string) => void;
    isActive: (path?: string) => boolean;
    onLinkClick: (link: SidebarLink | SidebarChildLink) => void;
    generatingReport?: boolean;
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({
    title,
    sectionKey,
    links,
    isOpen,
    expandedItems,
    onToggleExpand,
    isActive,
    onLinkClick,
    generatingReport = false,
}) => {
    if (!links || links.length === 0) return null;

    const isSectionExpanded = Boolean(expandedItems[sectionKey]);

    return (
        <div className={isOpen ? "space-y-1" : "space-y-1.5 w-full"}>
            {isOpen ? (
                <button
                    type="button"
                    onClick={() => onToggleExpand(sectionKey)}
                    className="w-full px-2 flex items-center justify-between text-[9px] font-bold text-sidebar-foreground uppercase tracking-widest mb-1 transition-colors group"
                >
                    <span>{title}</span>
                    <motion.div
                        animate={{ rotate: isSectionExpanded ? 0 : -90 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="w-2.5 h-2.5" />
                    </motion.div>
                </button>
            ) : (
                <div className="py-1 flex justify-center w-full">
                    <div className="w-6 h-[1px] bg-sidebar-border/80 rounded-full" />
                </div>
            )}
            <AnimatePresence initial={false}>
                {(!isOpen || isSectionExpanded) && (
                    <motion.div
                        key={`${sectionKey}-content`}
                        initial={isOpen ? { height: 0, opacity: 0 } : false}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden w-full"
                    >
                        <nav className={isOpen ? "space-y-0.5" : "space-y-1.5 w-full flex flex-col items-center"}>
                            {links.map((link) => {
                                const itemKey = `${sectionKey}_${link.label}`;
                                return (
                                    <SidebarNavItem
                                        key={itemKey}
                                        itemKey={itemKey}
                                        link={link}
                                        isOpen={isOpen}
                                        isActive={isActive}
                                        isExpanded={Boolean(expandedItems[itemKey] ?? expandedItems[link.label])}
                                        onToggleExpand={onToggleExpand}
                                        onLinkClick={onLinkClick}
                                        expandedItems={expandedItems}
                                        generatingReport={generatingReport}
                                    />
                                );
                            })}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
