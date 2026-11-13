import { useState } from "react";
import { 
    FileText, 
    Loader2, 
    Search,
    X,
    User
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useToast } from "@/shared/components/ui/use-toast";
import { EmployeeSelectModal } from "../components/EmployeeSelectModal";
import { Employee } from "../services/employeeService";
import { leaveApplicationService } from "../services/leaveApplicationService";
import { authService } from "@/modules/auth/services/authService";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const LeaveApplicationReportPage = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const site = authService.getSite() || "";

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [generatingPdf, setGeneratingPdf] = useState(false);

    // Fetch balance for selected employee
    const { data: balance, isLoading: loadingBalance } = useQuery({
        queryKey: ['empBalance', selectedEmployee?.empCardNo, site],
        queryFn: () => leaveApplicationService.getBalance(selectedEmployee!.empCardNo, site),
        enabled: !!selectedEmployee
    });

    const handleEmployeeSelect = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(false);
    };

    const handleViewReport = async () => {
        if (!selectedEmployee) {
            toast({ 
                title: "Selection Required", 
                description: "Please select an employee first.", 
                variant: "destructive" 
            });
            return;
        }

        try {
            setGeneratingPdf(true);
            await leaveApplicationService.viewLeaveApplicationReport({
                site,
                empCardNo: selectedEmployee.empCardNo
            });
            toast({ 
                title: "Report Generated", 
                description: `Leave application for ${selectedEmployee.empName} has been opened.` 
            });
        } catch (error) {
            console.error("Failed to generate PDF", error);
            toast({ 
                title: "Error", 
                description: "Failed to generate official PDF report.", 
                variant: "destructive" 
            });
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
                        <h2 className="text-sm font-display font-bold text-foreground">Leave Application Report</h2>
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
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <FileText className="w-4 h-4 mr-2" />
                                Generate PDF Report
                            </>
                        )}
                    </Button>
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Stats / Overview Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className="bg-sidebar/10 p-3 rounded-xl"><User className="w-6 h-6 text-sidebar" /></div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Selected Employee</p>
                            <h3 className="text-sm font-bold truncate max-w-[150px]">{selectedEmployee?.empName || "None Selected"}</h3>
                        </div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className="bg-green-500/10 p-3 rounded-xl"><FileText className="w-6 h-6 text-green-500" /></div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Annual Balance</p>
                            <h3 className="text-xl font-black">{balance?.alBalance ?? 0} <span className="text-[10px] font-normal">Days</span></h3>
                        </div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className="bg-orange-500/10 p-3 rounded-xl"><FileText className="w-6 h-6 text-orange-500" /></div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Casual Balance</p>
                            <h3 className="text-xl font-black">{balance?.clBalance ?? 0} <span className="text-[10px] font-normal">Days</span></h3>
                        </div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className="bg-red-500/10 p-3 rounded-xl"><FileText className="w-6 h-6 text-red-500" /></div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Sick Balance</p>
                            <h3 className="text-xl font-black">{balance?.slBalance ?? 0} <span className="text-[10px] font-normal">Days</span></h3>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Selection Form */}
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
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select Employee</Label>
                                    <div className="flex flex-col gap-2">
                                        <div className="relative group">
                                            <Input 
                                                readOnly
                                                value={selectedEmployee?.empName || ""}
                                                placeholder="Click to search..."
                                                onClick={() => setIsModalOpen(true)}
                                                className="h-11 border-border bg-background cursor-pointer pr-10 font-bold text-primary"
                                            />
                                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                        {selectedEmployee && (
                                            <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-1">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Card Number</p>
                                                <p className="text-sm font-sans font-black text-foreground">{selectedEmployee.empCardNo}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                                        Select an employee to view their current leave balance and generate a comprehensive leave history report in PDF format.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Detailed Balance / Preview Section */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="col-span-12 lg:col-span-8"
                    >
                        <div className="bg-card border border-border shadow-sm rounded-xl h-full flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-border flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Employee Leave Summary</h3>
                                {selectedEmployee && (
                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                                        Active Selection: {selectedEmployee.empCardNo}
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                                {!selectedEmployee ? (
                                    <div className="space-y-4 max-w-xs">
                                        <div className="bg-muted/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                            <User className="w-8 h-8 text-muted-foreground/40" />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-bold text-muted-foreground">No Employee Selected</h4>
                                            <p className="text-xs text-muted-foreground/60">
                                                Please select an employee from the left panel to preview their leave balance and statistics.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full space-y-8">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div className="space-y-2">
                                                <div className="text-3xl font-black text-primary">{balance?.alBalance ?? 0}</div>
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Annual (AL)</div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-3xl font-black text-green-600">{balance?.clBalance ?? 0}</div>
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Casual (CL)</div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-3xl font-black text-orange-500">{balance?.slBalance ?? 0}</div>
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Sick (SL)</div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-3xl font-black text-purple-600">{balance?.cplBalance ?? 0}</div>
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Compensatory (CPL)</div>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-8 border-t border-border">
                                            <div className="bg-secondary/20 rounded-xl p-6 flex items-center justify-between text-left">
                                                <div className="space-y-1">
                                                    <h4 className="text-sm font-bold text-foreground">Ready to generate report?</h4>
                                                    <p className="text-xs text-muted-foreground">The report will include all leave history for {selectedEmployee.empName}.</p>
                                                </div>
                                                <Button 
                                                    onClick={handleViewReport} 
                                                    disabled={generatingPdf}
                                                    variant="secondary"
                                                    className="h-10 font-bold"
                                                >
                                                    Preview History
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Bottom Footer for Site Info */}
                            <div className="bg-secondary/30 px-6 py-3 border-t border-border flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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

export default LeaveApplicationReportPage;
