import { useState, useEffect } from "react";
import { 
    Search, Save, Trash2, Calendar, 
    User, Plus, X, Loader2, Clock
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { toast } from "sonner";
import { authService } from "@/modules/auth/services/authService";
import { overtimeService, OverTimeMasterDto, OverTimeChildDto } from "../services/overtimeService";
import { employeeService } from "../services/employeeService";
import { EmployeeSelectModal } from "../components/EmployeeSelectModal";
import { format } from "date-fns";
import { motion } from "framer-motion";

const OvertimePage = () => {
    const userSite = authService.getSite() || "";
    
    // Master State
    const [transactionNo, setTransactionNo] = useState<number>(0);
    const [overtimeDate, setOvertimeDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [gazettedOverTime, setGazettedOverTime] = useState(false);
    
    // Rows State
    const [rows, setRows] = useState<OverTimeChildDto[]>([]);
    
    // UI State
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);

    // Keyboard shortcut for employee search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F1") {
                e.preventDefault();
                setIsEmpModalOpen(true);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Load Transaction No and Data when date changes
    useEffect(() => {
        const loadData = async () => {
            if (!overtimeDate || !userSite) return;
            try {
                setLoading(true);
                // 1. Get Transaction No for this date
                const existingNo = await overtimeService.getNoByDate(overtimeDate, userSite);
                
                if (existingNo > 0) {
                    setTransactionNo(existingNo);
                    // 2. Load Master and Children
                    const master = await overtimeService.getMaster(existingNo, userSite);
                    if (master) {
                        setGazettedOverTime(master.gazettedOverTime || false);
                    }
                    const children = await overtimeService.getChildren(existingNo, userSite);
                    setRows(children || []);
                } else {
                    // 3. Get Next Transaction No
                    const nextNo = await overtimeService.getNextNo(userSite);
                    setTransactionNo(nextNo);
                    setRows([]);
                    setGazettedOverTime(false);
                }
            } catch (error) {
                console.error("Failed to load overtime data", error);
                toast.error("Failed to load overtime data");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [overtimeDate, userSite]);

    const handleEmpSelect = async (emp: any) => {
        if (rows.some(r => r.empCardNo === emp.empCardNo)) {
            toast.warning(`Employee ${emp.empName} already added.`);
            return;
        }

        try {
            setLoading(true);
            const fullEmp = await employeeService.getByCardNo(emp.empCardNo, userSite);
            
            // In case of any property name variations from different API endpoints
            const salaryValue = fullEmp?.salary?.grossPay || (fullEmp as any)?.grossPay || 0;
            const dept = fullEmp?.deptName || (fullEmp as any)?.departmentName || emp?.deptName || "N/A";
            const desig = fullEmp?.designationName || (fullEmp as any)?.designation || emp?.designationName || "N/A";

            const defaultRate = salaryValue > 0 ? Number((salaryValue / 240).toFixed(2)) : 0;

            const newRow: OverTimeChildDto = {
                transactionNo: transactionNo,
                site: userSite,
                empCardNo: fullEmp.empCardNo,
                empName: fullEmp.empName,
                designationName: desig,
                departmentName: dept,
                salary: salaryValue,
                overTime: 0,
                overTimeRate: defaultRate,
                overTimeAmount: 0,
                lunch: 0,
                dinner: 0,
                totalAmount: 0,
                overTimeMints: 0
            };

            setRows(prev => [...prev, newRow]);
            setIsEmpModalOpen(false);
        } catch (error) {
            toast.error("Failed to fetch full employee details.");
        } finally {
            setLoading(false);
        }
    };

    const updateRow = (index: number, field: keyof OverTimeChildDto, value: any) => {
        const updatedRows = [...rows];
        const row = { ...updatedRows[index] };
        
        // Update the field
        (row as any)[field] = value;

        // Recalculate amounts
        const otHours = Number(row.overTime || 0);
        const otRate = Number(row.overTimeRate || 0);
        const lunch = Number(row.lunch || 0);
        const dinner = Number(row.dinner || 0);

        const otAmount = Number((otHours * otRate).toFixed(2));
        row.overTimeAmount = otAmount;
        row.totalAmount = Number((otAmount + lunch + dinner).toFixed(2));

        updatedRows[index] = row;
        setRows(updatedRows);
    };

    const removeRow = (index: number) => {
        setRows(rows.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (rows.length === 0) {
            toast.error("Please add at least one employee.");
            return;
        }

        try {
            setSaving(true);
            
            // 1. Save Master
            const masterDto: OverTimeMasterDto = {
                transactionNo,
                transactionDate: overtimeDate,
                gazettedOverTime,
                site: userSite
            };
            await overtimeService.saveMaster(masterDto);

            // 2. Delete old children for this transaction
            await overtimeService.deleteChildren(transactionNo, userSite);

            // 3. Save new children
            for (const row of rows) {
                await overtimeService.saveChild({
                    ...row,
                    transactionNo: transactionNo,
                    site: userSite
                });
            }

            toast.success("Overtime record saved successfully.");
            
            // 4. Force Reset for Next Transaction
            const nextNo = await overtimeService.getNextNo(userSite);
            setTransactionNo(nextNo);
            setRows([]);
            setGazettedOverTime(false);
            setOvertimeDate(format(new Date(), 'yyyy-MM-dd'));
            
        } catch (error) {
            console.error("Save failed", error);
            toast.error("Failed to save overtime records.");
        } finally {
            setSaving(false);
        }
    };

    const loadTransaction = async (no: number) => {
        if (!no || !userSite) return;
        try {
            setLoading(true);
            const master = await overtimeService.getMaster(no, userSite);
            if (master) {
                setTransactionNo(no);
                setOvertimeDate(format(new Date(master.transactionDate || new Date()), 'yyyy-MM-dd'));
                setGazettedOverTime(master.gazettedOverTime || false);
                const children = await overtimeService.getChildren(no, userSite);
                setRows(children || []);
                toast.success(`Loaded Transaction #${no}`);
            } else {
                toast.error("Transaction not found.");
            }
        } catch (error) {
            toast.error("Failed to load transaction.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background text-sm overflow-hidden">
            {/* Sticky Header */}
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs shrink-0">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Overtime Management</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border text-muted-foreground hover:text-foreground" onClick={() => window.history.back()}>
                        <X className="w-3.5 h-3.5" /> Exit
                    </Button>
                    <Button size="sm" className="gap-1.5 h-8 text-xs bg-[#171858] hover:bg-[#121344] text-white shadow-xs active:scale-[0.98] transition-transform px-4" onClick={handleSave} disabled={saving || loading}>
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        {saving ? "Saving..." : "Save Transaction"}
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-6 space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-[1600px] mx-auto space-y-6"
                >
                    {/* Stats Overview Row (Align with EmployeesPage) */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                            <div className="bg-sidebar/10 p-3 rounded-xl"><User className="w-6 h-6 text-sidebar" /></div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Employees</p>
                                <h3 className="text-xl font-black">{rows.length}</h3>
                            </div>
                        </div>
                        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                            <div className="bg-yellow-500/10 p-3 rounded-xl"><Clock className="w-6 h-6 text-yellow-600" /></div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total OT Hours</p>
                                <h3 className="text-xl font-black">{rows.reduce((sum, r) => sum + (r.overTime || 0), 0).toFixed(1)}</h3>
                            </div>
                        </div>
                        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                            <div className="bg-green-500/10 p-3 rounded-xl"><Save className="w-6 h-6 text-green-600" /></div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">OT Amount</p>
                                <h3 className="text-xl font-black">{rows.reduce((sum, r) => sum + (r.overTimeAmount || 0), 0).toLocaleString()}</h3>
                            </div>
                        </div>
                        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4 border-primary/20 bg-primary/5">
                            <div className="bg-primary/10 p-3 rounded-xl"><Clock className="w-6 h-6 text-primary" /></div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-primary tracking-wider">Grand Total</p>
                                <h3 className="text-xl font-black text-primary">{rows.reduce((sum, r) => sum + (r.totalAmount || 0), 0).toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Master Information Card */}
                    <Card className="border-border shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border/50 py-3 px-6">
                            <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                Master Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                                <div className="md:col-span-2 space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Transaction No</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            type="number"
                                            value={transactionNo} 
                                            onChange={(e) => setTransactionNo(Number(e.target.value))}
                                            className="font-sans font-bold h-10 text-center bg-muted/30" 
                                        />
                                        <Button variant="outline" size="icon" onClick={() => loadTransaction(transactionNo)} className="h-10 w-10 shrink-0 border-border">
                                            <Search className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="md:col-span-3 space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Transaction Date</Label>
                                    <Input 
                                        type="date" 
                                        value={overtimeDate} 
                                        onChange={(e) => setOvertimeDate(e.target.value)} 
                                        className="h-10 font-medium" 
                                    />
                                </div>
                                <div className="md:col-span-3 flex items-center h-10 mb-0.5">
                                    <div className="flex items-center gap-3 px-4 py-2 bg-muted/20 border border-border rounded-lg group cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => setGazettedOverTime(!gazettedOverTime)}>
                                        <input 
                                            type="checkbox" 
                                            id="gazetted" 
                                            checked={gazettedOverTime} 
                                            onChange={(e) => setGazettedOverTime(e.target.checked)}
                                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                        />
                                        <Label htmlFor="gazetted" className="text-xs font-bold uppercase tracking-tight text-muted-foreground group-hover:text-foreground cursor-pointer">Gazetted Overtime</Label>
                                    </div>
                                </div>
                                <div className="md:col-span-4 flex justify-end gap-3 h-10">
                                    <Button 
                                        type="button" 
                                        variant="outline"
                                        className="h-10 gap-2 px-4 font-bold text-[11px] uppercase tracking-wider" 
                                        onClick={() => {
                                            if(confirm("Start a new entry? Current unsaved changes will be lost.")) {
                                                setRows([]);
                                                overtimeService.getNextNo(userSite).then(setTransactionNo);
                                                setOvertimeDate(format(new Date(), 'yyyy-MM-dd'));
                                            }
                                        }}
                                    >
                                        <Plus className="w-3.5 h-3.5" /> New Entry
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="default"
                                        className="h-10 gap-2 px-6 shadow-md shadow-primary/20 font-bold text-[11px] uppercase tracking-wider" 
                                        onClick={() => setIsEmpModalOpen(true)}
                                    >
                                        <User className="w-3.5 h-3.5" /> Add Employee (F1)
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Table Card */}
                    <Card className="border-border shadow-md overflow-hidden flex flex-col min-h-[500px]">
                        <div className="overflow-x-auto overflow-y-auto max-h-[700px] flex-1">
                            <Table className="min-w-[2000px] border-collapse relative">
                                <TableHeader className="bg-secondary/30 sticky top-0 z-10 backdrop-blur-sm">
                                    <TableRow className="hover:bg-transparent border-b border-border">
                                        <TableHead className="w-16 py-4 px-6 font-bold text-[10px] uppercase text-center border-r border-border/10">Sr</TableHead>
                                        <TableHead className="w-32 py-4 px-4 font-bold text-[10px] uppercase border-r border-border/10">ID</TableHead>
                                        <TableHead className="w-80 py-4 px-4 font-bold text-[10px] uppercase border-r border-border/10">Employee Details</TableHead>
                                        <TableHead className="w-52 py-4 px-4 font-bold text-[10px] uppercase border-r border-border/10">Designation</TableHead>
                                        <TableHead className="w-52 py-4 px-4 font-bold text-[10px] uppercase border-r border-border/10">Department</TableHead>
                                        <TableHead className="w-40 py-4 px-4 font-bold text-[10px] uppercase text-right border-r border-border/10">Basic Salary</TableHead>
                                        <TableHead className="w-32 py-4 px-4 font-bold text-[10px] uppercase text-right border-r border-border/10">Rate/Hr</TableHead>
                                        <TableHead className="w-32 py-4 px-4 font-bold text-[10px] uppercase text-center border-r border-border/10">OT Hours</TableHead>
                                        <TableHead className="w-40 py-4 px-4 font-bold text-[10px] uppercase text-right border-r border-border/10 text-primary">OT Amount</TableHead>
                                        <TableHead className="w-32 py-4 px-4 font-bold text-[10px] uppercase text-right border-r border-border/10 text-sidebar">Lunch</TableHead>
                                        <TableHead className="w-32 py-4 px-4 font-bold text-[10px] uppercase text-right border-r border-border/10 text-orange-600">Dinner</TableHead>
                                        <TableHead className="w-44 py-4 px-6 font-bold text-[10px] uppercase text-right bg-primary/5 text-primary">Total Amount</TableHead>
                                        <TableHead className="w-20 py-4 px-4 text-center"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={13} className="h-64 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                                    <span className="text-xs font-bold uppercase tracking-widest opacity-50">Loading records...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : rows.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={13} className="h-64 text-center text-muted-foreground bg-muted/5">
                                                <div className="flex flex-col items-center gap-2">
                                                    <User className="w-10 h-10 opacity-10 mb-2" />
                                                    <span className="text-sm font-medium">No employees added to this transaction.</span>
                                                    <Button variant="link" className="text-[10px] uppercase font-bold text-primary" onClick={() => setIsEmpModalOpen(true)}>Press F1 to add employees</Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        rows.map((row, idx) => (
                                            <TableRow key={idx} className="hover:bg-secondary/10 transition-colors border-b border-border/50 group">
                                                <TableCell className="py-3 px-6 text-center text-xs font-bold text-muted-foreground border-r border-border/5 bg-muted/5">{idx + 1}</TableCell>
                                                <TableCell className="py-3 px-4 font-sans font-bold text-xs text-primary border-r border-border/5">{row.empCardNo}</TableCell>
                                                <TableCell className="py-3 px-4 text-sm font-bold text-foreground border-r border-border/5">{row.empName}</TableCell>
                                                <TableCell className="py-2 px-3 border-r border-border/5">
                                                    <Input 
                                                        value={row.designationName || ""}
                                                        onChange={(e) => updateRow(idx, 'designationName', e.target.value)}
                                                        className="h-9 text-[11px] font-medium bg-muted/20 border-border/40 focus:bg-background transition-all"
                                                        placeholder="Designation"
                                                    />
                                                </TableCell>
                                                <TableCell className="py-2 px-3 border-r border-border/5">
                                                    <Input 
                                                        value={row.departmentName || ""}
                                                        onChange={(e) => updateRow(idx, 'departmentName', e.target.value)}
                                                        className="h-9 text-[11px] font-medium bg-muted/20 border-border/40 focus:bg-background transition-all"
                                                        placeholder="Department"
                                                    />
                                                </TableCell>
                                                <TableCell className="py-2 px-3 border-r border-border/5">
                                                    <Input 
                                                        type="number"
                                                        value={row.salary || ""}
                                                        onChange={(e) => updateRow(idx, 'salary', Number(e.target.value))}
                                                        className="h-9 text-right text-xs font-bold bg-sidebar/5 border-sidebar/15 focus:bg-background transition-all"
                                                    />
                                                </TableCell>
                                                <TableCell className="py-2 px-3 border-r border-border/5">
                                                    <Input 
                                                        type="number"
                                                        value={row.overTimeRate || ""}
                                                        onChange={(e) => updateRow(idx, 'overTimeRate', Number(e.target.value))}
                                                        className="h-9 text-right text-xs font-bold bg-muted/20 border-border/40 focus:bg-background transition-all"
                                                    />
                                                </TableCell>
                                                <TableCell className="py-2 px-3 border-r border-border/5">
                                                    <Input 
                                                        type="number"
                                                        value={row.overTime || ""}
                                                        onChange={(e) => updateRow(idx, 'overTime', Number(e.target.value))}
                                                        className="h-9 text-center text-sm font-black bg-primary/5 border-primary/20 focus:bg-primary/10 transition-all text-primary"
                                                    />
                                                </TableCell>
                                                <TableCell className="py-3 px-4 text-xs font-bold text-right text-primary bg-primary/5 border-r border-border/5">
                                                    {row.overTimeAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell className="py-2 px-3 border-r border-border/5">
                                                    <Input 
                                                        type="number"
                                                        value={row.lunch || ""}
                                                        onChange={(e) => updateRow(idx, 'lunch', Number(e.target.value))}
                                                        className="h-9 text-right text-xs font-bold bg-sidebar/5 border-sidebar/15 focus:bg-background transition-all"
                                                    />
                                                </TableCell>
                                                <TableCell className="py-2 px-3 border-r border-border/5">
                                                    <Input 
                                                        type="number"
                                                        value={row.dinner || ""}
                                                        onChange={(e) => updateRow(idx, 'dinner', Number(e.target.value))}
                                                        className="h-9 text-right text-xs font-bold bg-orange-50/20 border-orange-100 focus:bg-background transition-all"
                                                    />
                                                </TableCell>
                                                <TableCell className="py-3 px-6 text-sm font-black text-right text-primary bg-primary/10">
                                                    {row.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell className="py-3 px-4 text-center">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                                                        onClick={() => removeRow(idx)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        
                        {/* Footer Summary (Align with standard professional footer) */}
                        {rows.length > 0 && (
                            <div className="bg-muted/50 border-t border-border p-4 flex justify-between items-center shrink-0">
                                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    Total Employees: <span className="text-foreground">{rows.length}</span>
                                </div>
                                <div className="flex gap-8">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] uppercase font-bold text-muted-foreground">OT Total</span>
                                        <span className="text-sm font-bold text-primary">
                                            {rows.reduce((sum, r) => sum + (r.overTimeAmount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end border-l border-border pl-8">
                                        <span className="text-[9px] uppercase font-bold text-muted-foreground">Grand Total</span>
                                        <span className="text-lg font-black text-primary">
                                            {rows.reduce((sum, r) => sum + (r.totalAmount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </motion.div>
            </div>

            {/* Employee Modal */}
            <EmployeeSelectModal 
                isOpen={isEmpModalOpen} 
                onClose={() => setIsEmpModalOpen(false)} 
                onSelect={handleEmpSelect} 
            />
        </div>
    );
};

export default OvertimePage;
