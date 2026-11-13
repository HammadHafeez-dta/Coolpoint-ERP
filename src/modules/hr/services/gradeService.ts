import api from "@/shared/services/api";

export interface Grade {
    gradeCode: number;
    gradeName: string;
    minimumSalary: number;
    midSalary: number;
    maximumSalary: number;
    desgCode?: number;
    designationName?: string;
    category?: string;
    payScale?: string;
    narration?: string;
}

interface BackendGrade {
    gradeNo: number;
    gradeName: string;
    minimumSalary: number;
    maximumSalary: number;
}

const toGrade = (g: BackendGrade): Grade => ({
    gradeCode: g.gradeNo,
    gradeName: g.gradeName,
    minimumSalary: Number(g.minimumSalary),
    midSalary: (Number(g.minimumSalary) + Number(g.maximumSalary)) / 2,
    maximumSalary: Number(g.maximumSalary),
});

const toPayload = (g: Partial<Grade>) => ({
    gradeNo: g.gradeCode ?? 0,
    gradeName: g.gradeName ?? "",
    minimumSalary: g.minimumSalary ?? 0,
    maximumSalary: g.maximumSalary ?? 0,
});

export const gradeService = {
    getAll: async (): Promise<Grade[]> => {
        const response = await api.get<BackendGrade[]>("/hr/define/grade/list");
        return response.data.map(toGrade);
    },

    getById: async (id: number): Promise<Grade> => {
        const response = await api.get<BackendGrade>(`/hr/define/grade/${id}`);
        return toGrade(response.data);
    },

    create: async (data: Partial<Grade>): Promise<Grade> => {
        await api.post("/hr/define/grade/save", toPayload(data));
        return data as Grade;
    },

    update: async (id: number, data: Partial<Grade>): Promise<void> => {
        await api.post("/hr/define/grade/save", toPayload({ ...data, gradeCode: id }));
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/hr/define/grade/${id}`);
    },

    getNextCode: async (): Promise<number> => {
        const response = await api.get<number>("/hr/define/grade/maxno");
        return response.data;
    },
};
