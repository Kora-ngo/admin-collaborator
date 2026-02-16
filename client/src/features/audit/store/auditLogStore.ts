import { create } from "zustand";
import type { AuditLog } from "../../../types/auditLog";
import axiosInstance from "../../../utils/axiosInstance";
import { handleApiError } from "../../../utils/handleApiError";
import type { Pagination } from "../../../types/pagination";

interface AuditLogState {
    data: AuditLog[];
    loading: boolean;
    pagination: Pagination | null;
    getData: (page?: number, searchTerm?: string) => Promise<any>;
    filterData: (page: number, filters: any) => Promise<any>;
}

const endpoint = "audit-logs";

export const useAuditLogStore = create<AuditLogState>((set) => ({
    data: [],
    loading: false,
    pagination: null,

    getData: async (page = 1, searchTerm = "") => {
        try {
            set({ loading: true, data: [] });
            const getEndpoint = searchTerm.trim() ? `${endpoint}/search` : endpoint;
            const params: any = { page, limit: 20 };

            if (searchTerm.trim()) params.q = searchTerm.trim();

            const { data } = await axiosInstance.get(getEndpoint, { params });

            set({
                data: data.data,
                pagination: data.pagination
            });

            return data;
        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        } finally {
            set({ loading: false });
        }
    },

    filterData: async (page = 1, filters) => {
        try {
            set({ loading: true, data: [] });

            const params: any = { page, limit: 20 };
            if (filters.entityType) params.entityType = filters.entityType;
            if (filters.actorRole) params.actorRole = filters.actorRole;
            if (filters.platform) params.platform = filters.platform;
            if (filters.datePreset) params.datePreset = filters.datePreset;

            const response = await axiosInstance.get(`${endpoint}/filter`, { params });

            set({
                data: response.data.data,
                pagination: response.data.pagination
            });

            return response.data;
        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        } finally {
            set({ loading: false });
        }
    }
}));