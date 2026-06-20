import axiosInstance from "../../lib/axiosInstance";
import type { Pagination } from "../../types/pagination";
import type { Subscription } from "../../types/subscription";

const endpoint = 'subscription';

export interface SubscriptionListResult {
  data: Subscription[];
  pagination: Pagination;
}

export const settingApi = {
    getHistory: async () => {
        const response = await axiosInstance.get(`${endpoint}`);
        return response;
    },

    getCurrent: async () => {
        const response = await axiosInstance.get(`${endpoint}/current`);
        return response;
    },
};