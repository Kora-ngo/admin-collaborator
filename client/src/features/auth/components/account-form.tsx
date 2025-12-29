import { useState } from "react";
import { Input } from "../../../components/widgets/input";
import { Label } from "../../../components/widgets/label";
import { Button } from "../../../components/widgets/button";

interface AccountFormProps {
    onToggle: () => void;
}

const AccountForm: React.FC<AccountFormProps> = ({onToggle}) => {

    const [enablePassword, setEnablePassword] = useState(false);

    const handleCancel = () => {
        // Reste to the default data
        //...
        onToggle();
    }

    return ( 
        <div className="py-1 h-[60vh] flex flex-col">
            <h1 className="text-md font-semibold text-gray-400 mb-4">Edit profile</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="fname">First Name</Label>
                        <Input
                        id="fname"
                        maxLength={30}
                        name="fname"
                        type="text"
                        placeholder="E.g Frank"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="lname">Last Name</Label>
                        <Input
                        id="lname"
                        maxLength={30}
                        name="lname"
                        type="text"
                        placeholder="E.g Junior"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Personal Email</Label>
                        <Input
                        id="email"
                        maxLength={50}
                        name="email"
                        type="email"
                        placeholder="example@gmail.com"
                        disabled={true}
                        />
                    </div>


                    <div className="grid gap-2">
                        <Label htmlFor="phone">Contact Details</Label>
                        <div className="flex items-center gap-3">
                        {/* Main Phone Input - Takes remaining space */}
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="Your phone number"
                            prefixElement={<label className="text-primary">(+237) |</label>}
                        />
                        </div>
                    </div>

                    {
                        enablePassword &&

                        (
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                id="password"
                                maxLength={20}
                                name="password"
                                type="password"
                                placeholder="At least 4 characters"

                                />
                            </div>
                        )
                    }
                    
                    {/* Confirm Password */}

                    {
                        enablePassword &&
                        (
                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                id="confirmPassword"
                                maxLength={20}
                                name="confirmPassword"
                                type="password"
                                placeholder="Repeat your password"
                                />
                            </div>
                        )
                    }



                </div>

                {/* Buttons pinned to bottom */}
                <div className="flex justify-end space-x-4 mt-auto pt-6">
                    <Button variant="outline" onClick={() => setEnablePassword(!enablePassword)}>{enablePassword ? "Reset Password" : "Change Password"}</Button>
                    <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                    <Button>Update Profile</Button>
                </div>
        
        </div>
     );
}
 
export default AccountForm;