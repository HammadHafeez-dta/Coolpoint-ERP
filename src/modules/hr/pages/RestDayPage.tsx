import React, { useState, useEffect, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Building2,
    Users,
    Save,
    RotateCcw,
    CheckSquare,
    Square,
    Search,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Clock,
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
    restDayService,
    RestDayEmployeeRow,
    RestDayTransactionSummary,
} from "../services/restDayService";
import { usePermissions } from "@/modules/user-management/hooks/usePermissions";
import { REST_DAYS, encodeRestDaySchedule, formatRestDaySchedule } from "../utils/restDaySchedule";

export default function RestDayPage() {
    const userSite = authService.getSite() || "";
    const { canView, canAdd, canEdit, canDelete } = usePermissions("HR", "Rest Day");

    // Master Form States
    const [transNo, setTransNo] = useState<number>(0);
    const [weeklyTransNo, setWeeklyTransNo] = useState<number>(0);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDept, setSelectedDept] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>(() => format(new Date(), "yyyy-MM-dd"));
    const [remarks, setRemarks] = useState<string>("");
    const [assignmentMode, setAssignmentMode] = useState<"date" | "weekly">("date");
    const [weeklyDays, setWeeklyDays] = useState<string[]>([]);
    const [weeklyRemarks, setWeeklyRemarks] = useState<string>("");

    // Child Data States
    const [employees, setEmployees] = useState<RestDayEmployeeRow[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");

    // UI Loading & Modal States
    const [loadingDepts, setLoadingDepts] = useState<boolean>(false);
    const [loadingEmps, setLoadingEmps] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
    const [recentTransactions, setRecentTransactions] = useState<RestDayTransactionSummary[]>([]);
    const [loadingRecent, setLoadingRecent] = useState<boolean>(false);

    // Derived Day of Week
    const dayOfWeek = useMemo(() => {
        if (!selectedDate) return "";
        try {
            const dateObj = parseISO(selectedDate);
            return format(dateObj, "EEEE");
        } catch {
            return "";
        }
    }, [selectedDate]);

    // Load Departments and Next TransNo on mount
    useEffect(() => {
        const initData = async () => {
            if (!userSite) return;
            try {
                setLoadingDepts(true);
                const [depts, nextNo, nextWeeklyNo] = await Promise.all([
                    departmentService.getAll(userSite),
                    restDayService.getMaxNo(userSite).catch(() => 1),
                    restDayService.getNextWeeklyTransNo(userSite).catch(() => 1),
                ]);
                setDepartments(depts || []);
                setTransNo(nextNo || 1);
                setWeeklyTransNo(nextWeeklyNo || 1);
            } catch (error) {
                console.error("Failed to load metadata", error);
                toast.error("Failed to load departments.");
            } finally {
                setLoadingDepts(false);
            }
        };
        initData();
    }, [userSite]);

    // Fetch Employees when Department or Date changes
    useEffect(() => {
        if (!selectedDept || !selectedDate || !userSite) {
            setEmployees([]);
            return;
        }

        const fetchEmployees = async () => {
            try {
                setLoadingEmps(true);
                const deptCode = parseInt(selectedDept, 10);
                const details = await restDayService.getEmployees(deptCode, selectedDate, userSite);

                if (details) {
                    setTransNo(details.transNo);
                    if (details.remarks) {
                        setRemarks(details.remarks);
                    }
                    setEmployees(assignmentMode === "weekly"
                        ? (details.employees || []).map((employee) => ({ ...employee, isSelected: false }))
                        : details.employees || []);
                }
            } catch (error) {
                console.error("Failed to fetch employees", error);
                toast.error("Failed to fetch department employees.");
            } finally {
                setLoadingEmps(false);
            }
        };

        fetchEmployees();
    }, [selectedDept, selectedDate, userSite, assignmentMode]);

    // Load transaction by TransNo
    const handleLoadTransaction = async (targetTransNo: number) => {
        if (!targetTransNo || !userSite) return;
        try {
            setLoadingEmps(true);
            const details = await restDayService.getTransaction(targetTransNo, userSite);
            if (details) {
                setTransNo(details.transNo);
                setSelectedDept(details.departmentCode.toString());
                setSelectedDate(format(parseISO(details.restDate), "yyyy-MM-dd"));
                setRemarks(details.remarks || "");
                setEmployees(details.employees || []);
                setIsHistoryOpen(false);
                toast.success(`Loaded Rest Day transaction #${details.transNo}`);
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
            const list = await restDayService.getRecent(userSite, 30);
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

    // Toggle All Rows
    const handleCheckAll = () => {
        setEmployees((prev) => prev.map((e) => ({ ...e, isSelected: true })));
    };

    const handleUncheckAll = () => {
        setEmployees((prev) => prev.map((e) => ({ ...e, isSelected: false })));
    };

    // Toggle Single Row
    const handleToggleEmployee = (empCardNo: number) => {
        setEmployees((prev) =>
            prev.map((e) =>
                e.empCardNo === empCardNo ? { ...e, isSelected: !e.isSelected } : e
            )
        );
    };

    const handleReset = async () => {
        setAssignmentMode("date");
        setWeeklyDays([]);
        setWeeklyRemarks("");
        setSelectedDept("");
        setSelectedDate(format(new Date(), "yyyy-MM-dd"));
        setRemarks("");
        setEmployees([]);
        setSearchTerm("");
        try {
            const nextNo = await restDayService.getMaxNo(userSite);
            setTransNo(nextNo || 1);
        } catch {
            setTransNo(1);
        }
    };

    const handleSaveWeekly = async () => {
        if (!selectedDept) return toast.warning("Please select a department first.");
        const selected = employees.filter((employee) => employee.isSelected);
        if (selected.length === 0) return toast.warning("Select at least one employee.");
        const encodedDays = encodeRestDaySchedule(weeklyDays.join(","));
        if (!encodedDays) return toast.warning("Select at least one weekly rest day.");
        try {
            setSaving(true);
            const result = await restDayService.saveWeeklySchedule({
                departmentCode: Number(selectedDept),
                empCardNos: selected.map((employee) => employee.empCardNo),
                restDay: encodedDays,
                remarks: weeklyRemarks.trim() || undefined,
            }, userSite);
            const readableDays = formatRestDaySchedule(encodedDays);
            setEmployees((current) => current.map((employee) => employee.isSelected
                ? { ...employee, weeklyRestDays: readableDays }
                : employee));
            toast.success(`Transaction #${result.transNo} saved. ${result.updatedCount} employee(s) assigned ${readableDays}.`);
            setWeeklyTransNo(await restDayService.getNextWeeklyTransNo(userSite).catch(() => result.transNo + 1));
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Could not save weekly rest days.");
        } finally {
            setSaving(false);
        }
    };

    // Save Master + Child in One Transaction (ONLY CHECKED EMPLOYEES ARE SAVED)
    const handleSave = async () => {
        if (!selectedDept) {
            toast.warning("Please select a department first.");
            return;
        }
        if (!selectedDate) {
            toast.warning("Please select a valid date.");
            return;
        }

        const deptCode = parseInt(selectedDept, 10);
        
        // 1. Filter ONLY checked employees
        const selectedChildItems = employees
            .filter((e) => e.isSelected)
            .map((e) => ({
                empCardNo: e.empCardNo,
                empName: e.empName,
                departmentCode: deptCode,
                designationName: e.designationName || "",
            }));

        try {
            setSaving(true);
            const payload = {
                transNo: transNo || 0,
                departmentCode: deptCode,
                restDate: selectedDate,
                restDay: dayOfWeek,
                remarks: remarks.trim() || undefined,
                selectedEmployees: selectedChildItems, // Only checked rows saved!
            };

            const result = await restDayService.saveTransaction(payload, userSite);
            setTransNo(result.transNo);
            toast.success(`Transaction #${result.transNo} saved with ${selectedChildItems.length} employee(s).`);

            // Refresh state to update assignment flags
            const details = await restDayService.getEmployees(deptCode, selectedDate, userSite);
            if (details) {
                setEmployees(details.employees || []);
            }
        } catch (error: any) {
            console.error("Save error:", error);
            toast.error(error.response?.data?.message || "Failed to save rest day transaction.");
        } finally {
            setSaving(false);
        }
    };

    // Delete Transaction
    const handleDelete = async () => {
        if (!transNo || transNo <= 0) return;
        if (!confirm(`Are you sure you want to delete Rest Day Transaction #${transNo}?`)) return;

        try {
            setSaving(true);
            await restDayService.deleteTransaction(transNo, userSite);
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
                        <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                            Rest Day Assignment
                            <Badge variant="outline" className="text-[10px] font-sans font-semibold text-[#171858] border-[#171858]/30">
                                Trans #{assignmentMode === "date" ? transNo : weeklyTransNo}
                            </Badge>
                        </h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    {assignmentMode === "date" && <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenHistory}
                        className="h-9 gap-1.5 text-xs border-dashed"
                    >
                        <History className="w-4 h-4 text-muted-foreground" />
                        <span className="hidden sm:inline">Browse Trans</span>
                    </Button>}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        className="h-9 gap-1.5 text-xs"
                    >
                        <RotateCcw className="w-4 h-4" /> Reset
                    </Button>

                    {assignmentMode === "date" && transNo > 0 && employees.some(e => e.isAssigned) && (
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
                        onClick={assignmentMode === "date" ? handleSave : handleSaveWeekly}
                        disabled={saving || !selectedDept || employees.length === 0 || (assignmentMode === "weekly" && (weeklyDays.length === 0 || selectedCount === 0))}
                        size="sm"
                        className="gap-2 h-9 text-xs font-bold bg-[#171858] hover:bg-[#121344] text-white shadow-xs active:scale-[0.98] transition-transform"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {assignmentMode === "date" ? "Save Rest Day" : "Save Weekly Schedule"}
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
                        <div className="flex items-center gap-2">
                            {assignmentMode === "date" && <>
                            <span className="text-xs text-muted-foreground font-sans">
                                Transaction ID: <strong className="text-foreground">#{transNo}</strong>
                            </span>
                            {dayOfWeek && (
                                <Badge variant="outline" className="bg-background text-primary border-primary/30 font-semibold text-xs">
                                    {dayOfWeek}
                                </Badge>
                            )}
                            </>}
                            {assignmentMode === "weekly" && <>
                                <span className="text-xs text-muted-foreground font-sans">Transaction ID: <strong className="text-foreground">#{weeklyTransNo}</strong></span>
                                <Badge variant="outline" className="bg-background text-primary border-primary/30 font-semibold text-xs">Recurring weekly</Badge>
                            </>}
                        </div>
                    </div>
                    <div className="p-6">
                        <label className="mb-5 flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-secondary/20 p-3">
                            <input
                                type="checkbox"
                                checked={assignmentMode === "weekly"}
                                onChange={(event) => setAssignmentMode(event.target.checked ? "weekly" : "date")}
                                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary accent-primary focus:ring-primary"
                            />
                            <span>
                                <span className="block text-sm font-semibold text-foreground">Use recurring weekly rest days</span>
                                <span className="block text-xs text-muted-foreground">Choose Sunday, Saturday, or both for the selected employees.</span>
                            </span>
                        </label>
                        <div className={`grid grid-cols-1 ${assignmentMode === "date" ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2"} gap-4 items-end`}>
                            {/* Transaction ID Lookup */}
                            {assignmentMode === "date" && <>
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
                            </>}

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
                                        <SelectValue placeholder={loadingDepts ? "Loading departments..." : "Select Department"} />
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

                            {/* Date Picker */}
                            {assignmentMode === "date" && <>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" /> Specific Date <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="h-10 bg-background font-medium"
                                />
                            </div>
                            </>}
                            {assignmentMode === "weekly" && <>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> Trans ID</Label>
                                <Input type="number" value={weeklyTransNo || ""} readOnly className="h-10 bg-muted/50 font-sans font-bold" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Weekly Rest Days <span className="text-destructive">*</span></Label>
                                <div className="flex flex-wrap gap-2">
                                    {REST_DAYS.filter((day) => day === "Sunday" || day === "Saturday").map((day) => {
                                        const checked = weeklyDays.includes(day);
                                        return <Button key={day} type="button" size="sm" variant={checked ? "default" : "outline"} onClick={() => setWeeklyDays((current) => checked ? current.filter((value) => value !== day) : [...current, day])} className="h-9">{day}</Button>;
                                    })}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Remarks (Optional)</Label>
                                <Input maxLength={250} placeholder="e.g. Weekly rest day schedule" value={weeklyRemarks} onChange={(e) => setWeeklyRemarks(e.target.value)} className="h-10 bg-background" />
                            </div>
                            </>}

                            {/* Remarks */}
                            {assignmentMode === "date" && <>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" /> Remarks (Optional)
                                </Label>
                                <Input
                                    placeholder="e.g. Weekly Rest Day"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="h-10 bg-background"
                                />
                            </div>
                            </>}
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
                                            Total Department Active: <strong>{totalCount}</strong> &bull; Checked to Save:{" "}
                                            <strong className="text-primary font-bold">{selectedCount}</strong>
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
                                            {assignmentMode === "date" ? <>
                                                <TableHead className="w-36 text-xs font-bold uppercase tracking-wider">Rest Date</TableHead>
                                                <TableHead className="w-32 text-xs font-bold uppercase tracking-wider">Day</TableHead>
                                            </> : <TableHead className="text-xs font-bold uppercase tracking-wider">Current Weekly Rest Days</TableHead>}
                                            <TableHead className="w-32 text-center text-xs font-bold uppercase tracking-wider">Save Status</TableHead>
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
                                                    {assignmentMode === "date" ? <>
                                                    <TableCell className="text-xs font-medium text-foreground">
                                                        {selectedDate}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="font-medium bg-background text-primary border-primary/30 text-[11px]">
                                                            {dayOfWeek}
                                                        </Badge>
                                                    </TableCell>
                                                    </> : <TableCell className="text-xs font-medium text-foreground">
                                                        {emp.weeklyRestDays || "Default schedule"}
                                                    </TableCell>}
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
                <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold">
                            <History className="w-5 h-5 text-primary" />
                            Recent Rest Day Transactions
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Select any existing transaction to load, review, or edit its assigned employees.
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
                                No Rest Day transactions found.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-secondary/30">
                                    <TableRow>
                                        <TableHead className="w-20 font-bold text-xs uppercase">Trans #</TableHead>
                                        <TableHead className="font-bold text-xs uppercase">Department</TableHead>
                                        <TableHead className="w-28 font-bold text-xs uppercase">Rest Date</TableHead>
                                        <TableHead className="w-24 font-bold text-xs uppercase">Day</TableHead>
                                        <TableHead className="w-28 text-center font-bold text-xs uppercase">Employees</TableHead>
                                        <TableHead className="w-24 text-right font-bold text-xs uppercase">Action</TableHead>
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
                                                {format(parseISO(tx.restDate), "yyyy-MM-dd")}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                <Badge variant="outline" className="text-[10px]">
                                                    {tx.restDay}
                                                </Badge>
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
