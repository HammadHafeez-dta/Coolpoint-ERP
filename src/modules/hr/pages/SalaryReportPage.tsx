import { useState } from "react";
import { 
    FileText, 
    Loader2, 
    Search,
    User,
    Building2,
    Calendar,
    Banknote,
    CreditCard
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useToast } from "@/shared/components/ui/use-toast";
import { EmployeeSelectModal } from "../components/EmployeeSelectModal";
import { DepartmentSelectModal } from "../components/DepartmentSelectModal";
import { Employee } from "../services/employeeService";
import { Department } from "../services/departmentService";
import { salaryService } from "../services/salaryService";
import { authService } from "@/modules/auth/services/authService";
import { motion } from "framer-motion";

const SalaryReportPage = () => {
    const { toast } = useToast();
    const site = authService.getSite() || "";
    const user = authService.getCurrentUser();

    const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
    
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [selectedDept, setSelectedDept] = useState<Department | null>(null);
    
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [reportType, setReportType] = useState<"EmployeeWise" | "DepartmentWise" | "BankWise" | "CashWise">("EmployeeWise");
    const [generatingPdf, setGeneratingPdf] = useState(false);

    const handleEmployeeSelect = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsEmpModalOpen(false);
    };

    const handleDeptSelect = (dept: Department) => {
        setSelectedDept(dept);
        setIsDeptModalOpen(false);
    };

    const handleViewReport = async () => {
        if (reportType === "EmployeeWise" && !selectedEmployee) {
            toast({ title: "Selection Required", description: "Please select an employee.", variant: "destructive" });
            return;
        }
        if (reportType === "DepartmentWise" && !selectedDept) {
            toast({ title: "Selection Required", description: "Please select a department.", variant: "destructive" });
            return;
        }

        try {
            setGeneratingPdf(true);
            await salaryService.viewSalaryReportPdf({
                site,
                month,
                year,
                employeeId: reportType === "EmployeeWise" ? selectedEmployee?.empCardNo : null,
                departmentCode: reportType === "DepartmentWise" ? selectedDept?.code?.toString() : null,
                reportType,
                username: user?.username || "Admin"
            });
            toast({ title: "Report Generated", description: `Salary report for ${month}/${year} has been opened.` });
        } catch (error) {
            console.error("Failed to generate PDF", error);
            toast({ title: "Error", description: "Failed to generate official PDF report.", variant: "destructive" });
        } finally {
            setGeneratingPdf(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs shrink-0">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <Banknote className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Monthly Salary Reporting</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button 
                        onClick={handleViewReport}
                        disabled={generatingPdf}
                        className="h-8 text-xs bg-[#171858] hover:bg-[#121344] text-white shadow-xs active:scale-[0.98] transition-transform font-bold px-4 gap-1.5"
                    >
                        {generatingPdf ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <FileText className="w-4 h-4 mr-2" />
                                Generate PDF
                            </>
                        )}
                    </Button>
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
                <div className="grid grid-cols-12 gap-6">
                    {/* Configuration Panel */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="col-span-12 lg:col-span-4 space-y-6"
                    >
                        <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-border bg-secondary/10">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Report Settings</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Period Selection */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">Month</Label>
                                        <select 
                                            value={month}
                                            onChange={(e) => setMonth(parseInt(e.target.value))}
                                            className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm font-bold"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                                <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">Year</Label>
                                        <select 
                                            value={year}
                                            onChange={(e) => setYear(parseInt(e.target.value))}
                                            className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm font-bold"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Report Type */}
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">Output Mode</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { id: 'EmployeeWise', label: 'Employee', icon: User },
                                            { id: 'DepartmentWise', label: 'Department', icon: Building2 },
                                            { id: 'BankWise', label: 'Bank List', icon: CreditCard },
                                            { id: 'CashWise', label: 'Cash List', icon: Banknote },
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setReportType(t.id as any)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-xs font-bold ${
                                                    reportType === t.id 
                                                    ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                                                    : 'bg-background border-border text-muted-foreground hover:bg-muted'
                                                }`}
                                            >
                                                <t.icon className="w-4 h-4" />
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Dynamic Filters */}
                                {reportType === "EmployeeWise" && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">Select Employee</Label>
                                        <div className="relative group">
                                            <Input 
                                                readOnly
                                                value={selectedEmployee?.empName || ""}
                                                placeholder="Search employee..."
                                                onClick={() => setIsEmpModalOpen(true)}
                                                className="h-11 cursor-pointer font-bold"
                                            />
                                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                        </div>
                                    </div>
                                )}

                                {reportType === "DepartmentWise" && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">Select Department</Label>
                                        <div className="relative group">
                                            <Input 
                                                readOnly
                                                value={selectedDept?.name || ""}
                                                placeholder="Search department..."
                                                onClick={() => setIsDeptModalOpen(true)}
                                                className="h-11 cursor-pointer font-bold"
                                            />
                                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-border">
                                    <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                                        Configure the month, year and grouping criteria. Bank and Cash reports will include all employees matching the respective payment mode.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Preview / Info Panel */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="col-span-12 lg:col-span-8"
                    >
                        <div className="bg-card border border-border shadow-sm rounded-xl h-full flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-border bg-secondary/5 flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Report Information</h3>
                                <div className="flex items-center gap-2 bg-background px-3 py-1 rounded-full border border-border shadow-sm">
                                    <Calendar className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-wider">
                                        {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 p-12 flex flex-col items-center justify-center text-center space-y-6">
                                <div className="bg-primary/5 w-20 h-20 rounded-full flex items-center justify-center border-4 border-background shadow-xl">
                                    <FileText className="w-10 h-10 text-primary" />
                                </div>
                                <div className="space-y-2 max-w-sm">
                                    <h3 className="text-lg font-black text-foreground">Official Salary Register</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        You are about to generate a {reportType.replace(/([A-Z])/g, ' $1').trim()} salary report. 
                                        The document will be formatted in landscape orientation for clarity and will include gross pay, deductions, and net payable amounts.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-4 justify-center pt-4">
                                    <div className="bg-muted/50 px-4 py-3 rounded-xl border border-border text-left min-w-[140px]">
                                        <p className="text-[9px] uppercase font-bold text-muted-foreground">Currency</p>
                                        <p className="text-sm font-black uppercase">PKR - Rupees</p>
                                    </div>
                                    <div className="bg-muted/50 px-4 py-3 rounded-xl border border-border text-left min-w-[140px]">
                                        <p className="text-[9px] uppercase font-bold text-muted-foreground">Layout</p>
                                        <p className="text-sm font-black uppercase">Landscape A4</p>
                                    </div>
                                    <div className="bg-muted/50 px-4 py-3 rounded-xl border border-border text-left min-w-[140px]">
                                        <p className="text-[9px] uppercase font-bold text-muted-foreground">Site</p>
                                        <p className="text-sm font-black uppercase">{site}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status Footer */}
                            <div className="bg-secondary/20 px-6 py-4 border-t border-border flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </div>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                        System Ready for Generation
                                    </span>
                                </div>
                                <Button 
                                    onClick={handleViewReport}
                                    disabled={generatingPdf}
                                    className="h-10 px-8 font-black shadow-lg shadow-primary/20"
                                >
                                    {generatingPdf ? "Processing..." : "Generate PDF Report"}
                                </Button>
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
            <DepartmentSelectModal
                isOpen={isDeptModalOpen}
                onClose={() => setIsDeptModalOpen(false)}
                onSelect={handleDeptSelect}
            />
        </div>
    );
};

export default SalaryReportPage;
