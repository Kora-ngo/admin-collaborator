import { create } from "zustand";
import type { Beneficiary } from "../beneficiary";
import type { Pagination } from "../../../types/pagination";
import { handleApiError } from "../../../utils/handleApiError";
import { beneficiaryApi } from "../beneficiaryApi";

interface BeneficiaryState {
    data: Beneficiary[];
    loading: boolean;
    pagination: Pagination | null;
    getData: (page?: number, searchTerm?: string) => Promise<any>;
    fetchOneData: (id: number) => Promise<Beneficiary>;
    filterData: (page: number, filters: any) => Promise<any>;
    reviewBeneficiary: (id: number, action: 'approve' | 'reject', note?: string) => Promise<any>;
    deleteData: (id: number, status: string) => Promise<any>
}

export const useBeneficiaryStore = create<BeneficiaryState>((set) => ({ 
    data: [],
    loading: false,
    pagination: null,

    getData: async (page = 1, searchTerm = "") => {
        try {
            set({ loading: true, data: [] });

            const result = await beneficiaryApi.list(page, searchTerm);

            set({
                data: result.data,
                pagination: result.pagination
            });

            return result;
        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        } finally {
            set({ loading: false });
        }
    },

    fetchOneData: async (id) => {
        try {
            return await beneficiaryApi.fetchOne(id);
        } catch (error: any) {
            const errorToast = handleApiError(error);
            throw errorToast;
        }
    },

    filterData: async (page = 1, filters) => {
        try {
            set({ loading: true, data: [] });

            const result = await beneficiaryApi.filter(page, filters);

            set({
                data: result.data,
                pagination: result.pagination
            });

            return result;
        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        } finally {
            set({ loading: false });
        }
    },

    reviewBeneficiary: async (id, action, note) => {
        try {
            return await beneficiaryApi.review(id, action, note);
        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        }
    },

    deleteData: async (id, status) => {
        try{
            return await beneficiaryApi.updateStatus(id, status);
        }catch(error: any){
            const errorToast = handleApiError(error);
            return errorToast;
        }
    },
}));