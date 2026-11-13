import { useState, useMemo } from "react";
import { format } from "date-fns";
import { 
    Search, 
    Plus, 
    Edit, 
    Trash2, 
    Filter, 
    Bell, 
    Loader2, 
    Banknote, 
    FileText, 
    Calendar as CalendarIcon, 
    Hash,
    LogOut
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
import { loanService, LoanDto } from "../services/loanService";
import { authService } from "@/modules/auth/services/authService";
import { motion } from "framer-motion";
import { cn } from "@/shared/utils/utils";
import LoanAdvanceForm from "../components/LoanAdvanceForm";

const PAGE_SIZE = 20;

export default function LoanAdvancesPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const userSite = authService.getSite() || "";

    const [searchTerm, setSearchTerm] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLoan, setEditingLoan] = useState<LoanDto | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const {
        data: loans = [],
        isLoading: loading,
        refetch: fetchLoans
    } = useQuery<LoanDto[]>({
        queryKey: ['loans', userSite],
        queryFn: () => loanService.getAll(userSite),
        staleTime: 5 * 60 * 1000,
    });

    const handleCreateClick = () => {
        setEditingLoan(null);
        setIsFormOpen(true);
    };

    const handleEdit = (loan: LoanDto) => {
        setEditingLoan(loan);
        setIsFormOpen(true);
    };

    const filteredLoans = useMemo(() => {
        return loans.filter(loan =>
            (loan.empName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            (loan.empCardNo?.toString().includes(searchTerm) ?? false) ||
            (loan.applicationNo?.toString().includes(searchTerm)) ||
            (loan.loanType?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
        );
    }, [loans, searchTerm]);

    const totalPages = Math.ceil(filteredLoans.length / PAGE_SIZE);

    const paginatedLoans = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredLoans.slice(start, start + PAGE_SIZE);
    }, [filteredLoans, currentPage]);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs shrink-0">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <Banknote className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Loan &amp; Advances</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button onClick={handleCreateClick} className="gap-1.5 h-8 text-xs bg-[#171858] hover:bg-[#121344] text-white shadow-xs active:scale-[0.98] transition-transform">
                        <Plus className="w-3.5 h-3.5" /> Create Application
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-6 space-y-6 max-w-[1600px] mx-auto w-full">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className="bg-sidebar/10 p-3 rounded-xl"><FileText className="w-6 h-6 text-sidebar" /></div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Applications</p>
                            <h3 className="text-xl font-black">{loans.length}</h3>
                        </div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className="bg-green-500/10 p-3 rounded-xl"><Banknote className="w-6 h-6 text-green-500" /></div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Amount</p>
                            <h3 className="text-xl font-black">{loans.reduce((acc, l) => acc + (l.loanAmount || 0), 0).toLocaleString()} <span className="text-[10px] font-normal">Rs</span></h3>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search by Employee, ID, Application No..."
                            className="pl-10 h-11 bg-background/50 border-border"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9 gap-2 border-border" onClick={() => fetchLoans()}>
                            <Filter className="w-4 h-4" /> Filter
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col"
                >
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-secondary/30">
                                <TableRow className="hover:bg-transparent border-border">
                                    <TableHead className="w-20 font-bold text-[10px] uppercase text-muted-foreground py-4 px-6">App No</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Employee</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Loan Details</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Amount</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Date</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4 text-right px-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                                <span className="text-xs text-muted-foreground">Loading loan records...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedLoans.length > 0 ? (
                                    paginatedLoans.map((loan) => (
                                        <TableRow key={`${loan.applicationNo}-${loan.site}`} className="hover:bg-secondary/20 transition-colors border-border">
                                            <TableCell className="font-sans font-bold text-xs py-4 px-6">{loan.applicationNo}</TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-foreground">{loan.empName || 'Employee Name'}</span>
                                                    <span className="text-[10px] text-muted-foreground font-sans">ID: {loan.empCardNo}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight bg-sidebar/10 text-sidebar border border-sidebar/20">
                                                    {loan.loanType}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4 font-bold text-foreground">
                                                {loan.loanAmount?.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">Rs</span>
                                            </TableCell>
                                            <TableCell className="py-4 text-xs font-medium">
                                                {loan.loanDate ? format(new Date(loan.loanDate), 'dd MMM yyyy') : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right py-4 px-6">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => handleEdit(loan)}>
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                            No loan records found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="p-4 border-t border-border bg-card">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                                            className={cn("cursor-pointer h-9 text-xs", currentPage === 1 && "pointer-events-none opacity-50")}
                                        />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <div className="px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                            Page <span className="text-foreground">{currentPage}</span> of {totalPages}
                                        </div>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                                            className={cn("cursor-pointer h-9 text-xs", currentPage === totalPages && "pointer-events-none opacity-50")}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </motion.div>
            </div>

            {isFormOpen && (
                <LoanAdvanceForm
                    loan={editingLoan}
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                />
            )}
        </div>
    );
}
