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
    Calculator, 
    FileText, 
    Calendar as CalendarIcon, 
    Banknote,
    LogOut,
    Printer
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
import { finalSettlementService, FinalSettlementDto } from "../services/finalSettlementService";
import { authService } from "@/modules/auth/services/authService";
import { motion } from "framer-motion";
import { cn } from "@/shared/utils/utils";
import FinalSettlementForm from "../components/FinalSettlementForm";

const PAGE_SIZE = 20;

export default function FinalSettlementPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const userSite = authService.getSite() || "";

    const [searchTerm, setSearchTerm] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSettlement, setEditingSettlement] = useState<FinalSettlementDto | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const {
        data: settlements = [],
        isLoading: loading,
        refetch: fetchSettlements
    } = useQuery<FinalSettlementDto[]>({
        queryKey: ['finalSettlements', userSite],
        queryFn: () => finalSettlementService.getAll(userSite),
        staleTime: 5 * 60 * 1000,
    });

    const handleCreateClick = () => {
        setEditingSettlement(null);
        setIsFormOpen(true);
    };

    const handleEdit = (fs: FinalSettlementDto) => {
        setEditingSettlement(fs);
        setIsFormOpen(true);
    };

    const filteredSettlements = useMemo(() => {
        return settlements.filter(fs =>
            (fs.empName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            (fs.empCardNo?.toString().includes(searchTerm) ?? false) ||
            (fs.transactionNo?.toString().includes(searchTerm)) ||
            (fs.leavingType?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
        );
    }, [settlements, searchTerm]);

    const totalPages = Math.ceil(filteredSettlements.length / PAGE_SIZE);

    const paginatedSettlements = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredSettlements.slice(start, start + PAGE_SIZE);
    }, [filteredSettlements, currentPage]);

    const deleteMutation = useMutation({
        mutationFn: (fs: FinalSettlementDto) =>
            finalSettlementService.deleteSettlement(fs.transactionNo, fs.site),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['finalSettlements'] });
            toast({ title: "Deleted", description: "Final settlement record deleted successfully." });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to delete settlement.",
                variant: "destructive"
            });
        }
    });

    const handlePrint = (fs: FinalSettlementDto) => {
        finalSettlementService.viewReportPdf(fs.transactionNo, userSite);
    };

    const handleDelete = (fs: FinalSettlementDto) => {
        if (window.confirm(`Are you sure you want to delete settlement for ${fs.empName}?`)) {
            deleteMutation.mutate(fs);
        }
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs shrink-0">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <Calculator className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Final Settlement</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button onClick={handleCreateClick} className="gap-1.5 h-8 text-xs bg-[#171858] hover:bg-[#121344] text-white shadow-xs active:scale-[0.98] transition-transform">
                        <Plus className="w-3.5 h-3.5" /> New Settlement
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-6 space-y-6 max-w-[1600px] mx-auto w-full">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className="bg-sidebar/10 p-3 rounded-xl"><FileText className="w-6 h-6 text-sidebar" /></div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Processed Today</p>
                            <h3 className="text-xl font-black">{settlements.length}</h3>
                        </div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className="bg-green-500/10 p-3 rounded-xl"><Banknote className="w-6 h-6 text-green-500" /></div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Net Payable</p>
                            <h3 className="text-xl font-black">{settlements.reduce((acc, fs) => acc + (fs.payableAmount || 0), 0).toLocaleString()} <span className="text-[10px] font-normal">Rs</span></h3>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search by Employee, ID, Trans. No..."
                            className="pl-10 h-11 bg-background/50 border-border"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9 gap-2 border-border" onClick={() => fetchSettlements()}>
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
                                    <TableHead className="w-20 font-bold text-[10px] uppercase text-muted-foreground py-4 px-6">Trans No</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Employee</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Type</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Payable</TableHead>
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
                                                <span className="text-xs text-muted-foreground">Loading settlement records...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedSettlements.length > 0 ? (
                                    paginatedSettlements.map((fs) => (
                                        <TableRow key={`${fs.transactionNo}-${fs.site}`} className="hover:bg-secondary/20 transition-colors border-border">
                                            <TableCell className="font-sans font-bold text-xs py-4 px-6">{fs.transactionNo}</TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-foreground">{fs.empName || 'Employee Name'}</span>
                                                    <span className="text-[10px] text-muted-foreground font-sans">ID: {fs.empCardNo}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight bg-orange-500/10 text-orange-600 border border-orange-500/20">
                                                    {fs.leavingType}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4 font-bold text-foreground">
                                                {fs.payableAmount?.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">Rs</span>
                                            </TableCell>
                                            <TableCell className="py-4 text-xs font-medium">
                                                {fs.transactionDate ? format(new Date(fs.transactionDate), 'dd MMM yyyy') : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right py-4 px-6">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar hover:bg-sidebar/10" onClick={() => handlePrint(fs)}>
                                                        <Printer className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => handleEdit(fs)}>
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-500/10" onClick={() => handleDelete(fs)}>
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                            No settlement records found.
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
                <FinalSettlementForm
                    settlement={editingSettlement}
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                />
            )}
        </div>
    );
}
