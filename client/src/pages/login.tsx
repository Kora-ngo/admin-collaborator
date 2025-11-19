import { Button } from "../components/widgets/button";
import { Input } from "../components/widgets/input";
import { Label } from "../components/widgets/label";

const Login = () => {
    return ( 
        <div className="p-5 flex gap-4">
            This is the login
            <Label>Name please</Label>
            <Button children="Hello World" /><br />
            <Input />
            <p>Hello World</p>
            <div className="w-80">
            </div>
        </div>
     );
}
 
export default Login;