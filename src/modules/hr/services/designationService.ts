import api from "@/shared/services/api";

export interface Designation {
    designationCode: number;
    site: string;
    designationName: string;
    designationShortName?: string;
    deptCode?: string | null;
    deptName?: string | null;
    gradeId?: number | null;
    grossPay?: number | null;
    basicPay?: number | null;
    netPay?: number | null;
    a01?: number | null;
    a02?: number | null;
    d01?: number | null;
    d02?: number | null;
}

interface BackendDesignation {
    designationNo: number;
    designationName: string;
    gradeID: number;
}

const toDesignation = (d: BackendDesignation, site: string): Designation => ({
    designationCode: d.designationNo,
    site,
    designationName: d.designationName,
    gradeId: d.gradeID,
});

const toPayload = (d: Partial<Designation>) => ({
    designationNo: d.designationCode ?? 0,
    designationName: d.designationName ?? "",
    gradeID: d.gradeId ?? 0,
});

export const designationService = {
    getAll: async (site: string) => {
        const response = await api.get<BackendDesignation[]>(
            "/hr/define/designation/list",
            { params: { site } }
        );
        return response.data.map((d) => toDesignation(d, site));
    },

    getNextCode: async (site: string) => {
        const response = await api.get<number>(
            "/hr/define/designation/maxno",
            { params: { site } }
        );
        return response.data;
    },

    getById: async (id: number, site: string) => {
        const response = await api.get<BackendDesignation>(
            `/hr/define/designation/${id}`,
            { params: { site } }
        );
        return toDesignation(response.data, site);
    },

    create: async (designation: Partial<Designation>) => {
        const site = designation.site || "";
        await api.post("/hr/define/designation/save", toPayload(designation), {
            params: { site },
        });
        return designation as Designation;
    },

    update: async (
        id: number,
        site: string,
        designation: Partial<Designation>
    ) => {
        await api.post(
            "/hr/define/designation/save",
            toPayload({ ...designation, designationCode: id }),
            { params: { site } }
        );
    },

    delete: async (id: number, site: string) => {
        const response = await api.delete(`/hr/define/designation/${id}`, {
            params: { site },
        });
        return response.data;
    },

    viewReportPdf: async (_site: string): Promise<void> => {
        console.warn("Designation PDF report is not available on this API.");
    },
};
