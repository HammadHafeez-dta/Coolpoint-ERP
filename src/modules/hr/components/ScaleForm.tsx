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
import { scaleService, Scale } from "../services/scaleService";
import { Loader2 } from "lucide-react";

interface ScaleFormProps {
    scaleItem: Scale | null;
    isOpen: boolean;
    onClose: () => void;
}

const ScaleForm = ({ scaleItem, isOpen, onClose }: ScaleFormProps) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<Partial<Scale>>(scaleItem || {});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (scaleItem) {
            setFormData(scaleItem);
        } else if (isOpen) {
            scaleService.getNextCode().then(code => {
                setFormData(prev => ({ ...prev, scaleId: code }));
            }).catch(() => {});
        }
    }, [scaleItem, isOpen]);

    const mutation = useMutation<Scale | void, Error, Partial<Scale>>({
        mutationFn: (data: Partial<Scale>) =>
            scaleItem
                ? scaleService.update(scaleItem.scaleId, data)
                : scaleService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['scales'] });
            toast({
                title: "Success",
                description: `Scale ${scaleItem ? 'updated' : 'created'} successfully.`
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

    const handleInputChange = (field: keyof Scale, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.scaleName) {
            toast({ title: "Validation Error", description: "Scale Name is required.", variant: "destructive" });
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
                        {scaleItem ? "Edit Scale" : "New Scale"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Scale Code</Label>
                        <Input
                            value={formData.scaleId || ''}
                            readOnly
                            className="bg-secondary/50 font-sans font-bold h-9"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Scale Name</Label>
                        <Input
                            value={formData.scaleName || ''}
                            onChange={(e) => handleInputChange('scaleName', e.target.value)}
                            className="h-9"
                            placeholder="Enter scale name"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    <Button variant="outline" onClick={onClose} className="h-9">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="h-9 gap-2">
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Scale
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ScaleForm;
