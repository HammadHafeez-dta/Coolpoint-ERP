import { useState, useEffect } from "react";
import { format, differenceInYears, differenceInMonths, differenceInDays } from "date-fns";
import { Search, Save, Loader2, Calculator, User, Hash, Calendar as CalendarIcon, Banknote, Printer } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { useToast } from "@/shared/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/modules/auth/services/authService";
import { finalSettlementService, FinalSettlementDto } from "../services/finalSettlementService";
import { employeeService } from "../services/employeeService";
import { EmployeeSelectModal } from "./EmployeeSelectModal";

interface FinalSettlementFormProps {
    isOpen: boolean;
    onClose: () => void;
    settlement?: FinalSettlementDto | null;
}

const roundLegacy = (value: number) => {
    const lower = Math.floor(value);
    const fraction = value - lower;
    if (Math.abs(fraction - 0.5) < 1e-8) return lower % 2 === 0 ? lower : lower + 1;
    return Math.round(value);
};

export default function FinalSettlementForm({ isOpen, onClose, settlement }: FinalSettlementFormProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const userSite = authService.getSite() || "";

    const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);

    // Top Transaction Metadata
    const [transactionNo, setTransactionNo] = useState<number>(0);
    const [transactionDate, setTransactionDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [cardNo, setCardNo] = useState("");

    // Employee Profile Info
    const [empName, setEmpName] = useState("");
    const [fatherName, setFatherName] = useState("");
    const [designation, setDesignation] = useState("");
    const [department, setDepartment] = useState("");
    const [serviceDays, setServiceDays] = useState("");
    const [joiningDate, setJoiningDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [cnic, setCnic] = useState("");
    const [grossPay, setGrossPay] = useState<number>(0);
    const [basicPay, setBasicPay] = useState<number>(0);

    // Leaving & Settlement Details (Left Column)
    const [leavingType, setLeavingType] = useState("Resignation");
    const [salaryMonth, setSalaryMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [salaryDays, setSalaryDays] = useState<number>(0);
    const [otherPayable, setOtherPayable] = useState<number>(0);
    const [providentFund, setProvidentFund] = useState<number>(0);
    const [loanAdvance, setLoanAdvance] = useState<number>(0);
    const [otherDeductions, setOtherDeductions] = useState<number>(0);

    // Leaving & Settlement Details (Right Column)
    const [leavingDate, setLeavingDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [salaryAmount, setSalaryAmount] = useState<number>(0);
    const [totalSalary, setTotalSalary] = useState<number>(0);
    const [noticeDays, setNoticeDays] = useState<number>(0);
    const [noticeAmount, setNoticeAmount] = useState<number>(0);
    const [providentFundProfit, setProvidentFundProfit] = useState<number>(0);
    const [incomeTax, setIncomeTax] = useState<number>(0);
    const [eobi, setEobi] = useState<number>(0);
    const [payableAmount, setPayableAmount] = useState<number>(0);

    // Other existing backend DTO fields preserved for compatibility
    const [shift, setShift] = useState("");
    const [mobileAllowance, setMobileAllowance] = useState<number>(0);
    const [fuelAllowance, setFuelAllowance] = useState<number>(0);
    const [overTimeHours, setOverTimeHours] = useState<number>(0);
    const [overTimeAmount, setOverTimeAmount] = useState<number>(0);
    const [gratuityPercent, setGratuityPercent] = useState<number>(0);
    const [gratuityDays, setGratuityDays] = useState<number>(0);
    const [gratuityAmount, setGratuityAmount] = useState<number>(0);
    const [leavesPayable, setLeavesPayable] = useState<number>(0);
    const [leavesType, setLeavesType] = useState("");
    const [leavesAmount, setLeavesAmount] = useState<number>(0);
    const [vehicleLoan, setVehicleLoan] = useState<number>(0);
    const [commission, setCommission] = useState<number>(0);
    const [token, setToken] = useState<number>(0);
    const [securityDeduction, setSecurityDeduction] = useState<number>(0);

    const { data: maxNo } = useQuery({
        queryKey: ['fsMaxNo', userSite],
        queryFn: () => finalSettlementService.getMaxNo(userSite),
        enabled: isOpen && !settlement
    });

    const { data: settlementOverTime } = useQuery({
        queryKey: ['fsOverTime', cardNo, transactionDate, userSite],
        queryFn: () => finalSettlementService.getOverTime(Number(cardNo), transactionDate.slice(0, 7), userSite),
        enabled: isOpen && !settlement && Boolean(cardNo) && Boolean(transactionDate)
    });

    useEffect(() => {
        if (typeof settlementOverTime === "number") setOverTimeHours(settlementOverTime);
    }, [settlementOverTime]);

    const calculateServicePeriod = (startStr: string, endStr: string) => {
        if (!startStr || !endStr) return "";
        try {
            const startDate = new Date(startStr);
            const endDate = new Date(endStr);
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return "";
            if (endDate < startDate) return "0 Days";

            const years = differenceInYears(endDate, startDate);
            const months = differenceInMonths(endDate, startDate) % 12;
            const tempDate = new Date(startDate);
            tempDate.setFullYear(tempDate.getFullYear() + years);
            tempDate.setMonth(tempDate.getMonth() + months);
            const days = differenceInDays(endDate, tempDate);

            const parts: string[] = [];
            if (years > 0) parts.push(`${years} Year${years > 1 ? 's' : ''}`);
            if (months > 0) parts.push(`${months} Month${months > 1 ? 's' : ''}`);
            if (days > 0 || parts.length === 0) parts.push(`${days} Day${days !== 1 ? 's' : ''}`);

            return parts.join(', ');
        } catch {
            return "";
        }
    };

    // Calculate service period when joiningDate or leavingDate changes
    useEffect(() => {
        if (joiningDate && leavingDate) {
            const period = calculateServicePeriod(joiningDate, leavingDate);
            setServiceDays(period);
        }
    }, [joiningDate, leavingDate]);

    useEffect(() => {
        if (settlement) {
            setTransactionNo(settlement.transactionNo);
            setTransactionDate(settlement.transactionDate ? format(new Date(settlement.transactionDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
            setCardNo(settlement.empCardNo ? settlement.empCardNo.toString() : "");
            setEmpName(settlement.empName || "");
            setFatherName(settlement.empFatherName || "");
            setDepartment(settlement.department || "");
            setDesignation(settlement.designation || "");
            setShift(settlement.shift || "");
            setCnic(settlement.cnic || "");
            const jDate = settlement.joiningDate ? format(new Date(settlement.joiningDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
            const lDate = settlement.leavingDate ? format(new Date(settlement.leavingDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
            setJoiningDate(jDate);
            setLeavingDate(lDate);
            setServiceDays(settlement.serviceDays || calculateServicePeriod(jDate, lDate));
            setGrossPay(settlement.grossPay || 0);
            setBasicPay(settlement.basicPay || 0);
            const existingLeavingType = settlement.leavingType || "Resignation";
            setLeavingType(existingLeavingType === "Resigned" ? "Resignation"
                : existingLeavingType === "Terminated" ? "Termination"
                    : existingLeavingType === "Struck Off" ? "Stuckoff" : existingLeavingType);
            setSalaryDays(settlement.salaryDays || 0);
            setSalaryMonth(settlement.salaryMonth ? format(new Date(settlement.salaryMonth), 'yyyy-MM') : format(new Date(), 'yyyy-MM'));
            setSalaryAmount(settlement.salaryAmount || 0);
            setOverTimeHours(settlement.overTimeHours || 0);
            setOverTimeAmount(settlement.overTimeAmount || 0);
            setNoticeDays(settlement.noticeDays || 0);
            setNoticeAmount(settlement.noticeDaysAmount || 0);
            setOtherPayable(settlement.otherPayable || 0);
            setProvidentFund(settlement.providentFund || 0);
            setProvidentFundProfit(settlement.providentFundProfit || 0);
            setLoanAdvance(settlement.loanAdvance || 0);
            setOtherDeductions(settlement.otherDeductions || 0);
            setIncomeTax(settlement.incomeTax || 0);
            setEobi(settlement.eobi || 0);
            setMobileAllowance(settlement.mobileAllowance || 0);
            setFuelAllowance(settlement.fuelAllowance || 0);
            setOverTimeHours(settlement.overTimeHours || 0);
            setOverTimeAmount(settlement.overTimeAmount || 0);
            setGratuityPercent(settlement.graduityPercent || 0);
            setGratuityAmount(settlement.graduityAmount || 0);
            setLeavesPayable(settlement.leavesPayable || 0);
            setLeavesType(settlement.leavesType || "");
            setLeavesAmount(settlement.leavesAmount || 0);
            setVehicleLoan(settlement.vehicleLoan || 0);
            setCommission(settlement.commission || 0);
            setToken(settlement.totalTokens || 0);
            setSecurityDeduction(settlement.securityDeduction || 0);
        } else if (maxNo) {
            setTransactionNo(maxNo);
            setTransactionDate(format(new Date(), 'yyyy-MM-dd'));
            setLeavingDate(format(new Date(), 'yyyy-MM-dd'));
            setSalaryMonth(format(new Date(), 'yyyy-MM'));
        }
    }, [settlement, maxNo, isOpen]);

    useEffect(() => {
        const [year, month] = salaryMonth.split("-").map(Number);
        const daysInSalaryMonth = Number.isFinite(year) && Number.isFinite(month)
            ? new Date(year, month, 0).getDate()
            : 0;
        const nextAmount = daysInSalaryMonth > 0
            ? roundLegacy(grossPay / daysInSalaryMonth * salaryDays)
            : 0;
        setSalaryAmount(nextAmount);
    }, [grossPay, salaryDays, salaryMonth]);

    useEffect(() => {
        const [year, month] = transactionDate.split("-").map(Number);
        const daysInSettlementMonth = Number.isFinite(year) && Number.isFinite(month)
            ? new Date(year, month, 0).getDate()
            : 0;
        setOverTimeAmount(daysInSettlementMonth > 0
            ? roundLegacy((grossPay / daysInSettlementMonth / 8) * overTimeHours)
            : 0);
    }, [grossPay, overTimeHours, transactionDate]);

    useEffect(() => {
        const totalDays = differenceInDays(new Date(leavingDate), new Date(joiningDate));
        const serviceMonths = roundLegacy(totalDays / 30.333333333333332 * 100) / 100;
        if (serviceMonths > 12 && (gratuityPercent === 100 || gratuityPercent === 66)) {
            const serviceYears = roundLegacy(serviceMonths / 12);
            const amount = gratuityPercent === 100
                ? basicPay * 12 * serviceYears
                : roundLegacy(basicPay * 66 / 100) * 12 * serviceYears;
            setGratuityDays(totalDays);
            setGratuityAmount(amount);
        } else {
            setGratuityDays(0);
            setGratuityAmount(0);
        }
    }, [basicPay, gratuityPercent, joiningDate, leavingDate]);

    useEffect(() => {
        if (gratuityPercent === 100) {
            setLeavesAmount(roundLegacy(grossPay / 30 * leavesPayable));
        } else if (gratuityPercent === 66) {
            setLeavesAmount(roundLegacy(grossPay * 66 / 100 / 30) * leavesPayable);
        } else {
            setLeavesAmount(0);
        }
    }, [grossPay, gratuityPercent, leavesPayable]);

    useEffect(() => {
        if (leavingType === "Stuckoff") {
            setNoticeDays(30);
            setNoticeAmount(-grossPay);
        } else if (leavingType === "Termination") {
            setNoticeDays(30);
            setNoticeAmount(grossPay);
        } else {
            setNoticeDays(0);
            setNoticeAmount(0);
        }
    }, [grossPay, leavingType]);

    useEffect(() => {
        const total = salaryAmount + overTimeAmount;
        setTotalSalary(total);
        setPayableAmount(total + gratuityAmount + leavesAmount + noticeAmount
            - loanAdvance - eobi - otherDeductions);
    }, [eobi, gratuityAmount, leavesAmount, loanAdvance, noticeAmount, otherDeductions, overTimeAmount, salaryAmount]);

    const handleEmpSelect = async (emp: any) => {
        setCardNo(emp.empCardNo.toString());
        setEmpName(emp.empName || "");
        setFatherName(emp.empFatherName || "");
        setDepartment(emp.deptName || emp.departmentCode || "");
        setDesignation(emp.designationName || "");
        setShift(emp.shift || "");
        setCnic(emp.cnicNo || "");
        if (emp.joiningDate) {
            const jDate = format(new Date(emp.joiningDate), 'yyyy-MM-dd');
            setJoiningDate(jDate);
            setServiceDays(calculateServicePeriod(jDate, leavingDate));
        }

        // If salary is missing, fetch full details
        if (!emp.salary) {
            try {
                const fullEmp = await employeeService.getByCardNo(emp.empCardNo, userSite);
                if (fullEmp.salary) {
                    setGrossPay(fullEmp.salary.grossPay || 0);
                    setBasicPay(fullEmp.salary.basicPay || 0);
                } else {
                    setGrossPay(0);
                    setBasicPay(0);
                }
            } catch (err) {
                console.error("Failed to fetch full employee details", err);
                setGrossPay(0);
                setBasicPay(0);
            }
        } else {
            setGrossPay(emp.salary.grossPay || 0);
            setBasicPay(emp.salary.basicPay || 0);
        }
    };

    const saveMutation = useMutation({
        mutationFn: async () => {
            const existingTransaction = await finalSettlementService.checkSettlementByCard(Number(cardNo), userSite);
            if (existingTransaction > 0 && existingTransaction !== transactionNo) {
                throw new Error(`Final settlement for this employee already exists as transaction #${existingTransaction}.`);
            }
            const dto: FinalSettlementDto = {
                transactionNo,
                site: userSite,
                transactionDate,
                empCardNo: Number(cardNo),
                empName,
                empFatherName: fatherName,
                department,
                designation,
                shift,
                cnic,
                joiningDate,
                serviceDays,
                grossPay,
                basicPay,
                leavingType,
                leavingDate,
                salaryDays,
                salaryMonth: salaryMonth ? new Date(salaryMonth).toISOString() : undefined,
                salaryAmount,
                overTimeHours,
                overTimeAmount,
                mobileAllowance,
                fuelAllowance,
                totalSalary,
                graduityPercent: gratuityPercent,
                graduityDays: gratuityDays,
                graduityAmount: gratuityAmount,
                leavesPayable,
                leavesType,
                leavesAmount,
                noticeDays,
                noticeDaysAmount: noticeAmount,
                salaryAdvance: 0,
                loanAdvance,
                eobi,
                otherPayable: 0,
                providentFund,
                providentFundProfit,
                payableAmount,
                otherDeductions,
                incomeTax,
                fabricLoan: 0,
                vehicleLoan,
                commission,
                securityDeduction,
                totalTokens: token
            };
            return await finalSettlementService.saveSettlement(dto);
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: `Final Settlement ${settlement ? 'updated' : 'processed'} successfully.`
            });
            queryClient.invalidateQueries({ queryKey: ['finalSettlements'] });
            queryClient.invalidateQueries({ queryKey: ['fsMaxNo'] });
            onClose();
        },
        onError: (err: any) => {
            toast({
                title: "Error",
                description: err.message || "Failed to process settlement.",
                variant: "destructive"
            });
        }
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        // Mandatory Validations
        if (!cardNo) {
            toast({
                title: "Validation Error",
                description: "Please select an employee.",
                variant: "destructive"
            });
            return;
        }
        if (!leavingType) {
            toast({
                title: "Validation Error",
                description: "Please select leaving type.",
                variant: "destructive"
            });
            return;
        }
        if (!leavingDate) {
            toast({
                title: "Validation Error",
                description: "Please select leaving date.",
                variant: "destructive"
            });
            return;
        }
        if (!salaryMonth) {
            toast({
                title: "Validation Error",
                description: "Please select salary month.",
                variant: "destructive"
            });
            return;
        }

        saveMutation.mutate();
    };

    const handleViewReport = () => {
        if (!transactionNo) {
            toast({
                title: "Notice",
                description: "Transaction number not found.",
                variant: "destructive"
            });
            return;
        }
        finalSettlementService.viewReportPdf(transactionNo, userSite);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background flex flex-col max-h-[92vh] border-border shadow-2xl">
                <DialogDescription className="sr-only">Form to process and calculate employee final settlement</DialogDescription>

                {/* Standard HR Header */}
                <div className="bg-card border-b border-border p-6 shrink-0">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="bg-secondary p-2.5 rounded-xl border border-border">
                                <Calculator className="w-6 h-6 text-foreground" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold tracking-tight text-foreground uppercase">
                                    {settlement ? "Edit Final Settlement" : "Final Settlement"}
                                </DialogTitle>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">
                                    Employee Clearance & Settlement
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {settlement && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleViewReport}
                                    className="h-8 gap-1.5"
                                >
                                    <Printer className="w-4 h-4" /> View Report
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onClose}
                                className="h-8 min-w-[80px]"
                            >
                                Cancel
                            </Button>
                            <Button
                                form="settlement-form"
                                type="submit"
                                size="sm"
                                disabled={saveMutation.isPending}
                                className="h-8 gap-2 min-w-[130px]"
                            >
                                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {settlement ? "Update Settlement" : "Save Settlement"}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-background">
                    <form id="settlement-form" onSubmit={handleSave} className="space-y-6">

                        {/* Top Metadata Row: Transaction No, Transaction Date, Card No */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card border border-border p-4 rounded-xl">
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                                    <Hash className="w-3.5 h-3.5" /> Transaction No :
                                </Label>
                                <Input className="h-9 font-sans font-bold bg-muted/40" value={transactionNo || ""} readOnly />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                                    <CalendarIcon className="w-3.5 h-3.5" /> Transaction Date :
                                </Label>
                                <Input
                                    type="date"
                                    className="h-9 bg-card"
                                    value={transactionDate}
                                    onChange={(e) => setTransactionDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" /> Card No : <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        className="h-9 font-sans font-bold bg-card border-border flex-1"
                                        value={cardNo}
                                        onChange={(e) => setCardNo(e.target.value)}
                                        placeholder="Card No"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-9 w-9 shrink-0 border-border bg-secondary/50 hover:bg-secondary"
                                        onClick={() => setIsEmpModalOpen(true)}
                                    >
                                        <Search className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Employee Details Box */}
                        <div className="bg-card border border-border p-5 rounded-xl space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Employee Name :</Label>
                                    <Input value={empName} readOnly className="h-9 bg-muted/30 font-medium" placeholder="Employee Name" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Father Name :</Label>
                                    <Input value={fatherName} readOnly className="h-9 bg-muted/30 font-medium" placeholder="Father Name" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Designation :</Label>
                                    <Input value={designation} readOnly className="h-9 bg-muted/30" placeholder="Designation" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Department :</Label>
                                    <Input value={department} readOnly className="h-9 bg-muted/30" placeholder="Department" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Service Days :</Label>
                                <Input value={serviceDays} readOnly className="h-9 bg-muted/30 font-medium" placeholder="e.g. 2 Years, 3 Months, 15 Days" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Joining Date :</Label>
                                    <Input type="date" value={joiningDate} readOnly className="h-9 bg-muted/30" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">CNIC :</Label>
                                    <Input value={cnic} readOnly className="h-9 bg-muted/30 font-sans" placeholder="CNIC Number" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Gross Pay :</Label>
                                    <Input value={grossPay} readOnly className="h-9 bg-muted/30 text-right font-sans font-semibold" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Basic Pay :</Label>
                                    <Input value={basicPay} readOnly className="h-9 bg-muted/30 text-right font-sans font-semibold" />
                                </div>
                            </div>
                        </div>

                        {/* Settlement Calculation Two-Column Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card border border-border p-5 rounded-xl">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Leaving Type : <span className="text-red-500">*</span></Label>
                                    <Select value={leavingType} onValueChange={setLeavingType}>
                                        <SelectTrigger className="h-9 bg-background"><SelectValue placeholder="Select Leaving Type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Resignation">Resignation</SelectItem>
                                            <SelectItem value="Stuckoff">Stuckoff</SelectItem>
                                            <SelectItem value="Termination">Termination</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Salary Month :</Label>
                                        <Input
                                            type="month"
                                            className="h-9 bg-background"
                                            value={salaryMonth}
                                            onChange={(e) => setSalaryMonth(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Salary Days :</Label>
                                        <Input
                                            type="number"
                                            className="h-9 text-center font-sans bg-background"
                                            value={salaryDays || ""}
                                            onChange={(e) => setSalaryDays(Number(e.target.value))}
                                            placeholder="Days"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Loan & Advance :</Label>
                                    <Input
                                        type="number"
                                        className="h-9 text-right font-sans bg-background text-red-600 dark:text-red-400"
                                        value={loanAdvance || ""}
                                        onChange={(e) => setLoanAdvance(Number(e.target.value))}
                                        placeholder="0"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Other Deduction :</Label>
                                    <Input
                                        type="number"
                                        className="h-9 text-right font-sans bg-background text-red-600 dark:text-red-400"
                                        value={otherDeductions || ""}
                                        onChange={(e) => setOtherDeductions(Number(e.target.value))}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Leaving Date : <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="date"
                                        className="h-9 bg-background"
                                        value={leavingDate}
                                        onChange={(e) => setLeavingDate(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Salary Amount :</Label>
                                    <Input
                                        type="number"
                                        className="h-9 text-right font-sans bg-muted/40"
                                        value={salaryAmount}
                                        readOnly
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Total Salary :</Label>
                                    <Input
                                        type="number"
                                        className="h-9 text-right font-sans bg-muted/40 font-bold"
                                        value={totalSalary || ""}
                                        readOnly
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Overtime Hours :</Label>
                                    <Input type="number" min="0" className="h-9 text-right font-sans bg-background" value={overTimeHours || ""} onChange={(e) => setOverTimeHours(Number(e.target.value) || 0)} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Overtime Amount :</Label>
                                    <Input type="number" className="h-9 text-right font-sans bg-muted/40" value={overTimeAmount} readOnly />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Gratuity Percent :</Label>
                                    <Select value={gratuityPercent ? String(gratuityPercent) : "none"} onValueChange={(value) => setGratuityPercent(value === "none" ? 0 : Number(value))}>
                                        <SelectTrigger className="h-9 bg-background"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Not applicable</SelectItem>
                                            <SelectItem value="100">100%</SelectItem>
                                            <SelectItem value="66">66%</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Gratuity Days :</Label>
                                        <Input type="number" className="h-9 bg-muted/40" value={gratuityDays} readOnly />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Gratuity Amount :</Label>
                                        <Input type="number" className="h-9 bg-muted/40" value={gratuityAmount} readOnly />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Leaves Payable :</Label>
                                        <Input type="number" min="0" className="h-9 bg-background" value={leavesPayable || ""} onChange={(e) => setLeavesPayable(Number(e.target.value) || 0)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Leaves Amount :</Label>
                                        <Input type="number" className="h-9 bg-muted/40" value={leavesAmount} readOnly />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Notice Days :</Label>
                                        <Input type="number" className="h-9 bg-muted/40" value={noticeDays} readOnly />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Notice Amount :</Label>
                                        <Input type="number" className="h-9 bg-muted/40" value={noticeAmount} readOnly />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">E.O.B.I :</Label>
                                    <Input
                                        type="number"
                                        className="h-9 text-right font-sans bg-background text-red-600 dark:text-red-400"
                                        value={eobi || ""}
                                        onChange={(e) => setEobi(Number(e.target.value))}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Summary Totals & Net Payable Bottom Card */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-secondary/30 border border-border p-4 rounded-xl items-center">
                            <div className="flex justify-between items-center p-3 bg-card rounded-lg border border-border">
                                <span className="text-xs font-bold uppercase text-muted-foreground">Total Salary & Adds</span>
                                <span className="text-lg font-sans font-bold text-foreground">Rs {totalSalary.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-card rounded-lg border border-green-500/30">
                                <span className="text-xs font-bold uppercase text-green-600 dark:text-green-400">Payable Amount :</span>
                                <span className="text-xl font-sans font-black text-green-600 dark:text-green-400">Rs {payableAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Bottom View button matching old page */}
                        {settlement && (
                            <div className="flex justify-end pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleViewReport}
                                    className="gap-2 h-9 px-6 bg-card border-border hover:bg-secondary"
                                >
                                    <Printer className="w-4 h-4 text-primary" /> View Report
                                </Button>
                            </div>
                        )}
                    </form>
                </div>
            </DialogContent>

            <EmployeeSelectModal
                isOpen={isEmpModalOpen}
                onClose={() => setIsEmpModalOpen(false)}
                onSelect={handleEmpSelect}
            />
        </Dialog>
    );
}
