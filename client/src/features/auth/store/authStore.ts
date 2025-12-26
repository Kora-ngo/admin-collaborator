import { create } from "zustand";
import type { User } from "../../../types/user";
import axios from "axios";
import { handleApiError } from "../../../utils/handleApiError";

interface AuthState {
    user: User | null,
    token: string | null,
    loading: boolean,
    error: string | null,
    register: (users: User, organisation: any) => Promise<any>,
    login: (email: String, password: any) => Promise<any>,
    getCurrentUser: () => Promise<any>
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
                const fetchData = response.data;

                console.log("AuthStore - Resgister - Response --> ", response);

                if(fetchData.token){
                    localStorage.setItem('token', fetchData.token);
                    set({token: fetchData.token});
                    await get().getCurrentUser();
                }

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

                console.log("AuthStore - Login - Response --> ", response.data);

                const fetchData = response.data;

                if(fetchData.token){
                    localStorage.setItem('token', fetchData.token);
                    set({token: fetchData.token});
                    await get().getCurrentUser();
                }
                

            }catch(err: any){

                console.log("Error --> ", err);

                const errorToast = handleApiError(err);
                set({error: errorToast.message});
                return errorToast;

            }finally{
                set({loading: false})
            }
        },

        getCurrentUser: async () => {
            const token = get().token;

            console.log('Fetch token --> ', token);

            if (!token) return;

            try {
                set({loading: true, error: null});
                const {data} = await axios.get("http://localhost:5000/api/auth/me", {
                    headers: {Authorization: `Bearer ${token}`}
                });

                console.log("AuthStore - Current user - Response --> ", data);


                set({user: data});
            }catch(err: any){

                console.log("Error --> ", err);
                const errorToast = handleApiError(err);
                set({error: errorToast.message});
                return errorToast;

            }finally {
                set({loading: false});
            }
        }

}))