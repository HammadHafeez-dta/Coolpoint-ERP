import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    Cpu,
    Calendar,
    User,
    X,
    Eye,
    Loader2,
    Settings,
    LogOut
} from "lucide-react";
import { format } from "date-fns";

import { authService } from "@/modules/auth/services/authService";
import { attendanceService } from "../services/attendanceService";
import { employeeService } from "../services/employeeService";
import { EmployeeSelectModal } from "../components/EmployeeSelectModal";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { useToast } from "@/shared/components/ui/use-toast";
import { Search } from "lucide-react";

export const MachineAttendanceReportPage = () => {
    const { toast } = useToast();
    const userSite = authService.getSite() || "";
    
    // Form State
    const [fromDate, setFromDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedEmp, setSelectedEmp] = useState<string>("all");
    const [selectedEmpName, setSelectedEmpName] = useState<string>("");
    
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Query for employees
    const { data: employees = [] } = useQuery({
        queryKey: ['employees', userSite],
        queryFn: () => employeeService.getAll(userSite),
        staleTime: 5 * 60 * 1000,
    });

    const handleViewReport = async () => {
        try {
            setIsGenerating(true);
            await attendanceService.viewMachineAttendanceReport({
                site: userSite,
                fromDate,
                toDate,
                empCardNo: selectedEmp === "all" ? undefined : parseInt(selectedEmp)
            });
            toast({ title: "Success", description: "Report generated successfully." });
        } catch (err: any) {
            const errorMessage = err.response?.data || "Failed to generate report.";
            toast({
                variant: "destructive",
                title: "Report Status",
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
                        <Cpu className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Machine Attendance Report</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button variant="outline" size="sm" className="h-8 text-xs border-border hover:bg-muted active:scale-[0.98] transition-transform gap-1.5" onClick={() => window.history.back()}>
                        <LogOut className="w-3.5 h-3.5" /> Exit
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-6 space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto space-y-6"
                >
                    <Card className="border-border/50 shadow-xl shadow-sidebar/5 overflow-hidden">
                        <CardHeader className="bg-muted/50 border-b border-border/50">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Settings className="w-5 h-5 text-sidebar" />
                                Filter Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="space-y-8">
                                {/* Date Selection Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" /> From Date
                                        </Label>
                                        <Input
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            className="h-10 font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" /> To Date
                                        </Label>
                                        <Input
                                            type="date"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                            className="h-10 font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Employee Selection */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" /> Employee (Optional)
                                    </Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                placeholder="All Employees"
                                                value={selectedEmp === "all" ? "" : `${selectedEmp} - ${selectedEmpName}`}
                                                readOnly
                                                className="h-10 pr-10 cursor-default bg-muted/20"
                                            />
                                            {selectedEmp !== "all" && (
                                                <button
                                                    onClick={() => { setSelectedEmp("all"); setSelectedEmpName(""); }}
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
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                                    <Button
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                        className="h-11 px-6 font-semibold"
                                    >
                                        <X className="w-4 h-4 mr-2" /> Cancel
                                    </Button>
                                    <Button
                                        onClick={handleViewReport}
                                        disabled={isGenerating}
                                        className="h-11 px-10 bg-sidebar hover:bg-sidebar shadow-lg shadow-sidebar/20 font-bold gap-2"
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
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-4 bg-sidebar/5 border border-sidebar/15 rounded-xl text-center">
                        <p className="text-xs text-sidebar/80 leading-relaxed">
                            <strong>Note:</strong> This report displays consolidated machine punches. To see raw un-processed records, check the real-time logs.
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

export default MachineAttendanceReportPage;
