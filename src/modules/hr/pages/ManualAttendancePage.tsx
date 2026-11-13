import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Save, LogOut, Clock, Calendar as CalendarIcon, User, MessageSquare, Loader2, Edit, Trash2 } from "lucide-react";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import { toast } from "sonner";
import { attendanceService, AttendanceDto } from "../services/attendanceService";
import { employeeService, Employee } from "../services/employeeService";
import { authService } from "@/modules/auth/services/authService";
import { motion } from "framer-motion";
import { EmployeeSelectModal } from "../components/EmployeeSelectModal";
import { Search } from "lucide-react";

export default function ManualAttendancePage() {
    const [rowData, setRowData] = useState<AttendanceDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const userSite = authService.getSite();

    const { register, handleSubmit, setValue, watch, reset } = useForm<AttendanceDto>({
        defaultValues: {
            attendanceDate: format(new Date(), "yyyy-MM-dd"),
            action: "Manual",
            attendanceType: "Manual",
            inStatus: true,
            outStatus: true
        }
    });

    const watchDate = watch("attendanceDate");
    const watchEmpCardNo = watch("empCardNo");

    // Keyboard shortcut for employee search
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

    // Load daily attendance for grid
    useEffect(() => {
        if (watchDate) {
            loadGridData(watchDate);
        }
    }, [watchDate]);

    const loadGridData = async (date: string) => {
        try {
            setLoading(true);
            const data = await attendanceService.getDailyAttendance(date);
            setRowData(data);
        } catch (error) {
            toast.error("Failed to load attendance log");
        } finally {
            setLoading(false);
        }
    };

    // Check existing attendance when employee selected
    useEffect(() => {
        const checkAttendance = async () => {
            if (watchDate && watchEmpCardNo) {
                try {
                    const data = await attendanceService.checkManualAttendance(watchDate, watchEmpCardNo);
                    if (data) {
                        // Populate form if needed, or just notify
                        if (data.timeIn) setValue("timeIn", format(new Date(data.timeIn), "yyyy-MM-dd'T'HH:mm"));
                        if (data.timeOut) setValue("timeOut", format(new Date(data.timeOut), "yyyy-MM-dd'T'HH:mm"));
                        setValue("remarks", data.remarks);
                    } else {
                        setValue("timeIn", undefined);
                        setValue("timeOut", undefined);
                        setValue("remarks", "");
                    }
                } catch (error) {
                    // ignore if not found
                }
            }
        };
        checkAttendance();
    }, [watchDate, watchEmpCardNo, setValue]);

    const onSave = async (data: AttendanceDto) => {
        try {
            setSaving(true);
            if (!data.timeIn && !data.timeOut) {
                toast.error("Please select Time In or Time Out");
                return;
            }

            const sanitizedData = {
                ...data,
                timeIn: data.timeIn || null,
                timeOut: data.timeOut || null,
                site: userSite,
                empCardNo: Number(data.empCardNo),
                attendanceDate: data.attendanceDate
            };

            // If Time In is provided, save IN
            if (data.timeIn) {
                await attendanceService.updateManualIn(sanitizedData);
            }

            // If Time Out is provided, save OUT
            if (data.timeOut) {
                await attendanceService.updateManualOut(sanitizedData);
            }

            toast.success("Attendance Saved Successfully");
            loadGridData(watchDate);
            reset({
                ...data,
                empCardNo: undefined,
                timeIn: undefined,
                timeOut: undefined,
                remarks: ""
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error saving attendance");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (row: AttendanceDto) => {
        setValue("empCardNo", row.empCardNo);
        if (row.attendanceDate) setValue("attendanceDate", format(new Date(row.attendanceDate), "yyyy-MM-dd"));
        if (row.timeIn) setValue("timeIn", format(new Date(row.timeIn), "yyyy-MM-dd'T'HH:mm"));
        if (row.timeOut) setValue("timeOut", format(new Date(row.timeOut), "yyyy-MM-dd'T'HH:mm"));
        setValue("remarks", row.remarks || "");
        setValue("attendanceType", row.attendanceType);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (row: AttendanceDto) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        try {
            setLoading(true);
            await attendanceService.deleteManualAttendance(
                format(new Date(row.attendanceDate), "yyyy-MM-dd"),
                row.empCardNo,
                userSite || ""
            );
            toast.success("Record deleted successfully");
            loadGridData(watchDate);
        } catch (error) {
            toast.error("Failed to delete record");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background text-sm overflow-hidden">
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Manual Attendance</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="h-9 gap-2" onClick={() => window.history.back()}>
                        <LogOut className="w-4 h-4" /> Exit
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-6 space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-5xl mx-auto space-y-6"
                >
                    <Card className="border-border/50 shadow-xl shadow-primary/5 overflow-hidden">
                        <CardHeader className="bg-muted/50 border-b border-border/50">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-primary" />
                                Attendance Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit(onSave)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5" /> Employee
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Card No"
                                                {...register("empCardNo", { valueAsNumber: true })}
                                                className="font-sans font-bold"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-10 w-10 shrink-0 border-primary/20 bg-primary/5 hover:bg-primary/10"
                                                onClick={() => setIsEmployeeModalOpen(true)}
                                                title="Search Employee (F1)"
                                            >
                                                <Search className="w-4 h-4 text-primary" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <CalendarIcon className="w-3.5 h-3.5" /> Attendance Date
                                        </Label>
                                        <Input type="date" {...register("attendanceDate")} className="font-medium" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <MessageSquare className="w-3.5 h-3.5" /> Remarks
                                        </Label>
                                        <Input placeholder="Enter any notes..." {...register("remarks")} />
                                    </div>

                                    <div className="space-y-2 lg:col-span-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-xl border border-border/50">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-sidebar uppercase tracking-wider">Time In</Label>
                                                <Input type="datetime-local" {...register("timeIn")} className="bg-background border-sidebar/20 focus:ring-sidebar/20" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-orange-600 uppercase tracking-wider">Time Out</Label>
                                                <Input type="datetime-local" {...register("timeOut")} className="bg-background border-orange-200 focus:ring-orange-500/20" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="submit" disabled={saving} className="px-8 bg-[#171858] hover:bg-[#121344] text-white shadow-xs active:scale-[0.98] transition-transform gap-2">
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        {saving ? "Saving..." : "Save Record"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
                        <div className="p-4 bg-muted/50 border-b border-border flex items-center justify-between">
                            <h3 className="font-bold text-sm">Today's Attendance Log</h3>
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">{rowData.length} Records</span>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-secondary/30">
                                    <TableRow>
                                        <TableHead className="w-24 py-3 px-6 font-bold text-[10px] uppercase">Card No</TableHead>
                                        <TableHead className="py-3 font-bold text-[10px] uppercase">Attendance Date</TableHead>
                                        <TableHead className="py-3 font-bold text-[10px] uppercase">Time In</TableHead>
                                        <TableHead className="py-3 font-bold text-[10px] uppercase">Out Time</TableHead>
                                        <TableHead className="py-3 font-bold text-[10px] uppercase font-bold">Type</TableHead>
                                        <TableHead className="py-3 px-6 font-bold text-[10px] uppercase">Remarks</TableHead>
                                        <TableHead className="py-3 px-6 font-bold text-[10px] uppercase text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                                Loading daily log...
                                            </TableCell>
                                        </TableRow>
                                    ) : rowData.length > 0 ? (
                                        rowData.map((row, idx) => (
                                            <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="py-4 px-6 font-sans font-bold text-xs">{row.empCardNo}</TableCell>
                                                <TableCell className="py-4 text-xs">{row.attendanceDate ? format(new Date(row.attendanceDate), "dd MMM yyyy") : 'N/A'}</TableCell>
                                                <TableCell className="py-4 text-xs font-medium text-sidebar">
                                                    {row.timeIn ? format(new Date(row.timeIn), "hh:mm a") : 'N/A'}
                                                </TableCell>
                                                <TableCell className="py-4 text-xs font-medium text-orange-600">
                                                    {row.timeOut ? format(new Date(row.timeOut), "hh:mm a") : 'N/A'}
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-bold uppercase border border-border">
                                                        {row.attendanceType}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-xs text-muted-foreground italic">
                                                    {row.remarks || '-'}
                                                </TableCell>
                                                <TableCell className="py-4 px-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-sidebar hover:text-sidebar hover:bg-sidebar/5"
                                                            onClick={() => handleEdit(row)}
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleDelete(row)}
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-sm italic">
                                                No attendance records for this date.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </motion.div>
            </div>

            <EmployeeSelectModal
                isOpen={isEmployeeModalOpen}
                onClose={() => setIsEmployeeModalOpen(false)}
                onSelect={(employee) => {
                    setValue("empCardNo", employee.empCardNo);
                    setValue("unit", employee.unit || "");
                    setValue("section", employee.section || "");
                    setValue("shift", employee.shift || "");
                    setValue("departmentCode", employee.departmentCode || "");
                    setValue("designationCode", employee.designationCode);
                    setValue("atype", "P");
                    setValue("attendanceType", "Manual");
                    setValue("action", "Manual");
                }}
            />
        </div>
    );
}
