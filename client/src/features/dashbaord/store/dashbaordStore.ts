import { create } from "zustand";
import { handleApiError } from "../../../utils/handleApiError";
import { dashboardApi } from "../dashbaordApi";

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
            const data = await dashboardApi.getKeyMetrics();
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
            const data = await dashboardApi.getProjectProgress();
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
            const data = await dashboardApi.getProjectAlert();
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
            const data = await dashboardApi.getCollaboratorMetrics();
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
            const data = await dashboardApi.getEnumeratorActivity();
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
            const data = await dashboardApi.getValidationQueue();
            set({ validationQueue: data.data });
            return data;
        } catch (error: any) {
            return handleApiError(error);
        } finally {
            set({ loading: false });
        }
    }
}));