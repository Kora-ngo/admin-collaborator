import { create } from "zustand";
import { reportApi } from "../reportApi";
import { handleApiError } from "../../../utils/handleApiError";
import type { GenerateReportPayload, Report } from "../types/report";
import type { ToastMessage } from "../../../types/toastMessage";
import type { Pagination } from "../../../types/pagination";
import type { ReportFilterParams } from "../reportApi";

interface ReportState {
    data: Report[];
    pagination: Pagination | null;
    loading: boolean;
    popUpLoading: boolean;
    connection: boolean;
    error: ToastMessage | null;

    downloadingId: number | null;
    generating: boolean;

    getData: (page?: number) => Promise<any>;
    filterData: (page: number, filters: ReportFilterParams) => Promise<any>;
    fetchOneData: (id: number) => Promise<ToastMessage<Report>>;
    removeData: (id: number) => Promise<ToastMessage>;
    downloadReport: (report: Report) => Promise<void>;
    generateReport: (payload: GenerateReportPayload) => Promise<ToastMessage<any>>;
}

export const useReportStore = create<ReportState>((set) => ({
    data: [],
    pagination: null,
    loading: false,
    connection: true,
    error: null,
    downloadingId: null,
    generating: false,
    popUpLoading: false,

    getData: async (page = 1) => {
        try {
            set({ loading: true, data: [], connection: true, error: null });
            const result = await reportApi.list(page, 10);

            if (result.type === "success") {
                set({ data: result.data, pagination: result.pagination });
            } else {
                set({ error: result as any });
            }

            return result;
        } catch (error: any) {
            const errorToast = handleApiError(error);
            set({  connection: false });
            return errorToast;
        } finally {
            set({ loading: false });
        }
    },

    filterData: async (page = 1, filters) => {
        try {
            set({ loading: true, data: [], connection: true, error: null });
            const result = await reportApi.filter(page, filters);

            if (result.type === "success") {
                set({ data: result.data, pagination: result.pagination });
            } else {
                set({ error: result as any });
            }

            return result;
        } catch (error: any) {
            const errorToast = handleApiError(error);
            set({ connection: false, });
            return errorToast;
        } finally {
            set({ loading: false });
        }
    },

    fetchOneData: async (id) => {
        try {
            return await reportApi.fetchOne(id);
        } catch (error: any) {
            return handleApiError(error);
        }
    },

    removeData: async (id) => {
        set({popUpLoading: true});
        try {
            return await reportApi.remove(id);
        } catch (error: any) {
            return handleApiError(error);
        }finally {
        set({popUpLoading: false});
        }
    },

    downloadReport: async (report) => {
        try {
            set({ downloadingId: report.id });
            const blob = await reportApi.download(report.id);

            const extension = report.format.toLowerCase();
            const safeName = (report.project?.name || "report").replace(/\s+/g, "_");
            const filename = `${safeName}_${report.type}.${extension}`;

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            handleApiError(error);
        } finally {
            set({ downloadingId: null });
        }
    },

    generateReport: async (payload) => {
        try {
            set({ generating: true });
            const result = await reportApi.generate(payload);
            return result;
        } catch (error: any) {
            return handleApiError(error);
        } finally {
            set({ generating: false });
        }
    },
}));