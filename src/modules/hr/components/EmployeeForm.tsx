import { useState, useEffect, useRef, useMemo, memo } from "react";
import { useForm, Controller, useWatch, Control, UseFormRegister, UseFormSetValue } from "react-hook-form";
import {
    Save,
    Upload,
    Plus,
    User,
    CircleDollarSign,
    GraduationCap,
    History,
    Users2,
    FileText,
    FileUp,
    Search,
    Loader2,
    Camera,
    Download
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/shared/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/shared/components/ui/tabs";
import { Textarea } from "@/shared/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/shared/components/ui/dialog";
import { useToast } from "@/shared/components/ui/use-toast";
import { employeeService, Employee, splitCleanName } from "../services/employeeService";
import { authService } from "@/modules/auth/services/authService";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { departmentService, Department } from "../services/departmentService";
import { designationService, Designation } from "../services/designationService";
import { hrBankService, HRBank } from "../services/hrBankService";
import { scaleService, Scale } from "../services/scaleService";
import { shiftService, Shift } from "../services/shiftService";
import { categoryService, Category } from "../services/categoryService";
import { statusService, Status } from "../services/statusService";
import { gradeService, Grade } from "../services/gradeService";
import { locationService, Location } from "../services/locationService";
import { EmployeeEducation } from "./EmployeeEducation";
import { EmployeeHistory } from "./EmployeeHistory";
import { EmployeeNextToKin } from "./EmployeeNextToKin";
import { EmployeeJobDescription } from "./EmployeeJobDescription";
import { EmployeeScanDocuments } from "./EmployeeScanDocuments";
import { formatRestDaySchedule, getRestDayIndexes, REST_DAYS } from "../utils/restDaySchedule";

interface EmployeeFormProps {
    employee: Employee | null;
    isOpen: boolean;
    onClose: () => void;
    initialReadOnly?: boolean;
}

// Define comprehensive default values to avoid uncontrolled input warnings
const defaultEmployeeValues: Partial<Employee> = {
    empCardNo: 0,
    site: "",
    unit: "",
    shift: "",
    gradeName: "",
    empOldNo: "",
    empPrefix: "Mr",
    empName: "",
    firstName: "",
    middleName: "",
    lastName: "",
    empFatherName: "",
    employeeUnit: "",
    city: "",
    region: "",
    bankId: 0,
    bankName: "",
    bankAccount: "",
    dependents: "",
    section: "",
    salaryUnit: "",
    empMotherName: "",
    departmentCode: "",
    designationCode: 0,
    qualification: "",
    certification: "",
    experience: "",
    experience2: "",
    temporaryAddress: "",
    permanentAddress: "",
    emailPersonal: "",
    emailCompany: "",
    employeeCategory: "",
    bankId: 0,
    bankName: "",
    gender: "Male",
    maritalStatus: "Single",
    phoneNo: "",
    extensionNo: "",
    joiningDate: "",
    idCardIssueDate: "",
    timeInDefine: "",
    timeOutDefine: "",
    reportingTimingDefine: "",
    ramzanTimeInDefine: "",
    workingHours: 0,
    contractExpiryDate: "",
    employmentStatus: "",
    scale: "",
    bankAccount: "",
    cnicNo: "",
    bloodGroup: "",
    emergencyNo: "",
    birthDate: "",
    confirmationDate: "",
    cardExpiryDate: "",
    ramzanTimeOutDefine: "",
    ramzanWorkingHours: 0,
    religion: "",
    restDay: "Sunday",
    isHod: false,
    status: true, // Default active
    eobiStatus: false,
    socialSecurityStatus: false,
    overTimeStatus: false,
    complianceStatus: false,
    relaxationTime: 0,
    specialDutyStatus: false,
    outdoorDutyStatus: false,
    singleMachineStatus: false,
    dualMachineStatus: false,
    accomodation: false,
    bonus: false,
    securityDeduction: false,
    bankSalaryStatus: false,
    empPicture: "",
    salary: {
        grossPay: 0,
        basicPay: 0,
        startingPay: 0,
        salLec: 0,
        pfSchoolShare: 0,
        eobiSchoolShare: 0,
        // Initialize allowances/deductions to 0 to be safe
        a01: 0, a02: 0, a03: 0, a04: 0, a05: 0, a06: 0, a07: 0, a08: 0, a09: 0, a10: 0, a11: 0, a12: 0,
        d01: 0, d02: 0, d03: 0, d04: 0, d05: 0, d06: 0, d07: 0, d08: 0, d09: 0, d10: 0, d11: 0, d12: 0,
        d13: 0, d14: 0, d15: 0, d16: 0, d17: 0, d18: 0, d19: 0, d20: 0, d21: 0, d22: 0,
        netPay: 0
    },
    educations: [],
    histories: [],
    nextToKins: [],
    scanDocuments: [],
    jobDescription: {},
    passportNumber: "",
    policeVerification: "",
    cnicImage: "",
    category: ""
};

const formatTimeForInput = (timeStr?: string | null): string => {
    if (!timeStr) return "";
    const str = timeStr.trim();
    if (!str) return "";
    if (/^\d{2}:\d{2}$/.test(str)) return str;
    if (/^\d{1}:\d{2}$/.test(str)) return `0${str}`;

    const match = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
    if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const modifier = match[3]?.toUpperCase();

        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    return "";
};

const formatDateForInput = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "";
        return date.toISOString().split('T')[0];
    } catch (e) {
        return "";
    }
};

const addMonthsToDateInput = (dateStr: string, months: number) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return "";
    const target = new Date(y, m - 1 + months, 1);
    const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    target.setDate(Math.min(d, lastDay));
    return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-${String(target.getDate()).padStart(2, "0")}`;
};

const formatCNICValue = (value: string) => {
    // Keep only numbers
    const numbers = (value || "").replace(/\D/g, "").slice(0, 13);

    // Apply mask 38101-5858923-7 (5-7-1)
    if (numbers.length <= 5) return numbers;
    if (numbers.length <= 12) return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 12)}-${numbers.slice(12, 13)}`;
};

const isFemaleGender = (g?: string | null) => {
    if (!g) return false;
    const str = g.toString().trim().toLowerCase();
    return str === "female" || str === "f" || str === "2";
};

const isMarriedStatus = (m?: string | null) => {
    if (!m) return false;
    const str = m.toString().trim().toLowerCase();
    return str === "married";
};

// --- Optimized Sub-Components ---

