import api from "@/shared/services/api";

export interface Department {
    code: string;
    name: string;
    site: string;
    gradeId?: number | null;
    gradeName?: string;
    parentCode?: string | null;
    level: number;
}

interface BackendDepartment {
    departmentNo: number;
    departmentName: string;
    gradeId?: number;
}

const toDepartment = (d: BackendDepartment, site: string): Department => ({
    code: String(d.departmentNo),
    name: d.departmentName,
    site,
    gradeId: d.gradeId ?? null,
    parentCode: null,
    level: 0,
});

const toPayload = (department: Partial<Department>) => ({
    departmentNo: parseInt(department.code || "0", 10) || 0,
    departmentName: department.name || "",
});

export const departmentService = {
    getAll: async (site: string) => {
        const response = await api.get<BackendDepartment[]>(
            "/hr/define/department/list",
            { params: { site } }
        );
        return response.data.map((d) => toDepartment(d, site));
    },

    getNextCode: async (site: string, _parentCode?: string | null) => {
        const response = await api.get<number>("/hr/define/department/maxno", {
            params: { site },
        });
        return String(response.data);
    },

    getByCode: async (code: string, site: string) => {
        const response = await api.get<BackendDepartment>(
            `/hr/define/department/${code}`,
            { params: { site } }
        );
        return toDepartment(response.data, site);
    },

    create: async (department: Partial<Department>) => {
        await api.post("/hr/define/department/save", toPayload(department), {
            params: { site: department.site },
        });
        return department;
    },

    update: async (code: string, site: string, department: Partial<Department>) => {
        await api.post(
            "/hr/define/department/save",
            toPayload({ ...department, code }),
            { params: { site } }
        );
    },

    delete: async (code: string, site: string) => {
        const response = await api.delete(`/hr/define/department/${code}`, {
            params: { site },
        });
        return response.data;
    },

    viewReportPdf: async (_site: string): Promise<void> => {
        console.warn("Department PDF report is not available on this API.");
    },
};
