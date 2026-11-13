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
import { locationService, Location } from "../services/locationService";
import { Loader2 } from "lucide-react";

interface LocationFormProps {
    locationItem: Location | null;
    isOpen: boolean;
    onClose: () => void;
}

const LocationForm = ({ locationItem, isOpen, onClose }: LocationFormProps) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<Partial<Location>>(locationItem || {});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (locationItem) {
            setFormData(locationItem);
        } else if (isOpen) {
            locationService.getNextCode().then(code => {
                setFormData(prev => ({ ...prev, locationNo: code }));
            }).catch(() => {});
        }
    }, [locationItem, isOpen]);

    const mutation = useMutation<Location | void, Error, Partial<Location>>({
        mutationFn: (data: Partial<Location>) =>
            locationItem
                ? locationService.update(locationItem.locationNo, data)
                : locationService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locations'] });
            toast({
                title: "Success",
                description: `Location ${locationItem ? 'updated' : 'created'} successfully.`
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

    const handleInputChange = (field: keyof Location, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.locationName) {
            toast({ title: "Validation Error", description: "Location Name is required.", variant: "destructive" });
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
                        {locationItem ? "Edit Location" : "New Location"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Location Code</Label>
                        <Input
                            value={formData.locationNo || ''}
                            readOnly
                            className="bg-secondary/50 font-sans font-bold h-9"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Location Name</Label>
                        <Input
                            value={formData.locationName || ''}
                            onChange={(e) => handleInputChange('locationName', e.target.value)}
                            className="h-9"
                            placeholder="Enter location name"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    <Button variant="outline" onClick={onClose} className="h-9">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="h-9 gap-2">
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Location
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LocationForm;
