import { QueryClient } from "@tanstack/react-query";

declare const __BUILD_ID__: string;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnWindowFocus: true,
    },
  },
});

const PRESERVED_KEYS = [
  "token",
  "site",
  "siteName",
  "teacherId",
  "user",
  "userID",
  "userName",
  "userNo",
  "userLevel",
  "branchCode",
  "branchName",
  "assessment_test_marks",
];

export const clearCachePreservingAuth = () => {
  const preservedLocal: Record<string, string> = {};
  const preservedSession: Record<string, string> = {};

  PRESERVED_KEYS.forEach((k) => {
    const lVal = localStorage.getItem(k);
    if (lVal !== null) preservedLocal[k] = lVal;
    const sVal = sessionStorage.getItem(k);
    if (sVal !== null) preservedSession[k] = sVal;
  });

  localStorage.clear();
  sessionStorage.clear();

  Object.entries(preservedLocal).forEach(([k, v]) => localStorage.setItem(k, v));
  Object.entries(preservedSession).forEach(([k, v]) => sessionStorage.setItem(k, v));
};

export const checkAppVersion = async () => {
  try {
    const res = await fetch("/version.json?t=" + Date.now(), { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    if (data.buildId && typeof __BUILD_ID__ !== "undefined" && data.buildId !== __BUILD_ID__) {
      if (sessionStorage.getItem("__reloading_version__") === data.buildId) {
        return;
      }
      clearCachePreservingAuth();
      sessionStorage.setItem("__reloading_version__", data.buildId);
      queryClient.clear();
      window.location.reload();
    }
  } catch {
    // Fail silently
  }
};

export const initVersionCheck = () => {
  checkAppVersion();
  window.addEventListener("focus", checkAppVersion);
  const interval = setInterval(checkAppVersion, 5 * 60 * 1000);
  return () => {
    window.removeEventListener("focus", checkAppVersion);
    clearInterval(interval);
  };
};
