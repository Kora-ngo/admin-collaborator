import { useState } from "react"
import type { Assistance } from "../../../types/assistance"
import { validateAssistance } from "../utils/validate";
import { useToastStore } from "../../../store/toastStore";
import type { ToastMessage } from "../../../types/toastMessage";
import { useAssistanceStore } from "../store/assistanceStore";
import { useAuthStore } from "../../auth/store/authStore";

export const useAssis = () => {

    const {createData, fetchData} = useAssistanceStore();
    const showToast = useToastStore((state) => state.showToast);
    const {membership} = useAuthStore();

    const [form, setForm] = useState<Assistance>({
        name: "",
        assistance_id: 0,
        description: "",
        created_by: membership?.id
    });

    const [errors, setErrors] = useState({
        name: false,
        assistance_id: false,
    });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    }


    const handleSubmit = async (): Promise<boolean> => {

        const {hasErrors, formErrors, data} = validateAssistance(form);
        setErrors(formErrors);

        if(hasErrors){
            return false;
        }

        const toatMessage: ToastMessage = await createData(data);
        showToast(toatMessage);
        if(toatMessage.type === "success"){
            return true;
            // await fetchData();
        }
        
        return false;
    }

    return{
        form,
        setForm,
        errors,

        handleChange,
        handleSubmit
    }

}