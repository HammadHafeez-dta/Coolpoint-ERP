import { CoolpointLoadingBoundary } from "@/shared/components/CoolpointLoader";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useUnsavedRights } from "../hooks/useUnsavedRights";
import {
    Shield,
    Search,
    Users,
    CheckSquare,
    Square,
    RefreshCw,
    Save,
    ChevronRight,
    Eye,
    Plus,
    Edit3,
    Trash2,
    Check,
    ChevronsUpDown,
    AlertCircle,
    Loader2,
    UserCircle,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import "./UserRightsPage.css";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useToast } from "@/shared/components/ui/use-toast";
import { authService } from "@/modules/auth/services/authService";
import { userRightsService, UserRightSave, UserRightsUser } from "../services/userRightsService";
import { usePermissionsContext } from "../hooks/PermissionsProvider";
import { cn } from "@/shared/utils/utils";
import { ASSIGNABLE_MODULES, normalizeAssignedModules, normalizeWorkspaceModule } from "../utils/moduleAccess";
import { restorePageRights } from "../utils/restorePageRights";

// ─── Types ────────────────────────────────────────────────────────────────────

type User = UserRightsUser;

interface FormName {
    id: number;
    software: string;
    mainName?: string;
    rightsName?: string;
}

interface RightsRow {
    formId: number;
    software: string;
    mainName?: string;
    pageName: string;
    enter: boolean;
    addition: boolean;
    updation: boolean;
    deletion: boolean;
}

interface Software {
    softwareNo: number;
    site: string;
    softwareName: string;
    dbSoftwareKey: string;
}

const ACTIVE_MODULES: Software[] = [
    { softwareNo: 5, site: "", softwareName: "Commercial CRM", dbSoftwareKey: "CRM" },
    { softwareNo: 2, site: "", softwareName: "Human Resources (HRMS)",     dbSoftwareKey: "HRMS" },
];

const FALLBACK_PAGES: Record<string, FormName[]> = {
    HRMS: [
        { id: 101, software: "HRMS", mainName: "Define", rightsName: "Employees Page" },
        { id: 102, software: "HRMS", mainName: "Define", rightsName: "Department Page" },
        { id: 103, software: "HRMS", mainName: "Define", rightsName: "Designation Page" },
        { id: 104, software: "HRMS", mainName: "Define", rightsName: "Grade Page" },
        { id: 105, software: "HRMS", mainName: "Define", rightsName: "Location Page" },
        { id: 106, software: "HRMS", mainName: "Define", rightsName: "Shift Page" },
        { id: 107, software: "HRMS", mainName: "Define", rightsName: "Scale Page" },
        { id: 108, software: "HRMS", mainName: "Define", rightsName: "Bank Page" },
        { id: 109, software: "HRMS", mainName: "Transactions", rightsName: "Leave Application" },
        { id: 110, software: "HRMS", mainName: "Transactions", rightsName: "Leave Approval" },
        { id: 111, software: "HRMS", mainName: "Transactions", rightsName: "Manual Attendance" },
        { id: 112, software: "HRMS", mainName: "Transactions", rightsName: "Update Attendance" },
        { id: 113, software: "HRMS", mainName: "Transactions", rightsName: "Process Salary" },
        { id: 114, software: "HRMS", mainName: "Transactions", rightsName: "Loan & Advances" },
        { id: 115, software: "HRMS", mainName: "Transactions", rightsName: "Overtime" },
        { id: 116, software: "HRMS", mainName: "Transactions", rightsName: "Final Settlement" },
        { id: 117, software: "HRMS", mainName: "Reports", rightsName: "Employee Reports" },
        { id: 118, software: "HRMS", mainName: "Reports", rightsName: "Salary Report" },
        { id: 119, software: "HRMS", mainName: "Reports", rightsName: "Daily Attendance Report" },
        { id: 120, software: "HRMS", mainName: "Reports", rightsName: "Leave Register Report" },
    ],
    CRM: [
        { id: 501, software: "CRM", mainName: "Overview", rightsName: "Sales Analytics" },
        { id: 502, software: "CRM", mainName: "Inquiries", rightsName: "HVAC Inquiries" },
        { id: 503, software: "CRM", mainName: "Transactions", rightsName: "Deals Pipeline" },
        { id: 504, software: "CRM", mainName: "Transactions", rightsName: "Project Quotations" },
        { id: 505, software: "CRM", mainName: "Define", rightsName: "Commercial Clients" },
        { id: 506, software: "CRM", mainName: "Transactions", rightsName: "Projects" },
    ]
};

