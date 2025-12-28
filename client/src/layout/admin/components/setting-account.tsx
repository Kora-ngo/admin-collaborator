import { Button } from "../../../components/widgets/button";

const SettingAccount = () => {
    return ( 
        <>
        <div className="relative border rounded-md border-gray-200 p-4">
            {/* Edit button */}
            <div className="absolute top-4 right-4">
            <Button variant="link">Edit</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <p className="text-sm font-semibold text-gray-400">First Name</p>
                <p className="text-lg font-medium">Tchaptche</p>
            </div>

            <div>
                <p className="text-sm font-semibold text-gray-400">Last Name</p>
                <p className="text-lg font-medium">Morel</p>
            </div>

            <div>
                <p className="text-sm font-semibold text-gray-400">Email</p>
                <p className="text-lg font-medium">mtchaptche@gmail.com</p>
            </div>

            <div>
                <p className="text-sm font-semibold text-gray-400">Phone Number</p>
                <p className="text-lg font-medium">(+237) 655541107</p>
            </div>

            <div>
                <p className="text-sm font-semibold text-gray-400">Role</p>
                <p className="text-lg font-medium">Admin</p>
            </div>
            </div>
        </div>
        </>

     );
}
 
export default SettingAccount;