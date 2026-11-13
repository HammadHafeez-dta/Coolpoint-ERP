
import { Control, useFieldArray, UseFormRegister } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { Employee } from "../services/employeeService";

interface EmployeeEducationProps {
    control: Control<Employee>;
    register: UseFormRegister<Employee>;
}

export const EmployeeEducation = ({ control, register }: EmployeeEducationProps) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "educations"
    });

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2">Education Details</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2"
                    onClick={() => append({})}
                >
                    <Plus className="w-4 h-4" /> Add Education
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr className="border-b">
                                <th className="h-10 px-4 text-left font-medium text-muted-foreground w-12 text-center">#</th>
                                <th className="h-10 px-4 text-left font-medium text-muted-foreground min-w-[150px]">Degree / Cert</th>
                                <th className="h-10 px-4 text-left font-medium text-muted-foreground min-w-[200px]">Institute</th>
                                <th className="h-10 px-4 text-left font-medium text-muted-foreground w-[100px]">From</th>
                                <th className="h-10 px-4 text-left font-medium text-muted-foreground w-[100px]">To</th>
                                <th className="h-10 px-4 text-left font-medium text-muted-foreground w-[100px]">Grade/Div</th>
                                <th className="h-10 px-4 text-left font-medium text-muted-foreground min-w-[150px]">Major</th>
                                <th className="h-10 px-4 text-center font-medium text-muted-foreground w-12">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field, index) => (
                                <tr key={field.id} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                                    <td className="p-2 text-center font-sans text-xs text-muted-foreground">
                                        {index + 1}
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            {...register(`educations.${index}.educationQualification`)}
                                            placeholder="e.g. BSCS, Matric"
                                            className="h-8"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            {...register(`educations.${index}.educationName`)}
                                            placeholder="Institution Name"
                                            className="h-8"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            type="number"
                                            {...register(`educations.${index}.educationFrom`)}
                                            placeholder="Year"
                                            className="h-8"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            type="number"
                                            {...register(`educations.${index}.educationTo`)}
                                            placeholder="Year"
                                            className="h-8"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            {...register(`educations.${index}.educationGrade`)}
                                            placeholder="A, 1st"
                                            className="h-8"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            {...register(`educations.${index}.educationMajor`)}
                                            placeholder="Computer Science"
                                            className="h-8"
                                        />
                                    </td>
                                    <td className="p-2 text-center">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive/90"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {fields.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-muted-foreground text-xs">
                                        No education history added yet. Click "Add Education" to start.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
