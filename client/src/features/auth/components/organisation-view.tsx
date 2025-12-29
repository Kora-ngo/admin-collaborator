import { Button } from "../../../components/widgets/button";

interface OrganisationViewProps {
    onToggle: () => void;
}

const OrganisationView: React.FC<OrganisationViewProps> = ({onToggle}) => {
    return ( 
        <div className="relative border rounded-md border-gray-200 p-4">
            {/* Edit button */}
            <div className="absolute top-4 right-4">
            <Button variant="link" onClick={onToggle}>Edit</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <p className="text-sm font-semibold text-gray-400">Name</p>
                <p className="text-md font-medium">Breezly</p>
            </div>

            <div>
                <p className="text-sm font-semibold text-gray-400">Email</p>
                <p className="text-md font-medium">breezly@gmail.com</p>
            </div>

            <div>
                <p className="text-sm font-semibold text-gray-400">Phone</p>
                <p className="text-md font-medium">(+237) 675320239</p>
            </div>

            <div>
                <p className="text-sm font-semibold text-gray-400">Country</p>
                <p className="text-md font-medium">Cameroon</p>
            </div>

            <div>
                <p className="text-sm font-semibold text-gray-400">Region</p>
                <p className="text-md font-medium">Yaounde</p>
            </div>
            </div>
        </div>
     );
}
 
export default OrganisationView;