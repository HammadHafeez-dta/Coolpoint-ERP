import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    Clock,
    Calendar,
    User,
    Building2,
    X,
    FileText,
    LogOut,
    Search,
    Loader2,
    RotateCcw
} from "lucide-react";

import { authService } from "@/modules/auth/services/authService";
import { attendanceService } from "../services/attendanceService";
import { departmentService } from "../services/departmentService";

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

type ReportType = "all" | "employee" | "department";

export const EmployeeDutyTimingReportPage = () => {
    const { toast } = useToast();
    const userSite = authService.getSite() || "";

    // Form State
    const [reportType, setReportType] = useState<ReportType>("all");
    const [selectedEmpCardNo, setSelectedEmpCardNo] = useState<string>("");
    const [selectedEmpName, setSelectedEmpName] = useState<string>("");
    const [selectedDeptCode, setSelectedDeptCode] = useState<string>("");
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");

    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Departments lookup
    const { data: departments = [] } = useQuery({
        queryKey: ['departments', userSite],
        queryFn: () => departmentService.getAll(userSite),
        enabled: !!userSite,
    });

    const handleReset = () => {
        setReportType("all");
        setSelectedEmpCardNo("");
        setSelectedEmpName("");
        setSelectedDeptCode("");
        setFromDate("");
        setToDate("");
    };

    const handleViewReport = async () => {
        if (reportType === "employee") {
            if (!selectedEmpCardNo) {
                toast({
                    variant: "destructive",
                    title: "Selection Required",
                    description: "Please select an employee before generating the report."
                });
                return;
            }
        } else if (reportType === "department") {
            if (!selectedDeptCode) {
                toast({
                    variant: "destructive",
                    title: "Selection Required",
                    description: "Please select a department before generating the report."
                });
                return;
            }
        }

        // Normalize / swap inverted dates so backend never crashes
        let finalFromDate = fromDate;
        let finalToDate = toDate;
        if (finalFromDate && finalToDate && finalFromDate > finalToDate) {
            [finalFromDate, finalToDate] = [finalToDate, finalFromDate];
        }

        try {
            setIsGenerating(true);
            await attendanceService.viewDutyTimingReport({
                site: userSite,
                reportType,
                employeeCardNo: reportType === "employee" ? parseInt(selectedEmpCardNo, 10) : undefined,
                departmentCode: reportType === "department" ? parseInt(selectedDeptCode, 10) : undefined,
                fromDate: finalFromDate || undefined,
                toDate: finalToDate || undefined,
            });
            toast({
                title: "Report Generated",
                description: "Duty timing report has been generated in a new tab."
            });
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || "Failed to generate duty timing report.";
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
            {/* Header */}
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs shrink-0">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Employee Duty Timing Report</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button variant="outline" size="sm" className="h-8 text-xs border-border hover:bg-muted active:scale-[0.98] transition-transform gap-1.5" onClick={() => window.history.back()}>
                        <LogOut className="w-3.5 h-3.5" /> Exit
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto space-y-6"
                >
                    <Card className="border-border/50 shadow-xl overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
                            <CardTitle className="text-base font-semibold flex items-center gap-2 text-primary">
                                <FileText className="w-4 h-4" />
                                Report Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            {/* Report Type Selector */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                                    Report Scope / Type
                                </Label>
                                <Select
                                    value={reportType}
                                    onValueChange={(val: ReportType) => {
                                        setReportType(val);
                                    }}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select Report Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Employees and Departments</SelectItem>
                                        <SelectItem value="employee">Employee Wise</SelectItem>
                                        <SelectItem value="department">Department Wise</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Conditional: Employee Picker */}
                            {reportType === "employee" && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2"
                                >
                                    <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-tight">
                                        <User className="w-3.5 h-3.5" /> Select Employee <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                placeholder="Choose an employee..."
                                                value={selectedEmpCardNo ? `${selectedEmpCardNo} - ${selectedEmpName}` : ""}
                                                readOnly
                                                className="h-10 pr-10 cursor-default bg-muted/20"
                                            />
                                            {selectedEmpCardNo && (
                                                <button
                                                    type="button"
                                                    onClick={() => { setSelectedEmpCardNo(""); setSelectedEmpName(""); }}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    title="Clear selection"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-10 w-10 shrink-0 border-primary/20 bg-primary/5 hover:bg-primary/10"
                                            onClick={() => setIsEmployeeModalOpen(true)}
                                            title="Search employee"
                                        >
                                            <Search className="w-4 h-4 text-primary" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Conditional: Department Picker */}
                            {reportType === "department" && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2"
                                >
                                    <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-tight">
                                        <Building2 className="w-3.5 h-3.5" /> Select Department <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={selectedDeptCode} onValueChange={setSelectedDeptCode}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Choose a department..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((d) => (
                                                <SelectItem key={d.code} value={d.code}>
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </motion.div>
                            )}

                            {/* Date Range Filter */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-tight">
                                        <Calendar className="w-3.5 h-3.5" /> From Date
                                    </Label>
                                    <Input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="h-10"
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
                                        className="h-10"
                                    />
                                </div>
                            </div>

                            {/* Informational Box for All Mode */}
                            {reportType === "all" && (
                                <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                                    <p className="font-semibold text-primary mb-0.5">Comprehensive Duty Timing Summary</p>
                                    <p>This report will list configured duty timings for all active employees across all departments, grouped with department section banners.</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/50">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={handleReset}
                                    className="h-10 gap-2"
                                    disabled={isGenerating}
                                >
                                    <RotateCcw className="w-4 h-4" /> Reset
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleViewReport}
                                    disabled={isGenerating}
                                    className="h-10 min-w-36 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="w-4 h-4" />
                                            Generate Report
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Employee Select Modal */}
            <EmployeeSelectModal
                isOpen={isEmployeeModalOpen}
                onClose={() => setIsEmployeeModalOpen(false)}
                onSelect={(employee) => {
                    setSelectedEmpCardNo(employee.empCardNo.toString());
                    setSelectedEmpName(employee.empName || "");
                    setIsEmployeeModalOpen(false);
                }}
            />
        </div>
    );
};

export default EmployeeDutyTimingReportPage;
