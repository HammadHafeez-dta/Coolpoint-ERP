import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { isAxiosError } from "axios";
import {
    UserX,
    Calendar,
    CheckCircle2,
    UserMinus,
    ClipboardList,
    Building2,
    Briefcase,
    Save,
    Loader2
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/shared/components/ui/dialog";
import { useToast } from "@/shared/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeService, Employee, EmployeeStruckOff } from "../services/employeeService";
import { authService } from "@/modules/auth/services/authService";
import { departmentService, Department } from "../services/departmentService";
import { designationService, Designation } from "../services/designationService";
import { cn } from "@/shared/utils/utils";

// Local date parts: toISOString() converts to UTC and shifts the day back in timezones ahead of UTC
const toDateInput = (value?: string) => {
    const d = value ? new Date(value) : new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

interface EmployeeStruckOffFormProps {
    employee: Employee;
    isOpen: boolean;
    onClose: () => void;
}

const EmployeeStruckOffForm = ({
    employee,
    isOpen,
    onClose
}: EmployeeStruckOffFormProps) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const userSite = authService.getSite();

    // Setup React Hook Form
    const { register, control, handleSubmit, reset, watch, setValue } = useForm<EmployeeStruckOff>({
        defaultValues: {
            empCardNo: employee.empCardNo,
            site: employee.site,
            leftType: employee.leftType || "",
            stuckOffStatus: employee.stuckOffStatus || false,
            stuckOffDate: toDateInput(employee.stuckOffDate),
            status: employee.status ?? true,
            reInstated: employee.reInstated || false,
            reInstatedDate: toDateInput(employee.reInstatedDate),
        }
    });

    const reInstated = watch("reInstated");
    const stuckOffStatus = watch("stuckOffStatus");
    const activeStatus = watch("status");
    const selectedStatus = stuckOffStatus
        ? "struck-off"
        : reInstated
            ? "reinstated"
            : activeStatus
                ? "active"
                : "";

    // Sync form with employee prop
    useEffect(() => {
        if (isOpen && employee) {
            reset({
                empCardNo: employee.empCardNo,
                site: employee.site,
                leftType: employee.leftType || "",
                stuckOffStatus: employee.stuckOffStatus || false,
                stuckOffDate: toDateInput(employee.stuckOffDate),
                status: employee.status ?? true,
                reInstated: employee.reInstated || false,
                reInstatedDate: toDateInput(employee.reInstatedDate),
            });
        }
    }, [employee, isOpen, reset]);

    // Load Dropdown Data for names
    const { data: departments = [] } = useQuery<Department[]>({
        queryKey: ['departments', userSite],
        queryFn: () => departmentService.getAll(userSite),
        enabled: isOpen,
    });

    const { data: designations = [] } = useQuery<Designation[]>({
        queryKey: ['designations', userSite],
        queryFn: () => designationService.getAll(userSite),
        enabled: isOpen,
    });

    const departmentName = departments.find(d => d.code === employee.departmentCode)?.name || employee.departmentCode;
    const designationName = designations.find(d => d.designationCode === employee.designationCode)?.designationName || employee.designationCode;

    const mutation = useMutation({
        mutationFn: (data: EmployeeStruckOff) =>
            employeeService.updateStruckOff(employee.empCardNo, employee.site, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast({ title: "Success", description: "Employee status updated successfully." });
            onClose();
        },
        onError: (error: unknown) => {
            const errorMessage = isAxiosError<{ message?: string }>(error)
                ? error.response?.data?.message || "Failed to update employee status."
                : "Failed to update employee status.";
            toast({ title: "Error", description: errorMessage, variant: "destructive" });
        }
    });

    const onFormSubmit = (data: EmployeeStruckOff) => {
        mutation.mutate(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={false}
                className="flex max-h-[90vh] w-[calc(100%-1.5rem)] max-w-3xl flex-col gap-0 overflow-hidden rounded-2xl border-border bg-background p-0 shadow-2xl"
            >
                <DialogDescription className="sr-only">
                    Update this employee's reason for leaving and employment status.
                </DialogDescription>

                <div className="shrink-0 border-b border-border bg-card px-5 py-5 sm:px-7">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="shrink-0 rounded-xl border border-border bg-primary/10 p-3 text-primary">
                                <UserX className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                                <DialogTitle className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                                    Update employee status
                                </DialogTitle>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Manage the employee’s departure or return.
                                </p>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="min-w-24"
                            >
                                Cancel
                            </Button>
                            <Button
                                form="struck-off-form"
                                type="submit"
                                disabled={mutation.isPending}
                                className="min-w-36 gap-2"
                            >
                                {mutation.isPending
                                    ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                    : <Save className="h-4 w-4" aria-hidden="true" />}
                                {mutation.isPending ? "Saving…" : "Save status"}
                            </Button>
                        </div>
                    </div>
                </div>

                <form id="struck-off-form" onSubmit={handleSubmit(onFormSubmit)} className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-7">
                        <section aria-label="Employee details" className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Employee</p>
                                    <p className="mt-1 truncate text-lg font-semibold text-foreground sm:text-xl">
                                        {employee.empName || "Unnamed employee"}
                                    </p>
                                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <ClipboardList className="h-4 w-4 shrink-0" aria-hidden="true" />
                                        Card number <span className="font-medium tabular-nums text-foreground">{employee.empCardNo}</span>
                                    </p>
                                </div>
                                <div className="grid min-w-0 grid-cols-1 gap-3 border-t border-border pt-3 sm:min-w-[44%] sm:grid-cols-2 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                                    <div className="min-w-0">
                                        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                            <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                            Department
                                        </p>
                                        <p className="mt-1 truncate text-sm font-medium text-foreground">{departmentName || "N/A"}</p>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                            <Briefcase className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                            Designation
                                        </p>
                                        <p className="mt-1 truncate text-sm font-medium text-foreground">{designationName || "N/A"}</p>
                                    </div>
                                    {employee.stuckOffStatus && (
                                        <div className="min-w-0 sm:col-span-2">
                                            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                                Struck off date
                                            </p>
                                            <p className="mt-1 text-sm font-semibold tabular-nums text-destructive">
                                                {employee.stuckOffDate
                                                    ? new Date(employee.stuckOffDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                                                    : "N/A"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="space-y-2.5">
                            <Label htmlFor="leftType" className="text-sm font-semibold text-foreground">
                                Reason for leaving
                            </Label>
                            <Controller
                                name="leftType"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id="leftType" className="h-11 w-full border-border bg-card shadow-none">
                                            <SelectValue placeholder="Select Reason" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Resigned">Resigned</SelectItem>
                                            <SelectItem value="Terminated">Terminated</SelectItem>
                                            <SelectItem value="Retired">Retired</SelectItem>
                                            <SelectItem value="Struck Off">Struck Off</SelectItem>
                                            <SelectItem value="Absconded">Absconded</SelectItem>
                                            <SelectItem value="Deceased">Deceased</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </section>

                        <section className="space-y-3">
                            <div>
                                <p id="employment-status-label" className="text-sm font-semibold text-foreground">Employment status</p>
                                <p className="mt-1 text-sm text-muted-foreground">Choose one status for this employee.</p>
                            </div>
                            <RadioGroup
                                aria-labelledby="employment-status-label"
                                value={selectedStatus}
                                onValueChange={(value) => {
                                    // Discard any date picked under another status so an accidental click can't carry over
                                    setValue("stuckOffDate", toDateInput(employee.stuckOffDate));
                                    setValue("reInstatedDate", toDateInput(employee.reInstatedDate));
                                    setValue("stuckOffStatus", value === "struck-off", { shouldDirty: true });
                                    setValue("reInstated", value === "reinstated", { shouldDirty: true });
                                    setValue("status", value !== "struck-off", { shouldDirty: true });
                                }}
                                className="grid grid-cols-1 gap-3 sm:grid-cols-3"
                            >
                                {[
                                    {
                                        value: "struck-off",
                                        label: "Struck off",
                                        description: "Mark the employee as no longer active.",
                                        Icon: UserX,
                                    },
                                    {
                                        value: "reinstated",
                                        label: "Reinstate",
                                        description: "Return the employee to active service.",
                                        Icon: UserMinus,
                                    },
                                    {
                                        value: "active",
                                        label: "Active status",
                                        description: "Keep the employee active.",
                                        Icon: CheckCircle2,
                                    },
                                ].map(({ value, label, description, Icon }) => (
                                    <Label
                                        key={value}
                                        htmlFor={`employment-status-${value}`}
                                        className={cn(
                                            "flex min-h-[92px] cursor-pointer items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                                            selectedStatus === value
                                                ? "border-primary bg-primary/5 shadow-sm"
                                                : "border-border",
                                        )}
                                    >
                                        <RadioGroupItem
                                            id={`employment-status-${value}`}
                                            value={value}
                                            className="mt-0.5 shrink-0"
                                        />
                                        <span className="min-w-0">
                                            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                                <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                                                {label}
                                            </span>
                                            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                                                {description}
                                            </span>
                                        </span>
                                    </Label>
                                ))}
                            </RadioGroup>
                        </section>

                        {(stuckOffStatus || reInstated) && (
                            <section className="space-y-2.5 rounded-xl border border-border bg-muted/30 p-4 sm:p-5">
                                <Label htmlFor={stuckOffStatus ? "stuckOffDate" : "reInstatedDate"} className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
                                    {stuckOffStatus ? "Struck-off date" : "Reinstatement date"}
                                </Label>
                                <Input
                                    key={stuckOffStatus ? "stuckOffDate" : "reInstatedDate"}
                                    id={stuckOffStatus ? "stuckOffDate" : "reInstatedDate"}
                                    type="date"
                                    className="h-11 max-w-sm border-border bg-card shadow-none"
                                    {...register(stuckOffStatus ? "stuckOffDate" : "reInstatedDate")}
                                />
                                <p className="text-sm text-muted-foreground">
                                    {stuckOffStatus
                                        ? "The date the employee’s departure takes effect."
                                        : "The date the employee returns to active service."}
                                </p>
                            </section>
                        )}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EmployeeStruckOffForm;
