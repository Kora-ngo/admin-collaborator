import { create } from "zustand";
import type { Beneficiary } from "../../../types/beneficiary";
import type { Pagination } from "../../../types/pagination";
import axiosInstance from "../../../utils/axiosInstance";
import { handleApiError } from "../../../utils/handleApiError";

interface BeneficiaryState {
    data: Beneficiary[];
    loading: boolean;
    pagination: Pagination | null;
    getData: (page?: number, searchTerm?: string) => Promise<any>;
    fetchOneData: (id: number) => Promise<Beneficiary>;
    filterData: (page: number, filters: any) => Promise<any>;
    reviewBeneficiary: (id: number, action: 'approve' | 'reject', note?: string) => Promise<any>;
}

const endpoint = "beneficiaries";

export const useBeneficiaryStore = create<BeneficiaryState>((set) => ({ 
    data: [],
    loading: false,
    pagination: null,

    getData: async (page = 1, searchTerm = "") => {
        try {
            set({ loading: true, data: [] });
            const getEndpoint = searchTerm.trim() ? `${endpoint}/search` : endpoint;
            const params: any = { page, limit: 10 };

            if (searchTerm.trim()) params.q = searchTerm.trim();

            const { data } = await axiosInstance.get(getEndpoint, { params });

            set({
                data: data.data,
                pagination: data.pagination
            });

            console.log("Bene --> data", data);

            return data;
        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        } finally {
            set({ loading: false });
        }
    },

    fetchOneData: async (id) => {
        try {
            const response = await axiosInstance.get(`${endpoint}/${id}`);
            return response.data.data;
        } catch (error: any) {
            const errorToast = handleApiError(error);
            throw errorToast;
        }
    },

    filterData: async (page = 1, filters: {
        reviewStatus?: string;
        projectId?: number;
        datePreset?: string;
    }) => {
        try {
            set({ loading: true, data: [] });

            const params: any = { page, limit: 10 };
            if (filters.reviewStatus) params.reviewStatus = filters.reviewStatus;
            if (filters.projectId) params.projectId = filters.projectId;
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
    },

    reviewBeneficiary: async (id, action, note) => {
        try {
            const response = await axiosInstance.put(`${endpoint}/review/${id}`, {
                action,
                review_note: note
            });
            return response.data;
        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        }
    }


}));