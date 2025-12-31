import { create } from "zustand";
import type { Assistance } from "../../../types/assistance";
import axiosInstance from "../../../utils/axiosInstance";
import { handleApiError } from "../../../utils/handleApiError";

interface AssiantnceState {
    data: Assistance[],
    loading: boolean,
    createData: (data: Assistance) => Promise<any>,
    fetchData: () => Promise<any>,
    fetchOneData: (id: number) => Promise<Assistance>
}

const endpoint = "/assistance";

export const useAssistanceStore = create<AssiantnceState>((set, get) => ({
    data: [],
    loading: false,

    fetchData: async () => {
        try{
            set({loading: true, data: []});

            const {data} = await axiosInstance.get(endpoint);

            set({data: data.data});

            // console.log("Assis - Fetch type response --> ", data.data);
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

}))