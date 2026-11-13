
import { Control, useFieldArray, UseFormRegister } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { Employee } from "../services/employeeService";

interface EmployeeHistoryProps {
    control: Control<Employee>;
    register: UseFormRegister<Employee>;
}

export const EmployeeHistory = ({ control, register }: EmployeeHistoryProps) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "histories"
    });

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2">Employment History</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2"
                    onClick={() => append({})}
                >
                    <Plus className="w-4 h-4" /> Add Experience
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr className="border-b">
                                <th className="h-10 px-4 text-left font-medium text-muted-foreground w-12 text-center">#</th>
                                <th className="h-10 px-4 text-left font-medium text-muted-foreground min-w-[200px]">Organization</th>
                                <th className="h-10 px-4 text-left font-medium text-muted-foreground min-w-[150px]">Designation</th>
                                <th className="h-10 px-4 text-left font-medium text-muted-foreground w-[130px]">From</th>
                                <th className="h-10 px-4 text-left font-medium text-muted-foreground w-[130px]">To</th>
                                <th className="h-10 px-4 text-left font-medium text-muted-foreground w-[120px]">Last Salary</th>
                                <th className="h-10 px-4 text-left font-medium text-muted-foreground min-w-[200px]">Reason for Leaving</th>
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
                                            {...register(`histories.${index}.organizationName`)}
                                            placeholder="Company Name"
                                            className="h-8"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            {...register(`histories.${index}.designation`)}
                                            placeholder="Job Title"
                                            className="h-8"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            type="date"
                                            {...register(`histories.${index}.periodFrom`)}
                                            className="h-8"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            type="date"
                                            {...register(`histories.${index}.periodTo`)}
                                            className="h-8"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            type="number"
                                            {...register(`histories.${index}.salary`, { valueAsNumber: true })}
                                            placeholder="0.00"
                                            className="h-8"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            {...register(`histories.${index}.reasonForLeaving`)}
                                            placeholder="Reason..."
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
                                        No employment experience recorded. Click "Add Experience" to start.
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
