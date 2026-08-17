import axiosInstance from "../../lib/axiosInstance";
import type { ToastMessage } from "../../types/toastMessage";
import type { AnalyticsData, AnalyticsQueryParams, AvailableFilters } from "./types/analytics";


export const analyticsApi = {
    getAnalytics: async (params: AnalyticsQueryParams): Promise<ToastMessage<AnalyticsData>> => {
        const { data } = await axiosInstance.get("/analytics", { params });
        console.log("Data --> ", data)
        return data as ToastMessage<AnalyticsData>;
    },

    // Lightweight, independent of the heavier /analytics call — lets the
    // filter dropdowns populate on load without waiting on the full payload.
    getFilters: async (): Promise<ToastMessage<AvailableFilters>> => {
        const { data } = await axiosInstance.get("/analytics/filters");
        return data as ToastMessage<AvailableFilters>;
    },
};