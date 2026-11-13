import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    FileText,
    Search,
    Calendar,
    User,
    Building2,
    Users,
    X,
    Eye,
    Loader2,
    Settings,
    LogOut
} from "lucide-react";
import { format } from "date-fns";

import { authService } from "@/modules/auth/services/authService";
import { leaveApplicationService } from "../services/leaveApplicationService";
import { departmentService } from "../services/departmentService";
import { designationService } from "../services/designationService";

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
import { EmployeeSelectModal } from "../components/EmployeeSelectModal";
import { useToast } from "@/shared/components/ui/use-toast";

export const LeaveRegisterReportPage = () => {
    const { toast } = useToast();
    const userSite = authService.getSite() || "";
    
    // Form State
    const [fromDate, setFromDate] = useState(format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'));
    const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    
    const [empCardNo, setEmpCardNo] = useState("");
    const [empName, setEmpName] = useState("");
    const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
    
    const [selectedDept, setSelectedDept] = useState<string>("all");
    const [selectedDesig, setSelectedDesig] = useState<string>("all");
    
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

    const handleEmpSelect = (emp: any) => {
        setEmpCardNo(emp.empCardNo.toString());
        setEmpName(emp.empName);
        setIsEmpModalOpen(false);
    };

    const handleViewReport = async () => {
        try {
            setIsGenerating(true);
            await leaveApplicationService.viewLeaveRegisterReport({
                site: userSite,
                fromDate,
                toDate,
                empCardNo: empCardNo ? parseInt(empCardNo) : undefined,
                deptCode: selectedDept === "all" ? undefined : selectedDept,
                desigCode: selectedDesig === "all" ? undefined : parseInt(selectedDesig)
            });
            toast({ title: "Success", description: "Report generated successfully." });
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: err.response?.data || "Failed to generate report."
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExit = () => {
        window.history.back();
    };

    return (
        <div className="flex flex-col h-screen bg-background text-sm overflow-hidden font-sans">
            {/* Header */}
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs shrink-0">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Leave Register Report</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button variant="outline" size="sm" className="h-8 text-xs border-border hover:bg-muted active:scale-[0.98] transition-transform gap-1.5" onClick={handleExit}>
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
                                {/* Date Range Row */}
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
                                                value={empCardNo ? `${empCardNo} - ${empName}` : ""}
                                                readOnly
                                                className="h-10 pr-10 cursor-default bg-muted/20"
                                            />
                                            {empCardNo && (
                                                <button
                                                    onClick={() => { setEmpCardNo(""); setEmpName(""); }}
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
                                            onClick={() => setIsEmpModalOpen(true)}
                                        >
                                            <Search className="w-4 h-4 text-sidebar" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Organizational Filters */}
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
                                        onClick={handleExit}
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
                            <strong>Information:</strong> This report provides a detailed summary of leave entitlements, availed leaves, and current balances for the selected period.
                        </p>
                    </div>
                </motion.div>
            </div>

            <EmployeeSelectModal
                isOpen={isEmpModalOpen}
                onClose={() => setIsEmpModalOpen(false)}
                onSelect={handleEmpSelect}
            />
        </div>
    );
};

export default LeaveRegisterReportPage;
