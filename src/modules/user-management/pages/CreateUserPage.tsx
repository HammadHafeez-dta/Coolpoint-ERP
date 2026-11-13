import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    UserPlus,
    Save,
    RotateCcw,
    LogOut,
    Eye,
    EyeOff,
    Shield,
    User,
    Lock,
    Hash,
    UserCheck,
    CheckCircle2,
    Loader2,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { useToast } from "@/shared/components/ui/use-toast";
import { authService } from "@/modules/auth/services/authService";
import {
    userService,
    UserTypeItem,
    UserListItem,
    UserSavePayload,
} from "../services/userService";
import { ASSIGNABLE_MODULES, normalizeAssignedModules } from "../utils/moduleAccess";
import { userRightsService } from "../services/userRightsService";
import { userRightsLink } from "../utils/userSetup";
import { useQueryClient } from "@tanstack/react-query";

type PageMode = "Add" | "Edit";

const MAX_PLAINTEXT_PASSWORD_LENGTH = 20; // 20 chars encrypted produces <= 79 chars, safely fitting DB varchar(100)
const MAX_LOGIN_ID_LENGTH = 10;
const MAX_FULL_NAME_LENGTH = 50;

const getResponseErrorMessage = (error: unknown): string | undefined => {
    if (typeof error !== "object" || error === null || !("response" in error)) return undefined;
    const response = error.response;
    if (typeof response !== "object" || response === null || !("data" in response)) return undefined;
    const data = response.data;
    if (typeof data !== "object" || data === null || !("message" in data)) return undefined;
    return typeof data.message === "string" ? data.message : undefined;
};

