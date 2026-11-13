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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/shared/components/ui/select";
import { useToast } from "@/shared/components/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { openingBalancesService, EmployeeOpeningBalances } from "../services/openingBalancesService";
import { employeeService, Employee } from "../services/employeeService";
import { Loader2 } from "lucide-react";

interface OpeningBalancesFormProps {
    openingItem: EmployeeOpeningBalances | null;
    isOpen: boolean;
    onClose: () => void;
}

const OpeningBalancesForm = ({ openingItem, isOpen, onClose }: OpeningBalancesFormProps) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<Partial<EmployeeOpeningBalances>>(
        openingItem || {
            openingDate: new Date().toISOString().split('T')[0],
            eobiOpening: 0,
            ssOpening: 0,
            pFundOpening: 0
        }
    );
    const [isSaving, setIsSaving] = useState(false);

    // Fetch employee list for selection if creating new
    const { data: employees = [], isLoading: loadingEmployees } = useQuery<Employee[]>({
        queryKey: ['employees-opening-list'],
        queryFn: () => employeeService.getAll('SAFT'),
        enabled: isOpen && !openingItem,
    });

    useEffect(() => {
        if (openingItem) {
            setFormData({
                ...openingItem,
                openingDate: openingItem.openingDate ? openingItem.openingDate.split('T')[0] : new Date().toISOString().split('T')[0]
            });
        }
    }, [openingItem, isOpen]);

    // Handle employee change to auto-load existing opening balances if available
    const handleEmployeeChange = async (empIdStr: string) => {
        const empCardNo = Number(empIdStr);
        handleInputChange('empCardNo', empCardNo);
        try {
            const existing = await openingBalancesService.getByEmployeeId(empCardNo, 'SAFT');
            if (existing && existing.empCardNo) {
                setFormData({
                    ...existing,
                    openingDate: existing.openingDate ? existing.openingDate.split('T')[0] : new Date().toISOString().split('T')[0]
                });
            }
        } catch {
            // No existing balances found, keep default
            setFormData(prev => ({
                ...prev,
                empCardNo,
                eobiOpening: 0,
                ssOpening: 0,
                pFundOpening: 0
            }));
        }
    };

    const mutation = useMutation<boolean, Error, Partial<EmployeeOpeningBalances>>({
        mutationFn: (data: Partial<EmployeeOpeningBalances>) =>
            openingBalancesService.save(data, 'SAFT'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['openingBalances'] });
            toast({
                title: "Success",
                description: `Opening balances saved successfully.`
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

    const handleInputChange = (field: keyof EmployeeOpeningBalances, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.empCardNo) {
            toast({ title: "Validation Error", description: "Please select an employee.", variant: "destructive" });
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
                        {openingItem ? "Edit Opening Balances" : "Setup Opening Balances"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Employee</Label>
                        {openingItem ? (
                            <Input
                                value={`Card No: ${formData.empCardNo}`}
                                readOnly
                                className="bg-secondary/50 font-bold h-9"
                            />
                        ) : (
                            <Select
                                value={formData.empCardNo ? String(formData.empCardNo) : undefined}
                                onValueChange={handleEmployeeChange}
                                disabled={loadingEmployees}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder={loadingEmployees ? "Loading employees..." : "Select Employee"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map((emp) => (
                                        <SelectItem key={emp.empCardNo} value={String(emp.empCardNo)}>
                                            {emp.empCardNo} - {emp.empName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Opening Date</Label>
                        <Input
                            type="date"
                            value={formData.openingDate || ''}
                            onChange={(e) => handleInputChange('openingDate', e.target.value)}
                            className="h-9"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">EOBI Opening Balance</Label>
                        <Input
                            type="number"
                            value={formData.eobiOpening ?? 0}
                            onChange={(e) => handleInputChange('eobiOpening', parseFloat(e.target.value) || 0)}
                            className="h-9"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Social Security (SS) Opening Balance</Label>
                        <Input
                            type="number"
                            value={formData.ssOpening ?? 0}
                            onChange={(e) => handleInputChange('ssOpening', parseFloat(e.target.value) || 0)}
                            className="h-9"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Provident Fund (PF) Opening Balance</Label>
                        <Input
                            type="number"
                            value={formData.pFundOpening ?? 0}
                            onChange={(e) => handleInputChange('pFundOpening', parseFloat(e.target.value) || 0)}
                            className="h-9"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    <Button variant="outline" onClick={onClose} className="h-9">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="h-9 gap-2">
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Balances
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default OpeningBalancesForm;
