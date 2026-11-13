import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shared/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Save, X, Hash } from "lucide-react";
import { Designation } from "../services/designationService";
import { Department } from "../services/departmentService";
import { Grade } from "../services/gradeService";
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";

const formSchema = z.object({
    designationCode: z.coerce.number().optional(),
    designationName: z.string().min(1, "Name is required"),
    designationShortName: z.string().optional().nullable(),
    grossPay: z.coerce.number().optional().nullable(),
    netPay: z.coerce.number().optional().nullable(),
    gradeId: z.string().optional().nullable(),
    deptCode: z.string().optional().nullable(),

    // Allowances
    basicPay: z.coerce.number().optional().nullable(),
    a01: z.coerce.number().optional().nullable(),
    a02: z.coerce.number().optional().nullable(),

    // Deductions
    d01: z.coerce.number().optional().nullable(),
    d02: z.coerce.number().optional().nullable(),
});

interface DesignationFormProps {
    designation?: Designation | null;
    site: string;
    mode: 'view' | 'create';
    nextCode?: number;
    departments: Department[];
    grades: Grade[];
    onSave: (data: Partial<Designation>) => void;
    onCancel: () => void;
}

export const DesignationForm = ({
    designation,
    site,
    mode,
    nextCode,
    departments,
    grades,
    onSave,
    onCancel
}: DesignationFormProps) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            designationCode: 0,
            designationName: "",
            designationShortName: "",
            grossPay: 0,
            netPay: 0,
            gradeId: "",
            deptCode: "",
            basicPay: 0,
            a01: 0,
            a02: 0,
            d01: 0,
            d02: 0,
        },
    });

    useEffect(() => {
        if (mode === 'create') {
            form.reset({
                designationCode: nextCode || 0,
                designationName: "",
                designationShortName: "",
                grossPay: 0,
                netPay: 0,
                gradeId: "",
                deptCode: "",
                basicPay: 0,
                a01: 0,
                a02: 0,
                d01: 0,
                d02: 0,
            });
        } else if (designation) {
            form.reset({
                designationCode: designation.designationCode,
                designationName: designation.designationName,
                designationShortName: designation.designationShortName || "",
                grossPay: designation.grossPay || 0,
                netPay: designation.netPay || 0,
                gradeId: designation.gradeId?.toString() || "",
                deptCode: designation.deptCode || "",
                basicPay: designation.basicPay || 0,
                a01: designation.a01 || 0,
                a02: designation.a02 || 0,
                d01: designation.d01 || 0,
                d02: designation.d02 || 0,
            });
        }
    }, [designation, mode, form, nextCode]);

    const handleGrossPayChange = (valStr: string) => {
        const val = parseFloat(valStr) || 0;
        const unit = val / 15;
        const basic = Math.round(unit * 10);
        const hr = Math.round(unit * 4);
        const utility = Math.round(unit * 1);
        const diff = val - (basic + hr + utility);

        form.setValue("grossPay", val);
        form.setValue("netPay", val);
        form.setValue("basicPay", basic + diff);
        form.setValue("a01", hr);
        form.setValue("a02", utility);
    };

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const selectedDept = departments.find(d => d.code === values.deptCode);
        onSave({
            designationCode: values.designationCode || nextCode || 0,
            designationName: values.designationName,
            designationShortName: values.designationShortName || "",
            site: site,
            gradeId: values.gradeId ? parseInt(values.gradeId) : (designation?.gradeId || null),
            deptCode: values.deptCode || (designation?.deptCode || ""),
            deptName: selectedDept?.name || (designation?.deptName || ""),
            grossPay: values.grossPay || (designation?.grossPay || 0),
            netPay: values.netPay || (designation?.netPay || 0),
            basicPay: values.basicPay || (designation?.basicPay || 0),
            a01: values.a01 || (designation?.a01 || 0),
            a02: values.a02 || (designation?.a02 || 0),
            d01: values.d01 || (designation?.d01 || 0),
            d02: values.d02 || (designation?.d02 || 0)
        });
    };

    // Use all departments (removed length === 6 restriction)
    const level3Departments = useMemo(() =>
        departments,
        [departments]);

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col h-full bg-background overflow-hidden font-sans"
            >
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle className="text-xl font-bold tracking-tight">
                        {designation ? "Edit Designation" : "Create New Designation"}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Configure designation name, pay structure and departmental mapping.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 px-6 py-6 space-y-4">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="designationCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                            <Hash className="w-3 h-3 text-primary" /> Serial No
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                readOnly
                                                className="h-9 bg-muted/30 font-sans text-primary font-bold transition-all focus:ring-0"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="hidden md:block"></div> {/* Spacer */}

                            <FormField
                                control={form.control}
                                name="designationName"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider">Designation Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="h-9 transition-all focus:ring-2 focus:ring-primary/20" autoFocus />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
{/* 
                            <FormField
                                control={form.control}
                                name="designationShortName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider">Short Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="h-9" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormItem>
                                <FormLabel className="text-xs font-bold uppercase tracking-wider">Site</FormLabel>
                                <Input value={site} disabled className="h-9 bg-muted/50 font-sans text-xs" />
                            </FormItem>

                            <FormField
                                control={form.control}
                                name="grossPay"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider">Gross Pay</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    handleGrossPayChange(e.target.value);
                                                }}
                                                className="h-9 font-sans"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="netPay"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider">Net Salary</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} readOnly className="h-9 bg-muted/50 font-sans" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="gradeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider">Grade</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Select Grade" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {grades.map(g => (
                                                    <SelectItem key={g.gradeCode} value={g.gradeCode.toString()}>
                                                        {g.gradeName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="deptCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider">Department</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Select Department" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {level3Departments.map(d => (
                                                    <SelectItem key={d.code} value={d.code}>
                                                        {d.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
*/}
                        </div>

