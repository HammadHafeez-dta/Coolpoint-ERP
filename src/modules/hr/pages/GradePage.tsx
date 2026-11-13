import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Loader2,
    GraduationCap,
    ArrowLeft,
    DollarSign,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
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
import { useToast } from "@/shared/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gradeService, Grade } from "../services/gradeService";
import GradeForm from "../components/GradeForm";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/utils/utils";

const PAGE_SIZE = 15;

const GradePage = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const {
        data: grades = [],
        isLoading: loading
    } = useQuery<Grade[]>({
        queryKey: ['grades'],
        queryFn: () => gradeService.getAll(),
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const deleteMutation = useMutation({
        mutationFn: (id: number) => gradeService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grades'] });
            toast({ title: "Success", description: "Grade deleted successfully." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to delete grade.", variant: "destructive" });
        }
    });

    const handleCreateClick = () => {
        setEditingGrade(null);
        setIsFormOpen(true);
    };

    const handleEdit = (grade: Grade) => {
        setEditingGrade(grade);
        setIsFormOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this grade?")) {
            deleteMutation.mutate(id);
        }
    };

    const filteredGrades = useMemo(() => {
        return grades.filter(grade =>
            grade.gradeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            grade.gradeCode.toString().includes(searchTerm) ||
            grade.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [grades, searchTerm]);

    const totalPages = Math.ceil(filteredGrades.length / PAGE_SIZE);

    const paginatedGrades = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredGrades.slice(start, start + PAGE_SIZE);
    }, [filteredGrades, currentPage]);

    // Reset to page 1 when search term changes
    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Grade Management</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button onClick={handleCreateClick} className="gap-1.5 h-8 text-xs bg-[#171858] hover:bg-[#121344] text-white shadow-xs active:scale-[0.98] transition-transform">
                        <Plus className="w-3.5 h-3.5" /> Create Grade
                    </Button>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 space-y-6 max-w-[1600px] mx-auto w-full">
                {/* Search */}
                <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search grades..."
                            className="pl-10 h-11 bg-background/50 border-border"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {totalPages > 1 && (
                        <div className="text-xs text-muted-foreground font-medium">
                            Showing {((currentPage - 1) * PAGE_SIZE) + 1}-{Math.min(currentPage * PAGE_SIZE, filteredGrades.length)} of {filteredGrades.length}
                        </div>
                    )}
                </div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
                >
                    <Table>
                        <TableHeader className="bg-secondary/30">
                            <TableRow className="border-border">
                                <TableHead className="w-24 font-bold text-[10px] uppercase text-muted-foreground py-4 px-6">Code</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Name</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4 text-right">Min Salary</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4 text-right">Mid Salary</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4 text-right">Max Salary</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Category</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4 text-right px-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : paginatedGrades.length > 0 ? (
                                paginatedGrades.map((grade) => (
                                    <TableRow key={grade.gradeCode} className="hover:bg-secondary/20 transition-colors border-border">
                                        <TableCell className="font-sans font-bold text-xs py-4 px-6">{grade.gradeCode}</TableCell>
                                        <TableCell className="py-4 font-bold text-sm text-foreground">{grade.gradeName}</TableCell>
                                        <TableCell className="py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 text-sm font-medium">
                                                <DollarSign className="w-3 h-3 text-muted-foreground" />
                                                {grade.minimumSalary?.toLocaleString() || 0}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 text-sm font-medium">
                                                <DollarSign className="w-3 h-3 text-muted-foreground" />
                                                {grade.midSalary?.toLocaleString() || 0}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 text-sm font-medium">
                                                <DollarSign className="w-3 h-3 text-muted-foreground" />
                                                {grade.maximumSalary?.toLocaleString() || 0}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                {grade.category || 'N/A'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right py-4 px-6">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => handleEdit(grade)}>
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(grade.gradeCode)}>
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                        No grades found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {totalPages > 1 && (
                        <div className="p-4 border-t border-border bg-card">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                                            className={cn("cursor-pointer", currentPage === 1 && "pointer-events-none opacity-50")}
                                        />
                                    </PaginationItem>

                                    <PaginationItem>
                                        <div className="px-4 text-sm font-medium">
                                            Page {currentPage} of {totalPages}
                                        </div>
                                    </PaginationItem>

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                                            className={cn("cursor-pointer", currentPage === totalPages && "pointer-events-none opacity-50")}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Form Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <GradeForm
                        grade={editingGrade}
                        isOpen={isFormOpen}
                        onClose={() => setIsFormOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default GradePage;
