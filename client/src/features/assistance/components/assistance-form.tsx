import { Button } from "../../../components/widgets/button";
import { Input } from "../../../components/widgets/input";
import { Label } from "../../../components/widgets/label";
import { SelectInput } from "../../../components/widgets/select-input";
import { Textarea } from "../../../components/widgets/textarea";
import { useAssis } from "../hooks/useAssis";

const AssistanceForm = () => {

    const {form, errors, handleChange, handleSubmit} = useAssis();

    return ( 
        <div className="flex flex-col justify-between w-full h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">Assistance Name</Label>
                    <Input
                        id="name"
                        maxLength={50}
                        name="name"
                        type="text"
                        placeholder="Enter the assiantce name"
                        value={form.name}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <SelectInput
                        id="type"
                        name="type"
                        options={[
                            { label: "Monetary", value: "monetary" },
                            { label: "In-Kind", value: "inkind" },
                        ]}
                        // prefixElement={<DollarIcon className="w-4 h-4" />}
                        hasError={errors.assistance_id}
                        value={form.assistance_id}
                        // onChange={handleChange}
                    />
                </div>

                <div className="w-md">
                    <Label htmlFor="description" required={false}>Description</Label>
                    <Textarea 
                    id="description"
                    name="description"
                    value={form.description}
                    // onChange={handleChange}
                    rows={2}  />
                </div>
            </div>   


            <div className="border-t-1 border-gray-200">
                <div className="my-4 flex gap-4 justify-end">
                    <Button>
                        Save
                    </Button>

                </div>
            </div>     
        </div>

     );
}
 
export default AssistanceForm;