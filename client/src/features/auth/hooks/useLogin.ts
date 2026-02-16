import { useState } from "react"
import { validateLogin } from "../utils/validateUser";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../../../store/toastStore";
import type { ToastMessage } from "../../../types/toastMessage";
import { sessionManager } from "../../../helpers/session/sessionManager";

export const useLogin = () => {

    const login = useAuthStore((state) => state.login);
    const showToast = useToastStore((state) => state.showToast);
    const storeLogout  = useAuthStore((state) => state.logout);

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

        try{
            const {hasErrors, formErrors, userData} = validateLogin(form);
            setErrors(formErrors);

            if(hasErrors){
                return;
            }

            const toastMessage: ToastMessage = await login(userData.email, userData.password);
            if(toastMessage.type === "warning" || toastMessage.type === "error")
            {
                showToast(toastMessage);
                return;
            }else if (toastMessage.type === "success") {
                sessionManager.initSession(() => {
                        // Session expired callback
                        showToast({
                            type: 'warning',
                            message: 'Session expired: Account opened in another tab'
                        });
                        handleLogout();
                })
            }
        } catch (error) {
            showToast({
                type: 'error',
                message: 'Login failed'
            });
        }
    }



        const handleLogout = async () => {
        // ✅ Clear session on logout
        sessionManager.clearSession();
        
        await storeLogout();
        
        showToast({
            type: 'success',
            message: 'Logged out successfully'
        });
        
    };



    return {
        form,
        errors,
        handleChange,
        handleUserLogin
    }
}