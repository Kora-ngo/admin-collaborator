import { create } from "zustand";
import type { Assistance } from "../../../types/assistance";
import axiosInstance from "../../../utils/axiosInstance";
import { handleApiError } from "../../../utils/handleApiError";
import type { Pagination } from "../../../types/pagination";

interface AssiantnceState {
    data: Assistance[],
    loading: boolean,
    pagination: Pagination | null,
    createData: (data: Assistance) => Promise<any>,
    getData: (page?: number, searchTerm?: string, status?: string) => Promise<any>,
    fetchOneData: (id: number) => Promise<Assistance>,
    filterData: (page: number, filters: any) => Promise<any>
    updateData: (id: number, data: Assistance) => Promise<any>
    toggleData: (id: number, status: string) => Promise<any>
}

const endpoint = "assistance";

export const useAssistanceStore = create<AssiantnceState>((set) => ({
    data: [],
    loading: false,
    pagination: null,

    getData: async (page, searchTerm = "", status) => {
        try{
            set({loading: true, data: []});
            const getEndpoint = searchTerm.trim() ? `${endpoint}/search` : endpoint;
            const params: any = { page, limit: 5, status};

            if (searchTerm.trim()) params.q = searchTerm.trim();


            const {data} = await axiosInstance.get(getEndpoint, { params });



            set({
                data: data.data,
                pagination: data.pagination
            });

        }catch(error: any){
            const errorToast = handleApiError(error);
            return errorToast;
        }finally{
            set({loading: false})
        }
    },

    createData: async (data) => {
        try{
            set({loading: true});

            const response = await axiosInstance.post(endpoint, data);
            return response.data;

            
        }catch(error: any){
            const errorToast = handleApiError(error);
            return errorToast;
        }finally{
            set({loading: false})
        }
    },

    fetchOneData: async (id) => {
        try{

            const response = await axiosInstance.get(`${endpoint}/${id}`);
            return response.data.data;

            
        }catch(error: any){
            const errorToast = handleApiError(error);
            return errorToast;
        }
    },

    updateData: async (id, data) => {
        try{
            set({loading: true});

            const response = await axiosInstance.put(`${endpoint}/${id}`, data);
            return response.data;

            
        }catch(error: any){
            const errorToast = handleApiError(error);
            return errorToast;
        }finally{
            set({loading: false})
        }
    },

    toggleData: async (id, status) => {
        try{


        const response = await axiosInstance.put(`${endpoint}/toggle/${id}`, {status: status});
        return response.data;

            
        }catch(error: any){
            const errorToast = handleApiError(error);
            return errorToast;
        }
    },


    filterData: async (
        page = 1,
        filters: {
            status?: "true" | "false";
            typeId?: number;
            datePreset?: string;
        }
    ) => {
    try {
        set({ loading: true, data: [] });

        const params: any = { page, limit: 5 };
        if (filters.status) params.status = filters.status;
        if (filters.typeId) params.typeId = filters.typeId;
        if (filters.datePreset) params.datePreset = filters.datePreset;


        const response = await axiosInstance.get("/assistance/filter", { params });

        set({
        data: response.data.data,
        pagination: response.data.pagination,
        });
    }catch(error: any){
            const errorToast = handleApiError(error);
            return errorToast;
    }finally {
        set({ loading: false });
    }
    },



}))