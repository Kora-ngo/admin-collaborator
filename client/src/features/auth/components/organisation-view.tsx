import { useEffect } from "react";
import { Button } from "../../../components/widgets/button";
import { useAuthStore } from "../store/authStore";

interface OrganisationViewProps {
    onToggle: () => void;
}




const OrganisationView: React.FC<OrganisationViewProps> = ({onToggle}) => {

        const {organisation} = useAuthStore();

        useEffect(() => {
            console.log("This is the org -->", organisation);
        }, [organisation]);


    return ( 
        <div className="relative border rounded-md border-gray-200 p-4">
            {/* Edit button */}
            <div className="absolute top-4 right-4">
            <Button variant="link" onClick={onToggle}>Edit</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <p className="text-sm font-semibold text-gray-400">Name</p>
                <p className="text-md font-medium">{organisation?.name}</p>
            </div>

            <div>
                <p className="text-sm font-semibold text-gray-400">Email</p>
                <p className="text-md font-medium">{organisation?.email}</p>
            </div>

            <div>
                <p className="text-sm font-semibold text-gray-400">Phone</p>
                <p className="text-md font-medium">{organisation?.phone}</p>
            </div>

            <div>
                <p className="text-sm font-semibold text-gray-400">Country</p>
                <p className="text-md font-medium">{organisation?.country}</p>
            </div>

            <div>
                <p className="text-sm font-semibold text-gray-400">Region</p>
                <p className="text-md font-medium">{organisation?.region}</p>
            </div>
            </div>
        </div>
     );
}
 
export default OrganisationView;