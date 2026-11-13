import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Search, Plus, Edit, Trash2, Loader2, Star, User, ClipboardList, CheckCircle2, AlertCircle, FileDown
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
import { performanceService, Performance } from "../services/performanceService";
import { authService } from "@/modules/auth/services/authService";
import { useNavigate } from "react-router-dom";
import { EmployeeSelectModal } from "../components/EmployeeSelectModal";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/utils/utils";
import { Checkbox } from "@/shared/components/ui/checkbox";

const criteriaGroups = [
    { id: 'A', title: 'Work Quality', items: [{ id: 'a1', label: 'Accuracy & Attention' }, { id: 'a2', label: 'Consistency' }] },
    { id: 'B', title: 'Productivity', items: [{ id: 'b1', label: 'Meeting Deadlines' }, { id: 'b2', label: 'Work Volume' }] },
    { id: 'C', title: 'Technical Skills', items: [{ id: 'c1', label: 'Job Knowledge' }, { id: 'c2', label: 'Tools/Technology' }] },
    { id: 'D', title: 'Communication', items: [{ id: 'd1', label: 'Clarity' }, { id: 'd2', label: 'Responsiveness' }] },
    { id: 'E', title: 'Teamwork', items: [{ id: 'e1', label: 'Collaboration' }, { id: 'e2', label: 'Attitude' }] },
    { id: 'F', title: 'Problem Solving', items: [{ id: 'f1', label: 'Challenges' }, { id: 'f2', label: 'Decision Making' }] },
    { id: 'G', title: 'Reliability', items: [{ id: 'g1', label: 'Punctuality' }, { id: 'g2', label: 'Dependability' }] },
    { id: 'H', title: 'Initiative', items: [{ id: 'h1', label: 'Responsibility' }, { id: 'h2', label: 'Proactiveness' }] },
];

const recommendations = [
    "Promotion", "Salary Increase", "Training Required", "No Change", "Performance Improvement Plan"
];

