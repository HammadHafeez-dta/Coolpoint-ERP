import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
    Search, Plus, Edit, Trash2, Loader2, ArrowLeft, Users, FileText, Upload, Download
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/shared/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/components/ui/select";
import { useToast } from "@/shared/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicantService, Applicant } from "../services/applicantService";
import { jobPostService } from "../services/jobPostService";
import { employeeService } from "../services/employeeService";
import { authService } from "@/modules/auth/services/authService";
import { useNavigate } from "react-router-dom";

const ApplicantPage = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const userSite = authService.getSite();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        data: applicants = [],
        isLoading: loading
    } = useQuery<Applicant[]>({
        queryKey: ['applicants', userSite],
        queryFn: () => applicantService.getAll(userSite),
    });

    const { data: jobPosts = [] } = useQuery({
        queryKey: ['job-posts', userSite],
        queryFn: () => jobPostService.getAll(userSite),
    });

    const { data: employees = [] } = useQuery({
        queryKey: ['employees', userSite],
        queryFn: () => employeeService.getAll(userSite),
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<Applicant | null>(null);
    const [uploadingId, setUploadingId] = useState<number | null>(null);

    const [formData, setFormData] = useState<Partial<Applicant>>({
        applicantName: "",
        fatherName: "",
        cnic: "",
        phoneNo: "",
        appliedFor: "",
        applicationDate: new Date().toISOString().split('T')[0],
        status: "Pending",
        jobPostId: undefined,
        empCardNo: undefined
    });

    const deleteMutation = useMutation({
        mutationFn: ({ id, site }: { id: number; site: string }) => applicantService.delete(id, site),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applicants'] });
            toast({ title: "Success", description: "Applicant deleted successfully." });
        }
    });

    const saveMutation = useMutation({
        mutationFn: (data: Partial<Applicant>) => {
            if (editingRecord) {
                return applicantService.update(editingRecord.applicantId, userSite, { ...editingRecord, ...data } as Applicant);
            }
            return applicantService.create({ ...data, site: userSite } as Omit<Applicant, 'applicantId'>);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applicants'] });
            toast({ title: "Success", description: "Applicant record saved." });
            setIsFormOpen(false);
        }
    });

    const uploadCvMutation = useMutation({
        mutationFn: ({ id, file }: { id: number, file: File }) => applicantService.uploadCv(id, userSite, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applicants'] });
            toast({ title: "Success", description: "CV uploaded successfully." });
            setUploadingId(null);
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to upload CV.", variant: "destructive" });
            setUploadingId(null);
        }
    });

    const handleCreateClick = () => {
        setEditingRecord(null);
        setFormData({
            applicantName: "",
            fatherName: "",
            cnic: "",
            phoneNo: "",
            appliedFor: "",
            applicationDate: new Date().toISOString().split('T')[0],
            status: "Pending",
            jobPostId: undefined,
            empCardNo: undefined
        });
        setIsFormOpen(true);
    };

    const handleEdit = (record: Applicant) => {
        setEditingRecord(record);
        setFormData({ ...record });
        setIsFormOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure?")) deleteMutation.mutate({ id, site: userSite });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadingId(id);
            uploadCvMutation.mutate({ id, file });
        }
    };

    const handleDownloadCv = async (record: Applicant) => {
        try {
            const blob = await applicantService.downloadCv(record.applicantId, userSite);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = record.resumeFileName || `CV_${record.applicantName}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast({ title: "Error", description: "Failed to download CV.", variant: "destructive" });
        }
    };

    const filteredRecords = useMemo(() => {
        return applicants.filter(r =>
            r.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.cnic?.includes(searchTerm)
        );
    }, [applicants, searchTerm]);

    const handleEmployeeSelect = (val: string) => {
        const emp = employees.find(e => e.empCardNo === parseInt(val));
        if (emp) {
            setFormData({
                ...formData,
                empCardNo: emp.empCardNo,
                applicantName: emp.empName,
                fatherName: emp.empFatherName,
                cnic: emp.cnicNo,
                phoneNo: emp.phoneNo
            });
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Applicant Management</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button onClick={handleCreateClick} className="gap-1.5 h-8 text-xs bg-[#171858] hover:bg-[#121344] text-white shadow-xs active:scale-[0.98] transition-transform">
                        <Plus className="w-3.5 h-3.5" /> Add Applicant
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-6 space-y-6 max-w-6xl mx-auto w-full">
                <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search by Name or CNIC..."
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
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Name</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Job / Position</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Status</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase text-muted-foreground py-4">Resume/CV</TableHead>
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
                                <TableRow key={record.applicantId} className="hover:bg-secondary/20 transition-colors border-border">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-foreground">{record.applicantName}</span>
                                            <span className="text-[10px] text-muted-foreground">{record.cnic}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm">{record.appliedFor}</span>
                                            {record.jobPostId && (
                                                <span className="text-[10px] text-primary font-medium">
                                                    Job: {jobPosts.find(j => j.jobPostId === record.jobPostId)?.jobCode}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm font-semibold">{record.status}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {record.resumeFileName ? (
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 gap-1 text-primary hover:text-primary hover:bg-primary/10"
                                                    onClick={() => handleDownloadCv(record)}
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] max-w-[100px] truncate">{record.resumeFileName}</span>
                                                </Button>
                                            ) : (
                                                <div className="relative">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-8 gap-1 text-muted-foreground"
                                                        onClick={() => {
                                                            const input = document.createElement('input');
                                                            input.type = 'file';
                                                            input.onchange = (e) => handleFileChange(e as any, record.applicantId);
                                                            input.click();
                                                        }}
                                                        disabled={uploadingId === record.applicantId}
                                                    >
                                                        {uploadingId === record.applicantId ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <Upload className="w-3.5 h-3.5" />
                                                        )}
                                                        <span className="text-[10px]">Upload CV</span>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => handleEdit(record)}>
                                                <Edit className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(record.applicantId)}>
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
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{editingRecord ? "Edit Applicant" : "Add Applicant"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                        <div className="bg-secondary/30 p-4 rounded-lg border border-border">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Employee Selection (Optional)</h3>
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Select from Existing Employee</label>
                                <Select onValueChange={handleEmployeeSelect} value={formData.empCardNo?.toString()}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Search or select employee..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map(emp => (
                                            <SelectItem key={emp.empCardNo} value={emp.empCardNo.toString()}>
                                                {emp.empName} ({emp.empCardNo})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Applicant Name</label>
                                <Input value={formData.applicantName || ''} onChange={e => setFormData({ ...formData, applicantName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Father Name</label>
                                <Input value={formData.fatherName || ''} onChange={e => setFormData({ ...formData, fatherName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase">CNIC</label>
                                <Input value={formData.cnic || ''} onChange={e => setFormData({ ...formData, cnic: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Phone No</label>
                                <Input value={formData.phoneNo || ''} onChange={e => setFormData({ ...formData, phoneNo: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Select Job Post</label>
                                <Select 
                                    onValueChange={(val) => {
                                        const job = jobPosts.find(j => j.jobPostId === parseInt(val));
                                        setFormData({ ...formData, jobPostId: parseInt(val), appliedFor: job?.designation || "" });
                                    }} 
                                    value={formData.jobPostId?.toString()}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Link to a Job Post..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jobPosts.map(job => (
                                            <SelectItem key={job.jobPostId} value={job.jobPostId.toString()}>
                                                {job.jobCode} - {job.designation}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Applied For (Manual)</label>
                                <Input value={formData.appliedFor || ''} onChange={e => setFormData({ ...formData, appliedFor: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Application Date</label>
                                <Input type="date" value={formData.applicationDate?.split('T')[0] || ''} onChange={e => setFormData({ ...formData, applicationDate: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Status</label>
                                <Input value={formData.status || ''} onChange={e => setFormData({ ...formData, status: e.target.value })} />
                            </div>
                        </div>

                        <div className="col-span-2 flex justify-end gap-2 pt-4 border-t border-border">
                            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                            <Button onClick={() => saveMutation.mutate(formData)} disabled={saveMutation.isPending}>
                                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Applicant"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ApplicantPage;
