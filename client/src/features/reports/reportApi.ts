import type { GenerateReportPayload } from "./types/report";
import type { ToastMessage } from "../../types/toastMessage";
import axiosInstance from "../../lib/axiosInstance";

export const reportApi = {
    // Backend endpoint doesn't exist yet. This logs exactly what would be
    // POSTed and simulates a success response, so the form/hook/store flow
    // can be built and tested end to end now. Swap the body for a real
    // axiosInstance.post(...) call once the endpoint is ready — the return
    // type (ToastMessage<...>) is already what that call should resolve to.
    generate: async (payload: GenerateReportPayload): Promise<ToastMessage<{ payload: GenerateReportPayload }>> => {
        console.log("[reportApi.generate] Would POST this payload to the backend:");
        console.log(JSON.stringify(payload, null, 2));

        const response = await axiosInstance.post('reports/generate', payload);
         return response.data;
    },
};