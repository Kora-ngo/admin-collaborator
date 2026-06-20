import axiosInstance from "../../lib/axiosInstance";
import type { Pagination } from "../../types/pagination";
import type { AuditLog } from "./auditLog";

const endpoint = "audit-logs";

export interface AuditLogListResult {
  data: AuditLog[];
  pagination: Pagination;
}

export const auditApi = {
  list: async (page = 1, searchTerm = "") => {
    const getEndpoint = searchTerm.trim() ? `${endpoint}/search` : endpoint;
    const params: any = { page, limit: 20 };

    if (searchTerm.trim()) params.q = searchTerm.trim();

    const { data } = await axiosInstance.get(getEndpoint, { params });
    return data as AuditLogListResult;
  },

  filter: async (page = 1, filters: any) => {
    const params: any = { page, limit: 20 };
    if (filters.entityType) params.entityType = filters.entityType;
    if (filters.actorRole) params.actorRole = filters.actorRole;
    if (filters.platform) params.platform = filters.platform;
    if (filters.datePreset) params.datePreset = filters.datePreset;

    const response = await axiosInstance.get(`${endpoint}/filter`, { params });
    return response.data as AuditLogListResult;
  },
};