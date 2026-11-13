import api from "@/shared/services/api";

const BASE = "/hr/transaction/Attendance";

export interface AttendanceDto {
    empCardNo: number;
    attendanceDate: string;
    timeIn?: string;
    timeOut?: string;
    inStatus?: boolean;
    outStatus?: boolean;
    action?: string;
    attendanceType?: string;
    unit?: string;
    section?: string;
    shift?: string;
    departmentCode?: string;
    designationCode?: number;
    atype?: string;
    remarks?: string;
    site?: string;
}

export interface AttendanceRegisterRow {
    attendanceDate: string;
    attnedanceType?: string | null;
    totalDays?: number | null;
}

export const attendanceService = {
    getEmployeeAttendanceRegister: async (
        fromDate: string,
        toDate: string,
        empcard: number,
        site: string
    ): Promise<AttendanceRegisterRow[]> => {
        const response = await api.get(`${BASE}/register`, {
            params: { fromDate, toDate, empcard, site },
        });
        return response.data;
    },

    updateAttendanceRegister: async (
        empCard: number,
        attendanceDate: string,
        attendanceType: string,
        totalDays: number,
        site: string
    ): Promise<void> => {
        await api.put(`${BASE}/register`, {
            empCard,
            attendanceDate,
            attendanceType,
            totalDays,
        }, { params: { site } });
    },

    updateManualIn: async (data: AttendanceDto) => {
        const response = await api.post(`${BASE}/machine/manualin`, data);
        return response.data;
    },

    updateManualOut: async (data: AttendanceDto) => {
        const response = await api.post(`${BASE}/machine/manualout`, data);
        return response.data;
    },

    checkManualAttendance: async (date: string, empCardNo: number) => {
        const response = await api.get(`${BASE}/daily/check`, {
            params: { attendate: date, empcard: empCardNo },
        });
        return response.data;
    },

    getDailyAttendance: async (date: string) => {
        const response = await api.get(`${BASE}/daily/inout`, {
            params: { attendate: date },
        });
        return response.data;
    },

    deleteManualAttendance: async (date: string, empCardNo: number, site: string) => {
        const response = await api.delete(`${BASE}/machine`, {
            data: { empCardNo, attendanceDate: date, site },
        });
        return response.data;
    },

    updateMachineAttendance: async (
        fromDate: string,
        toDate: string,
        empCardNo?: number,
        cardWise: boolean = false
    ) => {
        const response = await api.post(`${BASE}/machine/bulk`, null, {
            params: { fromDate, toDate, empCardNo, cardWise }
        });
        return response.data;
    },

    readAttLog: async (_sn: string, _startTime?: string, _endTime?: string) => {
        console.warn("iClock integration is not available on this API.");
        return null;
    },

    readNewLog: async (_sn: string) => {
        console.warn("iClock integration is not available on this API.");
        return null;
    },

    viewDailyAttendanceReport: async (params: Record<string, unknown>): Promise<void> => {
        const response = await api.get(`${BASE}/report/daily`, {
            params,
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewMachineAttendanceReport: async (params: Record<string, unknown>): Promise<void> => {
        const response = await api.get(`${BASE}/report/machine`, {
            params,
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewAttendanceRegisterReport: async (params: Record<string, unknown>): Promise<void> => {
        const response = await api.get(`${BASE}/report/register`, {
            params,
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewOvertimeReport: async (params: Record<string, unknown>): Promise<void> => {
        const response = await api.get(`${BASE}/report/overtime`, {
            params,
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewEmployeeTimeCardReport: async (params: { site: string; fromDate: string; toDate: string; empCardNo: number }): Promise<void> => {
        const response = await api.get(`${BASE}/report/time-card`, {
            params,
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewShortLeaveLateDetailReport: async (params: { site: string; fromDate: string; toDate: string; category?: string }): Promise<void> => {
        const response = await api.get(`${BASE}/report/short-late-detail`, {
            params,
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewLeaveAbsentDetailReport: async (params: { site: string; fromDate: string; toDate: string; category?: string }): Promise<void> => {
        const response = await api.get(`${BASE}/report/leave-absent-detail`, {
            params,
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewAttendanceSummaryOptionsReport: async (params: { site: string; fromDate: string; toDate: string; category?: string; displayType: string }): Promise<void> => {
        const response = await api.get(`${BASE}/report/summary-options`, {
            params,
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewDutyTimingReport: async (params: {
        site: string;
        reportType: 'all' | 'employee' | 'department';
        employeeCardNo?: number;
        departmentCode?: number;
        fromDate?: string;
        toDate?: string;
    }): Promise<void> => {
        const response = await api.get(`${BASE}/report/duty-timing`, {
            params,
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    getDailyAttendanceReport: async (date: string, search?: string, site?: string) => {
        const response = await api.get(`${BASE}/daily-report`, {
            params: { date, search, site },
        });
        return response.data;
    },

    getAttendanceHistoryReport: async (fromDate: string, toDate: string, search?: string, site?: string) => {
        const response = await api.get(`${BASE}/history-report`, {
            params: { fromDate, toDate, search, site },
        });
        return response.data;
    },
};
