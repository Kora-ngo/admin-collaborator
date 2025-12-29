import { useEffect, useState } from "react"
import { validateOrganisation, validateUser } from "../utils/validateUser";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../../../store/toastStore";
import type { ToastMessage } from "../../../types/toastMessage";

export const useAdminResgister = () => {

    const resgister = useAuthStore((state) => state.register);
    const {user} = useAuthStore();
    const showToast = useToastStore((state) => state.showToast);


    const [userForm, setUserForm] = useState({
        fname: "",
        lname: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    const [errors, setError] = useState({
        fname: false,
        lname: false,
        email: false,
        phone: false,
        password: false,
        confirmPassword: false
    });


    const [orgForm, setOrgForm] = useState({
        name: "",
        description: "",
        country: "",
        region: "",
        email: "",
        phone: "",
    });

    const [orgErrors, setOrgErrors] = useState({
        name: false,
        email: false
    });


    // Update user info ........................

    const userData = user.user;
    // const organisationData = user.organisation;

    const fullname = userData.name;
    const [firstName, lastName] = fullname.split(" ");


    useEffect(() => {
        if(userData.id){
            setUserForm({
                fname: firstName,
                lname: lastName,
                email: userData.email,
                phone: userData.phone,
                password: "",
                confirmPassword: ""
            })
        }
    }, [user])



    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserForm((prev) => ({
            ...prev,
            [name]: value
        }));

        if(errors[name as keyof typeof errors]){
            setError((prev) => ({
                ...prev,
                [name]: false
            }));
        }
    };


    const handleOrgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setOrgForm((prev) => ({
            ...prev,
            [name]: value
        }));

        if(errors[name as keyof typeof errors]){
            setOrgForm((prev) => ({
                ...prev,
                [name]: false
            }));
        }
    };


    const handleUserData = (): Boolean => {
        const {hasErrors, formErrors} = validateUser(userForm);
        setError(formErrors);
        if(!hasErrors){

            if(userData.id){
                console.log("Update user --> ", userForm);
                return true;
            }

            return true;
        }
        return false;
        
    } 


    const handleOrgData = async (): Promise<Boolean> => {
        const {userData} = validateUser(userForm);
        const {hasErrors, formErrors, trimmedData} = validateOrganisation(orgForm);
        setOrgErrors(formErrors);

        if (hasErrors) {
            return false;
        }

        const toastMessage: ToastMessage = await resgister(userData, trimmedData);
        if(toastMessage.type === "error"){
            showToast(toastMessage);
        }

        return toastMessage.type === "success";
    }
    




    return { 
        userForm, 
        errors,
        
        orgForm,
        orgErrors,
        
        handleChange,
        handleOrgChange,
        
        handleUserData,
        handleOrgData
    }


}