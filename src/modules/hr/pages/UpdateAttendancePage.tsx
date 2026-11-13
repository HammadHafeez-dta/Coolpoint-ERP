import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { RefreshCw, LogOut, Calendar as CalendarIcon, User, Settings, Search } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { toast } from "sonner";
import { attendanceService } from "../services/attendanceService";
import { motion } from "framer-motion";
import { EmployeeSelectModal } from "../components/EmployeeSelectModal";

export default function UpdateAttendancePage() {
    const [loading, setLoading] = useState(false);
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const { register, handleSubmit, watch, setValue } = useForm({
        defaultValues: {
            fromDate: format(new Date(), "yyyy-MM-dd"),
            toDate: format(new Date(), "yyyy-MM-dd"),
            cardWise: false,
            empCardNo: ""
        }
    });

    const watchCardWise = watch("cardWise");

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F1" && watchCardWise) {
                e.preventDefault();
                setIsEmployeeModalOpen(true);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [watchCardWise]);

    const onUpdate = async (data: any) => {
        try {
            setLoading(true);
            await attendanceService.updateMachineAttendance(
                data.fromDate,
                data.toDate,
                data.empCardNo ? parseInt(data.empCardNo) : undefined,
                data.cardWise
            );
            toast.success("Attendance Processing Completed Successfully");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error processing attendance");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background text-sm overflow-hidden">
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs shrink-0">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <RefreshCw className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Update Attendance</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => window.history.back()}>
                        <LogOut className="w-3.5 h-3.5" /> Exit
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-6 space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto space-y-6"
                >
                    <Card className="border-border/50 shadow-xl shadow-sidebar/5 overflow-hidden">
                        <CardHeader className="bg-muted/50 border-b border-border/50">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Settings className="w-5 h-5 text-sidebar" />
                                Processing Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit(onUpdate)} className="space-y-6">

                                <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                                    <Checkbox
                                        id="cardWise"
                                        checked={watchCardWise}
                                        onCheckedChange={(checked) => setValue("cardWise", checked as boolean)}
                                    />
                                    <Label htmlFor="cardWise" className="text-sm font-medium cursor-pointer">Card Wise (Process for Specific Employee)</Label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <CalendarIcon className="w-3.5 h-3.5" /> From Date
                                        </Label>
                                        <Input type="date" {...register("fromDate")} className="font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <CalendarIcon className="w-3.5 h-3.5" /> To Date
                                        </Label>
                                        <Input type="date" {...register("toDate")} className="font-medium" />
                                    </div>
                                </div>

                                {watchCardWise && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="space-y-2"
                                    >
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5" /> Employee Card No (F1 to Search)
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Enter Card No"
                                                {...register("empCardNo", { required: watchCardWise })}
                                                className="font-sans font-bold"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-10 w-10 shrink-0 border-sidebar/20 bg-sidebar/5 hover:bg-sidebar/5"
                                                onClick={() => setIsEmployeeModalOpen(true)}
                                            >
                                                <Search className="w-4 h-4 text-sidebar" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                <div className="p-4 bg-sidebar/5 border border-sidebar/20 rounded-xl">
                                    <p className="text-xs text-sidebar/80 leading-relaxed">
                                        <strong>Note:</strong> This process will synchronize machine logs with the daily attendance register and update employee records for the selected period.
                                    </p>
                                </div>

                                {loading && (
                                    <div className="bg-yellow-500/10 border border-yellow-200/50 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                                        <div className="h-2 w-2 bg-yellow-500 rounded-full animate-ping" />
                                        <p className="text-xs font-medium text-yellow-800">Processing attendance records, please wait...</p>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="outline" className="gap-2" onClick={() => window.history.back()}>
                                        <LogOut className="w-4 h-4" /> Exit
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="px-8 bg-[#171858] hover:bg-[#121344] text-white shadow-xs active:scale-[0.98] transition-transform gap-2 min-w-[140px]"
                                        disabled={loading}
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                                        {loading ? "Processing..." : "Run Update"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <EmployeeSelectModal
                isOpen={isEmployeeModalOpen}
                onClose={() => setIsEmployeeModalOpen(false)}
                onSelect={(employee) => setValue("empCardNo", employee.empCardNo.toString())}
            />
        </div>
    );
}
