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
import { categoryService, Category } from "../services/categoryService";
import { Loader2 } from "lucide-react";

interface CategoryFormProps {
    categoryItem: Category | null;
    isOpen: boolean;
    onClose: () => void;
}

const CategoryForm = ({ categoryItem, isOpen, onClose }: CategoryFormProps) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<Partial<Category>>(categoryItem || {});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (categoryItem) {
            setFormData(categoryItem);
        } else if (isOpen) {
            categoryService.getNextCode().then(code => {
                setFormData(prev => ({ ...prev, categoryNo: code }));
            }).catch(() => {});
        }
    }, [categoryItem, isOpen]);

    const mutation = useMutation<Category | void, Error, Partial<Category>>({
        mutationFn: (data: Partial<Category>) =>
            categoryItem
                ? categoryService.update(categoryItem.categoryNo, data)
                : categoryService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast({
                title: "Success",
                description: `Category ${categoryItem ? 'updated' : 'created'} successfully.`
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

    const handleInputChange = (field: keyof Category, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.categoryName?.trim()) {
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
                    <DialogTitle className="text-xl font-black tracking-tight">
                        {categoryItem ? "Edit Category" : "New Category"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Category Code</Label>
                        <Input
                            value={formData.categoryNo || ''}
                            readOnly
                            className="bg-secondary/50 font-sans font-bold h-9"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Category Name</Label>
                        <Input
                            value={formData.categoryName || ''}
                            onChange={(e) => handleInputChange('categoryName', e.target.value)}
                            className="h-9"
                            placeholder="Enter category name"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    <Button variant="outline" onClick={onClose} className="h-9">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="h-9 gap-2">
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Category
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CategoryForm;
