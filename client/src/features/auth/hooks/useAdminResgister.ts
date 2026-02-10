import { useEffect, useState } from "react"
import { validateOrganisation, validateProfileUpdate, validateUser } from "../utils/validateUser";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../../../store/toastStore";
import type { ToastMessage } from "../../../types/toastMessage";

export const useAdminResgister = () => {

    const resgister = useAuthStore((state) => state.register);
    const {user, organisation, updateProfile, updateOrganisation} = useAuthStore();
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

    // const organisationData = user.organisation;

    const fullname = user ? user!.name : "";
    const [firstName, lastName] = fullname.split(" ");


    useEffect(() => {
        if(user && user!.id){
            setUserForm({
                fname: firstName,
                lname: lastName,
                email: user!.email,
                phone: user!.phone,
                password: "",
                confirmPassword: ""
            })
        }
    }, [user]);


        useEffect(() => {
            console.log("Or --> ", organisation);
        if(organisation && organisation!.id){
            setOrgForm({
                name: organisation?.name|| "",
                description: organisation?.description|| "",
                country: organisation?.country|| "",
                region: organisation?.region|| "",
                email: organisation?.email|| "",
                phone: organisation?.phone|| "",
            })
        }
    }, [organisation])




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


    const handleUpdateProfile = async (): Promise<boolean> => {
        console.log("Form submitted --> ", userForm);

        const { hasErrors, formErrors, data } = validateProfileUpdate(userForm);
        setError(formErrors);

        if (hasErrors) {
            console.log("Validation errors:", formErrors);
            return false;
        }

        // Call store to update profile
        const result = await updateProfile(data);
        showToast(result);

        if (result.type === "success") {
            console.log("Profile updated successfully");
            return true;
        } else {
            console.log("Update failed:", result);
            return false;
        }
    };


    // Validate user data (don't submit yet, just validate)
    const handleUserData = (): boolean => {
        console.log("Step 1: Validating user data --> ", userForm);

        const { hasErrors, formErrors  } = validateUser(userForm);
        setError(formErrors);

        if (hasErrors) {
            console.log("User validation errors:", formErrors);
            return false;
        }

        console.log("✅ User data valid, proceeding to step 2");
        return true;
    };


    // Validate org data + submit both user and org together
    const handleOrgData = async (): Promise<boolean> => {
        console.log("Step 2: Validating org data --> ", orgForm);

        // Validate user data again (in case they went back and changed it)
        const { hasErrors: userHasErrors, userData } = validateUser(userForm);
        if (userHasErrors) {
            console.log("User data invalid on final submit");
            showToast({
                type: 'error',
                message: 'Please check your personal details'
            });
            return false;
        }

        // Validate organisation data
        const { hasErrors, formErrors, trimmedData } = validateOrganisation(orgForm);
        setOrgErrors(formErrors);

        if (hasErrors) {
            console.log("Organisation validation errors:", formErrors);
            return false;
        }

        // ✅ Both validated - now register with BOTH datasets
        console.log("✅ Both forms valid, submitting registration...");
        const toastMessage: ToastMessage = await resgister(userData, trimmedData);
        
        showToast(toastMessage);

        return toastMessage.type === "success";
    };

    const handleUpdateOrganisation = async (): Promise<boolean> => {
        console.log("Organisation Update Form --> ", orgForm);

        // Simple validation — only required: name and email
        const newErrors: any = {};
        if (!orgForm.name.trim()) newErrors.name = true;
        if (!orgForm.email.trim()) newErrors.email = true;
        if (orgForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orgForm.email)) {
            newErrors.email = true;
        }

        setOrgErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            console.log("Validation failed:", newErrors);
            return false;
        }

        const result = await updateOrganisation(orgForm);
        showToast(result);

        if (result.type === "success") {
            console.log("Organisation updated successfully");
            // Optionally refetch user to get fresh org data
            // await getCurrentUser();
            return true;
        } else {
            console.log("Update failed:", result);
            return false;
        }
    };
    




    return { 
        userForm, 
        errors,
        
        orgForm,
        orgErrors,
        
        handleChange,
        handleOrgChange,
        
        handleUpdateProfile,
        handleUserData,
        handleOrgData,

        handleUpdateOrganisation
    }


}