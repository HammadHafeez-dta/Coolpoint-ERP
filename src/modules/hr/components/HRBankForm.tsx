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
import { hrBankService, HRBank } from "../services/hrBankService";
import { Loader2 } from "lucide-react";

interface HRBankFormProps {
    bankItem: HRBank | null;
    isOpen: boolean;
    onClose: () => void;
}

const HRBankForm = ({ bankItem, isOpen, onClose }: HRBankFormProps) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<Partial<HRBank>>(bankItem || {});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (bankItem) {
            setFormData(bankItem);
        } else if (isOpen) {
            hrBankService.getNextCode().then(code => {
                setFormData(prev => ({ ...prev, bankNo: code }));
            }).catch(() => {});
        }
    }, [bankItem, isOpen]);

    const mutation = useMutation<HRBank | void, Error, Partial<HRBank>>({
        mutationFn: (data: Partial<HRBank>) =>
            bankItem
                ? hrBankService.update(bankItem.bankNo, data)
                : hrBankService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hrBanks'] });
            toast({
                title: "Success",
                description: `Bank ${bankItem ? 'updated' : 'created'} successfully.`
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

    const handleInputChange = (field: keyof HRBank, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.bankName) {
            toast({ title: "Validation Error", description: "Bank Name is required.", variant: "destructive" });
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
                        {bankItem ? "Edit Bank" : "New Bank"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Bank Code</Label>
                        <Input
                            value={formData.bankNo || ''}
                            readOnly
                            className="bg-secondary/50 font-sans font-bold h-9"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Bank Name</Label>
                        <Input
                            value={formData.bankName || ''}
                            onChange={(e) => handleInputChange('bankName', e.target.value)}
                            className="h-9"
                            placeholder="Enter bank name"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    <Button variant="outline" onClick={onClose} className="h-9">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="h-9 gap-2">
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Bank
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default HRBankForm;
