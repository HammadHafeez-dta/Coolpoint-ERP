import api from "@/shared/services/api";

export interface Scale {
    scaleId: number;
    scaleName: string;
    site?: string;
}

interface BackendScale {
    scaleId: number;
    scaleName: string;
    site?: string;
}

const toScale = (s: BackendScale): Scale => ({
    scaleId: s.scaleId,
    scaleName: s.scaleName || "",
    site: s.site,
});

const toPayload = (s: Partial<Scale>) => ({
    scaleId: s.scaleId ?? 0,
    scaleName: s.scaleName ?? "",
});

export const scaleService = {
    getAll: async (site?: string): Promise<Scale[]> => {
        const response = await api.get<BackendScale[]>("/hr/define/scale/list", { params: { site } });
        return response.data.map(toScale);
    },

    getById: async (id: number, site?: string): Promise<Scale> => {
        const response = await api.get<BackendScale>(`/hr/define/scale/${id}`, { params: { site } });
        return toScale(response.data);
    },

    create: async (data: Partial<Scale>, site?: string): Promise<Scale> => {
        await api.post("/hr/define/scale/save", toPayload(data), { params: { site } });
        return data as Scale;
    },

    update: async (id: number, data: Partial<Scale>, site?: string): Promise<void> => {
        await api.post("/hr/define/scale/save", toPayload({ ...data, scaleId: id }), { params: { site } });
    },

    delete: async (id: number, site?: string): Promise<void> => {
        await api.delete(`/hr/define/scale/${id}`, { params: { site } });
    },

    getNextCode: async (site?: string): Promise<number> => {
        const response = await api.get<number>("/hr/define/scale/maxno", { params: { site } });
        return response.data;
    },
};
