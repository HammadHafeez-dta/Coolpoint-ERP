import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Search, Save, X, Loader2, Banknote, User, FileText, Calendar as CalendarIcon, Hash } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/modules/auth/services/authService";
import { loanService, LoanDto } from "../services/loanService";
import { employeeService, Employee } from "../services/employeeService";
import { EmployeeSelectModal } from "./EmployeeSelectModal";

interface LoanAdvanceFormProps {
    isOpen: boolean;
    onClose: () => void;
    loan?: LoanDto | null;
}

export default function LoanAdvanceForm({ isOpen, onClose, loan }: LoanAdvanceFormProps) {
    const queryClient = useQueryClient();
    const userSite = authService.getSite() || "";

    const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
    
    const [applicationNo, setApplicationNo] = useState<number>(0);
    const [loanDate, setLoanDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [loanType, setLoanType] = useState("Salary Advance");
    
    const [empCardNo, setEmpCardNo] = useState<string>("");
    const [empName, setEmpName] = useState("");
    const [fatherName, setFatherName] = useState("");
    const [departmentName, setDepartmentName] = useState("");
    
    const [loanAmount, setLoanAmount] = useState<number>(0);
    const [installmentAmount, setInstallmentAmount] = useState<number>(0);

    const { data: maxNo } = useQuery({
        queryKey: ['loanMaxNo', userSite],
        queryFn: () => loanService.getMaxNo(userSite),
        enabled: !loan
    });

    const { data: loanTypes = [] } = useQuery({
        queryKey: ['loan-types'],
        queryFn: loanService.getTypes,
        enabled: isOpen,
        staleTime: 5 * 60 * 1000,
    });

    const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
        queryKey: ['employees-search', userSite],
        queryFn: () => employeeService.getAll(userSite),
        enabled: isOpen && !!userSite,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (loan) {
            setApplicationNo(loan.applicationNo);
            setLoanDate(loan.loanDate ? format(new Date(loan.loanDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
            setLoanType(loan.loanType || "Salary Advance");
            setEmpCardNo(loan.empCardNo ? loan.empCardNo.toString() : "");
            setEmpName(loan.empName || "");
            setFatherName(loan.empFatherName || "");
            setDepartmentName(loan.departmentName || "");
            setLoanAmount(loan.loanAmount || 0);
            setInstallmentAmount(loan.installmentAmount || 0);
        } else {
            setLoanDate(format(new Date(), 'yyyy-MM-dd'));
            setLoanType("Salary Advance");
            setEmpCardNo("");
            setEmpName("");
            setFatherName("");
            setDepartmentName("");
            setLoanAmount(0);
            setInstallmentAmount(0);
            if (maxNo) {
                setApplicationNo(maxNo);
            }
        }
    }, [loan, maxNo, isOpen]);

    // If card number is populated but details are missing, lookup from loaded employees
    useEffect(() => {
        if (empCardNo && !empName && employees.length > 0) {
            const found = employees.find(e => e.empCardNo.toString() === empCardNo);
            if (found) {
                setEmpName(found.empName || "");
                setFatherName(found.empFatherName || "");
                setDepartmentName(found.deptName || found.departmentCode || "");
            }
        }
    }, [empCardNo, empName, employees]);

    const handleCardNoChange = (value: string) => {
        const val = value.replace(/\D/g, "");
        setEmpCardNo(val);

        if (!val) {
            setEmpName("");
            setFatherName("");
            setDepartmentName("");
            return;
        }

        const found = employees.find(e => e.empCardNo.toString() === val);
        if (found) {
            setEmpName(found.empName || "");
            setFatherName(found.empFatherName || "");
            setDepartmentName(found.deptName || found.departmentCode || "");
        } else {
            setEmpName("");
            setFatherName("");
            setDepartmentName("");
        }
    };

    const handleCardNoBlur = async () => {
        const trimmed = empCardNo.trim();
        if (!trimmed) return;

        const found = employees.find(e => e.empCardNo.toString() === trimmed);
        if (found) {
            setEmpName(found.empName || "");
            setFatherName(found.empFatherName || "");
            setDepartmentName(found.deptName || found.departmentCode || "");
            return;
        }

        try {
            const emp = await employeeService.getByCardNo(Number(trimmed), userSite);
            if (emp && emp.empName) {
                setEmpName(emp.empName);
                setFatherName(emp.empFatherName || "");
                setDepartmentName(emp.deptName || emp.departmentCode || "");
            } else {
                toast.error(`Employee with Card No ${trimmed} not found.`);
            }
        } catch {
            toast.error(`Employee with Card No ${trimmed} not found.`);
        }
    };

    const handleCardNoKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleCardNoBlur();
        } else if (e.key === "F1") {
            e.preventDefault();
            setIsEmpModalOpen(true);
        }
    };

    const handleEmpSelect = (emp: any) => {
        setEmpCardNo(emp.empCardNo.toString());
        setEmpName(emp.empName);
        setFatherName(emp.empFatherName || "");
        setDepartmentName(emp.deptName || emp.departmentCode || "");
    };

    const saveMutation = useMutation({
        mutationFn: async () => {
            const dto: LoanDto = {
                applicationNo,
                site: userSite,
                empCardNo: Number(empCardNo),
                loanDate,
                loanType,
                loanAmount,
                installmentAmount
            };
            return await loanService.saveLoan(dto);
        },
        onSuccess: () => {
            toast.success("Loan & Advance saved successfully.");
            queryClient.invalidateQueries({ queryKey: ['loans'] });
            queryClient.invalidateQueries({ queryKey: ['loanMaxNo'] });
            onClose();
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to save data.");
        }
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!empCardNo) {
            toast.error("Please select an employee.");
            return;
        }
        if (!loanAmount || loanAmount <= 0) {
            toast.error("Please enter a valid loan amount.");
            return;
        }
        saveMutation.mutate();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] sm:max-w-xl md:max-w-2xl max-h-[calc(100dvh-2rem)] flex flex-col p-0 overflow-hidden border border-border shadow-2xl rounded-2xl bg-card">
                {/* Header: White background, light blue icon tile, bottom border */}
                <DialogHeader className="px-6 py-3.5 border-b border-border bg-card flex-shrink-0">
                    <DialogTitle className="flex items-center gap-3 text-base font-bold text-foreground">
                        <div className="p-2 rounded-xl bg-sidebar/10 text-sidebar border border-sidebar/20">
                            <Banknote className="w-5 h-5 text-sidebar" />
                        </div>
                        <div>
                            <div>{loan ? "Edit Loan Application" : "New Loan Application"}</div>
                            <p className="text-xs font-normal text-muted-foreground mt-0.5">
                                Manage employee salary advances and loans
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden min-h-0">
                    {/* Body: Scrollable, tightened spacing with ~40px inputs */}
                    <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-3.5">
                        {/* Top Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-border/60 bg-muted/20">
                            <div className="space-y-1">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Hash className="w-3.5 h-3.5" /> Application No
                                </Label>
                                <Input 
                                    type="number" 
                                    className="font-sans bg-background font-semibold h-10" 
                                    value={applicationNo || ""} 
                                    readOnly 
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <CalendarIcon className="w-3.5 h-3.5" /> Start Date
                                </Label>
                                <Input 
                                    type="date" 
                                    className="font-medium bg-background h-10" 
                                    value={loanDate} 
                                    onChange={e => setLoanDate(e.target.value)} 
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" /> Loan Type
                                </Label>
                                <Select value={loanType} onValueChange={setLoanType}>
                                    <SelectTrigger className="font-medium bg-background h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loanTypes.map(t => (
                                             <SelectItem key={t.loanTypeId} value={t.loanType}>{t.loanType}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Employee Selection */}
                        <div className="p-3.5 rounded-xl border border-border/60 bg-muted/10 space-y-2">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-sidebar" /> Employee (Type Card No or Click Find / F1)
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Card No"
                                    value={empCardNo}
                                    onChange={(e) => handleCardNoChange(e.target.value)}
                                    onBlur={handleCardNoBlur}
                                    onKeyDown={handleCardNoKeyDown}
                                    className="font-sans font-bold w-24 sm:w-28 shrink-0 bg-background h-10 focus-visible:ring-sidebar"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-10 px-3.5 shrink-0 gap-1.5 border-sidebar/20 bg-sidebar/5 hover:bg-sidebar/10 text-sidebar"
                                    onClick={() => setIsEmpModalOpen(true)}
                                >
                                    <Search className="w-4 h-4 text-sidebar" />
                                    <span className="hidden sm:inline text-xs font-semibold">Find</span>
                                </Button>
                                <Input 
                                    placeholder={isLoadingEmployees ? "Loading employees..." : "Employee name..."}
                                    value={empName}
                                    readOnly
                                    tabIndex={-1}
                                    className="flex-1 bg-background font-medium h-10 cursor-default"
                                />
                            </div>
                            {(departmentName || fatherName) && (
                                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                    {departmentName && (
                                        <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                                            Dept: <strong className="ml-1 text-foreground">{departmentName}</strong>
                                        </span>
                                    )}
                                    {fatherName && (
                                        <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                                            Father: <strong className="ml-1 text-foreground">{fatherName}</strong>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Amount & Installment */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-sidebar/20 bg-sidebar/5">
                            <div className="space-y-1">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                                    <Banknote className="w-3.5 h-3.5 text-sidebar" /> Loan Amount
                                </Label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-muted-foreground pointer-events-none">
                                        Rs
                                    </span>
                                    <Input 
                                        type="number" 
                                        className="pl-9 font-sans font-bold text-base h-10 bg-background" 
                                        value={loanAmount || ""}
                                        onChange={(e) => setLoanAmount(Number(e.target.value))}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                                    <CalendarIcon className="w-3.5 h-3.5 text-sidebar" /> Monthly Installment
                                </Label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-muted-foreground pointer-events-none">
                                        Rs
                                    </span>
                                    <Input 
                                        type="number" 
                                        className="pl-9 font-sans font-bold text-base h-10 bg-background" 
                                        value={installmentAmount || ""}
                                        onChange={(e) => setInstallmentAmount(Number(e.target.value))}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer: Pinned with flex-shrink-0, top border, always visible */}
                    <div className="px-6 py-3 border-t border-border bg-card flex items-center justify-end gap-3 flex-shrink-0">
                        <Button type="button" variant="outline" onClick={onClose} className="px-5 h-10">
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            className="px-6 h-10 gap-2 bg-sidebar hover:bg-sidebar text-white shadow-md shadow-sidebar/20 font-semibold"
                            disabled={saveMutation.isPending}
                        >
                            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {loan ? "Update Application" : "Save Application"}
                        </Button>
                    </div>
                </form>
            </DialogContent>

            <EmployeeSelectModal
                isOpen={isEmpModalOpen}
                onClose={() => setIsEmpModalOpen(false)}
                onSelect={handleEmpSelect}
            />
        </Dialog>
    );
}
