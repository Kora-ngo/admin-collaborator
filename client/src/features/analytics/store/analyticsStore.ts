import { create } from "zustand";
import { analyticsApi } from "../analyticsApi";
import { handleApiError } from "../../../utils/handleApiError";
import type { AnalyticsData, AnalyticsQueryParams, AvailableFilters } from "../types/analytics";
import type { ToastMessage } from "../../../types/toastMessage";

interface AnalyticsState {
    data: AnalyticsData | null;
    loading: boolean;

    filterOptions: AvailableFilters | null;
    loadingFilters: boolean;

    fetchAnalytics: (params: AnalyticsQueryParams) => Promise<ToastMessage<AnalyticsData>>;
    fetchFilterOptions: () => Promise<ToastMessage<AvailableFilters>>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
    data: null,
    loading: false,

    filterOptions: null,
    loadingFilters: false,

    fetchAnalytics: async (params) => {
        try {
            set({ loading: true });

            const result = await analyticsApi.getAnalytics(params);

            if (result.type === "success" && result.data) {
                set({ data: result.data });
            }

            return result;
        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        } finally {
            set({ loading: false });
        }
    },

    fetchFilterOptions: async () => {
        try {
            set({ loadingFilters: true });

            const result = await analyticsApi.getFilters();

            if (result.type === "success" && result.data) {
                set({ filterOptions: result.data });
            }

            return result;
        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        } finally {
            set({ loadingFilters: false });
        }
    },
}));