const ACTION_COLS = [
    { key: "enter",    icon: Eye,      label: "View",   color: "text-blue-500"   },
    { key: "addition", icon: Plus,     label: "Add",    color: "text-green-500"  },
    { key: "updation", icon: Edit3,    label: "Edit",   color: "text-amber-500"  },
    { key: "deletion", icon: Trash2,   label: "Delete", color: "text-red-500"    },
] as const;

type ActionKey = typeof ACTION_COLS[number]["key"];

const resolveMainGroup = (form: FormName, softwareKey: string): string => {
    const raw = (form.mainName || "").trim();

    // Standard known section names
    if (["Define", "Transactions", "Reports", "Console", "System", "Administration", "Inquiries", "Overview"].includes(raw)) {
        return raw;
    }
    if (raw.toLowerCase() === "transaction") return "Transactions";
    if (raw.toLowerCase() === "report") return "Reports";

    const id = form.id;
    const rightsName = form.rightsName || "";
    const nameLower = (rightsName || raw).toLowerCase();

    // Heuristics by name
    if (nameLower.startsWith("define") || nameLower.includes("registration") || nameLower.includes("activate") || nameLower.includes("events")) {
        return "Define";
    }
    if (nameLower.includes("create") || nameLower.includes("receive") || nameLower.includes("promotion") || 
        nameLower.includes("concession") || nameLower.includes("assign") || nameLower.includes("marks") ||
        nameLower.includes("advances") || nameLower.includes("approval") || nameLower.includes("attendance")) {
        return "Transactions";
    }
    if (nameLower.includes("list") || nameLower.includes("report") || nameLower.includes("challan") || 
        nameLower.includes("balance") || nameLower.includes("ledger") || nameLower.includes("defaulter") ||
        nameLower.includes("detail") || nameLower.includes("summary")) {
        return "Reports";
    }
    if (nameLower.includes("password") || nameLower.includes("user") || nameLower.includes("backup")) {
        return "System / Administration";
    }

    return "General";
};

// ─── Component ────────────────────────────────────────────────────────────────

