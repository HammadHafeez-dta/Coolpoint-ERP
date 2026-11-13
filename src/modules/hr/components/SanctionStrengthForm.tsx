import { useEffect } from "react";
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
import { SanctionStrength } from "../services/strengthService";
import { Department } from "../services/departmentService";
import { Designation } from "../services/designationService";
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";

const formSchema = z.object({
    transactionNo: z.coerce.number().min(0).optional(),
    shift: z.string().min(1, "Shift is required"),
    departmentCode: z.string().min(1, "Department is required"),
    designationCode: z.string().min(1, "Designation is required"),
    strength: z.coerce.number().min(0),
    onDuty: z.coerce.number().min(0),
});

interface SanctionStrengthFormProps {
    strength?: SanctionStrength | null;
    site: string;
    mode: 'view' | 'create';
    nextCode?: number;
    departments: Department[];
    designations: Designation[];
    onSave: (data: Partial<SanctionStrength>) => void;
    onCancel: () => void;
}

export const SanctionStrengthForm = ({
    strength,
    site,
    mode,
    nextCode,
    departments,
    designations,
    onSave,
    onCancel
}: SanctionStrengthFormProps) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            transactionNo: 0,
            shift: "",
            departmentCode: "",
            designationCode: "",
            strength: 0,
            onDuty: 0,
        },
    });

    useEffect(() => {
        if (mode === 'create') {
            form.reset({
                transactionNo: nextCode || 0,
                shift: "",
                departmentCode: "",
                designationCode: "",
                strength: 0,
                onDuty: 0,
            });
        } else if (strength) {
            form.reset({
                transactionNo: strength.transactionNo,
                shift: strength.shift || "",
                departmentCode: strength.departmentCode?.toString() || "",
                designationCode: strength.designationCode?.toString() || "",
                strength: strength.strength || 0,
                onDuty: strength.onDuty || 0,
            });
        }
    }, [strength, mode, form, nextCode]);

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        onSave({
            transactionNo: values.transactionNo || nextCode || 0,
            shift: values.shift,
            departmentCode: parseInt(values.departmentCode),
            designationCode: parseInt(values.designationCode),
            strength: values.strength,
            onDuty: values.onDuty,
            site: site
        });
    };

    const level3Departments = departments;

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col h-full bg-background overflow-hidden font-sans"
            >
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle className="text-xl font-bold tracking-tight">
                        {strength ? "Edit Sanction Strength" : "Create Sanction Strength"}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Define sanctioned and actual strength for departments and designations.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6" type="always">
                    <div className="py-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="transactionNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                            <Hash className="w-3 h-3 text-primary" /> Serial No
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                readOnly
                                                className="h-9 bg-muted/30 font-sans text-primary font-bold"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="shift"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider">Shift</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Select Shift" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Morning">Morning</SelectItem>
                                                <SelectItem value="Evening">Evening</SelectItem>
                                                <SelectItem value="Night">Night</SelectItem>
                                                <SelectItem value="General">General</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="departmentCode"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
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

                            <FormField
                                control={form.control}
                                name="designationCode"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider">Designation</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Select Designation" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {designations.map(d => (
                                                    <SelectItem key={d.designationCode} value={d.designationCode.toString()}>
                                                        {d.designationName}
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
                                name="strength"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider">Sanctioned Strength</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} className="h-9 font-sans" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="onDuty"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider">On Duty</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} className="h-9 font-sans" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 pt-2 shrink-0 border-t border-border/50">
                    <Button type="button" variant="outline" className="h-9 text-xs" onClick={onCancel}>
                        <X className="w-3.5 h-3.5 mr-2" /> Cancel
                    </Button>
                    <Button type="submit" className="h-9 px-8 text-xs font-bold">
                        <Save className="w-3.5 h-3.5 mr-2" />
                        {strength ? "Update Strength" : "Save Strength"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
};
