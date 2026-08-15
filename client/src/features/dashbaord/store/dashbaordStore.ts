import { create } from "zustand";
import { handleApiError } from "../../../utils/handleApiError";
import { dashboardApi } from "../dashbaordApi";
import type { AdminDashboardData } from "../dashbaord";
import type { ToastMessage } from "../../../types/toastMessage";


interface DashboardState {
    // Admin data — one payload now instead of three
    adminOverview: AdminDashboardData | null;
    error: ToastMessage | null;

    // Collaborator data — unchanged
    collaboratorMetrics: any;
    enumeratorActivity: any[];
    validationQueue: any;

    loading: boolean;
    connection: boolean;

    // Admin method
    getAdminOverview: () => Promise<any>;

    // Collaborator methods
    getCollaboratorMetrics: () => Promise<any>;
    getEnumeratorActivity: () => Promise<any>;
    getValidationQueue: () => Promise<any>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    adminOverview: null,
    collaboratorMetrics: null,
    enumeratorActivity: [],
    validationQueue: null,
    loading: false,
    connection: true,
    error: null,

    getAdminOverview: async () => {
        try {
            set({ loading: true, connection: true });
            const result = await dashboardApi.getAdminOverview();
            if (result.type === "success" && result.data) {
                set({ adminOverview: result.data });
            }else {
                // Server responded, but with a non-success ToastMessage
                // (e.g. a validation/permission error body).
                set({ error: {type: "no_network", data: result, message: "yeah"} });
            }
            return result;
        } catch (error: any) {
            set({connection: false})
            return handleApiError(error);
        } finally {
            set({ loading: false });
        }
    },

    // Collaborator methods — unchanged
    getCollaboratorMetrics: async () => {
        try {
            set({ loading: true, connection: true  });
            const data = await dashboardApi.getCollaboratorMetrics();
            set({ collaboratorMetrics: data.data });
            return data;
        } catch (error: any) {
            set({connection: false})
            return handleApiError(error);
        } finally {
            set({ loading: false });
        }
    },

    getEnumeratorActivity: async () => {
        try {
            set({ loading: true, connection: true  });
            const data = await dashboardApi.getEnumeratorActivity();
            set({ enumeratorActivity: data.data });
            return data;
        } catch (error: any) {
            set({connection: false})
            return handleApiError(error);
        } finally {
            set({ loading: false });
        }
    },

    getValidationQueue: async () => {
        try {
            set({ loading: true, connection: true });
            const data = await dashboardApi.getValidationQueue();
            set({ validationQueue: data.data });
            return data;
        } catch (error: any) {
            set({connection: false})
            return handleApiError(error);
        } finally {
            set({ loading: false });
        }
    }
}));