import api from "@/shared/services/api";

export interface Category {
    categoryNo: number;
    categoryName: string;
    site?: string;
}

interface BackendCategory {
    categoryNo: number;
    categoryName: string;
    site?: string;
}

const toCategory = (c: BackendCategory): Category => ({
    categoryNo: c.categoryNo,
    categoryName: c.categoryName || "",
    site: c.site,
});

const toPayload = (c: Partial<Category>) => ({
    categoryNo: c.categoryNo ?? 0,
    categoryName: c.categoryName ?? "",
});

export const categoryService = {
    getAll: async (site?: string): Promise<Category[]> => {
        const response = await api.get<BackendCategory[]>("/hr/define/category/list", { params: { site } });
        return response.data.map(toCategory);
    },

    getById: async (id: number, site?: string): Promise<Category> => {
        const response = await api.get<BackendCategory>(`/hr/define/category/${id}`, { params: { site } });
        return toCategory(response.data);
    },

    create: async (data: Partial<Category>, site?: string): Promise<Category> => {
        await api.post("/hr/define/category/save", toPayload(data), { params: { site } });
        return data as Category;
    },

    update: async (id: number, data: Partial<Category>, site?: string): Promise<void> => {
        await api.post("/hr/define/category/save", toPayload({ ...data, categoryNo: id }), { params: { site } });
    },

    delete: async (id: number, site?: string): Promise<void> => {
        await api.delete(`/hr/define/category/${id}`, { params: { site } });
    },

    getNextCode: async (site?: string): Promise<number> => {
        const response = await api.get<number>("/hr/define/category/maxno", { params: { site } });
        return response.data;
    },
};
