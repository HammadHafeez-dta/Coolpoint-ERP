import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Loader2,
    CalendarDays,
    ArrowLeft,
    Calendar,
    RotateCcw,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
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
import { cn } from "@/shared/utils/utils";
import { useToast } from "@/shared/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gazettedLeavesService, GazettedLeaf } from "../services/gazettedLeavesService";
import GazettedLeaveForm from "../components/GazettedLeaveForm";
import { useNavigate } from "react-router-dom";
import { format, isAfter, isBefore, parseISO, startOfDay, endOfDay } from "date-fns";

const PAGE_SIZE = 15;

/**
 * Calculates the dynamic 1-Year March → February financial/academic leave cycle based on a reference date.
 * If current date is between March 1, 2026 and February 28/29, 2027:
 *   -> starts March 1, 2026 and ends February 28, 2027.
 * When March 1, 2027 arrives:
 *   -> automatically shifts to March 1, 2027 → February 29, 2028.
 */
const getRollingMarchCycle = (baseDate: Date = new Date()) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth(); // 0 = Jan, 1 = Feb, 2 = Mar, ...
    
    // If month is Jan (0) or Feb (1), the cycle started in March of previous year
    const startYear = month < 2 ? year - 1 : year;
    const endYear = startYear + 1;
    
    const from = `${startYear}-03-01`;
    // Last day of February in endYear (handles leap years)
    const lastDayOfFeb = new Date(endYear, 2, 0).getDate();
    const to = `${endYear}-02-${String(lastDayOfFeb).padStart(2, '0')}`;
    
    return {
        from,
        to,
        label: `1-Year (${format(new Date(startYear, 2, 1), 'MMM yyyy')} → ${format(new Date(endYear, 1, 1), 'MMM yyyy')})`
    };
};

