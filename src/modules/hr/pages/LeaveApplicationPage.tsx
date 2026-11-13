import { useState, useEffect } from "react";
import {
    Search, Save, Trash2, Calendar, FileText,
    User, Users, Plus, X, Loader2, Building2
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { useToast } from "@/shared/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Card, CardContent } from "@/shared/components/ui/card";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/modules/auth/services/authService"; // Double check existing auth path
import { leaveApplicationService, LeaveApplicationCreateDto, LeaveApplicationChildDto } from "../services/leaveApplicationService";
import { employeeService, Employee } from "../services/employeeService";
import { DepartmentSelectModal } from "../components/DepartmentSelectModal";
import { EmployeeSelectModal } from "../components/EmployeeSelectModal";
import { format, differenceInDays, addDays } from "date-fns";

const LeaveApplicationPage = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const userSite = authService.getSite() || "";
    const currentUser = authService.getCurrentUser()?.username || "Admin";

    // Mode: 'single' or 'bulk' or 'history'
    const [mode, setMode] = useState<'single' | 'bulk' | 'history'>('single');

    // Application Header
    const [appDate, setAppDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [appNo, setAppNo] = useState(0);

    // Form Fields
    const [selectedDept, setSelectedDept] = useState<{ code: string, name: string } | null>(null);
    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);

    const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
    const [empCardNo, setEmpCardNo] = useState("");
    const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);

    const [leaveType, setLeaveType] = useState("");
    const [fromDate, setFromDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [remarks, setRemarks] = useState("");

    // Grid Data
    const [gridItems, setGridItems] = useState<LeaveApplicationChildDto[]>([]);

    // Queries
    const { data: maxNo } = useQuery({
        queryKey: ['leaveAppMaxNo', userSite],
        queryFn: () => leaveApplicationService.getMaxNumber(userSite)
    });

    const { data: leaveTypes = [] } = useQuery({
        queryKey: ['leaveTypes'],
        queryFn: leaveApplicationService.getLeaveTypes
    });

    const { data: empBalance } = useQuery({
        queryKey: ['empBalance', selectedEmp?.empCardNo, userSite],
        queryFn: () => leaveApplicationService.getBalance(selectedEmp!.empCardNo, userSite),
        enabled: !!selectedEmp
    });

    useEffect(() => {
        if (maxNo) setAppNo(maxNo);
    }, [maxNo]);

    // Handlers
    const handleEmpSelect = (emp: Employee) => {
        setSelectedEmp(emp);
        setEmpCardNo(emp.empCardNo.toString());
    };

    const handleDeptSelect = (dept: any) => {
        setSelectedDept({ code: dept.code, name: dept.name });
    };

    const calculateTotal = () => {
        const start = new Date(`${fromDate}T00:00:00`);
        const end = new Date(`${toDate}T00:00:00`);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;

        let totalDays = 0;
        let current = start;

        while (current <= end) {
            const isSunday = current.getDay() === 0; // 0 is Sunday

            if (!isSunday) {
                totalDays++;
            }
            current = addDays(current, 1);
        }

        return totalDays;
    };

    const addToGrid = async () => {
        if (!leaveType) {
            toast({ title: "Error", description: "Select Leave Type", variant: "destructive" });
            return;
        }

        const startDate = new Date(`${fromDate}T00:00:00`);
        const endDate = new Date(`${toDate}T00:00:00`);
        if (startDate.getFullYear() !== endDate.getFullYear() || startDate.getMonth() !== endDate.getMonth()) {
            toast({ title: "Invalid date range", description: "Leave dates must be within the same month.", variant: "destructive" });
            return;
        }

        const total = calculateTotal();
        if (total <= 0) {
            toast({ title: "Error", description: "Invalid Date Range", variant: "destructive" });
            return;
        }

        if (mode === 'single') {
            if (!selectedEmp) {
                toast({ title: "Error", description: "Select Employee", variant: "destructive" });
                return;
            }

            try {
                const existing = await leaveApplicationService.checkLeaveRange(
                    fromDate, toDate, leaveType, selectedEmp.empCardNo, userSite
                );
                if (existing) {
                    toast({ title: "Leave already posted", description: `Leave already exists in application #${existing.applicationNo}.`, variant: "destructive" });
                    return;
                }
            } catch (error) {
                toast({ title: "Unable to validate leave", description: error instanceof Error ? error.message : "Leave overlap could not be checked.", variant: "destructive" });
                return;
            }

            // Validate Balance (Frontend check)
            const balanceData = empBalance || await leaveApplicationService.getBalance(selectedEmp.empCardNo, userSite);
            if (balanceData) {
                let balance = 0;
                let shouldCheck = false;

                // Ensure values are numbers
                const al = Number(balanceData.alBalance || 0);
                const cl = Number(balanceData.clBalance || 0);
                const sl = Number(balanceData.slBalance || 0);
                const cpl = Number(balanceData.cplBalance || 0);

                if (leaveType === 'AL') { balance = al; shouldCheck = true; }
                else if (leaveType === 'CL') { balance = cl; shouldCheck = true; }
                else if (leaveType === 'SL') { balance = sl; shouldCheck = true; }
                else if (leaveType === 'CPL') { balance = cpl; shouldCheck = true; }
                else if (leaveType === 'HDL') {
                    balance = Math.max(cl >= total ? cl : 0, sl >= total ? sl : 0, al >= total ? al : 0);
                    shouldCheck = true;
                }

                if (shouldCheck && balance < total) {
                    toast({
                        title: "Balance Alert",
                        description: `Insufficient ${leaveType} balance. Available: ${balance}, Requested: ${total}`,
                        variant: "destructive"
                    });
                    return;
                }
            }

            const newItem: any = {
                serialNo: Date.now(), // Temp ID
                applicationNo: appNo,
                empCardNo: selectedEmp.empCardNo,
                empName: selectedEmp.empName,
                departmentName: selectedEmp.deptName || selectedEmp.departmentCode,
                leaveType: leaveType,
                leaveName: leaveTypes.find(t => t.leaveType === leaveType)?.leaveName || leaveType,
                fromDate: fromDate,
                toDate: toDate,
                totalLeaves: total,
                remarks: remarks,
                site: userSite
            };

            setGridItems([...gridItems, newItem]);
            // Reset fields slightly
            setRemarks("");
        } else {
            // Bulk Mode
            if (!selectedDept) {
                toast({ title: "Error", description: "Select Department", variant: "destructive" });
                return;
            }

            // Fetch employees for dept
            toast({ title: "Processing", description: "Fetching department employees..." });
            try {
                // Assuming employeeService has getByDept or similar, or we filter from all?
                // The provided Service code for employee didn't show getByDept, but we can assume filtering.
                // Or better, assume backend handles the bulk creation logic completely if we send dept ID.
                // BUT, the requirements said "frontend and backend api".
                // And the uploaded image implies a grid.
                // So optimally, we fetch employees and add them to grid.

                // Let's assume we can search employees by Dept. If not, listing all is expensive.
                // Reverting to: User selects Bulk, we just add ONE logic line describing "Whole Department" 
                // OR we strictly implement the "Load Employees" feature.

                // Let's try to load employees.
                const allEmps = await employeeService.getAll(userSite); // This might be heavy
                const deptEmps = allEmps.filter(e => e.deptId?.toString() === selectedDept.code || e.departmentCode === selectedDept.code);

                if (deptEmps.length === 0) {
                    toast({ title: "Warning", description: "No employees found in this department." });
                    return;
                }

                const eligibleEmployees: Employee[] = [];
                for (const emp of deptEmps) {
                    const existing = await leaveApplicationService.checkLeaveRange(
                        fromDate, toDate, leaveType, emp.empCardNo, userSite
                    );
                    if (!existing) eligibleEmployees.push(emp);
                }

                const newItems = eligibleEmployees.map(emp => ({
                    serialNo: Date.now() + Math.random(),
                    applicationNo: appNo,
                    empCardNo: emp.empCardNo,
                    empName: emp.empName,
                    departmentName: selectedDept.name,
                    leaveType: leaveType,
                    leaveName: leaveTypes.find(t => t.leaveType === leaveType)?.leaveName || leaveType,
                    fromDate: fromDate,
                    toDate: toDate,
                    totalLeaves: total,
                    remarks: remarks,
                    site: userSite
                }));

                setGridItems([...gridItems, ...newItems]);
                toast({ title: "Added", description: `Added ${newItems.length} employees to grid${newItems.length < deptEmps.length ? `; skipped ${deptEmps.length - newItems.length} with an existing leave` : ""}.` });

            } catch (e) {
                toast({ title: "Error", description: "Failed to load department employees", variant: "destructive" });
            }
        }
    };

    const saveMutation = useMutation({
        mutationFn: async () => {
            const dto: LeaveApplicationCreateDto = {
                applicationNo: appNo,
                applicationDate: appDate,
                site: userSite,
                enterBy: currentUser,
                items: gridItems.map(item => ({
                    empCardNo: item.empCardNo,
                    leaveType: item.leaveType,
                    fromDate: item.fromDate,
                    toDate: item.toDate,
                    totalLeaves: item.totalLeaves,
                    remarks: item.remarks
                }))
            };
            return await leaveApplicationService.create(dto);
        },
        onSuccess: (data) => {
            toast({ title: "Success", description: `Application #${data.applicationNo} created successfully.` });
            setGridItems([]);
            setAppNo(prev => prev + 1);
            queryClient.invalidateQueries({ queryKey: ['leaveAppMaxNo'] });
            queryClient.invalidateQueries({ queryKey: ['empBalance'] });
            queryClient.invalidateQueries({ queryKey: ['leaveHistory'] });
            queryClient.invalidateQueries({ queryKey: ['hr-dashboard'] });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message || "Failed to save application", variant: "destructive" });
        }
    });

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Leave Application</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Tabs value={mode} onValueChange={(v: any) => setMode(v)} className="w-[200px]">
                        <TabsList className="grid w-full grid-cols-3 h-8">
                            <TabsTrigger value="single" className="text-xs">Single</TabsTrigger>
                            <TabsTrigger value="bulk" className="text-xs">Bulk</TabsTrigger>
                            <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Button variant="outline" size="sm" onClick={() => setGridItems([])} className="h-8 text-xs gap-1.5">
                        <X className="w-3.5 h-3.5" /> Clear
                    </Button>
                    <Button size="sm" onClick={() => saveMutation.mutate()} disabled={gridItems.length === 0 || saveMutation.isPending} className="h-8 gap-1.5 text-xs bg-[#171858] hover:bg-[#121344] text-white shadow-xs active:scale-[0.98] transition-transform">
                        {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Application
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-4 space-y-4">
                {mode === 'history' ? (
                    <HistoryView userSite={userSite} queryClient={queryClient} />
                ) : (
                    <>
                        {/* Top Controls */}
                        <div className="grid grid-cols-12 gap-4">
                            {/* Left: App Info */}
                            <Card className="col-span-12 lg:col-span-3 border-border shadow-sm">
                                <CardContent className="p-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">App No</Label>
                                            <Input value={appNo} readOnly className="font-sans bg-muted text-center" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">Date</Label>
                                            <Input type="date" value={appDate} onChange={(e) => setAppDate(e.target.value)} />
                                        </div>
                                    </div>

                                    {mode === 'bulk' && (
                                        <div className="space-y-1 pt-2 border-t border-border">
                                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">Department</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={selectedDept?.name || ""}
                                                    readOnly
                                                    placeholder="Select Dept..."
                                                    className="cursor-pointer"
                                                    onClick={() => setIsDeptModalOpen(true)}
                                                />
                                                <Button variant="outline" size="icon" onClick={() => setIsDeptModalOpen(true)}>
                                                    <Search className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Balance Display (Updated to match Leave Adjustment Style) */}
                                    {mode === 'single' && selectedEmp && (
                                        <div className="pt-4 border-t border-border space-y-3">
                                            <h3 className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-2">
                                                <FileText className="w-3 h-3" /> Current Balances
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-bold text-sidebar uppercase">Annual (AL)</Label>
                                                    <Input
                                                        className="h-9 text-center font-bold text-sidebar bg-sidebar/5 border-sidebar/20"
                                                        value={empBalance?.alBalance ?? 0}
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-bold text-green-600 uppercase">Casual (CL)</Label>
                                                    <Input
                                                        className="h-9 text-center font-bold text-green-700 bg-green-50/50 border-green-200"
                                                        value={empBalance?.clBalance ?? 0}
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-bold text-orange-600 uppercase">Sick (SL)</Label>
                                                    <Input
                                                        className="h-9 text-center font-bold text-orange-700 bg-orange-50/50 border-orange-200"
                                                        value={empBalance?.slBalance ?? 0}
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-bold text-purple-600 uppercase">Comp. (CPL)</Label>
                                                    <Input
                                                        className="h-9 text-center font-bold text-purple-700 bg-purple-50/50 border-purple-200"
                                                        value={empBalance?.cplBalance ?? 0}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Middle: Data Entry Form */}
                            <Card className="col-span-12 lg:col-span-9 border-border shadow-sm">
                                <CardContent className="p-4">
                                    <div className="grid grid-cols-12 gap-4 items-end">
                                        {mode === 'single' && (
                                            <div className="col-span-6 md:col-span-3 space-y-1">
                                                <Label className="text-xs font-semibold">Employee (F1)</Label>
                                                <div className="flex gap-1">
                                                    <Input
                                                        value={empCardNo}
                                                        onChange={e => setEmpCardNo(e.target.value)}
                                                        onKeyDown={e => {
                                                            if (e.key === 'F1') { e.preventDefault(); setIsEmpModalOpen(true); }
                                                            // Implement Enter fetch if needed
                                                        }}
                                                        placeholder="Card No"
                                                        className="h-9"
                                                    />
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 border border-input" onClick={() => setIsEmpModalOpen(true)}>
                                                        <Search className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {mode === 'single' && selectedEmp && (
                                            <div className="col-span-6 md:col-span-3 space-y-1">
                                                <Label className="text-xs font-semibold">Name / Dept</Label>
                                                <div className="text-xs p-2 bg-muted rounded h-9 flex items-center truncate">
                                                    {selectedEmp.empName} / {selectedEmp.deptName}
                                                </div>
                                            </div>
                                        )}

                                        <div className="col-span-6 md:col-span-3 space-y-1">
                                            <Label className="text-xs font-semibold">Leave Type</Label>
                                            <Select value={leaveType} onValueChange={setLeaveType}>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Select..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {leaveTypes.map(t => (
                                                        <SelectItem key={t.leaveType} value={t.leaveType}>{t.leaveName}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="col-span-6 md:col-span-3 md:col-start-1 space-y-1">
                                            <Label className="text-xs font-semibold">From Date</Label>
                                            <Input type="date" className="h-9" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                                        </div>
                                        <div className="col-span-6 md:col-span-3 space-y-1">
                                            <Label className="text-xs font-semibold">To Date</Label>
                                            <Input type="date" className="h-9" value={toDate} onChange={e => setToDate(e.target.value)} />
                                        </div>
                                        <div className="col-span-6 md:col-span-3 space-y-1">
                                            <Label className="text-xs font-semibold">Total Days</Label>
                                            <Input value={calculateTotal()} readOnly className="h-9 bg-muted text-center font-bold" />
                                        </div>

                                        <div className="col-span-12 md:col-span-6 space-y-1">
                                            <Label className="text-xs font-semibold">Remarks</Label>
                                            <Input className="h-9" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Reason for leave..." />
                                        </div>

                                        <div className="col-span-12 md:col-span-3 flex justify-end">
                                            <Button onClick={addToGrid} className="h-9 w-full gap-2" variant="secondary">
                                                <Plus className="w-4 h-4" /> Add to List
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Bottom: Grid */}
                        <div className="rounded-md border border-border bg-card shadow-sm flex-1 overflow-hidden min-h-[300px]">
                            <Table>
                                <TableHeader className="bg-muted/40 sticky top-0">
                                    <TableRow>
                                        <TableHead className="w-[50px] text-xs font-bold">Sr</TableHead>
                                        <TableHead className="text-xs font-bold">Card No</TableHead>
                                        <TableHead className="text-xs font-bold">Name</TableHead>
                                        <TableHead className="text-xs font-bold">Department</TableHead>
                                        <TableHead className="text-xs font-bold">Leave Name</TableHead>
                                        <TableHead className="text-xs font-bold">Type</TableHead>
                                        <TableHead className="text-xs font-bold">From</TableHead>
                                        <TableHead className="text-xs font-bold">To</TableHead>
                                        <TableHead className="text-center text-xs font-bold">Total</TableHead>
                                        <TableHead className="text-xs font-bold">Remarks</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {gridItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={11} className="h-48 text-center text-muted-foreground italic">
                                                No items added. Fill the form and click "Add to List".
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        gridItems.map((item, index) => (
                                            <TableRow key={item.serialNo || index} className="group">
                                                <TableCell className="py-2 text-xs">{index + 1}</TableCell>
                                                <TableCell className="py-2 text-xs font-sans">{item.empCardNo}</TableCell>
                                                <TableCell className="py-2 text-xs font-medium">{item.empName}</TableCell>
                                                <TableCell className="py-2 text-xs text-muted-foreground">{item.departmentName}</TableCell>
                                                <TableCell className="py-2 text-xs">{item.leaveName}</TableCell>
                                                <TableCell className="py-2 text-xs"><Badge variant="outline" className="text-[10px]">{item.leaveType}</Badge></TableCell>
                                                <TableCell className="py-2 text-xs">{format(new Date(item.fromDate), 'dd/MM/yyyy')}</TableCell>
                                                <TableCell className="py-2 text-xs">{format(new Date(item.toDate), 'dd/MM/yyyy')}</TableCell>
                                                <TableCell className="py-2 text-xs text-center font-bold">{item.totalLeaves}</TableCell>
                                                <TableCell className="py-2 text-xs truncate max-w-[200px]">{item.remarks}</TableCell>
                                                <TableCell className="py-2">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100" onClick={() => {
                                                        setGridItems(gridItems.filter(i => i !== item));
                                                    }}>
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                )}
            </div>

            <DepartmentSelectModal
                isOpen={isDeptModalOpen}
                onClose={() => setIsDeptModalOpen(false)}
                onSelect={handleDeptSelect}
            />

            <EmployeeSelectModal
                isOpen={isEmpModalOpen}
                onClose={() => setIsEmpModalOpen(false)}
                onSelect={handleEmpSelect}
            />
        </div>
    );
};

const HistoryView = ({ userSite, queryClient }: { userSite: string, queryClient: any }) => {
    const { toast } = useToast();
    const { data: history = [], isLoading } = useQuery({
        queryKey: ['leaveHistory', userSite],
        queryFn: () => leaveApplicationService.getRecent(userSite),
        refetchInterval: 5000 // Auto-refresh to see balanced deduction updates or just standard poll
    });

    const deleteMutation = useMutation({
        mutationFn: async (applicationNo: number) => {
            await leaveApplicationService.delete(applicationNo, userSite);
        },
        onSuccess: () => {
            toast({ title: "Updated", description: "Leave application cancelled/deleted." });
            queryClient.invalidateQueries({ queryKey: ['leaveHistory'] });
            queryClient.invalidateQueries({ queryKey: ['hr-dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['empBalance'] }); // Refresh balance if viewing specific emp
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to delete application.", variant: "destructive" });
        }
    });

    return (
        <Card className="border-border shadow-sm h-full flex flex-col">
            <CardContent className="p-0 flex-1 overflow-auto">
                <Table>
                    <TableHeader className="bg-muted/40 sticky top-0 z-10">
                        <TableRow>
                            <TableHead className="w-[80px] text-xs font-bold">App #</TableHead>
                            <TableHead className="text-xs font-bold">Employee</TableHead>
                            <TableHead className="text-xs font-bold">Leave Type</TableHead>
                            <TableHead className="text-xs font-bold">Duration</TableHead>
                            <TableHead className="text-center text-xs font-bold">Days</TableHead>
                            <TableHead className="text-xs font-bold">Remarks</TableHead>
                            <TableHead className="text-right text-xs font-bold">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell>
                            </TableRow>
                        ) : history.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic">No recent applications found.</TableCell>
                            </TableRow>
                        ) : (
                            history.map((item: any) => (
                                <TableRow key={item.serialNo} className="hover:bg-muted/50">
                                    <TableCell className="py-2 text-xs font-sans font-bold text-primary">#{item.applicationNo}</TableCell>
                                    <TableCell className="py-2">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold">{item.empName}</span>
                                            <span className="text-[10px] text-muted-foreground">ID: {item.empCardNo}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-2"><Badge variant="outline" className="text-[10px]">{item.leaveName}</Badge></TableCell>
                                    <TableCell className="py-2 text-xs">
                                        {format(new Date(item.fromDate), 'dd MMM yyyy')} - {format(new Date(item.toDate), 'dd MMM yyyy')}
                                    </TableCell>
                                    <TableCell className="py-2 text-xs text-center font-bold bg-muted/30">{item.totalLeaves}</TableCell>
                                    <TableCell className="py-2 text-xs text-muted-foreground max-w-[200px] truncate">{item.remarks}</TableCell>
                                    <TableCell className="py-2 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => {
                                                if (confirm(`Are you sure you want to cancel/delete Application #${item.applicationNo}?`)) {
                                                    deleteMutation.mutate(item.applicationNo);
                                                }
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default LeaveApplicationPage;
