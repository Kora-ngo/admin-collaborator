// features/auth/hooks/useForgotPassword.ts

import { useState } from 'react';
import { useToastStore } from '../../../store/toastStore';
import { useAuthStore } from '../store/authStore';

export const useForgotPassword = () => {
    const { loading, resetPassword } = useAuthStore();
    const showToast = useToastStore(state => state.showToast);

    const [form, setForm] = useState({
        email: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({
        email: false,
        newPassword: false,
        confirmPassword: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        setForm(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [name]: false
            }));
        }
    };

    const handleSubmit = async (): Promise<boolean> => {
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const newErrors = {
            email: !emailRegex.test(form.email.trim()),
            newPassword: form.newPassword.trim().length < 6,
            confirmPassword: form.confirmPassword !== form.newPassword
        };

        setErrors(newErrors);

        // Show specific error messages
        if (newErrors.email) {
            showToast({
                type: 'error',
                message: 'Invalid email format'
            });
            return false;
        }

        if (newErrors.newPassword) {
            showToast({
                type: 'error',
                message: 'Password must be at least 6 characters'
            });
            return false;
        }

        if (newErrors.confirmPassword) {
            showToast({
                type: 'error',
                message: 'Passwords do not match'
            });
            return false;
        }

        // Submit
        const result = await resetPassword(
            form.email.trim(),
            form.newPassword,
            form.confirmPassword
        );

        showToast(result);

        if (result.type === 'success') {
            // Clear form
            setForm({
                email: '',
                newPassword: '',
                confirmPassword: ''
            });
            return true;
        }

        return false;
    };

    return {
        form,
        errors,
        loading,
        handleChange,
        handleSubmit
    };
};