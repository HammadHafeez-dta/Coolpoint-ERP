import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    Clock,
    Calendar,
    User,
    Building2,
    Award,
    X,
    Eye,
    Loader2,
    FileText,
    LogOut,
    Search
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
import { useToast } from "@/shared/components/ui/use-toast";

export const OvertimeReportPage = () => {
    const { toast } = useToast();
    const userSite = authService.getSite() || "";
    
    // Form State
    const [fromDate, setFromDate] = useState(format(new Date(), 'yyyy-MM-01'));
    const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedEmp, setSelectedEmp] = useState<string>("all");
    const [selectedEmpName, setSelectedEmpName] = useState<string>("");
    const [selectedDept, setSelectedDept] = useState<string>("all");
    const [selectedDesig, setSelectedDesig] = useState<string>("all");
    
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Queries
    const { data: departments = [] } = useQuery({
        queryKey: ['departments', userSite],
        queryFn: () => departmentService.getAll(userSite),
    });

    const { data: designations = [] } = useQuery({
        queryKey: ['designations', userSite],
        queryFn: () => designationService.getAll(userSite),
    });

    const handleViewReport = async () => {
        try {
            setIsGenerating(true);
            await attendanceService.viewOvertimeReport({
                site: userSite,
                fromDate,
                toDate,
                empCardNo: selectedEmp === "all" ? undefined : parseInt(selectedEmp),
                deptCode: selectedDept === "all" ? undefined : selectedDept,
                desigCode: selectedDesig === "all" ? undefined : parseInt(selectedDesig)
            });
            toast({ title: "Success", description: "Report generated successfully." });
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
                        <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Employee Overtime Report</h2>
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
                    className="max-w-4xl mx-auto space-y-6"
                >
                    <Card className="border-border/50 shadow-xl">
                        <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
                            <CardTitle className="text-base font-semibold flex items-center gap-2 text-orange-700">
                                <FileText className="w-4 h-4" />
                                Report Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {/* Date Selection Row */}
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

                                {/* Employee Selection */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-tight">
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
                                            className="h-10 w-10 shrink-0 border-orange-200 bg-orange-50 hover:bg-orange-100"
                                            onClick={() => setIsEmployeeModalOpen(true)}
                                        >
                                            <Search className="w-4 h-4 text-orange-600" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Department Selection */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-tight">
                                        <Building2 className="w-3.5 h-3.5" /> Department
                                    </Label>
                                    <Select value={selectedDept} onValueChange={setSelectedDept}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Departments" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Departments</SelectItem>
                                            {departments.map(d => (
                                                <SelectItem key={d.code} value={d.code}>
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Designation Selection */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-tight">
                                        <Award className="w-3.5 h-3.5" /> Designation
                                    </Label>
                                    <Select value={selectedDesig} onValueChange={setSelectedDesig}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Designations" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Designations</SelectItem>
                                            {designations.map(d => (
                                                <SelectItem key={d.designationCode} value={d.designationCode.toString()}>
                                                    {d.designationName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-10 mt-6 border-t border-border/50">
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
                                    className="h-11 px-12 bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-500/20 font-bold gap-2"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-4 h-4" />
                                            View Overtime
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-2xl text-center">
                        <div className="bg-orange-100 p-2 rounded-full shrink-0">
                            <Clock className="w-4 h-4 text-orange-700" />
                        </div>
                        <p className="text-[11px] text-orange-800 leading-relaxed">
                            <strong>Note:</strong> This report includes both Machine-calculated overtime and Manually adjusted overtime records.
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

export default OvertimeReportPage;
