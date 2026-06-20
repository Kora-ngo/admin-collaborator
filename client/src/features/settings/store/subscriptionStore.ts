import { create } from 'zustand';
import type { Subscription } from '../../../types/subscription';
import type { Pagination } from '../../../types/pagination';
import { settingApi } from '../settingApi';

interface SubscriptionStore {
    history: Subscription[];
    currentSubscription: Subscription | null;
    loading: boolean;
    pagination: Pagination | null;

    // Actions
    getHistory: (page?: number) => Promise<void>;
    getCurrentSubscription: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
    history: [],
    currentSubscription: null,
    loading: false,
    pagination: null,

    getHistory: async () => {
        set({ loading: true });
        try {
            const response = await settingApi.getHistory();
            
            if (response.data.type === 'success') {
                set({
                    history: response.data.data,
                    pagination: response.data.pagination,
                    loading: false
                });
            }
        } catch (error) {
            set({ loading: false });
        }
    },

    getCurrentSubscription: async () => {
        set({ loading: true });
        try {
            const response = await settingApi.getCurrent();
            
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