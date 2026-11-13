import { motion } from "framer-motion";
import { 
    ShieldCheck, 
    Clock, 
    Users, 
    Info, 
    AlertCircle, 
    CheckCircle2,
    XCircle,
    UserCheck,
    Briefcase,
    HelpCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Separator } from "@/shared/components/ui/separator";

export const AttendancePolicyPage = () => {
    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Attendance Policies</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-rose-600 bg-rose-50 dark:bg-rose-950/30 px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-900/50">
                    <AlertCircle className="w-3 h-3" /> Status: Inactive / Not Enforced
                </div>
            </header>

            <div className="flex-1 overflow-auto p-6 space-y-6 max-w-[1600px] mx-auto w-full">

            <div className="max-w-5xl mx-auto">
                <Alert className="bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/50 mb-6">
                    <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    <AlertTitle className="text-rose-800 dark:text-rose-300 font-bold">Policies Not Enforced</AlertTitle>
                    <AlertDescription className="text-rose-700/90 dark:text-rose-400/90">
                        Please note that the attendance policies described below are currently **not active**. The system does not automatically mark employees absent based on stay duration or single punch rules.
                    </AlertDescription>
                </Alert>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto space-y-8"
            >
                {/* Policy Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Staff Policy */}
                    <Card className="border-sidebar/15 shadow-md hover:shadow-lg transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Briefcase className="w-24 h-24 text-sidebar" />
                        </div>
                        <CardHeader>
                            <div className="bg-sidebar/5 w-12 h-12 rounded-xl flex items-center justify-center mb-2">
                                <UserCheck className="w-6 h-6 text-sidebar" />
                            </div>
                            <CardTitle className="text-xl">Staff Policy</CardTitle>
                            <CardDescription>Primary policy for administrative and office staff</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-sidebar/5 rounded-xl border border-sidebar/15">
                                <span className="text-sm font-medium text-sidebar">Minimum Hours Required</span>
                                <span className="text-2xl font-bold text-sidebar">09 Hours</span>
                            </div>
                            <div className="space-y-3 pt-2">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Total span between first punch and last punch must be 9 hours or more to be marked as <strong className="text-foreground">Present (P)</strong>.
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Less than 9 hours of stay will automatically mark the record as <strong className="text-foreground">Absent (A)</strong>.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Other Category Policy */}
                    <Card className="border-sidebar/15 shadow-md hover:shadow-lg transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Users className="w-24 h-24 text-sidebar" />
                        </div>
                        <CardHeader>
                            <div className="bg-sidebar/5 w-12 h-12 rounded-xl flex items-center justify-center mb-2">
                                <Users className="w-6 h-6 text-sidebar" />
                            </div>
                            <CardTitle className="text-xl">Other Categories</CardTitle>
                            <CardDescription>Policy for non-staff and field personnel</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-sidebar/5 rounded-xl border border-sidebar/15">
                                <span className="text-sm font-medium text-sidebar">Minimum Hours Required</span>
                                <span className="text-2xl font-bold text-sidebar">05 Hours</span>
                            </div>
                            <div className="space-y-3 pt-2">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Total stay of 5 hours or more is required to be considered <strong className="text-foreground">Present (P)</strong>.
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Any record with less than 5 hours will be processed as <strong className="text-foreground">Absent (A)</strong>.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Important Rules Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 shadow-sm border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-amber-500" />
                                Critical Processing Rules
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-foreground">Single Punch Rule</h4>
                                <p className="text-xs text-muted-foreground leading-loose">
                                    If an employee only has an <span className="font-semibold italic text-sidebar">In-Punch</span> or only an <span className="font-semibold italic text-sidebar">Out-Punch</span>, the system cannot calculate total hours. In this case, the record is automatically marked as <strong className="text-foreground">Absent (A)</strong>.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-foreground">Manual Attendance</h4>
                                <p className="text-xs text-muted-foreground leading-loose">
                                    Manual attendance entries bypass the automatic hour check. If an administrator manually sets a record, it will retain the manually assigned status regardless of the stay duration.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-foreground">Late Arrival</h4>
                                <p className="text-xs text-muted-foreground leading-loose">
                                    Late arrival is calculated based on the Shift definition. While late arrival triggers a notification, it does not mark an employee absent unless their total stay falls below the category threshold.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-foreground">Early Going</h4>
                                <p className="text-xs text-muted-foreground leading-loose">
                                    Similar to late arrival, leaving early is flagged by the system but strictly adheres to the total hour count for final attendance marking.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Alert className="bg-amber-50 border-amber-200">
                            <Info className="h-4 w-4 text-amber-600" />
                            <AlertTitle className="text-amber-800 text-sm font-bold">Pro Tip</AlertTitle>
                            <AlertDescription className="text-amber-700/80 text-[11px]">
                                Always encourage employees to double-check their machine punches. A single missed punch is the most common reason for unexpected "Absent" marking.
                            </AlertDescription>
                        </Alert>

                        <div className="p-6 bg-muted/40 rounded-2xl border border-border/50 space-y-4">
                            <div className="flex items-center gap-3">
                                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                                <h3 className="text-sm font-bold">Need help?</h3>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                If you believe the policies need adjustment for specific sites or departments, please contact the System Administrator.
                            </p>
                            <Separator />
                            <p className="text-[10px] text-muted-foreground/60 italic">
                                * These rules are part of the HRMS core engine and are applied during the "Update Attendance" process.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
            </div>
        </div>
    );
};

export default AttendancePolicyPage;
