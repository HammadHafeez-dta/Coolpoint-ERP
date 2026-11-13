import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { authService } from "@/modules/auth/services/authService";
import { SESSION_EXPIRED_EVENT } from "@/shared/services/axiosConfig";

const getTokenExpiryMs = (): number | null => {
  const token = authService.getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

const SessionExpiredDialog = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(SESSION_EXPIRED_EVENT, show);

    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      if (timer) clearTimeout(timer);
      const exp = getTokenExpiryMs();
      if (!exp) return;
      timer = setTimeout(show, Math.max(exp - Date.now(), 0));
    };
    schedule();
    window.addEventListener("auth-changed", schedule);

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, show);
      window.removeEventListener("auth-changed", schedule);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const signInAgain = () => {
    authService.logout();
    setOpen(false);
    window.location.assign("/");
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="items-center text-center sm:text-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Clock className="size-6" aria-hidden="true" />
          </div>
          <AlertDialogTitle className="text-xl font-bold tracking-tight">
            Your session has timed out
          </AlertDialogTitle>
          <AlertDialogDescription>
            For your security you were signed out. Sign in again to continue
            where you left off.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction onClick={signInAgain} className="w-full sm:w-auto">
            Sign in again
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SessionExpiredDialog;
