import api from "@/shared/services/api";

export interface LeaveRegister {
    empCardNo: number;
    site: string;
    leaveMonth: number;
    leaveYear: number;
    applicationNo: number;
    leaveDate?: string;
    alOpen: number;
    alAdd: number;
    alUse: number;
    clOpen: number;
    clAdd: number;
    clUse: number;
    slOpen: number;
    slAdd: number;
    slUse: number;
    cplOpen: number;
    cplAdd: number;
    cplUse: number;
    enterBy?: string;
    enteryTime?: string;
    editBy?: string;
    editTime?: string;
    serialNo: number;
    empName?: string;
    departmentName?: string;
    designationName?: string;
}

export const leaveRegisterService = {
    getAll: async (site: string): Promise<LeaveRegister[]> => {
        // Return empty array since list of all adjustments is not exposed to prevent 404
        return [];
    },

    getByEmployee: async (empCardNo: number, month: number, year: number, site: string): Promise<LeaveRegister> => {
        try {
            const response = await api.get<any>('/hr/transaction/Leave/adjustment', {
                params: { empcard: empCardNo, leavemonth: month, leaveyear: year, site }
            });
            const data = response.data;
            if (!data || !data.empCardNo) return null as any;
            return {
                empCardNo: data.empCardNo,
                site: site,
                leaveMonth: month,
                leaveYear: year,
                applicationNo: 0,
                alOpen: data.alOpen || 0,
                clOpen: data.clOpen || 0,
                slOpen: data.slOpen || 0,
                cplOpen: data.cplOpen || 0,
                alAdd: 0, alUse: 0,
                clAdd: 0, clUse: 0,
                slAdd: 0, slUse: 0,
                cplAdd: 0, cplUse: 0,
                serialNo: data.empCardNo
            } as LeaveRegister;
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                return null as any;
            }
            throw error;
        }
    },

    create: async (data: Partial<LeaveRegister>): Promise<LeaveRegister> => {
        const payload = {
            empCardNo: data.empCardNo,
            alOpen: data.alOpen,
            clOpen: data.clOpen,
            slOpen: data.slOpen,
            cplOpen: data.cplOpen,
            leaveDate: data.leaveDate || new Date().toISOString()
        };
        await api.put('/hr/transaction/Leave/adjustment', payload, {
            params: { site: data.site, userId: data.enterBy || "1" }
        });
        return data as LeaveRegister;
    },

    update: async (data: Partial<LeaveRegister>): Promise<void> => {
        const payload = {
            empCardNo: data.empCardNo,
            alOpen: data.alOpen,
            clOpen: data.clOpen,
            slOpen: data.slOpen,
            cplOpen: data.cplOpen,
            leaveDate: data.leaveDate || new Date().toISOString()
        };
        await api.put('/hr/transaction/Leave/adjustment', payload, {
            params: { site: data.site, userId: data.editBy || "1" }
        });
    },

    delete: async (serialNo: number): Promise<void> => {
        console.warn("Delete adjustment is not exposed on this backend API.");
    }
};
