import { useState } from "react";
import { 
    BarChart3, 
    FileDown, 
    Loader2, 
    Filter 
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useToast } from "@/shared/components/ui/use-toast";
import { employeeService } from "../services/employeeService";
import { authService } from "@/modules/auth/services/authService";
import { motion } from "framer-motion";

const EmployeeDesignationReportPage = () => {
    const { toast } = useToast();
    const userSite = authService.getSite();
    const [isDesignationPdfLoading, setIsDesignationPdfLoading] = useState(false);

    const handleViewDesignationReport = async () => {
        try {
            setIsDesignationPdfLoading(true);
            await employeeService.viewEmployeesByDesignationReport(userSite);
            toast({ title: "Report Ready", description: "Grouped designation report opened in a new tab." });
        } catch {
            toast({ title: "Error", description: "Failed to generate grouped report.", variant: "destructive" });
        } finally {
            setIsDesignationPdfLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs shrink-0">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Employee Reports</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Designation Wise &bull; Workforce &amp; HR Records</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-auto p-8 flex flex-col items-center justify-center">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-card p-8 rounded-2xl border border-border shadow-xl text-center space-y-6"
                >
                    <div className="bg-purple-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <Filter className="w-8 h-8 text-purple-600" />
                    </div>
                    
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-foreground">Designation Wise Report</h3>
                        <p className="text-sm text-muted-foreground">
                            Generate a comprehensive PDF report of all employees grouped by their respective designations.
                        </p>
                    </div>

                    <div className="pt-4">
                        <Button
                            onClick={handleViewDesignationReport}
                            disabled={isDesignationPdfLoading}
                            className="w-full h-12 gap-3 text-base shadow-lg shadow-purple-500/20 bg-purple-600 hover:bg-purple-700 transition-all"
                        >
                            {isDesignationPdfLoading
                                ? <Loader2 className="w-5 h-5 animate-spin" />
                                : <FileDown className="w-5 h-5" />}
                            {isDesignationPdfLoading ? "Generating Report..." : "Generate Designation Report"}
                        </Button>
                    </div>

                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest pt-4">
                        Report generated for: {userSite}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default EmployeeDesignationReportPage;
