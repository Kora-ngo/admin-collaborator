import { create } from "zustand";
import type { ToastMessage } from "../types/toastMessage";

interface ToastState {
    toast: ToastMessage | null;
    showToast: (toast: ToastMessage) => void;
    hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
    toast: null,

    showToast: (toast) => {
        set({ toast: { ...toast, show: true } });
    },
    
    hideToast: () => {
        set((state) => ({
        toast: state.toast ? { ...state.toast, show: false } : null,
        }));
    },
}))