import { Button } from "../../../components/widgets/button";
import { Input } from "../../../components/widgets/input";
import { Label } from "../../../components/widgets/label";

interface OrganisationFormProps {
    onToggle: () => void;
}


const OrganisationForm: React.FC<OrganisationFormProps> = ({onToggle}) => {


        const handleCancel = () => {
        // Reste to the default data
        //...
        onToggle();
    }


    return ( 
        <div className="py-1 h-[60vh] flex flex-col">
            <h1 className="text-md font-semibold text-gray-400 mb-4">Edit Organisation</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Organisation Name</Label>
                        <Input
                            id="name"
                            maxLength={50}
                            name="name"
                            type="text"
                            placeholder="E.g NGO Solutions Ltd"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone" required={false}>Organisation's Phone</Label>
                        <Input
                            prefix="+237"
                            id="phone"
                            maxLength={50}
                            name="phone"
                            type="text"
                            placeholder="XXX - XXX - XXX"
                            prefixElement={<label className="text-primary">(+237) |</label>}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="country" required={false}>Country</Label>
                        <Input
                            id="country"
                            maxLength={50}
                            name="country"
                            type="text"
                            placeholder="Organisation's Country"
                        />
                    </div>


                    <div className="grid gap-2">
                        <Label htmlFor="region" required={false}>Region</Label>
                        <Input
                            id="region"
                            maxLength={50}
                            name="region"
                            type="text"
                            placeholder="Organisation's region /headquarter region"
                        />
                    </div>





                </div>

                {/* Buttons pinned to bottom */}
                <div className="flex justify-end space-x-4 mt-auto pt-6">
                    <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                    <Button>Update</Button>
                </div>
        
        </div>
     );
}
 
export default OrganisationForm;