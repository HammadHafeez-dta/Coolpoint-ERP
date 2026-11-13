import api from "@/shared/services/api";

export interface JobPost {
    jobPostId: number;
    site: string;
    jobCode: string;
    designation: string;
    description: string;
    postedDate: string;
    status: string;
}

export const jobPostService = {
    getAll: async (site: string) => {
        const response = await api.get<JobPost[]>(`/job-posts?site=${site}`);
        return response.data;
    },
    getById: async (id: number, site: string) => {
        const response = await api.get<JobPost>(`/job-posts/${id}?site=${site}`);
        return response.data;
    },
    create: async (data: Omit<JobPost, 'jobPostId'>) => {
        const response = await api.post<JobPost>('/job-posts', data);
        return response.data;
    },
    update: async (id: number, site: string, data: JobPost) => {
        const response = await api.put(`/job-posts/${id}?site=${site}`, data);
        return response.data;
    },
    delete: async (id: number, site: string) => {
        const response = await api.delete(`/job-posts/${id}?site=${site}`);
        return response.data;
    }
};
