import { useEffect, useState } from "react"
import type { AssistanceType } from "../../../types/assistance"
import { validateAssistanceType } from "../utils/validate";
import type { ToastMessage } from "../../../types/toastMessage";
import { useAssistanceTypeStore } from "../store/assistanceTypeStore";
import { useToastStore } from "../../../store/toastStore";

export const useAssistance = () => {

    const {creatData, deletData, fetchData} = useAssistanceTypeStore();
    const showToast = useToastStore((state) => state.showToast);

    const [types, setTypes] = useState<AssistanceType[]>([
        { id: "1", name: "", unit: "" }
    ]);

    const [typeErrors, setTypeErrors] = useState<Array<{ name: boolean; unit: boolean }>>([
        { name: false, unit: false },
    ]);

    useEffect(() => {
}, [types]);

    // Bussiness Logic for Assistance Type

    // Add a new empty row
    const addNewType = () => {
    const newId = Date.now().toString(); // or use a better id generator
    setTypes((prev) => [...prev, { id: newId, name: "", unit: "" }]);
    setTypeErrors((prev) => [...prev, { name: false, unit: false }]);
    };

    // Remove a row by id (but prevent deleting the first one)
    const removeType = (rowId: string) => {
        if (types.length === 1) return;

        const indexToRemove = types.findIndex((row) => row.id === rowId);
        if (indexToRemove <= 0) return; // don't remove first row

        setTypes((prev) => prev.filter((row) => row.id !== rowId));
        setTypeErrors((prev) => prev.filter((_, i) => i !== indexToRemove));
    }

    const handleTypeChange = (
        rowId: string,
        field: "name" | "unit",
        value: string
    ) => {
        setTypes((prev) =>
        prev.map((row) =>
            row.id === rowId ? { ...row, [field]: value } : row
        )
        );
    };


    const handleTypeSubmit = async (): Promise<boolean> => {

        const {hasErrors, formErrors, typeData} = validateAssistanceType(types);

        setTypeErrors(formErrors.types || []);

        if(hasErrors){
            return false;
        }

        const toatMessage: ToastMessage = await creatData(typeData);
        showToast(toatMessage);
        if(toatMessage.type === "success"){
            return true;
        }

        return false;
    }

    const handleDelete = async (id: number) => {
        const toatMessage: ToastMessage = await deletData(id);
        showToast(toatMessage);
        if(toatMessage.type === 'success'){
            await fetchData();
        }
    }



    return {
        types,
        setTypes,
        typeErrors,
        addNewType,
        removeType,
        handleTypeChange,
        handleTypeSubmit,
        handleDelete
    }



}