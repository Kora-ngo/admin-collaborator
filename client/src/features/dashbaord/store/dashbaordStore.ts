import { create } from "zustand";
import axiosInstance from "../../../utils/axiosInstance";
import { handleApiError } from "../../../utils/handleApiError";

interface DashboardState {
    // Admin data
    keyMetrics: any;
    projectProgress: any[];
    projectAlert: any;
    
    // Collaborator data
    collaboratorMetrics: any;
    enumeratorActivity: any[];
    validationQueue: any;
    
    loading: boolean;
    
    // Admin methods
    getKeyMetrics: () => Promise<any>;
    getProjectProgress: () => Promise<any>;
    getProjectAlert: () => Promise<any>;
    
    // Collaborator methods
    getCollaboratorMetrics: () => Promise<any>;
    getEnumeratorActivity: () => Promise<any>;
    getValidationQueue: () => Promise<any>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    keyMetrics: null,
    projectProgress: [],
    projectAlert: null,
    collaboratorMetrics: null,
    enumeratorActivity: [],
    validationQueue: null,
    loading: false,

    // Admin methods
    getKeyMetrics: async () => {
        try {
            set({ loading: true });
            const { data } = await axiosInstance.get('/dashboard/admin/key-metrics');
            set({ keyMetrics: data.data });
            return data;
        } catch (error: any) {
            return handleApiError(error);
        } finally {
            set({ loading: false });
        }
    },

    getProjectProgress: async () => {
        try {
            set({ loading: true });
            const { data } = await axiosInstance.get('/dashboard/admin/project-progress');
            set({ projectProgress: data.data });
            return data;
        } catch (error: any) {
            return handleApiError(error);
        } finally {
            set({ loading: false });
        }
    },

    getProjectAlert: async () => {
        try {
            set({ loading: true });
            const { data } = await axiosInstance.get('/dashboard/admin/alerts');
            set({ projectAlert: data });
            return data;
        } catch (error: any) {
            return handleApiError(error);
        } finally {
            set({ loading: false });
        }
    },

    // Collaborator methods
    getCollaboratorMetrics: async () => {
        try {
            set({ loading: true });
            const { data } = await axiosInstance.get('/dashboard/collaborator/key-metrics');
            set({ collaboratorMetrics: data.data });
            return data;
        } catch (error: any) {
            return handleApiError(error);
        } finally {
            set({ loading: false });
        }
    },

    getEnumeratorActivity: async () => {
        try {
            set({ loading: true });
            const { data } = await axiosInstance.get('/dashboard/collaborator/enumerator-activity');
            set({ enumeratorActivity: data.data });
            return data;
        } catch (error: any) {
            return handleApiError(error);
        } finally {
            set({ loading: false });
        }
    },

    getValidationQueue: async () => {
        try {
            set({ loading: true });
            const { data } = await axiosInstance.get('/dashboard/collaborator/validation-queue');
            set({ validationQueue: data.data });
            return data;
        } catch (error: any) {
            return handleApiError(error);
        } finally {
            set({ loading: false });
        }
    }
}));