const GazettedLeavesPage = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Calculate dynamic 1-year preset
    const defaultCycle = useMemo(() => getRollingMarchCycle(new Date()), []);

    // Date range filter states
    const [fromDate, setFromDate] = useState<string>(defaultCycle.from);
    const [toDate, setToDate] = useState<string>(defaultCycle.to);
    const [activePreset, setActivePreset] = useState<string>("1-year");

    const {
        data: leaves = [],
        isLoading: loading
    } = useQuery<GazettedLeaf[]>({
        queryKey: ['gazettedLeaves'],
        queryFn: () => gazettedLeavesService.getAll(),
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLeave, setEditingLeave] = useState<GazettedLeaf | null>(null);

    const deleteMutation = useMutation({
        mutationFn: (id: number) => gazettedLeavesService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gazettedLeaves'] });
            toast({ title: "Success", description: "Gazetted leave deleted successfully." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to delete gazetted leave.", variant: "destructive" });
        }
    });

    const handleCreateClick = () => {
        setEditingLeave(null);
        setIsFormOpen(true);
    };

    const handleEdit = (leave: GazettedLeaf) => {
        setEditingLeave(leave);
        setIsFormOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this gazetted leave?")) {
            deleteMutation.mutate(id);
        }
    };

    // Apply 1-Year dynamic preset
    const applyOneYearPreset = () => {
        const cycle = getRollingMarchCycle(new Date());
        setFromDate(cycle.from);
        setToDate(cycle.to);
        setActivePreset("1-year");
        setCurrentPage(1);
    };

    // Reset date range to All
    const applyAllPreset = () => {
        setFromDate("");
        setToDate("");
        setActivePreset("all");
        setCurrentPage(1);
    };

    const filteredLeaves = useMemo(() => {
        return leaves.filter(leave => {
            // Search filter
            const matchesSearch =
                (leave.leaveName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                (leave.transactionNo?.toString().includes(searchTerm) ?? false);

            if (!matchesSearch) return false;

            // Date Range filter
            if (!leave.leaveDate) return true;
            try {
                const leaveTime = parseISO(leave.leaveDate);
                if (fromDate) {
                    const fromTime = startOfDay(parseISO(fromDate));
                    if (isBefore(leaveTime, fromTime)) return false;
                }
                if (toDate) {
                    const toTime = endOfDay(parseISO(toDate));
                    if (isAfter(leaveTime, toTime)) return false;
                }
            } catch {
                return true;
            }

            return true;
        });
    }, [leaves, searchTerm, fromDate, toDate]);

    const totalPages = Math.ceil(filteredLeaves.length / PAGE_SIZE);

    const paginatedLeaves = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredLeaves.slice(start, start + PAGE_SIZE);
    }, [filteredLeaves, currentPage]);

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
                        <CalendarDays className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Gazetted Leaves</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button onClick={handleCreateClick} className="gap-1.5 h-8 text-xs bg-[#171858] hover:bg-[#121344] text-white shadow-xs active:scale-[0.98] transition-transform">
                        <Plus className="w-3.5 h-3.5" /> Add Leave
                    </Button>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 space-y-6 max-w-5xl mx-auto w-full">
                {/* Filters & Presets Bar */}
                <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-3">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1 min-w-[220px] max-w-sm">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                                Search
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search leave name or ID..."
                                    className="pl-9 h-9 text-xs bg-background/50 border-border"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </div>

                        {/* From Date */}
                        <div className="w-36">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                                From Date
                            </Label>
                            <Input
                                type="date"
                                className="h-9 text-xs bg-background/50 border-border"
                                value={fromDate}
                                onChange={(e) => {
                                    setFromDate(e.target.value);
                                    setActivePreset("custom");
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        {/* To Date */}
                        <div className="w-36">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                                To Date
                            </Label>
                            <Input
                                type="date"
                                className="h-9 text-xs bg-background/50 border-border"
                                value={toDate}
                                onChange={(e) => {
                                    setToDate(e.target.value);
                                    setActivePreset("custom");
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        {/* Presets & Reset */}
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant={activePreset === "1-year" ? "default" : "outline"}
                                size="sm"
                                onClick={applyOneYearPreset}
                                className="h-9 text-xs gap-1.5 font-semibold"
                                title="Auto rolling March → February 12-month period"
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                {defaultCycle.label}
                            </Button>

                            <Button
                                type="button"
                                variant={activePreset === "all" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={applyAllPreset}
                                className="h-9 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                title="Clear date filters to show all records"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                All
                            </Button>
                        </div>
                    </div>

                    {/* Active Range Summary Banner */}
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/60">
                        <div>
                            Showing <span className="font-semibold text-foreground">{filteredLeaves.length}</span> record{filteredLeaves.length !== 1 ? 's' : ''}
                            {fromDate && toDate && (
                                <span> for period <span className="font-semibold text-foreground">{format(parseISO(fromDate), 'dd MMM yyyy')}</span> to <span className="font-semibold text-foreground">{format(parseISO(toDate), 'dd MMM yyyy')}</span></span>
                            )}
                        </div>
                        {activePreset === "1-year" && (
                            <span className="text-[10px] font-bold uppercase bg-primary/10 text-primary px-2 py-0.5 rounded">
                                Auto-Rolling Annual Cycle Active
                            </span>
                        )}
                    </div>
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
                                <TableHead className="w-24 font-bold text-[10px] uppercase text-muted-foreground py-4 px-6">Sr No</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Leave Name</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Leave Date</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4 text-right px-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : paginatedLeaves.length > 0 ? (
                                paginatedLeaves.map((leave) => (
                                    <TableRow key={leave.transactionNo} className="hover:bg-secondary/20 transition-colors border-border">
                                        <TableCell className="font-sans font-bold text-xs py-4 px-6">{leave.transactionNo}</TableCell>
                                        <TableCell className="py-4 font-bold text-sm text-foreground">{leave.leaveName}</TableCell>
                                        <TableCell className="py-4 text-sm text-muted-foreground">
                                            {leave.leaveDate ? format(new Date(leave.leaveDate), 'dd/MM/yyyy') : 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-right py-4 px-6">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => handleEdit(leave)}>
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(leave.transactionNo)}>
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                        No gazetted leaves found.
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

            {/* Form Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <GazettedLeaveForm
                        leave={editingLeave}
                        isOpen={isFormOpen}
                        onClose={() => setIsFormOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default GazettedLeavesPage;
