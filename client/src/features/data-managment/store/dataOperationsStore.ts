import { create } from "zustand";
import { handleApiError } from "../../../utils/handleApiError";
import type { Dataset, ValidationResult } from "../types";
import type { ToastMessage } from "../../../types/toastMessage";
import { dataOperationsApi } from "../dataOperationApi";

interface DataOperationsState {
    validating: boolean;
    validationResult: ValidationResult | null;
    validateFile: (dataset: Dataset, file: File) => Promise<ToastMessage<ValidationResult>>;
    resetValidation: () => void;
}

export const useDataOperationsStore = create<DataOperationsState>((set) => ({
    validating: false,
    validationResult: null,

    validateFile: async (dataset, file) => {
        try {
            set({ validating: true, validationResult: null });

            const result = await dataOperationsApi.validate(dataset, file);

            if (result.type === "success" && result.data) {
                set({ validationResult: result.data });
            }

            return result;
        } catch (error: any) {
            const errorToast = handleApiError(error);
            return errorToast;
        } finally {
            set({ validating: false });
        }
    },

    resetValidation: () => set({ validating: false, validationResult: null }),
}));