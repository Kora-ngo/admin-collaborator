import { create } from "zustand";
import type { ToastMessage } from "../../../types/toastMessage";
import type { User } from "../../../types/user";
import axios from "axios";
import { handleApiError } from "../../../utils/handleApiError";

interface AuthState {
    user: User | null,
    token: string | null,
    loading: boolean,
    error: string | null,
    register: (users: User, organisation: any) => Promise<ToastMessage>,
    login: (email: String, password: any) => Promise<ToastMessage>,
}


export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null,

        register: async (users, organisation) => {

            try{
                set({loading: true, error: null});
                console.log("Registering:", { users, organisation });
                const response: any = await axios.post("http://localhost:5000/api/auth/register-admin", {
                    users,
                    organisation
                });

                console.log("AuthStore - Resgister - Response --> ", response);

                const toastMessage: ToastMessage = {
                    type: response.type,
                    message: response.message,
                    show: true,
                    data: response.token
                };

                return toastMessage;

            }catch(err: any){

                console.log("Error --> ", err);

                const errorToast = handleApiError(err);
                set({error: errorToast.message});
                return errorToast;

            }finally{
                set({loading: false})
            }
        },

        login: async (email, password) => {
            try{
                set({loading: false});
                set({error: null});

                console.log("Login --> ", {email, password});
                const response: any = await axios.post("http://localhost:5000/api/auth/login", {
                    email,
                    password
                });

                console.log("AuthStore - Login - Response --> ", response);

                const toastMessage: ToastMessage = {
                    type: response.type,
                    message: response.message,
                    show: true,
                    data: response.token
                };

                return toastMessage;

            }catch(err: any){

                console.log("Error --> ", err);

                const errorToast = handleApiError(err);
                set({error: errorToast.message});
                return errorToast;

            }finally{
                set({loading: false})
            }
        }

}))