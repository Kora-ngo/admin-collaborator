import { useEffect } from "react";
import { Button } from "../../../components/widgets/button";
import { useAuthStore } from "../store/authStore";

interface AccountViewProps {
    onToggle: () => void;
}


const AccountView: React.FC<AccountViewProps> = ({onToggle}) => {

    const {user, role} = useAuthStore();

    useEffect(() => {
        console.log("This is the user -->", user);
    }, [user])


    const fullname = user!.name;
    const [firstName, lastName] = fullname.split(" ");



    return ( 
    
        <div className="relative border rounded-md border-gray-200 p-4">
            {/* Edit button */}
            <div className="absolute top-4 right-4">
            <Button variant="link" onClick={onToggle}>Edit</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <p className="text-sm font-semibold text-gray-400">First Name</p>
                <p className="text-md font-medium">{firstName}</p>
            </div>

            <div>
                <p className="text-sm font-semibold text-gray-400">Last Name</p>
                <p className="text-md font-medium">{lastName}</p>
            </div>

            <div>
                <p className="text-sm font-semibold text-gray-400">Email</p>
                <p className="text-md font-medium">{user!.email}</p>
            </div>

            <div>
                <p className="text-sm font-semibold text-gray-400">Phone Number</p>
                <p className="text-md font-medium">{user!.phone ? user!.phone : "--"}</p>
            </div>

            <div>
                <p className="text-sm font-semibold text-gray-400">Role</p>
                <p className="text-md font-medium">{role.charAt(0).toUpperCase() + role.slice(1)}</p>
            </div>
            </div>
        </div>
        
     );
}
 
export default AccountView;