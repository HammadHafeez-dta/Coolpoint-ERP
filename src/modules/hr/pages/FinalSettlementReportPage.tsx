import { useState } from "react";
import { 
    FileText, 
    Loader2, 
    Search,
    User,
    Calendar,
    Printer,
    Filter
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { useToast } from "@/shared/components/ui/use-toast";
import { EmployeeSelectModal } from "../components/EmployeeSelectModal";
import { Employee } from "../services/employeeService";
import { finalSettlementService } from "../services/finalSettlementService";
import { authService } from "@/modules/auth/services/authService";
import { motion } from "framer-motion";
import { format } from "date-fns";

const FinalSettlementReportPage = () => {
    const { toast } = useToast();
    const site = authService.getSite() || "";
    const user = authService.getCurrentUser();

    const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    
    const [startDate, setStartDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [reportType, setReportType] = useState<"All" | "EmployeeWise">("All");
    const [generatingPdf, setGeneratingPdf] = useState(false);

    const handleEmployeeSelect = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsEmpModalOpen(false);
    };

    const handleViewReport = async () => {
        if (reportType === "EmployeeWise" && !selectedEmployee) {
            toast({ title: "Selection Required", description: "Please select an employee.", variant: "destructive" });
            return;
        }

        try {
            setGeneratingPdf(true);
            // If EmployeeWise, we show the detail report of their LAST settlement in range
            if (reportType === "EmployeeWise") {
                const settlement = await finalSettlementService.getSettlementByCard(selectedEmployee!.empCardNo, site);
                if (settlement) {
                    await finalSettlementService.viewReportPdf(settlement.transactionNo, site);
                    toast({ title: "Report Generated", description: "Detail report has been opened." });
                } else {
                    toast({ title: "No Record", description: "No settlement found for this employee.", variant: "destructive" });
                }
            } else {
                await finalSettlementService.viewSummaryPdf(startDate, endDate, site);
                toast({ title: "Report Generated", description: `Summary for all settlements from ${startDate} to ${endDate} has been opened.` });
            }
        } catch (error) {
            console.error("Failed to generate PDF", error);
            toast({ title: "Error", description: "Failed to generate settlement report.", variant: "destructive" });
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
                        <h2 className="text-sm font-display font-bold text-foreground">Final Settlement Reporting</h2>
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
                                View Report
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
                                {/* Date Range */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">Start Date</Label>
                                        <input 
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">End Date</Label>
                                        <input 
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm font-bold"
                                        />
                                    </div>
                                </div>

                                {/* Report Type */}
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">Output Mode</Label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { id: 'EmployeeWise', label: 'Specific Employee Details', icon: User },
                                            { id: 'All', label: 'Summary Report (All Settlements)', icon: FileText },
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setReportType(t.id as any)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-xs font-bold ${
                                                    reportType === t.id 
                                                    ? 'bg-sidebar/5 border-sidebar/20 text-sidebar shadow-sm'
                                                    : 'bg-background border-border text-muted-foreground hover:bg-muted'
                                                }`}
                                            >
                                                <t.icon className={`w-5 h-5 ${reportType === t.id ? 'text-sidebar' : 'text-muted-foreground'}`} />
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Employee Picker */}
                                {reportType === "EmployeeWise" && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 pt-2 border-t border-border">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">Target Employee</Label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 h-11 px-4 rounded-lg border border-border bg-muted/30 flex items-center text-sm font-bold truncate">
                                                {selectedEmployee ? `${selectedEmployee.empCardNo} - ${selectedEmployee.empName}` : "None Selected"}
                                            </div>
                                            <Button variant="outline" className="h-11 border-border bg-card shadow-sm" onClick={() => setIsEmpModalOpen(true)}>
                                                <Search className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-border">
                                    <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                                        Select the date range and reporting mode. For details, pick a specific employee to see their full settlement breakdown.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Info Panel */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="col-span-12 lg:col-span-8"
                    >
                        <div className="bg-card border border-border shadow-sm rounded-xl h-full flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-border bg-secondary/5 flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Generation Preview</h3>
                                <div className="flex items-center gap-2 bg-background px-3 py-1 rounded-full border border-border shadow-sm">
                                    <Calendar className="w-3.5 h-3.5 text-sidebar" />
                                    <span className="text-[10px] font-black uppercase tracking-wider">
                                        {format(new Date(startDate), 'dd MMM')} - {format(new Date(endDate), 'dd MMM yyyy')}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 p-12 flex flex-col items-center justify-center text-center space-y-6">
                                <div className="bg-sidebar/5 w-20 h-20 rounded-full flex items-center justify-center border-4 border-background shadow-xl">
                                    <FileText className="w-10 h-10 text-sidebar" />
                                </div>
                                <div className="space-y-2 max-w-sm">
                                    <h3 className="text-lg font-black text-foreground">Final Settlement Documents</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {reportType === "EmployeeWise" 
                                            ? "Generate a comprehensive settlement breakdown for the selected employee, including all additions and deductions." 
                                            : "Generate a list of all employees whose final settlements were processed within the selected date range."}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-4 justify-center pt-4">
                                    <div className="bg-muted/50 px-4 py-3 rounded-xl border border-border text-left min-w-[140px]">
                                        <p className="text-[9px] uppercase font-bold text-muted-foreground">Report Type</p>
                                        <p className="text-sm font-black uppercase">{reportType === "All" ? "Summary" : "Details"}</p>
                                    </div>
                                    <div className="bg-muted/50 px-4 py-3 rounded-xl border border-border text-left min-w-[140px]">
                                        <p className="text-[9px] uppercase font-bold text-muted-foreground">Layout</p>
                                        <p className="text-sm font-black uppercase">{reportType === "All" ? "Landscape" : "Portrait"}</p>
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
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sidebar opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-sidebar"></span>
                                    </div>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                        Ready to Generate
                                    </span>
                                </div>
                                <Button 
                                    onClick={handleViewReport}
                                    disabled={generatingPdf}
                                    className="h-10 px-8 font-black bg-sidebar hover:bg-sidebar shadow-lg shadow-sidebar/20"
                                >
                                    {generatingPdf ? "Processing..." : "Generate Settlement Report"}
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
        </div>
    );
};

export default FinalSettlementReportPage;
