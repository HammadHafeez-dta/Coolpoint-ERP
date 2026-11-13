import api from '@/shared/services/api';

export interface LeaveBalance {
    empCardNo: number;
    alBalance: number;
    clBalance: number;
    slBalance: number;
    cplBalance: number;
    site: string;
}

export interface LeaveApprovalList {
    serialNo: number;
    applicationNo: number;
    empCardNo: number;
    empName: string;
    leaveType: string;
    leaveDate: string;
    fromDate: string;
    toDate: string;
    totalLeaves: number;
    leaveName: string;
    leaveApprovalStatus: string;
}

export interface LeaveApprovalDetail {
    applicationNo: number;
    applicationDate: string;
    empCardNo: number;
    empName: string;
    fatherName: string;
    departmentName: string;
    designationName: string;
    joiningDate: string;
    leaveType: string;
    leaveName: string;
    fromDate: string;
    toDate: string;
    totalLeaves: number;
    remarks: string;
    balances: LeaveBalance;
}

export interface LeaveApprovalAction {
    applicationNo: number;
    empCardNo: number;
    approved: boolean;
    rejected: boolean;
}

export const leaveApprovalService = {
    getLeaves: async (status: string, fromDate?: string, toDate?: string, search?: string): Promise<LeaveApprovalList[]> => {
        let url = `/LeaveApproval?status=${status}`;
        if (fromDate) url += `&fromDate=${fromDate}`;
        if (toDate) url += `&toDate=${toDate}`;
        if (search) url += `&search=${search}`;
        const response = await api.get(url);
        return response.data;
    },

    getPendingLeaves: async (): Promise<LeaveApprovalList[]> => {
        const response = await api.get('/LeaveApproval/pending');
        return response.data;
    },

    getLeaveDetail: async (applicationNo: number, empCardNo: number): Promise<LeaveApprovalDetail> => {
        const response = await api.get(`/LeaveApproval/${applicationNo}/${empCardNo}`);
        return response.data;
    },

    getEmployeeBalance: async (empCardNo: number, date?: string): Promise<LeaveBalance> => {
        const url = date ? `/LeaveApproval/balance/${empCardNo}?date=${date}` : `/LeaveApproval/balance/${empCardNo}`;
        const response = await api.get(url);
        return response.data;
    },

    updateStatus: async (action: LeaveApprovalAction): Promise<void> => {
        await api.post('/LeaveApproval/update-status', action);
    },

    deleteLeaveRequest: async (applicationNo: number, empCardNo: number): Promise<void> => {
        await api.delete(`/LeaveApproval/${applicationNo}/${empCardNo}`);
    }
};
