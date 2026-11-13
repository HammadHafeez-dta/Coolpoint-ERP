export type WorkspaceModuleKey = "CRM" | "HRMS" | "UAM";

export const WORKSPACE_MODULES = [
    {
        id: "hrms",
        key: "HRMS",
        aliases: ["HRMS", "HR", "Human Resources", "Human Resources (HRMS)"],
        label: "Human Resources (HRMS)",
        path: "/hr/employees",
        adminOnly: false,
    },
    {
        id: "crm",
        key: "CRM",
        aliases: ["CRM", "Commercial CRM"],
        label: "Commercial CRM",
        path: "/crm",
        adminOnly: false,
    },
    {
        id: "uam",
        key: "UAM",
        aliases: ["UAM", "User Access", "User Access Management", "Access Control"],
        label: "User Access Management",
        path: "/user-access/dashboard",
        adminOnly: true,
    },
] as const;

export const ASSIGNABLE_MODULES = WORKSPACE_MODULES.filter(module => !module.adminOnly);

export const normalizeWorkspaceModule = (value: string | null | undefined): WorkspaceModuleKey | null => {
    const normalized = (value || "").trim().toLocaleLowerCase();
    if (!normalized) return null;
    return WORKSPACE_MODULES.find(module =>
        module.aliases.some(alias => alias.toLocaleLowerCase() === normalized)
    )?.key ?? null;
};

/** Accept both a module list and the legacy comma-separated storage value. */
export const normalizeAssignedModules = (values: readonly string[] | string | null | undefined): string[] => {
    const entries = typeof values === "string" ? values.split(",") : values || [];
    const found = new Set(entries.map(normalizeWorkspaceModule).filter((key): key is WorkspaceModuleKey => key !== null));
    return ASSIGNABLE_MODULES.map(module => module.key).filter(key => found.has(key));
};

export const getAccessibleModuleIds = (
    hasModuleAccess: (software: string) => boolean,
): string[] => ASSIGNABLE_MODULES
    .filter(module => module.aliases.some(hasModuleAccess))
    .map(module => module.id);

export const isSingleModuleUser = (
    isAdmin: boolean,
    hasModuleAccess: (software: string) => boolean,
): boolean => !isAdmin && getAccessibleModuleIds(hasModuleAccess).length === 1;
