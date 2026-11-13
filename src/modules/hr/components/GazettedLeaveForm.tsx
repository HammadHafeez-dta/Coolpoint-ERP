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
import { gazettedLeavesService, GazettedLeaf } from "../services/gazettedLeavesService";
import { Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";

interface GazettedLeaveFormProps {
    leave: GazettedLeaf | null;
    isOpen: boolean;
    onClose: () => void;
}

const GazettedLeaveForm = ({ leave, isOpen, onClose }: GazettedLeaveFormProps) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<Partial<GazettedLeaf>>(leave || {});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (leave) {
            setFormData({
                ...leave,
                leaveDate: leave.leaveDate ? format(new Date(leave.leaveDate), 'yyyy-MM-dd') : ''
            });
        } else if (isOpen) {
            gazettedLeavesService.getNextCode().then(code => {
                setFormData(prev => ({
                    ...prev,
                    transactionNo: code,
                    leaveDate: format(new Date(), 'yyyy-MM-dd')
                }));
            });
        }
    }, [leave, isOpen]);

    const mutation = useMutation<GazettedLeaf | void, Error, Partial<GazettedLeaf>>({
        mutationFn: (data: Partial<GazettedLeaf>) =>
            leave
                ? gazettedLeavesService.update(leave.transactionNo, data)
                : gazettedLeavesService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gazettedLeaves'] });
            toast({
                title: "Success",
                description: `Gazetted leaf ${leave ? 'updated' : 'created'} successfully.`
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

    const handleInputChange = (field: keyof GazettedLeaf, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.leaveName) {
            toast({ title: "Validation Error", description: "Leave Name is required.", variant: "destructive" });
            return;
        }
        if (!formData.leaveDate) {
            toast({ title: "Validation Error", description: "Leave Date is required.", variant: "destructive" });
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
                        {leave ? "Edit Gazetted Leave" : "New Gazetted Leave"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Serial No.</Label>
                            <Input
                                value={formData.transactionNo || ''}
                                readOnly
                                className="bg-secondary/50 font-sans font-bold h-9"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Leave Date</Label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={formData.leaveDate || ''}
                                    onChange={(e) => handleInputChange('leaveDate', e.target.value)}
                                    className="h-9 pr-10"
                                />
                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Leave Name</Label>
                        <Input
                            value={formData.leaveName || ''}
                            onChange={(e) => handleInputChange('leaveName', e.target.value)}
                            className="h-9"
                            placeholder="e.g. EID UL ADHA"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    <Button variant="outline" onClick={onClose} className="h-9">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="h-9 gap-2">
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Leave
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default GazettedLeaveForm;
