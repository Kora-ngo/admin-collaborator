import { create } from "zustand";
import { reportApi } from "../reportApi";
import { handleApiError } from "../../../utils/handleApiError";
import type { GenerateReportPayload } from "../types/report";
import type { ToastMessage } from "../../../types/toastMessage";

interface ReportState {
    generating: boolean;
    generateReport: (payload: GenerateReportPayload) => Promise<ToastMessage<any>>;
}

export const useReportStore = create<ReportState>((set) => ({
    generating: false,

    generateReport: async (payload) => {
        try {
            set({ generating: true });
            const result = await reportApi.generate(payload);
            return result;
        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        } finally {
            set({ generating: false });
        }
    },
}));