import api from "@/shared/services/api";

export interface Status {
    statusNo: number;
    statusName: string;
    site?: string;
}

interface BackendStatus {
    statusNo: number;
    statusName: string;
    site?: string;
}

const toStatus = (s: BackendStatus): Status => ({
    statusNo: s.statusNo,
    statusName: s.statusName || "",
    site: s.site,
});

const toPayload = (s: Partial<Status>) => ({
    statusNo: s.statusNo ?? 0,
    statusName: s.statusName ?? "",
});

export const statusService = {
    getAll: async (site?: string): Promise<Status[]> => {
        const response = await api.get<BackendStatus[]>("/hr/define/status/list", { params: { site } });
        return response.data.map(toStatus);
    },

    getById: async (id: number, site?: string): Promise<Status> => {
        const response = await api.get<BackendStatus>(`/hr/define/status/${id}`, { params: { site } });
        return toStatus(response.data);
    },

    create: async (data: Partial<Status>, site?: string): Promise<Status> => {
        await api.post("/hr/define/status/save", toPayload(data), { params: { site } });
        return data as Status;
    },

    update: async (id: number, data: Partial<Status>, site?: string): Promise<void> => {
        await api.post("/hr/define/status/save", toPayload({ ...data, statusNo: id }), { params: { site } });
    },

    delete: async (id: number, site?: string): Promise<void> => {
        await api.delete(`/hr/define/status/${id}`, { params: { site } });
    },

    getNextCode: async (site?: string): Promise<number> => {
        const response = await api.get<number>("/hr/define/status/maxno", { params: { site } });
        return response.data;
    },
};