const ProfilePicturePreview = ({ control, label, employee }: { control: Control<Employee>, label: string, employee: Employee | null }) => {
    const value = useWatch({ control, name: "empPicture" });
    const userSite = authService.getSite();

    const imageUrl = useMemo(() => {
        const pic = value || employee?.empPicture;
        if (pic) {
            if (pic.startsWith('data:') || pic.startsWith('http')) return pic;
            return `data:image/jpeg;base64,${pic}`;
        }
        if (employee?.empCardNo) return employeeService.getPictureUrl(employee.empCardNo, userSite);
        return null;
    }, [value, employee, userSite]);

    const handleDownload = () => {
        if (!imageUrl) return;
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = `employee_${employee?.empCardNo || 'new'}_${label.replace(/\s+/g, '_').toLowerCase()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">{label}</Label>
            <div className="w-44 h-52 bg-secondary/50 rounded-lg flex items-center justify-center border-2 border-dashed border-border overflow-hidden relative shadow-inner group">
                {imageUrl ? (
                    <>
                        <img src={imageUrl} className="w-full h-full object-cover" alt={label} key={imageUrl} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full"
                                onClick={handleDownload}
                                title="Download Image"
                            >
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <User className="w-12 h-12 text-muted-foreground opacity-20" />
                )}
            </div>
        </div>
    );
};

const DocumentPreview = ({ control, name, label, icon: Icon, employee }: { control: Control<Employee>, name: "cnicImage" | "policeVerification", label: string, icon: any, employee: Employee | null }) => {
    const value = useWatch({ control, name });
    const userSite = authService.getSite();

    const isPdf = value?.startsWith('JVBERi') || value?.startsWith('data:application/pdf');

    const imageUrl = useMemo(() => {
        if (value) return value.startsWith('data:') ? value : `data:image/jpeg;base64,${value}`;
        if (employee?.empCardNo) {
            return name === "cnicImage"
                ? employeeService.getCnicImageUrl(employee.empCardNo, userSite)
                : employeeService.getPoliceVerificationUrl(employee.empCardNo, userSite);
        }
        return null;
    }, [value, employee, userSite, name]);

    const handleDownload = () => {
        if (!imageUrl) return;
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = `employee_${employee?.empCardNo || 'new'}_${label.replace(/\s+/g, '_').toLowerCase()}.${isPdf ? 'pdf' : 'jpg'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground">{label}</Label>
            <div className="w-44 h-32 bg-secondary/50 rounded-lg flex items-center justify-center border-2 border-dashed border-border overflow-hidden relative shadow-inner group">
                {imageUrl ? (
                    <>
                        {isPdf ? (
                            <div className="flex flex-col items-center gap-1">
                                <FileText className="w-10 h-10 text-primary" />
                                <span className="text-[10px] font-bold">PDF Document</span>
                            </div>
                        ) : (
                            <img src={imageUrl} className="w-full h-full object-cover" alt={label} key={imageUrl} />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full"
                                onClick={handleDownload}
                                title="Download Document"
                            >
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <Icon className="w-10 h-10 text-muted-foreground opacity-20" />
                )}
            </div>
        </div>
    );
};

const MemoizedCheckboxes = memo(({ control, isReadOnly }: { control: Control<Employee>; isReadOnly: boolean }) => {
    return (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
            <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Religion</Label>
                <Controller name="religion" control={control} render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Islam">Islam</SelectItem>
                            <SelectItem value="Christion Catholic">Christion Catholic</SelectItem>
                            <SelectItem value="Christion Non Catholic">Christion Non Catholic</SelectItem>
                            <SelectItem value="Any Other">Any Other</SelectItem>
                        </SelectContent>
                    </Select>
                )} />
            </div>

            <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Weekly Rest Days</Label>
                <Controller name="restDay" control={control} render={({ field }) => {
                    const selectedDays = getRestDayIndexes(field.value || "Sunday");
                    // Only Sunday (0) and Saturday (6) allowed, mapping hr/rest-day weekly logic
                    const allowedDays = [
                        { name: "Sunday", index: 0 },
                        { name: "Saturday", index: 6 }
                    ];

                    return (
                        <div className="rounded-md border border-border bg-background p-3 space-y-2">
                            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                                {allowedDays.map(({ name, index }) => {
                                    const checked = selectedDays.includes(index);
                                    return (
                                        <label key={name} className="flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
                                            <Checkbox
                                                checked={checked}
                                                disabled={isReadOnly}
                                                onCheckedChange={(nextChecked) => {
                                                    const next = new Set(selectedDays);
                                                    if (nextChecked === true) {
                                                        next.add(index);
                                                    } else {
                                                        next.delete(index);
                                                    }
                                                    // Default is Sunday if neither is checked
                                                    if (next.size === 0) {
                                                        next.add(0);
                                                    }
                                                    field.onChange(
                                                        Array.from(next)
                                                            .sort((a, b) => a - b)
                                                            .map((idx) => REST_DAYS[idx])
                                                            .join(", ")
                                                    );
                                                }}
                                            />
                                            {name}
                                        </label>
                                    );
                                })}
                            </div>
                            <p className="text-[10px] text-muted-foreground">Select weekly rest days (default is Sunday).</p>
                        </div>
                    );
                }} />
            </div>

            <div className="grid grid-cols-2 gap-y-3 pt-2">
                {[
                    { id: 'eobiStatus', label: 'E.O.B.I' },
                    { id: 'socialSecurityStatus', label: 'Social Security' },
                    { id: 'overTimeStatus', label: 'Overtime' },
                    // { id: 'complianceStatus', label: 'Compliance' },
                    // { id: 'specialDutyStatus', label: 'Special Duty' },
                    // { id: 'outdoorDutyStatus', label: 'Out Door Duty' },
                    // { id: 'singleMachineStatus', label: 'Single Machine' },
                    // { id: 'dualMachineStatus', label: 'Dual Machine' },
                    // { id: 'accomodation', label: 'Accommodation' },
                    // { id: 'bonus', label: 'Bonus' },
                    // { id: 'securityDeduction', label: 'Security Ded.' },
                    { id: 'bankSalaryStatus', label: 'Bank Salary' }
                ].map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                        <Controller name={item.id as keyof Employee} control={control} render={({ field }) => (
                            <Checkbox id={item.id} checked={!!field.value} onCheckedChange={field.onChange} />
                        )} />
                        <Label htmlFor={item.id} className="text-[11px] font-medium leading-none cursor-pointer">{item.label}</Label>
                    </div>
                ))}
            </div>
        </div>
    );
});

