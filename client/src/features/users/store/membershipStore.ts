import { create } from "zustand"
import type { Membership } from "../membership"
import type { Pagination } from "../../../types/pagination"
import { handleApiError } from "../../../utils/handleApiError"
import { membershipApi } from "../membershipApi"
import type { ToastMessage } from "../../../types/toastMessage"

interface MembershipState {
    data: Membership[],
    loading: boolean,
    popUpLoading: boolean,
    connection: boolean,
    pagination: Pagination | null,
    createData: (data: Membership) => Promise<any>,
    getData: (page?: number, searchTerm?: string, status?: string) => Promise<any>,
    fetchOneData: (id: number) => Promise<Membership | ToastMessage>,
    filterData: (page: number, filters: any) => Promise<any>
    updateData: (id: number, data: Membership) => Promise<any>
    toggleData: (id: number, status: string) => Promise<any>
    checkEmail: (email: string) => Promise<{ type: string; message: string }>
}

export const useMembershipStore = create<MembershipState>((set) => ({
    data: [],
    loading: false,
    popUpLoading: false,
    pagination: null,
    connection: true,

    getData: async (page, searchTerm = "", status) => {
        try{
            set({loading: true, data: [], connection: true});

            const result = await membershipApi.list(page, searchTerm, status);

            set({
                data: result.data,
                pagination: result.pagination
            });

        }catch(error: any){

            const errorToast = handleApiError(error);
            set({connection: false})
            return errorToast;
        }finally{
            set({loading: false})
        }
    },

    createData: async (data) => {
        try{
            set({loading: true});
             const result = await membershipApi.create(data);
             return result;
        }catch(error: any){
            const errorToast = handleApiError(error);
            
            return errorToast;
        }finally{
            set({loading: false})
        }
    },

    fetchOneData: async (id) => {
        try{
            return await membershipApi.fetchOne(id);
        }catch(error: any){
            const errorToast = handleApiError(error);
            return errorToast;
        }
    },

    updateData: async (id, data) => {
        try{
            set({loading: true});
            return await membershipApi.update(id, data);
        }catch(error: any){
            const errorToast = handleApiError(error);
            return errorToast;
        }finally{
            set({loading: false})
        }
    },

    toggleData: async (id, status) => {
        try{
            set({popUpLoading: true})
            return await membershipApi.toggle(id, status);
        }catch(error: any){
            const errorToast = handleApiError(error);
            return errorToast;
        }finally {
            set({popUpLoading: false})
        }
    },

    filterData: async (
        page = 1,
        filters: {
            status?: "true" | "false";
            role?: 'all'| 'admin' | 'collaborator' | 'enumerator';
            datePreset?: string;
        }
    ) => {
    try {
        set({ loading: true, data: [], connection: true });

        const result = await membershipApi.filter(page, filters);

        set({
            data: result.data,
            pagination: result.pagination,
        });
    }catch(error: any){
            const errorToast = handleApiError(error);
            set({connection: false})
            return errorToast;
    }finally {
        set({ loading: false });
    }
    },

    checkEmail: async (email: string) => {
        try {
            return await membershipApi.checkEmail(email);
        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        }
    },

}));