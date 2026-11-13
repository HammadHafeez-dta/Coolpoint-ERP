import React, { useState, useEffect, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Search, Loader2, Users, Shield, User } from "lucide-react";
import { UserListItem } from "../services/userService";

interface UserSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (user: UserListItem) => void;
    users: UserListItem[];
    isLoading?: boolean;
}

export const UserSelectModal: React.FC<UserSelectModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    users,
    isLoading = false,
}) => {
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (isOpen) {
            setSearchTerm("");
        }
    }, [isOpen]);

    const filteredUsers = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return users;

        return users.filter((u) => {
            const userNoStr = u.userNo.toString();
            const userIdStr = (u.userId || u.userID || "").toLowerCase();
            const userNameStr = (u.userName || "").toLowerCase();
            const siteStr = (u.site || "").toLowerCase();
            const levelStr = u.userLevel === "A" ? "administrator admin" : "limited user";

            return (
                userNoStr.includes(query) ||
                userIdStr.includes(query) ||
                userNameStr.includes(query) ||
                siteStr.includes(query) ||
                levelStr.includes(query)
            );
        });
    }, [users, searchTerm]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl h-[75vh] flex flex-col p-0 gap-0 border border-border shadow-2xl overflow-hidden bg-background">
                <DialogHeader className="p-5 pb-3 border-b bg-muted/30">
                    <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                        <Users className="w-5 h-5 text-primary" />
                        Select User for Editing
                    </DialogTitle>
                </DialogHeader>

                <div className="p-4 pb-2 border-b bg-card">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search by User No, Login ID, Name, or Type..."
                            className="pl-9 h-10 text-xs bg-muted/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            <p className="text-xs text-muted-foreground">Loading users...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground text-xs">
                            No users found matching your search.
                        </div>
                    ) : (
                        <div className="rounded-lg border border-border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/40">
                                    <TableRow className="text-xs font-semibold">
                                        <TableHead className="w-20 text-center">User No</TableHead>
                                        <TableHead className="w-32">Login ID</TableHead>
                                        <TableHead>Full Name</TableHead>
                                        <TableHead className="w-28 text-center">Type</TableHead>
                                        <TableHead className="w-20 text-center">Site</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="text-xs">
                                    {filteredUsers.map((u) => {
                                        const isAdmin = (u.userLevel || "").toUpperCase() === "A";
                                        return (
                                            <TableRow
                                                key={u.userNo}
                                                className="cursor-pointer hover:bg-primary/5 transition-colors"
                                                onClick={() => {
                                                    onSelect(u);
                                                    onClose();
                                                }}
                                            >
                                                <TableCell className="text-center font-bold font-sans text-muted-foreground">
                                                    #{u.userNo}
                                                </TableCell>
                                                <TableCell className="font-semibold text-foreground">
                                                    {u.userId || u.userID || "-"}
                                                </TableCell>
                                                <TableCell className="text-foreground">
                                                    {u.userName || <span className="text-muted-foreground italic">(none)</span>}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {isAdmin ? (
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 text-[10px] gap-1 px-2 py-0.5">
                                                            <Shield className="w-3 h-3" /> Administrator
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 text-[10px] gap-1 px-2 py-0.5">
                                                            <User className="w-3 h-3" /> Limited
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center font-sans text-muted-foreground">
                                                    {u.site || "-"}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                <div className="p-3 px-5 border-t bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Showing {filteredUsers.length} of {users.length} users</span>
                    <span>Click any row to select and load into the form</span>
                </div>
            </DialogContent>
        </Dialog>
    );
};
