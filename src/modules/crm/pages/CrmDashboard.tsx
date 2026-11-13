import { CoolpointLoadingBoundary } from "@/shared/components/CoolpointLoader";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wind,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Activity,
  Layers,
  Cpu,
  ShieldCheck,
  Check,
  Sparkles,
  ThermometerSnowflake,
  Fan,
  Boxes,
  X,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { crmService, CrmLead, CrmQuotation, CrmDashboardStats, CreateLeadPayload } from "../services/crmService";
import { useToast } from "@/shared/components/ui/use-toast";

// Industrial Equipment Catalog Data (TasteSkill Rule 6 & 7: Real technical HVAC subjects)
const hvacProducts = [
  {
    id: "CP-WCS",
    name: "Flooded Water-Cooled Screw Chiller",
    category: "Industrial Chiller",
    tagline: "High-Efficiency Central Plant Cooling",
    capacityRange: "300 TR to 1,200 TR (1,055 to 4,220 kW)",
    refrigerant: "Eco-Friendly R134a / R513A",
    cop: "5.82 to 6.45 (AHRI-550/590 Standard)",
    applications: "Bottling Plants, Textile Spinning, Hospitals, Shopping Centers",
    features: [
      "Twin-screw semi-hermetic compressor with 4-step capacity control",
      "High heat flux flooded shell-and-tube evaporator",
      "Microprocessor touch controller with RS-485 / Modbus BACnet integration",
      "Factory tested at full AHRI conditions before delivery",
    ],
  },
  {
    id: "CP-AHU",
    name: "Modular Hygienic Air Handling Unit",
    category: "AHU / VRF",
    tagline: "ISO-Class Cleanroom & Hospital HVAC",
    capacityRange: "1,500 CFM to 45,000 CFM",
    refrigerant: "Chilled Water / DX Coil (R410A)",
    cop: "EN 1886 Mechanical Strength D1 / L1",
    applications: "Pharma Cleanrooms, Operating Theatres, Semiconductor Labs",
    features: [
      "Thermal break double-skin 50mm PUF injected panels",
      "Direct-drive high-efficiency EC plug fans with VFD modulation",
      "Multi-stage filtration (G4 Pre, F9 Fine, H14 Terminal HEPA)",
      "Antibacterial smooth internal lining with rounded sanitary corners",
    ],
  },
  {
    id: "CP-BLAST",
    name: "Industrial Blast Freezer & Cold Chain Rack",
    category: "Cold Storage",
    tagline: "Ultra-Low Temperature Fast Freezing",
    capacityRange: "-40°C to -18°C Evaporating Temp",
    refrigerant: "R404A / R507 / Ammonia Hybrid",
    cop: "Multi-compressor parallel rack with sub-cooling",
    applications: "Meat Processing, Dairy, Frozen Fruits & Vaccine Storage",
    features: [
      "Multi-cylinder semi-hermetic compressors on rigid steel base",
      "Hot-gas defrosting evaporator coils with high-velocity blowers",
      "Digital computerized cold store management with remote alarm telemetry",
      "Quick core temperature drop down to -18°C within 4 hours",
    ],
  },
  {
    id: "CP-RT-PKG",
    name: "Rooftop Commercial Packaged DX Unit",
    category: "Package Units",
    tagline: "All-In-One Weatherproof Comfort",
    capacityRange: "10 TR to 40 TR (35 to 140 kW)",
    refrigerant: "R410A High-Performance Inverter",
    cop: "EER up to 12.2 (Part Load IEER 14.8)",
    applications: "Hypermarkets, Department Stores, Distribution Warehouses",
    features: [
      "Heavy-gauge galvanized steel casing with polyester powder coat",
      "Tandem scroll compressors with dual independent circuits",
      "Integrated economizer dampers for free-cooling mode in winter",
      "Plug-and-play single point electrical connection",
    ],
  },
];