const SalaryBreakupSection = memo(({ register, control, setValue, createMode }: { register: UseFormRegister<Employee>, control: Control<Employee>, setValue: (name: any, value: any, options?: any) => void, createMode: boolean }) => {
    const salary = useWatch({ control, name: "salary" });

    const { calculatedGross, calculatedNetPay } = useMemo(() => {
        if (!salary) return { calculatedGross: 0, calculatedNetPay: 0 };
        if (createMode) {
            const gross = Math.round(Number(salary.grossPay) || 0);
            let additions = 0;
            for (let i = 4; i <= 11; i++) {
                const key = `a${i.toString().padStart(2, '0')}` as keyof typeof salary;
                additions += Number(salary[key]) || 0;
            }
            let deductions = 0;
            for (let i = 1; i <= 11; i++) {
                const key = `d${i.toString().padStart(2, '0')}` as keyof typeof salary;
                deductions += Number(salary[key]) || 0;
            }
            return { calculatedGross: gross, calculatedNetPay: Math.round(gross + additions - deductions) };
        }

        const basic = Number(salary.basicPay) || 0;

        let totalAllowances = 0;
        for (let i = 1; i <= 12; i++) {
            const key = `a${i.toString().padStart(2, '0')}` as keyof typeof salary;
            totalAllowances += Number(salary[key]) || 0;
        }

        const gross = Math.round(basic + totalAllowances);

        let totalDeductions = 0;
        for (let i = 1; i <= 22; i++) {
            const key = `d${i.toString().padStart(2, '0')}` as keyof typeof salary;
            totalDeductions += Number(salary[key]) || 0;
        }

        const net = Math.round(gross - totalDeductions);
        return { calculatedGross: gross, calculatedNetPay: net };
    }, [salary, createMode]);

    useEffect(() => {
        if (createMode && salary) {
            const gross = Number(salary.grossPay) || 0;
            const conveyance = Number(salary.a03) || 0;
            const basic = gross >= conveyance && gross > 0 ? Math.round((gross - conveyance) / 1.55) : 0;
            const houseRent = Math.round(basic * 0.45);
            const utility = gross >= conveyance && gross > 0 ? gross - basic - houseRent - conveyance : 0;
            if (Number(salary.basicPay) !== basic) setValue("salary.basicPay", basic, { shouldDirty: true });
            if (Number(salary.a01) !== houseRent) setValue("salary.a01", houseRent, { shouldDirty: true });
            if (Number(salary.a02) !== utility) setValue("salary.a02", utility, { shouldDirty: true });
        }
        if (!createMode && calculatedGross > 0 && Number(salary?.grossPay) !== calculatedGross) {
            setValue('salary.grossPay', calculatedGross, { shouldDirty: true });
        }
        if (Number(salary?.netPay) !== calculatedNetPay) {
            setValue('salary.netPay', calculatedNetPay, { shouldDirty: true });
        }
    }, [calculatedGross, calculatedNetPay, createMode, salary, setValue]);

    const allowanceList: { key: string; label: string; isBasic?: boolean; isCalculated?: boolean }[] = createMode ? [
        { key: 'basicPay', label: 'Basic Pay', isBasic: true },
        { key: 'a01', label: 'House Rent Allowance', isCalculated: true },
        { key: 'a02', label: 'Utility Allowance', isCalculated: true },
        { key: 'a03', label: 'Conveyance Allowance' },
        { key: 'a04', label: 'Mobile Allowance' },
        { key: 'a05', label: 'Fuel Allowance' },
        { key: 'a06', label: 'Arrears' },
        { key: 'a07', label: 'Others' },
    ] : [
        { key: 'basicPay', label: 'Basic Pay', isBasic: true },
        { key: 'a01', label: 'Arrears' },
        { key: 'a02', label: '35 %' },
        { key: 'a03', label: 'House Rent' },
        { key: 'a04', label: 'Conveyance' },
        { key: 'a05', label: 'ADH 1' },
        { key: 'a06', label: 'ADH 2' },
        { key: 'a07', label: 'ADH 3' },
        { key: 'a08', label: 'Evening Shift' },
        { key: 'a09', label: 'Evening Salary' },
        { key: 'a10', label: 'Provident Fund' },
        { key: 'a11', label: 'EOBI' },
        { key: 'a12', label: 'Allowances' },
    ];

    const deductionList = createMode ? [
        { key: 'd01', label: 'Income Tax' },
        { key: 'd02', label: 'E.O.B.I' },
        { key: 'd03', label: 'Advance Salary' },
        { key: 'd04', label: 'Loan To Staff' },
        { key: 'd05', label: 'Fine' },
        { key: 'd06', label: 'Mess' },
        { key: 'd07', label: 'Transport' },
        { key: 'd08', label: 'Others' },
    ] : [
        { key: 'd01', label: 'Provident Fund' },
        { key: 'd02', label: 'E.O.B.I' },
        { key: 'd03', label: 'Salary Advance' },
        { key: 'd04', label: 'Loan' },
        { key: 'd05', label: 'Tax' },
        { key: 'd06', label: 'Invs' },
    ];

    return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6 max-w-5xl mx-auto">
            {/* Top Bar: Gross Pay and Net Salary */}
            <div className="grid grid-cols-2 gap-8 pb-4 border-b border-border">
                {/* Left Top */}
                <div className="space-y-4">
                    {/* Employee Category commented out for now as requested
                    <div className="flex items-center justify-between gap-4">
                        <Label className="text-xs font-bold text-foreground min-w-[140px]">Employee Category :</Label>
                        <Controller name="category" control={control} render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="h-9 w-48"><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Management">Management</SelectItem>
                                    <SelectItem value="Non-Management">Non-Management</SelectItem>
                                </SelectContent>
                            </Select>
                        )} />
                    </div>
                    */}
                    <div className="flex items-center justify-between gap-4">
                        <Label className="text-xs font-bold text-foreground min-w-[140px]">Gross Pay</Label>
                        <Input
                            type="number"
                            min={createMode ? 300 : undefined}
                            step="0.01"
                            className="h-9 w-48 font-bold text-right font-sans"
                            {...register('salary.grossPay', { valueAsNumber: true })}
                        />
                    </div>
                </div>

                {/* Right Top */}
                <div className="space-y-4">
                    {!createMode && (
                        <div className="flex items-center justify-between gap-4">
                            <Label className="text-xs font-bold text-foreground min-w-[140px]">Sal/Lec</Label>
                            <Input
                                type="number"
                                step="0.01"
                                className="h-9 w-48 text-right font-sans"
                                {...register('salary.salLec', { valueAsNumber: true })}
                            />
                        </div>
                    )}
                    <div className="flex items-center justify-between gap-4">
                        <Label className="text-xs font-bold text-foreground min-w-[140px]">Net Salary</Label>
                        <Input
                            type="number"
                            readOnly
                            value={calculatedNetPay}
                            className="h-9 w-48 font-black text-right font-sans bg-muted/50 text-foreground"
                        />
                        <input type="hidden" {...register('salary.netPay')} value={calculatedNetPay} />
                    </div>
                </div>
            </div>

            {/* Bottom 2 Columns: Allowances & Deductions */}
            <div className="grid grid-cols-2 gap-8">
                {/* Allowances Box */}
                <div className="border border-border/80 rounded-xl p-5 bg-card/50 space-y-3">
                    <h4 className="text-sm font-bold text-foreground mb-4">Allowances</h4>
                    <div className="space-y-2.5">
                        {allowanceList.map((item) => (
                            <div key={item.key} className="flex items-center justify-between gap-4">
                                <Label className="text-xs font-medium text-foreground">{item.label}</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    readOnly={createMode && (item.isBasic || item.isCalculated)}
                                    className={`h-8 w-36 text-right font-sans ${item.isBasic ? 'font-bold border-primary/40' : ''} ${createMode && (item.isBasic || item.isCalculated) ? 'bg-muted/50' : ''}`}
                                    {...register(`salary.${item.key}` as any, { valueAsNumber: true })}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Deductions Box */}
                <div className="border border-border/80 rounded-xl p-5 bg-card/50 space-y-3 flex flex-col justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-foreground mb-4">Deductions</h4>
                        <div className="space-y-2.5">
                            {deductionList.map((item) => (
                                <div key={item.key} className="flex items-center justify-between gap-4">
                                    <Label className="text-xs font-medium text-foreground">{item.label}</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        className="h-8 w-36 text-right font-sans"
                                        {...register(`salary.${item.key}` as any, { valueAsNumber: true })}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {!createMode && (
                        <div className="pt-6 mt-4 border-t border-border/60 space-y-2.5">
                            <div className="flex items-center justify-between gap-4">
                                <Label className="text-xs font-medium text-foreground">PF School Share</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    className="h-8 w-36 text-right font-sans"
                                    {...register('salary.pfSchoolShare', { valueAsNumber: true })}
                                />
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <Label className="text-xs font-medium text-foreground">EOBI School Share</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    className="h-8 w-36 text-right font-sans"
                                    {...register('salary.eobiSchoolShare', { valueAsNumber: true })}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

interface EmployeeCreateFieldsProps {
    register: UseFormRegister<Employee>;
    control: Control<Employee>;
    setValue: UseFormSetValue<Employee>;
    confirmationEdited: React.MutableRefObject<boolean>;
    categories: Category[];
    departments: Department[];
    designations: Designation[];
    banks: HRBank[];
    bankLookupError?: unknown;
    shifts: Shift[];
    statuses: Status[];
    lookupErrors: string[];
    onPictureUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onStartCamera: () => void;
}

const EmployeeCreateFields = ({
    register,
    control,
    setValue,
    confirmationEdited,
    categories,
    departments,
    designations,
    banks,
    bankLookupError,
    shifts,
    statuses,
    lookupErrors,
    onPictureUpload,
    onStartCamera,
}: EmployeeCreateFieldsProps) => {
    const pictureRef = useRef<HTMLInputElement>(null);
    const [openSelect, setOpenSelect] = useState<string | null>(null);
    const selectOpenProps = (name: string) => ({
        open: openSelect === name,
        onOpenChange: (open: boolean) => setOpenSelect((current) => {
            if (open) return name;
            return current === name ? null : current;
        }),
    });

    return (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_240px]">
            {lookupErrors.length > 0 && (
                <p role="alert" className="text-sm text-destructive xl:col-span-2">
                    Required employee lookups could not be loaded: {lookupErrors.join(", ")}. Refresh and try again.
                </p>
            )}
            <div className="space-y-8">
                <section className="space-y-4 border-b border-border pb-6">
                    <h2 className="text-sm font-bold">Personal Information</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div className="space-y-1.5">
                            <Label>Emp. ID</Label>
                            <Input {...register("empCardNo")} readOnly className="bg-muted/40 font-semibold" />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <Label>Employee Name <span className="text-destructive">*</span></Label>
                            <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-2">
                                <Controller name="empPrefix" control={control} render={({ field }) => (
                                    <Select {...selectOpenProps("empPrefix")} value={field.value || "Mr"} onValueChange={field.onChange}>
                                        <SelectTrigger><SelectValue placeholder="Prefix" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Mr">Mr</SelectItem>
                                            <SelectItem value="Ms">Ms</SelectItem>
                                            <SelectItem value="Mrs">Mrs</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )} />
                                <Input {...register("firstName", { required: true })} placeholder="Full name" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Father/Husband</Label>
                            <Input {...register("empFatherName")} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Gender</Label>
                            <Controller name="gender" control={control} render={({ field }) => (
                                <Select {...selectOpenProps("gender")} value={field.value || "Male"} onValueChange={field.onChange}>
                                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>CNIC <span className="text-destructive">*</span></Label>
                            <Controller name="cnicNo" control={control} rules={{ required: true }} render={({ field }) => (
                                <Input
                                    {...field}
                                    maxLength={15}
                                    placeholder="00000-0000000-0"
                                    onChange={(event) => field.onChange(formatCNICValue(event.target.value))}
                                />
                            )} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Date of Birth <span className="text-destructive">*</span></Label>
                            <Input type="date" {...register("birthDate", { required: true })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Marital Status</Label>
                            <Controller name="maritalStatus" control={control} render={({ field }) => (
                                <Select {...selectOpenProps("maritalStatus")} value={field.value || "Single"} onValueChange={field.onChange}>
                                    <SelectTrigger><SelectValue placeholder="Select marital status" /></SelectTrigger>
                                    <SelectContent>
                                        {["Single", "Married", "Widowed", "Divorced"].map((value) => (
                                            <SelectItem key={value} value={value}>{value}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Blood Group</Label>
                            <Controller name="bloodGroup" control={control} render={({ field }) => (
                                <Select {...selectOpenProps("bloodGroup")} value={field.value || ""} onValueChange={field.onChange}>
                                    <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                                    <SelectContent>
                                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((value) => (
                                            <SelectItem key={value} value={value}>{value}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Time In <span className="text-destructive">*</span></Label>
                            <Input type="time" {...register("timeInDefine", { required: true })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Time Out <span className="text-destructive">*</span></Label>
                            <Input type="time" {...register("timeOutDefine", { required: true })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Working Hours <span className="text-destructive">*</span></Label>
                            <Input type="number" min="0.25" step="0.25" {...register("workingHours", { required: true, valueAsNumber: true })} />
                        </div>
                    </div>
                </section>

                <section className="space-y-4 border-b border-border pb-6">
                    <h2 className="text-sm font-bold">Employment & Placement</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div className="space-y-1.5">
                            <Label>Emp Category <span className="text-destructive">*</span></Label>
                            <Controller name="category" control={control} rules={{ required: true }} render={({ field }) => (
                                <Select {...selectOpenProps("category")} value={field.value || ""} onValueChange={field.onChange}>
                                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.categoryNo} value={category.categoryName}>{category.categoryName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Region</Label>
                            <Input {...register("region")} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Department <span className="text-destructive">*</span></Label>
                            <Controller name="departmentCode" control={control} rules={{ required: true }} render={({ field }) => (
                                <Select {...selectOpenProps("department")} value={field.value?.toString() || ""} onValueChange={field.onChange}>
                                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                                    <SelectContent>
                                        {departments.map((department) => (
                                            <SelectItem key={department.code} value={department.code}>{department.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Designation <span className="text-destructive">*</span></Label>
                            <Controller name="designationCode" control={control} rules={{ required: true }} render={({ field }) => (
                                <Select {...selectOpenProps("designation")} value={field.value?.toString() || ""} onValueChange={(value) => field.onChange(Number(value))}>
                                    <SelectTrigger><SelectValue placeholder="Select designation" /></SelectTrigger>
                                    <SelectContent>
                                        {designations.map((designation) => (
                                            <SelectItem key={designation.designationCode} value={designation.designationCode.toString()}>{designation.designationName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Qualification</Label>
                            <Input {...register("qualification")} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Training/Certification</Label>
                            <Input {...register("certification")} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Experience Before C.P</Label>
                            <Input {...register("experience")} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Experience With C.P</Label>
                            <Input {...register("experience2")} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Shift</Label>
                            <Controller name="shift" control={control} render={({ field }) => (
                                <Select {...selectOpenProps("shift")} value={field.value || ""} onValueChange={field.onChange}>
                                    <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                                    <SelectContent>
                                        {shifts.map((shift) => (
                                            <SelectItem key={shift.shiftNo} value={shift.shiftType || shift.shiftName}>{shift.shiftName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Employee Status</Label>
                            <Controller name="employmentStatus" control={control} render={({ field }) => (
                                <Select {...selectOpenProps("employmentStatus")} value={field.value || ""} onValueChange={field.onChange}>
                                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((status) => (
                                            <SelectItem key={status.statusNo} value={status.statusName}>{status.statusName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>
                    </div>
                </section>

                <section className="space-y-4 border-b border-border pb-6">
                    <h2 className="text-sm font-bold">Schedule & Compliance</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div className="space-y-1.5">
                            <Label>Relaxation Time (minutes)</Label>
                            <Input type="number" min="0" step="1" {...register("relaxationTime", { valueAsNumber: true })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Rest Day</Label>
                            <Controller name="restDay" control={control} render={({ field }) => (
                                <Select {...selectOpenProps("restDay")} value={field.value || "Sunday"} onValueChange={field.onChange}>
                                    <SelectTrigger><SelectValue placeholder="Select rest day" /></SelectTrigger>
                                    <SelectContent>
                                        {REST_DAYS.map(({ name }) => (
                                            <SelectItem key={name} value={name}>{name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Date of Joining <span className="text-destructive">*</span></Label>
                            <Input
                                type="date"
                                {...register("joiningDate", {
                                    required: true,
                                    onChange: (event) => {
                                        if (!event.target.value || confirmationEdited.current) return;
                                        setValue("confirmationDate", addMonthsToDateInput(event.target.value, 6), { shouldDirty: true });
                                    },
                                })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Confirmation Date</Label>
                            <Input type="date" {...register("confirmationDate", { onChange: () => { confirmationEdited.current = true; } })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Contract Expiry Date</Label>
                            <Input type="date" {...register("contractExpiryDate")} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>C.N.I.C Expiry Date</Label>
                            <Input type="date" {...register("cardExpiryDate")} />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-3">
                        {[
                            { name: "eobiStatus" as const, label: "E.O.B.I" },
                            { name: "socialSecurityStatus" as const, label: "Social Security" },
                            { name: "overTimeStatus" as const, label: "Overtime" },
                            { name: "complianceStatus" as const, label: "Compliance" },
                        ].map(({ name, label }) => (
                            <label key={name} className="flex items-center gap-2 text-sm">
                                <Controller name={name} control={control} render={({ field }) => (
                                    <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                                )} />
                                {label}
                            </label>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label>E.O.B.I Number</Label>
                            <Input {...register("eobiNo")} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Social Security Number</Label>
                            <Input {...register("socialSecurityNo")} />
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-sm font-bold">Contact Information</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label>Email ID Personal</Label>
                            <Input type="email" {...register("emailPersonal")} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Email ID Official</Label>
                            <Input type="email" {...register("emailCompany")} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Phone No.</Label>
                            <Input {...register("phoneNo")} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Extension No.</Label>
                            <Input {...register("extensionNo")} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Emergency No.</Label>
                            <Input {...register("emergencyNo")} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>No Of Dependents</Label>
                            <Input type="number" min="0" step="1" {...register("dependents")} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Bank Name</Label>
                            <Controller name="bankId" control={control} render={({ field }) => (
                                <Select {...selectOpenProps("bank")} value={field.value ? String(field.value) : ""} onValueChange={(value) => field.onChange(Number(value))}>
                                    <SelectTrigger disabled={!!bankLookupError}><SelectValue placeholder="Select bank" /></SelectTrigger>
                                    <SelectContent>
                                        {banks.map((bank) => (
                                            <SelectItem key={bank.bankNo} value={String(bank.bankNo)}>{bank.bankName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )} />
                            {bankLookupError && <p role="alert" className="text-xs text-destructive">Bank list could not be loaded; bank selection is unavailable.</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Bank A/C</Label>
                            <Input {...register("bankAccount")} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Temporary Address</Label>
                            <Textarea className="min-h-20 resize-y" {...register("temporaryAddress")} />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <Label>Permanent Address</Label>
                            <Textarea className="min-h-20 resize-y" {...register("permanentAddress")} />
                        </div>
                    </div>
                </section>
            </div>

            <aside className="space-y-4 xl:sticky xl:top-0 xl:self-start">
                <div className="space-y-4 border-b border-border pb-5">
                    <h2 className="text-sm font-bold">Profile Picture</h2>
                    <ProfilePicturePreview control={control} label="Profile Picture" employee={null} />
                    <input ref={pictureRef} type="file" accept="image/*" className="hidden" onChange={onPictureUpload} />
                    <div className="grid grid-cols-2 gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => pictureRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" /> Upload
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={onStartCamera}>
                            <Camera className="mr-2 h-4 w-4" /> Camera
                        </Button>
                    </div>
                </div>
            </aside>
        </div>
    );
};


const EmployeeForm = ({ employee, isOpen, onClose, initialReadOnly = false }: EmployeeFormProps) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const userSite = authService.getSite();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [isReadOnly, setIsReadOnly] = useState(initialReadOnly);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [activeTab, setActiveTab] = useState("personal");

    const cnicInputRef = useRef<HTMLInputElement>(null);
    const policeInputRef = useRef<HTMLInputElement>(null);

    const initialImages = useRef({ empPicture: "", cnicImage: "", policeVerification: "" });

    // Keyboard shortcuts for tab switching
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === "F1") {
                e.preventDefault();
                setActiveTab("personal");
            } else if (e.key === "F2") {
                e.preventDefault();
                setActiveTab("salary");
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Load Dropdown Data
    const { data: departments = [], error: departmentsError } = useQuery<Department[]>({
        queryKey: ['departments', userSite],
        queryFn: () => departmentService.getAll(userSite),
        enabled: isOpen,
        staleTime: 5 * 60 * 1000
    });

    const { data: designations = [], error: designationsError } = useQuery<Designation[]>({
        queryKey: ['designations', userSite],
        queryFn: () => designationService.getAll(userSite),
        enabled: isOpen,
        staleTime: 5 * 60 * 1000
    });

    const { data: banks = [], error: banksError } = useQuery<HRBank[]>({
        queryKey: ['hrBanks'],
        queryFn: () => hrBankService.getAll(),
        enabled: isOpen,
        staleTime: 5 * 60 * 1000
    });

    const { data: scales = [] } = useQuery<Scale[]>({
        queryKey: ['scales', userSite],
        queryFn: () => scaleService.getAll(userSite),
        enabled: isOpen,
        staleTime: 5 * 60 * 1000
    });

    const { data: shifts = [], error: shiftsError } = useQuery<Shift[]>({
        queryKey: ['shifts'],
        queryFn: () => shiftService.getAll(),
        enabled: isOpen,
        staleTime: 5 * 60 * 1000
    });

    const { data: categories = [], error: categoriesError } = useQuery<Category[]>({
        queryKey: ['categories', userSite],
        queryFn: () => categoryService.getAll(userSite),
        enabled: isOpen,
        staleTime: 5 * 60 * 1000
    });

    const { data: statuses = [], error: statusesError } = useQuery<Status[]>({
        queryKey: ['statuses', userSite],
        queryFn: () => statusService.getAll(userSite),
        enabled: isOpen,
        staleTime: 5 * 60 * 1000
    });

    const { data: grades = [] } = useQuery<Grade[]>({
        queryKey: ['grades'],
        queryFn: () => gradeService.getAll(),
        enabled: isOpen,
        staleTime: 5 * 60 * 1000
    });

    const { data: locations = [] } = useQuery<Location[]>({
        queryKey: ['locations'],
        queryFn: () => locationService.getAll(),
        enabled: isOpen,
        staleTime: 5 * 60 * 1000
    });

    const employeeLookupErrors: string[] = [];
    if (categoriesError) employeeLookupErrors.push("employee categories");
    if (departmentsError) employeeLookupErrors.push("departments");
    if (designationsError) employeeLookupErrors.push("designations");
    if (shiftsError) employeeLookupErrors.push("shifts");
    if (statusesError) employeeLookupErrors.push("employee statuses");

    // React Hook Form Setup
    const { register, control, handleSubmit, setValue, watch, reset } = useForm<Employee>({
        defaultValues: { ...defaultEmployeeValues, site: userSite },
        mode: "onBlur" // Validate on blur for performance
    });

    // Once the user edits confirmation by hand, stop auto-calculating it from the joining date
    const confirmationEdited = useRef(false);

    // Watch values for conditional logic or previews
    // Crucial: Only watch specific fields to avoid re-rendering entire form on every keystroke
    // Removed general watch("empPicture") to use useWatch in a scoped component


    // Watch name parts to keep empName in sync
    const watchedFirstName = watch("firstName");
    const watchedMiddleName = watch("middleName");
    const watchedLastName = watch("lastName");

    useEffect(() => {
        const parts = [watchedFirstName, watchedMiddleName, watchedLastName]
            .map(p => (p ?? "").trim())
            .filter(Boolean);
        setValue("empName", parts.join(" "), { shouldDirty: false });
    }, [watchedFirstName, watchedMiddleName, watchedLastName, setValue]);

    // Watch salary for calculations
    const currentSalary = watch("salary");

    // Recalculate Basic Pay and Allowances when Gross Pay changes - REMOVED for manual input
    /*
    useEffect(() => {
        if (grossPay > 0) {
            const bp = Math.round(grossPay * (2 / 3));
            const a01 = Math.round(bp * 0.4);
            const a02 = Math.round(bp * 0.1);

            // Avoid infinite loops by checking values before setting
            if (Number(currentSalary?.basicPay) !== bp) setValue("salary.basicPay", bp);
            if (Number(currentSalary?.a01) !== a01) setValue("salary.a01", a01);
            if (Number(currentSalary?.a02) !== a02) setValue("salary.a02", a02);
        }
    }, [grossPay, setValue]);
    */

    // Recalculate Net Pay when any salary field changes
    useEffect(() => {
        if (!currentSalary) return;

        let calculatedNet: number;
        if (!employee) {
            let additions = 0;
            for (let i = 4; i <= 11; i++) {
                const key = `a${i.toString().padStart(2, '0')}` as keyof typeof currentSalary;
                additions += Number(currentSalary[key]) || 0;
            }
            let deductions = 0;
            for (let i = 1; i <= 11; i++) {
                const key = `d${i.toString().padStart(2, '0')}` as keyof typeof currentSalary;
                deductions += Number(currentSalary[key]) || 0;
            }
            calculatedNet = Math.round((Number(currentSalary.grossPay) || 0) + additions - deductions);
        } else {
            const basic = Number(currentSalary.basicPay) || 0;
            let totalAllowances = 0;
            for (let i = 1; i <= 12; i++) {
                const key = `a${i.toString().padStart(2, '0')}` as keyof typeof currentSalary;
                totalAllowances += Number(currentSalary[key]) || 0;
            }
            let totalDeductions = 0;
            for (let i = 1; i <= 22; i++) {
                const key = `d${i.toString().padStart(2, '0')}` as keyof typeof currentSalary;
                totalDeductions += Number(currentSalary[key]) || 0;
            }
            calculatedNet = Math.round(basic + totalAllowances - totalDeductions);
        }

        if (Number(currentSalary.netPay) !== calculatedNet) {
            setValue("salary.netPay", calculatedNet, { shouldDirty: true });
        }
    }, [currentSalary, employee, setValue]);


    // Effect: Reset form when employee prop changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setIsReadOnly(initialReadOnly);
            setActiveTab("personal");
            confirmationEdited.current = false;
            if (employee) {
                const initialVals = {
                    empPicture: employee.empPicture || "",
                    cnicImage: employee.cnicImage || "",
                    policeVerification: employee.policeVerification || ""
                };
                initialImages.current = initialVals;

                // Determine prefix and gender
                let prefix = employee.empPrefix || "";
                let name = employee.empName || "";
                let gender = employee.gender || "";

                if (!prefix) {
                    const match = name.match(/^(Mr\.|Mr|Mrs\.|Mrs|Ms\.|Ms|Miss\.?)\s+/i);
                    if (match) {
                        const raw = match[1].toLowerCase().replace('.', '');
                        if (raw === 'mrs') prefix = 'Mrs';
                        else if (raw === 'ms' || raw === 'miss') prefix = 'Ms';
                        else if (raw === 'mr') prefix = 'Mr';
                        name = name.substring(match[0].length).trim();
                    } else if (gender === "Female" || gender === "2" || gender === "F") {
                        prefix = (employee.maritalStatus && employee.maritalStatus.toLowerCase() === "single") ? "Ms" : "Mrs";
                    } else {
                        prefix = "Mr";
                    }
                }

                if (!gender) {
                    gender = (prefix === "Mrs" || prefix === "Ms") ? "Female" : "Male";
                }

                // Determine first, middle, and last name parts
                let firstName = employee.firstName || "";
                let middleName = employee.middleName || "";
                let lastName = employee.lastName || "";
                if (!firstName && name) {
                    const parsed = splitCleanName(name);
                    firstName = parsed.firstName;
                    middleName = parsed.middleName;
                    lastName = parsed.lastName;
                }

                reset({
                    ...defaultEmployeeValues,
                    ...employee,
                    restDay: employee.restDay ? (formatRestDaySchedule(employee.restDay) || employee.restDay) : "Sunday",
                    empPrefix: prefix || "Mr",
                    empName: name,
                    firstName: firstName,
                    middleName: middleName,
                    lastName: lastName,
                    gender: gender,
                    maritalStatus: employee.maritalStatus || (prefix === "Mrs" ? "Married" : "Single"),
                    birthDate: formatDateForInput(employee.birthDate),
                    joiningDate: formatDateForInput(employee.joiningDate),
                    confirmationDate: formatDateForInput(employee.confirmationDate),
                    contractExpiryDate: formatDateForInput(employee.contractExpiryDate),
                    cardExpiryDate: formatDateForInput(employee.cardExpiryDate),
                    idCardIssueDate: formatDateForInput(employee.idCardIssueDate),
                    timeInDefine: formatTimeForInput(employee.timeInDefine),
                    timeOutDefine: formatTimeForInput(employee.timeOutDefine),
                    reportingTimingDefine: formatTimeForInput(employee.reportingTimingDefine),
                    jobDescription: employee.jobDescription || {},
                    empPicture: employee.empPicture || "",
                    cnicImage: employee.cnicImage || "",
                    policeVerification: employee.policeVerification || ""
                });
            } else {
                initialImages.current = { empPicture: "", cnicImage: "", policeVerification: "" };
                reset({
                    ...defaultEmployeeValues,
                    salary: { ...defaultEmployeeValues.salary, a03: 300 },
                    empPrefix: "Mr",
                    gender: "Male",
                    maritalStatus: "Single",
                    restDay: "Sunday",
                    site: userSite,
                    firstName: "",
                    middleName: "",
                    lastName: "",
                    empName: "",
                });
                employeeService.getNextCode(userSite).then((code) => setValue("empCardNo", code)).catch((error: unknown) => {
                    toast({
                        title: "Employee ID unavailable",
                        description: error instanceof Error ? error.message : "The next employee ID could not be loaded.",
                        variant: "destructive",
                    });
                });
            }
        }
    }, [employee, isOpen, userSite, reset, setValue, initialReadOnly, toast]);

    // Cleanup camera
    useEffect(() => {
        return () => {
            if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
        };
    }, [cameraStream]);

    const mutation = useMutation<Employee | void, Error, Employee>({
        mutationFn: (data: Employee) =>
            employee ? employeeService.update(employee.empCardNo, employee.site, data) : employeeService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast({ title: "Success", description: `Employee ${employee ? 'updated' : 'created'} successfully.` });
            onClose();
        },
        onError: (error: any) => {
            let errorMessage = "Operation failed. Check server logs.";

            if (error?.response?.data) {
                const data = error.response.data;
                if (typeof data === 'string') {
                    errorMessage = data;
                } else if (data.errors) {
                    // Handle ASP.NET Core validation errors
                    errorMessage = Object.values(data.errors).flat().join(", ");
                } else if (data.message) {
                    errorMessage = data.message;
                } else {
                    errorMessage = JSON.stringify(data);
                }
            } else if (error?.message) {
                errorMessage = error.message;
            }

            console.error("Employee save error:", error?.response?.data || error);
            toast({
                title: "Save Error",
                description: errorMessage,
                variant: "destructive"
            });
        }
    });

    const onSubmit = (data: Employee) => {
        if (!employee) {
            if (!data.empCardNo || data.empCardNo <= 0) {
                toast({ title: "Employee ID unavailable", description: "Reload the form to request a valid employee ID.", variant: "destructive" });
                return;
            }
            if (data.timeInDefine === data.timeOutDefine) {
                toast({ title: "Invalid schedule", description: "Time In and Time Out must be different.", variant: "destructive" });
                return;
            }
            if (!Number.isFinite(data.workingHours) || data.workingHours <= 0) {
                toast({ title: "Invalid schedule", description: "Working Hours must be greater than zero.", variant: "destructive" });
                return;
            }
            if (Number(data.salary?.grossPay) < Number(data.salary?.a03)) {
                toast({ title: "Invalid salary", description: "Gross Pay must be at least the Conveyance amount.", variant: "destructive" });
                return;
            }
        }

        // Helper to sanitize dates (empty string to null)
        const sanitizeDate = (dateStr?: string) => (dateStr && dateStr.trim() !== "") ? dateStr : null;

        // Ensure arrays and objects are initialized
        // Only send jobDescription if it has at least one non-empty value
        const hasJobDescData = Object.values(data.jobDescription || {}).some(val => val !== null && val !== "" && val !== 0);

        const nameParts = [data.firstName, data.middleName, data.lastName]
            .map(p => (p ?? "").trim())
            .filter(Boolean);
        const combinedName = nameParts.length > 0 ? nameParts.join(" ") : (data.empName || "");

        const cleanedData = {
            ...data,
            empName: combinedName,
            firstName: data.firstName?.trim() || "",
            middleName: data.middleName?.trim() || "",
            lastName: data.lastName?.trim() || "",
            // Only send images if they are populated (user uploaded a new one)
            empPicture: data.empPicture || null,
            cnicImage: data.cnicImage || null,
            policeVerification: data.policeVerification || null,

            // Sanitize all date fields
            joiningDate: sanitizeDate(data.joiningDate),
            confirmationDate: sanitizeDate(data.confirmationDate),
            birthDate: sanitizeDate(data.birthDate),
            contractExpiryDate: sanitizeDate(data.contractExpiryDate),
            cardExpiryDate: sanitizeDate(data.cardExpiryDate),
            stuckOffDate: sanitizeDate(data.stuckOffDate),
            resignDate: sanitizeDate(data.resignDate),
            reInstatedDate: sanitizeDate(data.reInstatedDate),
            idCardIssueDate: sanitizeDate(data.idCardIssueDate),

            // Ensure numeric conversions for safety
            designationCode: data.designationCode ? Number(data.designationCode) : null,
            gradeId: data.gradeId ? Number(data.gradeId) : null,

            educations: data.educations || [],
            histories: data.histories || [],
            nextToKins: data.nextToKins || [],
            scanDocuments: data.scanDocuments || [],
            jobDescription: hasJobDescData ? data.jobDescription : null,
            branchCode: employee?.branchCode || authService.getBranchCode(),
            branchName: employee?.branchName || authService.getBranchName(),
        };

        mutation.mutate(cleanedData);
    };

    const onInvalid = (errors: any) => {
        console.warn("Form validation failed:", errors);

        // Map field names to user-friendly labels
        const fieldLabels: Record<string, string> = {
            empName: "Employee Name",
            firstName: "Employee Name",
            employeeUnit: "Unit",
            departmentCode: "Department",
            designationCode: "Designation",
            gender: "Gender",
            birthDate: "Date of Birth",
            joiningDate: "Joining Date",
            phoneNo: "Phone Number",
            temporaryAddress: "Temporary Address",
            permanentAddress: "Permanent Address",
            cnicNo: "CNIC Number",
            birthDate: "Date of Birth",
            timeInDefine: "Time In",
            timeOutDefine: "Time Out",
            workingHours: "Working Hours",
            category: "Category"
        };

        const missingFields = Object.keys(errors)
            .filter(key => fieldLabels[key])
            .map(key => fieldLabels[key]);

        let description = "Please fill all mandatory fields marked with a red asterisk (*) before saving.";
        if (missingFields.length > 0) {
            description = `Please fill following mandatory fields: ${missingFields.join(", ")}`;
        }

        toast({
            title: "Required Fields Missing",
            description: description,
            variant: "destructive"
        });
    };

    // --- Image Handling ---
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                const base64Coords = dataUrl.split(',');
                const base64String = base64Coords.length > 1 ? base64Coords[1] : base64Coords[0];
                setValue("empPicture", base64String, { shouldDirty: true });
            };
            reader.readAsDataURL(file);
        }
    };

    const startCamera = async () => {
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setCameraStream(stream);
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
            toast({ title: "Camera Error", description: "Could not access camera.", variant: "destructive" });
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setIsCameraOpen(false);
    };

    const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: "cnicImage" | "policeVerification") => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                const base64Coords = dataUrl.split(',');
                const base64String = base64Coords.length > 1 ? base64Coords[1] : base64Coords[0];
                setValue(fieldName, base64String, { shouldDirty: true });
            };
            reader.readAsDataURL(file);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                const base64Coords = dataUrl.split(',');
                const base64String = base64Coords.length > 1 ? base64Coords[1] : base64Coords[0];
                setValue("empPicture", base64String, { shouldDirty: true });
                stopCamera();
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent showCloseButton={false} className="max-w-[95vw] w-[1400px] h-[90vh] flex flex-col p-0 overflow-hidden bg-background border-border" aria-describedby="employee-form-description">
                <DialogDescription id="employee-form-description" className="sr-only">
                    Form to create or edit employee details including personal info, salary, education, and history.
                </DialogDescription>
                <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="contents">
                    <DialogHeader className="p-6 pb-2 border-b border-border bg-card">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <DialogTitle className="text-xl font-black tracking-tight">
                                    {isReadOnly
                                        ? `Employee Details: ${employee?.empName || ''}`
                                        : employee ? `Edit Employee: ${employee.empName}` : "Create New Employee"}
                                </DialogTitle>
                                {isReadOnly && (
                                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-primary/10 text-primary border border-primary/20">
                                        View Only
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8" disabled={mutation.isPending}>
                                    {isReadOnly ? "Close" : "Cancel"}
                                </Button>
                                {isReadOnly ? null : (
                                    <Button type="submit" size="sm" disabled={mutation.isPending} className="h-8 gap-2 min-w-[140px]">
                                        {mutation.isPending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                <span>Save Employee</span>
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </DialogHeader>

                    <fieldset
                        disabled={isReadOnly}
                        className="flex-1 overflow-hidden flex flex-col bg-slate-50/30 disabled:opacity-100 [&_input:disabled]:opacity-100 [&_input:disabled]:text-foreground [&_input:disabled]:font-medium [&_input:disabled]:bg-muted/30 [&_input:disabled]:border-border/80 [&_select:disabled]:opacity-100 [&_textarea:disabled]:opacity-100 [&_textarea:disabled]:text-foreground [&_textarea:disabled]:font-medium [&_textarea:disabled]:bg-muted/30 [&_textarea:disabled]:border-border/80 [&_button[role=combobox]:disabled]:opacity-100 [&_button[role=combobox]:disabled]:text-foreground [&_button[role=combobox]:disabled]:font-medium [&_button[role=combobox]:disabled]:bg-muted/30 [&_button[role=combobox]:disabled]:border-border/80 [&_button[role=combobox]:disabled>span]:text-foreground [&_button[role=combobox]:disabled>span]:font-medium [&_[role=checkbox][data-disabled]]:opacity-100 [&_[role=checkbox][data-disabled]]:border-foreground/60 [&_label]:text-foreground/90"
                    >
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                            <div className="px-6 bg-card border-b border-border">
                                <TabsList className="h-12 bg-transparent gap-6 p-0">
                                    <TabsTrigger value="personal" className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-1 gap-2 text-xs font-bold uppercase transition-all whitespace-nowrap">
                                        <User className="w-3.5 h-3.5" /> Personal Info (F1)
                                    </TabsTrigger>
                                    <TabsTrigger value="salary" className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-1 gap-2 text-xs font-bold uppercase transition-all whitespace-nowrap">
                                        <CircleDollarSign className="w-3.5 h-3.5" /> Salary Breakup (F2)
                                    </TabsTrigger>
                                    {/* Extra tabs commented out as requested
                                    <TabsTrigger value="education" className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-1 gap-2 text-xs font-bold uppercase transition-all whitespace-nowrap">
                                        <GraduationCap className="w-3.5 h-3.5" /> Education
                                    </TabsTrigger>
                                    <TabsTrigger value="history" className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-1 gap-2 text-xs font-bold uppercase transition-all whitespace-nowrap">
                                        <History className="w-3.5 h-3.5" /> Experience
                                    </TabsTrigger>
                                    <TabsTrigger value="family" className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-1 gap-2 text-xs font-bold uppercase transition-all whitespace-nowrap">
                                        <Users2 className="w-3.5 h-3.5" /> Kin & Relatives
                                    </TabsTrigger>
                                    <TabsTrigger value="job" className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-1 gap-2 text-xs font-bold uppercase transition-all whitespace-nowrap">
                                        <FileText className="w-3.5 h-3.5" /> Job Desc
                                    </TabsTrigger>
                                    <TabsTrigger value="documents" className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-1 gap-2 text-xs font-bold uppercase transition-all whitespace-nowrap">
                                        <FileUp className="w-3.5 h-3.5" /> Documents
                                    </TabsTrigger>
                                    */}
                                </TabsList>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                <TabsContent value="personal" className="mt-0 space-y-6">
                                    {activeTab === "personal" && employee && (
                                        <>
                                            {/* Top Bar: Card No */}
                                            <div className="grid grid-cols-10 gap-4 items-end bg-card p-4 rounded-xl border border-border shadow-sm">
                                                <div className="space-y-1.5 col-span-2">
                                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Card No</Label>
                                                    <div className="flex gap-2">
                                                        <Input {...register('empCardNo')} readOnly className="h-9 font-sans font-bold bg-secondary/50" />
                                                        <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" disabled={isReadOnly}><Search className="w-4 h-4" /></Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-12 gap-8 items-start">
                                                <div className="col-span-8">
                                                    <Accordion type="multiple" defaultValue={["identity", "placement", "contact", "personal"]} className="space-y-4">
                                                        <AccordionItem value="identity" className="bg-card border border-border rounded-xl px-6 shadow-sm">
                                                            <AccordionTrigger className="hover:no-underline py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><User className="w-4 h-4" /></div>
                                                                    <span className="font-bold text-sm tracking-tight">Identity & Basic Information</span>
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent className="pt-2 pb-6 space-y-4">
                                                                {/* Hidden field to keep empName registered in form state */}
                                                                <input type="hidden" {...register('empName')} />

                                                                <div className="space-y-1.5">
                                                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Employee Name <span className="text-red-500">*</span></Label>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                                                        <div className="sm:col-span-2">
                                                                            <Controller
                                                                                name="empPrefix"
                                                                                control={control}
                                                                                render={({ field }) => (
                                                                                    <Select
                                                                                        value={field.value || "Mr"}
                                                                                        onValueChange={field.onChange}
                                                                                    >
                                                                                        <SelectTrigger className="w-full h-9 shrink-0"><SelectValue placeholder="Mr" /></SelectTrigger>
                                                                                        <SelectContent>
                                                                                            <SelectItem value="Mr">Mr</SelectItem>
                                                                                            <SelectItem value="Ms">Ms</SelectItem>
                                                                                            <SelectItem value="Mrs">Mrs</SelectItem>
                                                                                        </SelectContent>
                                                                                    </Select>
                                                                                )}
                                                                            />
                                                                        </div>
                                                                        <div className="sm:col-span-4">
                                                                            <Input className="h-9 font-bold" {...register('firstName', { required: true })} placeholder="First Name *" />
                                                                        </div>
                                                                        <div className="sm:col-span-3">
                                                                            <Input className="h-9" {...register('middleName')} placeholder="Middle Name" />
                                                                        </div>
                                                                        <div className="sm:col-span-3">
                                                                            <Input className="h-9" {...register('lastName')} placeholder="Last Name" />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Father/Husband</Label>
                                                                        <Input className="h-9" {...register('empFatherName')} />
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Mother Name</Label>
                                                                        <Input className="h-9" {...register('empMotherName')} />
                                                                    </div>
                                                                    <div className="space-y-1.5 flex flex-col justify-end">
                                                                        <div className="flex items-center gap-6 h-9">
                                                                            <div className="flex items-center gap-2">
                                                                                <Controller name="isHod" control={control} render={({ field }) => (
                                                                                    <Checkbox id="isHod" checked={field.value || false} onCheckedChange={field.onChange} />
                                                                                )} />
                                                                                <Label htmlFor="isHod" className="text-xs font-bold">HOD</Label>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <Controller name="status" control={control} render={({ field }) => (
                                                                                    <Checkbox id="status" checked={field.value || false} onCheckedChange={field.onChange} />
                                                                                )} />
                                                                                <Label htmlFor="status" className="text-xs font-bold text-green-600">Active Status</Label>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>

                                                        <AccordionItem value="placement" className="bg-card border border-border rounded-xl px-6 shadow-sm">
                                                            <AccordionTrigger className="hover:no-underline py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 bg-sidebar/10 rounded-lg text-sidebar"><Search className="w-4 h-4" /></div>
                                                                    <span className="font-bold text-sm tracking-tight">Placement & Roles</span>
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent className="pt-2 pb-6 space-y-4">
                                                                <div className="grid grid-cols-3 gap-4">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Category <span className="text-red-500">*</span></Label>
                                                                        <Controller name="category" control={control} rules={{ required: true }} render={({ field }) => (
                                                                            <Select value={field.value} onValueChange={field.onChange}>
                                                                                <SelectTrigger className="h-9"><SelectValue placeholder="Select Category" /></SelectTrigger>
                                                                                <SelectContent>
                                                                                    {categories.map((cat) => (
                                                                                        <SelectItem key={cat.categoryNo} value={cat.categoryName}>
                                                                                            {cat.categoryName}
                                                                                        </SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        )} />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Salary Category / Unit</Label>
                                                                        <Controller name="unit" control={control} render={({ field }) => (
                                                                            <Select value={field.value?.toString() || ""} onValueChange={field.onChange}>
                                                                                <SelectTrigger className="h-9"><SelectValue placeholder="Select Department" /></SelectTrigger>
                                                                                <SelectContent>
                                                                                    {useMemo(() => departments.map((dept) => (
                                                                                        <SelectItem key={dept.code} value={dept.code}>{dept.name}</SelectItem>
                                                                                    )), [departments])}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        )} />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Shift</Label>
                                                                        <Controller name="shift" control={control} render={({ field }) => (
                                                                            <Select value={field.value || ""} onValueChange={field.onChange}>
                                                                                <SelectTrigger className="h-9"><SelectValue placeholder="Select Shift" /></SelectTrigger>
                                                                                <SelectContent>
                                                                                    {useMemo(() => shifts.map((sh) => (
                                                                                        <SelectItem key={sh.shiftNo} value={sh.shiftType || sh.shiftName}>{sh.shiftName} ({sh.shiftType})</SelectItem>
                                                                                    )), [shifts])}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        )} />
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Department <span className="text-red-500">*</span></Label>
                                                                        <Controller name="departmentCode" control={control} rules={{ required: true }} render={({ field }) => (
                                                                            <Select value={field.value?.toString()} onValueChange={field.onChange}>
                                                                                <SelectTrigger className="h-9"><SelectValue placeholder="Select Department" /></SelectTrigger>
                                                                                <SelectContent>
                                                                                    {useMemo(() => departments.map((dept) => (
                                                                                        <SelectItem key={dept.code} value={dept.code}>{dept.name}</SelectItem>
                                                                                    )), [departments])}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        )} />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Designation <span className="text-red-500">*</span></Label>
                                                                        <Controller name="designationCode" control={control} rules={{ required: true }} render={({ field }) => (
                                                                            <Select value={field.value?.toString() || ""} onValueChange={(val) => field.onChange(parseInt(val))}>
                                                                                <SelectTrigger className="h-9"><SelectValue placeholder="Select Designation" /></SelectTrigger>
                                                                                <SelectContent>
                                                                                    {useMemo(() => designations.map((desig) => (
                                                                                        <SelectItem key={desig.designationCode} value={desig.designationCode.toString()}>{desig.designationName}</SelectItem>
                                                                                    )), [designations])}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        )} />
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    {/* Employee Category commented out
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Employee Category</Label>
                                                                        <Controller name="employeeCategory" control={control} render={({ field }) => (
                                                                            <Select value={field.value} onValueChange={field.onChange}>
                                                                                <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="Permanent">Permanent</SelectItem>
                                                                                    <SelectItem value="Regular">Regular</SelectItem>
                                                                                    <SelectItem value="Contract">Contract</SelectItem>
                                                                                    <SelectItem value="Probation">Probation</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        )} />
                                                                    </div>
                                                                    */}
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Employment Status</Label>
                                                                        <Controller name="employmentStatus" control={control} render={({ field }) => (
                                                                            <Select value={field.value || ""} onValueChange={field.onChange}>
                                                                                <SelectTrigger className="h-9"><SelectValue placeholder="Select Status" /></SelectTrigger>
                                                                                <SelectContent>
                                                                                    {statuses.map((st) => (
                                                                                        <SelectItem key={st.statusNo} value={st.statusName}>{st.statusName}</SelectItem>
                                                                                    ))}
                                                                                    {field.value && !statuses.some(s => s.statusName === field.value) && (
                                                                                        <SelectItem value={field.value}>{field.value}</SelectItem>
                                                                                    )}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        )} />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Employee Scale</Label>
                                                                        <Controller name="scale" control={control} render={({ field }) => (
                                                                            <Select value={field.value || ""} onValueChange={field.onChange}>
                                                                                <SelectTrigger className="h-9"><SelectValue placeholder="Select Scale" /></SelectTrigger>
                                                                                <SelectContent>
                                                                                    {useMemo(() => scales.map((sc) => (
                                                                                        <SelectItem key={sc.scaleId} value={sc.scaleName}>{sc.scaleName}</SelectItem>
                                                                                    )), [scales])}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        )} />
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border/50">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Qualification</Label>
                                                                        <Input className="h-9" placeholder="e.g. Master, BS, Matric" {...register('qualification')} />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Training / Certification</Label>
                                                                        <Input className="h-9" placeholder="e.g. ITIL, PMP, Certificate" {...register('certification')} />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Experience</Label>
                                                                        <Input className="h-9" placeholder="e.g. 5 Years in Teaching" {...register('experience')} />
                                                                    </div>
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>

                                                        <AccordionItem value="contact" className="bg-card border border-border rounded-xl px-6 shadow-sm">
                                                            <AccordionTrigger className="hover:no-underline py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 bg-green-500/10 rounded-lg text-green-600"><Users2 className="w-4 h-4" /></div>
                                                                    <span className="font-bold text-sm tracking-tight">Contact Information</span>
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent className="pt-2 pb-6 space-y-4">
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Email</Label>
                                                                        <Input className="h-9" type="email" placeholder="name@domain.com" {...register('emailCompany')} />
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Phone No. <span className="text-red-500">*</span></Label>
                                                                        <Input className="h-9" {...register('phoneNo', { required: true })} />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Extension</Label>
                                                                        <Input className="h-9" {...register('extensionNo')} />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Temporary Address <span className="text-red-500">*</span></Label>
                                                                    <Textarea className="min-h-[60px] resize-none" {...register('temporaryAddress', { required: true })} />
                                                                </div>
                                                                <div className="flex items-center gap-2 py-1">
                                                                    <Checkbox
                                                                        id="same-address"
                                                                        onCheckedChange={(checked) => {
                                                                            if (checked) {
                                                                                const tempAddr = watch("temporaryAddress");
                                                                                if (tempAddr) setValue("permanentAddress", tempAddr, { shouldDirty: true, shouldValidate: true });
                                                                            }
                                                                        }}
                                                                    />
                                                                    <Label htmlFor="same-address" className="text-[11px] font-bold cursor-pointer text-primary">Same as Temporary Address</Label>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Permanent Address <span className="text-red-500">*</span></Label>
                                                                    <Textarea className="min-h-[60px] resize-none" {...register('permanentAddress', { required: true })} />
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>

                                                        <AccordionItem value="personal" className="bg-card border border-border rounded-xl px-6 shadow-sm">
                                                            <AccordionTrigger className="hover:no-underline py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-600"><FileText className="w-4 h-4" /></div>
                                                                    <span className="font-bold text-sm tracking-tight">Personal & Timeline</span>
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent className="pt-2 pb-6 space-y-4">
                                                                <div className="grid grid-cols-3 gap-4">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Gender <span className="text-red-500">*</span></Label>
                                                                        <Controller
                                                                            name="gender"
                                                                            control={control}
                                                                            rules={{ required: true }}
                                                                            render={({ field }) => (
                                                                                <Select
                                                                                    value={field.value || "Male"}
                                                                                    onValueChange={(val) => {
                                                                                        field.onChange(val);
                                                                                        const currentMarital = watch("maritalStatus");
                                                                                        if (isFemaleGender(val) && isMarriedStatus(currentMarital)) {
                                                                                            setValue("empPrefix", "Mrs", { shouldDirty: true });
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="Male">Male</SelectItem>
                                                                                        <SelectItem value="Female">Female</SelectItem>
                                                                                        <SelectItem value="M">Male (M)</SelectItem>
                                                                                        <SelectItem value="F">Female (F)</SelectItem>
                                                                                        <SelectItem value="1">Male (1)</SelectItem>
                                                                                        <SelectItem value="2">Female (2)</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            )}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Marital Status</Label>
                                                                        <Controller
                                                                            name="maritalStatus"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <Select
                                                                                    value={field.value || "Single"}
                                                                                    onValueChange={(val) => {
                                                                                        field.onChange(val);
                                                                                        const currentGender = watch("gender");
                                                                                        if (isFemaleGender(currentGender) && isMarriedStatus(val)) {
                                                                                            setValue("empPrefix", "Mrs", { shouldDirty: true });
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="Single">Single</SelectItem>
                                                                                        <SelectItem value="Married">Married</SelectItem>
                                                                                        <SelectItem value="Widowed">Widowed</SelectItem>
                                                                                        <SelectItem value="Divorced">Divorced</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            )}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Blood Group</Label>
                                                                        <Controller name="bloodGroup" control={control} render={({ field }) => (
                                                                            <Select value={field.value} onValueChange={field.onChange}>
                                                                                <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="A+">A+</SelectItem>
                                                                                    <SelectItem value="A-">A-</SelectItem>
                                                                                    <SelectItem value="B+">B+</SelectItem>
                                                                                    <SelectItem value="B-">B-</SelectItem>
                                                                                    <SelectItem value="O+">O+</SelectItem>
                                                                                    <SelectItem value="O-">O-</SelectItem>
                                                                                    <SelectItem value="AB+">AB+</SelectItem>
                                                                                    <SelectItem value="AB-">AB-</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        )} />
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">CNIC No <span className="text-red-500">*</span></Label>
                                                                        <Controller
                                                                            name="cnicNo"
                                                                            control={control}
                                                                            rules={{ required: true }}
                                                                            render={({ field }) => (
                                                                                <Input
                                                                                    {...field}
                                                                                    className="h-9"
                                                                                    placeholder="00000-0000000-0"
                                                                                    maxLength={15}
                                                                                    onChange={(e) => {
                                                                                        const formatted = formatCNICValue(e.target.value);
                                                                                        field.onChange(formatted);
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Passport Number</Label>
                                                                        <Input className="h-9" placeholder="Passport Number" {...register('passportNumber')} />
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Date of Birth <span className="text-red-500">*</span></Label>
                                                                        <Input type="date" className="h-9" {...register('birthDate', { required: true })} />
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Joining Date <span className="text-red-500">*</span></Label>
                                                                        <Input
                                                                            type="date"
                                                                            className="h-9"
                                                                            {...register('joiningDate', {
                                                                                required: true,
                                                                                onChange: (e) => {
                                                                                    if (employee?.empCardNo || confirmationEdited.current) return;
                                                                                    setValue('confirmationDate', addMonthsToDateInput(e.target.value, 6), { shouldDirty: true });
                                                                                },
                                                                            })}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Confirmation</Label>
                                                                        <Input
                                                                            type="date"
                                                                            className="h-9"
                                                                            {...register('confirmationDate', {
                                                                                onChange: () => { confirmationEdited.current = true; },
                                                                            })}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Bank Name</Label>
                                                                        <Controller name="bankId" control={control} render={({ field }) => (
                                                                            <Select
                                                                                value={field.value ? field.value.toString() : ""}
                                                                                onValueChange={(val) => {
                                                                                    const selectedId = parseInt(val) || 0;
                                                                                    field.onChange(selectedId);
                                                                                    const matchedBank = banks.find(b => b.bankNo === selectedId);
                                                                                    if (matchedBank) {
                                                                                        setValue('bankName', matchedBank.bankName);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <SelectTrigger className="h-9"><SelectValue placeholder="Select Bank" /></SelectTrigger>
                                                                                <SelectContent>
                                                                                    {useMemo(() => banks.map((b) => (
                                                                                        <SelectItem key={b.bankNo} value={b.bankNo.toString()}>{b.bankName}</SelectItem>
                                                                                    )), [banks])}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        )} />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Bank Account Number</Label>
                                                                        <Input className="h-9 font-sans" placeholder="Enter bank account number" {...register('bankAccount')} />
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">E.O.B.I Number</Label>
                                                                        <Input className="h-9 font-sans" placeholder="Enter EOBI Number" {...register('eobiNo')} />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Social Security Number</Label>
                                                                        <Input className="h-9 font-sans" placeholder="Enter Social Security Number" {...register('socialSecurityNo')} />
                                                                    </div>
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                </div>

                                                {/* Right Column: All Images Grouped */}
                                                <div className="col-span-4 space-y-6">
                                                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col items-center gap-6">
                                                        <div className="flex flex-col items-center gap-4">
                                                            <ProfilePicturePreview control={control} label="Profile Picture" employee={employee} />
                                                            <div className="flex gap-2">
                                                                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} disabled={isReadOnly} />
                                                                <Button type="button" variant="outline" size="sm" className="h-8 gap-2" onClick={() => fileInputRef.current?.click()} disabled={isReadOnly}><Upload className="w-3.5 h-3.5" /> Upload</Button>
                                                                <Button type="button" variant="outline" size="sm" className="h-8 gap-2" onClick={startCamera} disabled={isReadOnly}><Camera className="w-3.5 h-3.5" /> Camera</Button>
                                                                {employee && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-8 gap-2 border-primary/30 text-primary hover:bg-primary/5"
                                                                        onClick={() => {
                                                                            const url = employeeService.getPictureUrl(employee.empCardNo, userSite);
                                                                            const link = document.createElement("a");
                                                                            link.href = url;
                                                                            link.download = `employee_${employee.empCardNo}_photo.jpg`;
                                                                            document.body.appendChild(link);
                                                                            link.click();
                                                                            document.body.removeChild(link);
                                                                        }}
                                                                    >
                                                                        <Download className="w-3.5 h-3.5" /> Download
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-border">
                                                            <div className="flex flex-col items-center gap-3">
                                                                <DocumentPreview control={control} name="cnicImage" label="CNIC Document" icon={FileText} employee={employee} />
                                                                <input type="file" ref={cnicInputRef} className="hidden" accept="image/*,.pdf" onChange={(e) => handleDocumentUpload(e, "cnicImage")} disabled={isReadOnly} />
                                                                <div className="flex gap-1 w-full">
                                                                    <Button type="button" variant="outline" size="sm" className="flex-1 h-8 gap-2" onClick={() => cnicInputRef.current?.click()} disabled={isReadOnly}>
                                                                        <FileUp className="w-3.5 h-3.5" /> {watch("cnicImage") ? "Changed" : "Upload"}
                                                                    </Button>
                                                                    {employee && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="icon"
                                                                            className="h-8 w-8 border-primary/20"
                                                                            onClick={() => {
                                                                                const url = employeeService.getCnicImageUrl(employee.empCardNo, userSite);
                                                                                window.open(url, '_blank');
                                                                            }}
                                                                            title="Download/View CNIC"
                                                                        >
                                                                            <Download className="w-3.5 h-3.5 text-primary" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-center gap-3">
                                                                <DocumentPreview control={control} name="policeVerification" label="Police Verif." icon={FileText} employee={employee} />
                                                                <input type="file" ref={policeInputRef} className="hidden" accept="image/*,.pdf" onChange={(e) => handleDocumentUpload(e, "policeVerification")} disabled={isReadOnly} />
                                                                <div className="flex gap-1 w-full">
                                                                    <Button type="button" variant="outline" size="sm" className="flex-1 h-8 gap-2" onClick={() => policeInputRef.current?.click()} disabled={isReadOnly}>
                                                                        <FileUp className="w-3.5 h-3.5" /> {watch("policeVerification") ? "Changed" : "Upload"}
                                                                    </Button>
                                                                    {employee && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="icon"
                                                                            className="h-8 w-8 border-primary/20"
                                                                            onClick={() => {
                                                                                const url = employeeService.getPoliceVerificationUrl(employee.empCardNo, userSite);
                                                                                window.open(url, '_blank');
                                                                            }}
                                                                            title="Download/View Police Verif."
                                                                        >
                                                                            <Download className="w-3.5 h-3.5 text-primary" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <MemoizedCheckboxes control={control} isReadOnly={isReadOnly} />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {activeTab === "personal" && !employee && (
                                        <EmployeeCreateFields
                                            register={register}
                                            control={control}
                                            setValue={setValue}
                                            confirmationEdited={confirmationEdited}
                                            categories={categories}
                                            departments={departments}
                                            designations={designations}
                                            banks={banks}
                                            bankLookupError={banksError}
                                            shifts={shifts}
                                            statuses={statuses}
                                            lookupErrors={employeeLookupErrors}
                                            onPictureUpload={handleFileUpload}
                                            onStartCamera={startCamera}
                                        />
                                    )}
                                </TabsContent>

                                <TabsContent value="salary" className="mt-0 space-y-6">
                                    {activeTab === "salary" && <SalaryBreakupSection register={register} control={control} setValue={setValue} createMode={!employee} />}
                                </TabsContent>

                                {/* Extra tabs commented out as requested
                                <TabsContent value="education" className="mt-0">
                                    {activeTab === "education" && <EmployeeEducation control={control} register={register} />}
                                </TabsContent>

                                <TabsContent value="history" className="mt-0">
                                    {activeTab === "history" && <EmployeeHistory control={control} register={register} />}
                                </TabsContent>

                                <TabsContent value="family" className="mt-0">
                                    {activeTab === "family" && <EmployeeNextToKin control={control} register={register} />}
                                </TabsContent>

                                <TabsContent value="job" className="mt-0">
                                    {activeTab === "job" && <EmployeeJobDescription control={control} register={register} />}
                                </TabsContent>

                                <TabsContent value="documents" className="mt-0">
                                    {activeTab === "documents" && <EmployeeScanDocuments control={control} register={register} />}
                                </TabsContent>
                                */}
                            </div>
                        </Tabs>
                    </fieldset>
                </form>
            </DialogContent >

            <Dialog open={isCameraOpen} onOpenChange={stopCamera}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Take Photo</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                        <DialogFooter className="sm:justify-between w-full">
                            <Button type="button" variant="outline" onClick={stopCamera}>Cancel</Button>
                            <Button type="button" onClick={capturePhoto}>
                                <Camera className="w-4 h-4 mr-2" /> Capture
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </Dialog >
    );
};

export default EmployeeForm;
