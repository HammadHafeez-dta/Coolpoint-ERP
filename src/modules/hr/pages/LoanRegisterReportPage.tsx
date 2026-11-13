import { useState } from "react";
import { 
    FileText, 
    Loader2, 
    Calendar,
    Briefcase,
    LayoutList,
    AlertCircle,
    Eye
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { useToast } from "@/shared/components/ui/use-toast";
import { loanService } from "../services/loanService";
import { authService } from "@/modules/auth/services/authService";
import { motion } from "framer-motion";
import { format } from "date-fns";

const LoanRegisterReportPage = () => {
    const { toast } = useToast();
    const site = authService.getSite() || "";
    const currentUser = authService.getCurrentUser();

    const [fromDate, setFromDate] = useState(format(new Date(), 'yyyy-MM-01'));
    const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [generatingPdf, setGeneratingPdf] = useState(false);

    const handleViewReport = async () => {
        try {
            setGeneratingPdf(true);
            await loanService.viewLoanRegisterReport({
                site,
                fromDate,
                toDate,
                userName: currentUser?.username || "Admin"
            });
            toast({ 
                title: "Report Generated", 
                description: `Loan register from ${fromDate} to ${toDate} has been opened.` 
            });
        } catch (error: any) {
            console.error("Failed to generate PDF", error);
            const errorMsg = error.response?.data || "Failed to generate loan register report.";
            toast({ 
                title: "Error", 
                description: typeof errorMsg === 'string' ? errorMsg : "An error occurred.", 
                variant: "destructive" 
            });
        } finally {
            setGeneratingPdf(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs shrink-0">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <LayoutList className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Loan Register Report</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button 
                        onClick={handleViewReport}
                        disabled={generatingPdf}
                        className="h-8 text-xs bg-[#171858] hover:bg-[#121344] text-white shadow-xs active:scale-[0.98] transition-transform font-bold px-4 gap-1.5"
                    >
                        {generatingPdf ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <FileText className="w-4 h-4" />
                                Generate PDF
                            </>
                        )}
                    </Button>
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
                
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className="bg-sidebar/10 p-3 rounded-xl"><Calendar className="w-6 h-6 text-sidebar" /></div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Period Start</p>
                            <h3 className="text-sm font-black">{fromDate}</h3>
                        </div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className="bg-emerald-500/10 p-3 rounded-xl"><Calendar className="w-6 h-6 text-emerald-500" /></div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Period End</p>
                            <h3 className="text-sm font-black">{toDate}</h3>
                        </div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                        <div className="bg-amber-500/10 p-3 rounded-xl"><Briefcase className="w-6 h-6 text-amber-500" /></div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Site Context</p>
                            <h3 className="text-sm font-black">{site}</h3>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Left Panel: Configuration */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="col-span-12 lg:col-span-4 space-y-6"
                    >
                        <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-border bg-secondary/10">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Report Configuration</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">From Date</Label>
                                        <Input
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            className="h-11 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">To Date</Label>
                                        <Input
                                            type="date"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                            className="h-11 font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-4 flex gap-3 text-amber-600">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p className="text-[11px] font-medium leading-relaxed italic">
                                        The Loan Register includes all card numbers, names, departments, and total loan amounts with installments for the site.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Panel: Preview/CTA */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="col-span-12 lg:col-span-8"
                    >
                        <div className="bg-card border border-border shadow-sm rounded-xl h-full flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-border flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Register Summary Preview</h3>
                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                                    Format: Landscape A4
                                </span>
                            </div>
                            
                            <div className="flex-1 p-12 flex flex-col items-center justify-center text-center">
                                <div className="space-y-6 max-w-sm">
                                    <div className="bg-primary/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                                        <FileText className="w-10 h-10 text-primary/40" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-lg font-black text-foreground uppercase tracking-tight">Generate Site Register</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            Generating the register will process all loan transactions for the <span className="font-bold text-primary">{site}</span> site between <span className="font-bold">{fromDate}</span> and <span className="font-bold">{toDate}</span>.
                                        </p>
                                    </div>
                                    <Button 
                                        onClick={handleViewReport}
                                        disabled={generatingPdf}
                                        className="h-12 px-10 font-black rounded-xl shadow-lg transition-all active:scale-95 w-full"
                                    >
                                        {generatingPdf ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Eye className="w-5 h-5 mr-2" />}
                                        DOWNLOAD PDF REGISTER
                                    </Button>
                                </div>
                            </div>

                            {/* Bottom Footer */}
                            <div className="bg-secondary/30 px-6 py-3 border-t border-border flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        System Ready
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                    GENERATED BY: {currentUser?.username || "Admin"}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default LoanRegisterReportPage;
