import { CoolpointLoadingBoundary } from "@/shared/components/CoolpointLoader";
import { useState, useEffect, useMemo } from "react";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Filter,
    Bell,
    Loader2,
    UserCircle,
    Mail,
    Building2,
    CheckCircle2,
    XCircle,
    UserX,
    Briefcase,
    FileDown,
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
import { employeeService, Employee } from "../services/employeeService";
import { authService } from "@/modules/auth/services/authService";
import EmployeeForm from "../components/EmployeeForm";
import EmployeeStruckOffForm from "../components/EmployeeStruckOffForm";
import { motion } from "framer-motion";
import { cn } from "@/shared/utils/utils";

const PAGE_SIZE = 20;

const EmployeesPage = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const userSite = authService.getSite();

    const {
        data: employees = [],
        isLoading: loading,
        refetch: fetchEmployees
    } = useQuery<Employee[]>({
        queryKey: ['employees', userSite],
        queryFn: () => employeeService.getAll(userSite),
        staleTime: 5 * 60 * 1000,
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isStruckOffOpen, setIsStruckOffOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loadingEditId, setLoadingEditId] = useState<number | null>(null);
    const [loadingStruckOffId, setLoadingStruckOffId] = useState<number | null>(null);
    const [isPdfLoading, setIsPdfLoading] = useState(false);
    const [isDesignationPdfLoading, setIsDesignationPdfLoading] = useState(false);

    const deleteMutation = useMutation({
        mutationFn: ({ code, site }: { code: number; site: string }) =>
            employeeService.delete(code, site),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast({ title: "Success", description: "Employee deleted successfully." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to delete employee.", variant: "destructive" });
        }
    });

    const handleCreateClick = () => {
        setEditingEmployee(null);
        setIsFormOpen(true);
    };

    const handleEdit = async (emp: Employee) => {
        try {
            setLoadingEditId(emp.empCardNo);
            const fullEmp = await employeeService.getByCardNo(emp.empCardNo, emp.site);
            setEditingEmployee(fullEmp);
            setIsFormOpen(true);
        } catch (error) {
            toast({ title: "Error", description: "Failed to load employee details.", variant: "destructive" });
        } finally {
            setLoadingEditId(null);
        }
    };

    const handleStruckOff = async (emp: Employee) => {
        try {
            setLoadingStruckOffId(emp.empCardNo);
            const fullEmp = await employeeService.getByCardNo(emp.empCardNo, emp.site);
            setEditingEmployee(fullEmp);
            setIsStruckOffOpen(true);
        } catch (error) {
            toast({ title: "Error", description: "Failed to load employee details.", variant: "destructive" });
        } finally {
            setLoadingStruckOffId(null);
        }
    };

    const handleDelete = async (code: number, site: string) => {
        if (confirm("Are you sure you want to delete this employee? This will remove all related data (salary, education, etc.).")) {
            deleteMutation.mutate({ code, site });
        }
    };

    const handleViewReport = async () => {
        try {
            setIsPdfLoading(true);
            await employeeService.viewEmployeeListPdf(userSite);
            toast({ title: "Report Ready", description: "Employee list report opened in a new tab." });
        } catch {
            toast({ title: "Error", description: "Failed to generate PDF report.", variant: "destructive" });
        } finally {
            setIsPdfLoading(false);
        }
    };

    const handleViewDesignationReport = async () => {
        try {
            setIsDesignationPdfLoading(true);
            await employeeService.viewEmployeesByDesignationReport(userSite);
            toast({ title: "Report Ready", description: "Grouped designation report opened in a new tab." });
        } catch {
            toast({ title: "Error", description: "Failed to generate grouped report.", variant: "destructive" });
        } finally {
            setIsDesignationPdfLoading(false);
        }
    };

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp =>
            (emp.empName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            (emp.empCardNo.toString().includes(searchTerm)) ||
            (emp.cnicNo?.includes(searchTerm) ?? false) ||
            (emp.empOldNo?.includes(searchTerm) ?? false)
        );
    }, [employees, searchTerm]);

    const totalPages = Math.ceil(filteredEmployees.length / PAGE_SIZE);

    const paginatedEmployees = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredEmployees.slice(start, start + PAGE_SIZE);
    }, [filteredEmployees, currentPage]);

    // Reset to page 1 when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    return (
        <div className="flex h-screen min-w-0 flex-col bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 flex h-auto min-h-14 flex-col gap-3 border-b border-border bg-card px-3 py-3 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-2 lg:px-6">
                <div className="flex min-w-0 items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <UserCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="truncate text-sm font-display font-bold text-foreground">Employee Management</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-2.5">
                    <Button onClick={handleCreateClick} className="order-first col-span-2 h-10 gap-1.5 bg-[#1b366d] text-xs text-white shadow-xs transition-transform hover:bg-[#152a55] active:scale-[0.98] sm:order-3 sm:col-span-1 sm:h-8">
                        <Plus className="w-3.5 h-3.5" /> Create Employee
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleViewReport}
                        disabled={isPdfLoading || loading}
                        className="h-10 min-w-0 gap-1.5 border-slate-300 text-[10px] transition-transform hover:bg-slate-100 hover:text-foreground active:scale-[0.98] dark:border-slate-700 dark:hover:bg-slate-800 sm:h-8 sm:text-xs"
                    >
                        {isPdfLoading
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <FileDown className="w-3.5 h-3.5 text-[#1b366d] dark:text-white" />}
                        <span className="truncate">{isPdfLoading ? "Generating..." : "Employee Roster PDF"}</span>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleViewDesignationReport}
                        disabled={isDesignationPdfLoading || loading}
                        className="h-10 min-w-0 gap-1.5 border-slate-300 text-[10px] transition-transform hover:bg-slate-100 hover:text-foreground active:scale-[0.98] dark:border-slate-700 dark:hover:bg-slate-800 sm:h-8 sm:text-xs"
                    >
                        {isDesignationPdfLoading
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Filter className="w-3.5 h-3.5 text-slate-500" />}
                        <span className="truncate">{isDesignationPdfLoading ? "Generating..." : "By Designation"}</span>
                    </Button>
                </div>
            </header>

            {/* Content */}
            <div className="mx-auto w-full max-w-[1600px] min-w-0 flex-1 space-y-4 overflow-auto p-3 sm:space-y-6 sm:p-4 lg:p-6">
                {/* Stats / Overview Row */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:gap-4 sm:p-4">
                        <div className="shrink-0 rounded-xl bg-sidebar/10 p-2.5 sm:p-3"><UserCircle className="h-5 w-5 text-sidebar sm:h-6 sm:w-6" /></div>
                        <div>
                            <p className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground sm:text-[10px]">Total Employees</p>
                            <h3 className="text-lg font-black tabular-nums sm:text-xl">{employees.length}</h3>
                        </div>
                    </div>
                    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:gap-4 sm:p-4">
                        <div className="shrink-0 rounded-xl bg-green-500/10 p-2.5 sm:p-3"><CheckCircle2 className="h-5 w-5 text-green-500 sm:h-6 sm:w-6" /></div>
                        <div>
                            <p className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground sm:text-[10px]">Active</p>
                            <h3 className="text-lg font-black tabular-nums sm:text-xl">{employees.filter(e => e.status).length}</h3>
                        </div>
                    </div>
                    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:gap-4 sm:p-4">
                        <div className="shrink-0 rounded-xl bg-red-500/10 p-2.5 sm:p-3"><XCircle className="h-5 w-5 text-red-500 sm:h-6 sm:w-6" /></div>
                        <div>
                            <p className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground sm:text-[10px]">Inactive</p>
                            <h3 className="text-lg font-black tabular-nums sm:text-xl">{employees.filter(e => !e.status).length}</h3>
                        </div>
                    </div>
                    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:gap-4 sm:p-4">
                        <div className="shrink-0 rounded-xl bg-purple-500/10 p-2.5 sm:p-3"><Building2 className="h-5 w-5 text-purple-500 sm:h-6 sm:w-6" /></div>
                        <div>
                            <p className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground sm:text-[10px]">Departments</p>
                            <h3 className="text-lg font-black tabular-nums sm:text-xl">{new Set(employees.map(e => e.deptName || e.departmentCode).filter(Boolean)).size}</h3>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search by name, ID, CNIC..."
                            className="h-11 border-border bg-background/50 pl-10 text-base transition-all focus:ring-2 focus:ring-primary/20 sm:text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex min-w-0 items-center justify-between gap-3 sm:justify-end sm:gap-4">
                        <div className="min-w-0 truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                            {filteredEmployees.length > 0
                                ? `Showing ${((currentPage - 1) * PAGE_SIZE) + 1}-${Math.min(currentPage * PAGE_SIZE, filteredEmployees.length)} of ${filteredEmployees.length}`
                                : "No results"}
                        </div>
                        <Button variant="outline" size="sm" className="h-11 shrink-0 gap-2 border-border px-3" onClick={() => fetchEmployees()}>
                            <Filter className="h-4 w-4" /> Filter
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col"
                >
                    <CoolpointLoadingBoundary loading={loading} label="Loading employees">
                    <div className="hidden xl:block">
                    <Table containerClassName="max-h-[calc(100vh-340px)] min-h-[350px]">
                        <TableHeader className="bg-secondary/95 backdrop-blur-sm border-b border-border sticky top-0 z-20 shadow-xs">
                            <TableRow className="hover:bg-transparent border-border">
                                <TableHead className="w-24 font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-6 sticky top-0 bg-secondary/95">ID</TableHead>
                                <TableHead className="min-w-[200px] font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-4 sticky top-0 bg-secondary/95">Employee Details</TableHead>
                                <TableHead className="min-w-[180px] font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-4 sticky top-0 bg-secondary/95">Placement</TableHead>
                                <TableHead className="w-28 font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-4 sticky top-0 bg-secondary/95">Category</TableHead>
                                <TableHead className="w-36 font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-4 sticky top-0 bg-secondary/95">Identification</TableHead>
                                <TableHead className="w-28 font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-4 sticky top-0 bg-secondary/95">Status</TableHead>
                                <TableHead className="w-32 font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-6 text-right sticky top-0 bg-secondary/95">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                            <TableBody>
                                {paginatedEmployees.length > 0 ? (
                                    paginatedEmployees.map((emp) => (
                                        <TableRow key={`${emp.empCardNo}-${emp.site}`} className="hover:bg-secondary/30 transition-colors border-border">
                                            <TableCell className="font-sans font-bold text-xs py-2.5 px-6 tabular-nums">{emp.empCardNo}</TableCell>
                                            <TableCell className="py-2.5">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-foreground">{emp.empName}</span>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                        <Mail className="w-2.5 h-2.5" /> {emp.emailCompany || 'N/A'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-2.5">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                                                        <Building2 className="w-3 h-3 text-[#1b366d] dark:text-white shrink-0" /> {emp.deptName || (emp.departmentCode ? `Dept ${emp.departmentCode}` : 'General')}
                                                    </span>
                                                    {emp.designationName && (
                                                        <span className="text-[10px] text-muted-foreground font-normal pl-4">
                                                             {emp.designationName}
                                                        </span>
                                                    )}
                                                    {emp.scale && (
                                                        <span className="text-[9px] font-sans text-[#1b366d]/80 dark:text-white/80 font-medium pl-4">
                                                            Scale: {emp.scale}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-2.5">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                    {emp.category || 'N/A'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-2.5">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs font-sans tabular-nums text-foreground">{emp.cnicNo || 'N/A'}</span>
                                                    {emp.empOldNo && emp.empOldNo !== "0" && (
                                                        <span className="text-[9px] font-sans text-muted-foreground">Old: {emp.empOldNo}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-2.5">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${emp.status
                                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25"
                                                    : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25"
                                                    }`}>
                                                    {emp.status ? 'Active' : 'Inactive'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right py-2.5 px-6">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" title="Struck Off" onClick={() => handleStruckOff(emp)} disabled={loadingStruckOffId === emp.empCardNo}>
                                                        {loadingStruckOffId === emp.empCardNo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserX className="w-3.5 h-3.5" />}
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[#1b366d] dark:text-white hover:bg-[#1b366d]/10" onClick={() => handleEdit(emp)} disabled={loadingEditId === emp.empCardNo}>
                                                        {loadingEditId === emp.empCardNo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit className="w-3.5 h-3.5" />}
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(emp.empCardNo, emp.site)} disabled={deleteMutation.isPending && deleteMutation.variables?.code === emp.empCardNo}>
                                                        {deleteMutation.isPending && deleteMutation.variables?.code === emp.empCardNo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-40 text-center">
                                            <div className="max-w-xs mx-auto flex flex-col items-center">
                                                <div className="size-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-3">
                                                    <Search className="w-5 h-5" />
                                                </div>
                                                <p className="text-xs font-semibold text-foreground">
                                                    No employee records found
                                                </p>
                                                <p className="text-[11px] text-muted-foreground mt-1 mb-3">
                                                    Try adjusting your search criteria or clear the query.
                                                </p>
                                                {searchTerm && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSearchTerm("")}
                                                        className="h-7 text-xs border-border"
                                                    >
                                                        Clear search
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:p-4 xl:hidden">
                        {paginatedEmployees.length > 0 ? (
                            paginatedEmployees.map((emp) => (
                                <article key={`${emp.empCardNo}-${emp.site}`} className="min-w-0 rounded-xl border border-border bg-background/60 p-3 shadow-sm sm:p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="truncate text-sm font-bold text-foreground">{emp.empName}</h3>
                                            <p className="mt-1 text-xs font-semibold tabular-nums text-muted-foreground">ID {emp.empCardNo}</p>
                                        </div>
                                        <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-tight ${emp.status
                                            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                            : "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                                            }`}>
                                            {emp.status ? "Active" : "Inactive"}
                                        </span>
                                    </div>

                                    <div className="mt-3 min-w-0 space-y-2 border-t border-border pt-3">
                                        <p className="flex min-w-0 items-center gap-2 text-xs font-medium text-foreground">
                                            <Building2 className="h-3.5 w-3.5 shrink-0 text-[#1b366d] dark:text-white" />
                                            <span className="truncate">{emp.deptName || (emp.departmentCode ? `Dept ${emp.departmentCode}` : "General")}</span>
                                        </p>
                                        {emp.designationName && (
                                            <p className="truncate pl-[22px] text-[11px] text-muted-foreground">{emp.designationName}</p>
                                        )}
                                        {emp.scale && (
                                            <p className="pl-[22px] text-[10px] font-medium text-[#1b366d]/80 dark:text-white/80">Scale: {emp.scale}</p>
                                        )}
                                        <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-1">
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Category</p>
                                                <p className="mt-0.5 truncate text-xs text-foreground">{emp.category || "N/A"}</p>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">CNIC</p>
                                                <p className="mt-0.5 break-all text-xs tabular-nums text-foreground">{emp.cnicNo || "N/A"}</p>
                                            </div>
                                            {emp.empOldNo && emp.empOldNo !== "0" && (
                                                <div className="min-w-0">
                                                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Old ID</p>
                                                    <p className="mt-0.5 truncate text-xs text-foreground">{emp.empOldNo}</p>
                                                </div>
                                            )}
                                            <div className="col-span-2 flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                                                <Mail className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{emp.emailCompany || "N/A"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex gap-2 border-t border-border pt-3">
                                        <Button
                                            variant="outline"
                                            className="h-11 min-w-0 flex-1 gap-1 px-2 text-[10px] text-destructive"
                                            title="Struck Off"
                                            aria-label={`Struck off ${emp.empName}`}
                                            onClick={() => handleStruckOff(emp)}
                                            disabled={loadingStruckOffId === emp.empCardNo}
                                        >
                                            {loadingStruckOffId === emp.empCardNo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserX className="h-3.5 w-3.5" />}
                                            <span>Struck Off</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-11 min-w-0 flex-1 gap-1 px-2 text-[10px] text-[#1b366d] dark:text-white"
                                            aria-label={`Edit ${emp.empName}`}
                                            onClick={() => handleEdit(emp)}
                                            disabled={loadingEditId === emp.empCardNo}
                                        >
                                            {loadingEditId === emp.empCardNo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Edit className="h-3.5 w-3.5" />}
                                            <span>Edit</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-11 min-w-0 flex-1 gap-1 px-2 text-[10px] text-destructive"
                                            aria-label={`Delete ${emp.empName}`}
                                            onClick={() => handleDelete(emp.empCardNo, emp.site)}
                                            disabled={deleteMutation.isPending && deleteMutation.variables?.code === emp.empCardNo}
                                        >
                                            {deleteMutation.isPending && deleteMutation.variables?.code === emp.empCardNo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                            <span>Delete</span>
                                        </Button>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="col-span-full flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 py-8 text-center">
                                <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                                    <Search className="h-5 w-5" />
                                </div>
                                <p className="text-xs font-semibold text-foreground">No employee records found</p>
                                <p className="mb-3 mt-1 max-w-xs text-[11px] text-muted-foreground">Try adjusting your search criteria or clear the query.</p>
                                {searchTerm && (
                                    <Button variant="outline" size="sm" onClick={() => setSearchTerm("")} className="h-10 text-xs">
                                        Clear search
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                    </CoolpointLoadingBoundary>

                    {totalPages > 1 && (
                        <div className="border-t border-border bg-card p-3 sm:p-4">
                            <Pagination>
                                <PaginationContent className="w-full justify-between sm:justify-center">
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                                            className={cn("h-11 cursor-pointer text-xs", currentPage === 1 && "pointer-events-none opacity-50")}
                                        />
                                    </PaginationItem>

                                    <PaginationItem>
                                        <div className="px-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground sm:px-6 sm:text-xs">
                                            Page <span className="text-foreground">{currentPage}</span> of {totalPages}
                                        </div>
                                    </PaginationItem>

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                                            className={cn("h-11 cursor-pointer text-xs", currentPage === totalPages && "pointer-events-none opacity-50")}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Form Modals */}
            {isFormOpen && (
                <EmployeeForm
                    employee={editingEmployee}
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                />
            )}
            {isStruckOffOpen && editingEmployee && (
                <EmployeeStruckOffForm
                    employee={editingEmployee}
                    isOpen={isStruckOffOpen}
                    onClose={() => setIsStruckOffOpen(false)}
                />
            )}
        </div>
    );
};

export default EmployeesPage;
