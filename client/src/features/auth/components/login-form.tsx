import { Button } from "../../../components/widgets/button";
import { Input } from "../../../components/widgets/input";
import { Label } from "../../../components/widgets/label";

const LoginForm = () => {
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
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    maxLength={30}
                    name="password"
                    type="password"
                />
            </div>
            <div className="">
                <div className="py-2">
                    <p className="text-sm font-semibold">I agree with the <span className="text-primary underline cursor-pointer">term and conditions</span></p>
                </div>
                <div className="flex gap-2">
                    <Button type="button">
                         Login
                    </Button>
                    <Button type="button" variant="ghost">
                         Forgot Password ?
                    </Button>
                </div>
            </div>
        </div>
     );
}
 
export default LoginForm;