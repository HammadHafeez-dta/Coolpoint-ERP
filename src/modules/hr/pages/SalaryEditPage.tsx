import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Loader2, Save, Search, Trash2, UserRound } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useToast } from "@/shared/components/ui/use-toast";
import { authService } from "@/modules/auth/services/authService";
import { EmployeeSelectModal } from "../components/EmployeeSelectModal";
import { Employee } from "../services/employeeService";
import { AttendanceRegisterRow, attendanceService } from "../services/attendanceService";
import {
    ManualMonthlySalaryDto,
    MonthlySalaryEditDto,
    salaryService,
} from "../services/salaryService";

type SalaryForm = {
    salary: number;
    days: number;
    hours: number;
    overtimeHours: number;
    totalLate: number;
    ldlcDays: number;
    a03: number;
    a04: number;
    a05: number;
    a06: number;
    a07: number;
    a08: number;
    d01: number;
    d02: number;
    d03: number;
    d04: number;
    d05: number;
    d06: number;
    d07: number;
    d08: number;
};

type AttendanceDay = {
    date: string;
    status: string;
};

const zeroForm = (days: number, salary = 0): SalaryForm => ({
    salary,
    days,
    hours: 0,
    overtimeHours: 0,
    totalLate: 0,
    ldlcDays: 0,
    a03: 0,
    a04: 0,
    a05: 0,
    a06: 0,
    a07: 0,
    a08: 0,
    d01: 0,
    d02: 0,
    d03: 0,
    d04: 0,
    d05: 0,
    d06: 0,
    d07: 0,
    d08: 0,
});

const roundLegacy = (value: number): number => {
    const floor = Math.floor(value);
    const fraction = value - floor;
    if (Math.abs(fraction - 0.5) < 1e-8) return floor % 2 === 0 ? floor : floor + 1;
    return Math.round(value);
};

const monthDates = (month: string) => {
    const [year, monthNumber] = month.split("-").map(Number);
    const count = new Date(year, monthNumber, 0).getDate();
    return {
        count,
        from: `${month}-01`,
        to: `${month}-${String(count).padStart(2, "0")}`,
    };
};

const toAmount = (value: number | null | undefined) => Number(value ?? 0);

function NumberField({
    label,
    value,
    onChange,
    disabled = false,
}: {
    label: string;
    value: number;
    onChange?: (value: number) => void;
    disabled?: boolean;
}) {
    return (
        <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            <Input
                type="number"
                min="0"
                step="any"
                value={Number.isFinite(value) ? value : 0}
                readOnly={disabled}
                onChange={onChange ? (event) => onChange(Number(event.target.value) || 0) : undefined}
                className={disabled ? "bg-muted/50 font-medium" : ""}
            />
        </div>
    );
}

