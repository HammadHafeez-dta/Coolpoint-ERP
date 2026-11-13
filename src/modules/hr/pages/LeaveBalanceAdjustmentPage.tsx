import { useState, useEffect } from "react";
import {
    Search,
    Save,
    X,
    UserCircle,
    Calendar,
    Building2,
    Briefcase,
    Loader2,
    Plus,
    Edit,
    Trash2,
    Tag
} from "lucide-react";
import { EmployeeSelectModal } from "../components/EmployeeSelectModal";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useToast } from "@/shared/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveRegisterService, LeaveRegister } from "../services/leaveRegisterService";
import { employeeService, Employee } from "../services/employeeService";
import { authService } from "@/modules/auth/services/authService";
import { motion, AnimatePresence } from "framer-motion";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";

const LeaveBalanceAdjustmentPage = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const userSite = authService.getSite();
    const currentUser = authService.getCurrentUser()?.username;

    const [monthYear, setMonthYear] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [empCardNo, setEmpCardNo] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isSearchingEmp, setIsSearchingEmp] = useState(false);
    const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);

    // Form state
    const [alOpen, setAlOpen] = useState(0);
    const [clOpen, setClOpen] = useState(0);
    const [slOpen, setSlOpen] = useState(0);
    const [cplOpen, setCplOpen] = useState(0);
    const [serialNo, setSerialNo] = useState<number | null>(null);

    const { data: adjustments = [], isLoading: loadingAdjustments } = useQuery({
        queryKey: ['leaveAdjustments', userSite],
        queryFn: () => leaveRegisterService.getAll(userSite)
    });

    const handleEmpSearch = async (cardNo?: string) => {
        const searchVal = cardNo || empCardNo;
        if (!searchVal) return;
        setIsSearchingEmp(true);
        try {
            const emp = await employeeService.getByCardNo(parseInt(searchVal), userSite);
            setSelectedEmployee(emp);
            setEmpCardNo(emp.empCardNo.toString());

            // Try to fetch existing record for this month/year
            const year = parseInt(monthYear.split('-')[0]);
            const month = parseInt(monthYear.split('-')[1]);

            try {
                const existing = await leaveRegisterService.getByEmployee(parseInt(searchVal), month, year, userSite);
                if (existing) {
                    setAlOpen(existing.alOpen);
                    setClOpen(existing.clOpen);
                    setSlOpen(existing.slOpen);
                    setCplOpen(existing.cplOpen);
                    setSerialNo(existing.serialNo);
                } else {
                    resetForm(false);
                }
            } catch (e) {
                resetForm(false);
            }
        } catch (error) {
            toast({ title: "Error", description: "Employee not found", variant: "destructive" });
            setSelectedEmployee(null);
            resetForm(true);
        } finally {
            setIsSearchingEmp(false);
        }
    };

    const handleEmployeeSelect = (emp: Employee) => {
        setSelectedEmployee(emp);
        setEmpCardNo(emp.empCardNo.toString());
        handleEmpSearch(emp.empCardNo.toString());
    };

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F1') {
                e.preventDefault();
                setIsEmpModalOpen(true);
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    const resetForm = (full: boolean) => {
        setAlOpen(0);
        setClOpen(0);
        setSlOpen(0);
        setCplOpen(0);
        setSerialNo(null);
        if (full) {
            setEmpCardNo("");
            setSelectedEmployee(null);
        }
    };

    const mutation = useMutation({
        mutationFn: async (data: Partial<LeaveRegister>) => {
            if (serialNo) {
                await leaveRegisterService.update({ ...data, serialNo });
            } else {
                await leaveRegisterService.create(data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaveAdjustments'] });
            toast({ title: "Success", description: `Leave balance ${serialNo ? 'updated' : 'saved'} successfully.` });
            resetForm(true);
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message || "Failed to save record.", variant: "destructive" });
        }
    });

    const handleSave = () => {
        if (!selectedEmployee) {
            toast({ title: "Validation Error", description: "Please select an employee first.", variant: "destructive" });
            return;
        }

        const year = parseInt(monthYear.split('-')[0]);
        const month = parseInt(monthYear.split('-')[1]);

        const data: Partial<LeaveRegister> = {
            empCardNo: selectedEmployee.empCardNo,
            site: userSite,
            leaveMonth: month,
            leaveYear: year,
            applicationNo: 0,
            alOpen,
            clOpen,
            slOpen,
            cplOpen,
            alAdd: 0, alUse: 0,
            clAdd: 0, clUse: 0,
            slAdd: 0, slUse: 0,
            cplAdd: 0, cplUse: 0,
            enterBy: currentUser,
            editBy: currentUser
        };

        mutation.mutate(data);
    };

    const handleEdit = (record: LeaveRegister) => {
        setMonthYear(`${record.leaveYear}-${String(record.leaveMonth).padStart(2, '0')}`);
        setEmpCardNo(record.empCardNo.toString());
        setAlOpen(record.alOpen);
        setClOpen(record.clOpen);
        setSlOpen(record.slOpen);
        setCplOpen(record.cplOpen);
        setSerialNo(record.serialNo);

        // Fetch employee details
        employeeService.getByCardNo(record.empCardNo, userSite).then(setSelectedEmployee);
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs shrink-0">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Leave Balance Adjustment</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button variant="outline" size="sm" onClick={() => resetForm(true)} className="h-8 text-xs border-border hover:bg-muted active:scale-[0.98] transition-transform gap-1.5">
                        <X className="w-3.5 h-3.5" /> Reset
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={mutation.isPending} className="h-8 text-xs bg-[#171858] hover:bg-[#121344] text-white shadow-xs active:scale-[0.98] transition-transform font-bold px-4 gap-1.5">
                        {mutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        {serialNo ? 'Update' : 'Save'} Balance
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-6 space-y-6 max-w-[1600px] mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Adjustment Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-border bg-secondary/20">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <UserCircle className="w-4 h-4" /> Selection & Details
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold">Month / Year</Label>
                                    <Input
                                        type="month"
                                        value={monthYear}
                                        onChange={(e) => setMonthYear(e.target.value)}
                                        className="h-10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold">Employee Card No (F1 to Search)</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                placeholder="Enter Card No..."
                                                value={empCardNo}
                                                onChange={(e) => setEmpCardNo(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleEmpSearch();
                                                    if (e.key === 'F1') {
                                                        e.preventDefault();
                                                        setIsEmpModalOpen(true);
                                                    }
                                                }}
                                                className="h-10 pr-10"
                                            />
                                            <Search
                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                                                onClick={() => setIsEmpModalOpen(true)}
                                            />
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="h-10 w-10 shrink-0"
                                            onClick={() => handleEmpSearch()}
                                            disabled={isSearchingEmp}
                                        >
                                            {isSearchingEmp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {selectedEmployee && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-4 pt-4 border-t border-dashed border-border space-y-3"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="bg-primary/10 p-2 rounded-lg">
                                                    <UserCircle className="w-8 h-8 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{selectedEmployee.empName}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase">{selectedEmployee.empFatherName}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                    <Building2 className="w-3.5 h-3.5" /> <span>Dept: {selectedEmployee.deptName || selectedEmployee.departmentCode}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                    <Briefcase className="w-3.5 h-3.5" /> <span>Desig: {selectedEmployee.designationName || selectedEmployee.designationCode}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                    <Tag className="w-3.5 h-3.5" /> <span>CNIC: {selectedEmployee.cnicNo || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-border bg-secondary/20">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Edit className="w-4 h-4" /> Opening Balances
                                </h3>
                            </div>
                            <div className="p-6 grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Annual Leave (AL)</Label>
                                    <Input
                                        type="number"
                                        value={alOpen}
                                        onChange={(e) => setAlOpen(Number(e.target.value))}
                                        className="h-10 text-center font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Compensatory (CPL)</Label>
                                    <Input
                                        type="number"
                                        value={cplOpen}
                                        onChange={(e) => setCplOpen(Number(e.target.value))}
                                        className="h-10 text-center font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Casual Leave (CL)</Label>
                                    <Input
                                        type="number"
                                        value={clOpen}
                                        onChange={(e) => setClOpen(Number(e.target.value))}
                                        className="h-10 text-center font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Sick Leave (SL)</Label>
                                    <Input
                                        type="number"
                                        value={slOpen}
                                        onChange={(e) => setSlOpen(Number(e.target.value))}
                                        className="h-10 text-center font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Adjustment Table */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden h-full flex flex-col">
                            <div className="p-4 border-b border-border bg-secondary/10 flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Adjustment History</h3>
                            </div>
                            <div className="flex-1 overflow-auto">
                                <Table>
                                    <TableHeader className="bg-secondary/30 sticky top-0 z-10">
                                        <TableRow>
                                            <TableHead className="text-[10px] uppercase font-bold text-muted-foreground">Month/Year</TableHead>
                                            <TableHead className="text-[10px] uppercase font-bold text-muted-foreground">Employee</TableHead>
                                            <TableHead className="text-[10px] uppercase font-bold text-muted-foreground text-center">AL</TableHead>
                                            <TableHead className="text-[10px] uppercase font-bold text-muted-foreground text-center">CL</TableHead>
                                            <TableHead className="text-[10px] uppercase font-bold text-muted-foreground text-center">SL</TableHead>
                                            <TableHead className="text-[10px] uppercase font-bold text-muted-foreground text-center">CPL</TableHead>
                                            <TableHead className="text-[10px] uppercase font-bold text-muted-foreground text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loadingAdjustments ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-32 text-center">
                                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                                                </TableCell>
                                            </TableRow>
                                        ) : adjustments.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-xs italic">
                                                    No adjustment records found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            adjustments.map((rec) => (
                                                <TableRow key={rec.serialNo} className="hover:bg-secondary/20 transition-colors">
                                                    <TableCell className="text-xs font-medium">{rec.leaveMonth}/{rec.leaveYear}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold">{rec.empName}</span>
                                                            <span className="text-[10px] text-muted-foreground">ID: {rec.empCardNo}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center text-xs font-bold text-sidebar">{rec.alOpen}</TableCell>
                                                    <TableCell className="text-center text-xs font-bold text-green-600">{rec.clOpen}</TableCell>
                                                    <TableCell className="text-center text-xs font-bold text-orange-600">{rec.slOpen}</TableCell>
                                                    <TableCell className="text-center text-xs font-bold text-purple-600">{rec.cplOpen}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10" onClick={() => handleEdit(rec)}>
                                                                <Edit className="w-3 h-3" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={async () => {
                                                                if (confirm("Are you sure you want to delete this adjustment?")) {
                                                                    try {
                                                                        await leaveRegisterService.delete(rec.serialNo);
                                                                        queryClient.invalidateQueries({ queryKey: ['leaveAdjustments'] });
                                                                        toast({ title: "Deleted", description: "Adjustment record removed." });
                                                                    } catch (e: any) {
                                                                        toast({ title: "Error", description: e.message, variant: "destructive" });
                                                                    }
                                                                }
                                                            }}>
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <EmployeeSelectModal
                isOpen={isEmpModalOpen}
                onClose={() => setIsEmpModalOpen(false)}
                onSelect={handleEmployeeSelect}
            />
        </div>
    );
};

export default LeaveBalanceAdjustmentPage;
