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
    Building2
} from "lucide-react";
import { departmentService, Department } from "../services/departmentService";
import { gradeService } from "../services/gradeService";
import { authService } from "@/modules/auth/services/authService";
import { DepartmentForm } from "../components/DepartmentForm";
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

export const DepartmentPage = () => {
    const userSite = authService.getSite();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
    const [isPdfLoading, setIsPdfLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Data Fetching
    const { data: departments = [], isLoading } = useQuery({
        queryKey: ['departments', userSite],
        queryFn: () => departmentService.getAll(userSite),
    });

    const { data: grades = [] } = useQuery({
        queryKey: ['grades', userSite],
        queryFn: gradeService.getAll,
        staleTime: 5 * 60 * 1000,
    });

    const { data: nextCode } = useQuery({
        queryKey: ['nextDepartmentCode', userSite],
        queryFn: () => departmentService.getNextCode(userSite),
        enabled: isDialogOpen && !editingDepartment,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: departmentService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            toast({ title: "Success", description: "Department created successfully." });
            setIsDialogOpen(false);
        },
        onError: (err: any) => {
            toast({ variant: "destructive", title: "Error", description: err.response?.data || "Failed to create department." });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ code, dept }: { code: string; dept: Partial<Department> }) =>
            departmentService.update(code, userSite, dept),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            toast({ title: "Success", description: "Department updated successfully." });
            setIsDialogOpen(false);
        },
        onError: (err: any) => {
            toast({ variant: "destructive", title: "Error", description: err.response?.data || "Failed to update department." });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (code: string) => departmentService.delete(code, userSite),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            toast({ title: "Success", description: "Department deleted successfully." });
        },
        onError: (err: any) => {
            toast({ variant: "destructive", title: "Error", description: err.response?.data || "Failed to delete department." });
        }
    });

    const handleCreateClick = () => {
        setEditingDepartment(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (dept: Department) => {
        setEditingDepartment(dept);
        setIsDialogOpen(true);
    };

    const handleViewReport = async () => {
        try {
            setIsPdfLoading(true);
            await departmentService.viewReportPdf(userSite);
            toast({ title: "Report Ready", description: "Department list report opened in a new tab." });
        } catch {
            toast({ title: "Error", description: "Failed to generate report.", variant: "destructive" });
        } finally {
            setIsPdfLoading(false);
        }
    };

    const handleDelete = async (code: string) => {
        if (confirm("Are you sure you want to delete this department?")) {
            deleteMutation.mutate(code);
        }
    };

    const handleSave = async (data: Partial<Department>) => {
        if (editingDepartment) {
            updateMutation.mutate({ code: editingDepartment.code, dept: data });
        } else {
            createMutation.mutate({ ...data, site: userSite });
        }
    };

    const filteredDepartments = useMemo(() =>
        departments.filter(d =>
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.gradeName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
        ),
        [departments, searchTerm]
    );

    const totalPages = Math.ceil(filteredDepartments.length / PAGE_SIZE);

    const paginatedDepartments = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredDepartments.slice(start, start + PAGE_SIZE);
    }, [filteredDepartments, currentPage]);

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
                        <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Department Management</h2>
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
                        {isPdfLoading ? "Generating..." : "Department List Report"}
                    </Button>
                    <Button onClick={handleCreateClick} className="gap-1.5 h-8 text-xs bg-[#171858] hover:bg-[#121344] text-white shadow-xs active:scale-[0.98] transition-transform">
                        <Plus className="w-3.5 h-3.5" /> Create Department
                    </Button>
                </div>
            </header>

            {/* Page Content */}
            <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1">
                    <h3 className="text-xl font-black tracking-tight">Department Directory</h3>
                    <p className="text-muted-foreground text-xs">Configure departments and grade mapping.</p>
                </motion.div>

                <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search by name or code..."
                            className="pl-10 h-10 transition-all border-border focus:ring-2 focus:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {totalPages > 1 && (
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                            Showing {((currentPage - 1) * PAGE_SIZE) + 1}-{Math.min(currentPage * PAGE_SIZE, filteredDepartments.length)} of {filteredDepartments.length}
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => queryClient.invalidateQueries({ queryKey: ['departments'] })}
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
                                    <TableHead className="font-bold text-[10px] uppercase text-muted-foreground">Department Name</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase text-muted-foreground text-right w-[150px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                            <p className="text-xs text-muted-foreground mt-2">Loading departments...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedDepartments.length > 0 ? (
                                    paginatedDepartments.map((d) => (
                                        <TableRow key={d.code} className="hover:bg-secondary/30 transition-colors">
                                            <TableCell className="font-sans text-xs font-medium">{d.code}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold">{d.name}</span>
                                                    {d.gradeName && (
                                                        <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                                                            Grade: {d.gradeName}
                                                        </span>
                                                    )}
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
                                                        onClick={() => handleDelete(d.code)}
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
                                            No departments found matching your search.
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
                    <DepartmentForm
                        mode={editingDepartment ? 'view' : 'create'}
                        department={editingDepartment}
                        site={userSite}
                        nextCode={nextCode || "1"}
                        grades={grades}
                        onSave={handleSave}
                        onCancel={() => setIsDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};
