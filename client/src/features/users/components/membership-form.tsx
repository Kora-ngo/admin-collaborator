import { useEffect } from "react";
import { useMembership } from "../hooks/useMember";
import { Label } from "../../../components/widgets/label";
import { Input } from "../../../components/widgets/input";
import { SelectInput } from "../../../components/widgets/select-input";
import { Button } from "../../../components/widgets/button";
import { useMembershipStore } from "../store/membershipStore";

interface MembershipFormProps {
    id: number | undefined,
    isOpen: boolean,
    onSuccess: () => void
}

const MembershipForm = ({ onSuccess, isOpen, id }: MembershipFormProps) => {

    const {form, errors, setForm, handleView, handleClearForm, handleSubmit} = useMembership();
    const { loading } = useMembershipStore();


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
                        <div className="grid gap-2">
                            <Label htmlFor="email">User Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="user@example.com"
                                value={form.email || ""}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                hasError={errors.email}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">User Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={form.name || ""}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                hasError={errors.name}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone" required={false}>Phone</Label>
                            <Input
                                id="phone"
                                placeholder="+123456789"
                                value={form.phone || ""}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder=""
                                value={form.password || ""}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                hasError={errors.password}
                            />
                        </div>
                    </>
                )}

                <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <SelectInput
                        options={[
                            { label: "Select role...", value: "" },
                            { label: "Admin", value: "admin" },
                            { label: "Collaborator", value: "collaborator" },
                            { label: "Enumerator", value: "enumerator" },
                        ]}
                        value={form.role || ""}
                        hasError={errors.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                    />
                </div>
            </div>

            <div className="border-t-1 border-gray-200">
                <div className="my-4 flex gap-4 justify-end">
                    <Button onClick={handleValidate} loading={loading}>
                        {id ? "Update" : "Save"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
 
export default MembershipForm;