const UserRightsPage = () => {
    const { toast } = useToast();
    const { refresh: refreshPermissions } = usePermissionsContext();
    const userSite = authService.getSite();
    const currentYear = new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Asia/Karachi" }).format(new Date());
    const [params] = useSearchParams(); const navigate = useNavigate(); const cache = useQueryClient();
    const requestedNo = params.get("userNo"); const requestedSoftware = params.get("software");
    const setup = params.get("setup") === "1";
    const canonicalSoftware = normalizeWorkspaceModule(requestedSoftware);
    const invalidParams = (requestedNo !== null && (!/^[1-9]\d*$/.test(requestedNo) || !Number.isSafeInteger(Number(requestedNo))))
        || (requestedSoftware !== null && !ASSIGNABLE_MODULES.some(m => m.key === canonicalSoftware))
        || (params.has("setup") && !["0", "1"].includes(params.get("setup")!))
        || (params.has("modules") && params.get("modules")!.split(",").some(m => !ASSIGNABLE_MODULES.some(x => x.key === normalizeWorkspaceModule(m))))
        || (setup && !requestedNo);

    // ── State ─────────────────────────────────────────────────────────────────

    const [users, setUsers] = useState<User[]>([]);
    const [softwares, setSoftwares] = useState<Software[]>([]);
    const [formNames, setFormNames] = useState<FormName[]>([]);
    const [rightsMatrix, setRightsMatrix] = useState<Record<string, RightsRow>>({});

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedSoftware, setSelectedSoftware] = useState<string>("");

    const [userSearch, setUserSearch] = useState("");
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pageSearch, setPageSearch] = useState("");

    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [isLoadingSoftwares, setIsLoadingSoftwares] = useState(true);
    const [isLoadingRights, setIsLoadingRights] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [isDirty, setIsDirty] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    const [userModules, setUserModules] = useState<string[]>([]);
    const [isModuleGranted, setIsModuleGranted] = useState(false);
    const [isUpdatingModule, setIsUpdatingModule] = useState(false);
    const [selectionError, setSelectionError] = useState(""); const [usersError, setUsersError] = useState(false);
    const [rightsError, setRightsError] = useState(""); const [saveError, setSaveError] = useState("");
    const [setupModules, setSetupModules] = useState<string[]>([]);
    const [savedViews, setSavedViews] = useState<Record<string, number>>({});
    const [summaryError, setSummaryError] = useState(false); const [summaryBusy, setSummaryBusy] = useState(false);
    const rightsRequest = useRef(0); const summaryRequest = useRef(0);
    const confirmDiscard = useUnsavedRights(isDirty, isSaving || isUpdatingModule, () => setIsDirty(false));

    // ── Data Loading ──────────────────────────────────────────────────────────

    const mountedRef = useRef(false);

    const loadUsers = useCallback(async () => {
        setIsLoadingUsers(true);
        setUsersError(false);
        try {
            const data = await userRightsService.getAllUsers();
            if (!mountedRef.current) return;
            setUsers(data);
        } catch {
            if (!mountedRef.current) return;
            setUsersError(true);
            toast({ variant: "destructive", title: "Error", description: "Failed to load users." });
        } finally {
            if (mountedRef.current) setIsLoadingUsers(false);
        }
    }, [toast]);

    const loadSoftwares = useCallback(async () => {
        setIsLoadingSoftwares(true);
        try {
            const data = await userRightsService.getSoftwares();
            if (!mountedRef.current) return;
            if (data && data.length > 0) {
                const activeByKey = new Map<string, Software>();
                data.forEach(item => {
                    const dbKey = normalizeWorkspaceModule(item.softwareName);
                    if (!dbKey || dbKey === "UAM" || activeByKey.has(dbKey)) return;
                    const module = ASSIGNABLE_MODULES.find(candidate => candidate.key === dbKey);
                    if (!module) return;
                    activeByKey.set(dbKey, { ...item, softwareName: module.label, dbSoftwareKey: dbKey });
                });
                const combined = ASSIGNABLE_MODULES.map(module => activeByKey.get(module.key)
                    || ACTIVE_MODULES.find(fallback => fallback.dbSoftwareKey === module.key)!);
                setSoftwares(combined);
                if (combined.length > 0) setSelectedSoftware(current => current || combined[0].dbSoftwareKey);
            } else {
                setSoftwares(ACTIVE_MODULES);
                setSelectedSoftware(current => current || ACTIVE_MODULES[0].dbSoftwareKey);
            }
        } catch {
            if (!mountedRef.current) return;
            setSoftwares(ACTIVE_MODULES);
            setSelectedSoftware(current => current || ACTIVE_MODULES[0].dbSoftwareKey);
        } finally {
            if (mountedRef.current) setIsLoadingSoftwares(false);
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        let mounted = true;
        Promise.allSettled([loadUsers(), loadSoftwares()]).then(() => {
            if (mounted) setInitialLoading(false);
        });
        return () => { mounted = false; mountedRef.current = false; };
    }, [loadUsers, loadSoftwares]);

    const getUserIdStr = (u: User | null | undefined): string => {
        if (!u) return "";
        return u.userId || u.userID || "";
    };

    useEffect(() => {
        if (isLoadingUsers) return;
        if (invalidParams) { setSelectedUser(null); setSelectionError("This permission setup link is invalid. Choose an account from Existing Users."); return; }
        if (usersError) { setSelectedUser(null); setSelectionError("The user list could not be loaded. Retry before assigning permissions."); return; }
        if (!requestedNo) { setSelectionError(""); return; }
        const user = users.find(item => item.userNo === Number(requestedNo));
        if (!user) { setSelectedUser(null); setSelectionError("This account was not found or has been deleted. Choose an account from Existing Users."); return; }
        setSelectionError(""); setSelectedUser(user);
        if (canonicalSoftware && canonicalSoftware !== "UAM") setSelectedSoftware(canonicalSoftware);
    }, [users, usersError, isLoadingUsers, requestedNo, canonicalSoftware, invalidParams]);

    const loadSetupSummary = useCallback(async (user: User) => {
        const request = ++summaryRequest.current; setSummaryBusy(true); setSummaryError(false); setSavedViews({});
        try {
            const children = await userRightsService.getUserModules(user.userNo);
            const modules = normalizeAssignedModules(children.filter(m => (m.site || "").trim().toUpperCase() === userSite.trim().toUpperCase()).map(m => m.softwareName || ""));
            const views = await Promise.all(modules.map(async module => [module, (await userRightsService.getSavedRights(getUserIdStr(user), module, userSite, currentYear)).filter(row => row.enter).length] as const));
            if (request !== summaryRequest.current || !mountedRef.current) return;
            setSetupModules(modules); setSavedViews(Object.fromEntries(views));
            if (!requestedSoftware && modules.length) setSelectedSoftware(current => modules.includes(current) ? current : modules[0]);
        } catch { if (request === summaryRequest.current && mountedRef.current) { setSummaryError(true); setSetupModules([]); } }
        finally { if (request === summaryRequest.current && mountedRef.current) setSummaryBusy(false); }
    }, [userSite, currentYear, requestedSoftware]);
    useEffect(() => { const counter = summaryRequest; if (setup && selectedUser) void loadSetupSummary(selectedUser); return () => { counter.current++; }; }, [setup, selectedUser, loadSetupSummary]);

    const loadRightsForUser = useCallback(async (user: User, softwareKey: string) => {
        const uid = getUserIdStr(user);
        if (!uid || !softwareKey) return;
        const request = ++rightsRequest.current;
        setIsLoadingRights(true);
        setIsDirty(false);
        setRightsError(""); setSaveError(""); setRightsMatrix({}); setFormNames([]);
        try {
            // 1. Load module access from tbl_Users_Child
            if (user.userNo) {
                try {
                    const mods = await userRightsService.getUserModules(user.userNo);
                    if (request !== rightsRequest.current || !mountedRef.current) return;
                    const modNames = (mods || []).filter(m => (m.site || "").trim().toUpperCase() === userSite.trim().toUpperCase()).map(m => (m.softwareName || "").toLowerCase());
                    setUserModules(modNames);
                    setIsModuleGranted(modNames.some(name => normalizeWorkspaceModule(name) === normalizeWorkspaceModule(softwareKey)));
                } catch {
                    throw new Error("Module access could not be loaded.");
                }
            }

            // 2. Load pages (from DB or fallback catalog)
            let forms: FormName[] = [];
            try {
                forms = await userRightsService.getFormNames(softwareKey);
            } catch {
                forms = [];
            }

            if (!forms || forms.length === 0) {
                forms = FALLBACK_PAGES[softwareKey] || [];
            }

            // 3. Load saved page rights
            const rights = await userRightsService.getSavedRights(uid, softwareKey, userSite, currentYear);
            if (request !== rightsRequest.current || !mountedRef.current) return;
            setFormNames(forms);

            // Build the rights matrix: key = pageName
            const matrix: Record<string, RightsRow> = {};
            forms.forEach(form => {
                const pageName = form.rightsName || form.mainName || "";
                const groupName = resolveMainGroup(form, softwareKey);
                matrix[pageName] = {
                    formId:    form.id,
                    software:  softwareKey,
                    mainName:  groupName,
                    pageName:  pageName,
                    ...restorePageRights(rights || [], softwareKey, pageName),
                };
            });
            setRightsMatrix(matrix);

            // Auto-expand all groups
            const groups: Record<string, boolean> = {};
            Object.values(matrix).forEach(r => { if (r.mainName) groups[r.mainName] = true; });
            setExpandedGroups(groups);
        } catch {
            if (request !== rightsRequest.current || !mountedRef.current) return;
            setRightsError("Permissions could not be loaded. Reload before making changes.");
            toast({ variant: "destructive", title: "Error", description: "Failed to load rights." });
        } finally {
            if (request === rightsRequest.current && mountedRef.current) setIsLoadingRights(false);
        }
    }, [userSite, currentYear, toast]);

    const handleToggleModuleAccess = async () => {
        if (!selectedUser || !selectedSoftware) return;
        // Changing module access does not replace the page matrix. Retain its
        // unsaved selections, including when the module request fails.
        setIsUpdatingModule(true);
        try {
            const moduleSite = selectedUser.site || userSite;
            if (isModuleGranted) {
                const targetKey = normalizeWorkspaceModule(selectedSoftware);
                const remaining = normalizeAssignedModules(userModules)
                    .filter(module => module !== targetKey);
                await userRightsService.deleteUserModules(selectedUser.userNo);
                for (const module of remaining) {
                    await userRightsService.saveUserModule(selectedUser.userNo, module, moduleSite);
                }
                setUserModules(remaining.map(module => module.toLowerCase()));
                setIsModuleGranted(false);
                toast({ title: "Module Access Updated", description: `Revoked access to ${selectedSoftware} for this user.` });
            } else {
                await userRightsService.saveUserModule(selectedUser.userNo, selectedSoftware, moduleSite);
                setUserModules(current => [...new Set([...current, selectedSoftware.toLowerCase()])]);
                setIsModuleGranted(true);
                toast({ title: "Module Access Granted", description: `Granted access to ${selectedSoftware}.` });
            }
        } catch {
            toast({ variant: "destructive", title: "Error", description: "Failed to update module access." });
        } finally {
            setIsUpdatingModule(false);
            if (setup && selectedUser) void loadSetupSummary(selectedUser);
        }
    };

    useEffect(() => {
        const counter = rightsRequest;
        if (selectedUser && selectedSoftware) {
            loadRightsForUser(selectedUser, selectedSoftware);
        }
        return () => { counter.current++; };
    }, [selectedUser, selectedSoftware, loadRightsForUser]);

    // ── User Selection ────────────────────────────────────────────────────────

    const filteredUsers = useMemo(() =>
        (users || []).filter(u => {
            const uid = getUserIdStr(u).toLowerCase();
            const uname = (u.userName || "").toLowerCase();
            const search = (userSearch || "").toLowerCase();
            return uid.includes(search) || uname.includes(search);
        }),
        [users, userSearch]
    );

    // ── Matrix Edit ───────────────────────────────────────────────────────────

    const toggleCell = (pageName: string, key: Exclude<ActionKey, "export">) => {
        setRightsMatrix(prev => ({
            ...prev,
            [pageName]: { ...prev[pageName], [key]: !prev[pageName][key] },
        }));
        setIsDirty(true);
    };

    const toggleRow = (pageName: string, checked: boolean) => {
        setRightsMatrix(prev => ({
            ...prev,
            [pageName]: {
                ...prev[pageName],
                enter: checked, addition: checked, updation: checked, deletion: checked,
            },
        }));
        setIsDirty(true);
    };

    const toggleAllInGroup = (group: string, checked: boolean) => {
        setRightsMatrix(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(k => {
                if (next[k].mainName === group) {
                    next[k] = { ...next[k], enter: checked, addition: checked, updation: checked, deletion: checked };
                }
            });
            return next;
        });
        setIsDirty(true);
    };

    const toggleAllForAction = (action: Exclude<ActionKey, "export">, checked: boolean) => {
        setRightsMatrix(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(k => { next[k] = { ...next[k], [action]: checked }; });
            return next;
        });
        setIsDirty(true);
    };

    // ── Save ──────────────────────────────────────────────────────────────────

    const handleSave = async () => {
        if (!selectedUser || isSaving || isLoadingRights || rightsError) return;
        const targetUserId = getUserIdStr(selectedUser);
        if (!targetUserId) return;
        setIsSaving(true);
        setSaveError("");
        try {
            const rights: UserRightSave[] = Object.values(rightsMatrix).map(row => ({
                userID:    targetUserId,
                year:      currentYear,
                software:  row.software,
                formName:  row.pageName,
                site:      userSite,
                enter:     row.enter,
                addition:  row.addition,
                deletion:  row.deletion,
                updation:  row.updation,
            }));

            await userRightsService.batchSaveRights(targetUserId, userSite, rights);

            // If saving for the current logged-in user, refresh their permission store
            const currentUserId = authService.getCurrentUser()?.username || "";
            if (targetUserId.toLowerCase() === currentUserId.toLowerCase()) {
                await refreshPermissions();
            }

            setIsDirty(false);
            setSavedViews(current => ({ ...current, [selectedSoftware]: rights.filter(row => row.enter).length }));
            if (setup) await loadSetupSummary(selectedUser);
            await cache.invalidateQueries({ queryKey: ["uam-dashboard-assignments"] });
            await cache.invalidateQueries({ queryKey: ["crm", "projects"] });
            toast({ title: "Saved", description: `Rights for ${targetUserId} saved successfully.` });
        } catch {
            setSaveError("Could not save permissions. Your selections are still here; try Save again.");
            toast({ variant: "destructive", title: "Save Failed", description: "Could not save user rights." });
        } finally {
            setIsSaving(false);
        }
    };

    // ── Filtered / Grouped Matrix ─────────────────────────────────────────────

    const groupedRows = useMemo(() => {
        const rows = Object.values(rightsMatrix).filter(r =>
            !pageSearch || r.pageName.toLowerCase().includes(pageSearch.toLowerCase())
        );
        const groups: Record<string, RightsRow[]> = {};
        rows.forEach(r => {
            const g = r.mainName || "General";
            if (!groups[g]) groups[g] = [];
            groups[g].push(r);
        });

        // Sort groups in logical order
        const groupOrder = ["Define", "Transactions", "Reports", "Console", "System / Administration", "General"];
        const sortedGroups: Record<string, RightsRow[]> = {};
        
        groupOrder.forEach(key => {
            if (groups[key]) sortedGroups[key] = groups[key];
        });
        Object.keys(groups).forEach(key => {
            if (!sortedGroups[key]) sortedGroups[key] = groups[key];
        });

        return sortedGroups;
    }, [rightsMatrix, pageSearch]);

    // ── isRowChecked helper ───────────────────────────────────────────────────

    const isRowFullyChecked = (row: RightsRow) =>
        row.enter && row.addition && row.updation && row.deletion;

    const isGroupFullyChecked = (rows: RightsRow[]) =>
        rows.every(isRowFullyChecked);

    const selectUser = (user: User) => {
        if (confirmDiscard()) navigate(`/user-access/user-rights?${new URLSearchParams({ userNo: String(user.userNo), ...(setup ? { setup: "1" } : {}) })}`);
    };
    const selectModule = (software: string) => {
        if (!selectedUser || !confirmDiscard()) return;
        const next = new URLSearchParams(params); next.set("userNo", String(selectedUser.userNo)); next.set("software", software);
        navigate(`/user-access/user-rights?${next}`);
    };
    const setupComplete = !summaryBusy && !summaryError && setupModules.length > 0 && setupModules.every(module => savedViews[module] > 0);
    const finishSetup = () => {
        if (!setupComplete && !window.confirm("Permission setup is incomplete. The account is saved, but some selected modules have no configured page access. Leave setup for later?")) return;
        if (!confirmDiscard()) return;
        if (!setupComplete) toast({ title: "Account saved — setup incomplete", description: "Return through Permissions in Existing Users to finish assigning page access." });
        navigate("/user-access/existing-users");
    };

    // ─────────────────────────────────────────────────────────────────────────

    const selectedViewCount = Object.values(rightsMatrix).filter(row => row.enter).length;
    const allChecked = Object.values(rightsMatrix).length > 0 && Object.values(rightsMatrix).every(isRowFullyChecked);
    const busy = isSaving || isUpdatingModule;
    const toggleButton = (row: RightsRow, action: typeof ACTION_COLS[number]) => (
        <button type="button" aria-label={`${action.label} ${row.pageName}`} aria-pressed={row[action.key]}
            disabled={busy} onClick={() => toggleCell(row.pageName, action.key)}
            className={cn("rights-check", row[action.key] && "rights-check--selected")}>
            {row[action.key] ? <Check className="size-4" strokeWidth={2.5} /> : <span className="size-4 rounded-[4px] border border-muted-foreground/50" />}
        </button>
    );

    return (
        <div className="rights-page flex h-screen min-w-0 flex-col overflow-hidden bg-background text-foreground">
            <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b bg-card px-4 py-3 sm:py-4 sm:px-6">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden sm:flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Shield className="size-5" /></div>
                    <div><h1 className="text-base sm:text-lg font-semibold tracking-tight">User Rights</h1><p className="hidden text-xs text-muted-foreground sm:block">Manage module and page access</p></div>
                </div>
                <div className="flex items-center gap-3">
                    {isDirty && <span role="status" className="text-xs font-medium text-amber-700 dark:text-amber-300">Unsaved changes</span>}
                    <Button className="h-10 gap-2" onClick={handleSave} disabled={!selectedUser || !selectedSoftware || busy || !isDirty || isLoadingRights || !!rightsError}>
                        {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}Save Rights
                    </Button>
                </div>
            </header>
            <CoolpointLoadingBoundary loading={initialLoading} label="Loading access control" className="coolpoint-loading-boundary--fill">
            <main className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto flex min-h-full max-w-[1500px] flex-col px-4 py-5 sm:px-6 sm:py-6">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <h2 className="break-words text-base font-semibold">{selectedUser ? selectedUser.userName || getUserIdStr(selectedUser) : "Choose an account"}</h2>
                            <p className="mt-1 break-words text-xs text-muted-foreground">{selectedUser ? `${getUserIdStr(selectedUser)} · ` : ""}Site: {userSite}</p>
                        </div>
                        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                            <PopoverTrigger asChild><Button variant="outline" className="h-9 gap-2 px-3" aria-label="Select user"><Users className="size-4" />{selectedUser ? "Change user" : "Select user"}<ChevronsUpDown className="hidden size-3.5 text-muted-foreground sm:block" /></Button></PopoverTrigger>
                            <PopoverContent align="end" className="w-[min(360px,calc(100vw-32px))] p-2">
                                <label className="sr-only" htmlFor="rights-user-search">Search users</label>
                                <div className="relative"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input id="rights-user-search" value={userSearch} onChange={event => setUserSearch(event.target.value)} placeholder="Search users..." className="h-10 pl-9" /></div>
                                <div className="mt-2 max-h-72 overflow-y-auto" aria-label="Accounts">
                                    {isLoadingUsers ? <p role="status" className="p-4 text-sm">Loading users…</p> : filteredUsers.length ? filteredUsers.map(user => <button type="button" key={user.userNo} onClick={() => { selectUser(user); setPickerOpen(false); }} aria-pressed={selectedUser?.userNo === user.userNo} className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left hover:bg-muted focus-visible:bg-muted focus-visible:outline-none">
                                        <UserCircle className="size-5 shrink-0 text-muted-foreground" /><span className="min-w-0 flex-1"><span className="block break-words text-sm font-medium">{user.userName || getUserIdStr(user)}</span><span className="block break-words text-xs text-muted-foreground">{getUserIdStr(user)}</span></span>{selectedUser?.userNo === user.userNo && <Check className="size-4 text-primary" />}
                                    </button>) : <p className="p-4 text-sm text-muted-foreground">No users found. Try another name or login ID.</p>}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {selectionError && <div role="alert" className="mb-5 rounded-xl border border-destructive/30 bg-card p-4 text-sm"><p className="text-destructive">{selectionError}</p><div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => navigate("/user-access/existing-users")}>Existing Users</Button>{usersError && <Button variant="outline" size="sm" onClick={() => { void loadUsers(); }}>Retry user list</Button>}</div></div>}

                    {setup && selectedUser && <section aria-label="Permission setup progress" className="mb-5 rounded-xl border bg-card px-4 py-4 sm:px-5">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                            <div className="min-w-0"><h3 className="text-sm font-semibold">{setupComplete ? "Permissions configured" : "Account saved — configure permissions"}</h3><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Choose pages below, then save. No automatic page rights.</p></div>
                            <Button size="sm" variant={setupComplete ? "default" : "outline"} disabled={busy} onClick={finishSetup}>{setupComplete ? "Finish setup" : "Finish later"}</Button>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                            {summaryBusy ? <p role="status" className="text-muted-foreground">Checking saved page access…</p> : summaryError ? <div role="alert" className="text-destructive">Saved access could not be checked. <Button size="sm" variant="outline" onClick={() => { void loadSetupSummary(selectedUser); }}>Retry summary</Button></div> : setupModules.length ? setupModules.map(module => <span key={module} className="inline-flex items-center gap-1.5 font-medium">{savedViews[module] > 0 ? <Check className="size-3.5 text-primary" /> : <span className="size-2 rounded-full bg-amber-500" />}{module}: {savedViews[module] > 0 ? `${savedViews[module]} ${savedViews[module] === 1 ? "page" : "pages"} with View` : "No page access"}</span>) : <p className="text-muted-foreground">No modules are assigned at this site. Grant module access below.</p>}
                            <span role="status" className={cn("text-muted-foreground", setupComplete && "sr-only")}>{setupComplete ? "Each selected module has saved page access." : "Setup incomplete. Save View for each module."}</span>
                        </div>
                    </section>}

                    {!selectedUser ? !selectionError && <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center"><Shield className="size-9 text-primary/50" /><h3 className="text-base font-semibold">Select a user to manage access</h3><p className="max-w-sm text-sm text-muted-foreground">Search by name or login ID using the account picker above.</p></div> : <>
                        <div className="mb-4 flex min-w-0 flex-wrap items-center justify-between gap-3">
                            <div className="flex max-w-full gap-1 overflow-x-auto rounded-lg bg-muted p-1" aria-label="Modules">{isLoadingSoftwares ? <Loader2 className="m-2 size-4 animate-spin" /> : softwares.map(sw => <button type="button" key={sw.dbSoftwareKey} aria-label={sw.softwareName} aria-pressed={selectedSoftware === sw.dbSoftwareKey} onClick={() => selectModule(sw.dbSoftwareKey)} className={cn("min-h-10 shrink-0 rounded-md px-3 text-sm font-medium transition-colors", selectedSoftware === sw.dbSoftwareKey ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}><span className="sm:hidden">{sw.dbSoftwareKey}</span><span className="hidden sm:inline">{sw.softwareName}</span></button>)}</div>
                            <details className="rights-module-settings relative text-xs"><summary className="cursor-pointer rounded-md px-2 py-2 text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{isModuleGranted ? "Module access granted" : "No module access"} · Manage</summary><div className="mt-2 max-w-sm rounded-lg border bg-card p-4"><p className="mb-3 leading-relaxed text-muted-foreground">Module access shows {selectedSoftware} in the workspace picker. Page rights below control what this user can open and change.</p><Button size="sm" variant="outline" onClick={handleToggleModuleAccess} disabled={busy || isLoadingRights || !!rightsError}>{isUpdatingModule && <Loader2 className="mr-2 size-3 animate-spin" />}{isModuleGranted ? "Revoke Module Access" : "Grant Module Access"}</Button></div></details>
                        </div>
                        <section aria-label="Page permissions" className="overflow-hidden rounded-xl border bg-card">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-5">
                                <div><h3 className="text-sm font-semibold">Page permissions</h3><p className="mt-1 text-xs text-muted-foreground">View enabled on {selectedViewCount} of {Object.keys(rightsMatrix).length} {Object.keys(rightsMatrix).length === 1 ? "page" : "pages"}{isDirty ? " · Unsaved" : ""}</p></div>
                                <div className="flex w-full items-center gap-2 sm:w-auto"><div className="relative min-w-0 flex-1 sm:w-60"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input aria-label="Search pages" value={pageSearch} onChange={event => setPageSearch(event.target.value)} placeholder="Search pages..." className="h-10 pl-9" /></div><Button variant="outline" className="h-10 gap-2" disabled={busy} onClick={() => { if (selectedUser && selectedSoftware && confirmDiscard()) void loadRightsForUser(selectedUser, selectedSoftware); }}><RefreshCw className="size-4" /><span className="sr-only sm:not-sr-only">Reload</span></Button></div>
                            </div>
                            <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-2 border-b px-4 py-3 text-xs leading-relaxed text-muted-foreground sm:px-5"><details><summary className="w-fit cursor-pointer font-medium text-foreground">Permission guide</summary><p className="mt-2 max-w-2xl">View opens a page. Add, Edit and Delete control what the user can do. Export follows View in the current rights system. Column checkboxes apply to all pages. Access is saved separately for each module.</p></details>{selectedSoftware === "CRM" && <p>Projects: View + Edit for assignees.</p>}</div>
                            {rightsError && <div role="alert" className="border-b p-4 text-sm text-destructive">{rightsError}<Button size="sm" variant="outline" className="ml-2" onClick={() => { if (selectedUser && confirmDiscard()) void loadRightsForUser(selectedUser, selectedSoftware); }}>Reload permissions</Button></div>}
                            {saveError && <p role="alert" className="border-b p-4 text-sm text-destructive">{saveError}</p>}
                            {isLoadingRights ? <div role="status" className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="size-5 animate-spin" />Loading page permissions…</div> : !Object.keys(groupedRows).length ? <div className="py-16 text-center"><AlertCircle className="mx-auto mb-3 size-6 text-muted-foreground" /><p className="text-sm">{pageSearch ? "No matching pages" : "No pages available"}</p><p className="mt-1 text-xs text-muted-foreground">{pageSearch ? "Try another page name." : "Check the module’s page catalog and reload."}</p></div> : <table className="rights-table w-full text-sm">
                                <thead className="bg-muted/50"><tr><th scope="col" className="px-5 py-3 text-left"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-medium text-muted-foreground">Page</span><button type="button" aria-pressed={allChecked} disabled={busy} onClick={() => { Object.values(rightsMatrix).forEach(row => toggleRow(row.pageName, !allChecked)); }} className="rounded-md px-2 py-2 text-xs font-medium text-primary hover:bg-primary/5">{allChecked ? "Clear all permissions" : "All permissions"}</button></div></th>{ACTION_COLS.map(action => <th scope="col" key={action.key} className="w-24 px-2 py-3 text-center"><div className="flex flex-col items-center gap-1"><span className="text-xs font-medium">{action.label}</span><button type="button" aria-label={`Toggle all ${action.label}`} aria-pressed={Object.values(rightsMatrix).length > 0 && Object.values(rightsMatrix).every(row => row[action.key])} disabled={busy} onClick={() => toggleAllForAction(action.key, !Object.values(rightsMatrix).every(row => row[action.key]))} className="rights-check text-muted-foreground">{Object.values(rightsMatrix).every(row => row[action.key]) ? <CheckSquare className="size-4 text-primary" /> : <Square className="size-4" />}</button></div></th>)}</tr></thead>
                                <tbody>{Object.entries(groupedRows).map(([group, rows]) => <React.Fragment key={group}>
                                    <tr className="rights-group border-y bg-muted/40"><td colSpan={5} className="px-4 py-2 sm:px-5"><div className="flex items-center justify-between gap-2"><button type="button" aria-expanded={!!expandedGroups[group]} onClick={() => setExpandedGroups(current => ({ ...current, [group]: !current[group] }))} className="flex min-h-9 items-center gap-2 text-xs font-semibold"><ChevronRight className={cn("size-3.5 transition-transform", expandedGroups[group] && "rotate-90")} />{group}<span className="font-normal text-muted-foreground">({rows.length})</span></button><button type="button" disabled={busy} onClick={() => toggleAllInGroup(group, !isGroupFullyChecked(rows))} className="min-h-9 rounded-md px-2 text-xs font-medium text-muted-foreground hover:bg-muted">{isGroupFullyChecked(rows) ? "Clear group" : "Select group"}</button></div></td></tr>
                                    {expandedGroups[group] && rows.map(row => <tr key={row.pageName} className="rights-permission-row border-b last:border-b-0 hover:bg-muted/20"><th scope="row" className="rights-page-name px-4 py-3 text-left font-medium sm:px-5"><span className="break-words">{row.pageName}</span></th>{ACTION_COLS.map(action => <td key={action.key} className="px-2 py-2 text-center"><span className="rights-mobile-action text-xs text-muted-foreground">{action.label}</span>{toggleButton(row, action)}</td>)}</tr>)}
                                </React.Fragment>)}</tbody>
                            </table>}
                        </section>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pb-2 text-xs text-muted-foreground"><p>{isDirty ? "Your changes have not been saved." : "Changes apply after you save this module."}</p>{isDirty && <Button variant="ghost" size="sm" disabled={busy} onClick={() => { if (confirmDiscard()) void loadRightsForUser(selectedUser, selectedSoftware); }}>Discard changes</Button>}</div>
                    </>}
                </div>
            </main>
            </CoolpointLoadingBoundary>
        </div>
    );
};

export default UserRightsPage;
