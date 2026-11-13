import React, { useState, useEffect, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
    Clock,
    Building2,
    Users,
    Save,
    RotateCcw,
    CheckSquare,
    Square,
    Search,
    Loader2,
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    FileText,
    Filter,
    Hash,
    History,
    Trash2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/shared/components/ui/dialog";
import { toast } from "sonner";
import { authService } from "@/modules/auth/services/authService";
import { departmentService, Department } from "../services/departmentService";
import {
    dutyTimingService,
    DutyTimingEmployeeRow,
    DutyTimingTransactionSummary,
} from "../services/dutyTimingService";
import { usePermissions } from "@/modules/user-management/hooks/usePermissions";

export default function DutyTimingPage() {
    const userSite = authService.getSite() || "";
    const { canView, canAdd, canEdit, canDelete } = usePermissions("HR", "Duty Timings");

    // Master Form States
    const [transNo, setTransNo] = useState<number>(0);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDept, setSelectedDept] = useState<string>("");
    const [fromDate, setFromDate] = useState<string>(() => format(new Date(), "yyyy-MM-dd"));
    const [toDate, setToDate] = useState<string>(() => format(new Date(), "yyyy-MM-dd"));
    const [fromTime, setFromTime] = useState<string>("08:00");
    const [toTime, setToTime] = useState<string>("14:00");
    const fromTimeRef = React.useRef(fromTime);
    const toTimeRef = React.useRef(toTime);
    const [remarks, setRemarks] = useState<string>("");
    const [conflictWarning, setConflictWarning] = useState<string | null>(null);

    // Child Data States
    const [employees, setEmployees] = useState<DutyTimingEmployeeRow[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");

    // UI Loading & Modal States
    const [loadingDepts, setLoadingDepts] = useState<boolean>(false);
    const [loadingEmps, setLoadingEmps] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
    const [recentTransactions, setRecentTransactions] = useState<DutyTimingTransactionSummary[]>([]);
    const [loadingRecent, setLoadingRecent] = useState<boolean>(false);
    const isManualLoadingRef = React.useRef(false);

    // Load Departments and Next TransNo on mount
    useEffect(() => {
        const initData = async () => {
            if (!userSite) return;
            try {
                setLoadingDepts(true);
                const [depts, nextNo] = await Promise.all([
                    departmentService.getAll(userSite),
                    dutyTimingService.getMaxNo(userSite).catch(() => 1),
                ]);
                setDepartments(depts || []);
                setTransNo(nextNo || 1);
            } catch (error) {
                console.error("Failed to load metadata", error);
                toast.error("Failed to load departments.");
            } finally {
                setLoadingDepts(false);
            }
        };
        initData();
    }, [userSite]);

    // Keep latest master times available to the employee load without refetching and overwriting row edits.
    // Fetch employees when Department or Dates change.
    useEffect(() => {
        fromTimeRef.current = fromTime;
    }, [fromTime]);

    useEffect(() => {
        toTimeRef.current = toTime;
    }, [toTime]);

    useEffect(() => {
        if (!selectedDept || !fromDate || !toDate || !userSite) {
            setEmployees([]);
            setConflictWarning(null);
            return;
        }

        if (isManualLoadingRef.current) {
            isManualLoadingRef.current = false;
            return;
        }

        const fetchEmployees = async () => {
            try {
                setLoadingEmps(true);
                const deptCode = parseInt(selectedDept, 10);
                const details = await dutyTimingService.getEmployees(
                    deptCode,
                    fromDate,
                    toDate,
                    fromTimeRef.current,
                    toTimeRef.current,
                    userSite
                );

                if (details) {
                    setTransNo(details.transNo);
                    if (details.remarks) {
                        setRemarks(details.remarks);
                    }
                    if (details.fromTime) {
                        setFromTime(details.fromTime);
                    }
                    if (details.toTime) {
                        setToTime(details.toTime);
                    }
                    setEmployees(details.employees || []);
                    if (details.conflictWarning) {
                        setConflictWarning(details.conflictWarning);
                    } else {
                        setConflictWarning(null);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch employees", error);
                toast.error("Failed to fetch department employees.");
            } finally {
                setLoadingEmps(false);
            }
        };

        fetchEmployees();
    }, [selectedDept, fromDate, toDate, userSite]);

    // Load transaction by TransNo
    const handleLoadTransaction = async (targetTransNo: number) => {
        if (!targetTransNo || !userSite) return;
        try {
            setLoadingEmps(true);
            isManualLoadingRef.current = true;
            const details = await dutyTimingService.getTransaction(targetTransNo, userSite);
            if (details) {
                setTransNo(details.transNo);
                setSelectedDept(details.departmentCode.toString());
                setFromDate(format(parseISO(details.fromDate), "yyyy-MM-dd"));
                setToDate(format(parseISO(details.toDate), "yyyy-MM-dd"));
                setFromTime(details.fromTime || "08:00");
                setToTime(details.toTime || "14:00");
                setRemarks(details.remarks || "");
                setEmployees(details.employees || []);
                setConflictWarning(null);
                setIsHistoryOpen(false);
                toast.success(`Loaded Duty Timing transaction #${details.transNo}`);
            }
        } catch (error: any) {
            console.error("Failed to load transaction", error);
            toast.error(error.response?.data?.message || `Transaction #${targetTransNo} not found.`);
        } finally {
            setLoadingEmps(false);
        }
    };

    // Load recent transactions for history modal
    const handleOpenHistory = async () => {
        setIsHistoryOpen(true);
        try {
            setLoadingRecent(true);
            const list = await dutyTimingService.getRecent(userSite, 30);
            setRecentTransactions(list || []);
        } catch (error) {
            toast.error("Failed to load recent transactions.");
        } finally {
            setLoadingRecent(false);
        }
    };

    // Filtered employees based on search
    const filteredEmployees = useMemo(() => {
        if (!searchTerm.trim()) return employees;
        const q = searchTerm.toLowerCase();
        return employees.filter(
            (e) =>
                e.empCardNo.toString().includes(q) ||
                e.empName.toLowerCase().includes(q) ||
                (e.designationName && e.designationName.toLowerCase().includes(q))
        );
    }, [employees, searchTerm]);

    // Selection Counters
    const totalCount = employees.length;
    const selectedCount = employees.filter((e) => e.isSelected).length;
    const allChecked = totalCount > 0 && selectedCount === totalCount;
    const someChecked = selectedCount > 0 && selectedCount < totalCount;
    const hasExistingAssignments = employees.some((e) => e.isAssigned);

    // Toggle All Rows
    const handleCheckAll = () => {
        setEmployees((prev) => prev.map((e) => ({ ...e, isSelected: true })));
    };

    const handleUncheckAll = () => {
        setEmployees((prev) => prev.map((e) => ({ ...e, isSelected: false })));
    };

    const updateSelectedEmployeeTimes = (field: "fromTime" | "toTime", value: string) => {
        setEmployees((prev) =>
            prev.map((employee) => employee.isSelected ? { ...employee, [field]: value } : employee)
        );
    };

    // Toggle Single Row
    const handleToggleEmployee = (empCardNo: number) => {
        setEmployees((prev) => prev.map((employee) => employee.empCardNo === empCardNo
            ? { ...employee, isSelected: !employee.isSelected }
            : employee
        ));
    };

    const handleReset = async () => {
        setSelectedDept("");
        setFromDate(format(new Date(), "yyyy-MM-dd"));
        setToDate(format(new Date(), "yyyy-MM-dd"));
        setFromTime("08:00");
        setToTime("14:00");
        setRemarks("");
        setConflictWarning(null);
        setEmployees([]);
        setSearchTerm("");
        try {
            const nextNo = await dutyTimingService.getMaxNo(userSite);
            setTransNo(nextNo || 1);
        } catch {
            setTransNo(1);
        }
    };

    // Save master changes, update selected rows, retain unchecked rows, and remove only explicit removals.
    const handleSave = async () => {
        if (!selectedDept) {
            toast.warning("Please select a department first.");
            return;
        }
        if (!fromDate || !toDate) {
            toast.warning("Please select valid From and To dates.");
            return;
        }
        if (new Date(fromDate) > new Date(toDate)) {
            toast.warning("From Date cannot be later than To Date.");
            return;
        }
        if (!fromTime || !toTime) {
            toast.warning("Please specify From and To working times.");
            return;
        }

        const deptCode = parseInt(selectedDept, 10);

        // Unchecked existing assignments are removed on save; checked employees are added/updated.
        const removedEmployeeCardNos = employees
            .filter((employee) => employee.isAssigned && !employee.isSelected)
            .map((employee) => employee.empCardNo);
        const selectedChildItems = employees
            .filter((e) => e.isSelected)
            .map((e) => ({
                empCardNo: e.empCardNo,
                empName: e.empName,
                departmentCode: deptCode,
                designationName: e.designationName || "",
                fromTime: e.fromTime || fromTime,
                toTime: e.toTime || toTime,
            }));
        if (selectedChildItems.length === 0 && !hasExistingAssignments) {
            toast.warning("Select at least one employee before saving a new duty timing transaction.");
            return;
        }

        try {
            setSaving(true);
            const payload = {
                transNo: transNo || 0,
                departmentCode: deptCode,
                fromDate,
                toDate,
                fromTime,
                toTime,
                remarks: remarks.trim() || undefined,
                selectedEmployees: selectedChildItems,
                removeEmployeeCardNos: removedEmployeeCardNos,
            };

            const result = await dutyTimingService.saveTransaction(payload, userSite);
            setTransNo(result.transNo);
            setConflictWarning(null);
            toast.success(`Duty Timing transaction #${result.transNo} saved successfully.`);

            // Refresh state strictly from the saved transaction so ONLY saved employees remain checked
            isManualLoadingRef.current = true;
            const details = await dutyTimingService.getTransaction(result.transNo, userSite);
            if (details) {
                setEmployees(details.employees || []);
            }
        } catch (error: any) {
            console.error("Save error:", error);
            const errMsg =
                error.response?.data?.details ||
                error.response?.data?.message ||
                "Failed to save duty timing transaction.";
            toast.error(errMsg, { duration: 6000 });
        } finally {
            setSaving(false);
        }
    };

    // Delete Transaction
    const handleDelete = async () => {
        if (!transNo || transNo <= 0) return;
        if (!confirm(`Are you sure you want to delete Duty Timing Transaction #${transNo}?`)) return;

        try {
            setSaving(true);
            await dutyTimingService.deleteTransaction(transNo, userSite);
            toast.success(`Transaction #${transNo} deleted successfully.`);
            await handleReset();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete transaction.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            {/* Standard Header */}
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                            Duty Timing Assignment
                            <Badge variant="outline" className="text-[10px] font-sans font-semibold text-[#171858] border-[#171858]/30">
                                Trans #{transNo}
                            </Badge>
                        </h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenHistory}
                        className="h-9 gap-1.5 text-xs border-dashed"
                    >
                        <History className="w-4 h-4 text-muted-foreground" />
                        <span className="hidden sm:inline">Browse Trans</span>
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        className="h-9 gap-1.5 text-xs"
                    >
                        <RotateCcw className="w-4 h-4" /> Reset
                    </Button>

                    {transNo > 0 && employees.some((e) => e.isAssigned) && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={saving}
                            className="h-9 gap-1.5 text-xs"
                        >
                            <Trash2 className="w-4 h-4" /> Delete
                        </Button>
                    )}

                    <Button
                        onClick={handleSave}
                        disabled={saving || !selectedDept || employees.length === 0 || (selectedCount === 0 && !hasExistingAssignments)}
                        size="sm"
                        className="gap-2 h-9 text-xs font-bold bg-[#171858] hover:bg-[#121344] text-white shadow-xs active:scale-[0.98] transition-transform"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Duty Timings
                    </Button>
                </div>
            </header>

            {/* Page Content */}
            <div className="flex-1 overflow-auto p-6 space-y-6 max-w-[1600px] mx-auto w-full">
                {/* Master Details Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
                >
                    <div className="p-4 border-b border-border bg-secondary/20 flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Filter className="w-4 h-4 text-primary" /> Master Information
                        </h3>
                        <span className="text-xs text-muted-foreground font-sans">
                            Transaction ID: <strong className="text-foreground">#{transNo}</strong>
                        </span>
                    </div>
                    <div className="p-6 space-y-4">
                        {/* Overlap / Conflict Warning Notice */}
                        {conflictWarning && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3 text-amber-700 dark:text-amber-300 text-xs shadow-sm"
                            >
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                                <div className="flex-1 space-y-0.5">
                                    <span className="font-bold uppercase tracking-wider text-[11px] block text-amber-800 dark:text-amber-200">
                                        Date Range Conflict Warning
                                    </span>
                                    <span className="leading-relaxed">{conflictWarning}</span>
                                </div>
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                            {/* Transaction ID Lookup */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Hash className="w-3.5 h-3.5" /> Trans ID
                                </Label>
                                <div className="flex gap-1.5">
                                    <Input
                                        type="number"
                                        value={transNo || ""}
                                        onChange={(e) => setTransNo(Number(e.target.value))}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleLoadTransaction(transNo);
                                        }}
                                        className="h-10 bg-background font-sans font-bold"
                                        placeholder="Trans #"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleLoadTransaction(transNo)}
                                        className="h-10 w-10 shrink-0"
                                        title="Find Transaction by ID"
                                    >
                                        <Search className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                </div>
                            </div>

                            {/* Department Select */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5" /> Department <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={selectedDept}
                                    onValueChange={setSelectedDept}
                                    disabled={loadingDepts}
                                >
                                    <SelectTrigger className="h-10 bg-background">
                                        <SelectValue placeholder={loadingDepts ? "Loading..." : "Select Dept"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((d) => (
                                            <SelectItem key={d.code} value={d.code}>
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* From Date */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" /> From Date <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="h-10 bg-background font-medium"
                                />
                            </div>

                            {/* To Date */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" /> To Date <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="h-10 bg-background font-medium"
                                />
                            </div>

                            {/* From Time */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" /> From Time <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    type="time"
                                    value={fromTime}
                                    onChange={(e) => {
                                        setFromTime(e.target.value);
                                        updateSelectedEmployeeTimes("fromTime", e.target.value);
                                    }}
                                    className="h-10 bg-background font-medium"
                                />
                            </div>

                            {/* To Time */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" /> To Time <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    type="time"
                                    value={toTime}
                                    onChange={(e) => {
                                        setToTime(e.target.value);
                                        updateSelectedEmployeeTimes("toTime", e.target.value);
                                    }}
                                    className="h-10 bg-background font-medium"
                                />
                            </div>
                        </div>

                        {/* Remarks Row */}
                        <div className="mt-4 pt-4 border-t border-border/40">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" /> Remarks (Optional)
                                </Label>
                                <Input
                                    placeholder="e.g. Ramadan Working Timings / Summer Schedule"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="h-10 bg-background"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Employees Child Table Card */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
                >
                    <div className="p-4 border-b border-border bg-secondary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Users className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Assigned Employees (Child Records)
                                </h3>
                                <p className="text-[11px] text-muted-foreground">
                                    {selectedDept ? (
                                        <span>
                                            Total Active in Dept: <strong>{totalCount}</strong> &bull; Selected to Add/Update:{" "}
                                            <strong className="text-primary font-bold">{selectedCount}</strong>
                                            {employees.some((employee) => employee.isAssigned && !employee.isSelected) && <> &bull; Marked for removal: <strong className="text-destructive">{employees.filter((employee) => employee.isAssigned && !employee.isSelected).length}</strong></>}
                                            {selectedCount === 0 && !hasExistingAssignments && <> &bull; <strong className="text-amber-600">Select at least one employee to enable saving.</strong></>}
                                        </span>
                                    ) : (
                                        "Select a department above to load employees"
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Toolbar */}
                        {employees.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative w-48 sm:w-64">
                                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by ID or Name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 h-8 text-xs bg-background"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCheckAll}
                                    className="h-8 text-xs gap-1.5"
                                >
                                    <CheckSquare className="w-3.5 h-3.5 text-primary" />
                                    Check All
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleUncheckAll}
                                    className="h-8 text-xs gap-1.5"
                                >
                                    <Square className="w-3.5 h-3.5 text-muted-foreground" />
                                    Uncheck All
                                </Button>
                            </div>
                        )}
                    </div>

                    <div>
                        {loadingEmps ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                <Loader2 className="w-7 h-7 animate-spin text-primary" />
                                <p className="text-xs font-semibold">Loading department employees...</p>
                            </div>
                        ) : !selectedDept ? (
                            <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                                <Building2 className="w-8 h-8 text-muted-foreground/40 mb-1" />
                                <p className="text-xs font-semibold">Please select a Department from above to view and assign employees.</p>
                            </div>
                        ) : employees.length === 0 ? (
                            <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                                <AlertCircle className="w-8 h-8 text-amber-500/60 mb-1" />
                                <p className="text-xs font-semibold">No active employees found in the selected department.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-secondary/30">
                                        <TableRow className="border-b border-border">
                                            <TableHead className="w-12 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={allChecked}
                                                    ref={(input) => {
                                                        if (input) input.indeterminate = someChecked;
                                                    }}
                                                    onChange={(e) => {
                                                        if (e.target.checked) handleCheckAll();
                                                        else handleUncheckAll();
                                                    }}
                                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                                                    title="Select / Deselect All"
                                                />
                                            </TableHead>
                                            <TableHead className="w-28 text-xs font-bold uppercase tracking-wider">Employee ID</TableHead>
                                            <TableHead className="text-xs font-bold uppercase tracking-wider">Employee Name</TableHead>
                                            <TableHead className="text-xs font-bold uppercase tracking-wider">Designation</TableHead>
                                            <TableHead className="w-32 text-xs font-bold uppercase tracking-wider">From Date</TableHead>
                                            <TableHead className="w-32 text-xs font-bold uppercase tracking-wider">To Date</TableHead>
                                            <TableHead className="w-28 text-xs font-bold uppercase tracking-wider">From Time</TableHead>
                                            <TableHead className="w-28 text-xs font-bold uppercase tracking-wider">To Time</TableHead>
                                            <TableHead className="w-36 text-center text-xs font-bold uppercase tracking-wider">Save Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <AnimatePresence>
                                            {filteredEmployees.map((emp) => (
                                                <TableRow
                                                    key={emp.empCardNo}
                                                    onClick={() => handleToggleEmployee(emp.empCardNo)}
                                                        className={`cursor-pointer transition-colors border-b border-border/50 hover:bg-muted/50 ${
                                                        emp.isSelected ? "bg-primary/5 font-medium" : "opacity-60"
                                                    }`}
                                                >
                                                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            checked={emp.isSelected}
                                                            onChange={() => handleToggleEmployee(emp.empCardNo)}
                                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-sans text-xs font-bold text-foreground">
                                                        #{emp.empCardNo}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-foreground">
                                                        {emp.empName}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {emp.designationName || "N/A"}
                                                    </TableCell>
                                                    <TableCell className="text-xs font-medium text-foreground">
                                                        {fromDate}
                                                    </TableCell>
                                                    <TableCell className="text-xs font-medium text-foreground">
                                                        {toDate}
                                                    </TableCell>
                                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                                        <Input
                                                            type="time"
                                                            aria-label={`From time for ${emp.empName}`}
                                                            value={emp.fromTime || fromTime}
                                                            onChange={(e) => setEmployees((prev) => prev.map((row) =>
                                                                row.empCardNo === emp.empCardNo ? { ...row, fromTime: e.target.value } : row
                                                            ))}
                                                            className="h-8 min-w-24 bg-background font-sans text-xs"
                                                        />
                                                    </TableCell>
                                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                                        <Input
                                                            type="time"
                                                            aria-label={`To time for ${emp.empName}`}
                                                            value={emp.toTime || toTime}
                                                            onChange={(e) => setEmployees((prev) => prev.map((row) =>
                                                                row.empCardNo === emp.empCardNo ? { ...row, toTime: e.target.value } : row
                                                            ))}
                                                            className="h-8 min-w-24 bg-background font-sans text-xs"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {emp.isSelected ? (
                                                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 text-[10px]">
                                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                Will Save
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-muted-foreground text-[10px]">
                                                                Excluded
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </AnimatePresence>
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* History / Browse Transactions Dialog */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold">
                            <History className="w-5 h-5 text-primary" />
                            Recent Duty Timing Transactions
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Select any existing transaction to load, review, or edit its timing and assigned employees.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto mt-3 border rounded-lg">
                        {loadingRecent ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                <p className="text-xs font-semibold">Loading transactions...</p>
                            </div>
                        ) : recentTransactions.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-xs font-semibold">
                                No Duty Timing transactions found.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-secondary/30">
                                    <TableRow>
                                        <TableHead className="w-20 font-bold text-xs uppercase">Trans #</TableHead>
                                        <TableHead className="font-bold text-xs uppercase">Department</TableHead>
                                        <TableHead className="w-28 font-bold text-xs uppercase">From Date</TableHead>
                                        <TableHead className="w-28 font-bold text-xs uppercase">To Date</TableHead>
                                        <TableHead className="w-32 font-bold text-xs uppercase">Timings</TableHead>
                                        <TableHead className="w-24 text-center font-bold text-xs uppercase">Employees</TableHead>
                                        <TableHead className="w-20 text-right font-bold text-xs uppercase">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentTransactions.map((tx) => (
                                        <TableRow key={tx.transNo} className="hover:bg-muted/40">
                                            <TableCell className="font-sans font-bold text-xs text-primary">
                                                #{tx.transNo}
                                            </TableCell>
                                            <TableCell className="font-medium text-xs">
                                                {tx.departmentName || `Dept #${tx.departmentCode}`}
                                            </TableCell>
                                            <TableCell className="text-xs font-medium">
                                                {format(parseISO(tx.fromDate), "yyyy-MM-dd")}
                                            </TableCell>
                                            <TableCell className="text-xs font-medium">
                                                {format(parseISO(tx.toDate), "yyyy-MM-dd")}
                                            </TableCell>
                                            <TableCell className="text-xs font-sans">
                                                {tx.fromTime} - {tx.toTime}
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-xs">
                                                {tx.totalEmployees}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleLoadTransaction(tx.transNo)}
                                                    className="h-7 text-xs font-semibold"
                                                >
                                                    Load
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
