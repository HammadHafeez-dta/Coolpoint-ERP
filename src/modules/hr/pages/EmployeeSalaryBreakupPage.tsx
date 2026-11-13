import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import {
    Plus,
    Save,
    RotateCcw,
    Edit,
    Search,
    Trash2,
    Layers,
    Calendar as CalendarIcon,
    Building2,
    UserCircle,
    Loader2,
    Coins,
    Banknote,
    TrendingUp,
    TrendingDown,
    Filter
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
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
import { useToast } from "@/shared/components/ui/use-toast";
import { authService } from "@/modules/auth/services/authService";
import { departmentService, Department } from "../services/departmentService";
import { employeeService, Employee } from "../services/employeeService";
import {
    salaryService,
    UpdateSalaryBreakupChildDto,
    UpdateSalaryBreakupMasterDto
} from "../services/salaryService";
import { EmployeeSelectModal } from "../components/EmployeeSelectModal";
import { motion } from "framer-motion";

export interface SalaryBreakupRow {
    srNo: number;
    empCardNo: number | "";
    name: string;
    basicPay: number;
    twentyPerc: number;
    thirtyFivePerc: number;
    houseRent: number;
    conveyance: number;
    adh1: number;
    adh2: number;
    adh3: number;
    allowance: number;
    allowances: number;
    twentyPerc1: number;
    providentFund: number;
    eobi: number;
    grossPay: number;
    d_ProvidentFund: number;
    d_EOBI: number;
    d_Advance: number;
    d_Loan: number;
    d_Tax: number;
    d_Lvs: number;
    netPay: number;
    pfSchoolShare: number;
    eobiSchoolShare: number;
}

const computeRowTotals = (row: Partial<SalaryBreakupRow>): { grossPay: number; netPay: number } => {
    const basic = Number(row.basicPay || 0);
    const a20 = Number(row.twentyPerc || 0);
    const a35 = Number(row.thirtyFivePerc || 0);
    const hRent = Number(row.houseRent || 0);
    const conv = Number(row.conveyance || 0);
    const adh1 = Number(row.adh1 || 0);
    const adh2 = Number(row.adh2 || 0);
    const adh3 = Number(row.adh3 || 0);
    const allow = Number(row.allowance || 0);
    const allows = Number(row.allowances || 0);
    const a20_1 = Number(row.twentyPerc1 || 0);
    const pf = Number(row.providentFund || 0);
    const eobi = Number(row.eobi || 0);

    const grossPay = basic + a20 + a35 + hRent + conv + adh1 + adh2 + adh3 + allow + allows + a20_1 + pf + eobi;

    const dPf = Number(row.d_ProvidentFund || 0);
    const dEobi = Number(row.d_EOBI || 0);
    const dAdv = Number(row.d_Advance || 0);
    const dLoan = Number(row.d_Loan || 0);
    const dTax = Number(row.d_Tax || 0);
    const dLvs = Number(row.d_Lvs || 0);

    const totalDeductions = dPf + dEobi + dAdv + dLoan + dTax + dLvs;
    const netPay = grossPay - totalDeductions;

    return { grossPay, netPay };
};

export default function EmployeeSalaryBreakupPage() {
    const { toast } = useToast();
    const site = authService.getSite() || "SAFT";
    const user = authService.getCurrentUser();
    const userId = user?.username || "1";

    const [mode, setMode] = useState<"add" | "edit">("add");
    const [transNo, setTransNo] = useState<number | "">("");
    const [transDate, setTransDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [selectedDepartment, setSelectedDepartment] = useState<string>("");
    const [departments, setDepartments] = useState<Department[]>([]);
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);

    const [rows, setRows] = useState<SalaryBreakupRow[]>([]);
    const [searchFilter, setSearchFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
    const [targetRowIndex, setTargetRowIndex] = useState<number | null>(null);

    // Initial load: Departments, Employees & Max Transaction No
    useEffect(() => {
        loadInitialData();
    }, [site]);

    // F1 & Ctrl+S Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F1") {
                e.preventDefault();
                setTargetRowIndex(null);
                setIsEmpModalOpen(true);
            } else if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [rows, transNo, transDate, mode, site, userId]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [deptList, empList, nextNo] = await Promise.all([
                departmentService.getAll(site),
                employeeService.getAll(site),
                salaryService.getBreakupMaxNo(site).catch(() => 1),
            ]);
            setDepartments(deptList || []);
            setAllEmployees(empList || []);
            setTransNo(nextNo || 1);
        } catch (err: any) {
            toast({
                title: "Error",
                description: err?.message || "Failed to load initial data",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Mode Switch: Add
    const handleSwitchToAdd = async () => {
        setMode("add");
        setRows([]);
        setSelectedDepartment("");
        setTransDate(format(new Date(), "yyyy-MM-dd"));
        try {
            const nextNo = await salaryService.getBreakupMaxNo(site);
            setTransNo(nextNo || 1);
        } catch {
            setTransNo(1);
        }
    };

    // Mode Switch: Edit
    const handleSwitchToEdit = () => {
        setMode("edit");
        setRows([]);
        setSelectedDepartment("");
    };

    // Load Department Employees
    const handleDepartmentChange = async (deptCode: string) => {
        setSelectedDepartment(deptCode);
        if (!deptCode) {
            setRows([]);
            return;
        }

        setLoading(true);
        try {
            const deptEmps = allEmployees.filter(
                (e) => String(e.departmentCode) === String(deptCode) && e.status !== false
            );

            const newRows: SalaryBreakupRow[] = await Promise.all(
                deptEmps.map(async (emp, idx) => {
                    let sal = emp.salary;
                    if (!sal) {
                        sal = (await employeeService.getSalary(emp.empCardNo, site)) || undefined;
                    }

                    const partialRow: Partial<SalaryBreakupRow> = {
                        basicPay: Number(sal?.basicPay || 0),
                        twentyPerc: Number(sal?.a01 || sal?.a09 || 0),
                        thirtyFivePerc: Number(sal?.a02 || 0),
                        houseRent: Number(sal?.a03 || 0),
                        conveyance: Number(sal?.a04 || 0),
                        adh1: Number(sal?.a05 || 0),
                        adh2: Number(sal?.a06 || 0),
                        adh3: Number(sal?.a07 || 0),
                        allowance: Number(sal?.a08 || 0),
                        allowances: Number(sal?.a12 || 0),
                        twentyPerc1: Number(sal?.a09 || 0),
                        providentFund: Number(sal?.a10 || 0),
                        eobi: Number(sal?.a11 || 0),
                        d_ProvidentFund: Number(sal?.d01 || 0),
                        d_EOBI: Number(sal?.d02 || 0),
                        d_Advance: Number(sal?.d03 || 0),
                        d_Loan: Number(sal?.d04 || 0),
                        d_Tax: Number(sal?.d05 || 0),
                        d_Lvs: Number(sal?.d06 || 0),
                        pfSchoolShare: Number(sal?.pfSchoolShare || 0),
                        eobiSchoolShare: Number(sal?.eobiSchoolShare || 0),
                    };

                    const { grossPay, netPay } = computeRowTotals(partialRow);

                    return {
                        srNo: idx + 1,
                        empCardNo: emp.empCardNo,
                        name: emp.empName || "",
                        basicPay: partialRow.basicPay!,
                        twentyPerc: partialRow.twentyPerc!,
                        thirtyFivePerc: partialRow.thirtyFivePerc!,
                        houseRent: partialRow.houseRent!,
                        conveyance: partialRow.conveyance!,
                        adh1: partialRow.adh1!,
                        adh2: partialRow.adh2!,
                        adh3: partialRow.adh3!,
                        allowance: partialRow.allowance!,
                        allowances: partialRow.allowances!,
                        twentyPerc1: partialRow.twentyPerc1!,
                        providentFund: partialRow.providentFund!,
                        eobi: partialRow.eobi!,
                        grossPay,
                        d_ProvidentFund: partialRow.d_ProvidentFund!,
                        d_EOBI: partialRow.d_EOBI!,
                        d_Advance: partialRow.d_Advance!,
                        d_Loan: partialRow.d_Loan!,
                        d_Tax: partialRow.d_Tax!,
                        d_Lvs: partialRow.d_Lvs!,
                        netPay,
                        pfSchoolShare: partialRow.pfSchoolShare!,
                        eobiSchoolShare: partialRow.eobiSchoolShare!,
                    };
                })
            );

            setRows(newRows);
        } catch (err: any) {
            toast({
                title: "Error Loading Department Data",
                description: err?.message || "Failed to load employees for selected department.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch existing transaction in Edit mode
    const handleFetchTransaction = async () => {
        if (!transNo) {
            toast({ title: "Validation", description: "Please enter a Transaction Number to search.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const master = await salaryService.getBreakupMasterInfo(Number(transNo), site);
            if (!master) {
                toast({ title: "Not Found", description: `Transaction #${transNo} does not exist.`, variant: "destructive" });
                setRows([]);
                return;
            }

            if (master.transactionDate) {
                setTransDate(format(new Date(master.transactionDate), "yyyy-MM-dd"));
            }

            const children = await salaryService.getBreakupChildInfo(Number(transNo), site);
            const loadedRows: SalaryBreakupRow[] = await Promise.all((children || []).map(async (c: any, idx: number) => {
                const cardNo = Number(c.emP_CardNo ?? c.empCardNo ?? 0);
                let empSal = null;
                try {
                    empSal = await employeeService.getSalary(cardNo, site);
                } catch {
                    // Ignore
                }

                const partial: Partial<SalaryBreakupRow> = {
                    basicPay: Number(c.basic_Pay ?? c.basicPay ?? 0),
                    twentyPerc: Number(c.twenty_Percent ?? c.twentyPercent ?? 0),
                    thirtyFivePerc: Number(c.thirtyFive_Percent ?? c.thirtyFivePercent ?? 0),
                    houseRent: Number(c.house_Rent ?? c.houseRent ?? 0),
                    conveyance: Number(c.conveyance ?? 0),
                    adh1: Number(c.adH1 ?? c.adh1 ?? 0),
                    adh2: Number(c.adH2 ?? c.adh2 ?? 0),
                    adh3: Number(c.adH3 ?? c.adh3 ?? 0),
                    allowance: Number(c.allowance ?? 0),
                    allowances: Number(c.allowances ?? 0),
                    twentyPerc1: Number(c.twenty_Percent1 ?? c.twentyPercent1 ?? 0),
                    providentFund: Number(c.provident_Fund ?? c.providentFund ?? 0),
                    eobi: Number(c.eobi ?? 0),
                    d_ProvidentFund: Number(c.d_Provident_Fund ?? c.dProvidentFund ?? 0),
                    d_EOBI: Number(c.d_EOBI ?? c.dEobi ?? 0),
                    d_Advance: Number(c.d_Advance ?? c.dAdvance ?? 0),
                    d_Loan: Number(c.d_Loan ?? c.dLoan ?? 0),
                    d_Tax: Number(c.d_Tax ?? c.dTax ?? 0),
                    d_Lvs: Number(c.d_Lvs ?? c.dLvs ?? 0),
                    pfSchoolShare: Number(c.pfSchoolShare ?? c.pf_SchoolShare ?? empSal?.pfSchoolShare ?? 0),
                    eobiSchoolShare: Number(c.eobiSchoolShare ?? c.eobi_SchoolShare ?? empSal?.eobiSchoolShare ?? 0),
                };

                const { grossPay, netPay } = computeRowTotals(partial);

                return {
                    srNo: idx + 1,
                    empCardNo: cardNo,
                    name: c.name || "",
                    basicPay: partial.basicPay!,
                    twentyPerc: partial.twentyPerc!,
                    thirtyFivePerc: partial.thirtyFivePerc!,
                    houseRent: partial.houseRent!,
                    conveyance: partial.conveyance!,
                    adh1: partial.adh1!,
                    adh2: partial.adh2!,
                    adh3: partial.adh3!,
                    allowance: partial.allowance!,
                    allowances: partial.allowances!,
                    twentyPerc1: partial.twentyPerc1!,
                    providentFund: partial.providentFund!,
                    eobi: partial.eobi!,
                    grossPay,
                    d_ProvidentFund: partial.d_ProvidentFund!,
                    d_EOBI: partial.d_EOBI!,
                    d_Advance: partial.d_Advance!,
                    d_Loan: partial.d_Loan!,
                    d_Tax: partial.d_Tax!,
                    d_Lvs: partial.d_Lvs!,
                    netPay,
                    pfSchoolShare: partial.pfSchoolShare!,
                    eobiSchoolShare: partial.eobiSchoolShare!,
                };
            }));

            setRows(loadedRows);
            toast({ title: "Loaded", description: `Loaded ${loadedRows.length} records for Transaction #${transNo}.` });
        } catch (err: any) {
            toast({ title: "Error", description: err?.message || "Failed to load transaction.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // Update single cell in row
    const handleCellChange = async (rowIndex: number, field: keyof SalaryBreakupRow, value: any) => {
        const updated = [...rows];
        const target = { ...updated[rowIndex], [field]: value };

        if (field === "empCardNo") {
            const cardNo = Number(value);
            const foundEmp = allEmployees.find((e) => e.empCardNo === cardNo);
            if (foundEmp) {
                target.name = foundEmp.empName || "";
                try {
                    const sal = (await employeeService.getSalary(cardNo, site)) || undefined;
                    if (sal) {
                        target.basicPay = Number(sal.basicPay || 0);
                        target.twentyPerc = Number(sal.a01 || sal.a09 || 0);
                        target.thirtyFivePerc = Number(sal.a02 || 0);
                        target.houseRent = Number(sal.a03 || 0);
                        target.conveyance = Number(sal.a04 || 0);
                        target.adh1 = Number(sal.a05 || 0);
                        target.adh2 = Number(sal.a06 || 0);
                        target.adh3 = Number(sal.a07 || 0);
                        target.allowance = Number(sal.a08 || 0);
                        target.allowances = Number(sal.a12 || 0);
                        target.twentyPerc1 = Number(sal.a09 || 0);
                        target.providentFund = Number(sal.a10 || 0);
                        target.eobi = Number(sal.a11 || 0);
                        target.d_ProvidentFund = Number(sal.d01 || 0);
                        target.d_EOBI = Number(sal.d02 || 0);
                        target.d_Advance = Number(sal.d03 || 0);
                        target.d_Loan = Number(sal.d04 || 0);
                        target.d_Tax = Number(sal.d05 || 0);
                        target.d_Lvs = Number(sal.d06 || 0);
                        target.pfSchoolShare = Number(sal.pfSchoolShare || 0);
                        target.eobiSchoolShare = Number(sal.eobiSchoolShare || 0);
                    }
                } catch {
                    // Ignore
                }
            }
        }

        const { grossPay, netPay } = computeRowTotals(target);
        target.grossPay = grossPay;
        target.netPay = netPay;

        updated[rowIndex] = target;
        setRows(updated);
    };

    // Modal Employee Select
    const handleModalSelectEmployee = async (emp: Employee) => {
        setIsEmpModalOpen(false);
        const cardNo = emp.empCardNo;
        let sal = emp.salary;
        if (!sal) {
            sal = (await employeeService.getSalary(cardNo, site)) || undefined;
        }

        const partial: Partial<SalaryBreakupRow> = {
            basicPay: Number(sal?.basicPay || 0),
            twentyPerc: Number(sal?.a01 || sal?.a09 || 0),
            thirtyFivePerc: Number(sal?.a02 || 0),
            houseRent: Number(sal?.a03 || 0),
            conveyance: Number(sal?.a04 || 0),
            adh1: Number(sal?.a05 || 0),
            adh2: Number(sal?.a06 || 0),
            adh3: Number(sal?.a07 || 0),
            allowance: Number(sal?.a08 || 0),
            allowances: Number(sal?.a12 || 0),
            twentyPerc1: Number(sal?.a09 || 0),
            providentFund: Number(sal?.a10 || 0),
            eobi: Number(sal?.a11 || 0),
            d_ProvidentFund: Number(sal?.d01 || 0),
            d_EOBI: Number(sal?.d02 || 0),
            d_Advance: Number(sal?.d03 || 0),
            d_Loan: Number(sal?.d04 || 0),
            d_Tax: Number(sal?.d05 || 0),
            d_Lvs: Number(sal?.d06 || 0),
            pfSchoolShare: Number(sal?.pfSchoolShare || 0),
            eobiSchoolShare: Number(sal?.eobiSchoolShare || 0),
        };

        const { grossPay, netPay } = computeRowTotals(partial);

        if (targetRowIndex !== null && targetRowIndex < rows.length) {
            setRows((prev) => {
                const updated = [...prev];
                updated[targetRowIndex] = {
                    ...updated[targetRowIndex],
                    empCardNo: cardNo,
                    name: emp.empName || "",
                    basicPay: partial.basicPay!,
                    twentyPerc: partial.twentyPerc!,
                    thirtyFivePerc: partial.thirtyFivePerc!,
                    houseRent: partial.houseRent!,
                    conveyance: partial.conveyance!,
                    adh1: partial.adh1!,
                    adh2: partial.adh2!,
                    adh3: partial.adh3!,
                    allowance: partial.allowance!,
                    allowances: partial.allowances!,
                    twentyPerc1: partial.twentyPerc1!,
                    providentFund: partial.providentFund!,
                    eobi: partial.eobi!,
                    grossPay,
                    d_ProvidentFund: partial.d_ProvidentFund!,
                    d_EOBI: partial.d_EOBI!,
                    d_Advance: partial.d_Advance!,
                    d_Loan: partial.d_Loan!,
                    d_Tax: partial.d_Tax!,
                    d_Lvs: partial.d_Lvs!,
                    netPay,
                    pfSchoolShare: partial.pfSchoolShare!,
                    eobiSchoolShare: partial.eobiSchoolShare!,
                };
                return updated;
            });
        } else {
            const newRow: SalaryBreakupRow = {
                srNo: rows.length + 1,
                empCardNo: cardNo,
                name: emp.empName || "",
                basicPay: partial.basicPay!,
                twentyPerc: partial.twentyPerc!,
                thirtyFivePerc: partial.thirtyFivePerc!,
                houseRent: partial.houseRent!,
                conveyance: partial.conveyance!,
                adh1: partial.adh1!,
                adh2: partial.adh2!,
                adh3: partial.adh3!,
                allowance: partial.allowance!,
                allowances: partial.allowances!,
                twentyPerc1: partial.twentyPerc1!,
                providentFund: partial.providentFund!,
                eobi: partial.eobi!,
                grossPay,
                d_ProvidentFund: partial.d_ProvidentFund!,
                d_EOBI: partial.d_EOBI!,
                d_Advance: partial.d_Advance!,
                d_Loan: partial.d_Loan!,
                d_Tax: partial.d_Tax!,
                d_Lvs: partial.d_Lvs!,
                netPay,
                pfSchoolShare: partial.pfSchoolShare!,
                eobiSchoolShare: partial.eobiSchoolShare!,
            };
            setRows((prev) => [...prev, newRow]);
        }
        setTargetRowIndex(null);
    };

    // Remove row
    const handleRemoveRow = (index: number) => {
        const updated = rows.filter((_, i) => i !== index).map((r, i) => ({ ...r, srNo: i + 1 }));
        setRows(updated);
    };

    // Save All Data
    const handleSave = async () => {
        if (!transNo) {
            toast({ title: "Validation Error", description: "Transaction Number is required.", variant: "destructive" });
            return;
        }

        const validRows = rows.filter((r) => r.empCardNo && r.name);
        if (validRows.length === 0) {
            toast({ title: "Validation Error", description: "Please add at least one valid employee row with Card No and Name.", variant: "destructive" });
            return;
        }

        const cardNos = validRows.map((r) => r.empCardNo);
        const hasDuplicates = new Set(cardNos).size !== cardNos.length;
        if (hasDuplicates) {
            toast({ title: "Duplicate Card No", description: "Duplicate Employee Card Numbers found. Please ensure each card number is unique.", variant: "destructive" });
            return;
        }

        setSaving(true);
        try {
            let actualTransNo = Number(transNo);
            if (mode === "add") {
                const latestMax = await salaryService.getBreakupMaxNo(site).catch(() => actualTransNo);
                if (latestMax) actualTransNo = latestMax;
            }

            const masterDto: UpdateSalaryBreakupMasterDto = {
                transactionNo: actualTransNo,
                transactionDate: transDate,
            };
            await salaryService.saveBreakupMaster(masterDto, site, userId);
            await salaryService.deleteBreakupChild(actualTransNo, site);

            for (const row of validRows) {
                const childDto: UpdateSalaryBreakupChildDto = {
                    transactionNo: actualTransNo,
                    empCardNo: Number(row.empCardNo),
                    name: row.name,
                    basicPay: Number(row.basicPay || 0),
                    twentyPerc: Number(row.twentyPerc || 0),
                    thirtyFivePerc: Number(row.thirtyFivePerc || 0),
                    houseRent: Number(row.houseRent || 0),
                    conveyance: Number(row.conveyance || 0),
                    adh1: Number(row.adh1 || 0),
                    adh2: Number(row.adh2 || 0),
                    adh3: Number(row.adh3 || 0),
                    allowance: Number(row.allowance || 0),
                    allowances: Number(row.allowances || 0),
                    twentyPerc1: Number(row.twentyPerc1 || 0),
                    providentFund: Number(row.providentFund || 0),
                    eobi: Number(row.eobi || 0),
                    grossPay: Number(row.grossPay || 0),
                    d_ProvidentFund: Number(row.d_ProvidentFund || 0),
                    d_EOBI: Number(row.d_EOBI || 0),
                    d_Advance: Number(row.d_Advance || 0),
                    d_Loan: Number(row.d_Loan || 0),
                    d_Tax: Number(row.d_Tax || 0),
                    d_Lvs: Number(row.d_Lvs || 0),
                    netPay: Number(row.netPay || 0),
                    pfSchoolShare: Number(row.pfSchoolShare || 0),
                    eobiSchoolShare: Number(row.eobiSchoolShare || 0),
                };

                await salaryService.saveBreakupChild(childDto, site);
                await salaryService.updateEmployeeSalaryBreakup(childDto, site);
            }

            toast({
                title: "Saved Successfully",
                description: `Salary Breakup Transaction #${actualTransNo} saved and ${validRows.length} employee salaries updated.`,
            });

            if (mode === "add") {
                const nextNo = await salaryService.getBreakupMaxNo(site).catch(() => actualTransNo + 1);
                setTransNo(nextNo);
                setRows([]);
                setSelectedDepartment("");
            }
        } catch (err: any) {
            toast({
                title: "Save Failed",
                description: err?.message || "An error occurred while saving the salary breakup.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    // Filtered Rows for View
    const filteredRows = useMemo(() => {
        if (!searchFilter.trim()) return rows;
        const q = searchFilter.toLowerCase();
        return rows.filter(
            (r) =>
                r.empCardNo.toString().includes(q) ||
                r.name.toLowerCase().includes(q)
        );
    }, [rows, searchFilter]);

    // Totals Computation
    const totals = useMemo(() => {
        return rows.reduce(
            (acc, curr) => {
                acc.basic += curr.basicPay || 0;
                acc.gross += curr.grossPay || 0;
                acc.deductions +=
                    (curr.d_ProvidentFund || 0) +
                    (curr.d_EOBI || 0) +
                    (curr.d_Advance || 0) +
                    (curr.d_Loan || 0) +
                    (curr.d_Tax || 0) +
                    (curr.d_Lvs || 0);
                acc.net += curr.netPay || 0;
                return acc;
            },
            { basic: 0, gross: 0, deductions: 0, net: 0 }
        );
    }, [rows]);

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Standard Application Header */}
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <Layers className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Employee Salary Breakup</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>

                {/* Top Action Buttons matching Standard Design */}
                <div className="flex items-center gap-2">
                    <Button
                        variant={mode === "add" ? "default" : "outline"}
                        size="sm"
                        onClick={handleSwitchToAdd}
                        className="gap-1.5 h-8 text-xs bg-[#171858] hover:bg-[#121344] text-white shadow-xs active:scale-[0.98] transition-transform"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add (New)
                    </Button>

                    <Button
                        variant={mode === "edit" ? "secondary" : "outline"}
                        size="sm"
                        onClick={handleSwitchToEdit}
                        className="gap-1.5 h-8 text-xs border-border"
                    >
                        <Edit className="w-3.5 h-3.5" /> Edit
                    </Button>

                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleSave}
                        disabled={saving || loading || rows.length === 0}
                        className="gap-1.5 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-[0.98] transition-transform"
                    >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        {saving ? "Saving..." : "Save (Ctrl+S)"}
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={mode === "add" ? handleSwitchToAdd : handleSwitchToEdit}
                        disabled={loading}
                        className="gap-1.5 h-8 text-xs border-border"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> Refresh
                    </Button>
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6 space-y-6 max-w-[1600px] mx-auto w-full">
                {/* Stats Overview Row matching Standard Theme */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className="bg-sidebar/10 p-3 rounded-xl"><UserCircle className="w-6 h-6 text-sidebar" /></div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Employees</p>
                            <h3 className="text-xl font-black text-foreground">{rows.length}</h3>
                        </div>
                    </div>

                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className="bg-sidebar/10 p-3 rounded-xl"><Coins className="w-6 h-6 text-sidebar" /></div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Basic Pay</p>
                            <h3 className="text-xl font-black text-foreground">{totals.basic.toLocaleString("en-US", { minimumFractionDigits: 2 })} <span className="text-[10px] font-normal text-muted-foreground">Rs</span></h3>
                        </div>
                    </div>

                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className="bg-green-500/10 p-3 rounded-xl"><TrendingUp className="w-6 h-6 text-green-500" /></div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Gross Pay</p>
                            <h3 className="text-xl font-black text-green-600 dark:text-green-400">{totals.gross.toLocaleString("en-US", { minimumFractionDigits: 2 })} <span className="text-[10px] font-normal text-muted-foreground">Rs</span></h3>
                        </div>
                    </div>

                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className="bg-amber-500/10 p-3 rounded-xl"><Banknote className="w-6 h-6 text-amber-500" /></div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Grand Net Total</p>
                            <h3 className="text-xl font-black text-amber-600 dark:text-amber-400">{totals.net.toLocaleString("en-US", { minimumFractionDigits: 2 })} <span className="text-[10px] font-normal text-muted-foreground">Rs</span></h3>
                        </div>
                    </div>
                </div>

                {/* Form Controls Row (Transaction No, Date, Category, Filter) */}
                <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-5">
                        {/* Transaction No */}
                        <div className="flex items-center gap-2">
                            <Label htmlFor="transNo" className="text-xs font-semibold text-foreground whitespace-nowrap">
                                Transaction No:
                            </Label>
                            <div className="flex items-center gap-1">
                                <Input
                                    id="transNo"
                                    type="number"
                                    value={transNo}
                                    onChange={(e) => setTransNo(e.target.value ? Number(e.target.value) : "")}
                                    placeholder="100"
                                    disabled={mode === "add"}
                                    className="w-24 h-9 font-sans font-bold text-right bg-background/50 border-border"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && mode === "edit") {
                                            handleFetchTransaction();
                                        }
                                    }}
                                />
                                {mode === "edit" && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={handleFetchTransaction}
                                        disabled={loading || !transNo}
                                        className="h-9 px-2.5 border-border"
                                        title="Search Transaction"
                                    >
                                        <Search className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Transaction Date */}
                        <div className="flex items-center gap-2">
                            <Label htmlFor="transDate" className="text-xs font-semibold text-foreground whitespace-nowrap">
                                Transaction Date:
                            </Label>
                            <Input
                                id="transDate"
                                type="date"
                                value={transDate}
                                onChange={(e) => setTransDate(e.target.value)}
                                className="w-36 h-9 text-xs bg-background/50 border-border"
                            />
                        </div>

                        {/* Salary Category (Department) */}
                        <div className="flex items-center gap-2 min-w-[280px]">
                            <Label htmlFor="department" className="text-xs font-semibold text-foreground whitespace-nowrap">
                                Salary Category:
                            </Label>
                            <Select
                                value={selectedDepartment}
                                onValueChange={handleDepartmentChange}
                                disabled={loading}
                            >
                                <SelectTrigger id="department" className="h-9 text-xs bg-background/50 border-border w-[220px]">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((d) => (
                                        <SelectItem key={d.code} value={d.code} className="text-xs">
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Filter & Employee Select Trigger */}
                    <div className="flex items-center gap-2 ml-auto">
                        <div className="relative w-56">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search in grid..."
                                className="pl-9 h-9 text-xs bg-background/50 border-border"
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                            />
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setTargetRowIndex(null);
                                setIsEmpModalOpen(true);
                            }}
                            className="h-9 gap-2 border-border"
                            title="Press F1 to open Employee Search"
                        >
                            <UserCircle className="w-4 h-4 text-primary" /> + Add Employee (F1)
                        </Button>
                    </div>
                </div>

                {/* Table Container styled with Standard Component */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col"
                >
                    <Table containerClassName="max-h-[calc(100vh-380px)] min-h-[400px]">
                        <TableHeader className="bg-secondary/90 backdrop-blur-sm border-b border-border sticky top-0 z-20">
                            <TableRow className="hover:bg-transparent border-border">
                                <TableHead className="w-12 font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-3 text-center sticky top-0 bg-secondary/90">Sr #</TableHead>
                                <TableHead className="w-24 font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-3 text-center sticky top-0 bg-secondary/90">Card No</TableHead>
                                <TableHead className="min-w-[180px] font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-3 sticky top-0 bg-secondary/90">Employee Name</TableHead>

                                {/* Allowances / Earnings */}
                                <TableHead className="w-24 font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-2 text-right sticky top-0 bg-secondary/90">Basic Pay</TableHead>
                                <TableHead className="w-20 font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-2 text-right sticky top-0 bg-secondary/90">20%</TableHead>
                                <TableHead className="w-20 font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-2 text-right sticky top-0 bg-secondary/90">35%</TableHead>
                                <TableHead className="w-20 font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-2 text-right sticky top-0 bg-secondary/90">House Rent</TableHead>
                                <TableHead className="w-20 font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-2 text-right sticky top-0 bg-secondary/90">Conveyance</TableHead>
                                <TableHead className="w-20 font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-2 text-right sticky top-0 bg-secondary/90">ADH1</TableHead>
                                <TableHead className="w-20 font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-2 text-right sticky top-0 bg-secondary/90">ADH2</TableHead>
                                <TableHead className="w-20 font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-2 text-right sticky top-0 bg-secondary/90">ADH3</TableHead>
                                <TableHead className="w-20 font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-2 text-right sticky top-0 bg-secondary/90">Allowance</TableHead>
                                <TableHead className="w-20 font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-2 text-right sticky top-0 bg-secondary/90">Allowances</TableHead>
                                <TableHead className="w-28 font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-2 text-right sticky top-0 bg-secondary/90">Evening Salary</TableHead>
                                <TableHead className="w-24 font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-2 text-right sticky top-0 bg-secondary/90">Provident</TableHead>
                                <TableHead className="w-20 font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-3.5 px-2 text-right sticky top-0 bg-secondary/90">EOBI</TableHead>

                                {/* Gross Pay */}
                                <TableHead className="w-28 font-bold text-[11px] uppercase tracking-wider text-primary py-3.5 px-3 text-right sticky top-0 bg-secondary/90">Gross Pay</TableHead>

                                {/* Deductions */}
                                <TableHead className="w-24 font-bold text-[11px] uppercase tracking-wider text-rose-600 dark:text-rose-400 py-3.5 px-2 text-right sticky top-0 bg-secondary/90">D.Provident</TableHead>
                                <TableHead className="w-20 font-bold text-[11px] uppercase tracking-wider text-rose-600 dark:text-rose-400 py-3.5 px-2 text-right sticky top-0 bg-secondary/90">D.EOBI</TableHead>
                                <TableHead className="w-20 font-bold text-[11px] uppercase tracking-wider text-rose-600 dark:text-rose-400 py-3.5 px-2 text-right sticky top-0 bg-secondary/90">D.Advance</TableHead>
                                <TableHead className="w-20 font-bold text-[11px] uppercase tracking-wider text-rose-600 dark:text-rose-400 py-3.5 px-2 text-right sticky top-0 bg-secondary/90">D.Loan</TableHead>
                                <TableHead className="w-20 font-bold text-[11px] uppercase tracking-wider text-rose-600 dark:text-rose-400 py-3.5 px-2 text-right sticky top-0 bg-secondary/90">D.Tax</TableHead>
                                <TableHead className="w-20 font-bold text-[11px] uppercase tracking-wider text-rose-600 dark:text-rose-400 py-3.5 px-2 text-right sticky top-0 bg-secondary/90">D.Lvs</TableHead>

                                {/* Net Pay */}
                                <TableHead className="w-32 font-bold text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-400 py-3.5 px-3 text-right sticky top-0 bg-secondary/90">Net Pay</TableHead>

                                {/* Employer / School Shares after Net Pay */}
                                <TableHead className="w-28 font-bold text-[11px] uppercase tracking-wider text-sidebar dark:text-sidebar py-3.5 px-2 text-right sticky top-0 bg-secondary/90">PF School Share</TableHead>
                                <TableHead className="w-28 font-bold text-[11px] uppercase tracking-wider text-sidebar dark:text-sidebar py-3.5 px-2 text-right sticky top-0 bg-secondary/90">EOBI School Share</TableHead>

                                <TableHead className="w-12 py-3.5 px-2 text-center sticky top-0 bg-secondary/90"></TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={28} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                            <span className="text-xs text-muted-foreground font-medium">Loading salary breakup records...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={28} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                                            <Layers className="w-8 h-8 text-muted-foreground/50" />
                                            <p className="text-sm font-semibold text-foreground">No records loaded</p>
                                            <p className="text-xs">Select a Salary Category above or click &quot;+ Add Employee (F1)&quot; to begin.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRows.map((row) => {
                                    const actualIndex = row.srNo - 1;
                                    return (
                                        <TableRow key={row.srNo} className="hover:bg-muted/50 transition-colors border-border">
                                            {/* Sr No */}
                                            <TableCell className="py-2 px-3 text-center font-sans text-xs text-muted-foreground">
                                                {row.srNo}
                                            </TableCell>

                                            {/* Card No */}
                                            <TableCell className="py-2 px-2">
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        value={row.empCardNo}
                                                        onChange={(e) =>
                                                            handleCellChange(
                                                                actualIndex,
                                                                "empCardNo",
                                                                e.target.value ? Number(e.target.value) : ""
                                                            )
                                                        }
                                                        className="h-8 text-xs font-sans font-semibold px-1 text-center w-16 bg-background/50 border-border"
                                                        placeholder="Card #"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        type="button"
                                                        onClick={() => {
                                                            setTargetRowIndex(actualIndex);
                                                            setIsEmpModalOpen(true);
                                                        }}
                                                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground shrink-0"
                                                        title="Search Employee (F1)"
                                                    >
                                                        <Search className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>

                                            {/* Employee Name */}
                                            <TableCell className="py-2 px-2">
                                                <Input
                                                    type="text"
                                                    value={row.name}
                                                    onChange={(e) =>
                                                        handleCellChange(actualIndex, "name", e.target.value)
                                                    }
                                                    className="h-8 text-xs font-medium px-2 min-w-[170px] bg-background/50 border-border"
                                                    placeholder="Employee Name"
                                                />
                                            </TableCell>

                                            {/* Basic Pay */}
                                            <TableCell className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    value={row.basicPay || ""}
                                                    onChange={(e) =>
                                                        handleCellChange(actualIndex, "basicPay", Number(e.target.value || 0))
                                                    }
                                                    className="h-8 text-xs text-right font-sans font-semibold text-foreground w-24 bg-background/50 border-border"
                                                />
                                            </TableCell>

                                            {/* 20% */}
                                            <TableCell className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    value={row.twentyPerc || ""}
                                                    onChange={(e) =>
                                                        handleCellChange(actualIndex, "twentyPerc", Number(e.target.value || 0))
                                                    }
                                                    className="h-8 text-xs text-right font-sans w-20 bg-background/50 border-border"
                                                />
                                            </TableCell>

                                            {/* 35% */}
                                            <TableCell className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    value={row.thirtyFivePerc || ""}
                                                    onChange={(e) =>
                                                        handleCellChange(actualIndex, "thirtyFivePerc", Number(e.target.value || 0))
                                                    }
                                                    className="h-8 text-xs text-right font-sans w-20 bg-background/50 border-border"
                                                />
                                            </TableCell>

                                            {/* House Rent */}
                                            <TableCell className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    value={row.houseRent || ""}
                                                    onChange={(e) =>
                                                        handleCellChange(actualIndex, "houseRent", Number(e.target.value || 0))
                                                    }
                                                    className="h-8 text-xs text-right font-sans w-20 bg-background/50 border-border"
                                                />
                                            </TableCell>

                                            {/* Conveyance */}
                                            <TableCell className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    value={row.conveyance || ""}
                                                    onChange={(e) =>
                                                        handleCellChange(actualIndex, "conveyance", Number(e.target.value || 0))
                                                    }
                                                    className="h-8 text-xs text-right font-sans w-20 bg-background/50 border-border"
                                                />
                                            </TableCell>

                                            {/* ADH1 */}
                                            <TableCell className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    value={row.adh1 || ""}
                                                    onChange={(e) =>
                                                        handleCellChange(actualIndex, "adh1", Number(e.target.value || 0))
                                                    }
                                                    className="h-8 text-xs text-right font-sans w-20 bg-background/50 border-border"
                                                />
                                            </TableCell>

                                            {/* ADH2 */}
                                            <TableCell className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    value={row.adh2 || ""}
                                                    onChange={(e) =>
                                                        handleCellChange(actualIndex, "adh2", Number(e.target.value || 0))
                                                    }
                                                    className="h-8 text-xs text-right font-sans w-20 bg-background/50 border-border"
                                                />
                                            </TableCell>

                                            {/* ADH3 */}
                                            <TableCell className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    value={row.adh3 || ""}
                                                    onChange={(e) =>
                                                        handleCellChange(actualIndex, "adh3", Number(e.target.value || 0))
                                                    }
                                                    className="h-8 text-xs text-right font-sans w-20 bg-background/50 border-border"
                                                />
                                            </TableCell>

                                            {/* Allowance */}
                                            <TableCell className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    value={row.allowance || ""}
                                                    onChange={(e) =>
                                                        handleCellChange(actualIndex, "allowance", Number(e.target.value || 0))
                                                    }
                                                    className="h-8 text-xs text-right font-sans w-20 bg-background/50 border-border"
                                                />
                                            </TableCell>

                                            {/* Allowances */}
                                            <TableCell className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    value={row.allowances || ""}
                                                    onChange={(e) =>
                                                        handleCellChange(actualIndex, "allowances", Number(e.target.value || 0))
                                                    }
                                                    className="h-8 text-xs text-right font-sans w-20 bg-background/50 border-border"
                                                />
                                            </TableCell>

                                            {/* Evening Salary */}
                                            <TableCell className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    value={row.twentyPerc1 || ""}
                                                    onChange={(e) =>
                                                        handleCellChange(actualIndex, "twentyPerc1", Number(e.target.value || 0))
                                                    }
                                                    className="h-8 text-xs text-right font-sans w-20 bg-background/50 border-border"
                                                />
                                            </TableCell>

                                            {/* Provident Fund */}
                                            <TableCell className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    value={row.providentFund || ""}
                                                    onChange={(e) =>
                                                        handleCellChange(actualIndex, "providentFund", Number(e.target.value || 0))
                                                    }
                                                    className="h-8 text-xs text-right font-sans w-24 bg-background/50 border-border"
                                                />
                                            </TableCell>

                                            {/* EOBI */}
                                            <TableCell className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    value={row.eobi || ""}
                                                    onChange={(e) =>
                                                        handleCellChange(actualIndex, "eobi", Number(e.target.value || 0))
                                                    }
                                                    className="h-8 text-xs text-right font-sans w-20 bg-background/50 border-border"
                                                />
                                            </TableCell>

                                            {/* Gross Pay */}
                                            <TableCell className="py-2 px-3 text-right font-sans font-bold text-foreground bg-secondary/30">
                                                {row.grossPay.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>

                                            {/* D.Provident Fund */}
                                            <TableCell className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    value={row.d_ProvidentFund || ""}
                                                    onChange={(e) =>
                                                        handleCellChange(actualIndex, "d_ProvidentFund", Number(e.target.value || 0))
                                                    }
                                                    className="h-8 text-xs text-right font-sans text-rose-600 dark:text-rose-400 w-24 bg-background/50 border-border"
                                                />
                                            </TableCell>

                                            {/* D.EOBI */}
                                            <TableCell className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    value={row.d_EOBI || ""}
                                                    onChange={(e) =>
                                                        handleCellChange(actualIndex, "d_EOBI", Number(e.target.value || 0))
                                                    }
                                                    className="h-8 text-xs text-right font-sans text-rose-600 dark:text-rose-400 w-20 bg-background/50 border-border"
                                                />
                                            </TableCell>

                                            {/* D.Advance */}
                                            <TableCell className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    value={row.d_Advance || ""}
                                                    onChange={(e) =>
                                                        handleCellChange(actualIndex, "d_Advance", Number(e.target.value || 0))
                                                    }
                                                    className="h-8 text-xs text-right font-sans text-rose-600 dark:text-rose-400 w-20 bg-background/50 border-border"
                                                />
                                            </TableCell>

                                            {/* D.Loan */}
                                            <TableCell className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    value={row.d_Loan || ""}
                                                    onChange={(e) =>
                                                        handleCellChange(actualIndex, "d_Loan", Number(e.target.value || 0))
                                                    }
                                                    className="h-8 text-xs text-right font-sans text-rose-600 dark:text-rose-400 w-20 bg-background/50 border-border"
                                                />
                                            </TableCell>

                                            {/* D.Tax */}
                                            <TableCell className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    value={row.d_Tax || ""}
                                                    onChange={(e) =>
                                                        handleCellChange(actualIndex, "d_Tax", Number(e.target.value || 0))
                                                    }
                                                    className="h-8 text-xs text-right font-sans text-rose-600 dark:text-rose-400 w-20 bg-background/50 border-border"
                                                />
                                            </TableCell>

                                            {/* D.Lvs */}
                                            <TableCell className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    value={row.d_Lvs || ""}
                                                    onChange={(e) =>
                                                        handleCellChange(actualIndex, "d_Lvs", Number(e.target.value || 0))
                                                    }
                                                    className="h-8 text-xs text-right font-sans text-rose-600 dark:text-rose-400 w-20 bg-background/50 border-border"
                                                />
                                            </TableCell>

                                            {/* Net Pay */}
                                            <TableCell className="py-2 px-3 text-right font-sans font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10">
                                                {row.netPay.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>

                                            {/* PF School Share */}
                                            <TableCell className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    value={row.pfSchoolShare || ""}
                                                    onChange={(e) =>
                                                        handleCellChange(actualIndex, "pfSchoolShare", Number(e.target.value || 0))
                                                    }
                                                    className="h-8 text-xs text-right font-sans font-semibold text-sidebar dark:text-sidebar w-24 bg-background/50 border-border"
                                                    placeholder="0"
                                                />
                                            </TableCell>

                                            {/* EOBI School Share */}
                                            <TableCell className="py-2 px-1">
                                                <Input
                                                    type="number"
                                                    value={row.eobiSchoolShare || ""}
                                                    onChange={(e) =>
                                                        handleCellChange(actualIndex, "eobiSchoolShare", Number(e.target.value || 0))
                                                    }
                                                    className="h-8 text-xs text-right font-sans font-semibold text-sidebar dark:text-sidebar w-24 bg-background/50 border-border"
                                                    placeholder="0"
                                                />
                                            </TableCell>

                                            {/* Delete Row Action */}
                                            <TableCell className="py-2 px-2 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    type="button"
                                                    onClick={() => handleRemoveRow(actualIndex)}
                                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </motion.div>
            </div>

            {/* Employee Select Modal (F1 Shortcut) */}
            <EmployeeSelectModal
                isOpen={isEmpModalOpen}
                onClose={() => setIsEmpModalOpen(false)}
                onSelect={handleModalSelectEmployee}
            />
        </div>
    );
}
