import { create } from 'zustand';
import type { Subscription } from '../../../types/subscription';
import type { Pagination } from '../../../types/pagination';
import axiosInstance from '../../../utils/axiosInstance';

interface SubscriptionStore {
    history: Subscription[];
    currentSubscription: Subscription | null;
    loading: boolean;
    pagination: Pagination | null;

    // Actions
    getHistory: (page?: number) => Promise<void>;
    getCurrentSubscription: () => Promise<void>;
}

const endpoint = 'subscription';

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
    history: [],
    currentSubscription: null,
    loading: false,
    pagination: null,

    getHistory: async (page = 1) => {
        set({ loading: true });
        try {
            const response = await axiosInstance.get(`${endpoint}`);

            console.log("Store - Subscription --> ", response);
            
            if (response.data.type === 'success') {
                set({
                    history: response.data.data,
                    pagination: response.data.pagination,
                    loading: false
                });
            }
        } catch (error) {
            console.error('Failed to fetch subscription history:', error);
            set({ loading: false });
        }
    },

    getCurrentSubscription: async () => {
        set({ loading: true });
        try {
            const response = await axiosInstance.get(`${endpoint}/current`);
            
            if (response.data.type === 'success') {
                set({
                    currentSubscription: response.data.data,
                    loading: false
                });
            }
        } catch (error) {
            console.error('Failed to fetch current subscription:', error);
            set({ 
                currentSubscription: null,
                loading: false 
            });
        }
    }
}));