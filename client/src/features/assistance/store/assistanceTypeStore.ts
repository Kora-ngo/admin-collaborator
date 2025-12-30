import { create } from "zustand";
import type { AssistanceType } from "../../../types/assistance";
import axiosInstance from "../../../utils/axiosInstance";
import { handleApiError } from "../../../utils/handleApiError";

interface AssistanceTypeState {
    data: AssistanceType[],
    loading: boolean,
    creatData: (data: AssistanceType[]) => Promise<any>,
    fetchData: () => Promise<any>,
    deletData: (id: number) => Promise<any>
}

const endpoint = "/assistance-type";


export const useAssistanceTypeStore = create<AssistanceTypeState>((set, get) => ({
    data: [],
    loading: false,

    fetchData: async () => {
        try{
            set({loading: true, data: []});

            const {data} = await axiosInstance.get(endpoint);

            set({data: data.data});

            console.log("Assis Type - Fetch type response --> ", data);
        }catch(error: any){
            const errorToast = handleApiError(error);
            return errorToast;
        }finally{
            set({loading: false})
        }
    },

    creatData: async (data) => {
        try{
            set({loading: true});

            const response = await axiosInstance.post(endpoint, data);
            console.log("Assistance Type create --> ", response.data);
            return response.data;

            
        }catch(error: any){
            const errorToast = handleApiError(error);
            return errorToast;
        }finally{
            set({loading: false})
        }
    },

    deletData: async (id) => {
        try{
            set({loading: true});

            const response = await axiosInstance.delete(`${endpoint}/delete/${id}`);
               return response.data;            
            }catch(error: any){
                const errorToast = handleApiError(error);
                return errorToast;
            }finally{
                set({loading: false})
            }
    }
}))