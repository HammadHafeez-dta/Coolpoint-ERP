import api from "@/shared/services/api";

export interface Applicant {
    applicantId: number;
    site: string;
    applicantName: string;
    fatherName: string;
    cnic: string;
    phoneNo: string;
    appliedFor: string;
    applicationDate: string;
    status: string;
    jobPostId?: number;
    empCardNo?: number;
    resumeFileName?: string;
}

export const applicantService = {
    getAll: async (site: string) => {
        const response = await api.get<Applicant[]>(`/applicants?site=${site}`);
        return response.data;
    },
    getById: async (id: number, site: string) => {
        const response = await api.get<Applicant>(`/applicants/${id}?site=${site}`);
        return response.data;
    },
    create: async (data: Omit<Applicant, 'applicantId'>) => {
        const response = await api.post<Applicant>('/applicants', data);
        return response.data;
    },
    update: async (id: number, site: string, data: Applicant) => {
        const response = await api.put(`/applicants/${id}?site=${site}`, data);
        return response.data;
    },
    delete: async (id: number, site: string) => {
        const response = await api.delete(`/applicants/${id}?site=${site}`);
        return response.data;
    },
    uploadCv: async (id: number, site: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`/applicants/${id}/upload-cv?site=${site}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    downloadCv: async (id: number, site: string) => {
        const response = await api.get(`/applicants/${id}/download-cv?site=${site}`, {
            responseType: 'blob'
        });
        return response.data;
    }
};
