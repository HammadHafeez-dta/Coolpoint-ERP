import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Edit2,
    Loader2,
    Coins,
    ArrowLeft,
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
import { useQuery } from "@tanstack/react-query";
import { employeeService, Employee } from "../services/employeeService";
import { openingBalancesService, EmployeeOpeningBalances } from "../services/openingBalancesService";
import OpeningBalancesForm from "../components/OpeningBalancesForm";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/utils/utils";

const PAGE_SIZE = 10;

// Sub-component to fetch and render opening balance info for a specific row to avoid huge batch fetches on mounting
const OpeningBalanceRowCells = ({ empId }: { empId: number }) => {
    const { data: balance, isLoading } = useQuery<EmployeeOpeningBalances | null>({
        queryKey: ['openingBalance', empId],
        queryFn: async () => {
            try {
                return await openingBalancesService.getByEmployeeId(empId, 'SAFT');
            } catch {
                return null;
            }
        },
        staleTime: 5 * 60 * 1000
    });

    if (isLoading) {
        return (
            <>
                <TableCell className="py-4 text-center text-xs text-muted-foreground"><Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /></TableCell>
                <TableCell className="py-4 text-center text-xs text-muted-foreground"><Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /></TableCell>
                <TableCell className="py-4 text-center text-xs text-muted-foreground"><Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /></TableCell>
                <TableCell className="py-4 text-center text-xs text-muted-foreground"><Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /></TableCell>
            </>
        );
    }

    if (!balance || !balance.empCardNo) {
        return (
            <>
                <TableCell className="py-4 text-center text-xs text-muted-foreground italic">Not Set</TableCell>
                <TableCell className="py-4 text-right text-xs text-muted-foreground font-semibold">0.00</TableCell>
                <TableCell className="py-4 text-right text-xs text-muted-foreground font-semibold">0.00</TableCell>
                <TableCell className="py-4 text-right text-xs text-muted-foreground font-semibold">0.00</TableCell>
            </>
        );
    }

    return (
        <>
            <TableCell className="py-4 text-center text-xs font-medium text-foreground">
                {balance.openingDate ? new Date(balance.openingDate).toLocaleDateString() : 'N/A'}
            </TableCell>
            <TableCell className="py-4 text-right text-xs font-bold text-emerald-600">
                {balance.eobiOpening?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </TableCell>
            <TableCell className="py-4 text-right text-xs font-bold text-sidebar">
                {balance.ssOpening?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </TableCell>
            <TableCell className="py-4 text-right text-xs font-bold text-violet-600">
                {balance.pFundOpening?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </TableCell>
        </>
    );
};

const EmployeeOpeningBalancesPage = () => {
    const navigate = useNavigate();

    const {
        data: employees = [],
        isLoading: loadingEmployees
    } = useQuery<Employee[]>({
        queryKey: ['employees-for-opening'],
        queryFn: () => employeeService.getAll('SAFT'),
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedOpening, setSelectedOpening] = useState<EmployeeOpeningBalances | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const handleEditClick = (empCardNo: number) => {
        // Find existing balance from Cache or service to edit
        openingBalancesService.getByEmployeeId(empCardNo, 'SAFT')
            .then(existing => {
                setSelectedOpening(existing);
                setIsFormOpen(true);
            })
            .catch(() => {
                // If it fails or does not exist, create new opening balance state for employee
                setSelectedOpening({
                    empCardNo,
                    openingDate: new Date().toISOString().split('T')[0],
                    eobiOpening: 0,
                    ssOpening: 0,
                    pFundOpening: 0
                });
                setIsFormOpen(true);
            });
    };

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp =>
            emp.empName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.empCardNo.toString().includes(searchTerm) ||
            emp.deptName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, searchTerm]);

    const totalPages = Math.ceil(filteredEmployees.length / PAGE_SIZE);

    const paginatedEmployees = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredEmployees.slice(start, start + PAGE_SIZE);
    }, [filteredEmployees, currentPage]);

    // Reset page to 1 when search term changes
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
                        <Coins className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Employee Opening Balances</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 space-y-6 max-w-[1600px] mx-auto w-full">
                {/* Search */}
                <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search by Employee Card No, Name, or Department..."
                            className="pl-10 h-11 bg-background/50 border-border"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {totalPages > 1 && (
                        <div className="text-xs text-muted-foreground font-medium">
                            Showing {((currentPage - 1) * PAGE_SIZE) + 1}-{Math.min(currentPage * PAGE_SIZE, filteredEmployees.length)} of {filteredEmployees.length}
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
                                <TableHead className="w-24 font-bold text-[10px] uppercase text-muted-foreground py-4 px-6">Card No</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Employee Name</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Department</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4 text-center">Opening Date</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4 text-right">EOBI Opening</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4 text-right">SS Opening</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4 text-right">PF Opening</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4 text-right px-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingEmployees ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-32 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : paginatedEmployees.length > 0 ? (
                                paginatedEmployees.map((emp) => (
                                    <TableRow key={emp.empCardNo} className="hover:bg-secondary/20 transition-colors border-border">
                                        <TableCell className="font-sans font-bold text-xs py-4 px-6">{emp.empCardNo}</TableCell>
                                        <TableCell className="py-4 font-bold text-sm text-foreground">{emp.empName}</TableCell>
                                        <TableCell className="py-4 text-xs font-semibold text-muted-foreground">{emp.deptName || 'N/A'}</TableCell>
                                        
                                        <OpeningBalanceRowCells empId={emp.empCardNo} />

                                        <TableCell className="text-right py-4 px-6">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-primary hover:bg-primary/10"
                                                onClick={() => handleEditClick(emp.empCardNo)}
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                        No employees found.
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
                    <OpeningBalancesForm
                        openingItem={selectedOpening}
                        isOpen={isFormOpen}
                        onClose={() => setIsFormOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmployeeOpeningBalancesPage;
