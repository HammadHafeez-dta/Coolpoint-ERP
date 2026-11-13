import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, isValid } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/shared/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/utils";
import { Employee, employeeService } from "../services/employeeService";
import { authService } from "@/modules/auth/services/authService";
import {
    PERSONAL_FIELDS,
    PersonalFieldGroup,
} from "../utils/applicantFields";

interface ApplicantPersonalInfoDialogProps {
    employee: Employee | null;
    isOpen: boolean;
    onClose: () => void;
}

const GROUPS: PersonalFieldGroup[] = ["Basic", "Contact", "Other"];

function getInitials(name?: string): string {
    if (!name) return "AP";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDateValue(val: unknown): string {
    if (!val) return "-";
    try {
        const d = typeof val === "string" ? new Date(val) : (val instanceof Date ? val : null);
        if (d && isValid(d)) {
            return format(d, "dd MMM yyyy");
        }
    } catch {
        return "-";
    }
    return "-";
}

function formatTextValue(val: unknown): string {
    if (val === null || val === undefined || val === "") return "-";
    if (typeof val === "boolean") return val ? "Yes" : "No";
    if (Array.isArray(val)) {
        return val.length > 0 ? `${val.length} dependents` : "-";
    }
    return String(val);
}

export const ApplicantPersonalInfoDialog: React.FC<ApplicantPersonalInfoDialogProps> = ({
    employee,
    isOpen,
    onClose,
}) => {
    const userSite = authService.getSite() || "";
    const currentCardNo = employee?.empCardNo;

    const { data: fullEmployee } = useQuery<Employee | null>({
        queryKey: ["applicant-personal-info", currentCardNo, employee?.site || userSite],
        queryFn: async () => {
            if (!currentCardNo) return null;
            try {
                return await employeeService.getByCardNo(currentCardNo, employee?.site || userSite);
            } catch {
                return null;
            }
        },
        enabled: isOpen && !!currentCardNo,
        staleTime: 5 * 60 * 1000,
    });

    // Ensure stale data from a previously viewed employee is never displayed
    const isCurrentData = fullEmployee?.empCardNo === currentCardNo;
    const activeFullEmployee = isCurrentData ? fullEmployee : null;
    const displayEmployee = activeFullEmployee || employee;

    const photoUrl = useMemo(() => {
        const pic = activeFullEmployee?.empPicture;
        if (pic) {
            if (pic.startsWith("data:") || pic.startsWith("http")) return pic;
            return `data:image/jpeg;base64,${pic}`;
        }
        return null;
    }, [activeFullEmployee]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="flex flex-col w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] sm:max-h-[90dvh] p-0 rounded-xl border border-border shadow-lg bg-background overflow-hidden gap-0"
            >
                {/* Fixed Header */}
                <div className="p-5 border-b border-border flex items-center gap-4 pr-12 shrink-0 bg-card">
                    <Avatar className="h-12 w-12 border border-border shadow-xs shrink-0">
                        {photoUrl && (
                            <AvatarImage
                                src={photoUrl}
                                alt={displayEmployee?.empName || "Applicant"}
                            />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                            {getInitials(displayEmployee?.empName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <DialogTitle className="text-base font-bold text-foreground truncate">
                            {displayEmployee?.empName || "Applicant Details"}
                        </DialogTitle>
                        <DialogDescription className="text-xs font-sans text-muted-foreground mt-0.5">
                            Card #{displayEmployee?.empCardNo ?? "-"}
                        </DialogDescription>
                    </div>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto min-h-0 p-5 space-y-5">
                    {GROUPS.map((group) => {
                        const groupFields = PERSONAL_FIELDS.filter((f) => f.group === group);
                        if (groupFields.length === 0) return null;

                        return (
                            <div key={group} className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">
                                    {group} Information
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {groupFields.map((field) => {
                                        const Icon = field.icon;
                                        const rawVal = displayEmployee ? displayEmployee[field.key] : undefined;
                                        const displayVal = field.format === "date"
                                            ? formatDateValue(rawVal)
                                            : formatTextValue(rawVal);
                                        const isAddress = field.key === "address";
                                        const isEmail = field.key === "email";

                                        return (
                                            <div
                                                key={String(field.key)}
                                                className={cn(
                                                    "flex items-start gap-2.5 p-2.5 rounded-lg bg-secondary/30 border border-border/50",
                                                    isAddress && "col-span-1 sm:col-span-2"
                                                )}
                                            >
                                                {Icon && (
                                                    <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[11px] font-medium text-muted-foreground">
                                                        {field.label}
                                                    </p>
                                                    <p
                                                        className={cn(
                                                            "text-xs font-semibold text-foreground mt-0.5",
                                                            isAddress
                                                                ? "break-words whitespace-normal"
                                                                : isEmail
                                                                ? "break-all"
                                                                : "break-words"
                                                        )}
                                                    >
                                                        {displayVal}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Fixed Footer */}
                <div className="p-4 border-t border-border shrink-0 flex justify-end bg-card">
                    <Button variant="outline" size="sm" onClick={onClose} className="h-9">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ApplicantPersonalInfoDialog;
