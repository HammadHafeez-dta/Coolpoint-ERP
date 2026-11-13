import { Control, useFieldArray, UseFormRegister } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { Employee } from "../services/employeeService";
import { Label } from "@/shared/components/ui/label";

interface EmployeeNextToKinProps {
    control: Control<Employee>;
    register: UseFormRegister<Employee>;
}

export const EmployeeNextToKin = ({ control, register }: EmployeeNextToKinProps) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "nextToKins"
    });

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2">Next of Kin / Beneficiary Details</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2"
                    onClick={() => append({})}
                >
                    <Plus className="w-4 h-4" /> Add Beneficiary
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr className="border-b">
                                <th className="h-10 px-4 text-left font-medium text-muted-foreground w-12 text-center">#</th>
                                <th className="h-10 px-4 text-left font-medium text-muted-foreground min-w-[180px]">Full Name</th>
                                <th className="h-10 px-4 text-left font-medium text-muted-foreground min-w-[200px]">Address</th>
                                <th className="h-10 px-4 text-left font-medium text-muted-foreground w-[120px]">Relation</th>
                                <th className="h-10 px-4 text-left font-medium text-muted-foreground w-[100px]">Share %</th>
                                <th className="h-10 px-4 text-left font-medium text-muted-foreground w-[150px]">CNIC</th>
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
                                            {...register(`nextToKins.${index}.beneficiaryName`)}
                                            placeholder="Beneficiary Name"
                                            className="h-8"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            {...register(`nextToKins.${index}.beneficiaryAddress`)}
                                            placeholder="Complete Address"
                                            className="h-8"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            {...register(`nextToKins.${index}.beneficiaryRelation`)}
                                            placeholder="e.g. Spouse"
                                            className="h-8"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            {...register(`nextToKins.${index}.beneficiaryPercent`)}
                                            placeholder="100"
                                            className="h-8"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            {...register(`nextToKins.${index}.beneficiaryCnic`)}
                                            placeholder="00000-0000000-0"
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
                                    <td colSpan={7} className="p-8 text-center text-muted-foreground text-xs">
                                        No beneficiaries added yet. Click "Add Beneficiary" to start.
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
