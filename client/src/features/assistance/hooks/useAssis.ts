import { useState } from "react"
import type { Assistance } from "../../../types/assistance"
import { validateAssistance } from "../utils/validate";

export const useAssis = () => {
    const [form, setForm] = useState<Assistance>({
        name: "",
        assistance_id: 0,
        description: ""
    });

    const [errors, setErrors] = useState({
        name: false,
        assistance_id: false,
    });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    }


    const handleSubmit = async (): Promise<void> => {
        const {hasErrors, formErrors, data} = validateAssistance(form);
        setErrors(formErrors);

        if(hasErrors){
            return;
        }

        console.log("Assiantnce --> ", data);
    }

    return{
        form,
        errors,

        handleChange,
        handleSubmit
    }

}