import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Calendar,
    Eye,
    Loader2,
    FileText,
    LogOut,
    Tag,
    ListFilter
} from "lucide-react";
import { format } from "date-fns";

import { authService } from "@/modules/auth/services/authService";
import { attendanceService } from "../services/attendanceService";
import { departmentService } from "../services/departmentService";
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

type ReportType = "short-late" | "leave-absent" | "summary-options";

export const AttendanceSummaryReportsPage = () => {
    const { toast } = useToast();
    const [searchParams] = useSearchParams();
    const userSite = authService.getSite() || "";

    // Determine initial report type from URL, defaulting to 'short-late'
    const initialType = (searchParams.get("type") as ReportType) || "short-late";
    const [activeTab, setActiveTab] = useState<ReportType>(initialType);

    // Form State (Default fromDate to 1st day of current month)
    const [fromDate, setFromDate] = useState(format(new Date(), 'yyyy-MM-01'));
    const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [displayType, setDisplayType] = useState<string>("Without Days");

    const [isGenerating, setIsGenerating] = useState(false);

    // Sync activeTab when search query params change
    useEffect(() => {
        const typeParam = searchParams.get("type") as ReportType;
        if (typeParam && (typeParam === "short-late" || typeParam === "leave-absent" || typeParam === "summary-options")) {
            setActiveTab(typeParam);
        }
    }, [searchParams]);

    // Queries for salary categories (mapped to departments)
    const { data: categories = [] } = useQuery({
        queryKey: ['departments', userSite],
        queryFn: () => departmentService.getAll(userSite),
        staleTime: 5 * 60 * 1000,
    });

    const handleViewReport = async () => {
        try {
            setIsGenerating(true);
            const categoryParam = selectedCategory === "all" ? undefined : selectedCategory;

            if (activeTab === "short-late") {
                await attendanceService.viewShortLeaveLateDetailReport({
                    site: userSite,
                    fromDate,
                    toDate,
                    category: categoryParam
                });
            } else if (activeTab === "leave-absent") {
                await attendanceService.viewLeaveAbsentDetailReport({
                    site: userSite,
                    fromDate,
                    toDate,
                    category: categoryParam
                });
            } else if (activeTab === "summary-options") {
                await attendanceService.viewAttendanceSummaryOptionsReport({
                    site: userSite,
                    fromDate,
                    toDate,
                    category: categoryParam,
                    displayType
                });
            }
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
                        <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">
                            {activeTab === "short-late" && "Attendance Short Leave / Late Detail"}
                            {activeTab === "leave-absent" && "Attendance Leave and Absent Detail"}
                            {activeTab === "summary-options" && "Attendance Summary Reports"}
                        </h2>
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
                    {/* Tab Navigation */}
                    <div className="flex bg-muted p-1 rounded-xl border border-border/55">
                        <button
                            onClick={() => setActiveTab("short-late")}
                            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === "short-late" ? "bg-card shadow-sm text-sidebar" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            Short Leave & Late
                        </button>
                        <button
                            onClick={() => setActiveTab("leave-absent")}
                            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === "leave-absent" ? "bg-card shadow-sm text-sidebar" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            Leave & Absent
                        </button>
                        <button
                            onClick={() => setActiveTab("summary-options")}
                            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === "summary-options" ? "bg-card shadow-sm text-sidebar" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            Summary Options
                        </button>
                    </div>

                    <Card className="border-border/50 shadow-xl">
                        <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
                            <CardTitle className="text-base font-semibold flex items-center gap-2 text-sidebar">
                                <ListFilter className="w-4 h-4" />
                                Filters & Options
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            {/* Date Fields */}
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

                            {/* Salary Category Selection */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-tight">
                                    <Tag className="w-3.5 h-3.5" /> Salary Category
                                </Label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories
                                            .filter((c) => c.name && c.name.trim() !== "")
                                            .map((c) => (
                                                <SelectItem key={c.code} value={c.name}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Options for Summary Option Report */}
                            {activeTab === "summary-options" && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-tight">
                                        <ListFilter className="w-3.5 h-3.5" /> Display Columns / View Mode
                                    </Label>
                                    <Select value={displayType} onValueChange={setDisplayType}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Without Days" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Without Days">Without Days / All Totals</SelectItem>
                                            <SelectItem value="Present Days">Present Days</SelectItem>
                                            <SelectItem value="Absent Days">Absent Days</SelectItem>
                                            <SelectItem value="Late Days">Late Days</SelectItem>
                                            <SelectItem value="Overtime Days">Overtime Days</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                                <Button
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                    className="h-11 px-8 font-semibold"
                                >
                                    Exit
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
                </motion.div>
            </div>
        </div>
    );
};

export default AttendanceSummaryReportsPage;
