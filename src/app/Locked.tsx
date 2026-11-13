import { ShieldAlert } from "lucide-react";

const Locked = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="flex justify-center">
          <div className="bg-red-50 p-4 rounded-full">
            <ShieldAlert className="size-16 text-red-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            System Suspended
          </h1>
          <p className="text-slate-500 text-lg">
            Access to this system has been restricted.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
          <p className="text-amber-800 text-sm font-medium">
            Reason: License verification failed or has expired.
          </p>
        </div>

        <div className="pt-4">
          <p className="text-slate-400 text-sm">
            Please contact your system administrator or support team to renew your license and restore access.
          </p>
        </div>

        <div className="pt-6 flex flex-col gap-3">
          <button 
            onClick={() => window.location.href = "/"}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
          >
            Retry Access
          </button>
          <a 
            href="mailto:support@synctecho.com" 
            className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-base font-medium rounded-md text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-sm"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default Locked;
