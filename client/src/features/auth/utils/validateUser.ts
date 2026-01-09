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


export const validateLogin = (userForm: {
    email: string,
    password: string;
}) => {
    
    const errors = {
        email: !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(userForm.email),
        password: userForm.password.length === 0,
    }

    const hasErrors = Object.values(errors).some(Boolean);
    return {hasErrors, formErrors: errors, userData: userForm}
}


// NEW: For profile update — password is OPTIONAL
export const validateProfileUpdate = (form: {
    fname?: string;
    lname?: string;
    email?: string;
    phone?: string;
    currentPassword?: string;
    password?: string;
    confirmPassword?: string;
}) => {
    const errors: any = {};

    // Only validate provided fields
    if (form.fname !== undefined && form.fname.trim() === "") {
        errors.name = true;
    }


    if (form.lname !== undefined && form.lname.trim() === "") {
    errors.name = true;
    }

    if (form.email !== undefined) {
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) {
            errors.email = true;
        }
    }

    if (form.phone !== undefined && form.phone.trim() === "") {
        errors.phone = true;
    }

    // If new password is provided → validate it + confirm + require currentPassword
    if (form.password || form.confirmPassword) {
        if (!form.currentPassword || form.currentPassword.length === 0) {
            errors.currentPassword = true;
        }
        if (form.password && form.password.length < 6) {
            errors.password = true;
        }
        if (form.password !== form.confirmPassword) {
            errors.confirmPassword = true;
        }
    }

    const hasErrors = Object.values(errors).some(Boolean);

    // Only send non-empty fields to backend
    const data: any = {};
    if (form.fname !== undefined && form.lname !== undefined) data.name = `${form.fname.trim()} ${form.lname.trim()}`;
    if (form.email !== undefined) data.email = form.email.trim().toLowerCase();
    if (form.phone !== undefined) data.phone = form.phone.trim() || null;
    if (form.currentPassword) data.currentPassword = form.currentPassword;
    if (form.password) data.password = form.password;

    return { hasErrors, formErrors: errors, data };
};