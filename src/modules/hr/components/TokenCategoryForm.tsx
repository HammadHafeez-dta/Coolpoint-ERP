import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
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
import { tokenCategoryService, TokenCategory } from "../services/tokenCategoryService";
import { authService } from "@/modules/auth/services/authService";

interface TokenCategoryFormProps {
    category: TokenCategory | null;
    isOpen: boolean;
    onClose: () => void;
}

const TokenCategoryForm = ({ category, isOpen, onClose }: TokenCategoryFormProps) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const userSite = authService.getSite();

    const [formData, setFormData] = useState<Partial<TokenCategory>>(category || {
        site: userSite,
        categoryName: "",
        employeeAmount: 0,
        factoryAmount: 0
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!category && isOpen) {
            tokenCategoryService.getNextCode(userSite).then(code => {
                setFormData(prev => ({ ...prev, categoryCode: code }));
            });
        }
    }, [category, isOpen, userSite]);

    const mutation = useMutation<TokenCategory | void, Error, Partial<TokenCategory>>({
        mutationFn: (data: Partial<TokenCategory>) =>
            category
                ? tokenCategoryService.update(category.categoryCode, category.site, data)
                : tokenCategoryService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tokenCategories'] });
            toast({
                title: "Success",
                description: `Token category ${category ? 'updated' : 'created'} successfully.`
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

    const handleInputChange = (field: keyof TokenCategory, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.categoryName) {
            toast({ title: "Validation Error", description: "Category Name is required.", variant: "destructive" });
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
                    <div className="flex justify-between items-center">
                        <DialogTitle className="text-xl font-black tracking-tight">
                            {category ? "Edit Token Category" : "New Token Category"}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Category No</Label>
                            <Input
                                value={formData.categoryCode || ''}
                                readOnly
                                className="bg-secondary/50 font-sans font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Category Name</Label>
                            <Input
                                value={formData.categoryName}
                                onChange={(e) => handleInputChange('categoryName', e.target.value)}
                                placeholder="e.g. Lunch, Tea"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Employee Amount</Label>
                            <Input
                                type="number"
                                value={formData.employeeAmount}
                                onChange={(e) => handleInputChange('employeeAmount', parseFloat(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Factory Amount</Label>
                            <Input
                                type="number"
                                value={formData.factoryAmount}
                                onChange={(e) => handleInputChange('factoryAmount', parseFloat(e.target.value))}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Category
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TokenCategoryForm;
