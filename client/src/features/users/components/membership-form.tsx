import { useEffect } from "react";
import { useMembership } from "../hooks/useMember";
import { Label } from "../../../components/widgets/label";
import { Input } from "../../../components/widgets/input";
import { SelectInput } from "../../../components/widgets/select-input";
import { Button } from "../../../components/widgets/button";
import { useMembershipStore } from "../store/membershipStore";
import PhoneInput from "../../../components/widgets/phone-input";

interface MembershipFormProps {
    id: number | undefined,
    isOpen: boolean,
    onSuccess: () => void
}

const MembershipForm = ({ onSuccess, isOpen, id }: MembershipFormProps) => {

    const { form, errors, setForm, handleView, handleClearForm, handleSubmit, emailStatus, emailChecking, handleEmailChange } = useMembership();
    const { loading } = useMembershipStore();

    // Block save if email is actively taken
    const isEmailBlocked = emailStatus?.type === "error";


    useEffect(() => {
        if (id){
            handleView(id);
        }
    }, [id]);

    useEffect(() => {
        if(isOpen) {
            handleClearForm();
        }
    }, [isOpen]);

    const handleValidate = async () => {
        const success = await handleSubmit(id);
        if(success){
            onSuccess();
        }
    }

    const isEdit = !!id;

    return ( 
        
      <div className="flex flex-col justify-between w-full h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {!isEdit && (
                    <>
                        {/* Email */}
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="email">User Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="user@example.com"
                                autoComplete="new-password"
                                autoSave="off"
                                autoCorrect="off"
                                value={form.email || ""}
                                onChange={(e) => handleEmailChange(e.target.value)}
                                hasError={errors.email || emailStatus?.type === "error"}
                            />

                            {/* Checking spinner */}
                            {emailChecking && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <svg className="size-3.5 flex-shrink-0" fill="hsl(228, 97%, 42%)" viewBox="0 0 24 24">
                                        <path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z">
                                            <animateTransform attributeName="transform" type="rotate" dur="0.75s" values="0 12 12;360 12 12" repeatCount="indefinite"/>
                                        </path>
                                    </svg>
                                    Checking availability...
                                </div>
                            )}

                            {!emailChecking && emailStatus?.type === "success" && (
                                <div className="flex items-center gap-1.5 text-xs text-green-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3.5 flex-shrink-0">
                                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.06-1.06l-3.713 3.712-1.508-1.508a.75.75 0 0 0-1.06 1.061l2.038 2.039a.75.75 0 0 0 1.06 0l4.243-4.244Z" clipRule="evenodd" />
                                    </svg>
                                    Email is available
                                </div>
                            )}

                            {!emailChecking && emailStatus?.type === "error" && (
                                <div className="flex items-center gap-1.5 text-xs text-red-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3.5 flex-shrink-0">
                                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
                                    </svg>
                                    This email is already registered on the platform
                                </div>
                            )}

                            {!emailChecking && emailStatus?.type === "warning" && (
                                <div className="flex items-start gap-1.5 text-xs text-amber-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3.5 flex-shrink-0 mt-0.5">
                                        <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                                    </svg>
                                    <span>
                                        A deactivated account with this email exists in your organisation.
                                        Proceeding will reassign it to this new member entry.
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Name */}
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="name">User Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                autoComplete="new-password"
                                value={form.name || ""}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                hasError={errors.name}
                            />
                        </div>

                        {/* Phone - updated to PhoneInput */}
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="phone" required={false}>Phone</Label>
                            <PhoneInput
                                value={form.phone || ""}
                                defaultCountryCode="CM"
                                onChange={(fullPhone) =>
                                    setForm({ ...form, phone: fullPhone })
                                }
                            />
                        </div>

                        {/* Password */}
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                placeholder=""
                                value={form.password || ""}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                hasError={errors.password}
                            />
                        </div>
                    </>
                )}

                {/* Role */}
                <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <SelectInput
                        options={[
                            { label: "Select role...", value: "" },
                            { label: "Collaborator", value: "collaborator" },
                            { label: "Enumerator", value: "enumerator" },
                        ]}
                        value={form.role}
                        hasError={errors.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value as "" | "admin" | "collaborator" | "enumerator" })}
                    />
                </div>
            </div>

            <div className="border-t-1 border-gray-200">
                <div className="my-4 flex gap-4 justify-end">
                    {/* Lock button if email is taken */}
                    {isEmailBlocked ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed select-none">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                            </svg>
                            {id ? "Update" : "Save"}
                        </div>
                    ) : (
                        <Button onClick={handleValidate} loading={loading}>
                            {id ? "Update" : "Save"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
 
export default MembershipForm;