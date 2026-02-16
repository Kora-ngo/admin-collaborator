
import { create } from "zustand";
import type { Delivery } from "../../../types/delivery";
import axiosInstance from "../../../utils/axiosInstance";
import { handleApiError } from "../../../utils/handleApiError";
import type { Pagination } from "../../../types/pagination";

interface DeliveryState {
    data: Delivery[];
    loading: boolean;
    pagination: Pagination | null;
    getData: (page?: number, searchTerm?: string) => Promise<any>;
    fetchOneData: (id: number) => Promise<Delivery>;
    filterData: (page: number, filters: any) => Promise<any>;
    reviewDelivery: (id: number, action: 'approve' | 'reject', note?: string) => Promise<any>;
    deleteData: (id: number, status: string) => Promise<any>
}

const endpoint = "deliveries";

export const useDeliveryStore = create<DeliveryState>((set) => ({
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

    filterData: async (page = 1, filters) => {
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

    reviewDelivery: async (id, action, note) => {
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
    },


    deleteData: async (id, status) => {
        try{


        const response = await axiosInstance.put(`${endpoint}/${id}`, {status: status});
        return response.data;

            
        }catch(error: any){
            const errorToast = handleApiError(error);
            return errorToast;
        }
    },
}));