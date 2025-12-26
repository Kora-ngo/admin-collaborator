import { useState } from "react"
import { validateLogin } from "../utils/validateUser";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../../../store/toastStore";

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

        const toastMessage = await login(userData.email, userData.password);
        showToast(toastMessage);
    }



    return {
        form,
        errors,
        handleChange,
        handleUserLogin
    }
}