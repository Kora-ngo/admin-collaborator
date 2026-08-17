import { useState } from "react";
import { useDataOperationsStore } from "../store/dataOperationsStore";
import { useToastStore } from "../../../store/toastStore";
import type { Dataset, ImportStep } from "../types";

export const useDataOperations = (dataset: Dataset) => {
    const { validateFile, validationResult, validating, resetValidation } = useDataOperationsStore();
    const showToast = useToastStore((state) => state.showToast);

    const [step, setStep] = useState<ImportStep>("upload");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setSelectedFile(file);
    };

    const handleValidate = async () => {
        if (!selectedFile) return;

        setStep("processing");

        const result = await validateFile(dataset, selectedFile);

        // A ToastMessage comes back on network/server failure — bounce back to upload.
        if (result.type !== "success" || !result.data) {
            showToast(result);
            setStep("upload");
            return;
        }
        

        setStep("validation");
    };

    const handleConfirm = () => {
        // Wiring to the actual "commit import" endpoint happens once the
        // backend exposes it — for now this just closes out the flow.
        setStep("completed");
    };

    const handleReset = () => {
        setStep("upload");
        setSelectedFile(null);
        resetValidation();
    };

    return {
        step,
        selectedFile,
        handleFileSelect,
        handleValidate,
        handleConfirm,
        handleReset,
        validationResult,
        validating,
    };
};