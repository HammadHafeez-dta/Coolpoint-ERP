import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Bell,
    HelpCircle,
    Loader2,
    Filter,
    ShieldCheck
} from "lucide-react";
import { strengthService, SanctionStrength } from "../services/strengthService";
import { departmentService } from "../services/departmentService";
import { designationService } from "../services/designationService";
import { authService } from "@/modules/auth/services/authService";
import { SanctionStrengthForm } from "../components/SanctionStrengthForm";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useToast } from "@/shared/components/ui/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/shared/components/ui/pagination";
import {
    Dialog,
    DialogContent,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/utils/utils";

const PAGE_SIZE = 15;

export const SanctionStrengthPage = () => {
    const userSite = authService.getSite();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStrength, setEditingStrength] = useState<SanctionStrength | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Data Fetching
    const { data: strengths = [], isLoading } = useQuery({
        queryKey: ['sanctionStrengths', userSite],
        queryFn: () => strengthService.getAll(userSite),
    });

    const { data: departments = [] } = useQuery({
        queryKey: ['departments', userSite],
        queryFn: () => departmentService.getAll(userSite),
        staleTime: 5 * 60 * 1000,
    });

    const { data: designations = [] } = useQuery({
        queryKey: ['designations', userSite],
        queryFn: () => designationService.getAll(userSite),
        staleTime: 5 * 60 * 1000,
    });

    const { data: nextCode } = useQuery({
        queryKey: ['nextStrengthCode', userSite],
        queryFn: () => strengthService.getNextCode(userSite),
        enabled: isDialogOpen && !editingStrength,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: strengthService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sanctionStrengths'] });
            toast({ title: "Success", description: "Strength record created successfully." });
            setIsDialogOpen(false);
        },
        onError: (err: any) => {
            toast({ variant: "destructive", title: "Error", description: err.response?.data || "Failed to create record." });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, strength }: { id: number; strength: Partial<SanctionStrength> }) =>
            strengthService.update(id, userSite, strength),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sanctionStrengths'] });
            toast({ title: "Success", description: "Strength record updated successfully." });
            setIsDialogOpen(false);
        },
        onError: (err: any) => {
            toast({ variant: "destructive", title: "Error", description: err.response?.data || "Failed to update record." });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => strengthService.delete(id, userSite),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sanctionStrengths'] });
            toast({ title: "Success", description: "Strength record deleted successfully." });
        },
        onError: (err: any) => {
            toast({ variant: "destructive", title: "Error", description: err.response?.data || "Failed to delete record." });
        }
    });

    const handleCreateClick = () => {
        setEditingStrength(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (s: SanctionStrength) => {
        setEditingStrength(s);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this record?")) {
            deleteMutation.mutate(id);
        }
    };

    const handleSave = async (data: Partial<SanctionStrength>) => {
        if (editingStrength) {
            updateMutation.mutate({ id: editingStrength.transactionNo, strength: data });
        } else {
            createMutation.mutate(data);
        }
    };

    const filteredStrengths = useMemo(() =>
        strengths.filter(s => {
            const dept = departments.find(d => d.code === s.departmentCode?.toString());
            const desig = designations.find(d => d.designationCode === s.designationCode);

            const searchStr = `${dept?.name} ${desig?.designationName} ${s.shift}`.toLowerCase();
            return searchStr.includes(searchTerm.toLowerCase());
        }),
        [strengths, searchTerm, departments, designations]);

    const totalPages = Math.ceil(filteredStrengths.length / PAGE_SIZE);

    const paginatedStrengths = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredStrengths.slice(start, start + PAGE_SIZE);
    }, [filteredStrengths, currentPage]);

    // Reset to page 1 when search term changes
    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    return (
        <>
            {/* Header */}
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Sanction Strength</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button onClick={handleCreateClick} className="gap-1.5 h-8 text-xs bg-[#171858] hover:bg-[#121344] text-white shadow-xs active:scale-[0.98] transition-transform">
                        <Plus className="w-3.5 h-3.5" /> Define Strength
                    </Button>
                </div>
            </header>

            {/* Page Content */}
            <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1">
                    <h3 className="text-xl font-black tracking-tight">Departmental Strength</h3>
                    <p className="text-muted-foreground text-xs">Manage sanctioned vs actual manpower across departments and designations.</p>
                </motion.div>

                <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search by department, designation or shift..."
                            className="pl-10 h-10 transition-all border-border focus:ring-2 focus:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {totalPages > 1 && (
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                            Showing {((currentPage - 1) * PAGE_SIZE) + 1}-{Math.min(currentPage * PAGE_SIZE, filteredStrengths.length)} of {filteredStrengths.length}
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => queryClient.invalidateQueries({ queryKey: ['sanctionStrengths'] })}
                            disabled={isLoading}
                        >
                            <Filter className="w-4 h-4" /> Refresh
                        </Button>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card rounded-lg border border-border overflow-hidden shadow-sm flex flex-col"
                >
                    <div className="overflow-auto max-h-[calc(100vh-320px)]">
                        <Table>
                            <TableHeader className="bg-secondary/50 sticky top-0 z-10">
                                <TableRow>
                                    <TableHead className="font-bold text-[10px] uppercase text-muted-foreground w-[80px]">No</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase text-muted-foreground">Department</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase text-muted-foreground">Designation</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase text-muted-foreground">Shift</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase text-muted-foreground text-center">Sanctioned</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase text-muted-foreground text-center">On Duty</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase text-muted-foreground text-center">Variance</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase text-muted-foreground text-right w-[120px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                            <p className="text-xs text-muted-foreground mt-2">Loading strength records...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedStrengths.length > 0 ? (
                                    paginatedStrengths.map((s) => {
                                        const dept = departments.find(d => d.code === s.departmentCode?.toString());
                                        const desig = designations.find(d => d.designationCode === s.designationCode);
                                        const variance = (s.strength || 0) - (s.onDuty || 0);

                                        return (
                                            <TableRow key={s.transactionNo} className="hover:bg-secondary/30 transition-colors">
                                                <TableCell className="font-sans text-xs font-medium">{s.transactionNo}</TableCell>
                                                <TableCell className="text-xs font-bold">{dept?.name || s.departmentCode}</TableCell>
                                                <TableCell className="text-xs">{desig?.designationName || s.designationCode}</TableCell>
                                                <TableCell className="text-xs">
                                                    <span className="px-2 py-0.5 bg-secondary rounded-full text-[10px] font-bold">
                                                        {s.shift}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center font-sans text-xs font-bold text-primary">{s.strength}</TableCell>
                                                <TableCell className="text-center font-sans text-xs font-bold text-green-600">{s.onDuty}</TableCell>
                                                <TableCell className={`text-center font-sans text-xs font-bold ${variance > 0 ? 'text-destructive' : variance < 0 ? 'text-sidebar' : 'text-muted-foreground'}`}>
                                                    {variance > 0 ? `+${variance}` : variance}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                                            onClick={() => handleEdit(s)}
                                                        >
                                                            <Edit className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDelete(s.transactionNo)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground font-medium">
                                            No strength records found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="p-3 border-t border-border bg-card">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                                            className={cn("cursor-pointer h-8 text-xs", currentPage === 1 && "pointer-events-none opacity-50")}
                                        />
                                    </PaginationItem>

                                    <PaginationItem>
                                        <div className="px-4 text-xs font-medium">
                                            Page {currentPage} of {totalPages}
                                        </div>
                                    </PaginationItem>

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                                            className={cn("cursor-pointer h-8 text-xs", currentPage === totalPages && "pointer-events-none opacity-50")}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </motion.div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden">
                    <SanctionStrengthForm
                        mode={editingStrength ? 'view' : 'create'}
                        strength={editingStrength}
                        site={userSite}
                        nextCode={nextCode || 0}
                        departments={departments}
                        designations={designations}
                        onSave={handleSave}
                        onCancel={() => setIsDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};
