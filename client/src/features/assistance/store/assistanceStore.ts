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
    getData: (page?: number, searchTerm?: string) => Promise<any>,
    fetchOneData: (id: number) => Promise<Assistance>,
    updateData: (id: number, data: Assistance) => Promise<any>
    deleteData: (id: number) => Promise<any>
}

const endpoint = "assistance";

export const useAssistanceStore = create<AssiantnceState>((set, get) => ({
    data: [],
    loading: false,
    pagination: null,

    getData: async (page, searchTerm = "") => {
        console.log("Assistnace GetData Search --> ", searchTerm);
        try{
            set({loading: true, data: []});
            const getEndpoint = searchTerm.trim() ? `${endpoint}/search` : endpoint;
            const params: any = { page, limit: 5 };

            if (searchTerm.trim()) params.q = searchTerm.trim();

            console.log("Assistnace GetData params Search --> ", params);

            const {data} = await axiosInstance.get(getEndpoint, { params });



            set({
                data: data.data,
                pagination: data.pagination
            });

            console.log("Assis - Fetch type response --> ", data);
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
            console.log("Assistance create --> ", response.data);
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
            console.log("Assistance get one --> ");

            const response = await axiosInstance.get(`${endpoint}/${id}`);
            console.log("Assistance get one --> ", response.data.data);
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
            console.log("Assistance update --> ", response.data);
            return response.data;

            
        }catch(error: any){
            const errorToast = handleApiError(error);
            return errorToast;
        }finally{
            set({loading: false})
        }
    },

    deleteData: async (id) => {
        try{

        const response = await axiosInstance.put(`${endpoint}/delete/${id}`);
        console.log("Assistance delete one --> ", response.data);
        return response.data;

            
        }catch(error: any){
            const errorToast = handleApiError(error);
            return errorToast;
        }
    }

}))