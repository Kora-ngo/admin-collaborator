import { Button } from "../../../../components/widgets/button";

interface AccountViewProps {
    onToggle: () => void;
}


const AccountView: React.FC<AccountViewProps> = ({onToggle}) => {
    return ( 
    
        <div className="relative border rounded-md border-gray-200 p-4">
            {/* Edit button */}
            <div className="absolute top-4 right-4">
            <Button variant="link" onClick={onToggle}>Edit</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <p className="text-sm font-semibold text-gray-400">First Name</p>
                <p className="text-md font-medium">Tchaptche</p>
            </div>

            <div>
                <p className="text-sm font-semibold text-gray-400">Last Name</p>
                <p className="text-md font-medium">Morel</p>
            </div>

            <div>
                <p className="text-sm font-semibold text-gray-400">Email</p>
                <p className="text-md font-medium">mtchaptche@gmail.com</p>
            </div>

            <div>
                <p className="text-sm font-semibold text-gray-400">Phone Number</p>
                <p className="text-md font-medium">(+237) 655541107</p>
            </div>

            <div>
                <p className="text-sm font-semibold text-gray-400">Role</p>
                <p className="text-md font-medium">Admin</p>
            </div>
            </div>
        </div>
        
     );
}
 
export default AccountView;