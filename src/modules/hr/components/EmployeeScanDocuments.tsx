import { Control, useFieldArray, UseFormRegister } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Trash2, Plus, Upload, FileText } from "lucide-react";
import { Employee } from "../services/employeeService";
import { useRef } from "react";

interface EmployeeScanDocumentsProps {
    control: Control<Employee>;
    register: UseFormRegister<Employee>;
}

export const EmployeeScanDocuments = ({ control, register }: EmployeeScanDocumentsProps) => {
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "scanDocuments"
    });

    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleFileUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                const base64Coords = dataUrl.split(',');
                const base64String = base64Coords.length > 1 ? base64Coords[1] : base64Coords[0];

                const currentDoc = fields[index];
                update(index, {
                    ...currentDoc,
                    scanDocument: base64String
                });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
                <div>
                    <h3 className="text-sm font-bold flex items-center gap-2">Scanned Documents</h3>
                    <p className="text-xs text-muted-foreground mt-1">Upload employee certificates, ID copies, and other documents</p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2"
                    onClick={() => append({ documentNo: fields.length + 1, documentName: '', scanDocument: '' })}
                >
                    <Plus className="w-4 h-4" /> Add Document
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground">Document #{index + 1}</p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive/90"
                                onClick={() => remove(index)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <Input
                                {...register(`scanDocuments.${index}.documentName`)}
                                placeholder="Document Name (e.g., CNIC Copy)"
                                className="h-9 text-sm"
                            />

                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                ref={(el) => (fileInputRefs.current[index] = el)}
                                className="hidden"
                                onChange={(e) => handleFileUpload(index, e)}
                            />

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full h-9 gap-2"
                                onClick={() => fileInputRefs.current[index]?.click()}
                            >
                                <Upload className="w-4 h-4" />
                                {field.scanDocument ? 'Change File' : 'Upload File'}
                            </Button>

                            {field.scanDocument && (
                                <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                    File uploaded
                                </div>
                            )}
                        </div>

                        {field.scanDocument && (
                            <div className="border border-border rounded-lg overflow-hidden bg-muted/30">
                                {field.documentName?.toLowerCase().includes('pdf') ? (
                                    <div className="h-32 flex items-center justify-center text-muted-foreground">
                                        <FileText className="w-12 h-12" />
                                    </div>
                                ) : (
                                    <img
                                        src={`data:image/jpeg;base64,${field.scanDocument}`}
                                        alt={field.documentName || 'Document'}
                                        className="w-full h-32 object-cover"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {fields.length === 0 && (
                    <div className="col-span-full bg-card border-2 border-dashed border-border rounded-xl p-12 text-center">
                        <FileText className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm mb-3">No documents uploaded yet</p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => append({ documentNo: 1, documentName: '', scanDocument: '' })}
                        >
                            <Plus className="w-4 h-4" /> Add First Document
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
