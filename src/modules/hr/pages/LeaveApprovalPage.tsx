import { useState, useMemo } from "react";
import {
    Search,
    CheckCircle2,
    XCircle,
    Trash2,
    Loader2,
    Calendar,
    ArrowLeft,
    CheckSquare,
    RefreshCw,
    Filter,
    FileText,
    Clock
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import { useToast } from "@/shared/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveApprovalService, LeaveApprovalList, LeaveApprovalDetail } from "../services/leaveApprovalService";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

const getErrorMessage = (error: unknown, fallback: string): string => {
    if (typeof error === 'object' && error !== null) {
        if ('response' in error && typeof error.response === 'object' && error.response !== null && 'data' in error.response) {
            const data = error.response.data;
            if (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string') {
                return data.message;
            }
        }
        if ('message' in error && typeof error.message === 'string') {
            return error.message;
        }
    }
    return fallback;
};

const LeaveApprovalPage = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [queryParams] = useSearchParams();
    const dateParam = (name: string, fallback: string) => {
        const value = queryParams.get(name);
        if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback;
        const date = new Date(value + "T12:00:00Z");
        return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : fallback;
    };

    const [selectedApplication, setSelectedApplication] = useState<LeaveApprovalList | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [fromDate, setFromDate] = useState(() => dateParam('fromDate', format(subMonths(new Date(), 1), 'yyyy-MM-dd')));
    const [toDate, setToDate] = useState(() => dateParam('toDate', format(new Date(), 'yyyy-MM-dd')));
    const [approvedMonth, setApprovedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
    const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | 'delete' | null>(null);
    const [activeAction, setActiveAction] = useState<'approve' | 'reject' | 'delete' | null>(null);

    // Fetch leaves hard-coded to Pending status
    const { data: leaves = [], isLoading: loadingLeaves } = useQuery<LeaveApprovalList[]>({
        queryKey: ['leaves', 'Pending', fromDate, toDate, searchTerm],
        queryFn: () => leaveApprovalService.getLeaves('Pending', fromDate, toDate, searchTerm),
    });

    // Fetch leave approval history for the selected month (sorted: Pending at top, Approved in middle, Rejected at end)
    const { data: historyLeaves = [], isLoading: loadingHistoryLeaves } = useQuery<LeaveApprovalList[]>({
        queryKey: ['approveHistory', approvedMonth],
        queryFn: async () => {
            const monthDate = new Date(`${approvedMonth}-01T00:00:00`);
            const from = format(startOfMonth(monthDate), 'yyyy-MM-dd');
            const to = format(endOfMonth(monthDate), 'yyyy-MM-dd');
            const list = await leaveApprovalService.getLeaves('All', from, to);

            const getPriority = (status?: string) => {
                const s = (status || 'pending').trim().toLowerCase();
                if (s === 'pending') return 0;
                if (s === 'approved') return 1;
                if (s === 'rejected') return 2;
                return 3;
            };

            return [...list].sort((a, b) => {
                const pA = getPriority(a.leaveApprovalStatus);
                const pB = getPriority(b.leaveApprovalStatus);
                if (pA !== pB) return pA - pB;
                return b.applicationNo - a.applicationNo;
            });
        },
    });

    // Partition history for explicit Pending (Top), Approved (Middle), Rejected (End) sections
    const pendingHistory = useMemo(
        () => historyLeaves.filter(item => (item.leaveApprovalStatus || 'pending').trim().toLowerCase() === 'pending'),
        [historyLeaves]
    );
    const approvedHistory = useMemo(
        () => historyLeaves.filter(item => (item.leaveApprovalStatus || '').trim().toLowerCase() === 'approved'),
        [historyLeaves]
    );
    const rejectedHistory = useMemo(
        () => historyLeaves.filter(item => (item.leaveApprovalStatus || '').trim().toLowerCase() === 'rejected'),
        [historyLeaves]
    );

    // Fetch detail when an application is selected
    const { data: detail, isLoading: loadingDetail } = useQuery<LeaveApprovalDetail>({
        queryKey: ['leaveDetail', selectedApplication?.applicationNo, selectedApplication?.empCardNo],
        queryFn: () => leaveApprovalService.getLeaveDetail(selectedApplication!.applicationNo, selectedApplication!.empCardNo),
        enabled: !!selectedApplication,
    });

    const isPendingSelected = Boolean(
        selectedApplication &&
        (!selectedApplication.leaveApprovalStatus || selectedApplication.leaveApprovalStatus === 'Pending')
    );

    const updateMutation = useMutation({
        mutationFn: (targetAction: 'approve' | 'reject') =>
            leaveApprovalService.updateStatus({
                applicationNo: selectedApplication!.applicationNo,
                empCardNo: selectedApplication!.empCardNo,
                approved: targetAction === 'approve',
                rejected: targetAction === 'reject'
            }),
        onSuccess: (_, targetAction) => {
            const empName = selectedApplication?.empName || "Employee";
            const appNo = selectedApplication?.applicationNo;

            // Optimistically filter out the processed application from pending list
            queryClient.setQueryData<LeaveApprovalList[]>(
                ['leaves', 'Pending', fromDate, toDate, searchTerm],
                (old) => (old ? old.filter((item) => item.applicationNo !== appNo) : [])
            );

            setSelectedApplication(null);
            setActiveAction(null);
            setConfirmAction(null);
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            queryClient.invalidateQueries({ queryKey: ['approveHistory'] });
            queryClient.invalidateQueries({ queryKey: ['hr-dashboard'] });
            queryClient.removeQueries({ queryKey: ['leaveDetail'] });
            toast({
                title: "Success",
                description: `Leave for ${empName} has been ${targetAction === 'approve' ? 'Approved' : 'Rejected'} successfully.`
            });
        },
        onError: (error: unknown) => {
            setActiveAction(null);
            setConfirmAction(null);
            toast({
                title: "Error",
                description: getErrorMessage(error, "Failed to update status."),
                variant: "destructive"
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () =>
            leaveApprovalService.deleteLeaveRequest(
                selectedApplication!.applicationNo,
                selectedApplication!.empCardNo
            ),
        onSuccess: () => {
            const empName = selectedApplication?.empName || "Employee";
            setSelectedApplication(null);
            setActiveAction(null);
            setConfirmAction(null);
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            queryClient.invalidateQueries({ queryKey: ['approveHistory'] });
            queryClient.invalidateQueries({ queryKey: ['hr-dashboard'] });
            queryClient.removeQueries({ queryKey: ['leaveDetail'] });
            queryClient.invalidateQueries({ queryKey: ['empBalance'] });
            toast({
                title: "Deleted",
                description: `Leave request for ${empName} was deleted and any linked leave-register usage was restored.`
            });
        },
        onError: (error: unknown) => {
            setActiveAction(null);
            setConfirmAction(null);
            toast({
                title: "Unable to delete leave",
                description: getErrorMessage(error, "Failed to delete leave request."),
                variant: "destructive"
            });
        }
    });

    const handleRowClick = (leave: LeaveApprovalList) => {
        setSelectedApplication(leave);
    };

    const handleConfirmAction = (action: 'approve' | 'reject' | 'delete') => {
        if (!selectedApplication) return;
        setActiveAction(action);
        setConfirmAction(null);
        if (action === 'delete') {
            deleteMutation.mutate();
        } else {
            updateMutation.mutate(action);
        }
    };

    const renderHistoryItem = (item: LeaveApprovalList) => {
        const normStatus = (item.leaveApprovalStatus || 'Pending').trim().toLowerCase();
        const isItemApproved = normStatus === 'approved';
        const isItemRejected = normStatus === 'rejected';
        const isItemPending = !isItemApproved && !isItemRejected;
        const isSelected = selectedApplication?.serialNo === item.serialNo;

        return (
            <div
                key={item.serialNo}
                onClick={() => setSelectedApplication(item)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                        ? isItemApproved
                            ? 'bg-success/10 border-success/50 shadow-xs'
                            : isItemRejected
                                ? 'bg-destructive/10 border-destructive/50 shadow-xs'
                                : 'bg-primary/10 border-primary/50 shadow-xs'
                        : isItemPending
                            ? 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-300/40'
                            : isItemApproved
                                ? 'bg-card hover:bg-secondary/60 border-border/60'
                                : 'bg-card hover:bg-destructive/5 border-destructive/20'
                }`}
            >
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <span className="font-sans text-[10px] font-bold text-muted-foreground">
                                #{item.applicationNo}
                            </span>
                            <span className="text-xs font-black text-foreground truncate">
                                {item.empName}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                            <span className="font-sans">CARD: {item.empCardNo}</span>
                            <span>•</span>
                            <span className="font-bold text-amber-600 uppercase">{item.leaveType}</span>
                        </div>
                    </div>
                    <Badge
                        variant="outline"
                        className={`text-[10px] font-black shrink-0 ${
                            isItemApproved
                                ? 'text-success border-success/30 bg-success/5'
                                : isItemRejected
                                    ? 'text-destructive border-destructive/30 bg-destructive/5'
                                    : 'text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30'
                        }`}
                    >
                        {item.totalLeaves?.toFixed(1)}d
                    </Badge>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1.5 pt-1.5 border-t border-border/40">
                    <span>
                        {item.fromDate ? format(new Date(item.fromDate), 'dd/MM') : ''}
                        {' - '}
                        {item.toDate ? format(new Date(item.toDate), 'dd/MM/yyyy') : ''}
                    </span>
                    {isItemPending && (
                        <span className="text-[9px] font-bold text-amber-600 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" /> Pending
                        </span>
                    )}
                    {isItemApproved && (
                        <span className="text-[9px] font-bold text-success flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Approved
                        </span>
                    )}
                    {isItemRejected && (
                        <span className="text-[9px] font-bold text-destructive flex items-center gap-0.5">
                            <XCircle className="w-2.5 h-2.5" /> Rejected
                        </span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden">
            {/* Header */}
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <CheckSquare className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Leave Approval</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 md:gap-3 w-full md:w-auto">
                    <Button
                        variant="destructive"
                        size="sm"
                        className="h-9 gap-1.5 font-semibold shadow-sm"
                        onClick={() => setConfirmAction('delete')}
                        disabled={!selectedApplication || updateMutation.isPending || deleteMutation.isPending}
                    >
                        {activeAction === 'delete' && deleteMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                        Delete
                    </Button>

                    {/* Approve Button matched to app theme success color */}
                    <Button
                        size="sm"
                        className="h-9 gap-1.5 font-semibold bg-success text-success-foreground hover:bg-success/90 shadow-sm"
                        onClick={() => setConfirmAction('approve')}
                        disabled={!isPendingSelected || updateMutation.isPending || deleteMutation.isPending}
                    >
                        {activeAction === 'approve' && updateMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4" />
                        )}
                        Approve
                    </Button>

                    {/* Reject Button matched to app theme destructive color */}
                    <Button
                        variant="destructive"
                        size="sm"
                        className="h-9 gap-1.5 font-semibold shadow-sm"
                        onClick={() => setConfirmAction('reject')}
                        disabled={!isPendingSelected || updateMutation.isPending || deleteMutation.isPending}
                    >
                        {activeAction === 'reject' && updateMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <XCircle className="w-4 h-4" />
                        )}
                        Reject
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            queryClient.invalidateQueries({ queryKey: ['leaves'] });
                            queryClient.invalidateQueries({ queryKey: ['approveHistory'] });
            queryClient.invalidateQueries({ queryKey: ['hr-dashboard'] });
                        }}
                        className="gap-2 h-9"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </Button>
                </div>
            </header>

            <div className="flex-1 min-h-0 overflow-y-auto p-3 md:p-4 flex flex-col gap-3 md:gap-4">
                {/* Filters Row */}
                <Card className="border-border/50 bg-card/30 shadow-sm shrink-0">
                    <CardContent className="p-3 flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs font-bold uppercase text-muted-foreground">Filters:</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">From:</Label>
                            <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="h-8 w-36 text-xs" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">To:</Label>
                            <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="h-8 w-36 text-xs" />
                        </div>

                        <div className="relative flex-1 max-w-sm ml-auto">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                            <Input
                                placeholder="Search Name, App No..."
                                className="pl-8 h-8 text-xs bg-background/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Top Section: Basic Info and Balances Combined */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 md:gap-4 shrink-0">
                    <Card className="xl:col-span-4 min-w-0 border-border shadow-sm">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="text-xs font-black uppercase text-primary flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5" /> Application Info
                                </h3>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">App No:</Label>
                                <span className="font-sans font-black text-sm text-primary">
                                    {detail?.applicationNo !== undefined && detail?.applicationNo !== null
                                        ? `#${detail.applicationNo}`
                                        : selectedApplication?.applicationNo !== undefined && selectedApplication?.applicationNo !== null
                                            ? `#${selectedApplication.applicationNo}`
                                            : '---'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Date:</Label>
                                <div className="flex items-center gap-2 text-xs font-bold">
                                    <Calendar className="w-3 h-3 text-muted-foreground" />
                                    {detail?.applicationDate
                                        ? format(new Date(detail.applicationDate), 'dd/MM/yyyy')
                                        : selectedApplication?.leaveDate
                                            ? format(new Date(selectedApplication.leaveDate), 'dd/MM/yyyy')
                                            : '---'}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Status:</Label>
                                <Badge
                                    variant="outline"
                                    className={`text-[9px] uppercase font-bold ${
                                        selectedApplication?.leaveApprovalStatus === 'Approved'
                                            ? 'text-success border-success/30 bg-success/5'
                                            : 'text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30'
                                    }`}
                                >
                                    {selectedApplication?.leaveApprovalStatus === 'Approved' ? 'Approved' : 'Pending'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Balances Card */}
                    <Card className="xl:col-span-8 min-w-0 border-border shadow-sm bg-muted/5">
                        <CardContent className="p-4">
                            <h3 className="text-xs font-black uppercase text-primary flex items-center gap-2 mb-4 border-b pb-2">
                                <RefreshCw className="w-3.5 h-3.5" /> Current Leave Balances
                            </h3>
                            <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 md:gap-3">
                                {[
                                    { label: "Annual (AL)", value: detail?.balances.alBalance, color: "text-sidebar", bg: "bg-sidebar/5", border: "border-sidebar/20" },
                                    { label: "Casual (CL)", value: detail?.balances.clBalance, color: "text-green-600", bg: "bg-green-50/50", border: "border-green-200" },
                                    { label: "Sick (SL)", value: detail?.balances.slBalance, color: "text-orange-600", bg: "bg-orange-50/50", border: "border-orange-200" },
                                    { label: "Comp. (CPL)", value: detail?.balances.cplBalance, color: "text-purple-600", bg: "bg-purple-50/50", border: "border-purple-200" }
                                ].map((bal, idx) => (
                                    <div key={idx} className={`p-2 rounded-lg ${bal.bg} border ${bal.border} flex flex-col items-center justify-center`}>
                                        <span className={`text-[9px] font-bold uppercase ${bal.color} mb-1`}>{bal.label}</span>
                                        <span className={`text-lg font-black ${bal.color}`}>{bal.value?.toFixed(1) || '0.0'}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Middle Section: Details Simplified */}
                <Card className="border-border shadow-sm shrink-0">
                    <CardContent className="p-3 md:p-4">
                        {loadingDetail ? (
                            <div className="h-40 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : detail ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-start">
                                {/* Left Column: Employee */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {detail.empName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Employee Name</p>
                                            <h4 className="text-sm font-black">{detail.empName}</h4>
                                            <p className="text-[10px] font-sans font-bold text-muted-foreground">CARD NO: {detail.empCardNo}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 border-t pt-3">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground font-medium">Department:</span>
                                            <span className="font-bold">{detail.departmentName || '---'}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground font-medium">Designation:</span>
                                            <span className="font-bold">{detail.designationName || '---'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Center Column: Leave Info */}
                                <div className="space-y-3 lg:border-x lg:px-5">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Leave Type & Name</p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="font-black text-amber-700 bg-amber-100">{detail.leaveType}</Badge>
                                                <span className="text-xs font-bold">{detail.leaveName}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-muted-foreground">From</p>
                                                <p className="text-xs font-black">{detail.fromDate ? format(new Date(detail.fromDate), 'dd/MM/yyyy') : '---'}</p>
                                            </div>
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-4 h-0.5 bg-muted-foreground/30 mt-3" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-muted-foreground">To</p>
                                                <p className="text-xs font-black">{detail.toDate ? format(new Date(detail.toDate), 'dd/MM/yyyy') : '---'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Duration</p>
                                            <p className="text-lg font-black text-primary">{detail.totalLeaves.toFixed(1)} Days</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Remarks & Status */}
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Remarks / Reason</p>
                                        <div className="p-3 bg-muted/40 rounded-lg text-xs italic min-h-[60px]">
                                            {detail.remarks || 'No remarks provided.'}
                                        </div>
                                    </div>
                                    {detail.joiningDate && (
                                        <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground border-t pt-2">
                                            <span>Joining Date:</span>
                                            <span>{format(new Date(detail.joiningDate), 'dd/MM/yyyy')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="min-h-20 flex flex-col items-center justify-center text-muted-foreground gap-2">
                                <FileText className="w-8 h-8 opacity-20" />
                                <p className="text-xs font-medium uppercase tracking-widest">Select an application for details</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bottom Section: Application Grid and Approved Leaves List */}
                <div className="flex flex-col xl:flex-row gap-3 md:gap-4 min-h-[24rem]">
                    {/* Left: Pending Applications Grid */}
                    <div className="flex-1 min-w-0 bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col min-h-[20rem]">
                        <div className="overflow-auto flex-1">
                            <Table className="min-w-[760px]">
                                <TableHeader className="bg-secondary/30 sticky top-0 z-10">
                                    <TableRow className="border-border">
                                        <TableHead className="w-16 font-bold text-[10px] uppercase py-3 px-4">Sr No</TableHead>
                                        <TableHead className="w-20 font-bold text-[10px] uppercase py-3">App No</TableHead>
                                        <TableHead className="w-24 font-bold text-[10px] uppercase py-3">Card No</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase py-3">Name</TableHead>
                                        <TableHead className="w-24 font-bold text-[10px] uppercase py-3">Leave Type</TableHead>
                                        <TableHead className="w-28 font-bold text-[10px] uppercase py-3">Leave Date</TableHead>
                                        <TableHead className="w-24 font-bold text-[10px] uppercase py-3 text-right pr-6">Days</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingLeaves ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-32 text-center">
                                                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ) : leaves.length > 0 ? (
                                        leaves.map((leave, idx) => (
                                            <TableRow
                                                key={leave.serialNo}
                                                onClick={() => handleRowClick(leave)}
                                                className={`cursor-pointer hover:bg-secondary/50 transition-colors border-border ${selectedApplication?.serialNo === leave.serialNo ? 'bg-primary/5' : ''}`}
                                            >
                                                <TableCell className="text-xs py-2 px-4 font-medium text-muted-foreground">{idx + 1}</TableCell>
                                                <TableCell className="py-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${selectedApplication?.serialNo === leave.serialNo ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-secondary-foreground'}`}>
                                                            {leave.applicationNo}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs py-2 font-sans font-bold">{leave.empCardNo}</TableCell>
                                                <TableCell className="text-xs py-2 font-black">{leave.empName}</TableCell>
                                                <TableCell className="text-xs py-2 font-medium text-amber-600 uppercase">{leave.leaveType}</TableCell>
                                                <TableCell className="text-xs py-2 text-muted-foreground">
                                                    {leave.leaveDate ? format(new Date(leave.leaveDate), 'dd/MM/yyyy') : '---'}
                                                </TableCell>
                                                <TableCell className="text-right py-2 pr-6">
                                                    <Badge variant="secondary" className="font-black text-primary text-[10px]">
                                                        {leave.totalLeaves?.toFixed(1)} Days
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic text-sm">
                                                No pending applications found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Right: Approve History List with Floating Filter */}
                    <Card className="w-full xl:w-[22rem] 2xl:w-[26rem] shrink-0 border-border shadow-sm flex flex-col h-[28rem] min-h-[20rem] overflow-hidden">
                        {/* Floating Month Filter Header */}
                        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border p-3 space-y-2 shrink-0">
                            <div className="flex items-center justify-between gap-1 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 rounded-md bg-primary/10 text-primary">
                                        <Clock className="w-3.5 h-3.5" />
                                    </div>
                                    <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                                        Approve History
                                    </h3>
                                </div>
                                <div className="flex items-center gap-1 flex-wrap">
                                    <span className="font-sans text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300/40">
                                        {pendingHistory.length} Pending
                                    </span>
                                    <span className="font-sans text-[10px] font-bold px-1.5 py-0.5 rounded bg-success/10 text-success border border-success/30">
                                        {approvedHistory.length} Approved
                                    </span>
                                    <span className="font-sans text-[10px] font-bold px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/30">
                                        {rejectedHistory.length} Rejected
                                    </span>
                                </div>
                            </div>

                            {/* Floating Filter Control */}
                            <div className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-lg border border-border/50">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground shrink-0 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Month:
                                </Label>
                                <Input
                                    type="month"
                                    value={approvedMonth}
                                    onChange={(e) => setApprovedMonth(e.target.value || format(new Date(), 'yyyy-MM'))}
                                    className="h-7 text-xs bg-background py-0 px-2 font-medium"
                                />
                                {approvedMonth !== format(new Date(), 'yyyy-MM') && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setApprovedMonth(format(new Date(), 'yyyy-MM'))}
                                        className="h-7 px-2 text-[10px] font-bold text-primary hover:text-primary"
                                        title="Reset to current month"
                                    >
                                        Current
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Scrollable History Leaves List */}
                        <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                            {loadingHistoryLeaves ? (
                                <div className="h-40 flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : historyLeaves.length > 0 ? (
                                <>
                                    {/* 1. Pending (Top) */}
                                    {pendingHistory.length > 0 && (
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between px-1 pt-0.5 pb-1 text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Pending (Top)
                                                </span>
                                                <span className="font-sans">{pendingHistory.length}</span>
                                            </div>
                                            {pendingHistory.map(renderHistoryItem)}
                                        </div>
                                    )}

                                    {/* 2. Approved (Middle) */}
                                    {approvedHistory.length > 0 && (
                                        <div className="space-y-1.5 pt-1">
                                            <div className="flex items-center justify-between px-1 pt-1.5 pb-1 text-[10px] font-bold text-success uppercase tracking-wider border-t border-border/40">
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Approved (Middle)
                                                </span>
                                                <span className="font-sans">{approvedHistory.length}</span>
                                            </div>
                                            {approvedHistory.map(renderHistoryItem)}
                                        </div>
                                    )}

                                    {/* 3. Rejected (End) */}
                                    {rejectedHistory.length > 0 && (
                                        <div className="space-y-1.5 pt-1">
                                            <div className="flex items-center justify-between px-1 pt-1.5 pb-1 text-[10px] font-bold text-destructive uppercase tracking-wider border-t border-border/40">
                                                <span className="flex items-center gap-1">
                                                    <XCircle className="w-3 h-3" /> Rejected (End)
                                                </span>
                                                <span className="font-sans">{rejectedHistory.length}</span>
                                            </div>
                                            {rejectedHistory.map(renderHistoryItem)}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="h-48 flex flex-col items-center justify-center text-center text-muted-foreground gap-2 p-4">
                                    <Clock className="w-8 h-8 opacity-20 text-muted-foreground" />
                                    <p className="text-xs font-medium">No leave records found for this month.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmAction === 'approve'
                                ? 'Approve Leave Application'
                                : confirmAction === 'reject'
                                    ? 'Reject Leave Application'
                                    : 'Delete Leave Application'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmAction === 'approve'
                                ? `Approve leave for ${selectedApplication?.empName} (${selectedApplication?.totalLeaves?.toFixed(1) || '0.0'} day${(selectedApplication?.totalLeaves || 0) === 1 ? '' : 's'} ${selectedApplication?.leaveType || ''})? This will deduct the employee's leave balance.`
                                : confirmAction === 'reject'
                                    ? `Reject leave for ${selectedApplication?.empName} (${selectedApplication?.totalLeaves?.toFixed(1) || '0.0'} day${(selectedApplication?.totalLeaves || 0) === 1 ? '' : 's'} ${selectedApplication?.leaveType || ''})? This request will be marked as rejected.`
                                    : `Delete leave for ${selectedApplication?.empName}? Any linked leave-register usage will be removed to restore the balance. Deletion is blocked if payroll has already marked this leave as deducted.`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={updateMutation.isPending || deleteMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                if (confirmAction) {
                                    handleConfirmAction(confirmAction);
                                }
                            }}
                            disabled={updateMutation.isPending || deleteMutation.isPending}
                            className={
                                confirmAction === 'approve'
                                    ? 'bg-success text-success-foreground hover:bg-success/90'
                                    : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                            }
                        >
                            {updateMutation.isPending || deleteMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                            ) : confirmAction === 'approve' ? (
                                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            ) : confirmAction === 'delete' ? (
                                <Trash2 className="w-4 h-4 mr-1.5" />
                            ) : (
                                <XCircle className="w-4 h-4 mr-1.5" />
                            )}
                            {confirmAction === 'approve' ? 'Approve' : confirmAction === 'reject' ? 'Reject' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default LeaveApprovalPage;