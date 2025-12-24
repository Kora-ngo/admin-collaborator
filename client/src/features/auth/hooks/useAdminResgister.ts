import { useState } from "react"
import { validateOrganisation, validateUser } from "../utils/validateUser";

export const useAdminResgister = () => {

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
        const {hasErrors, formErrors, trimmedData} = validateUser(userForm);
        setError(formErrors);
        if(!hasErrors){
            console.log("Data --> ", trimmedData);
            return true;
        }

        console.log('Form Errors --> ', formErrors);
        return false;
        
    } 


    const handleOrgData = (): Boolean => {
        const {hasErrors, formErrors, trimmedData} = validateOrganisation(orgForm);
        setOrgErrors(formErrors);

        if(!hasErrors){
            console.log("Organisation --> ", trimmedData);
            return true;
        }

        console.log('Form Error --> ', formErrors);
        return false;
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