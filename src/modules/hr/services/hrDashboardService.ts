import api from "@/shared/services/api";

export interface DashboardSection<T> { status: "ready" | "restricted" | "unavailable"; data: T | null; message: string | null }
export interface HrCount { label: string; count: number }
export interface WorkforceOverview { activeEmployees: number; missingJoiningDates: number; joiners: { month: string; count: number }[]; departments: HrCount[] }
export interface AttendanceOverview { total: number; buckets: HrCount[] }
export interface LeaveOverview { onLeave: number; pendingRequests: number; pendingFrom: string; pendingTo: string }
export interface HrActivity { id: string; employee: string; action: string; date: string; status: string; href: string; employeeId?: number | null }
export interface HrEvent { id: string; title: string; detail: string; date: string; kind: string; href: string }
export interface HrDashboardData {
  today: string; from: string; to: string; timeZone: string; asOf: string;
  workforce: DashboardSection<WorkforceOverview>; attendance: DashboardSection<AttendanceOverview>; leaves: DashboardSection<LeaveOverview>;
  employeeActivity: DashboardSection<HrActivity[]>; leaveActivity: DashboardSection<HrActivity[]>;
  holidays: DashboardSection<HrEvent[]>; scheduledLeave: DashboardSection<HrEvent[]>;
}
export const hrDashboardService = {
  photo: async (id: number, signal?: AbortSignal): Promise<Blob> =>
    (await api.get<Blob>(`/hr/dashboard/employees/${id}/photo`, { responseType: "blob", signal })).data,
  get: async (from: string, to: string, signal?: AbortSignal): Promise<HrDashboardData> =>
    (await api.get<HrDashboardData>("/hr/dashboard", { params: { from, to }, signal })).data,
};
