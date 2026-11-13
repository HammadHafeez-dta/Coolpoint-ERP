import api from '@/shared/services/api';

export interface TokenCategory {
    categoryCode: number;
    categoryName: string;
    employeeAmount: number;
    factoryAmount: number;
    site: string;
}

export const tokenCategoryService = {
    getAll: async (site: string): Promise<TokenCategory[]> => {
        const response = await api.get('/TokenCategories', { params: { site } });
        return response.data;
    },

    getById: async (id: number, site: string): Promise<TokenCategory> => {
        const response = await api.get(`/TokenCategories/${id}`, { params: { site } });
        return response.data;
    },

    create: async (data: Partial<TokenCategory>): Promise<TokenCategory> => {
        const response = await api.post('/TokenCategories', data);
        return response.data;
    },

    update: async (id: number, site: string, data: Partial<TokenCategory>): Promise<void> => {
        await api.put(`/TokenCategories/${id}`, data, { params: { site } });
    },

    delete: async (id: number, site: string): Promise<void> => {
        await api.delete(`/TokenCategories/${id}`, { params: { site } });
    },

    getNextCode: async (site: string): Promise<number> => {
        const response = await api.get('/TokenCategories/next-code', { params: { site } });
        return response.data;
    }
};
