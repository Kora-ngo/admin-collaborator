import { Button } from "../../../components/widgets/button";
import { Input } from "../../../components/widgets/input";
import { Label } from "../../../components/widgets/label";

const ForgotPasswordForm = () => {

    return ( 
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    maxLength={30}
                    name="email"
                    type="email"
                    placeholder="example@gmail.com"
                />
            </div>
            <div className="">
                <div className="flex gap-2">
                    <Button type="button">
                         Verify Email
                    </Button>
                    <Button type="button" variant="ghost">
                         Cancel
                    </Button>
                </div>
            </div>
        </div>
 );
}
 
export default ForgotPasswordForm;