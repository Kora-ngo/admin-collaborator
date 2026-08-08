import { create } from "zustand";
import type { Pagination } from "../../../types/pagination";
import type { Project } from "../project";
import { projectApi } from "../../project/projectApi";
import { handleApiError } from "../../../utils/handleApiError";
import { fileToBase64 } from "../../../utils/fileToBase64";
import type { ToastMessage } from "../../../types/toastMessage";

interface ProjectState {
    data: Project[];
    loading: boolean;
    pagination: Pagination | null;
    createData: (projectData: any, files?: File[]) => Promise<any>;
    getData: (page?: number, searchTerm?: string) => Promise<any>;
    fetchOneData: (id: number) => Promise<any>;
    filterData: (page: number, filters: any) => Promise<any>;
    updateData: (id: number, data: any, files?: File[]) => Promise<any>;
    toggleData: (id: number, status: string) => Promise<any>;
    // checkCanDelete: (id: number) => Promise<any>;
}

export const useProjectStore = create<ProjectState>((set) => ({
    data: [],
    loading: false,
    pagination: null,

    getData: async (page = 1, searchTerm = "") => {
        try {
            set({ loading: true, data: [] });
            
            const result = await projectApi.list(page, searchTerm);

            set({
                data: result.data,
                pagination: result.pagination
            });

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
                fileData = await Promise.all(
                    files.map(file => fileToBase64(file))
                )
            }

            // send as regular JSON with base64 files
            const data: any = {
                ...projectData,
                files: fileData
            };

            return await projectApi.create(data);
        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        } finally {
            set({ loading: false });
        }
    },

    fetchOneData: async (id) => {
        try {
            return await projectApi.fetchOne(id);
        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        }
    },

    updateData: async (id: number, data: any, files?: File[]) => {
            console.log("Project ID Update ---> ", id);
            // console.log("Status updates ---> ", id);
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
            }

            const payload = {
                ...data,
                files: filesData
            };

            const response = await projectApi.update(id, payload);

            set({ loading: false });
            return response;
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
            console.log("Project ID ---> ", id);
            console.log("Status ---> ", status);
            return await projectApi.toggle(id, status);
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

            const result = await projectApi.filter(page, filters);

            set({
                data: result.data,
                pagination: result.pagination,
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