import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Users,
    UserPlus,
    Edit,
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    RefreshCw,
    Shield,
    User,
    Loader2,
    LogOut,
    Trash2,
    KeyRound,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card } from "@/shared/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { useToast } from "@/shared/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { userRightsLink } from "../utils/userSetup";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/shared/components/ui/alert-dialog";
import { errorMessage } from "@/modules/crm/utils/crmUi";
import {
    userService,
    UserListItem,
} from "../services/userService";

export const ExistingUsersPage: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const cache = useQueryClient();
    const [deleting, setDeleting] = useState<UserListItem | null>(null);
    const [deleteBusy, setDeleteBusy] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const deleteUser = async () => {
        if (!deleting || deleteBusy) return;
        setDeleteBusy(true); setDeleteError("");
        try {
            await userService.deleteUser(deleting.userNo);
            setAllUsers(current => current.filter(user => user.userNo !== deleting.userNo));
            setDeleting(null);
            await cache.invalidateQueries({ queryKey: ["uam-dashboard-users"] });
            await cache.invalidateQueries({ queryKey: ["uam-dashboard-assignments"] });
            await cache.invalidateQueries({ queryKey: ["crm", "projects"] });
            await loadAllUsers();
            toast({ title: "User deleted", description: "Account access removed. Project tasks and history have been retained." });
        } catch (error) { setDeleteError(errorMessage(error)); }
        finally { setDeleteBusy(false); }
    };

    const [allUsers, setAllUsers] = useState<UserListItem[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);

    // ── Table & Pagination State ──────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [roleFilter, setRoleFilter] = useState<string>("ALL");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    const loadAllUsers = useCallback(async (): Promise<UserListItem[]> => {
        setIsLoadingUsers(true);
        try {
            const list = await userService.getAllUsers();
            setAllUsers(list || []);
            return list || [];
        } catch {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load user list.",
            });
            return [];
        } finally {
            setIsLoadingUsers(false);
        }
    }, [toast]);

    useEffect(() => {
        loadAllUsers();
    }, [loadAllUsers]);

    // ── Filtered & Paginated Users ────────────────────────────────────────────
    const filteredUsers = useMemo(() => {
        let result = allUsers;

        if (roleFilter !== "ALL") {
            result = result.filter((u) => (u.userLevel || "").toUpperCase() === roleFilter);
        }

        const query = searchQuery.trim().toLowerCase();
        if (query) {
            result = result.filter((u) => {
                const uid = (u.userId || u.userID || "").toLowerCase();
                const uname = (u.userName || "").toLowerCase();
                const usite = (u.site || "").toLowerCase();
                const uno = String(u.userNo);
                return uid.includes(query) || uname.includes(query) || usite.includes(query) || uno.includes(query);
            });
        }

        return result;
    }, [allUsers, roleFilter, searchQuery]);

    const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
    useEffect(() => { setCurrentPage(page => Math.min(page, totalPages)); }, [totalPages]);
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredUsers.slice(start, start + pageSize);
    }, [filteredUsers, currentPage, pageSize]);

    // Reset pagination when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, roleFilter, pageSize]);

    const handleEditUser = (user: UserListItem) => {
        navigate(`/user-access/create-user?userNo=${user.userNo}`);
    };

    return (
        <div className="flex flex-col h-screen bg-background text-sm overflow-hidden font-sans">
            <AlertDialog open={!!deleting} onOpenChange={open => { if (!open && !deleteBusy) setDeleting(null); }}>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete user account?</AlertDialogTitle><AlertDialogDescription>
                    Permanently delete {deleting?.userName || "this account"} ({deleting?.userId || deleting?.userID}, #{deleting?.userNo}) and its module/page rights. This cannot be undone. Unfinished project tasks remain assigned to the deleted account until an administrator reassigns them. Task history and recorded assignee names are preserved.
                </AlertDialogDescription></AlertDialogHeader>{deleteError && <p role="alert" className="text-sm text-destructive">{deleteError}</p>}<AlertDialogFooter><AlertDialogCancel disabled={deleteBusy}>Cancel</AlertDialogCancel><AlertDialogAction disabled={deleteBusy} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={event => { event.preventDefault(); void deleteUser(); }}>{deleteBusy ? "Deleting…" : "Delete user"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
            </AlertDialog>
            {/* Top Sticky Header */}
            <header className="min-h-14 bg-card border-b border-border flex flex-wrap gap-3 py-3 items-center justify-between px-4 sm:px-6 sticky top-0 z-40 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-foreground">Existing Users</h2>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                                {allUsers.length} Users Total
                            </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            User Access Management • Directory
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        onClick={() => navigate("/user-access/create-user")}
                        className="h-9 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-sm"
                    >
                        <UserPlus className="w-3.5 h-3.5" /> Create New User
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
            <div className="flex-1 overflow-auto p-6 bg-muted/10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className="max-w-5xl mx-auto space-y-4"
                >
                    {/* Search & Filter Bar */}
                    <Card className="border-border/50 shadow-sm bg-card p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex-1 relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by User ID, Name, Site, or User No..."
                                    className="h-9 pl-9 pr-4 text-xs"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="w-44">
                                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue placeholder="All Roles" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Roles</SelectItem>
                                            <SelectItem value="A">Administrator ('A')</SelectItem>
                                            <SelectItem value="U">Limited ('U')</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={loadAllUsers}
                                    disabled={isLoadingUsers}
                                    className="h-9 gap-1 text-xs"
                                    title="Refresh User List"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? "animate-spin" : ""}`} />
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Users Table Card */}
                    <Card className="border-border/50 shadow-md bg-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="block w-full text-left text-xs sm:table">
                                <thead className="hidden sm:table-header-group bg-muted/40 border-b border-border/70 text-muted-foreground uppercase font-semibold">
                                    <tr>
                                        <th className="py-3 px-4 w-20"># No</th>
                                        <th className="py-3 px-4">User Login ID</th>
                                        <th className="py-3 px-4">Full Name</th>
                                        <th className="py-3 px-4">Role</th>
                                        <th className="py-3 px-4 w-24">Site</th>
                                        <th className="py-3 px-4 text-right w-24">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="block divide-y divide-border/40 sm:table-row-group">
                                    {isLoadingUsers ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-muted-foreground">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                                                Loading users...
                                            </td>
                                        </tr>
                                    ) : paginatedUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-muted-foreground">
                                                No users found matching your criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedUsers.map((user) => {
                                            const isAdmin = (user.userLevel || "").toUpperCase() === "A";
                                            return (
                                                <tr
                                                    key={user.userNo}
                                                    className="grid grid-cols-2 items-center py-2 sm:table-row sm:py-0 hover:bg-muted/30 transition-colors"
                                                >
                                                    <td className="hidden sm:table-cell py-3 px-4 font-sans font-bold text-foreground">
                                                        #{user.userNo}
                                                    </td>
                                                    <td className="py-3 px-4 font-sans font-bold text-primary">
                                                        {user.userId || user.userID}
                                                    </td>
                                                    <td className="col-span-2 sm:table-cell py-2 sm:py-3 px-4 text-foreground font-medium break-words">
                                                        {user.userName || <span className="text-muted-foreground italic">None</span>}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {isAdmin ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
                                                                <Shield className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                                                Administrator
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                                                                <User className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                                                Limited
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-muted text-muted-foreground border border-border">
                                                            {user.site || "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="col-span-2 sm:table-cell py-3 px-4 text-right">
                                                        <div className="flex flex-wrap sm:flex-nowrap justify-start sm:justify-end gap-2">
                                                        {(user.userLevel || "").trim().toUpperCase() !== "A" && <Button type="button" variant="outline" size="sm" className="h-8 gap-1 text-xs" aria-label={`Permissions for ${user.userId || user.userID}`} onClick={() => navigate(userRightsLink(user.userNo))}><KeyRound className="size-3" />Permissions</Button>}
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEditUser(user)}
                                                            aria-label={`Edit ${user.userId || user.userID}`}
                                                            className="h-7 px-2.5 text-xs text-primary border-primary/30 hover:bg-primary/10 gap-1 font-semibold"
                                                        >
                                                            <Edit className="w-3 h-3" /> Edit
                                                        </Button>
                                                        <Button type="button" variant="outline" size="sm" className="h-8 gap-1 text-xs text-destructive hover:text-destructive" aria-label={`Delete ${user.userId || user.userID}`} onClick={() => { setDeleteError(""); setDeleting(user); }}><Trash2 className="size-3" />Delete</Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="p-3 bg-muted/20 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                                <span>
                                    Showing{" "}
                                    <strong>
                                        {filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                                    </strong>{" "}
                                    to{" "}
                                    <strong>
                                        {Math.min(currentPage * pageSize, filteredUsers.length)}
                                    </strong>{" "}
                                    of <strong>{filteredUsers.length}</strong> users
                                </span>

                                <div className="flex items-center gap-1.5 ml-3">
                                    <span className="text-[11px]">Rows:</span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => setPageSize(Number(e.target.value))}
                                        className="h-7 text-xs bg-card border border-border rounded px-1.5 text-foreground"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7 text-xs"
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    title="First Page"
                                >
                                    <ChevronsLeft className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7 text-xs"
                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    title="Previous Page"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </Button>

                                <span className="px-2.5 py-1 text-xs font-semibold text-foreground">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7 text-xs"
                                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    title="Next Page"
                                >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7 text-xs"
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    title="Last Page"
                                >
                                    <ChevronsRight className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default ExistingUsersPage;
