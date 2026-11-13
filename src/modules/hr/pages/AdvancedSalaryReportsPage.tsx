import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    FileText,
    Loader2,
    Search,
    User,
    Calendar,
    Tag,
    FileSpreadsheet,
    Users,
    Landmark,
    TrendingUp,
    BookmarkCheck,
    LogOut,
    HelpCircle,
    X
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useToast } from "@/shared/components/ui/use-toast";
import { EmployeeSelectModal } from "../components/EmployeeSelectModal";
import { Employee } from "../services/employeeService";
import { salaryService } from "../services/salaryService";
import { departmentService } from "../services/departmentService";
import { authService } from "@/modules/auth/services/authService";

export const AdvancedSalaryReportsPage = () => {
    const { toast } = useToast();
    const site = authService.getSite() || "";
    const user = authService.getCurrentUser();

    // Modals & Lookup State
    const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    // Form inputs
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [generatingReport, setGeneratingReport] = useState<string | null>(null);

    // Category list query (mapped to departments)
    const { data: categories = [] } = useQuery({
        queryKey: ["departments", site],
        queryFn: () => departmentService.getAll(site),
        staleTime: 5 * 60 * 1000,
    });

    // F1 listener to open employee lookup
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

    const handleEmployeeSelect = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsEmpModalOpen(false);
    };

    const handleClearEmployee = () => {
        setSelectedEmployee(null);
    };

    const handleGenerate = async (reportName: string, action: () => Promise<void>) => {
        try {
            setGeneratingReport(reportName);
            await action();
            toast({
                title: "Report Action Successful",
                description: `${reportName} has been processed successfully.`
            });
        } catch (error: any) {
            console.error(`Failed to generate ${reportName}`, error);
            let errMsg = `Failed to generate ${reportName}.`;
            if (error?.response?.data) {
                if (error.response.data instanceof Blob) {
                    try {
                        const blobText = await error.response.data.text();
                        if (blobText) {
                            try {
                                const parsed = JSON.parse(blobText);
                                errMsg = parsed.message || parsed.title || blobText;
                            } catch {
                                errMsg = blobText;
                            }
                        }
                    } catch {
                        // fallback to default
                    }
                } else if (typeof error.response.data === 'string') {
                    errMsg = error.response.data;
                } else if (error.response.data.message) {
                    errMsg = error.response.data.message;
                }
            } else if (error?.message) {
                errMsg = error.message;
            }
            toast({
                title: "Generation Failed",
                description: String(errMsg),
                variant: "destructive"
            });
        } finally {
            setGeneratingReport(null);
        }
    };

    // Reports Generation Triggers
    const triggerSalarySlips = () =>
        handleGenerate("Salary Slips", () =>
            salaryService.viewSalarySlipsPdf({
                site,
                month,
                year,
                employeeId: selectedEmployee?.empCardNo || null,
                departmentCode: null,
                designationCode: null,
                category: selectedCategory === "all" ? null : selectedCategory,
                reportType: selectedEmployee ? "EmployeeWise" : "DepartmentWise",
                username: user?.username || "Admin"
            })
        );

    const triggerSalaryReport = () =>
        handleGenerate("Salary Sheet", () =>
            salaryService.viewSalaryReportPdf({
                site,
                month,
                year,
                employeeId: selectedEmployee?.empCardNo || null,
                departmentCode: null,
                category: selectedCategory === "all" ? null : selectedCategory,
                reportType: selectedEmployee ? "EmployeeWise" : "All",
                username: user?.username || "Admin"
            })
        );

    const triggerSalarySummary = () =>
        handleGenerate("Salary Summary", () =>
            salaryService.viewSalarySummaryReportPdf({
                site,
                month,
                year,
                category: selectedCategory === "all" ? null : selectedCategory
            })
        );

    const triggerBankTransfer = () =>
        handleGenerate("Bank Transfer Letter", () =>
            salaryService.viewBankTransferReportPdf({
                site,
                month,
                year,
                category: selectedCategory === "all" ? null : selectedCategory
            })
        );

    const triggerPfList = () =>
        handleGenerate("Provident Fund List", () =>
            salaryService.viewPfListReportPdf({
                site,
                month,
                year,
                category: selectedCategory === "all" ? null : selectedCategory
            })
        );

    const triggerSpecialAllowTransfer = () =>
        handleGenerate("Sp. Allowance Transfer", () =>
            salaryService.viewSpecialAllowTransferReportPdf({
                site,
                month,
                year,
                category: selectedCategory === "all" ? null : selectedCategory
            })
        );

    return (
        <div className="flex flex-col h-screen bg-background text-sm font-sans overflow-hidden">
            {/* Top Bar Header */}
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs shrink-0">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Advanced Salary Reporting Central</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button variant="outline" size="sm" className="h-8 text-xs border-border hover:bg-muted active:scale-[0.98] transition-transform gap-1.5" onClick={() => window.history.back()}>
                        <LogOut className="w-3.5 h-3.5" /> Exit
                    </Button>
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6 bg-slate-50/50 dark:bg-slate-950/20">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Settings Form Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:col-span-5 space-y-6"
                    >
                        <Card className="border-border/50 shadow-lg bg-card">
                            <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
                                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                                    Configuration Filters
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5">
                                {/* Salary Month */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                            <Calendar className="w-3 h-3 text-primary" /> Month
                                        </Label>
                                        <select
                                            value={month}
                                            onChange={(e) => setMonth(parseInt(e.target.value))}
                                            className="w-full h-10 px-3 rounded-md border border-border bg-background text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                                <option key={m} value={m}>
                                                    {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                            <Calendar className="w-3 h-3 text-primary" /> Year
                                        </Label>
                                        <select
                                            value={year}
                                            onChange={(e) => setYear(parseInt(e.target.value))}
                                            className="w-full h-10 px-3 rounded-md border border-border bg-background text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
                                        >
                                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Employee Selector */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-between">
                                        <span className="flex items-center gap-1">
                                            <User className="w-3 h-3 text-primary" /> Employee (F1 Lookup)
                                        </span>
                                        {selectedEmployee && (
                                            <button
                                                onClick={handleClearEmployee}
                                                className="text-[9px] text-destructive hover:underline flex items-center gap-0.5"
                                            >
                                                <X className="w-2.5 h-2.5" /> Clear Selection
                                            </button>
                                        )}
                                    </Label>
                                    <div className="relative group">
                                        <Input
                                            readOnly
                                            value={selectedEmployee ? `${selectedEmployee.empCardNo} - ${selectedEmployee.empName}` : ""}
                                            placeholder="Press F1 or Click search icon..."
                                            onClick={() => setIsEmpModalOpen(true)}
                                            className="h-10 cursor-pointer text-xs font-medium pr-10 focus-visible:ring-1 focus-visible:ring-primary"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setIsEmpModalOpen(true)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors"
                                        >
                                            <Search className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {!selectedEmployee && (
                                        <p className="text-[10px] text-muted-foreground italic">
                                            * Leave blank to run reports for all employees
                                        </p>
                                    )}
                                </div>

                                {/* Salary Category */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                        <Tag className="w-3 h-3 text-primary" /> Salary Category
                                    </Label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full h-10 px-3 rounded-md border border-border bg-background text-xs font-medium focus:ring-1 focus:ring-primary outline-none"
                                    >
                                        <option value="all">All Categories</option>
                                        {categories
                                            .filter((c: any) => c.name && c.name.trim() !== "")
                                            .map((c: any) => (
                                                <option key={c.code} value={c.name}>
                                                    {c.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div className="pt-4 border-t border-border/40 flex items-start gap-2 text-muted-foreground">
                                    <HelpCircle className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                                    <p className="text-[11px] leading-relaxed">
                                        Select the target period and filter criteria. F1 lookup will trigger employee modal search.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Reports Grid Control */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:col-span-7 space-y-6"
                    >
                        <Card className="border-border/50 shadow-lg bg-card">
                            <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
                                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                                    Available Statement Formats
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Salary Slips */}
                                    <div className="border border-border/60 hover:border-primary/50 transition-all rounded-xl p-4 bg-muted/10 flex flex-col justify-between space-y-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-sidebar/10 text-sidebar">
                                                    <Users className="w-4 h-4" />
                                                </div>
                                                <h4 className="font-bold text-xs text-foreground">Salary Slips</h4>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                                                A4 Landscape vouchers with Working Days, Father's Name, Loans, and Child Fee notice.
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="w-full text-xs font-bold bg-sidebar hover:bg-sidebar text-white h-9 shadow-sm"
                                            onClick={triggerSalarySlips}
                                            disabled={generatingReport !== null}
                                        >
                                            {generatingReport === "Salary Slips" ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                            ) : null}
                                            Print Salary Slips
                                        </Button>
                                    </div>

                                    {/* Salary Report */}
                                    <div className="border border-border/60 hover:border-primary/50 transition-all rounded-xl p-4 bg-muted/10 flex flex-col justify-between space-y-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-sidebar/10 text-sidebar">
                                                    <FileSpreadsheet className="w-4 h-4" />
                                                </div>
                                                <h4 className="font-bold text-xs text-foreground">Salary Report</h4>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                                                Detailed landscape sheet containing basic, allowances A01-A12, deductions, and shares.
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="w-full text-xs font-bold bg-sidebar hover:bg-sidebar text-white h-9 shadow-sm"
                                            onClick={triggerSalaryReport}
                                            disabled={generatingReport !== null}
                                        >
                                            {generatingReport === "Salary Sheet" ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                            ) : null}
                                            Print Salary Sheet
                                        </Button>
                                    </div>

                                    {/* Salary Summary */}
                                    <div className="border border-border/60 hover:border-primary/50 transition-all rounded-xl p-4 bg-muted/10 flex flex-col justify-between space-y-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-sidebar/10 text-sidebar">
                                                    <TrendingUp className="w-4 h-4" />
                                                </div>
                                                <h4 className="font-bold text-xs text-foreground">Salary Summary</h4>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                                                Consolidated totals grouped by Salary Category displaying counts and aggregate totals.
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="w-full text-xs font-bold bg-sidebar hover:bg-sidebar text-white h-9 shadow-sm"
                                            onClick={triggerSalarySummary}
                                            disabled={generatingReport !== null}
                                        >
                                            {generatingReport === "Salary Summary" ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                            ) : null}
                                            Print Summary
                                        </Button>
                                    </div>

                                    {/* Bank Transfer */}
                                    <div className="border border-border/60 hover:border-primary/50 transition-all rounded-xl p-4 bg-muted/10 flex flex-col justify-between space-y-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-sidebar/10 text-sidebar">
                                                    <Landmark className="w-4 h-4" />
                                                </div>
                                                <h4 className="font-bold text-xs text-foreground">Bank Transfer</h4>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                                                Formal manager instructions letter listing branch bank accounts and Net Payable.
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="w-full text-xs font-bold bg-sidebar hover:bg-sidebar text-white h-9 shadow-sm"
                                            onClick={triggerBankTransfer}
                                            disabled={generatingReport !== null}
                                        >
                                            {generatingReport === "Bank Transfer Letter" ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                            ) : null}
                                            Print Bank Letter
                                        </Button>
                                    </div>

                                    {/* PF List */}
                                    <div className="border border-border/60 hover:border-primary/50 transition-all rounded-xl p-4 bg-muted/10 flex flex-col justify-between space-y-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-sidebar/10 text-sidebar">
                                                    <BookmarkCheck className="w-4 h-4" />
                                                </div>
                                                <h4 className="font-bold text-xs text-foreground">P.F List</h4>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                                                Statement of employee Provident Fund deductions (D01) showing card numbers and scale.
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="w-full text-xs font-bold bg-sidebar hover:bg-sidebar text-white h-9 shadow-sm"
                                            onClick={triggerPfList}
                                            disabled={generatingReport !== null}
                                        >
                                            {generatingReport === "Provident Fund List" ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                            ) : null}
                                            Print P.F List
                                        </Button>
                                    </div>

                                    {/* Sp. Allow Transfer */}
                                    <div className="border border-border/60 hover:border-primary/50 transition-all rounded-xl p-4 bg-muted/10 flex flex-col justify-between space-y-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-sidebar/10 text-sidebar">
                                                    <Landmark className="w-4 h-4" />
                                                </div>
                                                <h4 className="font-bold text-xs text-foreground">Sp. Allow Transfer</h4>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                                                HBL letter requesting special allowance (ADH3/A07) transfer to accounts.
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="w-full text-xs font-bold bg-sidebar hover:bg-sidebar text-white h-9 shadow-sm"
                                            onClick={triggerSpecialAllowTransfer}
                                            disabled={generatingReport !== null}
                                        >
                                            {generatingReport === "Sp. Allowance Transfer" ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                            ) : null}
                                            Print Sp. Allow Letter
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Employee Selection Modal */}
            <EmployeeSelectModal
                isOpen={isEmpModalOpen}
                onClose={() => setIsEmpModalOpen(false)}
                onSelect={handleEmployeeSelect}
            />
        </div>
    );
};

export default AdvancedSalaryReportsPage;
