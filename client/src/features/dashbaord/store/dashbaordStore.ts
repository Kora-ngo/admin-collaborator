import { create } from "zustand";
import axiosInstance from "../../../utils/axiosInstance";
import { handleApiError } from "../../../utils/handleApiError";

interface KeyMetrics {
    activeProjects: number;
    totalFamilies: number;
    totalDeliveries: number;
    activeFieldUsers: number;
}

interface ProjectProgress {
    id: number;
    name: string;
    familiesRegistered: number;
    deliveriesCompleted: number;
    daysLeft: number;
    startDate: Date;
    endDate: Date;
    membersCount: number;
}

interface ProjectAlert {
    type: string;
    alerts: [],
    summary: {}
}

interface DashboardState {
    keyMetrics: KeyMetrics | null;
    projectProgress: ProjectProgress[];
    projectAlert: ProjectAlert | null;
    loading: boolean;
    getKeyMetrics: () => Promise<any>;
    getProjectProgress: () => Promise<any>;
    getProjectAlert: () => Promise<any>;
}

const endpoint = "dashboard";

export const useDashboardStore = create<DashboardState>((set) => ({
    keyMetrics: null,
    projectAlert: null,
    projectProgress: [],
    loading: false,

    getKeyMetrics: async () => {
        try {
            set({ loading: true });

            const { data } = await axiosInstance.get(`${endpoint}/key-metrics`);

            set({
                keyMetrics: data.data
            });

            console.log("Dashboard - Key Metrics response:", data);
            return data;
        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        } finally {
            set({ loading: false });
        }
    },

    getProjectProgress: async () => {
        try {
            set({ loading: true });

            const { data } = await axiosInstance.get(`${endpoint}/project-progress`);

            set({
                projectProgress: data.data
            });

            console.log("Dashboard - Project Progress response:", data);
            return data;
        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        } finally {
            set({ loading: false });
        }
    },


    getProjectAlert: async () => {
        try {
            set({ loading: true });

            const { data } = await axiosInstance.get(`${endpoint}/project-alert`);

            set({
                projectAlert: data
            });

            console.log("Dashboard - Project Alert response:", data);
            return data;
        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        } finally {
            set({ loading: false });
        }
    },
}));