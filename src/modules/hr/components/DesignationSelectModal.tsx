import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Search, Loader2, Briefcase, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { designationService, Designation } from "@/modules/hr/services/designationService";
import { authService } from "@/modules/auth/services/authService";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { cn } from "@/shared/utils/utils";

interface DesignationSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (desig: Designation) => void;
    selectedCode?: number;
}

export const DesignationSelectModal = ({ isOpen, onClose, onSelect, selectedCode }: DesignationSelectModalProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const userSite = authService.getSite();

    // Fetch designations
    const { data: designations = [], isLoading } = useQuery({
        queryKey: ['designations', userSite],
        queryFn: () => designationService.getAll(userSite),
        enabled: isOpen,
        staleTime: 5 * 60 * 1000
    });

    const filteredDesigs = designations.filter(d =>
        d.designationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.designationCode.toString().includes(searchQuery)
    );

    useEffect(() => {
        if (!isOpen) setSearchQuery("");
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">
                <DialogHeader className="p-4 border-b border-border bg-muted/40">
                    <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" />
                        Select Designation
                    </DialogTitle>
                </DialogHeader>

                <div className="p-4 border-b border-border bg-background">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-muted/50 border-transparent focus:bg-background focus:border-primary/50 transition-colors"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="h-[400px]">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            <span className="text-xs">Loading designations...</span>
                        </div>
                    ) : filteredDesigs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                            <span className="text-sm">No designations found.</span>
                        </div>
                    ) : (
                        <ScrollArea className="h-full">
                            <div className="p-2 space-y-1">
                                {filteredDesigs.map((desig) => (
                                    <div
                                        key={desig.designationCode}
                                        onClick={() => {
                                            onSelect(desig);
                                            onClose();
                                        }}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border border-transparent",
                                            "hover:bg-muted hover:border-border",
                                            selectedCode === desig.designationCode ? "bg-primary/5 border-primary/20" : ""
                                        )}
                                    >
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                "font-medium text-sm",
                                                selectedCode === desig.designationCode ? "text-primary" : "text-foreground"
                                            )}>
                                                {desig.designationName}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-sans">
                                                Code: {desig.designationCode}
                                            </span>
                                        </div>
                                        {selectedCode === desig.designationCode && (
                                            <Check className="w-4 h-4 text-primary" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <div className="p-3 bg-muted/40 border-t border-border flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8">Cancel</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
