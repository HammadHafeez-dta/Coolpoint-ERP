import api from '@/shared/services/api';
import { authService } from '@/modules/auth/services/authService';

const BASE = "/hr/transaction/Leave/gazetted";

export interface GazettedLeaf {
    transactionNo: number;
    site: string;
    leaveName: string;
    leaveDate: string | null;
}

export const gazettedLeavesService = {
    getAll: async (site?: string): Promise<GazettedLeaf[]> => {
        const resolvedSite = site || authService.getSite() || "SAFT";
        try {
            const response = await api.get<any[]>(`${BASE}/list`, { params: { site: resolvedSite } });
            return response.data.map(d => ({
                transactionNo: d.applicationNo,
                site: resolvedSite,
                leaveName: d.leaveType || "",
                leaveDate: d.leaveDate || null
            }));
        } catch (error) {
            console.error("Error fetching gazetted leaves list:", error);
            return [];
        }
    },

    getById: async (transactionNo: number, site: string): Promise<GazettedLeaf> => {
        const response = await api.get<any>(`${BASE}/${transactionNo}`, { params: { site } });
        // Map GazettedLeaveDto backend structure (ApplicationNo, LeaveDate, LeaveType) to GazettedLeaf frontend structure
        const data = response.data;
        return {
            transactionNo: data.applicationNo,
            site: site,
            leaveName: data.leaveType || "",
            leaveDate: data.leaveDate || null
        };
    },

    create: async (data: Partial<GazettedLeaf>): Promise<GazettedLeaf> => {
        const payload = {
            applicationNo: data.transactionNo,
            leaveDate: data.leaveDate,
            leaveType: data.leaveName
        };
        await api.post(BASE, payload, { params: { site: data.site } });
        return data as GazettedLeaf;
    },

    update: async (transactionNo: number, data: Partial<GazettedLeaf>): Promise<void> => {
        const payload = {
            applicationNo: transactionNo,
            leaveDate: data.leaveDate,
            leaveType: data.leaveName
        };
        await api.post(BASE, payload, {
            params: { site: data.site },
        });
    },

    delete: async (_transactionNo: number): Promise<void> => {
        console.warn("Gazetted leave delete is not exposed on this API.");
    },

    getNextCode: async (site?: string): Promise<number> => {
        const resolvedSite = site || authService.getSite() || "SAFT";
        const response = await api.get(`${BASE}/maxno`, { params: { site: resolvedSite } });
        return response.data;
    },

    viewReportPdf: async (): Promise<void> => {
        console.warn("Gazetted leaves PDF report is not available on this API.");
    },
};
