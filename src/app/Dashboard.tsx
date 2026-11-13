import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  FileText,
  Search,
  Bell,
  HelpCircle,
  Plus,
  TrendingUp,
  AlertTriangle,
  MoreVertical,
  ClipboardList,
  FileBarChart,
  Eye
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

const transactions = [
  { id: "BOM-2024-0812", project: "Metropolis Skybridge", type: "BOM", date: "Oct 24, 2023", status: "pending" },
  { id: "IPC-2024-0045", project: "Riverfront Complex", type: "IPC", date: "Oct 23, 2023", status: "approved" },
  { id: "BOM-2024-0809", project: "Downtown Hub Phase 2", type: "BOM", date: "Oct 22, 2023", status: "approved" },
  { id: "IPC-2024-0042", project: "Sunset Towers", type: "IPC", date: "Oct 22, 2023", status: "rejected" },
  { id: "BOM-2024-0801", project: "Grand Industrial Park", type: "BOM", date: "Oct 21, 2023", status: "review" },
];

const getStatusStyles = (status: string) => {
  switch (status) {
    case "approved":
      return { color: "text-success", bg: "bg-success", label: "Approved" };
    case "pending":
      return { color: "text-warning", bg: "bg-warning", label: "Pending Approval" };
    case "rejected":
      return { color: "text-destructive", bg: "bg-destructive", label: "Rejected" };
    case "review":
      return { color: "text-primary", bg: "bg-primary", label: "In Review" };
    default:
      return { color: "text-muted-foreground", bg: "bg-muted", label: status };
  }
};

const getTypeStyles = (type: string) => {
  switch (type) {
    case "BOM":
      return "bg-primary/10 text-primary";
    case "IPC":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* TopNavBar */}
      <header className="h-12 bg-card border-b border-border flex items-center justify-between px-5 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-bold text-foreground">Dashboard Overview</h2>
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
            <Input
              placeholder="Search projects, BOMs..."
              className="pl-8 h-8 text-xs bg-secondary border-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" className="relative rounded-lg h-8 w-8">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 size-1.5 bg-destructive rounded-full border border-card" />
          </Button>
          <Button variant="secondary" size="icon" className="rounded-lg h-8 w-8">
            <HelpCircle className="w-4 h-4" />
          </Button>
          <div className="h-6 w-[1px] bg-border mx-1" />
          <Button size="sm" className="gap-1.5 h-8 text-xs">
            <Plus className="w-3.5 h-3.5" /> New BOM
          </Button>
        </div>
      </header>

      {/* Page Content */}
      <div className="p-5 space-y-5 max-w-6xl mx-auto w-full">
        {/* PageHeading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-0.5"
        >
          <h3 className="text-xl font-black tracking-tight">Construction Metrics</h3>
          <p className="text-muted-foreground text-xs">Real-time status updates and operational planning indicators.</p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-card p-4 rounded-lg border border-border shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">Active Projects</span>
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold">24</p>
              <p className="text-[10px] text-success font-bold mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +2% from last month
              </p>
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">Pending Check Requests</span>
              <div className="size-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-[10px] text-destructive font-bold mt-0.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Needs immediate action
              </p>
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium">Observation Alerts</span>
              <div className="size-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold">05</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">High priority site flags</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Transactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Recent Transactions</h2>
            <button className="text-primary text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-secondary border-b border-border">
                  <th className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase">Transaction ID</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase">Project Name</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase">Type</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase">Date</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((tx) => {
                  const statusStyle = getStatusStyles(tx.status);
                  return (
                    <tr key={tx.id} className="hover:bg-secondary/50 transition-colors">
                      <td className="px-4 py-2.5 font-medium">{tx.id}</td>
                      <td className="px-4 py-2.5">{tx.project}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getTypeStyles(tx.type)}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{tx.date}</td>
                      <td className="px-4 py-2.5">
                        <span className={`flex items-center gap-1 ${statusStyle.color} font-semibold text-[11px]`}>
                          <span className={`size-1.5 ${statusStyle.bg} rounded-full`} />
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <button className="text-muted-foreground hover:text-primary transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Secondary Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
        >
          <div className="space-y-3">
            <h2 className="text-base font-bold">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/construction/ipc")}
                className="p-3 rounded-lg border border-border bg-card flex items-center gap-2 hover:border-primary transition-all text-left"
              >
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">New IPC</p>
                  <p className="text-[10px] text-muted-foreground">Submit payment claim</p>
                </div>
              </button>
              <button className="p-3 rounded-lg border border-border bg-card flex items-center gap-2 hover:border-primary transition-all">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <FileBarChart className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold">Reports</p>
                  <p className="text-[10px] text-muted-foreground">Export planning data</p>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-bold">Project Distribution</h2>
            <div className="p-4 bg-card rounded-lg border border-border flex items-center gap-6">
              <div className="relative size-16 shrink-0">
                <svg className="size-full" viewBox="0 0 36 36">
                  <path
                    className="stroke-border"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="3"
                  />
                  <path
                    className="stroke-primary"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeDasharray="60, 100"
                    strokeLinecap="round"
                    strokeWidth="3"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold leading-none">60%</span>
                  <span className="text-[8px] text-muted-foreground uppercase">On Time</span>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 bg-primary rounded-full" /> Residential
                  </span>
                  <span className="font-bold">45%</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 bg-blue-300 rounded-full" /> Commercial
                  </span>
                  <span className="font-bold">30%</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 bg-muted-foreground rounded-full" /> Industrial
                  </span>
                  <span className="font-bold">25%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Dashboard;
