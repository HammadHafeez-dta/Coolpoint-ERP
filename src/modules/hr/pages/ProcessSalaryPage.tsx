import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import {
    DollarSign, Search, Calendar as CalendarIcon, User, XCircle,
    LogOut, RefreshCw, Settings, Clock, Coins, Eye, Download,
    CheckCircle2, AlertCircle, ChevronRight, X, Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { useToast } from "@/shared/components/ui/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { salaryService, ProcessSalaryResult, SalarySlipDto } from "../services/salaryService";
import { EmployeeSelectModal } from "../components/EmployeeSelectModal";
import { Employee } from "../services/employeeService";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ────────────────────────────────────────────────────────────────────────────
// Salary Slip Modal with PDF Download
// ────────────────────────────────────────────────────────────────────────────
const SalarySlipModal = ({
    slip,
    onClose,
}: {
    slip: SalarySlipDto;
    onClose: () => void;
}) => {
    const slipRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContents = slipRef.current?.innerHTML;
        if (!printContents) return;
        const win = window.open("", "_blank");
        if (!win) return;
        win.document.write(`
            <html>
            <head>
                <title>Salary Slip - ${slip.empName}</title>
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #111; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
                    th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
                    th { background: hsl(239, 59%, 14%); color: #fff; font-weight: 600; }
                    h2 { text-align: center; font-size: 18px; margin-bottom: 4px; }
                    .subtitle { text-align: center; color: #555; font-size: 11px; margin-bottom: 14px; }
                    .row { display: flex; gap: 16px; }
                    .col { flex: 1; }
                    .total-row td { font-weight: 700; background: #f9fafb; }
                    .net-row td { font-weight: 800; font-size: 14px; background: hsl(239, 59%, 14%); color: #fff; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>${printContents}</body>
            </html>
        `);
        win.document.close();
        win.focus();
        win.print();
        win.close();
    };

    const fmt = (v?: number) => (v && v !== 0 ? v.toFixed(2) : "-");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-sidebar/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sidebar/10 rounded-xl">
                            <DollarSign className="w-5 h-5 text-sidebar" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Salary Slip</h3>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                {slip.empName} &bull; {slip.salaryMonth}/{slip.salaryYear}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="gap-2" onClick={handlePrint}>
                            <Download className="w-3.5 h-3.5" /> Print / PDF
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Slip content */}
                <div className="overflow-y-auto p-6">
                    <div ref={slipRef}>
                        <h2 style={{ textAlign: "center", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                            Monthly Salary Slip
                        </h2>
                        <p className="text-center text-xs text-muted-foreground mb-4">
                            For: {slip.salaryMonth}/{slip.salaryYear}
                        </p>

                        {/* Employee info */}
                        <table className="w-full text-xs border border-border mb-4">
                            <tbody>
                                <tr>
                                    <th className="bg-muted/50 p-2 w-1/4">Card No</th>
                                    <td className="p-2">{slip.empCardNo}</td>
                                    <th className="bg-muted/50 p-2 w-1/4">Name</th>
                                    <td className="p-2 font-semibold">{slip.empName}</td>
                                </tr>
                                <tr>
                                    <th className="bg-muted/50 p-2">Father Name</th>
                                    <td className="p-2">{slip.empFatherName || "-"}</td>
                                    <th className="bg-muted/50 p-2">Department</th>
                                    <td className="p-2">{slip.departmentName || "-"}</td>
                                </tr>
                                <tr>
                                    <th className="bg-muted/50 p-2">Designation</th>
                                    <td className="p-2">{slip.designationName || "-"}</td>
                                    <th className="bg-muted/50 p-2">Shift</th>
                                    <td className="p-2">{slip.shift || "-"}</td>
                                </tr>
                                <tr>
                                    <th className="bg-muted/50 p-2">Actual Salary</th>
                                    <td className="p-2 font-semibold">{fmt(slip.actualSalary)}</td>
                                    <th className="bg-muted/50 p-2">Working Days</th>
                                    <td className="p-2">{slip.workingDays ?? (slip as any).days ?? "-"}</td>
                                </tr>
                                <tr>
                                    <th className="bg-muted/50 p-2">Absent Days</th>
                                    <td className="p-2 text-red-600">{slip.absentDays ?? 0}</td>
                                    <th className="bg-muted/50 p-2">Leaves</th>
                                    <td className="p-2">{slip.leaves ?? 0}</td>
                                </tr>
                                <tr>
                                    <th className="bg-muted/50 p-2">Half Days</th>
                                    <td className="p-2">{slip.halfDay ?? 0}</td>
                                    <th className="bg-muted/50 p-2">SPH Days</th>
                                    <td className="p-2">{slip.sphDays ?? 0}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Earnings vs Deductions side by side */}
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            {/* Earnings */}
                            <div>
                                <h4 className="font-bold text-green-700 mb-1 uppercase text-[10px] tracking-wider">Earnings</h4>
                                <table className="w-full border border-border">
                                    <tbody>
                                        <tr><th className="bg-muted/50 p-1.5 text-left">Working Days</th><td className="p-1.5 text-right">{fmt(slip.workingDaysAmount)}</td></tr>
                                        {(slip.overTimeAmount ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">Overtime ({(slip.overTimeHours ?? 0).toFixed(1)}h)</th><td className="p-1.5 text-right">{fmt(slip.overTimeAmount)}</td></tr>}
                                        {(slip.sphDaysAmount ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">SPH</th><td className="p-1.5 text-right">{fmt(slip.sphDaysAmount)}</td></tr>}
                                        {(slip.badliAmount ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">Badli</th><td className="p-1.5 text-right">{fmt(slip.badliAmount)}</td></tr>}
                                        {(slip.a01 ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">Allowance 01</th><td className="p-1.5 text-right">{fmt(slip.a01)}</td></tr>}
                                        {(slip.a02 ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">Allowance 02</th><td className="p-1.5 text-right">{fmt(slip.a02)}</td></tr>}
                                        {(slip.a03 ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">Allowance 03</th><td className="p-1.5 text-right">{fmt(slip.a03)}</td></tr>}
                                        {(slip.a04 ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">Allowance 04</th><td className="p-1.5 text-right">{fmt(slip.a04)}</td></tr>}
                                        {(slip.a05 ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">Allowance 05</th><td className="p-1.5 text-right">{fmt(slip.a05)}</td></tr>}
                                        {(slip.a10 ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">Allowance 10</th><td className="p-1.5 text-right">{fmt(slip.a10)}</td></tr>}
                                        {(slip.a11 ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">Allowance 11</th><td className="p-1.5 text-right">{fmt(slip.a11)}</td></tr>}
                                        {(slip.a12 ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">Allowance 12</th><td className="p-1.5 text-right">{fmt(slip.a12)}</td></tr>}
                                        {(slip.bonusIncentive ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">Bonus</th><td className="p-1.5 text-right text-amber-600 font-semibold">{fmt(slip.bonusIncentive)}</td></tr>}
                                        <tr className="font-bold bg-green-50 dark:bg-green-950/30">
                                            <td className="p-1.5 text-green-700">Gross Pay</td>
                                            <td className="p-1.5 text-right text-green-700">{fmt(slip.grossPay)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            {/* Deductions */}
                            <div>
                                <h4 className="font-bold text-red-700 mb-1 uppercase text-[10px] tracking-wider">Deductions</h4>
                                <table className="w-full border border-border">
                                    <tbody>
                                        {(slip.absentDaysAmount ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">Absent ({slip.absentDays}d)</th><td className="p-1.5 text-right">{fmt(slip.absentDaysAmount)}</td></tr>}
                                        {(slip.halfDaysDeductedAmount ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">Half Day ({slip.halfDaysDeducted})</th><td className="p-1.5 text-right">{fmt(slip.halfDaysDeductedAmount)}</td></tr>}
                                        {(slip.d01 ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">D01</th><td className="p-1.5 text-right">{fmt(slip.d01)}</td></tr>}
                                        {(slip.d02 ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">D02</th><td className="p-1.5 text-right">{fmt(slip.d02)}</td></tr>}
                                        {(slip.d03 ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">D03</th><td className="p-1.5 text-right">{fmt(slip.d03)}</td></tr>}
                                        {(slip.d04 ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">D04</th><td className="p-1.5 text-right">{fmt(slip.d04)}</td></tr>}
                                        {(slip.d05 ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">D05</th><td className="p-1.5 text-right">{fmt(slip.d05)}</td></tr>}
                                        {(slip.d06 ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">D06</th><td className="p-1.5 text-right">{fmt(slip.d06)}</td></tr>}
                                        {(slip.d07 ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">D07</th><td className="p-1.5 text-right">{fmt(slip.d07)}</td></tr>}
                                        {(slip.d08 ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">D08</th><td className="p-1.5 text-right">{fmt(slip.d08)}</td></tr>}
                                        {(slip.d10 ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">D10</th><td className="p-1.5 text-right">{fmt(slip.d10)}</td></tr>}
                                        {(slip.d11 ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">D11</th><td className="p-1.5 text-right">{fmt(slip.d11)}</td></tr>}
                                        {(slip.d12 ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">D12</th><td className="p-1.5 text-right">{fmt(slip.d12)}</td></tr>}
                                        {(slip.d13 ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">D13</th><td className="p-1.5 text-right">{fmt(slip.d13)}</td></tr>}
                                        {(slip.d14 ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">D14</th><td className="p-1.5 text-right">{fmt(slip.d14)}</td></tr>}
                                        {(slip.d15 ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">D15</th><td className="p-1.5 text-right">{fmt(slip.d15)}</td></tr>}
                                        {(slip.d16 ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">D16</th><td className="p-1.5 text-right">{fmt(slip.d16)}</td></tr>}
                                        {(slip.totalLoan ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">Loan Deduction</th><td className="p-1.5 text-right">{fmt(slip.totalLoan)}</td></tr>}
                                        {(slip.totalVehicleLoan ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">Vehicle Loan</th><td className="p-1.5 text-right">{fmt(slip.totalVehicleLoan)}</td></tr>}
                                        {(slip.totalFabricLoan ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">Fabric Loan</th><td className="p-1.5 text-right">{fmt(slip.totalFabricLoan)}</td></tr>}
                                        {(slip.totalMobileLoan ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">Mobile Loan</th><td className="p-1.5 text-right">{fmt(slip.totalMobileLoan)}</td></tr>}
                                        {(slip.securityAmount ?? 0) > 0 && <tr><th className="bg-muted/50 p-1.5 text-left">Security</th><td className="p-1.5 text-right">{fmt(slip.securityAmount)}</td></tr>}
                                        <tr className="font-bold bg-red-50 dark:bg-red-950/30">
                                            <td className="p-1.5 text-red-700">Total Deductions</td>
                                            <td className="p-1.5 text-right text-red-700">{fmt(slip.totalDeductions)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Net Pay */}
                        <div className="mt-4 bg-sidebar text-white rounded-xl p-4 flex justify-between items-center">
                            <span className="text-sm font-bold uppercase tracking-widest">Net Pay</span>
                            <span className="text-2xl font-black">{Number(slip.netSalary ?? (slip as any).netPay ?? (slip as any).NetPay ?? 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// ────────────────────────────────────────────────────────────────────────────
// Salary Report Modal (Full List)
// ────────────────────────────────────────────────────────────────────────────
const SalaryReportModal = ({
    report,
    onClose,
}: {
    report: SalarySlipDto[];
    onClose: () => void;
}) => {
    const getGross = (r: any): number => Number(r?.grossPay ?? r?.GrossPay ?? 0);
    const getNet = (r: any): number => Number(r?.netSalary ?? r?.netPay ?? r?.NetPay ?? 0);
    const getBasic = (r: any): number => Number(r?.basicPay ?? r?.BasicPay ?? 0);
    const getWorkDays = (r: any): number => Number(r?.workingDays ?? r?.days ?? r?.Days ?? 0);
    const getOt = (r: any): number => Number(r?.overTimeAmount ?? r?.OverTimeAmount ?? 0);
    const getDed = (r: any): number => Number(r?.totalDeductions ?? r?.TotalDeductions ?? 0);

    const totalGross = report.reduce((acc, r) => acc + getGross(r), 0);
    const totalNet   = report.reduce((acc, r) => acc + getNet(r), 0);

    const exportToCSV = () => {
        const headers = ["CardNo", "Name", "Dept", "Basic", "OT", "Gross", "Deductions", "Net"];
        const rows = report.map(r => [
            r.empCardNo,
            r.empName || "",
            r.departmentName || "",
            getBasic(r).toFixed(2),
            getOt(r).toFixed(2),
            getGross(r).toFixed(2),
            getDed(r).toFixed(2),
            getNet(r).toFixed(2)
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Salary_Report_${new Date().getTime()}.csv`;
        link.click();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border rounded-2xl shadow-2xl w-[95vw] h-[90vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-sidebar/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sidebar/10 rounded-xl">
                            <Settings className="w-5 h-5 text-sidebar" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Full Salary Report</h3>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                {report.length} Employees found
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="gap-2" onClick={exportToCSV}>
                            <Download className="w-3.5 h-3.5" /> Export CSV
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-auto p-4">
                    <div className="border border-border rounded-xl bg-background shadow-inner overflow-hidden">
                        <table className="w-full text-[11px] border-collapse">
                            <thead className="sticky top-0 bg-muted/80 backdrop-blur z-10 font-bold uppercase tracking-wider border-b border-border">
                                <tr>
                                    <th className="p-2 text-left bg-muted/50 border-r border-border/50">Card#</th>
                                    <th className="p-2 text-left bg-muted/50 border-r border-border/50">Employee Name</th>
                                    <th className="p-2 text-left bg-muted/50 border-r border-border/50">Dept</th>
                                    <th className="p-2 text-right bg-muted/50 border-r border-border/50">Basic</th>
                                    <th className="p-2 text-right bg-muted/50 border-r border-border/50">Work Day</th>
                                    <th className="p-2 text-right bg-muted/50 border-r border-border/50">OT Amt</th>
                                    <th className="p-2 text-right bg-muted/50 border-r border-border/50">Gross Pay</th>
                                    <th className="p-2 text-right bg-muted/50 border-r border-border/50">Total Ded</th>
                                    <th className="p-2 text-right bg-sidebar/5">Net Salary</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {report.map((r, i) => (
                                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-2 border-r border-border/30 font-sans font-bold">{r.empCardNo}</td>
                                        <td className="p-2 border-r border-border/30 font-medium">{r.empName}</td>
                                        <td className="p-2 border-r border-border/30 text-muted-foreground">{r.departmentName || "-"}</td>
                                        <td className="p-2 border-r border-border/30 text-right">{getBasic(r).toLocaleString()}</td>
                                        <td className="p-2 border-r border-border/30 text-right">{getWorkDays(r).toFixed(1)}</td>
                                        <td className="p-2 border-r border-border/30 text-right">{getOt(r).toLocaleString()}</td>
                                        <td className="p-2 border-r border-border/30 text-right font-semibold text-green-600">{getGross(r).toLocaleString()}</td>
                                        <td className="p-2 border-r border-border/30 text-right font-semibold text-red-600">{getDed(r).toLocaleString()}</td>
                                        <td className="p-2 text-right bg-sidebar/5 font-black text-sidebar">{getNet(r).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Totals */}
                <div className="p-6 bg-sidebar/5 border-t border-border flex items-center justify-end gap-12">
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Gross</p>
                        <p className="text-xl font-black text-green-700">{totalGross.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Net</p>
                        <p className="text-xl font-black text-sidebar">{totalNet.toLocaleString()}</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// ────────────────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────────────────
const ProcessSalaryPage = () => {
    const { toast } = useToast();
    const navigate = useNavigate();

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth   = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [fromDate, setFromDate] = useState<string>(format(startOfMonth, "yyyy-MM-dd"));
    const [toDate,   setToDate]   = useState<string>(format(endOfMonth,   "yyyy-MM-dd"));
    const [cardWise, setCardWise] = useState<boolean>(false);
    const [employeeId,   setEmployeeId]   = useState<string>("");
    const [employeeName, setEmployeeName] = useState<string>("");
    const [includeTokens,   setIncludeTokens]   = useState<boolean>(false);
    const [includeOvertime, setIncludeOvertime] = useState<boolean>(true);

    const [statusLogs,   setStatusLogs]   = useState<string[]>(["Ready for Processing..."]);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isDeleting,   setIsDeleting]   = useState<boolean>(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [processResult, setProcessResult] = useState<ProcessSalaryResult | null>(null);

    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [viewSlip, setViewSlip] = useState<SalarySlipDto | null>(null);
    const [viewReport, setViewReport] = useState<SalarySlipDto[] | null>(null);
    const [isLoadingSlip, setIsLoadingSlip] = useState(false);
    const [isLoadingReport, setIsLoadingReport] = useState(false);

    const logBoxRef = useRef<HTMLDivElement>(null);

    // Auto-scroll log box
    useEffect(() => {
        if (logBoxRef.current)
            logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }, [statusLogs]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F1") {
                e.preventDefault();
                setIsEmployeeModalOpen(true);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [cardWise]);

    const handleEmployeeSelect = (emp: Employee) => {
        setEmployeeId(emp.empCardNo.toString());
        setEmployeeName(emp.empName || "");
    };

    const handleProcess = async (type: "All" | "CardWise") => {
        if (type === "CardWise" && !employeeId) {
            toast({ variant: "destructive", title: "Validation", description: "Please select an employee first." });
            return;
        }

        setIsProcessing(true);
        setProcessResult(null);
        setStatusLogs([`[${new Date().toLocaleTimeString()}] Starting ${type === "CardWise" ? `Employee ${employeeId}` : "All Employees"}...`]);

        try {
            const result = await salaryService.processSalary({
                fromDate,
                toDate,
                employeeId: type === "CardWise" ? parseInt(employeeId) : undefined,
                processType: type,
                includeTokenDeductions: includeTokens,
                includeOvertime,
            });

            setStatusLogs(result.logs);
            setProcessResult(result);

            toast({
                title: result.success ? "✅ Processing Complete" : "⚠️ Completed with Errors",
                description: `${result.processed} processed, ${result.failed} failed.`,
                variant: result.failed > 0 ? "destructive" : "default",
            });
        } catch (err: any) {
            setStatusLogs(prev => [...prev, `[ERROR] ${err?.message ?? "Unknown error"}`]);
            toast({ variant: "destructive", title: "Error", description: "Salary processing failed." });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!fromDate || !toDate) {
            toast({ variant: "destructive", title: "Validation", description: "Please specify both From Date and To Date." });
            return;
        }

        if (new Date(fromDate) > new Date(toDate)) {
            toast({ variant: "destructive", title: "Validation", description: "From Date cannot be after To Date." });
            return;
        }

        if (cardWise && !employeeId) {
            toast({ variant: "destructive", title: "Validation", description: "Please select an employee first for Card Wise deletion." });
            return;
        }

        setIsDeleting(true);
        setIsDeleteDialogOpen(false);
        const targetDesc = cardWise && employeeId ? `Employee Card #${employeeId}` : "All Employees";
        setStatusLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Deleting salary records for ${targetDesc} (${fromDate} to ${toDate})...`]);

        try {
            const result = await salaryService.deleteSalary({
                fromDate,
                toDate,
                employeeId: cardWise && employeeId ? parseInt(employeeId) : undefined,
                processType: cardWise ? "CardWise" : "All",
            });

            if (result.success) {
                setStatusLogs(prev => [
                    ...prev,
                    `[${new Date().toLocaleTimeString()}] ✅ ${result.message}`
                ]);
                toast({
                    title: "✅ Salary Records Deleted",
                    description: result.message,
                });
                // If viewing report, refresh it to show updated data
                if (viewReport) {
                    try {
                        const dateObj = new Date(fromDate);
                        const report = await salaryService.getSalaryReport(dateObj.getMonth() + 1, dateObj.getFullYear());
                        setViewReport(report || []);
                    } catch {
                        setViewReport(null);
                    }
                }
                if (viewSlip && cardWise && employeeId) {
                    setViewSlip(null);
                }
            } else {
                setStatusLogs(prev => [
                    ...prev,
                    `[${new Date().toLocaleTimeString()}] ❌ ${result.message}`
                ]);
                toast({
                    variant: "destructive",
                    title: "⚠️ Deletion Failed",
                    description: result.message,
                });
            }
        } catch (err: any) {
            const errMsg = err?.response?.data?.message || err?.message || "Failed to delete salary records.";
            setStatusLogs(prev => [...prev, `[ERROR] ${errMsg}`]);
            toast({ variant: "destructive", title: "Error", description: errMsg });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleViewSalary = async () => {
        if (!employeeId) {
            toast({ variant: "destructive", title: "Validation", description: "Please select an employee first." });
            return;
        }
        setIsLoadingSlip(true);
        try {
            const slip = await salaryService.getSalarySlip(parseInt(employeeId), fromDate);
            if (slip) setViewSlip(slip);
            else toast({ variant: "destructive", title: "Not Found", description: "No salary record found for this employee." });
        } catch {
            toast({ variant: "destructive", title: "Error", description: "Failed to load salary slip." });
        } finally {
            setIsLoadingSlip(false);
        }
    };

    const handleViewFullReport = async () => {
        setIsLoadingReport(true);
        try {
            const dateObj = new Date(fromDate);
            const report = await salaryService.getSalaryReport(dateObj.getMonth() + 1, dateObj.getFullYear());
            if (report && report.length > 0) setViewReport(report);
            else toast({ variant: "destructive", title: "Empty", description: "No salary records found for this period." });
        } catch {
            toast({ variant: "destructive", title: "Error", description: "Failed to load salary report." });
        } finally {
            setIsLoadingReport(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background text-sm overflow-hidden">
            {/* Header */}
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs shrink-0">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Process Salary</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <Button type="button" variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => navigate("/hr/dashboard")}>
                    <LogOut className="w-3.5 h-3.5" /> Exit
                </Button>
            </header>

            <div className="flex-1 overflow-auto p-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-5">

                    {/* Config Card */}
                    <Card className="border-border/50 shadow-xl shadow-sidebar/5">
                        <CardHeader className="bg-muted/50 border-b border-border/50 py-4">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Settings className="w-4 h-4 text-sidebar" /> Processing Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            {/* Card Wise toggle */}
                            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                                <Checkbox id="cardWise" checked={cardWise} onCheckedChange={(v) => setCardWise(v as boolean)} />
                                <Label htmlFor="cardWise" className="text-sm font-medium cursor-pointer">
                                    Card Wise (Process for Specific Employee)
                                </Label>
                            </div>

                            {/* Date range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <CalendarIcon className="w-3.5 h-3.5" /> From Date
                                    </Label>
                                    <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required className="font-medium" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <CalendarIcon className="w-3.5 h-3.5" /> To Date
                                    </Label>
                                    <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required className="font-medium" />
                                </div>
                            </div>

                            {/* Employee selector (Always visible for Viewing / Processing) */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" /> 
                                    {cardWise ? "Target Employee" : "Quick View Employee"} (F1 to Search)
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Enter Card No"
                                        value={employeeId}
                                        onChange={(e) => setEmployeeId(e.target.value)}
                                        className="font-sans font-bold"
                                    />
                                    <Button type="button" variant="outline" size="icon" onClick={() => setIsEmployeeModalOpen(true)}
                                        className="shrink-0 border-sidebar/20 bg-sidebar/5 hover:bg-sidebar/5">
                                        <Search className="w-4 h-4 text-sidebar" />
                                    </Button>
                                    {employeeId && (
                                        <Button type="button" variant="ghost" size="icon" className="shrink-0 text-destructive hover:bg-destructive/10"
                                            onClick={() => { setEmployeeId(""); setEmployeeName(""); }}>
                                            <XCircle className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                                {employeeName && (
                                    <p className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded inline-block">
                                        Selected: <span className="text-sidebar font-bold ml-1">{employeeName}</span>
                                    </p>
                                )}
                            </div>

                            {/* Optional toggles */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
                                    <Checkbox id="includeOT" checked={includeOvertime} onCheckedChange={(v) => setIncludeOvertime(v as boolean)} />
                                    <Label htmlFor="includeOT" className="text-xs font-medium cursor-pointer flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-sidebar" /> Include Overtime
                                    </Label>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
                                    <Checkbox id="includeTokens" checked={includeTokens} onCheckedChange={(v) => setIncludeTokens(v as boolean)} />
                                    <Label htmlFor="includeTokens" className="text-xs font-medium cursor-pointer flex items-center gap-1.5">
                                        <Coins className="w-3.5 h-3.5 text-amber-500" /> Include Token Deductions
                                    </Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Log Terminal */}
                    <Card className="border-border/50 shadow-lg">
                        <CardContent className="p-4">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                                Processing Log
                            </Label>
                            <div
                                ref={logBoxRef}
                                className="bg-slate-900 border border-slate-700/50 rounded-xl p-4 font-sans text-xs text-green-400 h-40 overflow-y-auto flex flex-col gap-0.5 shadow-inner relative"
                            >
                                {isProcessing && (
                                    <div className="absolute top-2 right-2 flex gap-1.5 items-center bg-green-500/20 px-2 py-1 rounded-md text-green-300 text-[10px] font-bold tracking-widest">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                        PROCESSING
                                    </div>
                                )}
                                {statusLogs.map((log, index) => {
                                    const isErr = log.includes("❌") || log.includes("Error");
                                    const isLatest = index === statusLogs.length - 1;
                                    return (
                                        <div key={index} className={`flex items-start gap-1.5 leading-snug transition-opacity
                                            ${isErr ? "text-red-400" : isLatest ? "text-green-300" : "text-green-500/60"}`}>
                                            <span className="text-slate-500 mt-0.5 shrink-0">›</span>
                                            <span>{log}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Result Summary */}
                    <AnimatePresence>
                        {processResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className={`rounded-xl border p-4 flex items-center justify-between ${
                                    processResult.success
                                        ? "bg-green-500/5 border-green-200/50"
                                        : "bg-red-500/5 border-red-200/50"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {processResult.success
                                        ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        : <AlertCircle   className="w-5 h-5 text-red-500" />}
                                    <div>
                                        <p className="text-sm font-semibold">
                                            {processResult.success ? "Processing Complete" : "Completed with Errors"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            ✅ {processResult.processed} processed &nbsp;|&nbsp; ❌ {processResult.failed} failed
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {employeeId && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-2 border-sidebar/20 text-sidebar hover:bg-sidebar/5"
                                            onClick={handleViewSalary}
                                            disabled={isLoadingSlip}
                                        >
                                            {isLoadingSlip
                                                ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                : <Eye className="w-3.5 h-3.5" />}
                                            View Slip
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-2 border-sidebar/20 text-sidebar hover:bg-sidebar/5"
                                        onClick={handleViewFullReport}
                                        disabled={isLoadingReport}
                                    >
                                        {isLoadingReport
                                            ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            : <Search className="w-3.5 h-3.5" />}
                                        View Full Report
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-2 flex-wrap">
                        <Button variant="outline" className="gap-2" onClick={() => navigate("/hr/dashboard")}>
                            <LogOut className="w-4 h-4" /> Exit
                        </Button>
                        <Button
                            variant="outline" 
                            className="gap-2 border-sidebar/20 text-sidebar hover:bg-sidebar/5"
                            disabled={isLoadingReport || isProcessing || isDeleting}
                            onClick={handleViewFullReport}
                        >
                            <Settings className={`w-4 h-4 ${isLoadingReport ? "animate-spin" : ""}`} />
                            Full Salary Report
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2 border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-400 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/50"
                            disabled={isProcessing || isDeleting}
                            onClick={() => {
                                if (new Date(fromDate) > new Date(toDate)) {
                                    toast({ variant: "destructive", title: "Validation", description: "From Date cannot be after To Date." });
                                    return;
                                }
                                if (cardWise && !employeeId) {
                                    toast({ variant: "destructive", title: "Validation", description: "Please select an employee first for Card Wise deletion." });
                                    return;
                                }
                                setIsDeleteDialogOpen(true);
                            }}
                        >
                            <Trash2 className={`w-4 h-4 ${isDeleting ? "animate-spin" : ""}`} />
                            {isDeleting ? "Deleting..." : "Delete Salary"}
                        </Button>
                        {cardWise ? (
                            <Button
                                className="px-8 bg-sidebar hover:bg-sidebar shadow-lg shadow-sidebar/20 gap-2 min-w-[160px]"
                                disabled={isProcessing || isDeleting}
                                onClick={() => handleProcess("CardWise")}
                            >
                                <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                                {isProcessing ? "Processing..." : "Process Employee"}
                            </Button>
                        ) : (
                            <Button
                                className="px-8 bg-sidebar hover:bg-sidebar shadow-lg shadow-sidebar/20 gap-2 min-w-[160px]"
                                disabled={isProcessing || isDeleting}
                                onClick={() => handleProcess("All")}
                            >
                                <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                                {isProcessing ? "Processing..." : "Process All Employees"}
                            </Button>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Modals */}
            <EmployeeSelectModal
                isOpen={isEmployeeModalOpen}
                onClose={() => setIsEmployeeModalOpen(false)}
                onSelect={handleEmployeeSelect}
            />
            <AnimatePresence>
                {viewSlip && <SalarySlipModal slip={viewSlip} onClose={() => setViewSlip(null)} />}
            </AnimatePresence>
            <AnimatePresence>
                {viewReport && <SalaryReportModal report={viewReport} onClose={() => setViewReport(null)} />}
            </AnimatePresence>

            {/* Delete Confirmation Alert Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2.5 rounded-full bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                                <Trash2 className="w-5 h-5" />
                            </div>
                            <AlertDialogTitle className="text-base font-bold text-foreground">
                                Delete Salary Records?
                            </AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="text-xs text-muted-foreground space-y-2">
                            <span>
                                Are you sure you want to delete salary records for the selected period?
                            </span>
                            <div className="bg-muted/50 p-3 rounded-lg border border-border text-xs text-foreground space-y-1 font-medium mt-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground font-normal">Date Range:</span>
                                    <span className="font-sans">{fromDate} → {toDate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground font-normal">Scope:</span>
                                    <span>
                                        {cardWise && employeeId
                                            ? `Card #${employeeId} (${employeeName || "Selected Employee"})`
                                            : "All Employees"}
                                    </span>
                                </div>
                            </div>
                            <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold pt-1">
                                ⚠️ This action cannot be undone. Only records within this date range will be deleted.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0 mt-3">
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                        >
                            {isDeleting ? "Deleting..." : "Yes, Delete Salary"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ProcessSalaryPage;
