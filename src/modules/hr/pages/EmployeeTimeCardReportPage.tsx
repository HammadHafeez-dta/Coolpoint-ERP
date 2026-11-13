import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Calendar,
    User,
    X,
    Eye,
    Loader2,
    FileText,
    LogOut
} from "lucide-react";
import { format } from "date-fns";

import { authService } from "@/modules/auth/services/authService";
import { attendanceService } from "../services/attendanceService";
import { EmployeeSelectModal } from "../components/EmployeeSelectModal";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useToast } from "@/shared/components/ui/use-toast";
import { Search } from "lucide-react";

export const EmployeeTimeCardReportPage = () => {
    const { toast } = useToast();
    const userSite = authService.getSite() || "";

    // Form State (Default fromDate to 1st day of current month)
    const [fromDate, setFromDate] = useState(format(new Date(), 'yyyy-MM-01'));
    const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedEmp, setSelectedEmp] = useState<string>("");
    const [selectedEmpName, setSelectedEmpName] = useState<string>("");

    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Global listener for F1 key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F1") {
                e.preventDefault();
                setIsEmployeeModalOpen(true);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleViewReport = async () => {
        if (!selectedEmp) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Please enter or select an Employee Card No."
            });
            return;
        }

        const empCardNo = parseInt(selectedEmp);
        if (isNaN(empCardNo)) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Employee Card No. must be a valid number."
            });
            return;
        }

        try {
            setIsGenerating(true);
            await attendanceService.viewEmployeeTimeCardReport({
                site: userSite,
                fromDate,
                toDate,
                empCardNo: empCardNo
            });
            toast({ title: "Success", description: "Time Card Report generated successfully." });
        } catch (err: any) {
            const errorMessage = err.response?.data || "Failed to generate report.";
            toast({
                variant: "destructive",
                title: "Report Error",
                description: errorMessage
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background text-sm overflow-hidden font-sans">
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs shrink-0">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Employee Time Card Report</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button variant="outline" size="sm" className="h-8 text-xs border-border hover:bg-muted active:scale-[0.98] transition-transform gap-1.5" onClick={() => window.history.back()}>
                        <LogOut className="w-3.5 h-3.5" /> Exit
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-xl mx-auto space-y-6"
                >
                    <Card className="border-border/50 shadow-xl">
                        <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
                            <CardTitle className="text-base font-semibold flex items-center gap-2 text-sidebar">
                                <FileText className="w-4 h-4" />
                                Report Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            {/* Date Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-tight">
                                        <Calendar className="w-3.5 h-3.5" /> From Date
                                    </Label>
                                    <Input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="h-10 focus:ring-sidebar"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-tight">
                                        <Calendar className="w-3.5 h-3.5" /> To Date
                                    </Label>
                                    <Input
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        className="h-10 focus:ring-sidebar"
                                    />
                                </div>
                            </div>

                            {/* Employee Selection */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-tight">
                                    <User className="w-3.5 h-3.5" /> Employee Card No. (Press F1 to Search)
                                </Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            type="number"
                                            placeholder="Enter Card No. or Press F1"
                                            value={selectedEmp}
                                            onChange={(e) => {
                                                setSelectedEmp(e.target.value);
                                                setSelectedEmpName(""); // Clear selected name on manual edit
                                            }}
                                            className="h-10 focus:ring-sidebar pr-10"
                                        />
                                        {selectedEmp && (
                                            <button
                                                type="button"
                                                onClick={() => { setSelectedEmp(""); setSelectedEmpName(""); }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-10 w-10 shrink-0 border-sidebar/20 bg-sidebar/5 hover:bg-sidebar/8"
                                        onClick={() => setIsEmployeeModalOpen(true)}
                                    >
                                        <Search className="w-4 h-4 text-sidebar" />
                                    </Button>
                                </div>
                                {selectedEmpName && (
                                    <p className="text-xs text-sidebar font-medium pt-1">
                                        Selected: {selectedEmpName}
                                    </p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                                <Button
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                    className="h-11 px-8 font-semibold"
                                >
                                    <X className="w-4 h-4 mr-2" /> Cancel
                                </Button>
                                <Button
                                    onClick={handleViewReport}
                                    disabled={isGenerating}
                                    className="h-11 px-12 bg-sidebar hover:bg-sidebar shadow-lg shadow-sidebar/20 font-bold gap-2"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-4 h-4" />
                                            View Report
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-3 p-4 bg-sidebar/5 border border-sidebar/15 rounded-2xl">
                        <p className="text-[11px] text-sidebar leading-relaxed text-center w-full">
                            <strong>Note:</strong> You can type the card number directly, click the search icon, or press <strong>F1</strong> to open the employee lookup search modal.
                        </p>
                    </div>
                </motion.div>
            </div>

            <EmployeeSelectModal
                isOpen={isEmployeeModalOpen}
                onClose={() => setIsEmployeeModalOpen(false)}
                onSelect={(employee) => {
                    setSelectedEmp(employee.empCardNo.toString());
                    setSelectedEmpName(employee.empName || "");
                    setIsEmployeeModalOpen(false);
                }}
            />
        </div>
    );
};

export default EmployeeTimeCardReportPage;
