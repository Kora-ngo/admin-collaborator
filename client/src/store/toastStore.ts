import { create } from "zustand";
import type { ToastMessage } from "../types/toastMessage";

interface ToastState {
  toast: ToastMessage | null;
  showToast: (toast: Omit<ToastState['toast'], 'show'>) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toast: null, // ← MUST be null by default

  showToast: (newToast) => {
    set({
      toast: {
        ...newToast,
        show: true, // Only true when explicitly called
      },
    } as any);
  },

  hideToast: () => {
    set((state) => ({
      toast: state.toast ? { ...state.toast, show: false } : null,
    }));
  },
}));