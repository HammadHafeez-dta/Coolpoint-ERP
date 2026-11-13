import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/shared/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/shared/components/ui/dialog";
import { useToast } from "@/shared/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gradeService, Grade } from "../services/gradeService";
import { Loader2 } from "lucide-react";

interface GradeFormProps {
    grade: Grade | null;
    isOpen: boolean;
    onClose: () => void;
}

const GradeForm = ({ grade, isOpen, onClose }: GradeFormProps) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<Partial<Grade>>(grade || {});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (grade) {
            setFormData(grade);
        } else if (isOpen) {
            gradeService.getNextCode().then(code => {
                setFormData(prev => ({ ...prev, gradeCode: code }));
            });
        }
    }, [grade, isOpen]);

    const mutation = useMutation<Grade | void, Error, Partial<Grade>>({
        mutationFn: (data: Partial<Grade>) =>
            grade
                ? gradeService.update(grade.gradeCode, data)
                : gradeService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grades'] });
            toast({
                title: "Success",
                description: `Grade ${grade ? 'updated' : 'created'} successfully.`
            });
            onClose();
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Operation failed. Please try again.",
                variant: "destructive"
            });
        }
    });

    const handleInputChange = (field: keyof Grade, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.gradeName) {
            toast({ title: "Validation Error", description: "Grade Name is required.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        mutation.mutate(formData);
        setIsSaving(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl bg-background border-border">
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <DialogTitle className="text-xl font-black tracking-tight">
                            {grade ? "Edit Grade" : "New Grade"}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Row 1: Code and Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Code</Label>
                            <Input
                                value={formData.gradeCode || ''}
                                readOnly
                                className="bg-secondary/50 font-sans font-bold h-9"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Name</Label>
                            <Input
                                value={formData.gradeName || ''}
                                onChange={(e) => handleInputChange('gradeName', e.target.value)}
                                className="h-9"
                                placeholder="Enter grade name"
                            />
                        </div>
                    </div>

                    {/* Row 2: Salaries */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Minimum Salary</Label>
                            <Input
                                type="number"
                                value={formData.minimumSalary || ''}
                                onChange={(e) => handleInputChange('minimumSalary', parseFloat(e.target.value))}
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Maximum Salary</Label>
                            <Input
                                type="number"
                                value={formData.maximumSalary || ''}
                                onChange={(e) => handleInputChange('maximumSalary', parseFloat(e.target.value))}
                                className="h-9"
                            />
                        </div>
                    </div>

                    {/* Row 3: Mid Salary and Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Mid Salary</Label>
                            <Input
                                type="number"
                                value={formData.midSalary || ''}
                                onChange={(e) => handleInputChange('midSalary', parseFloat(e.target.value))}
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Category</Label>
                            <Select value={formData.category} onValueChange={(v) => handleInputChange('category', v)}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Management">Management</SelectItem>
                                    <SelectItem value="Technical">Technical</SelectItem>
                                    <SelectItem value="Administrative">Administrative</SelectItem>
                                    <SelectItem value="Operational">Operational</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Row 4: Designation and Scale */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Designation</Label>
                            <Select value={formData.designationName} onValueChange={(v) => handleInputChange('designationName', v)}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Select Designation" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Manager">Manager</SelectItem>
                                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                                    <SelectItem value="Engineer">Engineer</SelectItem>
                                    <SelectItem value="Technician">Technician</SelectItem>
                                    <SelectItem value="Helper">Helper</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Scale</Label>
                            <Select value={formData.payScale} onValueChange={(v) => handleInputChange('payScale', v)}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Select Scale" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BPS-1">BPS-1</SelectItem>
                                    <SelectItem value="BPS-5">BPS-5</SelectItem>
                                    <SelectItem value="BPS-11">BPS-11</SelectItem>
                                    <SelectItem value="BPS-16">BPS-16</SelectItem>
                                    <SelectItem value="BPS-17">BPS-17</SelectItem>
                                    <SelectItem value="BPS-18">BPS-18</SelectItem>
                                    <SelectItem value="BPS-19">BPS-19</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Row 5: Narration */}
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Narration</Label>
                        <Textarea
                            value={formData.narration || ''}
                            onChange={(e) => handleInputChange('narration', e.target.value)}
                            className="min-h-[80px] resize-none"
                            placeholder="Enter description or notes"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    <Button variant="outline" onClick={onClose} className="h-9">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="h-9 gap-2">
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Grade
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default GradeForm;
