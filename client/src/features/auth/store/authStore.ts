import { create } from "zustand";
import type { User } from "../../../types/user";
import { handleApiError } from "../../../utils/handleApiError";
import axiosInstance from "../../../utils/axiosInstance";
import type { Subscription } from "../../../types/subscription";
import type { Organisation } from "../../../types/organisation";
import type { Membership } from "../../../types/membership";

interface AuthState {
    user: User | null,
    token: string | null,
    role: "admin" | "collaborator" | "",
    subscription: Subscription | null,
    organisation: Organisation | null,
    membership: Membership | null,
    loading: boolean,
    showToastMessage: boolean,
    register: (users: User, organisation: any) => Promise<any>,
    login: (email: String, password: any) => Promise<any>,
    logout: () => Promise<any>,
    getCurrentUser: () => Promise<any>,
    updateProfile: (data: any) => Promise<any>;
    updateOrganisation: (data: any) => Promise<any>;
}

const endpoint = "/auth";


export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: localStorage.getItem('token'),
    subscription: null,
    organisation: null,
    membership: null,
    loading: false,
    role: "",
    showToastMessage: false,

        register: async (users, organisation) => {

            try{
                set({loading: true});
                const response: any = await axiosInstance.post(`${endpoint}/register-admin`, {
                    users,
                    organisation
                });
                const fetchData = response.data;

                // console.log("AuthStore - Resgister - Response --> ", response);

                if(fetchData.token){
                    localStorage.setItem('token', fetchData.token);
                    set({token: fetchData.token});
                    await get().getCurrentUser();
                }

            }catch(err: any){

                console.log("Error --> ", err);

                const errorToast = handleApiError(err);
                return errorToast;

            }finally{
                set({loading: false})
            }
        },

        login: async (email, password) => {
            try{
                set({loading: false});

                console.log("Login --> ", {email, password});
                const response: any = await axiosInstance.post(`${endpoint}/login`, {
                    email,
                    password
                });

                // console.log("AuthStore - Login - Response --> ", response.data);

                const fetchData = response.data;

                if(fetchData.token){
                    localStorage.setItem('token', fetchData.token);
                    set({token: fetchData.token});
                    await get().getCurrentUser();
                }
                

            }catch(err: any){

                console.log("Error --> ", err);

                const errorToast = handleApiError(err);
                return errorToast;

            }finally{
                set({loading: false})
            }
        },

        logout: async () => {

            localStorage.removeItem('token');
            set({ user: null, token: null, loading: false });

            await get().getCurrentUser();

        },

        getCurrentUser: async () => {
            const token = get().token;
           if (!token) {
                set({ 
                    user: null,
                    role: "",
                    organisation: null,
                    subscription: null, 
                    membership: null,
                 });
                return;
            }

            try {
                set({loading: true, showToastMessage: false});
                const {data} = await axiosInstance.get(`${endpoint}/me`);
                console.log("AuthStore - Current user - Response --> ", data);
                set({
                    user: data.user,
                    role: data.role,
                    organisation: data.organisation,
                    subscription: data.subscription, 
                    membership: data.membership,
                    loading: false
                });
            }catch(err: any){
                console.log("Error --> ", err);
                localStorage.removeItem('token');

                set({ 
                    user: null,
                    token: null,
                    role: "",
                    organisation: null,
                    subscription: null, 
                    loading: false
                 });
                const errorToast = handleApiError(err);
                return errorToast;

            }
        },

        updateProfile: async (data: any) => {
        try {
            set({ loading: true });
            const response = await axiosInstance.put(`${endpoint}/profile`, data);
            console.log("Response --> ", response.data);
            if (response.data.type === "success") {
                await get().getCurrentUser();
            }
            return response.data;
        } catch (error: any) {
            return handleApiError(error);
        } finally {
            set({ loading: false });
        }
    },

        updateOrganisation: async (data) => {
            try {
                set({ loading: true });
                const response = await axiosInstance.put(`${endpoint}/organisation`, data);
                if (response.data.type === "success") {
                    await get().getCurrentUser();
                }
                return response.data;
            } catch (error: any) {
                return handleApiError(error);
            } finally {
                set({ loading: false });
            }
        }



}))