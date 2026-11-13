import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Search, Plus, Edit, Trash2, Loader2, ArrowLeft, FileCheck, FileDown, UserPlus, User
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/shared/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog";
import { useToast } from "@/shared/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmationLetterService, ConfirmationLetter } from "../services/confirmationLetterService";
import { authService } from "@/modules/auth/services/authService";
import { useNavigate } from "react-router-dom";
import { EmployeeSelectModal } from "../components/EmployeeSelectModal";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";

const ConfirmationLetterPage = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const userSite = authService.getSite();

    const {
        data: letters = [],
        isLoading: loading
    } = useQuery<ConfirmationLetter[]>({
        queryKey: ['confirmationLetters', userSite],
        queryFn: () => confirmationLetterService.getAll(userSite),
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<ConfirmationLetter | null>(null);
    const [loadingReportId, setLoadingReportId] = useState<number | null>(null);
    const [isManualEntry, setIsManualEntry] = useState(false);

    const [formData, setFormData] = useState<Partial<ConfirmationLetter>>({
        empCardNo: 0,
        issueDate: new Date().toISOString().split('T')[0],
        probationEndDate: new Date().toISOString().split('T')[0],
        remarks: "",
        manualEmpName: "",
        manualDesignation: "",
        signatoryName: ""
    });

    const deleteMutation = useMutation({
        mutationFn: ({ id, site }: { id: number; site: string }) => confirmationLetterService.delete(id, site),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['confirmationLetters'] });
            toast({ title: "Success", description: "Letter deleted successfully." });
        }
    });

    const saveMutation = useMutation({
        mutationFn: (data: Partial<ConfirmationLetter>) => {
            const payload = { ...data };
            if (isManualEntry) {
                payload.empCardNo = 0;
            } else {
                payload.manualEmpName = "";
                payload.manualDesignation = "";
            }

            if (editingRecord) {
                return confirmationLetterService.update(editingRecord.serialNo, userSite, { ...editingRecord, ...payload } as ConfirmationLetter);
            }
            return confirmationLetterService.create({ ...payload, site: userSite } as Omit<ConfirmationLetter, 'serialNo'>);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['confirmationLetters'] });
            toast({ title: "Success", description: "Letter saved." });
            setIsFormOpen(false);
        }
    });

    const handleCreateClick = () => {
        setEditingRecord(null);
        setIsManualEntry(false);
        setFormData({
            empCardNo: 0,
            issueDate: new Date().toISOString().split('T')[0],
            probationEndDate: new Date().toISOString().split('T')[0],
            remarks: "",
            manualEmpName: "",
            manualDesignation: "",
            signatoryName: ""
        });
        setIsFormOpen(true);
    };

    const handleEdit = (record: ConfirmationLetter) => {
        setEditingRecord(record);
        setIsManualEntry(record.empCardNo === 0);
        setFormData({ ...record });
        setIsFormOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure?")) deleteMutation.mutate({ id, site: userSite });
    };

    const handleViewReport = async (id: number) => {
        try {
            setLoadingReportId(id);
            await confirmationLetterService.viewReport(id, userSite);
        } finally {
            setLoadingReportId(null);
        }
    };

    const filteredRecords = useMemo(() => {
        return letters.filter(r =>
            r.empCardNo.toString().includes(searchTerm) ||
            r.empName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.manualEmpName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [letters, searchTerm]);

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <FileCheck className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Confirmation Letters</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button onClick={handleCreateClick} className="gap-1.5 h-8 text-xs bg-[#171858] hover:bg-[#121344] text-white shadow-xs active:scale-[0.98] transition-transform">
                        <Plus className="w-3.5 h-3.5" /> Add Letter
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-6 space-y-6 max-w-[1600px] mx-auto w-full">
                <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="relative w-full max-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search by ID or Name..."
                            className="pl-10 h-11 bg-background/50 border-border"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-secondary/30">
                            <TableRow className="border-border">
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Employee</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Issue Date</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Probation End</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Remarks</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredRecords.map((record) => (
                                <TableRow key={record.serialNo} className="hover:bg-secondary/20 transition-colors border-border">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-foreground">
                                                {record.empCardNo > 0 ? record.empName : record.manualEmpName}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {record.empCardNo > 0 ? `ID: ${record.empCardNo}` : "Manual Entry"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">{new Date(record.issueDate).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-sm">{new Date(record.probationEndDate).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-sm max-w-[200px] truncate">{record.remarks}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-sidebar hover:bg-sidebar/5"
                                                onClick={() => handleViewReport(record.serialNo)}
                                                disabled={loadingReportId === record.serialNo}
                                                title="Print Letter"
                                            >
                                                {loadingReportId === record.serialNo ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <FileDown className="w-3.5 h-3.5" />
                                                )}
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => handleEdit(record)}>
                                                <Edit className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(record.serialNo)}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </motion.div>
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingRecord ? "Edit Confirmation Letter" : "Create Confirmation Letter"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center space-x-2 pb-2 border-b border-border/50">
                            <Checkbox 
                                id="manual" 
                                checked={isManualEntry} 
                                onCheckedChange={(checked) => setIsManualEntry(!!checked)}
                            />
                            <Label htmlFor="manual" className="text-sm font-medium cursor-pointer">
                                Manual Entry (for New Employees)
                            </Label>
                        </div>

                        {!isManualEntry ? (
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Select Employee</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input 
                                            placeholder="Emp Card No" 
                                            type="number" 
                                            className="pl-10"
                                            value={formData.empCardNo || ''} 
                                            onChange={e => setFormData({ ...formData, empCardNo: parseInt(e.target.value) })} 
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="shrink-0 border-primary/20 bg-primary/5 hover:bg-primary/10"
                                        onClick={() => setIsEmployeeModalOpen(true)}
                                    >
                                        <Search className="w-4 h-4 text-primary" />
                                    </Button>
                                </div>
                                {formData.empName && (
                                    <p className="text-xs font-bold text-primary pl-1">Selected: {formData.empName}</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4 p-3 bg-secondary/20 rounded-lg border border-dashed border-border">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">New Person Name</Label>
                                    <Input 
                                        placeholder="Full Name" 
                                        value={formData.manualEmpName || ''} 
                                        onChange={e => setFormData({ ...formData, manualEmpName: e.target.value })} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Assigned Position</Label>
                                    <Input 
                                        placeholder="e.g. Junior Accountant" 
                                        value={formData.manualDesignation || ''} 
                                        onChange={e => setFormData({ ...formData, manualDesignation: e.target.value })} 
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Issue Date</Label>
                                <Input type="date" value={formData.issueDate?.split('T')[0] || ''} onChange={e => setFormData({ ...formData, issueDate: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Probation End</Label>
                                <Input type="date" value={formData.probationEndDate?.split('T')[0] || ''} onChange={e => setFormData({ ...formData, probationEndDate: e.target.value })} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Remarks / Duties</Label>
                            <Input placeholder="Mention key responsibilities..." value={formData.remarks || ''} onChange={e => setFormData({ ...formData, remarks: e.target.value })} />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Signatory Name</Label>
                            <Input placeholder="Who is signing this?" value={formData.signatoryName || ''} onChange={e => setFormData({ ...formData, signatoryName: e.target.value })} />
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
                            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                            <Button 
                                onClick={() => saveMutation.mutate(formData)} 
                                disabled={saveMutation.isPending}
                                className="min-w-[100px]"
                            >
                                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Letter"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <EmployeeSelectModal
                isOpen={isEmployeeModalOpen}
                onClose={() => setIsEmployeeModalOpen(false)}
                onSelect={(employee) => {
                    setFormData(prev => ({ 
                        ...prev, 
                        empCardNo: employee.empCardNo,
                        empName: employee.empName
                    }));
                }}
            />
        </div>
    );
};

export default ConfirmationLetterPage;
