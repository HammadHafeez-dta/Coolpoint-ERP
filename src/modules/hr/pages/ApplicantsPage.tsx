import React, { useState, useEffect, useMemo } from "react";
import {
    Search,
    UserCheck,
    Eye,
    Loader2,
    RefreshCw,
    AlertCircle,
    UserX,
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
import { motion } from "framer-motion";
import { cn } from "@/shared/utils/utils";
import { authService } from "@/modules/auth/services/authService";
import { employeeService, Employee } from "../services/employeeService";
import { usePermissions } from "@/modules/user-management/hooks/usePermissions";
import { PERSONAL_FIELDS, LIST_COLUMNS } from "../utils/applicantFields";
import { ApplicantPersonalInfoDialog } from "../components/ApplicantPersonalInfoDialog";

const PAGE_SIZE = 20;

const ApplicantsPage: React.FC = () => {
    const userSite = authService.getSite() || "";

    // Permission check
    const { canView: canViewApplicants, isLoaded, isAdmin } = usePermissions("HRMS", "Applicants");
    const { canView: canViewEmployees } = usePermissions("HRMS", "Employees Page");
    const canView = isAdmin || canViewApplicants || canViewEmployees;

    // Data fetching
    const {
        data: employees = [],
        isLoading: loading,
        isError,
        error,
        refetch,
    } = useQuery<Employee[]>({
        queryKey: ["employees", userSite],
        queryFn: () => employeeService.getAll(userSite),
        staleTime: 5 * 60 * 1000,
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Filter employees by name, card number, CNIC, and old card number
    const filteredApplicants = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();
        if (!query) return employees;
        return employees.filter((emp) =>
            (emp.empName?.toLowerCase().includes(query) ?? false) ||
            (emp.empCardNo?.toString().includes(query) ?? false) ||
            (emp.cnicNo?.toLowerCase().includes(query) ?? false) ||
            (emp.empOldNo?.toLowerCase().includes(query) ?? false)
        );
    }, [employees, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredApplicants.length / PAGE_SIZE));

    const paginatedApplicants = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredApplicants.slice(start, start + PAGE_SIZE);
    }, [filteredApplicants, currentPage]);

    // Reset pagination to first page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const handleOpenDrawer = (emp: Employee) => {
        setSelectedEmployee(emp);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
    };

    // Permission access check state
    if (isLoaded && !canView) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background p-6">
                <div className="bg-card p-8 rounded-xl border border-border shadow-sm text-center max-w-md">
                    <div className="bg-destructive/10 p-3 rounded-full w-fit mx-auto mb-4 text-destructive">
                        <UserX className="w-8 h-8" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">Access Denied</h2>
                    <p className="text-xs text-muted-foreground mt-2">
                        You do not have permission to view the Applicants page. Please contact your system administrator.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <UserCheck className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Applicants</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">
                            Workforce &amp; HR Records
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={loading}
                        className="gap-2 h-9 border-border"
                    >
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto p-6 space-y-6 max-w-[1600px] mx-auto w-full">
                {/* Search Bar Card */}
                <div className="bg-card p-4 rounded-xl border border-border shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, card no, CNIC, or old no..."
                            className="pl-9 h-9 text-xs bg-background"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {filteredApplicants.length > 0 && (
                        <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                            Showing {((currentPage - 1) * PAGE_SIZE) + 1}-{Math.min(currentPage * PAGE_SIZE, filteredApplicants.length)} of {filteredApplicants.length}
                        </div>
                    )}
                </div>

                {/* Error State */}
                {isError && (
                    <div className="bg-card p-8 rounded-xl border border-destructive/20 shadow-xs flex flex-col items-center justify-center text-center">
                        <AlertCircle className="w-10 h-10 text-destructive mb-3" />
                        <h3 className="text-sm font-bold text-foreground">Failed to load applicants</h3>
                        <p className="text-xs text-muted-foreground mt-1 mb-4">
                            {error instanceof Error ? error.message : "An error occurred while fetching applicant records."}
                        </p>
                        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                            <RefreshCw className="w-4 h-4" /> Try Again
                        </Button>
                    </div>
                )}

                {/* Table Card */}
                {!isError && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-xl border border-border shadow-xs overflow-hidden flex flex-col"
                    >
                        <Table containerClassName="max-h-[calc(100vh-280px)] min-h-[350px]">
                            <TableHeader className="bg-secondary/95 backdrop-blur-xs border-b border-border sticky top-0 z-20 shadow-xs">
                                <TableRow className="hover:bg-transparent border-border">
                                    {LIST_COLUMNS.map((colKey) => {
                                        const field = PERSONAL_FIELDS.find((f) => f.key === colKey);
                                        const label = field ? field.label : String(colKey);
                                        const isCardNo = colKey === "empCardNo";
                                        return (
                                            <TableHead
                                                key={String(colKey)}
                                                className={cn(
                                                    "font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-4 sticky top-0 bg-secondary/95",
                                                    isCardNo && "w-28 px-6"
                                                )}
                                            >
                                                {label}
                                            </TableHead>
                                        );
                                    })}
                                    <TableHead className="w-24 font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-6 text-right sticky top-0 bg-secondary/95">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={LIST_COLUMNS.length + 1} className="h-32 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                                <span className="text-xs text-muted-foreground">
                                                    Loading applicant records...
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedApplicants.length > 0 ? (
                                    paginatedApplicants.map((emp) => (
                                        <TableRow
                                            key={`${emp.empCardNo}-${emp.site}`}
                                            onClick={() => handleOpenDrawer(emp)}
                                            className="hover:bg-secondary/20 transition-colors border-border cursor-pointer"
                                        >
                                            {LIST_COLUMNS.map((colKey) => {
                                                const isCardNo = colKey === "empCardNo";
                                                const isName = colKey === "empName";
                                                const rawValue = emp[colKey];
                                                const displayValue = (rawValue !== undefined && rawValue !== null && rawValue !== "")
                                                    ? String(rawValue)
                                                    : "-";

                                                return (
                                                    <TableCell
                                                        key={String(colKey)}
                                                        className={cn(
                                                            "py-4 px-4 text-xs text-foreground",
                                                            isCardNo && "font-sans font-bold px-6",
                                                            isName && "font-semibold"
                                                        )}
                                                    >
                                                        {displayValue}
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell className="text-right py-4 px-6">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-primary hover:bg-primary/10"
                                                    title="View Personal Info"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenDrawer(emp);
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={LIST_COLUMNS.length + 1}
                                            className="h-32 text-center text-muted-foreground text-xs"
                                        >
                                            No applicant records found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="p-4 border-t border-border bg-card">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handlePageChange(currentPage - 1);
                                                }}
                                                className={cn(
                                                    "cursor-pointer h-9 text-xs",
                                                    currentPage === 1 && "pointer-events-none opacity-50"
                                                )}
                                            />
                                        </PaginationItem>

                                        <PaginationItem>
                                            <div className="px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                                Page <span className="text-foreground">{currentPage}</span> of {totalPages}
                                            </div>
                                        </PaginationItem>

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handlePageChange(currentPage + 1);
                                                }}
                                                className={cn(
                                                    "cursor-pointer h-9 text-xs",
                                                    currentPage === totalPages && "pointer-events-none opacity-50"
                                                )}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Read-only Personal Info Modal */}
            <ApplicantPersonalInfoDialog
                employee={selectedEmployee}
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
            />
        </div>
    );
};

export default ApplicantsPage;
