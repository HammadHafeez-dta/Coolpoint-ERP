import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Search, Plus, Edit, Trash2, Loader2, ArrowLeft, Briefcase
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
import { jobPostService, JobPost } from "../services/jobPostService";
import { authService } from "@/modules/auth/services/authService";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/shared/components/ui/textarea";

const JobPostPage = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const userSite = authService.getSite();

    const {
        data: jobs = [],
        isLoading: loading
    } = useQuery<JobPost[]>({
        queryKey: ['job-posts', userSite],
        queryFn: () => jobPostService.getAll(userSite),
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<JobPost | null>(null);

    const [formData, setFormData] = useState<Partial<JobPost>>({
        jobCode: "",
        designation: "",
        description: "",
        postedDate: new Date().toISOString().split('T')[0],
        status: "Open"
    });

    const deleteMutation = useMutation({
        mutationFn: ({ id, site }: { id: number; site: string }) => jobPostService.delete(id, site),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job-posts'] });
            toast({ title: "Success", description: "Job Post deleted successfully." });
        }
    });

    const saveMutation = useMutation({
        mutationFn: (data: Partial<JobPost>) => {
            if (editingRecord) {
                return jobPostService.update(editingRecord.jobPostId, userSite, { ...editingRecord, ...data } as JobPost);
            }
            return jobPostService.create({ ...data, site: userSite } as Omit<JobPost, 'jobPostId'>);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job-posts'] });
            toast({ title: "Success", description: "Job Post record saved." });
            setIsFormOpen(false);
        }
    });

    const handleCreateClick = () => {
        setEditingRecord(null);
        setFormData({
            jobCode: "",
            designation: "",
            description: "",
            postedDate: new Date().toISOString().split('T')[0],
            status: "Open"
        });
        setIsFormOpen(true);
    };

    const handleEdit = (record: JobPost) => {
        setEditingRecord(record);
        setFormData({ ...record });
        setIsFormOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure?")) deleteMutation.mutate({ id, site: userSite });
    };

    const filteredRecords = useMemo(() => {
        return jobs.filter(r =>
            r.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.jobCode?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [jobs, searchTerm]);

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <Briefcase className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Job Posts</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button onClick={handleCreateClick} className="gap-1.5 h-8 text-xs bg-[#171858] hover:bg-[#121344] text-white shadow-xs active:scale-[0.98] transition-transform">
                        <Plus className="w-3.5 h-3.5" /> Add Job Post
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-6 space-y-6 max-w-[1600px] mx-auto w-full">
                <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search by Designation or Job ID..."
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
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Job ID</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Designation</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Posted Date</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Status</TableHead>
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
                                <TableRow key={record.jobPostId} className="hover:bg-secondary/20 transition-colors border-border">
                                    <TableCell className="font-bold text-sm text-foreground">{record.jobCode}</TableCell>
                                    <TableCell className="text-sm">{record.designation}</TableCell>
                                    <TableCell className="text-sm">{new Date(record.postedDate).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-sm font-semibold">{record.status}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => handleEdit(record)}>
                                                <Edit className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(record.jobPostId)}>
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
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingRecord ? "Edit Job Post" : "Add Job Post"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Job ID</label>
                                <Input placeholder="e.g. REQ-001" value={formData.jobCode || ''} onChange={e => setFormData({ ...formData, jobCode: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Designation</label>
                                <Input placeholder="e.g. Software Engineer" value={formData.designation || ''} onChange={e => setFormData({ ...formData, designation: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Posted Date</label>
                                <Input type="date" value={formData.postedDate?.split('T')[0] || ''} onChange={e => setFormData({ ...formData, postedDate: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</label>
                                <Input placeholder="Open" value={formData.status || ''} onChange={e => setFormData({ ...formData, status: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Job Description</label>
                            <Textarea 
                                placeholder="Enter job description and requirements..." 
                                className="min-h-[150px]"
                                value={formData.description || ''} 
                                onChange={e => setFormData({ ...formData, description: e.target.value })} 
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-4 border-t border-border">
                            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                            <Button onClick={() => saveMutation.mutate(formData)} disabled={saveMutation.isPending}>
                                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Job Post"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default JobPostPage;
