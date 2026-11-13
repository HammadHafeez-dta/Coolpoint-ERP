import api from "@/shared/services/api";

export interface HRBank {
    bankNo: number;
    bankName: string;
}

interface BackendBank {
    bankNo: number;
    bankName: string;
}

const toBank = (b: BackendBank): HRBank => ({
    bankNo: b.bankNo,
    bankName: b.bankName,
});

const toPayload = (b: Partial<HRBank>) => ({
    bankNo: b.bankNo ?? 0,
    bankName: b.bankName ?? "",
});

export const hrBankService = {
    getAll: async (): Promise<HRBank[]> => {
        const response = await api.get<BackendBank[]>("/hr/define/bank/list");
        return response.data.map(toBank);
    },

    getById: async (id: number): Promise<HRBank> => {
        const response = await api.get<BackendBank>(`/hr/define/bank/${id}`);
        return toBank(response.data);
    },

    create: async (data: Partial<HRBank>): Promise<HRBank> => {
        await api.post("/hr/define/bank/save", toPayload(data));
        return data as HRBank;
    },

    update: async (id: number, data: Partial<HRBank>): Promise<void> => {
        await api.post("/hr/define/bank/save", toPayload({ ...data, bankNo: id }));
    },

    getNextCode: async (): Promise<number> => {
        const response = await api.get<number>("/hr/define/bank/maxno");
        return response.data;
    },
};
