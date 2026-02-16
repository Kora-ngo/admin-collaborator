import { create } from 'zustand';
import axiosInstance from '../../../utils/axiosInstance';
import { handleApiError } from '../../../utils/handleApiError';

interface FeedbackStore {
    loading: boolean;
    sendFeedback: (message: string, email?: string) => Promise<any>;
}

export const useFeedbackStore = create<FeedbackStore>((set) => ({
    loading: false,

    sendFeedback: async (message: string, email?: string) => {
        try {
            set({ loading: true });

            const response = await axiosInstance.post('/feedback', {
                message,
                email: email || undefined
            });

            return response.data;

        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        } finally {
            set({ loading: false });
        }
    }
}));