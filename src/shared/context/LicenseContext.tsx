import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";

interface LicenseContextType {
  warningMinutes: number | null;
  setWarningMinutes: (minutes: number | null) => void;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export const LicenseProvider = ({ children }: { children: ReactNode }) => {
  const [warningMinutes, setWarningMinutes] = useState<number | null>(null);

  useEffect(() => {
    const handleWarning = (event: any) => {
      setWarningMinutes(event.detail);
    };

    window.addEventListener("license-warning", handleWarning);
    return () => window.removeEventListener("license-warning", handleWarning);
  }, []);

  return (
    <LicenseContext.Provider value={{ warningMinutes, setWarningMinutes }}>
      {warningMinutes !== null && warningMinutes > 0 && (
        <div className="fixed top-0 left-0 right-0 z-[100] animate-in slide-in-from-top duration-500">
          <div className="bg-amber-500 text-white px-4 py-2.5 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5" />
              <p className="text-sm font-medium">
                License Warning: Your license will expire in {Math.round(warningMinutes)} minutes. 
                Please contact support to avoid service interruption.
              </p>
            </div>
            <button 
              onClick={() => setWarningMinutes(null)}
              className="p-1 hover:bg-white/20 rounded-md transition"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}
      {children}
    </LicenseContext.Provider>
  );
};

export const useLicense = () => {
  const context = useContext(LicenseContext);
  if (context === undefined) {
    throw new Error("useLicense must be used within a LicenseProvider");
  }
  return context;
};
