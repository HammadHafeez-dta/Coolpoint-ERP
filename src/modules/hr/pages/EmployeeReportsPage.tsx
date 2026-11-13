import { useState, useEffect } from "react";
import { 
    BarChart3, 
    FileDown, 
    Loader2, 
    Users,
    UserCheck,
    UserMinus,
    Filter,
    Building2,
    CalendarDays,
    Layers,
    Image as ImageIcon,
    Coins,
    Cake,
    Sparkles
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import { useToast } from "@/shared/components/ui/use-toast";
import { employeeService } from "../services/employeeService";
import { departmentService } from "../services/departmentService";
import { designationService } from "../services/designationService";
import { authService } from "@/modules/auth/services/authService";
import { EmployeeSelectModal } from "../components/EmployeeSelectModal";
import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";

const EmployeeReportsPage = () => {
    const { toast } = useToast();
    const userSite = authService.getSite();
    
    const [loadingReport, setLoadingReport] = useState<string | null>(null);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [isPfLedgerModalOpen, setIsPfLedgerModalOpen] = useState(false);
    const [isPfLedgerOptionOpen, setIsPfLedgerOptionOpen] = useState(false);
    const [isDobModalOpen, setIsDobModalOpen] = useState(false);
    
    // Appointment Filters
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedDept, setSelectedDept] = useState("all");
    const [selectedDesig, setSelectedDesig] = useState("all");

    // DOB Filters
    const [dobFromDate, setDobFromDate] = useState("");
    const [dobToDate, setDobToDate] = useState("");
    const [dobSelectedDept, setDobSelectedDept] = useState("all");
    const [dobSelectedDesig, setDobSelectedDesig] = useState("all");
    
    // Meta data for filters
    const [departments, setDepartments] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [withImage, setWithImage] = useState(false);

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [depts, desigs] = await Promise.all([
                    departmentService.getAll(userSite),
                    designationService.getAll(userSite)
                ]);
                setDepartments(depts);
                setDesignations(desigs);
            } catch (error) {
                console.error("Failed to fetch metadata", error);
            }
        };
        fetchMeta();
    }, [userSite]);
    const handleGenerateReport = async (type: string) => {
        try {
            setLoadingReport(type);
            
            if (type === 'appointment_trigger') {
                setIsAppointmentModalOpen(true);
                setLoadingReport(null);
                return;
            }

            if (type === 'dob_trigger') {
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth();
                const firstDay = new Date(year, month, 1).toLocaleDateString('en-CA');
                const lastDay = new Date(year, month + 1, 0).toLocaleDateString('en-CA');
                setDobFromDate(firstDay);
                setDobToDate(lastDay);
                setIsDobModalOpen(true);
                setLoadingReport(null);
                return;
            }

            if (type === 'pf_ledger') {
                setIsPfLedgerOptionOpen(true);
                setLoadingReport(null);
                return;
            }

            if (type === 'dob_submit') {
                const deptParam = dobSelectedDept === 'all' ? undefined : dobSelectedDept;
                const desigParam = dobSelectedDesig === 'all' ? undefined : parseInt(dobSelectedDesig);

                await employeeService.viewEmployeeDobReport(
                    userSite,
                    dobFromDate || undefined,
                    dobToDate || undefined,
                    deptParam,
                    desigParam,
                    withImage
                );
                setIsDobModalOpen(false);
            } else if (type === 'new_appointment_submit') {
                if (!fromDate || !toDate) {
                    toast({ title: "Validation Error", description: "Please select both From and To dates.", variant: "destructive" });
                    setLoadingReport(null);
                    return;
                }
                const deptParam = selectedDept === 'all' ? undefined : selectedDept;
                const desigParam = selectedDesig === 'all' ? undefined : parseInt(selectedDesig);
                
                await employeeService.viewNewAppointmentsReport(userSite, fromDate, toDate, deptParam, desigParam, withImage);
                setIsAppointmentModalOpen(false);
            } else if (type === 'designation') {
                await employeeService.viewEmployeesByDesignationReport(userSite, withImage);
            } else if (type === 'department') {
                await employeeService.viewEmployeesByDepartmentReport(userSite, withImage);
            } else if (type === 'hierarchy') {
                await employeeService.viewGroupedHierarchyReport(userSite, withImage);
            } else if (type === 'left') {
                await employeeService.viewEmployeesLeftReport(userSite, withImage);
            } else if (type === 'opening_balances') {
                await employeeService.viewEmployeeOpeningBalancesReport(userSite);
            } else if (type === 'religion') {
                await employeeService.viewEmployeesByReligionReport(userSite, withImage);
            } else if (type === 'service') {
                await employeeService.viewEmployeesByServiceReport(userSite, withImage);
            } else {
                const status = type === 'all' ? undefined : (type === 'active');
                await employeeService.viewEmployeeListPdf(userSite, status, withImage);
            }
            
            if (type !== 'appointment_trigger' && type !== 'pf_ledger' && type !== 'dob_trigger') {
                toast({ title: "Report Ready", description: "Report opened in a new tab." });
            }
        } catch (error: any) {
            const message = error.response?.status === 404 
                ? "No employees found to generate report." 
                : "Failed to generate PDF report.";
            toast({ 
                title: "Report Empty", 
                description: message, 
                variant: error.response?.status === 404 ? "default" : "destructive" 
            });
        } finally {
            if (type !== 'appointment_trigger' && type !== 'pf_ledger' && type !== 'dob_trigger') {
                setLoadingReport(null);
            }
        }
    };

    const reportCards = [
        {
            id: 'all',
            title: "All Employee List",
            description: "A complete master list of every employee in the system, including both active and deactive records.",
            icon: Users,
            color: "text-primary",
            bgColor: "bg-primary/10",
            btnColor: "bg-primary hover:bg-primary/90"
        },
        {
            id: 'active',
            title: "Active Employee List",
            description: "Detailed list of all currently active employees with their placement and identification details.",
            icon: UserCheck,
            color: "text-primary",
            bgColor: "bg-primary/10",
            btnColor: "bg-primary hover:bg-primary/90"
        },
        {
            id: 'deactive',
            title: "Deactive Employee List",
            description: "Comprehensive list of inactive or struck-off employees for historical records and tracking.",
            icon: UserMinus,
            color: "text-primary",
            bgColor: "bg-primary/10",
            btnColor: "bg-primary hover:bg-primary/90"
        },
        {
            id: 'department',
            title: "Department Wise Report",
            description: "Grouped employee report organized by department, allowing department-level staff analysis.",
            icon: Building2,
            color: "text-primary",
            bgColor: "bg-primary/10",
            btnColor: "bg-primary hover:bg-primary/90"
        },
        {
            id: 'designation',
            title: "Designation Wise Report",
            description: "Grouped employee report organized by designation, providing clear visibility into staff distribution.",
            icon: Filter,
            color: "text-primary",
            bgColor: "bg-primary/10",
            btnColor: "bg-primary hover:bg-primary/90"
        },
        {
            id: 'appointment_trigger',
            title: "New Appointments",
            description: "Generate report for employees who joined within a specific date range, with optional filters.",
            icon: CalendarDays,
            color: "text-primary",
            bgColor: "bg-primary/10",
            btnColor: "bg-primary hover:bg-primary/90"
        },
        {
            id: 'hierarchy',
            title: "Deep Grouped Hierarchy",
            description: "Advanced hierarchical report: Department → Designation → Category → Gender → Employees.",
            icon: Layers,
            color: "text-primary",
            bgColor: "bg-primary/10",
            btnColor: "bg-primary hover:bg-primary/90"
        },
        {
            id: 'left',
            title: "Employee List (Left)",
            description: "Detailed report of employees who have left (struck-off/resigned) with joining/leaving dates and reasons.",
            icon: UserMinus,
            color: "text-primary",
            bgColor: "bg-primary/10",
            btnColor: "bg-primary hover:bg-primary/90"
        },
        {
            id: 'opening_balances',
            title: "Employee List with Opening Balances",
            description: "Comprehensive financial overview of active employee opening balances (EOBI, SS, Provident Fund).",
            icon: Coins,
            color: "text-primary",
            bgColor: "bg-primary/10",
            btnColor: "bg-primary hover:bg-primary/90"
        },
        {
            id: 'pf_ledger',
            title: "Provident Fund Ledger",
            description: "Provident Fund transaction ledger report. Generates a summary for all active employees or a detailed ledger for a single selected employee.",
            icon: Coins,
            color: "text-primary",
            bgColor: "bg-primary/10",
            btnColor: "bg-primary hover:bg-primary/90"
        },
        {
            id: 'religion',
            title: "Religion Wise Report",
            description: "Grouped employee report organized by religion, providing visibility into active staff religious distribution.",
            icon: Users,
            color: "text-primary",
            bgColor: "bg-primary/10",
            btnColor: "bg-primary hover:bg-primary/90"
        },
        {
            id: 'dob_trigger',
            title: "Employee DOB / Birthday Report",
            description: "Generate birthday and date of birth report for active employees. Defaults to current month or customize with From/To date filters.",
            icon: Cake,
            color: "text-primary",
            bgColor: "bg-primary/10",
            btnColor: "bg-primary hover:bg-primary/90"
        },
        {
            id: 'service',
            title: "Service Wise Report",
            description: "Grouped active employee report organized by service/employment status (e.g. Permanent, Contract, Temporary).",
            icon: Users,
            color: "text-primary",
            bgColor: "bg-primary/10",
            btnColor: "bg-primary hover:bg-primary/90"
        }
    ];
    const filteredReports = reportCards.filter(report => 
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Employee Reports Central</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>

                <div className="flex-1 max-w-md px-4">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search reports..." 
                            className="pl-10 h-9 bg-secondary/50 border-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-auto p-8 text-center sm:text-left">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Generate Professional Reports</h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Generate real-time PDF reports based on various criteria including status, department, designation, and appointment dates.
                        </p>
                        
                        <div className="flex items-center justify-center gap-4 pt-4">
                            <div className="flex items-center space-x-2 bg-card border border-border px-4 py-2 rounded-full shadow-sm">
                                <Switch 
                                    id="with-image" 
                                    checked={withImage} 
                                    onCheckedChange={setWithImage} 
                                />
                                <Label htmlFor="with-image" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                                    <ImageIcon className="w-4 h-4 text-primary" />
                                    Include Employee Pictures
                                </Label>
                            </div>
                        </div>
                    </div>

                    {filteredReports.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 pt-4 italic sm:not-italic">
                            {filteredReports.map((report, index) => (
                            <motion.div
                                key={report.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-card p-6 rounded-2xl border border-border transition-all flex flex-col space-y-4 text-left"
                            >
                                <div className={`${report.bgColor} w-12 h-12 rounded-xl flex items-center justify-center`}>
                                    <report.icon className={`w-6 h-6 ${report.color}`} />
                                </div>
                                
                                <div className="space-y-1 flex-1">
                                    <h3 className="text-lg font-bold text-foreground">{report.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {report.description}
                                    </p>
                                </div>

                                <Button
                                    onClick={() => handleGenerateReport(report.id)}
                                    disabled={loadingReport !== null}
                                    className={`w-full h-11 gap-2 text-sm font-bold transition-all ${report.btnColor}`}
                                >
                                    {loadingReport === report.id
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <FileDown className="w-4 h-4" />}
                                    {loadingReport === report.id ? "Generating..." : "Generate PDF"}
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
                        <p className="text-muted-foreground">No reports found matching "{searchQuery}"</p>
                    </div>
                )}
            </div>
        </div>

            {/* New Appointments Modal */}
            <Dialog open={isAppointmentModalOpen} onOpenChange={setIsAppointmentModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>New Appointments Report</DialogTitle>
                        <DialogDescription>
                            Select the date range and optional filters for the appointment report.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="fromDate">From Date</Label>
                                <Input 
                                    id="fromDate" 
                                    type="date" 
                                    value={fromDate} 
                                    onChange={(e) => setFromDate(e.target.value)} 
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="toDate">To Date</Label>
                                <Input 
                                    id="toDate" 
                                    type="date" 
                                    value={toDate} 
                                    onChange={(e) => setToDate(e.target.value)} 
                                />
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <Label>Department (Optional)</Label>
                            <Select value={selectedDept} onValueChange={setSelectedDept}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.filter(d => d.departmentCode).map(dept => (
                                        <SelectItem key={dept.departmentCode} value={String(dept.departmentCode)}>
                                            {dept.departmentName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Designation (Optional)</Label>
                            <Select value={selectedDesig} onValueChange={setSelectedDesig}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Designation" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Designations</SelectItem>
                                    {designations.filter(d => d.designationCode).map(desig => (
                                        <SelectItem key={desig.designationCode} value={String(desig.designationCode)}>
                                            {desig.designationName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsAppointmentModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={() => handleGenerateReport('new_appointment_submit')}
                            disabled={loadingReport === 'new_appointment_submit'}
                        >
                            {loadingReport === 'new_appointment_submit' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Generate Report
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Employee Selection Modal for PF Ledger */}
            <EmployeeSelectModal
                isOpen={isPfLedgerModalOpen}
                onClose={() => setIsPfLedgerModalOpen(false)}
                onSelect={async (employee) => {
                    setIsPfLedgerModalOpen(false);
                    try {
                        setLoadingReport('pf_ledger');
                        await employeeService.viewEmployeePfLedgerReport(employee.empCardNo, userSite);
                        toast({ title: "Report Ready", description: `PF Ledger report for ${employee.empName} opened in a new tab.` });
                    } catch (err) {
                        toast({ title: "Error", description: "Failed to generate PF Ledger report.", variant: "destructive" });
                    } finally {
                        setLoadingReport(null);
                    }
                }}
            />

            {/* PF Ledger Mode Options Dialog */}
            <Dialog open={isPfLedgerOptionOpen} onOpenChange={setIsPfLedgerOptionOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Provident Fund Ledger Options</DialogTitle>
                        <DialogDescription>
                            Select the report type you would like to generate.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-6">
                        <Button 
                            className="w-full h-12 text-sm font-bold flex items-center justify-center gap-2 bg-primary hover:bg-primary/95"
                            onClick={async () => {
                                setIsPfLedgerOptionOpen(false);
                                try {
                                    setLoadingReport('pf_ledger');
                                    await employeeService.viewEmployeePfLedgerAllReport(userSite);
                                    toast({ title: "Report Ready", description: "All employees PF Ledger Summary opened in a new tab." });
                                } catch (err) {
                                    toast({ title: "Error", description: "Failed to generate PF Summary report.", variant: "destructive" });
                                } finally {
                                    setLoadingReport(null);
                                }
                            }}
                            disabled={loadingReport !== null}
                        >
                            Generate Summary (All Employees)
                        </Button>
                        <Button 
                            variant="secondary"
                            className="w-full h-12 text-sm font-bold flex items-center justify-center gap-2"
                            onClick={() => {
                                setIsPfLedgerOptionOpen(false);
                                setIsPfLedgerModalOpen(true);
                            }}
                            disabled={loadingReport !== null}
                        >
                            Generate Ledger (Single Employee)
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsPfLedgerOptionOpen(false)}
                            className="w-full"
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Employee DOB / Birthday Report Modal */}
            <Dialog open={isDobModalOpen} onOpenChange={setIsDobModalOpen}>
                <DialogContent className="sm:max-w-[440px]">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                                <Cake className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold text-foreground">Employee Date of Birth Report</DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                    Filter active employee birthdays by month or custom date range.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Quick Presets */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground">Quick Presets</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-8 hover:bg-primary/10 hover:text-primary transition-colors"
                                    onClick={() => {
                                        const now = new Date();
                                        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('en-CA');
                                        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toLocaleDateString('en-CA');
                                        setDobFromDate(firstDay);
                                        setDobToDate(lastDay);
                                    }}
                                >
                                    Current Month
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-8 hover:bg-primary/10 hover:text-primary transition-colors"
                                    onClick={() => {
                                        const now = new Date();
                                        const firstDay = new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString('en-CA');
                                        const lastDay = new Date(now.getFullYear(), now.getMonth() + 2, 0).toLocaleDateString('en-CA');
                                        setDobFromDate(firstDay);
                                        setDobToDate(lastDay);
                                    }}
                                >
                                    Next Month
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-8 hover:bg-primary/10 hover:text-primary transition-colors"
                                    onClick={() => {
                                        const now = new Date();
                                        const firstDay = new Date(now.getFullYear(), 0, 1).toLocaleDateString('en-CA');
                                        const lastDay = new Date(now.getFullYear(), 11, 31).toLocaleDateString('en-CA');
                                        setDobFromDate(firstDay);
                                        setDobToDate(lastDay);
                                    }}
                                >
                                    All Year
                                </Button>
                            </div>
                        </div>

                        {/* Date Range Inputs */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="dobFromDate" className="text-xs font-semibold text-foreground">From Date</Label>
                                <Input 
                                    id="dobFromDate" 
                                    type="date" 
                                    value={dobFromDate} 
                                    onChange={(e) => setDobFromDate(e.target.value)} 
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="dobToDate" className="text-xs font-semibold text-foreground">To Date</Label>
                                <Input 
                                    id="dobToDate" 
                                    type="date" 
                                    value={dobToDate} 
                                    onChange={(e) => setDobToDate(e.target.value)} 
                                />
                            </div>
                        </div>
                        
                        {/* Department Filter */}
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-foreground">Department (Optional)</Label>
                            <Select value={dobSelectedDept} onValueChange={setDobSelectedDept}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Departments" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.filter(d => d.departmentCode).map(dept => (
                                        <SelectItem key={dept.departmentCode} value={String(dept.departmentCode)}>
                                            {dept.departmentName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Designation Filter */}
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-foreground">Designation (Optional)</Label>
                            <Select value={dobSelectedDesig} onValueChange={setDobSelectedDesig}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Designations" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Designations</SelectItem>
                                    {designations.filter(d => d.designationCode).map(desig => (
                                        <SelectItem key={desig.designationCode} value={String(desig.designationCode)}>
                                            {desig.designationName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsDobModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                            onClick={() => handleGenerateReport('dob_submit')}
                            disabled={loadingReport === 'dob_submit'}
                        >
                            {loadingReport === 'dob_submit' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Generate DOB Report
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EmployeeReportsPage;
