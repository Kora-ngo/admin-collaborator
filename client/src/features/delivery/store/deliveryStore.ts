import { create } from "zustand";
import type { Delivery } from "../delivery";
import { deliveryApi } from "../../delivery/deliveryApi";
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

export const useDeliveryStore = create<DeliveryState>((set) => ({
    data: [],
    loading: false,
    pagination: null,

    getData: async (page = 1, searchTerm = "") => {
        try {
            set({ loading: true, data: [] });

            const result = await deliveryApi.list(page, searchTerm);

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
            return await deliveryApi.fetchOne(id);
        } catch (error: any) {
            const errorToast = handleApiError(error);
            throw errorToast;
        }
    },

    filterData: async (page = 1, filters) => {
        try {
            set({ loading: true, data: [] });

            const result = await deliveryApi.filter(page, filters);

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

    reviewDelivery: async (id, action, note) => {
        try {
            return await deliveryApi.review(id, action, note);
        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        }
    },

    deleteData: async (id, status) => {
        try {
            return await deliveryApi.updateStatus(id, status);
        } catch(error: any){
            const errorToast = handleApiError(error);
            return errorToast;
        }
    },
}));