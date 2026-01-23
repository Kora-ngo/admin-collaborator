import { useState } from "react"
import { validateLogin } from "../utils/validateUser";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../../../store/toastStore";
import type { ToastMessage } from "../../../types/toastMessage";

export const useLogin = () => {

    const login = useAuthStore((state) => state.login);
    const showToast = useToastStore((state) => state.showToast);

    const [form, setForm] = useState({
        email: "",
        password: "",
    });


    const [errors, setErrors] = useState({
        email: false,
        password: false
    });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    }


    const handleUserLogin = async (): Promise<void> => {

        const {hasErrors, formErrors, userData} = validateLogin(form);
        setErrors(formErrors);

        if(hasErrors){
            return;
        }

        const toastMessage: ToastMessage = await login(userData.email, userData.password);
        console.log("Use Login --> ", toastMessage);
        if(toastMessage.type === "warning")
        {
            showToast(toastMessage);
            return;
        }
    }



    return {
        form,
        errors,
        handleChange,
        handleUserLogin
    }
}