export const CreateUserPage: React.FC = () => {
    const navigate = useNavigate();
    const cache = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const { toast } = useToast();
    const currentSite = authService.getSite() || "";
    const contentScrollRef = useRef<HTMLDivElement>(null);

    const userNoParam = searchParams.get("userNo");

    // ── Form State ────────────────────────────────────────────────────────────
    const [mode, setMode] = useState<PageMode>("Add");
    const [userNo, setUserNo] = useState<number>(0);
    const [userId, setUserId] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [userLevel, setUserLevel] = useState<string>("U"); // 'A' or 'U'

    // Retained for edit mode to preserve existing password & site if unchanged
    const [loadedUser, setLoadedUser] = useState<UserListItem | null>(null);

    // ── UI / Aux State ────────────────────────────────────────────────────────
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [userTypes, setUserTypes] = useState<UserTypeItem[]>([]);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const [moduleAccess, setModuleAccess] = useState<string>("");
    const [originalModule, setOriginalModule] = useState<string>("");
    const userLoadRequestsRef = useRef<Map<number, Promise<boolean>>>(new Map());

    // ── Data Fetching ─────────────────────────────────────────────────────────

    const loadUserTypes = useCallback(async () => {
        try {
            const types = await userService.getUserTypes();
            if (types && types.length > 0) {
                setUserTypes(types);
            } else {
                setUserTypes([
                    { userNo: 1, userLevel: "A", userType: "Administrator" },
                    { userNo: 2, userLevel: "U", userType: "Limited" },
                ]);
            }
        } catch {
            setUserTypes([
                { userNo: 1, userLevel: "A", userType: "Administrator" },
                { userNo: 2, userLevel: "U", userType: "Limited" },
            ]);
        }
    }, []);

    const loadAllUsers = useCallback(async (): Promise<UserListItem[]> => {
        try {
            const list = await userService.getAllUsers();
            return list || [];
        } catch {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load user list.",
            });
            return [];
        }
    }, [toast]);

    const calculateNextUserNo = useCallback(async (): Promise<number> => {
        try {
            const siteMax = await userService.getMaxNo(currentSite);
            const users = await loadAllUsers();
            const globalMax = users.length > 0 ? Math.max(...users.map((u) => u.userNo), 0) + 1 : 1;
            const safeMax = Math.max(siteMax || 1, globalMax);
            setUserNo(safeMax);
            return safeMax;
        } catch {
            const fallback = 1;
            setUserNo(fallback);
            return fallback;
        }
    }, [currentSite, loadAllUsers]);

    const loadUserForEdit = useCallback((targetNo: number): Promise<boolean> => {
        const existingRequest = userLoadRequestsRef.current.get(targetNo);
        if (existingRequest) return existingRequest;

        const request = (async (): Promise<boolean> => {
            try {
                const detailed = await userService.getUser(targetNo);
                setLoadedUser(detailed);
                setMode("Edit");
                setUserNo(detailed.userNo);
                setUserId(detailed.userId || detailed.userID || "");
                setUserName(detailed.userName || "");
                setPassword(""); // Leave blank to keep current password
                setUserLevel((detailed.userLevel || "").trim().toUpperCase() === "A" ? "A" : "U");
                setShowPassword(false);
                try {
                    const mods = await userRightsService.getUserModules(detailed.userNo);
                    const names = (mods || []).filter(m => (m.site || "").trim().toUpperCase() === currentSite.trim().toUpperCase()).map((m) => (m.softwareName || "").trim()).filter(Boolean);
                    const current = normalizeAssignedModules(names).join(",");
                    setModuleAccess(current);
                    setOriginalModule(current);
                } catch {
                    setModuleAccess("");
                    setOriginalModule("");
                }
                contentScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                toast({
                    title: "User Loaded",
                    description: `Editing user #${detailed.userNo} (${detailed.userId || detailed.userID}).`,
                });
                return true;
            } catch (err: unknown) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: getResponseErrorMessage(err) || `Failed to load user #${targetNo}.`,
                });
                return false;
            } finally {
                userLoadRequestsRef.current.delete(targetNo);
            }
        })();
        userLoadRequestsRef.current.set(targetNo, request);
        return request;
    }, [toast, currentSite]);

    // Initial Mount & Query Param Handling
    useEffect(() => {
        loadUserTypes();
        if (userNoParam) {
            const parsedNo = parseInt(userNoParam, 10);
            if (!isNaN(parsedNo) && parsedNo > 0) {
                loadUserForEdit(parsedNo);
            } else {
                calculateNextUserNo();
            }
        } else {
            calculateNextUserNo();
        }
    }, [userNoParam, loadUserTypes, calculateNextUserNo, loadUserForEdit]);

    // ── Form Handlers ─────────────────────────────────────────────────────────

    const handleSwitchToAddMode = async () => {
        setSearchParams({});
        setMode("Add");
        setLoadedUser(null);
        setUserId("");
        setUserName("");
        setPassword("");
        setUserLevel("U");
        setModuleAccess("");
        setOriginalModule("");
        setShowPassword(false);
        await calculateNextUserNo();
    };

    const handleClear = async () => {
        if (mode === "Edit" && loadedUser) {
            // Revert edit form back to loaded user state
            setUserId(loadedUser.userId || loadedUser.userID || "");
            setUserName(loadedUser.userName || "");
            setPassword("");
            setUserLevel((loadedUser.userLevel || "").trim().toUpperCase() === "A" ? "A" : "U");
            setModuleAccess(originalModule);
            setShowPassword(false);
        } else {
            // Reset Add form
            await handleSwitchToAddMode();
        }
    };

    const handleSave = async () => {
        const trimmedUserId = userId.trim();
        const trimmedUserName = userName.trim();
        const trimmedPassword = password.trim();
        // 1. Validate User Login ID
        if (!trimmedUserId) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "User Login ID is required.",
            });
            return;
        }

        if (trimmedUserId.length > MAX_LOGIN_ID_LENGTH) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: `User Login ID cannot exceed ${MAX_LOGIN_ID_LENGTH} characters.`,
            });
            return;
        }

        // 2. Validate Full Name
        if (trimmedUserName.length > MAX_FULL_NAME_LENGTH) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: `Full Name cannot exceed ${MAX_FULL_NAME_LENGTH} characters.`,
            });
            return;
        }

        // 3. Validate Password
        if (mode === "Add") {
            if (!trimmedPassword) {
                toast({
                    variant: "destructive",
                    title: "Validation Error",
                    description: "Password is required for new users.",
                });
                return;
            }
            if (trimmedPassword.length > MAX_PLAINTEXT_PASSWORD_LENGTH) {
                toast({
                    variant: "destructive",
                    title: "Validation Error",
                    description: `Password cannot exceed ${MAX_PLAINTEXT_PASSWORD_LENGTH} characters so its encrypted representation fits in the database.`,
                });
                return;
            }
        } else {
            // Edit mode: password optional
            if (trimmedPassword && trimmedPassword.length > MAX_PLAINTEXT_PASSWORD_LENGTH) {
                toast({
                    variant: "destructive",
                    title: "Validation Error",
                    description: `Password cannot exceed ${MAX_PLAINTEXT_PASSWORD_LENGTH} characters so its encrypted representation fits in the database.`,
                });
                return;
            }
        }

        // 4. Validate Type
        const validLevel = userLevel.trim().toUpperCase();
        if (validLevel !== "A" && validLevel !== "U") {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Type must be either Administrator ('A') or Limited ('U').",
            });
            return;
        }

        // Limited users must be assigned at least one supported workspace.
        const needsModule = validLevel === "U";
        if (needsModule && !moduleAccess) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Select a module to grant access to this Limited user.",
            });
            return;
        }
        const moduleChanged = needsModule && moduleAccess !== originalModule;

        // 5. Pre-check User Login ID uniqueness against ALL users in tbl_Users
        const freshUsers = await loadAllUsers();
        const duplicate = freshUsers.find((u) => {
            const existingId = (u.userId || u.userID || "").trim().toLowerCase();
            return existingId === trimmedUserId.toLowerCase() && u.userNo !== userNo;
        });

        if (duplicate) {
            toast({
                variant: "destructive",
                title: "Duplicate Login ID",
                description: `Login ID '${trimmedUserId}' is already in use by User #${duplicate.userNo} (${duplicate.userName || "No name"}). Please choose another Login ID.`,
            });
            return;
        }

        // 6. Cross-Site User No Collision Check (Add Mode)
        let finalUserNo = userNo;
        if (mode === "Add") {
            const collision = freshUsers.find((u) => u.userNo === finalUserNo);
            if (collision) {
                const nextSafe = Math.max(...freshUsers.map((u) => u.userNo), 0) + 1;
                finalUserNo = nextSafe;
                setUserNo(nextSafe);
            }
        }

        // 7. Resolve password to send
        let passwordToSend = trimmedPassword;
        if (mode === "Edit" && !passwordToSend) {
            passwordToSend = "";
        }

        // 8. Resolve site to send: preserve existing user's Site on edit, or currentSite on add
        const targetSite = mode === "Edit" && loadedUser?.site ? loadedUser.site : currentSite;

        const payload: UserSavePayload = {
            userNo: finalUserNo,
            userID: trimmedUserId,
            userName: trimmedUserName,
            userPassward: passwordToSend,
            userLevel: validLevel,
            userPicture: null,
            ...(moduleChanged ? { moduleAccess, moduleAccessSpecified: true } : {}),
        };

        try {
            setIsSaving(true);
            const response = await userService.saveUser(payload, targetSite);

            toast({
                title: mode === "Add" ? "User Created" : "User Updated",
                description: response.message || `User #${finalUserNo} saved successfully.`,
            });

            await cache.invalidateQueries({ queryKey: ["uam-dashboard-users"] });
            if (validLevel === "U") {
                navigate(userRightsLink(response.userNo || finalUserNo, moduleAccess));
                return;
            }

            // Return to Add mode with fresh User No
            await handleSwitchToAddMode();
        } catch (err: unknown) {
            const message = getResponseErrorMessage(err) || (err instanceof Error ? err.message : undefined) || "Failed to save user.";
            toast({
                variant: "destructive",
                title: "Save Error",
                description: message,
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background text-sm overflow-hidden font-sans">
            {/* Top Sticky Header Bar with Header Save & Clear Actions */}
            <header className="min-h-14 bg-card border-b border-border flex flex-wrap gap-3 py-3 items-center justify-between px-4 sm:px-6 sticky top-0 z-40 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-xl">
                        <UserPlus className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-foreground">
                                {mode === "Add" ? "Create New User" : `Edit User #${userNo}`}
                            </h2>
                            <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                                    mode === "Add"
                                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800"
                                        : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800"
                                }`}
                            >
                                {mode} Mode
                            </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            User Access Management • Account Definition
                        </p>
                    </div>
                </div>

                {/* Right: Header Save & Clear Actions */}
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClear}
                        className="h-9 gap-1.5 font-semibold text-xs border-border"
                    >
                        <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" /> Clear
                    </Button>

                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-9 min-w-28 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-sm"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-3.5 h-3.5" /> {userLevel === "U" ? "Save and assign permissions" : "Save User"}
                            </>
                        )}
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-foreground ml-1"
                        onClick={() => navigate(-1)}
                        title="Exit"
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <div ref={contentScrollRef} className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className="max-w-5xl mx-auto space-y-4"
                >
                    {/* Mode Notification Banner if Editing */}
                    {mode === "Edit" && (
                        <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-2 text-xs text-blue-900 dark:text-blue-300">
                                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span>
                                    Currently editing user <strong>#{userNo}</strong> ({userId}). Password field is optional.
                                </span>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleSwitchToAddMode}
                                className="h-7 text-xs bg-card border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300"
                            >
                                <UserPlus className="w-3 h-3 mr-1" /> Switch to Add Mode
                            </Button>
                        </div>
                    )}

                    {/* Form Fields Card */}
                    <Card className="border-border/50 shadow-md overflow-hidden bg-card max-w-2xl mx-auto w-full">
                        <CardHeader className="bg-muted/30 border-b border-border/50 py-4 px-6">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                <UserCheck className="w-4 h-4 text-primary" />
                                {mode === "Add" ? "New User Information" : `Edit User #${userNo}`}
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Enter account details, choose a role and select the workspaces this user needs.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-6 space-y-5">
                            {/* User No (Read-Only) */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-1.5">
                                        <Hash className="w-3.5 h-3.5 text-primary" /> User No
                                    </Label>
                                    <span className="text-[10px] text-muted-foreground italic">
                                        Assigned automatically
                                    </span>
                                </div>
                                <Input
                                    value={userNo ? `#${userNo}` : "Calculating..."}
                                    readOnly
                                    className="h-10 font-sans font-bold bg-muted/40 cursor-not-allowed border-border"
                                />
                            </div>

                            {/* User Login ID */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-primary" /> Login Username <span className="text-destructive">*</span>
                                    </Label>
                                    <span className="text-[10px] text-muted-foreground">
                                        {userId.length} / {MAX_LOGIN_ID_LENGTH} chars
                                    </span>
                                </div>
                                <Input
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value.slice(0, MAX_LOGIN_ID_LENGTH))}
                                    placeholder="Enter a unique username"
                                    maxLength={MAX_LOGIN_ID_LENGTH}
                                    className="h-10"
                                />
                                {mode === "Edit" && (
                                    <p className="text-[11px] text-muted-foreground italic">
                                        You can change this username. Existing user rights will be retained under the new username.
                                    </p>
                                )}
                            </div>

                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-1.5">
                                        <UserCheck className="w-3.5 h-3.5 text-primary" /> Full Name
                                    </Label>
                                    <span className="text-[10px] text-muted-foreground">
                                        {userName.length} / {MAX_FULL_NAME_LENGTH} chars
                                    </span>
                                </div>
                                <Input
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value.slice(0, MAX_FULL_NAME_LENGTH))}
                                    placeholder="e.g. John Doe"
                                    maxLength={MAX_FULL_NAME_LENGTH}
                                    className="h-10"
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-1.5">
                                        <Lock className="w-3.5 h-3.5 text-primary" /> Password{" "}
                                        {mode === "Add" ? <span className="text-destructive">*</span> : null}
                                    </Label>
                                    <span className="text-[10px] text-muted-foreground">
                                        {password.length} / {MAX_PLAINTEXT_PASSWORD_LENGTH} chars
                                    </span>
                                </div>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value.slice(0, MAX_PLAINTEXT_PASSWORD_LENGTH))}
                                        placeholder={
                                            mode === "Edit"
                                                ? "Leave blank to keep current password"
                                                : "Enter password (max 20 characters)"
                                        }
                                        maxLength={MAX_PLAINTEXT_PASSWORD_LENGTH}
                                        className="h-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        title={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    {mode === "Edit"
                                        ? "Leave blank to keep existing password unchanged. Only type here if you wish to reset the password."
                                        : "The user will use this password to sign in."}
                                </p>
                            </div>

                            {/* Type (Dropdown) */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5 text-primary" /> Type (User Role){" "}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select value={userLevel} onValueChange={setUserLevel}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select user role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="U">
                                            <div className="flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-amber-500" />
                                                <span>Limited (Restricted access governed by User Rights)</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="A">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-3.5 h-3.5 text-blue-500" />
                                                <span>Administrator (Full system bypass access)</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {userLevel === "U" && (
                                <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                                    <div>
                                        <Label className="text-xs font-bold text-foreground uppercase tracking-tight flex items-center gap-1.5">
                                            <Shield className="w-3.5 h-3.5 text-primary" /> Workspace Access <span className="text-destructive">*</span>
                                        </Label>
                                        <p className="mt-1 text-[11px] text-muted-foreground">Choose one or both CoolPoint workspaces for this limited account.</p>
                                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Selecting a module does not grant access to its pages. Assign page permissions after saving.</p>
                                    </div>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {ASSIGNABLE_MODULES.map(module => {
                                            const selected = normalizeAssignedModules(moduleAccess).includes(module.key);
                                            return (
                                                <label key={module.key} className="flex cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 py-2.5 text-xs font-medium hover:bg-muted/50">
                                                    <input
                                                        type="checkbox"
                                                        checked={selected}
                                                        onChange={() => setModuleAccess(current => {
                                                            const keys = normalizeAssignedModules(current);
                                                            const next = selected ? keys.filter(key => key !== module.key) : [...keys, module.key];
                                                            return normalizeAssignedModules(next).join(",");
                                                        })}
                                                        className="size-4 accent-primary"
                                                    />
                                                    {module.label}
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {mode === "Edit" && !originalModule && (
                                        <p className="text-[11px] text-muted-foreground">No supported workspace is assigned yet. Select at least one before saving this limited account.</p>
                                    )}
                                </div>
                            )}
                            {/* Informational Banner */}
                            <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20 text-xs space-y-1 text-muted-foreground">
                                <p className="font-semibold text-foreground flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> {userLevel === "U" ? "Next: page permissions" : "Account access"}
                                </p>
                                <p>
                                    {userLevel === "U" ? "Saving creates the account first, then opens User Rights. Select View for each page the user needs; no page permissions are granted automatically." : "Administrators receive full access. Manage existing accounts from Existing Users."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                </motion.div>
            </div>
        </div>
    );
};

export default CreateUserPage;
