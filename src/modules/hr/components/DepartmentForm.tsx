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
import { Save, X, Hash } from "lucide-react";
import { Department } from "../services/departmentService";
import { Grade } from "../services/gradeService";
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";

const formSchema = z.object({
    code: z.string().min(1, "Code is required"),
    name: z.string().min(1, "Department name is required"),
    gradeId: z.string().optional().nullable(),
});

interface DepartmentFormProps {
    department?: Department | null;
    site: string;
    mode: 'view' | 'create';
    nextCode?: string | number;
    grades?: Grade[];
    onSave: (data: Partial<Department>) => void;
    onCancel: () => void;
}

export const DepartmentForm = ({
    department,
    site,
    mode,
    nextCode,
    grades = [],
    onSave,
    onCancel,
}: DepartmentFormProps) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: "",
            name: "",
            gradeId: "",
        },
    });

    useEffect(() => {
        if (mode === 'create') {
            form.reset({
                code: nextCode ? String(nextCode) : "",
                name: "",
                gradeId: "",
            });
        } else if (department) {
            form.reset({
                code: department.code,
                name: department.name,
                gradeId: department.gradeId ? String(department.gradeId) : "",
            });
        }
    }, [department, mode, nextCode, form]);

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const selectedGrade = grades.find(g => String(g.gradeCode) === values.gradeId);
        onSave({
            code: values.code || (nextCode ? String(nextCode) : ""),
            name: values.name,
            site: site,
            gradeId: values.gradeId ? parseInt(values.gradeId, 10) : (department?.gradeId || null),
            gradeName: selectedGrade?.gradeName || department?.gradeName || "",
            level: department?.level ?? 0,
        });
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col h-full bg-background overflow-hidden font-sans"
            >
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle className="text-xl font-bold tracking-tight">
                        {department ? "Edit Department" : "Create New Department"}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        {department
                            ? "Configure department name and grade mapping."
                            : "Configure department name."}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 px-6 py-6 space-y-4">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="code"
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
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider">Department Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter department name" className="h-9 transition-all focus:ring-2 focus:ring-primary/20" autoFocus />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {department && (
                                <FormField
                                    control={form.control}
                                    name="gradeId"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel className="text-xs font-bold uppercase tracking-wider">Grade</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value || ""}>
                                                <FormControl>
                                                    <SelectTrigger className="h-9">
                                                        <SelectValue placeholder="Select Grade" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {grades.map((g) => (
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
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-2 shrink-0 border-t border-border/50">
                    <Button type="button" variant="outline" className="h-9 text-xs" onClick={onCancel}>
                        <X className="w-3.5 h-3.5 mr-2" /> Cancel
                    </Button>
                    <Button type="submit" className="h-9 px-8 text-xs font-bold">
                        <Save className="w-3.5 h-3.5 mr-2" />
                        {department ? "Update Department" : "Save Department"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
};