const PerformancePage = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const userSite = authService.getSite();
    const currentUser = authService.getCurrentUser();

    const {
        data: performances = [],
        isLoading: loading
    } = useQuery<Performance[]>({
        queryKey: ['performances', userSite],
        queryFn: () => performanceService.getAll(userSite),
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<Performance | null>(null);
    const [loadingReportId, setLoadingReportId] = useState<number | null>(null);

    const [formData, setFormData] = useState<Partial<Performance>>({
        empCardNo: 0,
        reviewDate: new Date().toISOString().split('T')[0],
        reviewerName: currentUser?.username || "",
        overallRating: 3,
        recommendation: "",
        enterBy: currentUser?.username || ""
    });

    const deleteMutation = useMutation({
        mutationFn: ({ id, site }: { id: number; site: string }) => performanceService.delete(id, site),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['performances'] });
            toast({ title: "Success", description: "Record deleted successfully." });
        }
    });

    const saveMutation = useMutation({
        mutationFn: (data: Partial<Performance>) => {
            if (editingRecord) {
                return performanceService.update(editingRecord.serialNo, userSite, { ...editingRecord, ...data } as Performance);
            }
            return performanceService.create({ ...data, site: userSite, enterBy: currentUser?.username } as Omit<Performance, 'serialNo'>);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['performances'] });
            toast({ title: "Success", description: "Performance record saved." });
            setIsFormOpen(false);
        }
    });

    const handleCreateClick = () => {
        setEditingRecord(null);
        setFormData({
            empCardNo: 0,
            reviewDate: new Date().toISOString().split('T')[0],
            reviewerName: currentUser?.username || "",
            overallRating: 3,
            recommendation: "",
            enterBy: currentUser?.username || ""
        });
        setIsFormOpen(true);
    };

    const handleEdit = async (record: Performance) => {
        try {
            const fullRecord = await performanceService.getById(record.serialNo, userSite);
            setEditingRecord(fullRecord);
            setFormData({ ...fullRecord });
            setIsFormOpen(true);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to load record details." });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure?")) deleteMutation.mutate({ id, site: userSite });
    };

    const handleViewReport = async (id: number) => {
        try {
            setLoadingReportId(id);
            await performanceService.viewReport(id, userSite);
        } finally {
            setLoadingReportId(null);
        }
    };

    const filteredRecords = useMemo(() => {
        return performances.filter(r =>
            r.reviewerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.empName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.empCardNo.toString().includes(searchTerm)
        );
    }, [performances, searchTerm]);

    const RatingSelector = ({ value, onChange }: { value: number, onChange: (v: number) => void }) => (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    className={cn(
                        "w-7 h-7 rounded-md flex items-center justify-center transition-all",
                        value >= star ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    )}
                >
                    <Star className={cn("w-3.5 h-3.5", value >= star && "fill-current")} />
                </button>
            ))}
        </div>
    );

    const handleRecommendationToggle = (rec: string) => {
        const currentRecs = formData.recommendation?.split(',').filter(Boolean) || [];
        const newRecs = currentRecs.includes(rec) 
            ? currentRecs.filter(r => r !== rec)
            : [...currentRecs, rec];
        setFormData({ ...formData, recommendation: newRecs.join(',') });
    };

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <ClipboardList className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Performance Appraisal</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button onClick={handleCreateClick} className="gap-1.5 h-8 text-xs bg-[#171858] hover:bg-[#121344] text-white shadow-xs active:scale-[0.98] transition-transform">
                        <Plus className="w-3.5 h-3.5" /> New Review
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-6 space-y-6 max-w-[1600px] mx-auto w-full">
                <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search by Employee or Reviewer..."
                            className="pl-10 h-11 bg-background/50 border-border rounded-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-secondary/30">
                            <TableRow className="border-border hover:bg-transparent">
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4 px-6">Employee</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Review Date</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Reviewer</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Rating</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Status</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4 text-right px-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto opacity-50" />
                                        <p className="mt-4 text-sm text-muted-foreground">Loading performance records...</p>
                                    </TableCell>
                                </TableRow>
                            ) : filteredRecords.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <AlertCircle className="w-12 h-12 mb-2 opacity-20" />
                                            <p>No performance records found.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredRecords.map((record) => (
                                <TableRow key={record.serialNo} className="hover:bg-secondary/20 transition-all border-border group">
                                    <TableCell className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-foreground">{record.empName || "Unknown Employee"}</span>
                                            <span className="text-[10px] text-muted-foreground font-medium uppercase">ID: {record.empCardNo}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm font-medium">{new Date(record.reviewDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                                    <TableCell className="text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-sidebar" />
                                            {record.reviewerName}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star key={s} className={cn("w-3 h-3", s <= (record.overallRating || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30")} />
                                                ))}
                                            </div>
                                            <span className="text-xs font-bold text-muted-foreground">{(record.overallRating || 0).toFixed(1)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {record.recommendation?.split(',').slice(0, 2).map((rec, i) => (
                                                <span key={i} className="px-2 py-0.5 rounded-full bg-primary/10 text-[9px] font-bold text-primary border border-primary/20">
                                                    {rec}
                                                </span>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-6">
                                        <div className="flex items-center justify-end gap-1 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-sidebar hover:bg-sidebar/5"
                                                onClick={() => handleViewReport(record.serialNo)}
                                                disabled={loadingReportId === record.serialNo}
                                                title="Print Appraisal"
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
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
                    <DialogHeader className="p-6 border-b border-border">
                        <DialogTitle className="text-xl font-bold tracking-tight">
                            {editingRecord ? "Update Appraisal Record" : "New Performance Appraisal"}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-background">
                        {/* Header Info Section */}
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-border">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Employee Selection</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input 
                                            placeholder="Card No" 
                                            type="number" 
                                            className="pl-10 h-10 bg-background border-border"
                                            value={formData.empCardNo || ''} 
                                            onChange={e => setFormData({ ...formData, empCardNo: parseInt(e.target.value) })} 
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="shrink-0"
                                        onClick={() => setIsEmployeeModalOpen(true)}
                                    >
                                        Search
                                    </Button>
                                </div>
                                {formData.empName && (
                                    <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-secondary/50 rounded border border-border w-fit">
                                        <CheckCircle2 className="w-3 h-3 text-primary" />
                                        <span className="text-xs font-bold">{formData.empName}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Review Date</Label>
                                <Input 
                                    type="date" 
                                    className="h-10 bg-background border-border"
                                    value={formData.reviewDate?.split('T')[0] || ''} 
                                    onChange={e => setFormData({ ...formData, reviewDate: e.target.value })} 
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Reviewer Name</Label>
                                <Input 
                                    placeholder="Enter reviewer name" 
                                    className="h-10 bg-background border-border"
                                    value={formData.reviewerName || ''} 
                                    onChange={e => setFormData({ ...formData, reviewerName: e.target.value })} 
                                />
                            </div>
                        </section>

                        {/* Performance Criteria Grid */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between border-b border-border pb-2">
                                <h3 className="text-sm font-bold uppercase text-foreground flex items-center gap-2">
                                    Performance Criteria
                                </h3>
                                <span className="text-[10px] text-muted-foreground italic">(Rating: 1 = Poor, 5 = Excellent)</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                {criteriaGroups.map((group) => (
                                    <div key={group.id} className="space-y-4">
                                        <div className="flex items-center gap-2 border-b border-border pb-1">
                                            <h4 className="text-xs font-bold uppercase text-primary">{group.title}</h4>
                                        </div>
                                        <div className="space-y-3 pl-2">
                                            {group.items.map((item) => (
                                                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <Label className="text-xs font-medium text-muted-foreground">{item.label}</Label>
                                                    <RatingSelector 
                                                        value={(formData as any)[item.id] || 0} 
                                                        onChange={(v) => setFormData({ ...formData, [item.id]: v })} 
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Text Feedback Section */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border">
                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Key Achievements</Label>
                                <Textarea 
                                    className="min-h-[100px] bg-background border-border"
                                    placeholder="Describe major successes and contributions..."
                                    value={formData.keyAchievements || ''}
                                    onChange={e => setFormData({ ...formData, keyAchievements: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Areas for Improvement</Label>
                                <Textarea 
                                    className="min-h-[100px] bg-background border-border"
                                    placeholder="Identify weaknesses and training needs..."
                                    value={formData.areasForImprovement || ''}
                                    onChange={e => setFormData({ ...formData, areasForImprovement: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3 md:col-span-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Goals for Next Period</Label>
                                <Textarea 
                                    className="min-h-[80px] bg-background border-border"
                                    placeholder="Set specific, measurable objectives..."
                                    value={formData.goalsNextPeriod || ''}
                                    onChange={e => setFormData({ ...formData, goalsNextPeriod: e.target.value })}
                                />
                            </div>
                        </section>

                        {/* Final Scoring Section */}
                        <section className="bg-secondary/20 rounded-xl p-8 border border-border grid grid-cols-1 md:grid-cols-12 gap-8">
                            <div className="md:col-span-4 flex flex-col items-center justify-center space-y-4 md:border-r border-border md:pr-8">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Overall Rating</Label>
                                <div className="text-5xl font-black text-foreground flex items-baseline">
                                    {formData.overallRating || 0}
                                    <span className="text-lg text-muted-foreground ml-1">/ 5</span>
                                </div>
                                <div className="flex gap-1.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button 
                                            key={s} 
                                            type="button"
                                            onClick={() => setFormData({...formData, overallRating: s})}
                                            className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                                (formData.overallRating || 0) >= s ? "bg-primary text-white" : "bg-background text-muted-foreground border border-border"
                                            )}
                                        >
                                            <Star className={cn("w-4 h-4", (formData.overallRating || 0) >= s && "fill-current")} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="md:col-span-8 space-y-4">
                                <Label className="text-xs font-bold uppercase text-muted-foreground block mb-4">Final Recommendation</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                                    {recommendations.map((rec) => (
                                        <div key={rec} className="flex items-center space-x-3 cursor-pointer" onClick={() => handleRecommendationToggle(rec)}>
                                            <Checkbox 
                                                id={rec} 
                                                checked={formData.recommendation?.split(',').includes(rec)}
                                                className="border-border data-[state=checked]:bg-primary"
                                            />
                                            <Label 
                                                htmlFor={rec} 
                                                className={cn(
                                                    "text-sm font-medium cursor-pointer",
                                                    formData.recommendation?.split(',').includes(rec) ? "text-foreground font-bold" : "text-muted-foreground"
                                                )}
                                            >
                                                {rec}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Comments Section */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-4">
                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Reviewer Comments</Label>
                                <Textarea 
                                    className="bg-background border-border"
                                    placeholder="Official reviewer remarks..."
                                    value={formData.reviewerComments || ''}
                                    onChange={e => setFormData({ ...formData, reviewerComments: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Employee Feedback</Label>
                                <Textarea 
                                    className="bg-background border-border"
                                    placeholder="Employee's perspective or comments..."
                                    value={formData.employeeComments || ''}
                                    onChange={e => setFormData({ ...formData, employeeComments: e.target.value })}
                                />
                            </div>
                        </section>
                    </div>

                    <div className="p-6 bg-card border-t border-border flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="bg-secondary/50 px-3 py-1 rounded-md border border-border">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Recorded By:</span>
                                <span className="ml-2 text-xs font-bold text-foreground">{formData.enterBy || currentUser?.username || "System"}</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setIsFormOpen(false)} className="h-10 px-6 font-semibold">
                                Discard Changes
                            </Button>
                            <Button 
                                onClick={() => saveMutation.mutate(formData)} 
                                disabled={saveMutation.isPending}
                                className="h-10 px-10 font-bold shadow-lg shadow-primary/30 min-w-[150px]"
                            >
                                {saveMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : editingRecord ? "Update Record" : "Finalize Appraisal"}
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

export default PerformancePage;
