

// ============================================================
// Assistance
// ============================================================

import axiosInstance from "../../lib/axiosInstance";
import type { Pagination } from "../../types/pagination";
import type { Assistance, AssistanceType } from "./assistance";

const assistanceEndpoint = "assistance";

export interface AssistanceListResult {
  data: Assistance[];
  pagination: Pagination;
}

export interface AssistanceFilters {
  status?: "true" | "false";
  typeId?: number;
  datePreset?: string;
}

export const assistanceApi = {
  list: async (page?: number, searchTerm = "", status?: string) => {
    const url = searchTerm.trim() ? `${assistanceEndpoint}/search` : assistanceEndpoint;
    const params: Record<string, unknown> = { page, limit: 5, status };
    if (searchTerm.trim()) params.q = searchTerm.trim();

    const { data } = await axiosInstance.get(url, { params });
    return data as AssistanceListResult;
  },

  filter: async (page: number, filters: AssistanceFilters) => {
    const params: Record<string, unknown> = { page, limit: 5 };
    if (filters.status) params.status = filters.status;
    if (filters.typeId) params.typeId = filters.typeId;
    if (filters.datePreset) params.datePreset = filters.datePreset;

    const { data } = await axiosInstance.get("/assistance/filter", { params });
    return data as AssistanceListResult;
  },

  fetchOne: async (id: number) => {
    const { data } = await axiosInstance.get(`${assistanceEndpoint}/${id}`);
    return data.data as Assistance;
  },

  create: async (payload: Assistance) => {
    const { data } = await axiosInstance.post(assistanceEndpoint, payload);
    return data;
  },

  update: async (id: number, payload: Assistance) => {
    const { data } = await axiosInstance.put(`${assistanceEndpoint}/${id}`, payload);
    return data;
  },

  toggle: async (id: number, status: string) => {
    const { data } = await axiosInstance.put(`${assistanceEndpoint}/toggle/${id}`, { status });
    return data;
  },
};

// ============================================================
// Assistance Type
// ============================================================

const assistanceTypeEndpoint = "/assistance-type";

export const assistanceTypeApi = {
  fetch: async () => {
    const { data } = await axiosInstance.get(assistanceTypeEndpoint);
    return data.data as AssistanceType[];
  },

  // NOTE: kept as AssistanceType[] to match your original signature —
  // double check this is meant to be a bulk-create endpoint and not
  // a typo for a single AssistanceType.
  create: async (payload: AssistanceType[]) => {
    const { data } = await axiosInstance.post(assistanceTypeEndpoint, payload);
    return data;
  },

  delete: async (id: number) => {
    const { data } = await axiosInstance.delete(`${assistanceTypeEndpoint}/delete/${id}`);
    return data;
  },
};