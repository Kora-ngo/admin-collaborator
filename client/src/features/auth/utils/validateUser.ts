export const validateUser = (userForm: {
    fname: string;
    lname: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
}) => {

    const errors = {    
        fname: userForm.fname.trim() === "",
        lname: userForm.lname.trim() === "",
        email: !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(userForm.email),
        phone: userForm.phone.trim() === "",
        password: userForm.password.length < 4,
        confirmPassword: userForm.password !== userForm.confirmPassword
    };

    const trimmedData = {
        name: `${userForm.fname.trim()} ${userForm.lname.trim()}`,
        email: userForm.email,
        phone: userForm.phone.trim(),
        password: userForm.password.trim()
    };

    
    const hasErrors = Object.values(errors).some(Boolean);
    return {hasErrors, formErrors: errors, userData: trimmedData};
}


export const validateOrganisation = (orgForm: {
        name: string,
        description: string,
        country: string,
        region: string,
        email: string,
        phone: string,
}) => {
    const errors = {
        name: orgForm.name.trim() === "",
        email: !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(orgForm.email),
    }

    const trimmedData = {
        name: orgForm.name.trim(),
        email: orgForm.email,
        description: orgForm.description ? orgForm.description.trim() : "",
        country: orgForm.country ? orgForm.country.trim() : "",
        region: orgForm.region ? orgForm.region.trim() : "",
        phone: orgForm.phone ? orgForm.phone.trim() : "",
    }

    const hasErrors = Object.values(errors).some(Boolean);
    return {hasErrors, formErrors: errors, trimmedData}
}