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
    MoreVertical,
    FileDown,
    Briefcase
} from "lucide-react";
import { designationService, Designation } from "../services/designationService";
import { departmentService } from "../services/departmentService";
import { gradeService } from "../services/gradeService";
import { authService } from "@/modules/auth/services/authService";
import { DesignationForm } from "../components/DesignationForm";
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

export const DesignationPage = () => {
    const userSite = authService.getSite();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
    const [isPdfLoading, setIsPdfLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Data Fetching
    const { data: designations = [], isLoading } = useQuery({
        queryKey: ['designations', userSite],
        queryFn: () => designationService.getAll(userSite),
    });

    const { data: departments = [] } = useQuery({
        queryKey: ['departments', userSite],
        queryFn: () => departmentService.getAll(userSite),
        staleTime: 5 * 60 * 1000,
    });

    const { data: grades = [] } = useQuery({
        queryKey: ['grades', userSite],
        queryFn: gradeService.getAll,
        staleTime: 5 * 60 * 1000,
    });

    const { data: nextCode } = useQuery({
        queryKey: ['nextDesignationCode', userSite],
        queryFn: () => designationService.getNextCode(userSite),
        enabled: isDialogOpen && !editingDesignation,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: designationService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['designations'] });
            toast({ title: "Success", description: "Designation created successfully." });
            setIsDialogOpen(false);
        },
        onError: (err: any) => {
            toast({ variant: "destructive", title: "Error", description: err.response?.data || "Failed to create designation." });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, desig }: { id: number; desig: Partial<Designation> }) =>
            designationService.update(id, userSite, desig),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['designations'] });
            toast({ title: "Success", description: "Designation updated successfully." });
            setIsDialogOpen(false);
        },
        onError: (err: any) => {
            toast({ variant: "destructive", title: "Error", description: err.response?.data || "Failed to update designation." });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => designationService.delete(id, userSite),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['designations'] });
            toast({ title: "Success", description: "Designation deleted successfully." });
        },
        onError: (err: any) => {
            toast({ variant: "destructive", title: "Error", description: err.response?.data || "Failed to delete designation." });
        }
    });

    const handleCreateClick = () => {
        setEditingDesignation(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (desig: Designation) => {
        setEditingDesignation(desig);
        setIsDialogOpen(true);
    };

    const handleViewReport = async () => {
        try {
            setIsPdfLoading(true);
            await designationService.viewReportPdf(userSite);
            toast({ title: "Report Ready", description: "Designation list report opened in a new tab." });
        } catch {
            toast({ title: "Error", description: "Failed to generate report.", variant: "destructive" });
        } finally {
            setIsPdfLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this designation?")) {
            deleteMutation.mutate(id);
        }
    };

    const handleSave = async (data: Partial<Designation>) => {
        if (editingDesignation) {
            updateMutation.mutate({ id: editingDesignation.designationCode, desig: data });
        } else {
            createMutation.mutate(data);
        }
    };

    const filteredDesignations = useMemo(() =>
        designations.filter(d =>
            d.designationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.designationCode.toString().includes(searchTerm) ||
            (d.deptName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
        ),
        [designations, searchTerm]);

    const totalPages = Math.ceil(filteredDesignations.length / PAGE_SIZE);

    const paginatedDesignations = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredDesignations.slice(start, start + PAGE_SIZE);
    }, [filteredDesignations, currentPage]);

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
            <header className="h-14 shrink-0 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <Briefcase className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Designation Management</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button
                        variant="outline"
                        onClick={handleViewReport}
                        disabled={isPdfLoading || isLoading}
                        className="gap-1.5 h-8 text-xs border-slate-300 dark:border-slate-700 hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800 active:scale-[0.98] transition-transform"
                    >
                        {isPdfLoading
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <FileDown className="w-3.5 h-3.5 text-[#171858] dark:text-white" />}
                        {isPdfLoading ? "Generating..." : "Designation List Report"}
                    </Button>
                    <Button onClick={handleCreateClick} className="gap-1.5 h-8 text-xs bg-[#171858] hover:bg-[#121344] text-white shadow-xs active:scale-[0.98] transition-transform">
                        <Plus className="w-3.5 h-3.5" /> Create Designation
                    </Button>
                </div>
            </header>

            {/* Page Content */}
            <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1">
                    <h3 className="text-xl font-black tracking-tight">Designation Directory</h3>
                    <p className="text-muted-foreground text-xs">Configure designations, pay structure and departmental mapping.</p>
                </motion.div>

                <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search by name, code or department..."
                            className="pl-10 h-10 transition-all border-border focus:ring-2 focus:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {totalPages > 1 && (
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                            Showing {((currentPage - 1) * PAGE_SIZE) + 1}-{Math.min(currentPage * PAGE_SIZE, filteredDesignations.length)} of {filteredDesignations.length}
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => queryClient.invalidateQueries({ queryKey: ['designations'] })}
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
                                    <TableHead className="font-bold text-[10px] uppercase text-muted-foreground w-[80px]">Code</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase text-muted-foreground">Designation Name</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase text-muted-foreground text-right w-[150px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                            <p className="text-xs text-muted-foreground mt-2">Loading designations...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedDesignations.length > 0 ? (
                                    paginatedDesignations.map((d) => (
                                        <TableRow key={d.designationCode} className="hover:bg-secondary/30 transition-colors">
                                            <TableCell className="font-sans text-xs font-medium">{d.designationCode}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold">{d.designationName}</span>
                                                    <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">{d.designationShortName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                                        onClick={() => handleEdit(d)}
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDelete(d.designationCode)}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground font-medium">
                                            No designations found matching your search.
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

            {/* Edit/Create Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md overflow-hidden p-0 flex flex-col">
                    <DesignationForm
                        mode={editingDesignation ? 'view' : 'create'}
                        designation={editingDesignation}
                        site={userSite}
                        nextCode={nextCode || 0}
                        departments={departments}
                        grades={grades}
                        onSave={handleSave}
                        onCancel={() => setIsDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};
