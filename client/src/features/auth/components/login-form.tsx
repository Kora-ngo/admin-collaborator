import { Link } from "react-router-dom";
import { Button } from "../../../components/widgets/button";
import { Input } from "../../../components/widgets/input";
import { Label } from "../../../components/widgets/label";
import { useLogin } from "../hooks/useLogin";

const LoginForm = () => {

    const {form, errors, handleChange, handleUserLogin} = useLogin();

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
                    value={form.email}
                    hasError={errors.email}
                    onChange={handleChange}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    maxLength={30}
                    name="password"
                    type="password"
                    value={form.password}
                    hasError={errors.password}
                    onChange={handleChange}
                />
            </div>
            <div className="">
                <div className="py-2">
                    <p className="text-sm font-semibold">I agree with the <span className="text-primary underline cursor-pointer">term and conditions</span></p>
                </div>
                <div className="flex gap-2">
                    <Button type="button" onClick={handleUserLogin}>
                         Login
                    </Button>
                    <Link to="/forgot-password">
                        <Button type="button" variant="ghost">
                            Forgot Password ?
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
     );
}
 
export default LoginForm;