export default function SalaryEditPage() {
    const { toast } = useToast();
    const site = authService.getSite() || "SAFT";
    const userId = authService.getCurrentUser()?.username || "1";
    const today = new Date();
    const initialMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const [month, setMonth] = useState(initialMonth);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [employeePickerOpen, setEmployeePickerOpen] = useState(false);
    const [form, setForm] = useState<SalaryForm>(() => zeroForm(monthDates(initialMonth).count));
    const [savedSalary, setSavedSalary] = useState<MonthlySalaryEditDto | null>(null);
    const [attendance, setAttendance] = useState<AttendanceDay[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savingAttendance, setSavingAttendance] = useState(false);

    const dates = useMemo(() => monthDates(month), [month]);
    const values = useMemo(() => {
        const hourAmount = dates.count > 0
            ? roundLegacy((form.salary / dates.count / 8) * form.hours)
            : 0;
        const daysAmount = dates.count > 0
            ? roundLegacy((form.salary / dates.count) * form.days + hourAmount)
            : 0;
        const basicPay = roundLegacy((daysAmount - form.a03) / 1.55);
        const a01 = roundLegacy(basicPay * 0.45);
        const a02 = daysAmount - basicPay - a01 - form.a03;
        const overtimeAmount = employee?.unit?.trim() === "SGuard"
            ? (dates.count > 0 ? roundLegacy((form.salary / dates.count / 12) * form.overtimeHours) : 0)
            : roundLegacy(form.overtimeHours * 50);
        const lateDeduction = dates.count > 0
            ? roundLegacy((form.salary / dates.count / 8) * form.totalLate)
            : 0;
        const ldlcAmount = dates.count > 0
            ? roundLegacy((form.salary / dates.count) * form.ldlcDays)
            : 0;
        const grossPay = daysAmount + overtimeAmount + form.a04 + form.a05 + form.a06 + form.a07 + form.a08;
        const totalDeductions = lateDeduction + ldlcAmount
            + form.d01 + form.d02 + form.d03 + form.d04 + form.d05 + form.d06 + form.d07 + form.d08;

        return {
            hourAmount,
            daysAmount,
            basicPay,
            a01,
            a02,
            overtimeAmount,
            lateDeduction,
            ldlcAmount,
            grossPay,
            totalDeductions,
            netPay: grossPay - totalDeductions,
        };
    }, [dates.count, employee?.unit, form]);

    useEffect(() => {
        if (!employee) {
            const count = monthDates(month).count;
            setForm(zeroForm(count));
            setSavedSalary(null);
            setAttendance([]);
            return;
        }

        let active = true;
        const load = async () => {
            setLoading(true);
            const range = monthDates(month);
            try {
                const [salary, register] = await Promise.all([
                    salaryService.getMonthlySalaryForEdit(employee.empCardNo, range.from, site),
                    attendanceService.getEmployeeAttendanceRegister(range.from, range.to, employee.empCardNo, site),
                ]);
                if (!active) return;
                setSavedSalary(salary);
                setForm(salary ? {
                    salary: toAmount(salary.salary),
                    days: toAmount(salary.days),
                    hours: toAmount(salary.otherDays),
                    overtimeHours: toAmount(salary.overTimeDays),
                    totalLate: toAmount(salary.totalLate),
                    ldlcDays: toAmount(salary.d12),
                    a03: toAmount(salary.a03),
                    a04: toAmount(salary.a04),
                    a05: toAmount(salary.a05),
                    a06: toAmount(salary.a06),
                    a07: toAmount(salary.a07),
                    a08: toAmount(salary.a08),
                    d01: toAmount(salary.d01),
                    d02: toAmount(salary.d02),
                    d03: toAmount(salary.d03),
                    d04: toAmount(salary.d04),
                    d05: toAmount(salary.d05),
                    d06: toAmount(salary.d06),
                    d07: toAmount(salary.d07),
                    d08: toAmount(salary.d08),
                } : zeroForm(range.count, toAmount(employee.salary?.grossPay)));

                const existing = new Map(
                    (register || []).map((row: AttendanceRegisterRow) => [
                        row.attendanceDate.slice(0, 10),
                        row.attnedanceType || "",
                    ])
                );
                setAttendance(Array.from({ length: range.count }, (_, index) => {
                    const date = `${month}-${String(index + 1).padStart(2, "0")}`;
                    return { date, status: existing.get(date) || "" };
                }));
            } catch (error) {
                if (active) {
                    toast({
                        title: "Unable to load salary",
                        description: error instanceof Error ? error.message : "The employee's salary or attendance could not be loaded.",
                        variant: "destructive",
                    });
                }
            } finally {
                if (active) setLoading(false);
            }
        };
        void load();
        return () => { active = false; };
    }, [employee, month, site, toast]);

    const updateForm = (field: keyof SalaryForm, value: number) => {
        setForm((current) => ({ ...current, [field]: Math.max(0, value) }));
    };

    const updateAttendance = (index: number, status: string) => {
        setAttendance((current) => current.map((day, dayIndex) =>
            dayIndex === index ? { ...day, status: status.toUpperCase().slice(0, 4) } : day
        ));
    };

    const saveAttendance = async () => {
        if (!employee) return;
        setSavingAttendance(true);
        try {
            const payableDays = attendance.filter(({ status }) =>
                status !== "" && status !== "A" && status !== "WOP" && status !== "SSL"
            ).length;
            await Promise.all(attendance.map(({ date, status }) =>
                attendanceService.updateAttendanceRegister(
                    employee.empCardNo,
                    date,
                    status,
                    status !== "" && status !== "A" && status !== "WOP" && status !== "SSL" ? 1 : 0,
                    site,
                )
            ));
            setForm((current) => ({ ...current, days: payableDays }));
            toast({ title: "Attendance saved", description: `Attendance saved. Payable days: ${payableDays}.` });
        } catch (error) {
            toast({
                title: "Attendance not saved",
                description: error instanceof Error ? error.message : "An error occurred while saving attendance.",
                variant: "destructive",
            });
        } finally {
            setSavingAttendance(false);
        }
    };

    const saveSalary = async () => {
        if (!employee) return;
        setSaving(true);
        const dto: ManualMonthlySalaryDto = {
            empCardNo: employee.empCardNo,
            salaryMonth: Number(month.slice(5, 7)),
            salaryYear: Number(month.slice(0, 4)),
            salaryDate: dates.to,
            salary: form.salary,
            totalDays: form.days,
            daysAmount: values.daysAmount,
            otherDays: form.hours,
            otherAmount: values.hourAmount,
            overTimeDays: form.overtimeHours,
            overTimeAmount: values.overtimeAmount,
            ldlcDays: form.ldlcDays,
            ldlcAmount: values.ldlcAmount,
            totalLate: form.totalLate,
            lateDeduction: values.lateDeduction,
            longTermLoanBalance: toAmount(savedSalary?.longTermLoanBalance),
            providentFundLoanBalance: toAmount(savedSalary?.providentFundLoanBalance),
            basicPay: values.basicPay,
            a01: values.a01,
            a02: values.a02,
            a03: form.a03,
            a04: form.a04,
            a05: form.a05,
            a06: form.a06,
            a07: form.a07,
            a08: form.a08,
            a09: toAmount(savedSalary?.a09),
            a10: toAmount(savedSalary?.a10),
            a11: toAmount(savedSalary?.a11),
            a12: toAmount(savedSalary?.a12),
            a13: toAmount(savedSalary?.a13),
            grossPay: values.grossPay,
            d01: form.d01,
            d02: form.d02,
            d03: form.d03,
            d04: form.d04,
            d05: form.d05,
            d06: form.d06,
            d07: form.d07,
            d08: form.d08,
            d09: toAmount(savedSalary?.d09),
            d10: toAmount(savedSalary?.d10),
            d11: toAmount(savedSalary?.d11),
            pfSchoolShare: toAmount(savedSalary?.pfSchoolShare),
            eobiSchoolShare: toAmount(savedSalary?.eobiSchoolShare),
            leaveDeductions: toAmount(savedSalary?.leaveDeducted),
            leaveDeductionsAmount: toAmount(savedSalary?.leaveDeductionAmount),
            netSalary: values.netPay,
            totalProvidentFund: toAmount(savedSalary?.totalProvidentFund),
            totalDeductions: values.totalDeductions,
            scale: savedSalary?.scale,
        };
        try {
            await salaryService.saveMonthlySalaryManual(dto, site, userId);
            toast({ title: "Salary updated", description: "Monthly salary saved successfully." });
        } catch (error) {
            toast({
                title: "Salary not saved",
                description: error instanceof Error ? error.message : "An error occurred while saving monthly salary.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const deleteSalary = async () => {
        if (!employee || !window.confirm(`Delete salary for employee ${employee.empCardNo} for ${month}?`)) return;
        setSaving(true);
        try {
            await salaryService.deleteMonthlySalarySingle(
                employee.empCardNo,
                Number(month.slice(5, 7)),
                Number(month.slice(0, 4)),
                site,
            );
            setSavedSalary(null);
            setForm(zeroForm(dates.count, toAmount(employee.salary?.grossPay)));
            toast({ title: "Salary deleted", description: "The employee's monthly salary entry was deleted." });
        } catch (error) {
            toast({
                title: "Salary not deleted",
                description: error instanceof Error ? error.message : "An error occurred while deleting the monthly salary.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-5 p-4 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Edit Monthly Salary</h1>
                    <p className="text-sm text-muted-foreground">Update the selected employee's legacy monthly salary and attendance register.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={saveSalary} disabled={!employee || saving || loading}>
                        {saving ? <Loader2 className="animate-spin" /> : <Save />}
                        Update Salary
                    </Button>
                    <Button variant="destructive" onClick={deleteSalary} disabled={!employee || saving || loading}>
                        <Trash2 />
                        Delete
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_220px] md:items-end">
                    <div className="space-y-1">
                        <Label>Employee</Label>
                        <Button variant="outline" className="w-full justify-start" onClick={() => setEmployeePickerOpen(true)}>
                            <UserRound />
                            {employee ? `${employee.empCardNo} - ${employee.empName}` : "Select employee"}
                            <Search className="ml-auto" />
                        </Button>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="salary-month">Salary month</Label>
                        <div className="relative">
                            <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input id="salary-month" className="pl-9" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {!employee ? (
                <Card><CardContent className="py-16 text-center text-muted-foreground">Select an employee to load the monthly salary record.</CardContent></Card>
            ) : loading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
            ) : (
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.7fr)]">
                    <Card>
                        <CardHeader><CardTitle>Salary details</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <NumberField label="Monthly salary" value={form.salary} onChange={(value) => updateForm("salary", value)} />
                                <NumberField label="Payable days" value={form.days} onChange={(value) => updateForm("days", Math.min(value, dates.count))} />
                                <NumberField label="Hours" value={form.hours} onChange={(value) => updateForm("hours", value)} />
                                <NumberField label="Days amount" value={values.daysAmount} disabled />
                                <NumberField label="Hours amount" value={values.hourAmount} disabled />
                                <NumberField label="Overtime hours" value={form.overtimeHours} onChange={(value) => updateForm("overtimeHours", value)} />
                                <NumberField label="Overtime amount" value={values.overtimeAmount} disabled />
                                <NumberField label="Late hours" value={form.totalLate} onChange={(value) => updateForm("totalLate", value)} />
                                <NumberField label="Late deduction" value={values.lateDeduction} disabled />
                                <NumberField label="LDLC days" value={form.ldlcDays} onChange={(value) => updateForm("ldlcDays", value)} />
                                <NumberField label="LDLC amount" value={values.ldlcAmount} disabled />
                                <NumberField label="Basic pay" value={values.basicPay} disabled />
                                <NumberField label="A01" value={values.a01} disabled />
                                <NumberField label="A02" value={values.a02} disabled />
                                <NumberField label="A03" value={form.a03} onChange={(value) => updateForm("a03", value)} />
                                {(["a04", "a05", "a06", "a07", "a08"] as const).map((field) => (
                                    <NumberField key={field} label={field.toUpperCase()} value={form[field]} onChange={(value) => updateForm(field, value)} />
                                ))}
                            </div>

                            <div>
                                <h3 className="mb-3 text-sm font-semibold">Deductions</h3>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    {(["d01", "d02", "d03", "d04", "d05", "d06", "d07", "d08"] as const).map((field) => (
                                        <NumberField key={field} label={field.toUpperCase()} value={form[field]} onChange={(value) => updateForm(field, value)} />
                                    ))}
                                </div>
                            </div>
                            <div className="grid gap-3 rounded-lg bg-muted/40 p-4 sm:grid-cols-3">
                                <NumberField label="Gross salary" value={values.grossPay} disabled />
                                <NumberField label="Total deductions" value={values.totalDeductions} disabled />
                                <NumberField label="Net salary" value={values.netPay} disabled />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-2">
                            <CardTitle>Attendance register</CardTitle>
                            <Button size="sm" onClick={saveAttendance} disabled={savingAttendance}>
                                {savingAttendance ? <Loader2 className="animate-spin" /> : <Save />}
                                Save days
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-3 text-xs text-muted-foreground">Enter the legacy attendance code for each date. Blank, A, WOP and SSL do not count as payable days.</p>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {attendance.map((day, index) => (
                                    <div key={day.date} className="flex items-center gap-2 rounded border p-2">
                                        <Label className="min-w-16 text-xs">{day.date.slice(-2)} {new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" })}</Label>
                                        <Input
                                            aria-label={`Attendance status for ${day.date}`}
                                            value={day.status}
                                            maxLength={4}
                                            onChange={(event) => updateAttendance(index, event.target.value)}
                                            className="h-8 uppercase"
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <EmployeeSelectModal
                isOpen={employeePickerOpen}
                onClose={() => setEmployeePickerOpen(false)}
                onSelect={setEmployee}
            />
        </div>
    );
}
