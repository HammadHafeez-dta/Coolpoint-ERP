import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  ArrowRight,
  Building2,
  ShieldCheck
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { authService } from "@/modules/auth/services/authService";
import { useToast } from "@/shared/components/ui/use-toast";

import { CoolpointLoader, COOLPOINT_SEQUENCE_MS, COOLPOINT_EXIT_MS } from "@/shared/components/CoolpointLoader";

function waitForAnimation(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => { window.clearTimeout(timer); reject(new DOMException("Aborted", "AbortError")); };
    const timer = window.setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, Math.max(0, ms));
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  });
}

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = authService.getToken();
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      if (payload.exp && payload.exp * 1000 <= Date.now()) {
        authService.logout();
        return;
      }
    } catch {
      authService.logout();
      return;
    }
    navigate("/modules", { replace: true });
  }, [navigate]);

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const pendingRef = useRef<AbortController | null>(null);
  const formPageRef = useRef<HTMLDivElement>(null);
  useEffect(() => () => pendingRef.current?.abort(), []);
  useEffect(() => {
    if (formPageRef.current) formPageRef.current.inert = loading;
  }, [loading]);
  const [rememberMe, setRememberMe] = useState(false);
  const [sites, setSites] = useState<{ site: string; name: string }[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    const fetchSites = async () => {
      try {
        const data = await authService.getSites();
        if (!isMounted) return;

        if (Array.isArray(data) && data.length > 0) {
          setSites(data);
          setSelectedSite(data[0].site);
        }
      } catch (err) {
        console.error("Failed to load sites", err);
      }
    };
    fetchSites();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingRef.current) return;
    if (!username || !password || !selectedSite) {
      toast({
        title: "Required Fields Missing",
        description: "Please enter your username, password, and select an operating facility.",
        variant: "destructive",
      });
      return;
    }

    const controller = new AbortController();
    pendingRef.current = controller;
    const startedAt = performance.now();
    setComplete(false);
    setLoading(true);
    try {
      await authService.login(username, password, selectedSite, rememberMe, controller.signal);
      if (controller.signal.aborted) return;
      const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : COOLPOINT_SEQUENCE_MS;
      await waitForAnimation(duration - (performance.now() - startedAt), controller.signal);
      setComplete(true);
      // Keep the form covered until the modules route unmounts this page.
      await waitForAnimation(COOLPOINT_EXIT_MS, controller.signal);
      toast({
        title: "Authentication Successful",
        description: "Welcome to CoolPoint International Enterprise Portal.",
      });
      navigate("/modules", { replace: true });
    } catch (error: unknown) {
      if (controller.signal.aborted) return;
      setLoading(false);
      pendingRef.current = null;
      toast({
        title: "Authentication Failed",
        description: (isAxiosError(error) && error.response?.data?.message) || "Invalid credentials or unauthorized access.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
    <CoolpointLoader active={loading} complete={complete} fullScreen label="Authenticating with Coolpoint" />
    <div ref={formPageRef} aria-busy={loading} className="relative min-h-screen w-full flex flex-col justify-between items-center p-4 sm:p-6 font-sans selection:bg-[#171858]/15 selection:text-[#171858] overflow-hidden">
      {/* Authentic CoolPoint Infrastructure Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none scale-105 transition-transform duration-700"
        style={{ backgroundImage: `url('/assets/images/infrastructure.jpg')` }}
      />
      {/* Atmospheric Corporate Dark Overlay */}
      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-5xl flex items-center justify-between py-2 text-xs text-slate-200">
        <span className="font-semibold tracking-wide">CoolPoint International</span>
        <span className="font-sans text-[11px] text-slate-300">Enterprise Portal</span>
      </header>

      {/* Centered Sign In Card */}
      <main className="relative z-10 w-full max-w-[420px] my-auto">
        <div className="bg-white rounded-2xl border border-white/20 shadow-2xl p-6 sm:p-8">
          {/* Single Official CoolPoint Brand Logo */}
          <div className="flex flex-col items-center text-center mb-6">
            <img
              src="/coolpoint-logo-navy.png"
              alt="CoolPoint International"
              className="h-10 w-auto object-contain mb-4"
            />
            <h1 className="text-xl font-display font-bold text-slate-900 tracking-tight">
              Sign In
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your credentials to access your operating branch
            </p>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Operating Facility */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#171858]" />
                Operating Facility
              </label>
              <Select
                key={selectedSite}
                value={selectedSite || undefined}
                onValueChange={setSelectedSite}
              >
                <SelectTrigger className="h-10 bg-white border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-[#171858]/15 focus:border-[#171858] text-xs sm:text-sm transition-colors">
                  <SelectValue placeholder="Select Operating Facility" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-900 shadow-xl">
                  {sites.map((s) => (
                    <SelectItem
                      key={s.site}
                      value={s.site}
                      className="focus:bg-slate-100 focus:text-slate-900 cursor-pointer text-xs sm:text-sm py-2"
                    >
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Username / Employee ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#171858]" />
                Username or Employee ID
              </label>
              <Input
                type="text"
                placeholder="Enter username or ID"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-lg focus:ring-2 focus:ring-[#171858]/15 focus:border-[#171858] text-xs sm:text-sm transition-colors"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#171858]" />
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 h-10 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-lg focus:ring-2 focus:ring-[#171858]/15 focus:border-[#171858] text-xs sm:text-sm transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="rounded border-slate-300 data-[state=checked]:bg-[#171858] data-[state=checked]:border-[#171858]"
                />
                <span className="text-xs text-slate-600 hover:text-slate-900 transition-colors">
                  Keep me signed in on this workstation
                </span>
              </label>
            </div>

            {/* Primary Action Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg font-semibold text-xs sm:text-sm bg-[#171858] hover:bg-[#121344] text-white shadow-md shadow-[#171858]/20 gap-2 active:scale-[0.99] transition-all"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Secure Workstation Note */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Enterprise Terminal Session</span>
          </div>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="relative z-10 w-full max-w-5xl py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-300">
        <div>
          &copy; {new Date().getFullYear()} CoolPoint (Pvt.) Ltd. All rights reserved.
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-300">
          <span>Sundar Industrial Complex</span>
          <span>&bull;</span>
          <span>Lahore Head Office</span>
          <span>&bull;</span>
          <a
            href="https://coolpointintl.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:underline font-medium"
          >
            coolpointintl.com
          </a>
        </div>
      </footer>
    </div>
    </>
  );
};

export default Login;
