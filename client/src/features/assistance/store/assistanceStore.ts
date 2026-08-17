import { create } from "zustand";
import type { Assistance } from "../assistance";
import type { Pagination } from "../../../types/pagination";
import { assistanceApi, type AssistanceFilters } from "../assistanceApi";
import { handleApiError } from "../../../utils/handleApiError";
import type { ToastMessage } from "../../../types/toastMessage";


interface AssistanceState {
    data: Assistance[],
    loading: boolean,
    popUpLoading: boolean,
    connection: boolean,
    pagination: Pagination | null,
    createData: (data: Assistance) => Promise<any>,
    getData: (page?: number, searchTerm?: string, status?: string) => Promise<any>,
    fetchOneData: (id: number) => Promise<Assistance | ToastMessage>,
    filterData: (page: number, filters: AssistanceFilters) => Promise<any>
    updateData: (id: number, data: Assistance) => Promise<any>
    toggleData: (id: number, status: string) => Promise<any>
}

export const useAssistanceStore = create<AssistanceState>((set) => ({
    data: [],
    loading: false,
    popUpLoading: false,
    connection: true,
    pagination: null,

    getData: async (page, searchTerm = "", status) => {
        try{
            set({loading: true, data: [], connection: true});

            const result = await assistanceApi.list(page, searchTerm, status);

            set({
                data: result.data,
                pagination: result.pagination
            });

        }catch(error: any){
            const errorToast = handleApiError(error);
            set({connection: false});
            return errorToast;
        }finally{
            set({loading: false})
        }
    },

    createData: async (data) => {
        try{
            set({loading: true});
            return await assistanceApi.create(data);
        }catch(error: any){
            const errorToast = handleApiError(error);
            return errorToast;
        }finally{
            set({loading: false})
        }
    },

    fetchOneData: async (id) => {
        try{
            return await assistanceApi.fetchOne(id);
        }catch(error: any){
            const errorToast = handleApiError(error);
            return errorToast;
        }
    },

    updateData: async (id, data) => {
        try{
            set({loading: true});
            return await assistanceApi.update(id, data);
        }catch(error: any){
            const errorToast = handleApiError(error);
            return errorToast;
        }finally{
            set({loading: false})
        }
    },

    toggleData: async (id, status) => {
        set({popUpLoading: true})
        try{
            return await assistanceApi.toggle(id, status);
        }catch(error: any){
            const errorToast = handleApiError(error);
            return errorToast;
        }finally{
            set({popUpLoading: false})
        }
    },

    filterData: async (page = 1, filters) => {
        try {
            set({ loading: true, data: [], connection: true });

            const result = await assistanceApi.filter(page, filters);

            set({
                data: result.data,
                pagination: result.pagination,
            });
        }catch(error: any){
            const errorToast = handleApiError(error);
            set({connection: false });
            return errorToast;
        }finally {
            set({ loading: false });
        }
    },

}))