import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { attendanceService } from "../services/attendanceService";
import { toast } from "sonner";
import { Cpu, RefreshCw, History, PlayCircle, Loader2 } from "lucide-react";

const AttendanceMachinePage = () => {
    const [sn, setSn] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [loading, setLoading] = useState<string | null>(null);

    const formatDateTime = (val: string) => {
        if (!val) return "";
        // Convert from 2024-05-01T12:00 to 2024-05-01 12:00:00
        return val.replace('T', ' ') + ":00";
    };

    const handleReadAttLog = async (isFull: boolean) => {
        if (!sn) {
            toast.error("Please enter a Machine Serial Number");
            return;
        }

        setLoading(isFull ? "full" : "period");
        try {
            const res = await attendanceService.readAttLog(
                sn, 
                isFull ? undefined : formatDateTime(startTime), 
                isFull ? undefined : formatDateTime(endTime)
            );
            toast.success(res.message || "Sync command queued successfully!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to queue sync command");
        } finally {
            setLoading(null);
        }
    };

    const handleReadNewLog = async () => {
        if (!sn) {
            toast.error("Please enter a Machine Serial Number");
            return;
        }

        setLoading("new");
        try {
            const res = await attendanceService.readNewLog(sn);
            toast.success(res.message || "New logs command queued successfully!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to queue command");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="bg-[#171858] text-white p-2 rounded-xl shadow-xs">
                        <Cpu className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-display font-bold text-foreground">Attendance Machine Management</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">Workforce &amp; HR Records</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-6 space-y-6 max-w-[1600px] mx-auto w-full">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-primary/10 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <PlayCircle className="w-5 h-5 text-primary" />
                            Device Identification
                        </CardTitle>
                        <CardDescription>Enter the serial number of the device you want to control.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="sn">Machine Serial Number</Label>
                            <Input 
                                id="sn" 
                                placeholder="e.g. B61234567890" 
                                value={sn} 
                                onChange={(e) => setSn(e.target.value)}
                                className="font-sans"
                            />
                        </div>
                        <Button 
                            variant="outline" 
                            className="w-full flex items-center gap-2"
                            onClick={handleReadNewLog}
                            disabled={loading !== null}
                        >
                            {loading === "new" ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            Sync New Logs (CHECK)
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-primary/10 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <History className="w-5 h-5 text-primary" />
                            Historical Sync
                        </CardTitle>
                        <CardDescription>Fetch logs from the device memory based on time range.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Input 
                                    type="datetime-local" 
                                    value={startTime} 
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="text-xs"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <Input 
                                    type="datetime-local" 
                                    value={endTime} 
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="text-xs"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button 
                                className="flex-1 flex items-center gap-2" 
                                onClick={() => handleReadAttLog(false)}
                                disabled={loading !== null || !startTime || !endTime}
                            >
                                {loading === "period" && <Loader2 className="w-4 h-4 animate-spin" />}
                                Sync Period
                            </Button>
                            <Button 
                                variant="secondary" 
                                className="flex-1 flex items-center gap-2"
                                onClick={() => handleReadAttLog(true)}
                                disabled={loading !== null}
                            >
                                {loading === "full" && <Loader2 className="w-4 h-4 animate-spin" />}
                                Sync All Logs
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-muted/30 border-dashed">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-yellow-500/10 rounded-full shrink-0">
                            <RefreshCw className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold">How Sync Works</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                ADMS devices poll the server periodically. When you trigger a sync, the command is placed in a queue. 
                                The device will receive the command on its next heartbeat, process it, and then push the attendance logs 
                                back to the server automatically. You don't need to manually save them.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            </div>
        </div>
    );
};

export default AttendanceMachinePage;
