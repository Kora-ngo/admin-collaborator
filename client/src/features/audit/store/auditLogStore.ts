import { create } from "zustand";
import type { AuditLog } from "../auditLog";
import { handleApiError } from "../../../utils/handleApiError";
import type { Pagination } from "../../../types/pagination";
import { auditApi } from "../auditApi";

interface AuditLogState {
    data: AuditLog[];
    loading: boolean;
    popUpLoading: boolean;
    connection: boolean;
    pagination: Pagination | null;
    getData: (page?: number, searchTerm?: string) => Promise<any>;
    filterData: (page: number, filters: any) => Promise<any>;
}

export const useAuditLogStore = create<AuditLogState>((set) => ({
    data: [],
    loading: false,
    popUpLoading: false,
    connection: true,
    pagination: null,

    getData: async (page = 1, searchTerm = "") => {
        try {
            set({ loading: true, data: [], connection: true });

            const result = await auditApi.list(page, searchTerm);

            set({
                data: result.data,
                pagination: result.pagination
            });

            return result;
        } catch (error: any) {
            const errorToast = handleApiError(error);
            set({ connection: false });
            return errorToast;
        } finally {
            set({ loading: false });
        }
    },

    filterData: async (page = 1, filters) => {
        try {
            set({ loading: true, data: [], connection: true });

            const result = await auditApi.filter(page, filters);

            set({
                data: result.data,
                pagination: result.pagination
            });

            return result;
        } catch (error: any) {
            const errorToast = handleApiError(error);
            set({ connection: false });
            return errorToast;
        } finally {
            set({ loading: false });
        }
    }
}));