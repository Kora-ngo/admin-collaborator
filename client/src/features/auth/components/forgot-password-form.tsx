import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/widgets/button";
import { Input } from "../../../components/widgets/input";
import { Label } from "../../../components/widgets/label";
import { useForgotPassword } from "../hooks/useForgotPassword";

const ForgotPasswordForm = () => {
    const navigate = useNavigate();
    const { form, errors, loading, handleChange, handleSubmit } = useForgotPassword();


    const handleReset = async () => {
        const success = await handleSubmit();
        
        if (success) {
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/');
            }, 2000);
        }
    };

    return ( 
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    maxLength={50}
                    name="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={form.email}
                    onChange={handleChange}
                    hasError={errors.email}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                    id="newPassword"
                    maxLength={30}
                    name="newPassword"
                    type="password"
                    placeholder="••••••"
                    value={form.newPassword}
                    onChange={handleChange}
                    hasError={errors.newPassword}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                   id="confirmPassword"
                    maxLength={30}
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    hasError={errors.confirmPassword}
                />
            </div>
            <div className="">
                <div className="flex gap-2">
                    <Button type="button" loading={loading} onClick={handleReset} >
                         Update Password
                    </Button>
                    <Button type="button" variant="ghost" loading={loading} onClick={() => navigate('/')}>
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
 );
}
 
export default ForgotPasswordForm;