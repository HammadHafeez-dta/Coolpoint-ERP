import { isAxiosError } from "axios";

export function errorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.errors) return Object.values(data.errors).flat().join(" ");
    if (data?.message || data?.detail || data?.title) return data.message || data.detail || data.title;
    if (error.response?.status === 404) return "The requested CRM action was not found. Restart the updated API and try again.";
    if (error.response?.status) return `The CRM request failed (HTTP ${error.response.status}). Please try again.`;
    return "The CRM API could not be reached. Check your connection and try again.";
  }
  return error instanceof Error ? error.message : "The request could not be completed.";
}

export const inquiryLifecycleStates = ["New", "Contacted", "Qualified", "Disqualified"] as const;

export const selectClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
