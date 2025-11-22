import { Button } from "../../../components/widgets/button";
import { Input } from "../../../components/widgets/input";
import { Label } from "../../../components/widgets/label";

const ResetPasswordForm = () => {
    return ( 
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                    id="new-password"
                    maxLength={30}
                    name="new-password"
                    type="password"
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="new-password">Confirm Password</Label>
                <Input
                    id="confirm-password"
                    maxLength={30}
                    name="confirm-password"
                    type="password"
                />
            </div>
            <div className="">
                <div className="flex gap-2">
                    <Button type="button">
                         Update Password
                    </Button>
                </div>
            </div>
        </div>
     );
}
 
export default ResetPasswordForm;