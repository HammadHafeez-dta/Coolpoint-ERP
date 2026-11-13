import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Search, Plus, Edit, Trash2, Loader2, ArrowLeft, FileText, FileDown
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
import { recommendationLetterService, RecommendationLetter } from "../services/recommendationLetterService";
import { authService } from "@/modules/auth/services/authService";
import { useNavigate } from "react-router-dom";
import { EmployeeSelectModal } from "../components/EmployeeSelectModal";

const RecommendationLetterPage = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const userSite = authService.getSite();

    const {
        data: letters = [],
        isLoading: loading
    } = useQuery<RecommendationLetter[]>({
        queryKey: ['recommendationLetters', userSite],
        queryFn: () => recommendationLetterService.getAll(userSite),
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<RecommendationLetter | null>(null);
    const [loadingReportId, setLoadingReportId] = useState<number | null>(null);

    const [formData, setFormData] = useState<Partial<RecommendationLetter>>({
        empCardNo: 0,
        issueDate: new Date().toISOString().split('T')[0],
        remarks: "",
        recommendedBy: ""
    });

    const deleteMutation = useMutation({
        mutationFn: ({ id, site }: { id: number; site: string }) => recommendationLetterService.delete(id, site),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recommendationLetters'] });
            toast({ title: "Success", description: "Letter deleted successfully." });
        }
    });

    const saveMutation = useMutation({
        mutationFn: (data: Partial<RecommendationLetter>) => {
            if (editingRecord) {
                return recommendationLetterService.update(editingRecord.serialNo, userSite, { ...editingRecord, ...data } as RecommendationLetter);
            }
            return recommendationLetterService.create({ ...data, site: userSite } as Omit<RecommendationLetter, 'serialNo'>);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recommendationLetters'] });
            toast({ title: "Success", description: "Letter saved." });
            setIsFormOpen(false);
        }
    });

    const handleCreateClick = () => {
        setEditingRecord(null);
        setFormData({
            empCardNo: 0,
            issueDate: new Date().toISOString().split('T')[0],
            remarks: "",
            recommendedBy: ""
        });
        setIsFormOpen(true);
    };

    const handleEdit = (record: RecommendationLetter) => {
        setEditingRecord(record);
        setFormData({ ...record });
        setIsFormOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure?")) deleteMutation.mutate({ id, site: userSite });
    };

    const handleViewReport = async (id: number) => {
        try {
            setLoadingReportId(id);
            await recommendationLetterService.viewReport(id, userSite);
        } finally {
            setLoadingReportId(null);
        }
    };

    const filteredRecords = useMemo(() => {
        return letters.filter(r =>
            r.empCardNo.toString().includes(searchTerm) ||
            r.empName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.recommendedBy?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [letters, searchTerm]);

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Recommendation Letters</h2>
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
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search by ID or Recommended By..."
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
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Emp ID</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Employee Name</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Issue Date</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Recommended By</TableHead>
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
                                    <TableCell className="font-bold text-sm text-foreground">{record.empCardNo}</TableCell>
                                    <TableCell className="text-sm font-medium">{record.empName}</TableCell>
                                    <TableCell className="text-sm">{new Date(record.issueDate).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-sm">{record.recommendedBy}</TableCell>
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingRecord ? "Edit Letter" : "Add Letter"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="flex gap-2">
                            <div className="flex-1 space-y-1">
                                <Input placeholder="Emp Card No" type="number" value={formData.empCardNo || ''} onChange={e => setFormData({ ...formData, empCardNo: parseInt(e.target.value) })} />
                                {formData.empName && <p className="text-[10px] text-primary font-medium ml-1">{formData.empName}</p>}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="shrink-0 border-primary/20 bg-primary/5 hover:bg-primary/10"
                                onClick={() => setIsEmployeeModalOpen(true)}
                                title="Search Employee"
                            >
                                <Search className="w-4 h-4 text-primary" />
                            </Button>
                        </div>
                        <Input placeholder="Issue Date" type="date" value={formData.issueDate?.split('T')[0] || ''} onChange={e => setFormData({ ...formData, issueDate: e.target.value })} />
                        <Input placeholder="Recommended By" value={formData.recommendedBy || ''} onChange={e => setFormData({ ...formData, recommendedBy: e.target.value })} />
                        <Input placeholder="Remarks" value={formData.remarks || ''} onChange={e => setFormData({ ...formData, remarks: e.target.value })} />
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                            <Button onClick={() => saveMutation.mutate(formData)} disabled={saveMutation.isPending}>Save</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <EmployeeSelectModal
                isOpen={isEmployeeModalOpen}
                onClose={() => setIsEmployeeModalOpen(false)}
                onSelect={(employee) => {
                    setFormData(prev => ({ ...prev, empCardNo: employee.empCardNo, empName: employee.empName }));
                }}
            />
        </div>
    );
};

export default RecommendationLetterPage;
