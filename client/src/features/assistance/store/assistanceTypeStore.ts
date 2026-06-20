import { create } from "zustand";
import type { AssistanceType } from "../assistance";
import { assistanceTypeApi } from "../assistanceApi";
import { handleApiError } from "../../../utils/handleApiError";


interface AssistanceTypeState {
    data: AssistanceType[],
    loading: boolean,
    creatData: (data: AssistanceType[]) => Promise<any>,
    fetchData: () => Promise<any>,
    deletData: (id: number) => Promise<any>
}

export const useAssistanceTypeStore = create<AssistanceTypeState>((set) => ({
    data: [],
    loading: false,

    fetchData: async () => {
        try{
            set({loading: true, data: []});
            const data = await assistanceTypeApi.fetch();
            set({data});
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
            return await assistanceTypeApi.create(data);
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
            return await assistanceTypeApi.delete(id);
        }catch(error: any){
            const errorToast = handleApiError(error);
            return errorToast;
        }finally{
            set({loading: false})
        }
    }
}))