{/* 
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-3 bg-secondary/20 p-4 rounded-lg border border-border">
                                <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b border-border/50 pb-2">Allowances</h4>
                                {[
                                    { name: "basicPay", label: "Basic Pay" },
                                    { name: "a01", label: "House Rent" },
                                    { name: "a02", label: "Utility Allowances" },
                                    { name: "a03", label: "other" },
                                    { name: "a04", label: "fuel" },
                                    { name: "a05", label: "Mobile Allowances" }
                                ].map((item) => (
                                    <FormField
                                        key={item.name}
                                        control={form.control}
                                        name={item.name as any}
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between space-y-0">
                                                <FormLabel className="text-[11px] font-medium">{item.label}</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} className="w-32 h-7 text-right text-xs font-sans" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>

                            <div className="space-y-3 bg-secondary/20 p-4 rounded-lg border border-border">
                                <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b border-border/50 pb-2">Deductions</h4>
                                {[
                                    { name: "d01", label: "Income Tax" },
                                    { name: "d02", label: "E.O.B.I" },
                                    { name: "d03", label: "Provident Fund" }
                                ].map((item) => (
                                    <FormField
                                        key={item.name}
                                        control={form.control}
                                        name={item.name as any}
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between space-y-0">
                                                <FormLabel className="text-[11px] font-medium">{item.label}</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} className="w-24 h-7 text-right text-xs font-sans" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
*/}
                    </div>
                </div>

                <DialogFooter className="p-6 pt-2 shrink-0 border-t border-border/50">
                    <Button type="button" variant="outline" className="h-9 text-xs" onClick={onCancel}>
                        <X className="w-3.5 h-3.5 mr-2" /> Cancel
                    </Button>
                    <Button type="submit" className="h-9 px-8 text-xs font-bold">
                        <Save className="w-3.5 h-3.5 mr-2" />
                        {designation ? "Update Designation" : "Save Designation"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
};
