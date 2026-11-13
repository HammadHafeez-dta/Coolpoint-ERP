import api from "@/shared/services/api";

export interface Shift {
    shiftNo: number;
    shiftType: string;
    shiftName: string;
}

interface BackendShift {
    shiftNo: number;
    shiftType: string;
    shiftName: string;
}

const toShift = (s: BackendShift): Shift => ({
    shiftNo: s.shiftNo,
    shiftType: s.shiftType,
    shiftName: s.shiftName,
});

const toPayload = (s: Partial<Shift>) => ({
    shiftNo: s.shiftNo ?? 0,
    shiftType: s.shiftType ?? "",
    shiftName: s.shiftName ?? "",
});

export const shiftService = {
    getAll: async (): Promise<Shift[]> => {
        const response = await api.get<BackendShift[]>("/hr/define/shift/list");
        return response.data.map(toShift);
    },

    getById: async (id: number): Promise<Shift> => {
        const response = await api.get<BackendShift>(`/hr/define/shift/${id}`);
        return toShift(response.data);
    },

    create: async (data: Partial<Shift>): Promise<Shift> => {
        await api.post("/hr/define/shift/save", toPayload(data));
        return data as Shift;
    },

    update: async (id: number, data: Partial<Shift>): Promise<void> => {
        await api.post("/hr/define/shift/save", toPayload({ ...data, shiftNo: id }));
    },

    getNextCode: async (): Promise<number> => {
        const response = await api.get<number>("/hr/define/shift/maxno");
        return response.data;
    },
};
