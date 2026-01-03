import { create } from "zustand"
import type { Membership } from "../../../types/membership"
import type { Pagination } from "../../../types/pagination"
import axiosInstance from "../../../utils/axiosInstance"
import { handleApiError } from "../../../utils/handleApiError"

interface MembershipState {
    data: Membership[],
    loading: boolean,
    pagination: Pagination | null,
    createData: (data: Membership) => Promise<any>,
    getData: (page?: number, searchTerm?: string) => Promise<any>,
    fetchOneData: (id: number) => Promise<Membership>,
    filterData: (page: number, filters: any) => Promise<any>
    updateData: (id: number, data: Membership) => Promise<any>
    toggleData: (id: number, status: string) => Promise<any>
}

const endpoint = "membership";

export const useMembershipStore = create<MembershipState>((set) => ({
    data: [],
    loading: false,
    pagination: null,

    getData: async (page, searchTerm = "") => {
        console.log("Membership GetData Search --> ", searchTerm);

        try{
            set({loading: true, data: []});
            const getEndpoint = searchTerm.trim() ? `${endpoint}/search` : endpoint;
            const params: any = { page, limit: 5 };

            if (searchTerm.trim()) params.q = searchTerm.trim();

            console.log("Membership GetData params Search --> ", params);

            const {data} = await axiosInstance.get(getEndpoint, { params });

            set({
                data: data.data,
                pagination: data.pagination
            });

            console.log("Membership - Fetch response --> ", data);
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
            console.log("Membership create --> ", response.data);
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
            console.log("Membership get one --> ");

            const response = await axiosInstance.get(`${endpoint}/${id}`);
            console.log("Membership get one --> ", response.data.data);
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
            console.log("Membership update --> ", response.data);
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

        console.log("Membership toggle -- Status -- > ", status);

        const response = await axiosInstance.put(`${endpoint}/toggle/${id}`, {status: status});
        console.log("Membership delete one --> ", response.data);
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
            roleId?: number;
            datePreset?: string;
        }
    ) => {
    try {
        set({ loading: true, data: [] });
        console.log('Filter --> ', filters);

        const params: any = { page, limit: 5 };
        if (filters.status) params.status = filters.status;
        if (filters.roleId) params.roleId = filters.roleId;
        if (filters.datePreset) params.datePreset = filters.datePreset;

        const response = await axiosInstance.get("/membership/filter", { params });

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


}));

