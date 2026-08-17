import type { ToastMessage } from "../../types/toastMessage";
import axiosInstance from "../../lib/axiosInstance";
import type { Pagination } from "../../types/pagination";
import type { Report, GenerateReportPayload } from "./types/report";


// pagination sits alongside `data`, not nested inside it — different shape
// from the ToastMessage<T> convention used elsewhere in this app.
export interface ReportListResponse {
    type: string;
    data: Report[];
    pagination: Pagination;
}
 
export interface ReportFilterParams {
    type?: string;
    status?: string;
    project_id?: string;
}
 

export const reportApi = {

       list: async (page = 1, limit = 10): Promise<ReportListResponse> => {
        const { data } = await axiosInstance.get("/reports", { params: { page, limit } });
        return data as ReportListResponse;
    },
 
    filter: async (page = 1, filters: ReportFilterParams = {}): Promise<ReportListResponse> => {
        const params: any = { page, limit: 10 };
        if (filters.type) params.type = filters.type;
        if (filters.status) params.status = filters.status;
        if (filters.project_id) params.project_id = filters.project_id;
 
        const { data } = await axiosInstance.get("/reports/filter", { params });
        return data as ReportListResponse;
    },
 
    fetchOne: async (id: number): Promise<ToastMessage<Report>> => {
        const { data } = await axiosInstance.get(`/reports/${id}`);
        return data as ToastMessage<Report>;
    },
 
    remove: async (id: number): Promise<ToastMessage> => {
        const { data } = await axiosInstance.delete(`/reports/${id}`);
        return data as ToastMessage;
    },
 
    download: async (id: number): Promise<Blob> => {
        const { data } = await axiosInstance.get(`/reports/${id}/download`, { responseType: "blob" });
        return data as Blob;
    },

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