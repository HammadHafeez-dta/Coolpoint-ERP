import api from "@/shared/services/api";

export interface Location {
    locationNo: number;
    locationName: string;
}

interface BackendLocation {
    locationNo: number;
    locationName: string;
}

const toLocation = (l: BackendLocation): Location => ({
    locationNo: l.locationNo,
    locationName: l.locationName,
});

const toPayload = (l: Partial<Location>) => ({
    locationNo: l.locationNo ?? 0,
    locationName: l.locationName ?? "",
});

export const locationService = {
    getAll: async (): Promise<Location[]> => {
        const response = await api.get<BackendLocation[]>("/hr/define/location/list");
        return response.data.map(toLocation);
    },

    getById: async (id: number): Promise<Location> => {
        const response = await api.get<BackendLocation>(`/hr/define/location/${id}`);
        return toLocation(response.data);
    },

    create: async (data: Partial<Location>): Promise<Location> => {
        await api.post("/hr/define/location/save", toPayload(data));
        return data as Location;
    },

    update: async (id: number, data: Partial<Location>): Promise<void> => {
        await api.post("/hr/define/location/save", toPayload({ ...data, locationNo: id }));
    },

    getNextCode: async (): Promise<number> => {
        const response = await api.get<number>("/hr/define/location/maxno");
        return response.data;
    },
};
