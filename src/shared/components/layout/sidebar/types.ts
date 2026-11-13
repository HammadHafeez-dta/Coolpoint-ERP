import { LucideIcon } from "lucide-react";

export interface SidebarChildLink {
    label: string;
    path?: string;
    action?: string;
    children?: SidebarChildLink[];
}

export interface SidebarLink {
    icon: LucideIcon;
    label: string;
    path?: string;
    action?: string;
    children?: SidebarChildLink[];
}

export type ModuleType = 'hr' | 'crm' | 'user-access' | 'finance' | 'inventory' | 'fms' | 'lesson-assessment' | 'principal' | 'construction';

export interface ModuleConfig {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    dashboardPath: string;
}