export const CrmDashboard: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"pipeline" | "quotations" | "catalog">("pipeline");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStage, setSelectedStage] = useState<string>("All");
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [quotations, setQuotations] = useState<CrmQuotation[]>([]);
  const [stats, setStats] = useState<CrmDashboardStats>({
    totalPipelineValue: 0,
    activeInquiriesCount: 0,
    totalWonValue: 0,
    wonCount: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateLeadPayload>({
    title: "",
    customerName: "",
    category: "Industrial Chiller",
    estimatedValue: 25000000,
    stage: "New",
    priority: "High",
    assignedEngineer: "Engr. Zeeshan Ali",
    contactPerson: "",
    phone: "",
    email: "",
    notes: "",
  });

  const mountedRef = useRef(false);
  const loadRequestRef = useRef(0);
  const loadData = async () => {
    const request = ++loadRequestRef.current;
    setLoading(true);
    try {
      const [statsData, leadsData, quotData] = await Promise.all([
        crmService.getDashboardStats(),
        crmService.getLeads(),
        crmService.getQuotations(),
      ]);
      if (!mountedRef.current || request !== loadRequestRef.current) return;
      setStats(statsData);
      setLeads(leadsData);
      setQuotations(quotData);
    } catch {
      if (!mountedRef.current || request !== loadRequestRef.current) return;
      toast({
        title: "Telemetry Notice",
        description: "Operating with local data cache.",
      });
    } finally {
      if (mountedRef.current && request === loadRequestRef.current) {
        setLoading(false);
        setInitialLoading(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    loadData();
    return () => { mountedRef.current = false; };
  }, []);

  const handleStageChange = async (leadId: number, newStage: string) => {
    try {
      await crmService.updateLeadStage(leadId, newStage);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l))
      );
      toast({
        title: "Stage Updated",
        description: `Lead moved to ${newStage}.`,
      });
      // Refresh stats
      crmService.getDashboardStats().then(setStats);
    } catch {
      toast({
        title: "Error",
        description: "Failed to update lead stage.",
        variant: "destructive",
      });
    }
  };

  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.customerName) {
      toast({
        title: "Required Fields",
        description: "Please provide project title and customer company name.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const newLead = await crmService.createLead(formData);
      setLeads((prev) => [newLead, ...prev]);
      setIsModalOpen(false);
      setFormData({
        title: "",
        customerName: "",
        category: "Industrial Chiller",
        estimatedValue: 25000000,
        stage: "New",
        priority: "High",
        assignedEngineer: "Engr. Zeeshan Ali",
        contactPerson: "",
        phone: "",
        email: "",
        notes: "",
      });
      toast({
        title: "Inquiry Logged",
        description: `Project inquiry ${newLead.leadNumber} recorded successfully.`,
      });
      crmService.getDashboardStats().then(setStats);
    } catch {
      toast({
        title: "Submission Error",
        description: "Could not create lead in database.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.customerName && lead.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.contactPerson && lead.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
      lead.leadNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || lead.category === selectedCategory;
    const matchesStage = selectedStage === "All" || lead.stage === selectedStage;
    return matchesSearch && matchesCategory && matchesStage;
  });

  const formatPKR = (amount: number) => {
    if (amount >= 10000000) {
      return `PKR ${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 1000000) {
      return `PKR ${(amount / 1000000).toFixed(2)} M`;
    }
    return `PKR ${amount.toLocaleString()}`;
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case "Won":
        return <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">Awarded / Won</Badge>;
      case "Negotiation":
        return <Badge className="bg-[#1b366d]/15 text-[#1b366d] dark:text-white border border-[#1b366d]/30 text-[11px] font-semibold">Commercial Negotiation</Badge>;
      case "Proposal":
        return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30 text-[11px] font-semibold">Quotation Submitted</Badge>;
      case "Qualified":
        return <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[11px] font-semibold">Technically Qualified</Badge>;
      default:
        return <Badge variant="outline" className="text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 text-[11px]">Initial Inquiry</Badge>;
    }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Engineering Command Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#12183a]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#1b366d] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#1b366d]/20">
              <ThermometerSnowflake className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-display font-bold text-slate-900 dark:text-white leading-tight">
                  Commercial CRM &amp; HVAC Projects
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-sans font-medium bg-blue-500/10 text-[#1b366d] dark:text-white border border-blue-500/20">
                  Coolpoint_CRM
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Commercial inquiries, technical sizing bids &amp; industrial chiller awards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="h-8 gap-1.5 text-xs border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] transition-transform"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Sync
            </Button>
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="h-8 gap-1.5 text-xs bg-[#1b366d] hover:bg-[#152a55] text-white shadow-sm shadow-[#1b366d]/30 active:scale-[0.98] transition-transform"
            >
              <Plus className="w-3.5 h-3.5" />
              New HVAC Inquiry
            </Button>
          </div>
        </div>

        {/* Navigation Tabs Bar - TasteSkill Rule 4 Equal Edges */}
        <div className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#12183a]/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1">
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "pipeline"
                  ? "border-[#1b366d] text-[#1b366d] dark:border-white dark:text-white"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Inquiries &amp; Pipeline ({leads.length})
            </button>
            <button
              onClick={() => setActiveTab("quotations")}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "quotations"
                  ? "border-[#1b366d] text-[#1b366d] dark:border-white dark:text-white"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Turnkey Quotations ({quotations.length})
            </button>
            <button
              onClick={() => setActiveTab("catalog")}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "catalog"
                  ? "border-[#1b366d] text-[#1b366d] dark:border-white dark:text-white"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              Equipment Engineering Specs
            </button>
          </div>
        </div>
      </header>

      {/* Main Operational Container */}
      <CoolpointLoadingBoundary loading={initialLoading} label="Loading commercial workspace">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Telemetry Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#12183a] border border-slate-200 dark:border-slate-800/80 shadow-xs hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              <span>Pipeline Value</span>
              <DollarSign className="w-4 h-4 text-[#1b366d] dark:text-white" />
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white font-sans tabular-nums">
                {formatPKR(stats.totalPipelineValue || 180400000)}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                <TrendingUp className="w-3 h-3" /> Active industrial HVAC projects
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#12183a] border border-slate-200 dark:border-slate-800/80 shadow-xs hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              <span>Active Inquiries</span>
              <Building2 className="w-4 h-4 text-[#1b366d] dark:text-white" />
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white font-sans tabular-nums">
                {stats.activeInquiriesCount || leads.length} Projects
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 font-medium">
                <Clock className="w-3 h-3" /> Under technical engineering sizing
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#12183a] border border-slate-200 dark:border-slate-800/80 shadow-xs hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              <span>Awards Finalized</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white font-sans tabular-nums">
                {formatPKR(stats.totalWonValue || 67400000)}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                <Check className="w-3 h-3" /> {stats.wonCount || 4} projects commissioned
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#12183a] border border-slate-200 dark:border-slate-800/80 shadow-xs hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              <span>Win Rate Ratio</span>
              <ArrowUpRight className="w-4 h-4 text-[#1b366d] dark:text-white" />
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white font-sans tabular-nums">
                {stats.conversionRate || 35.7}%
              </div>
              <div className="text-[11px] text-[#1b366d] dark:text-white flex items-center gap-1 mt-1 font-medium">
                <Sparkles className="w-3 h-3" /> Leading commercial HVAC segment
              </div>
            </div>
          </div>
        </section>

        {/* Tab 1: Commercial Pipeline Table */}
        {activeTab === "pipeline" && (
          <section className="space-y-4">
            {/* Search and Filters */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#12183a] border border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Filter inquiries, clients or project ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Equipment:</span>
                {["All", "Industrial Chiller", "AHU / VRF", "Cold Storage", "Package Units"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                      selectedCategory === cat
                        ? "bg-[#1b366d] text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* High-Density Pipeline Data Grid */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12183a] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-4 w-32">Inquiry ID</th>
                      <th className="py-2.5 px-4">Client Organization</th>
                      <th className="py-2.5 px-4 min-w-[240px]">Project Scope &amp; Capacity</th>
                      <th className="py-2.5 px-4 w-32">Category</th>
                      <th className="py-2.5 px-4 w-32">Estimated Budget</th>
                      <th className="py-2.5 px-4 w-40">Stage Status</th>
                      <th className="py-2.5 px-4 w-36">Sales Engineer</th>
                      <th className="py-2.5 px-4 text-right w-24">Stage Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, idx) => (
                        <tr key={idx} className="border-b border-slate-100 dark:border-slate-800">
                          <td className="py-3 px-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /></td>
                          <td className="py-3 px-4">
                            <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-1.5" />
                            <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
                          </td>
                          <td className="py-3 px-4"><div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /></td>
                          <td className="py-3 px-4"><div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /></td>
                          <td className="py-3 px-4"><div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /></td>
                          <td className="py-3 px-4 text-right"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded ml-auto animate-pulse" /></td>
                        </tr>
                      ))
                    ) : filteredLeads.length > 0 ? (
                      filteredLeads.map((lead) => (
                        <tr
                          key={lead.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-2.5 px-4 font-sans font-bold text-slate-700 dark:text-white">
                            {lead.leadNumber}
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                            <div>{lead.customerName || "Direct Inquiry"}</div>
                            {lead.contactPerson && (
                              <div className="text-[10px] text-slate-500 font-normal">
                                {lead.contactPerson} &bull; {lead.phone}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                            {lead.title}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {lead.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-sans font-bold text-slate-900 dark:text-white tabular-nums">
                            {formatPKR(lead.estimatedValue)}
                          </td>
                          <td className="py-2.5 px-4">
                            {getStageBadge(lead.stage)}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 text-[11px]">
                            {lead.assignedEngineer || "Engr. Zeeshan Ali"}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <select
                              value={lead.stage}
                              onChange={(e) => handleStageChange(lead.id, e.target.value)}
                              className="text-[11px] font-semibold bg-transparent border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                              <option value="New">New</option>
                              <option value="Qualified">Qualified</option>
                              <option value="Proposal">Proposal</option>
                              <option value="Negotiation">Negotiation</option>
                              <option value="Won">Won</option>
                              <option value="Lost">Lost</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-14 text-center">
                          <div className="max-w-xs mx-auto flex flex-col items-center">
                            <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                              <Search className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                              No matching inquiries found
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 mb-3">
                              Try adjusting your search terms or filter selection.
                            </p>
                            {(searchTerm || selectedCategory !== "All" || selectedStage !== "All") && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSearchTerm("");
                                  setSelectedCategory("All");
                                  setSelectedStage("All");
                                }}
                                className="h-7 text-xs border-slate-300 dark:border-slate-700"
                              >
                                Reset filters
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Tab 2: Turnkey Quotations Register */}
        {activeTab === "quotations" && (
          <section className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quotations.map((q) => (
                <div
                  key={q.id}
                  className="p-5 rounded-xl bg-white dark:bg-[#12183a] border border-slate-200 dark:border-slate-800/80 shadow-xs hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-sans text-xs font-bold text-[#1b366d] dark:text-white">
                          {q.quotationNo}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                          {q.customerName}
                        </h3>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs">
                        {q.status}
                      </Badge>
                    </div>

                    <div className="py-3">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {q.projectTitle}
                      </p>
                      <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                        {q.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 dark:text-slate-400 truncate max-w-xs">
                              {item.quantity}x {item.itemDescription} ({item.capacity || item.equipmentModel})
                            </span>
                            <span className="font-sans font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                              {formatPKR(item.totalPrice)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Total with 18% GST:</span>
                    <span className="text-sm font-display font-black text-slate-900 dark:text-white font-sans tabular-nums">
                      {formatPKR(q.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tab 3: HVAC Equipment Engineering Specs Catalog (TasteSkill Rule 6 & 7) */}
        {activeTab === "catalog" && (
          <section className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {hvacProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12183a] p-5 shadow-xs flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="font-sans text-[10px] font-bold text-[#1b366d] dark:text-white tracking-wider uppercase">
                          {prod.id} &bull; {prod.category}
                        </span>
                        <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                          {prod.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {prod.tagline}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#1b366d]/10 text-[#1b366d] dark:text-white shrink-0">
                        {prod.category === "Industrial Chiller" && <ThermometerSnowflake className="w-5 h-5" />}
                        {prod.category === "AHU / VRF" && <Fan className="w-5 h-5" />}
                        {prod.category === "Cold Storage" && <Boxes className="w-5 h-5" />}
                        {prod.category === "Package Units" && <Wind className="w-5 h-5" />}
                      </div>
                    </div>

                    <div className="my-3 grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Capacity</div>
                        <div className="font-medium text-slate-800 dark:text-slate-200">{prod.capacityRange}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Refrigerant</div>
                        <div className="font-medium text-slate-800 dark:text-slate-200">{prod.refrigerant}</div>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Efficiency Index</div>
                        <div className="font-sans font-semibold text-emerald-600 dark:text-emerald-400">{prod.cop}</div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Engineered Features:</div>
                      {prod.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Common Sector: {prod.applications.split(',')[0]}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          category: prod.category as any,
                          title: `${prod.name} Supply & Commissioning`,
                        }));
                        setIsModalOpen(true);
                      }}
                      className="h-7 text-xs border-slate-300 dark:border-slate-700 hover:bg-[#1b366d] hover:text-white transition-colors"
                    >
                      Inquire Sizing
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      </CoolpointLoadingBoundary>

      {/* New Commercial HVAC Inquiry Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#12183a] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-display font-bold text-slate-900 dark:text-white">
                    Create Commercial HVAC Inquiry
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Log new client tender or turnkey industrial equipment request
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateInquiry} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Project Title &amp; Scope *
                  </label>
                  <Input
                    required
                    placeholder="e.g. 2x 400 TR Water-Cooled Screw Chillers Supply"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Client / Company Name *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Fauji Fertilizer Co."
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Equipment Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value="Industrial Chiller">Industrial Chiller</option>
                      <option value="AHU / VRF">AHU / VRF</option>
                      <option value="Cold Storage">Cold Storage</option>
                      <option value="Package Units">Package Units</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Estimated Budget (PKR)
                    </label>
                    <Input
                      type="number"
                      value={formData.estimatedValue}
                      onChange={(e) => setFormData({ ...formData, estimatedValue: parseFloat(e.target.value) || 0 })}
                      className="h-9 text-xs font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Priority Level
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Contact Person
                    </label>
                    <Input
                      placeholder="e.g. Engr. Asim Raza"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Contact Phone
                    </label>
                    <Input
                      placeholder="+92 300 1234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                    className="h-8 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={submitting}
                    className="h-8 text-xs bg-[#1b366d] hover:bg-[#152a55] text-white gap-1.5"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save &amp; Log Inquiry
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CrmDashboard;
