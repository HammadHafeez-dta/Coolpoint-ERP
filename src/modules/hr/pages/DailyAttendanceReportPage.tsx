import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    FileText,
    Calendar,
    Building2,
    Users,
    X,
    Eye,
    Loader2,
    Settings,
    LogOut,
    CheckCircle2,
    User
} from "lucide-react";
import { format } from "date-fns";

import { authService } from "@/modules/auth/services/authService";
import { attendanceService } from "../services/attendanceService";
import { departmentService } from "../services/departmentService";
import { designationService } from "../services/designationService";
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
import { Checkbox } from "@/shared/components/ui/checkbox";
import { useToast } from "@/shared/components/ui/use-toast";
import { Search } from "lucide-react";

export const DailyAttendanceReportPage = () => {
    const { toast } = useToast();
    const userSite = authService.getSite() || "";

    // Form State
    const [dateMode, setDateMode] = useState<"monthly" | "custom">("monthly");
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [fromDate, setFromDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const [selectedEmp, setSelectedEmp] = useState<string>("all");
    const [selectedEmpName, setSelectedEmpName] = useState<string>("");
    const [selectedDept, setSelectedDept] = useState<string>("all");
    const [selectedDesig, setSelectedDesig] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("All");
    const [isManual, setIsManual] = useState<boolean>(false);

    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Queries for dropdowns
    const { data: departments = [] } = useQuery({
        queryKey: ['departments', userSite],
        queryFn: () => departmentService.getAll(userSite),
        staleTime: 5 * 60 * 1000,
    });

    const { data: designations = [] } = useQuery({
        queryKey: ['designations', userSite],
        queryFn: () => designationService.getAll(userSite),
        staleTime: 5 * 60 * 1000,
    });

    const handleViewReport = async () => {
        let reportFromDate = fromDate;
        let reportToDate = toDate;

        if (dateMode === "monthly") {
            if (!selectedMonth) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Please select a month."
                });
                return;
            }

            const [year, month] = selectedMonth.split('-').map(Number);
            const lastDay = new Date(year, month, 0).getDate();
            reportFromDate = `${selectedMonth}-01`;
            reportToDate = `${selectedMonth}-${String(lastDay).padStart(2, '0')}`;
        }

        if (!reportFromDate || !reportToDate) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please select both From and To dates."
            });
            return;
        }

        if (dateMode === "custom" && reportFromDate > reportToDate) {
            toast({
                variant: "destructive",
                title: "Invalid date range",
                description: "From Date must be on or before To Date."
            });
            return;
        }

        try {
            setIsGenerating(true);
            await attendanceService.viewDailyAttendanceReport({
                site: userSite,
                fromDate: reportFromDate,
                toDate: reportToDate,
                status: selectedStatus === "All" ? undefined : selectedStatus,
                deptCode: selectedDept === "all" ? undefined : selectedDept,
                desigCode: selectedDesig === "all" ? undefined : parseInt(selectedDesig),
                isManual: isManual ? true : undefined,
                empCardNo: selectedEmp === "all" ? undefined : parseInt(selectedEmp)
            });
            toast({ title: "Success", description: "Report generated successfully." });
        } catch (err: any) {
            console.error("Report Error:", err);
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
                        <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Daily Attendance Report</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 font-medium" onClick={() => window.history.back()}>
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
                                Report Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="space-y-8">
                                {/* Monthly is the default; custom dates remain available when needed. */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            Report Period
                                        </Label>
                                        <Select value={dateMode} onValueChange={(value) => setDateMode(value as "monthly" | "custom")}>
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Select report period" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="monthly">Monthly (Default)</SelectItem>
                                                <SelectItem value="custom">Specific Date Range</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {dateMode === "monthly" ? (
                                        <div className="space-y-2">
                                            <Label htmlFor="attendanceMonth" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" /> Select Month
                                            </Label>
                                            <Input
                                                id="attendanceMonth"
                                                type="month"
                                                value={selectedMonth}
                                                onChange={(e) => setSelectedMonth(e.target.value)}
                                                className="relative h-10 pr-12 font-medium [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                            />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="attendanceFromDate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" /> From Date
                                                </Label>
                                                <Input
                                                    id="attendanceFromDate"
                                                    type="date"
                                                    value={fromDate}
                                                    onChange={(e) => setFromDate(e.target.value)}
                                                    className="h-10 font-medium"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="attendanceToDate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" /> To Date
                                                </Label>
                                                <Input
                                                    id="attendanceToDate"
                                                    type="date"
                                                    value={toDate}
                                                    min={fromDate || undefined}
                                                    onChange={(e) => setToDate(e.target.value)}
                                                    className="h-10 font-medium"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Filter Row 1: Status & Manual */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Attendance Status
                                        </Label>
                                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="All">All Employees</SelectItem>
                                                <SelectItem value="Present">Present Only</SelectItem>
                                                <SelectItem value="Absent">Absent Only</SelectItem>
                                                <SelectItem value="Late Arrival">Late Arrival Only</SelectItem>
                                                <SelectItem value="Early Going">Early Going Only</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg border border-border/50 h-10">
                                        <Checkbox
                                            id="manualAtt"
                                            checked={isManual}
                                            onCheckedChange={(checked) => setIsManual(checked as boolean)}
                                        />
                                        <Label htmlFor="manualAtt" className="text-sm font-medium cursor-pointer">Manual Attendance Only</Label>
                                    </div>
                                </div>

                                {/* Filter Row 2: Employee */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" /> Employee Selection (Optional)
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

                                {/* Filter Row 3: Dept & Desig */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <Building2 className="w-3.5 h-3.5" /> Department
                                        </Label>
                                        <Select value={selectedDept} onValueChange={setSelectedDept}>
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Select Department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Departments</SelectItem>
                                                {departments.map(d => (
                                                    <SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5" /> Designation
                                        </Label>
                                        <Select value={selectedDesig} onValueChange={setSelectedDesig}>
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Select Designation" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Designations</SelectItem>
                                                {designations.map(d => (
                                                    <SelectItem key={d.designationCode} value={d.designationCode.toString()}>{d.designationName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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

                    <div className="p-4 bg-sidebar/5 border border-sidebar/15 rounded-xl">
                        <p className="text-xs text-sidebar/80 leading-relaxed text-center">
                            <strong>Note:</strong> This report includes processed attendance records. Please ensure you have run the "Update Attendance" process for the selected dates to get the latest data.
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

export default DailyAttendanceReportPage;
