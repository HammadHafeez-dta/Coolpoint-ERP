import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/shared/components/ui/dialog";
import { useToast } from "@/shared/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { shiftService, Shift } from "../services/shiftService";
import { Loader2 } from "lucide-react";

interface ShiftFormProps {
    shiftItem: Shift | null;
    isOpen: boolean;
    onClose: () => void;
}

const ShiftForm = ({ shiftItem, isOpen, onClose }: ShiftFormProps) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<Partial<Shift>>(shiftItem || {});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (shiftItem) {
            setFormData(shiftItem);
        } else if (isOpen) {
            shiftService.getNextCode().then(code => {
                setFormData(prev => ({ ...prev, shiftNo: code }));
            }).catch(() => {});
        }
    }, [shiftItem, isOpen]);

    const mutation = useMutation<Shift | void, Error, Partial<Shift>>({
        mutationFn: (data: Partial<Shift>) =>
            shiftItem
                ? shiftService.update(shiftItem.shiftNo, data)
                : shiftService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shifts'] });
            toast({
                title: "Success",
                description: `Shift ${shiftItem ? 'updated' : 'created'} successfully.`
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

    const handleInputChange = (field: keyof Shift, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.shiftName) {
            toast({ title: "Validation Error", description: "Shift Name is required.", variant: "destructive" });
            return;
        }
        if (!formData.shiftType) {
            toast({ title: "Validation Error", description: "Shift Type is required.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        mutation.mutate(formData);
        setIsSaving(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md bg-background border-border">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black tracking-tight">
                        {shiftItem ? "Edit Shift" : "New Shift"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Shift Code</Label>
                        <Input
                            value={formData.shiftNo || ''}
                            readOnly
                            className="bg-secondary/50 font-sans font-bold h-9"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Shift Name</Label>
                        <Input
                            value={formData.shiftName || ''}
                            onChange={(e) => handleInputChange('shiftName', e.target.value)}
                            className="h-9"
                            placeholder="Enter shift name (e.g. Morning Shift)"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Shift Type</Label>
                        <Input
                            value={formData.shiftType || ''}
                            onChange={(e) => handleInputChange('shiftType', e.target.value)}
                            className="h-9"
                            placeholder="Enter shift type (e.g. Day, Night)"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    <Button variant="outline" onClick={onClose} className="h-9">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="h-9 gap-2">
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Shift
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ShiftForm;
