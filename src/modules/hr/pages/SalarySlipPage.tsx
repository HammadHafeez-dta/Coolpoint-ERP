import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { 
    FileText, 
    Calendar, 
    Building2, 
    User, 
    Briefcase, 
    Printer, 
    Loader2 
} from "lucide-react";
import { motion } from "framer-motion";
import { authService } from "@/modules/auth/services/authService";
import { salaryService } from "@/modules/hr/services/salaryService";
import { DepartmentSelectModal } from "@/modules/hr/components/DepartmentSelectModal";
import { DesignationSelectModal } from "@/modules/hr/components/DesignationSelectModal";
import { EmployeeSelectModal } from "@/modules/hr/components/EmployeeSelectModal";
import { useToast } from "@/shared/components/ui/use-toast";

const SalarySlipPage = () => {
    const { toast } = useToast();
    const site = authService.getSite() || "";
    const user = authService.getCurrentUser();

    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [reportType, setReportType] = useState<"DepartmentWise" | "DesignationWise" | "EmployeeWise">("EmployeeWise");
    const [generatingPdf, setGeneratingPdf] = useState(false);

    const [selectedDept, setSelectedDept] = useState<{ code: string; name: string } | null>(null);
    const [selectedDesig, setSelectedDesig] = useState<{ code: number; name: string } | null>(null);
    const [selectedEmp, setSelectedEmp] = useState<{ empCardNo: number; empName: string } | null>(null);

    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
    const [isDesigModalOpen, setIsDesigModalOpen] = useState(false);
    const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);

    const handleViewReport = async () => {
        const filter: any = {
            month,
            year,
            reportType,
            site,
            username: user?.username || "Admin"
        };

        if (reportType === "DepartmentWise") {
            if (!selectedDept) return toast({ title: "Error", description: "Please select a department", variant: "destructive" });
            filter.departmentCode = selectedDept.code;
        } else if (reportType === "DesignationWise") {
            if (!selectedDesig) return toast({ title: "Error", description: "Please select a designation", variant: "destructive" });
            filter.designationCode = selectedDesig.code;
        } else if (reportType === "EmployeeWise") {
            if (!selectedEmp) return toast({ title: "Error", description: "Please select an employee", variant: "destructive" });
            filter.employeeId = selectedEmp.empCardNo;
        }

        try {
            setGeneratingPdf(true);
            await salaryService.viewSalarySlipsPdf(filter);
            toast({ title: "Report Generated", description: `Salary slips for ${month}/${year} have been opened.` });
        } catch (error) {
            console.error("Failed to generate PDF", error);
            toast({ title: "Error", description: "Failed to generate salary slips PDF.", variant: "destructive" });
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
                        <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Employee Salary Slips</h2>
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
                                <Printer className="w-4 h-4 mr-2" />
                                Generate Slips
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
                                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Slip Parameters</h3>
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
                                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Selection Mode */}
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">Selection Mode</Label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { id: 'EmployeeWise', label: 'Specific Employee', icon: User },
                                            { id: 'DepartmentWise', label: 'Department Wise Slips', icon: Building2 },
                                            { id: 'DesignationWise', label: 'Designation Wise Slips', icon: Briefcase },
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setReportType(t.id as any)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-xs font-bold ${
                                                    reportType === t.id 
                                                    ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                                                    : 'bg-background border-border text-muted-foreground hover:bg-muted'
                                                }`}
                                            >
                                                <t.icon className="w-5 h-5" />
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Dynamic Selection */}
                                <div className="space-y-3 pt-4 border-t border-border">
                                    {reportType === "DepartmentWise" && (
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Target Department</Label>
                                            <div className="flex gap-2">
                                                <div className="flex-1 h-10 px-3 rounded-md border border-border bg-muted/30 flex items-center text-xs font-bold truncate">
                                                    {selectedDept ? selectedDept.name : "None Selected"}
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => setIsDeptModalOpen(true)} className="shrink-0">
                                                    Pick
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {reportType === "DesignationWise" && (
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Target Designation</Label>
                                            <div className="flex gap-2">
                                                <div className="flex-1 h-10 px-3 rounded-md border border-border bg-muted/30 flex items-center text-xs font-bold truncate">
                                                    {selectedDesig ? selectedDesig.name : "None Selected"}
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => setIsDesigModalOpen(true)} className="shrink-0">
                                                    Pick
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {reportType === "EmployeeWise" && (
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Target Employee</Label>
                                            <div className="flex gap-2">
                                                <div className="flex-1 h-10 px-3 rounded-md border border-border bg-muted/30 flex items-center text-xs font-bold truncate">
                                                    {selectedEmp ? `${selectedEmp.empCardNo} - ${selectedEmp.empName}` : "None Selected"}
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => setIsEmpModalOpen(true)} className="shrink-0">
                                                    Pick
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Preview Panel */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="col-span-12 lg:col-span-8"
                    >
                        <div className="bg-card border border-border shadow-sm rounded-xl h-full flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-border bg-secondary/5 flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Generation Preview</h3>
                                <div className="flex items-center gap-2 bg-background px-3 py-1 rounded-full border border-border shadow-sm">
                                    <Calendar className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-wider">
                                        {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 p-12 flex flex-col items-center justify-center text-center space-y-6">
                                <div className="bg-primary/5 w-20 h-20 rounded-full flex items-center justify-center border-4 border-background shadow-xl">
                                    <Printer className="w-10 h-10 text-primary" />
                                </div>
                                <div className="space-y-2 max-w-sm">
                                    <h3 className="text-lg font-black text-foreground">Employee Salary Slips</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Generate individual payment vouchers for employees. 
                                        {reportType === "EmployeeWise" ? " Generating slip for one specific employee." : 
                                         reportType === "DepartmentWise" ? " Generating slips for all employees in the selected department." :
                                         " Generating slips for all employees with the selected designation."}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-4 justify-center pt-4">
                                    <div className="bg-muted/50 px-4 py-3 rounded-xl border border-border text-left min-w-[140px]">
                                        <p className="text-[9px] uppercase font-bold text-muted-foreground">Type</p>
                                        <p className="text-sm font-black uppercase">{reportType.replace("Wise", "")}</p>
                                    </div>
                                    <div className="bg-muted/50 px-4 py-3 rounded-xl border border-border text-left min-w-[140px]">
                                        <p className="text-[9px] uppercase font-bold text-muted-foreground">Selection</p>
                                        <p className="text-sm font-black uppercase truncate max-w-[120px]">
                                            {reportType === "DepartmentWise" ? (selectedDept?.name || "None") : 
                                             reportType === "DesignationWise" ? (selectedDesig?.name || "None") :
                                             (selectedEmp?.empName || "None")}
                                        </p>
                                    </div>
                                    <div className="bg-muted/50 px-4 py-3 rounded-xl border border-border text-left min-w-[140px]">
                                        <p className="text-[9px] uppercase font-bold text-muted-foreground">Site</p>
                                        <p className="text-sm font-black uppercase">{site}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-secondary/20 px-6 py-4 border-t border-border flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </div>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                        Print System Ready
                                    </span>
                                </div>
                                <Button 
                                    onClick={handleViewReport}
                                    disabled={generatingPdf}
                                    className="h-10 px-8 font-black shadow-lg shadow-primary/20"
                                >
                                    {generatingPdf ? "Processing..." : "Generate Salary Slips"}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Modals */}
            <DepartmentSelectModal 
                isOpen={isDeptModalOpen}
                onClose={() => setIsDeptModalOpen(false)}
                onSelect={(dept) => setSelectedDept({ code: dept.code, name: dept.name })}
                selectedCode={selectedDept?.code}
            />
            <DesignationSelectModal 
                isOpen={isDesigModalOpen}
                onClose={() => setIsDesigModalOpen(false)}
                onSelect={(desig) => setSelectedDesig({ code: desig.designationCode, name: desig.designationName })}
                selectedCode={selectedDesig?.code}
            />
            <EmployeeSelectModal 
                isOpen={isEmpModalOpen}
                onClose={() => setIsEmpModalOpen(false)}
                onSelect={(emp) => setSelectedEmp({ empCardNo: emp.empCardNo, empName: emp.empName })}
                selectedCode={selectedEmp?.empCardNo?.toString()}
            />
        </div>
    );
};

export default SalarySlipPage;
