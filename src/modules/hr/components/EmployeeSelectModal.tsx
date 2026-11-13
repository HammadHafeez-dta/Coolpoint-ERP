import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import { Search, Loader2, UserCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { employeeService, Employee } from "../services/employeeService";
import { authService } from "@/modules/auth/services/authService";

interface EmployeeSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (employee: Employee) => void;
}

export const EmployeeSelectModal = ({ isOpen, onClose, onSelect }: EmployeeSelectModalProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const site = authService.getSite();

    const { data: employees = [], isLoading } = useQuery({
        queryKey: ['employees-search', site],
        queryFn: () => employeeService.getAll(site),
        enabled: isOpen,
        staleTime: 5 * 60 * 1000,
    });

    const filteredEmployees = employees.filter((emp) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            emp.empCardNo.toString().includes(searchLower) ||
            emp.empName?.toLowerCase().includes(searchLower) ||
            emp.deptName?.toLowerCase().includes(searchLower) ||
            emp.designationName?.toLowerCase().includes(searchLower) ||
            emp.cnicNo?.toLowerCase().includes(searchLower)
        );
    });

    useEffect(() => {
        if (isOpen) setSearchTerm("");
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 border-none shadow-2xl overflow-hidden bg-background/95 backdrop-blur-xl">
                <DialogHeader className="p-6 pb-2 border-b bg-secondary/10">
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <UserCircle className="w-6 h-6 text-primary" />
                        Select Employee
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 pb-2">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 transition-colors group-focus-within:text-primary" />
                        <Input
                            placeholder="Search by Card No, Name, Dept, Designation or CNIC..."
                            className="pl-10 h-12 bg-secondary/20 border-border focus-visible:ring-primary/20 transition-all text-sm shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-hidden p-6 pt-0">
                    <div className="border rounded-xl h-full overflow-hidden flex flex-col bg-card shadow-sm border-border/50">
                        <div className="overflow-auto flex-1 custom-scrollbar">
                            <Table>
                                <TableHeader className="bg-secondary/30 sticky top-0 z-10 backdrop-blur-sm">
                                    <TableRow className="hover:bg-transparent border-b">
                                        <TableHead className="w-[100px] font-bold text-[10px] uppercase tracking-wider">Card No</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase tracking-wider">Employee Name</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase tracking-wider">Department</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase tracking-wider">Designation</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase tracking-wider">CNIC</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-48 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                    <p className="text-xs text-muted-foreground animate-pulse">Loading employees...</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredEmployees.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center gap-2 p-8">
                                                    <Search className="h-12 w-12 text-muted-foreground/20" />
                                                    <p className="text-sm font-medium">No employees found matching "{searchTerm}"</p>
                                                    <p className="text-xs text-muted-foreground/60">Try searching with different keywords</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredEmployees.map((emp) => (
                                            <TableRow
                                                key={emp.empCardNo}
                                                className="cursor-pointer hover:bg-primary/5 transition-colors group"
                                                onClick={() => {
                                                    onSelect(emp);
                                                    onClose();
                                                }}
                                            >
                                                <TableCell className="font-bold text-xs text-primary group-hover:scale-105 transition-transform origin-left">
                                                    {emp.empCardNo}
                                                </TableCell>
                                                <TableCell className="text-xs font-semibold py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                                            {emp.empName?.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        {emp.empName}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">{emp.deptName || 'N/A'}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">{emp.designationName || 'N/A'}</TableCell>
                                                <TableCell className="text-[11px] font-sans text-muted-foreground/80">{emp.cnicNo || 'N/A'}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t bg-secondary/10 flex items-center justify-between px-6">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{filteredEmployees.length} Total Employees</span>
                        </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase font-medium">
                        Press <kbd className="px-1.5 py-0.5 rounded border bg-background font-bold text-foreground">Esc</kbd> to close
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
