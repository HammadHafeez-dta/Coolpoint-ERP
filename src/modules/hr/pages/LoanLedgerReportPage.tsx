import { useState, useEffect } from "react";
import {
    FileText,
    Loader2,
    Search,
    User,
    Building2,
    Briefcase,
    LayoutList,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useToast } from "@/shared/components/ui/use-toast";
import { EmployeeSelectModal } from "../components/EmployeeSelectModal";
import { Employee } from "../services/employeeService";
import { loanService, LoanTypeDto } from "../services/loanService";
import { authService } from "@/modules/auth/services/authService";
import { motion } from "framer-motion";

const LoanLedgerReportPage = () => {
    const { toast } = useToast();
    const site = authService.getSite() || "";
    const currentUser = authService.getCurrentUser();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [selectedLoanType, setSelectedLoanType] = useState<string>("Salary Advance");
    const [generatingPdf, setGeneratingPdf] = useState(false);

    const loanTypes = ["Salary Advance", "Vehicle Loan", "Long Term Loan"];

    const handleEmployeeSelect = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(false);
    };

    const handleViewReport = async () => {
        if (!selectedEmployee) {
            toast({ title: "Selection Required", description: "Please select an employee first.", variant: "destructive" });
            return;
        }
        if (!selectedLoanType) {
            toast({ title: "Type Required", description: "Please select a loan type.", variant: "destructive" });
            return;
        }

        try {
            setGeneratingPdf(true);
            await loanService.viewLoanLedgerReport({
                empCardNo: selectedEmployee.empCardNo,
                loanType: selectedLoanType,
                site,
                userName: currentUser?.username || "Admin"
            });
            toast({
                title: "Report Generated",
                description: `Loan Ledger for ${selectedEmployee.empName} has been opened.`
            });
        } catch (error: any) {
            console.error("Failed to generate PDF", error);
            const errorMsg = error.response?.data || "Failed to generate loan ledger report.";
            toast({
                title: "Error",
                description: typeof errorMsg === 'string' ? errorMsg : "An error occurred.",
                variant: "destructive"
            });
        } finally {
            setGeneratingPdf(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Header */}
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs shrink-0">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <LayoutList className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Loan Ledger Report</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button
                        onClick={handleViewReport}
                        disabled={generatingPdf || !selectedEmployee}
                        className="h-8 text-xs bg-[#171858] hover:bg-[#121344] text-white shadow-xs active:scale-[0.98] transition-transform font-bold px-4 gap-1.5"
                    >
                        {generatingPdf ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <FileText className="w-4 h-4" />
                                View Ledger
                            </>
                        )}
                    </Button>
                </div>
            </header>            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6 space-y-6">

                {/* Stats / Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className="bg-sidebar/10 p-3 rounded-xl"><User className="w-6 h-6 text-sidebar" /></div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Employee</p>
                            <h3 className="text-sm font-black truncate">{selectedEmployee?.empName || "Select Employee"}</h3>
                        </div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className="bg-sidebar/10 p-3 rounded-xl"><Building2 className="w-6 h-6 text-sidebar" /></div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Department</p>
                            <h3 className="text-sm font-black truncate">{selectedEmployee?.deptName || "--"}</h3>
                        </div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className="bg-emerald-500/10 p-3 rounded-xl"><CheckCircle2 className="w-6 h-6 text-emerald-500" /></div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Loan Type</p>
                            <h3 className="text-sm font-black truncate">{selectedLoanType || "--"}</h3>
                        </div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className="bg-amber-500/10 p-3 rounded-xl"><LayoutList className="w-6 h-6 text-amber-500" /></div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Site Context</p>
                            <h3 className="text-sm font-black">{site}</h3>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Left Panel: Configuration */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="col-span-12 lg:col-span-4 space-y-6"
                    >
                        <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-border bg-secondary/10">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Report Configuration</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Employee Selector */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select Employee</Label>
                                    <div
                                        onClick={() => setIsModalOpen(true)}
                                        className={`
                                            flex items-center gap-3 w-full h-11 px-4 rounded-lg border cursor-pointer transition-all
                                            ${selectedEmployee
                                                ? 'border-primary/30 bg-primary/5 text-primary shadow-sm'
                                                : 'border-border bg-background text-muted-foreground hover:border-primary/50'}
                                        `}
                                    >
                                        <Search className="w-4 h-4" />
                                        <span className="text-sm font-bold truncate flex-1">
                                            {selectedEmployee?.empName || "Search Employee..."}
                                        </span>
                                        {selectedEmployee && <div className="bg-primary text-[10px] text-white px-1.5 py-0.5 rounded">#{selectedEmployee.empCardNo}</div>}
                                    </div>
                                </div>

                                {/* Loan Type Selector */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Loan Type</Label>
                                    <Select value={selectedLoanType} onValueChange={setSelectedLoanType}>
                                        <SelectTrigger className="h-11 font-bold">
                                            <SelectValue placeholder="Select type..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loanTypes.map((type) => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-4 flex gap-3 text-amber-600">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p className="text-[11px] font-medium leading-relaxed italic">
                                        The Loan Ledger provides a detailed history of all loan disbursements and salary deductions for the selected employee.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Panel: Preview/Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="col-span-12 lg:col-span-8"
                    >
                        <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden h-full flex flex-col">
                            <div className="p-6 border-b border-border flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Ledger Summary Preview</h3>
                                {selectedEmployee && (
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        Ready to Export
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                                {!selectedEmployee ? (
                                    <div className="space-y-4 max-w-xs">
                                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto opacity-40">
                                            <User className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-muted-foreground">No Employee Selected</h4>
                                            <p className="text-xs text-muted-foreground/60 mt-1">Please select an employee to generate the comprehensive loan ledger report.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full max-w-lg space-y-8 text-left">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-muted/30 p-4 rounded-xl border border-border">
                                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Designation</p>
                                                <p className="text-sm font-bold text-foreground">{selectedEmployee.designationName || "N/A"}</p>
                                            </div>
                                            <div className="bg-muted/30 p-4 rounded-xl border border-border">
                                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Emp Status</p>
                                                <p className="text-sm font-bold text-foreground">{selectedEmployee.employmentStatus || "Permanent"}</p>
                                            </div>
                                        </div>

                                        <div className="p-8 border-2 border-dashed border-primary/20 bg-primary/5 rounded-3xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                                <LayoutList className="w-32 h-32 text-primary" />
                                            </div>
                                            <div className="relative z-10">
                                                <h4 className="text-lg font-black text-foreground mb-1 uppercase tracking-tight">Comprehensive Ledger</h4>
                                                <p className="text-xs text-muted-foreground mb-6">Clicking the button will call the server procedure to calculate all balances and generate the PDF ledger.</p>
                                                <Button
                                                    onClick={handleViewReport}
                                                    disabled={generatingPdf}
                                                    className="h-12 px-8 font-black rounded-xl shadow-lg transition-all active:scale-95 w-full"
                                                >
                                                    {generatingPdf ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                                                    DOWNLOAD LEDGER PDF
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-secondary/30 px-6 py-3 border-t border-border flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        Data Site Synchronized
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                    SITE: {site}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <EmployeeSelectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handleEmployeeSelect}
            />
        </div>
    );
};

export default LoanLedgerReportPage;
