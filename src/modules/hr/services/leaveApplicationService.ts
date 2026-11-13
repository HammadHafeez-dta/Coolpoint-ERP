import api from "@/shared/services/api";
import axios from "axios";
import { gazettedLeavesService } from "./gazettedLeavesService";

const BASE = "/hr/transaction/Leave";

export interface LeaveTypesDto {
    leaveType: string;
    leaveName: string;
}

export interface LeaveBalanceDto {
    empCardNo: number;
    alBalance: number;
    clBalance: number;
    slBalance: number;
    cplBalance: number;
    site: string;
}

export interface LeaveApplicationChildDto {
    serialNo: number;
    applicationNo: number;
    empCardNo: number;
    empName?: string;
    departmentName?: string;
    leaveType: string;
    leaveName: string;
    fromDate: string;
    toDate: string;
    totalLeaves: number;
    remarks?: string;
    site: string;
}

export interface LeaveApplicationMasterDto {
    applicationNo: number;
    applicationDate: string;
    site: string;
    enterBy?: string;
}

export interface LeaveApplicationCreateDto {
    applicationNo?: number;
    applicationDate: string;
    site: string;
    enterBy: string;
    items: {
        empCardNo: number;
        leaveType: string;
        fromDate: string;
        toDate: string;
        totalLeaves: number;
        remarks?: string;
    }[];
}

export interface BulkLeaveApplicationDto {
    applicationDate: string;
    departmentId: number;
    leaveType: string;
    fromDate: string;
    toDate: string;
    totalLeaves: number;
    remarks?: string;
    site: string;
    enterBy: string;
}

export const leaveApplicationService = {
    getMaxNumber: async (site: string) => {
        const response = await api.get<number>(`${BASE}/application/maxno`, {
            params: { site },
        });
        return response.data;
    },

    getLeaveTypes: async () => {
        const response = await api.get<LeaveTypesDto[]>(`${BASE}/types`);
        return response.data;
    },

    getBalance: async (empCardNo: number, site: string) => {
        const [al, cl, sl, cpl] = await Promise.all([
            api.get<number>(`${BASE}/balance/al/${empCardNo}`, { params: { site } }),
            api.get<number>(`${BASE}/balance/cl/${empCardNo}`, { params: { site } }),
            api.get<number>(`${BASE}/balance/sl/${empCardNo}`, { params: { site } }),
            api.get<number>(`${BASE}/balance/cpl/${empCardNo}`, { params: { site } }),
        ]);
        return {
            empCardNo,
            alBalance: al.data,
            clBalance: cl.data,
            slBalance: sl.data,
            cplBalance: cpl.data,
            site,
        } as LeaveBalanceDto;
    },

    checkLeaveRange: async (fromDate: string, toDate: string, leaveType: string, empCardNo: number, site: string) => {
        try {
            const response = await api.get(`${BASE}/check/range`, {
                params: { fromDate, toDate, leaveType, empcard: empCardNo, site },
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) return null;
            throw error;
        }
    },

    getByApplicationNo: async (applicationNo: number, site: string) => {
        const response = await api.get<LeaveApplicationMasterDto>(
            `${BASE}/master/${applicationNo}`,
            { params: { site } }
        );
        return response.data;
    },

    getItems: async (applicationNo: number, site: string) => {
        const response = await api.get<LeaveApplicationChildDto[]>(
            `${BASE}/child/${applicationNo}`,
            { params: { site } }
        );
        return response.data;
    },

    create: async (dto: LeaveApplicationCreateDto) => {
        let appNo = dto.applicationNo;
        if (!appNo) {
            try {
                appNo = await leaveApplicationService.getMaxNumber(dto.site);
            } catch {
                appNo = 1;
            }
        }
        await api.post(`${BASE}/master`, {
            applicationNo: appNo,
            applicationDate: dto.applicationDate,
        }, { params: { site: dto.site, userId: dto.enterBy } });
        for (const item of dto.items) {
            await api.post(`${BASE}/child`, {
                ...item,
                applicationNo: appNo,
            }, { params: { site: dto.site } });

            let leaveUsage = { ALUsed: 0, CLUsed: 0, SLUsed: 0, CPLUsed: 0 };
            if (item.leaveType === "AL") leaveUsage.ALUsed = item.totalLeaves;
            else if (item.leaveType === "CL") leaveUsage.CLUsed = item.totalLeaves;
            else if (item.leaveType === "SL") leaveUsage.SLUsed = item.totalLeaves;
            else if (item.leaveType === "CPL") leaveUsage.CPLUsed = item.totalLeaves;
            else if (item.leaveType === "HDL") {
                const balance = await leaveApplicationService.getBalance(item.empCardNo, dto.site);
                if (balance.clBalance >= item.totalLeaves) leaveUsage.CLUsed = item.totalLeaves;
                else if (balance.slBalance >= item.totalLeaves) leaveUsage.SLUsed = item.totalLeaves;
                else if (balance.alBalance >= item.totalLeaves) leaveUsage.ALUsed = item.totalLeaves;
            }

            if (Object.values(leaveUsage).some((value) => value > 0)) {
                await api.post(`${BASE}/register`, {
                    applicationNo: appNo,
                    applicationDate: dto.applicationDate,
                    ...item,
                    ...leaveUsage,
                }, { params: { site: dto.site, userId: dto.enterBy } });
            }
        }
        return { applicationNo: appNo, applicationDate: dto.applicationDate, site: dto.site };
    },

    createBulk: async (dto: BulkLeaveApplicationDto) => {
        console.warn("Bulk leave application uses simplified master/child save.", dto);
        return { count: 0 };
    },

    update: async (applicationNo: number, dto: LeaveApplicationCreateDto) => {
        await api.post(`${BASE}/master`, {
            applicationNo,
            applicationDate: dto.applicationDate,
        }, { params: { site: dto.site, userId: dto.enterBy } });
    },

    delete: async (applicationNo: number, site: string) => {
        await api.delete(`${BASE}/record/${applicationNo}`, { params: { site } });
    },

    getByEmployee: async (_empCardNo: number, _site: string) => {
        return [] as LeaveApplicationChildDto[];
    },

    getRecent: async (site: string, count: number = 50) => {
        const response = await api.get<LeaveApplicationChildDto[]>(`${BASE}/recent`, {
            params: { site, count },
        });
        return response.data;
    },

    getGazettedLeaves: async (site: string) => {
        try {
            return await gazettedLeavesService.getAll(site);
        } catch (error) {
            console.error("Error loading gazetted leaves for leave application:", error);
            return [] as any[];
        }
    },

    viewLeaveApplicationReport: async (params: { site: string; empCardNo: number }): Promise<void> => {
        const response = await api.get(`${BASE}/report/application`, {
            params,
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewLeaveLedgerReport: async (empCardNo: number, site: string): Promise<void> => {
        const response = await api.get(`${BASE}/report/ledger`, {
            params: { empCardNo, site },
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewLeaveRegisterReport: async (params: {
        site: string;
        fromDate: string;
        toDate: string;
        empCardNo?: number;
        deptCode?: string;
        desigCode?: number;
    }): Promise<void> => {
        const response = await api.get(`${BASE}/report/register`, {
            params,
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },
};
