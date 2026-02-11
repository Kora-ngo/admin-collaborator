import { create } from "zustand";
import type { Pagination } from "../../../types/pagination";
import type { Project } from "../../../types/project";
import axiosInstance from "../../../utils/axiosInstance";
import { handleApiError } from "../../../utils/handleApiError";
import { fileToBase64 } from "../../../utils/fileToBase64";

interface ProjectState {
    data: Project[];
    loading: boolean;
    pagination: Pagination | null;
    createData: (projectData: any, files?: File[]) => Promise<any>;
    getData: (page?: number, searchTerm?: string) => Promise<any>;
    fetchOneData: (id: number) => Promise<Project>;
    filterData: (page: number, filters: any) => Promise<any>;
    updateData: (id: number, data: any, files?: File[]) => Promise<any>;
    toggleData: (id: number, status: string) => Promise<any>;
    // checkCanDelete: (id: number) => Promise<any>;
}

const endpoint = "projects";

export const useProjectStore = create<ProjectState>((set) => ({
    data: [],
    loading: false,
    pagination: null,

    getData: async (page = 1, searchTerm = "") => {
        try {
            set({ loading: true, data: [] });
            const getEndpoint = searchTerm.trim() ? `${endpoint}/search` : endpoint;
            const params: any = { page, limit: 5 };

            if (searchTerm.trim()) params.q = searchTerm.trim();

            const { data } = await axiosInstance.get(getEndpoint, { params });

            set({
                data: data.data,
                pagination: data.pagination
            });

            // console.log("Project - Fetch response:", data);
        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        } finally {
            set({ loading: false });
        }
    },


    createData: async (projectData, files) => {
        try {
            set({ loading: true });

            // Convert files to base64 if any
            let fileData: any[] = [];
            if(files && files.length > 0){
                console.log(`Converting ${files.length} files to base64`);
                fileData = await Promise.all(
                    files.map(file => fileToBase64(file))
                )
            }

            // send as regular JSON with base64 files
            const data: any = {
                ...projectData,
                files: fileData
            };

            const response = await axiosInstance.post(endpoint, data);
            console.log("Project create:", response.data);
            return response.data;
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
            console.log("Project get one:", response.data.data);
            return response.data.data;
        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        }
    },

    updateData: async (id: number, data: any, files?: File[]) => {
        console.log(" File  here ---> ");
        set({ loading: true });
        try {
            // Convert new files to base64 if present
            let filesData: any[] = [];
            try{
                    if (files && files.length > 0) {
                    filesData = await Promise.all(
                        files.map(file => {
                            return new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    resolve({
                                        name: file.name,
                                        base64: reader.result as string,
                                        type: file.type,
                                        size: file.size
                                    });
                                };
                                reader.readAsDataURL(file);
                            });
                        })
                    );
                }
            }catch(err){
                console.log(" Conversion Failed ---> ", err);
            }

            console.log(" File II ---> ", data);
            console.log(" File III ---> ", filesData);

            const response = await axiosInstance.put(`/${endpoint}/${id}`, {
                ...data,
                files: filesData
            });

            set({ loading: false });
            return response.data;
        } catch (error: any) {
            console.error('Failed to update project:', error);
            set({ loading: false });
            return {
                type: 'error',
                message: error.response?.data?.message || 'server_error'
            };
        }
    },

    toggleData: async (id, status) => {
        try {
            const response = await axiosInstance.put(`${endpoint}/toggle/${id}`, { status });
            console.log("Project toggle:", response.data);
            return response.data;
        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        }
    },

    filterData: async (page = 1, filters: {
        status?: string;
        datePreset?: string;
    }) => {
        try {
            set({ loading: true, data: [] });

            const params: any = { page, limit: 5 };
            if (filters.status) params.status = filters.status;
            if (filters.datePreset) params.datePreset = filters.datePreset;

            const response = await axiosInstance.get(`${endpoint}/filter`, { params });

            set({
                data: response.data.data,
                pagination: response.data.pagination,
            });
        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        } finally {
            set({ loading: false });
        }
    },

    // checkCanDelete: async (id: number) => {
    //     try {
    //         const response = await axiosInstance.get(`${endpoint}/${id}/can-delete`);
            
    //         if (response.data.type === 'success') {
    //             return response.data.data;
    //         }
            
    //         return {
    //             canDelete: false,
    //             beneficiaryCount: 0,
    //             deliveryCount: 0,
    //             message: 'Failed to check delete status'
    //         };
    //     } catch (error: any) {
    //         console.error('Failed to check if project can be deleted:', error);
    //         return {
    //             canDelete: false,
    //             beneficiaryCount: 0,
    //             deliveryCount: 0,
    //             message: error.response?.data?.message || 'server_error'
    //         };
    //     }
    // }


}))
