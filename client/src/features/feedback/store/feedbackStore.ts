import { create } from 'zustand';
import { handleApiError } from "../../../utils/handleApiError";
import { feedbackApi } from '../feedbackApi';

interface FeedbackStore {
    loading: boolean;
    sendFeedback: (message: string, email?: string) => Promise<any>;
}

export const useFeedbackStore = create<FeedbackStore>((set) => ({
    loading: false,

    sendFeedback: async (message: string, email?: string) => {
        try {
            set({ loading: true });

            const data = await feedbackApi.send(message, email);

            return data;

        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        } finally {
            set({ loading: false });
        }
    }
}));