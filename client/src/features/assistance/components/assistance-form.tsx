import { useEffect, useState } from "react";
import { Button } from "../../../components/widgets/button";
import { Input } from "../../../components/widgets/input";
import { Label } from "../../../components/widgets/label";
import { SelectInput } from "../../../components/widgets/select-input";
import { Textarea } from "../../../components/widgets/textarea";
import { useAssis } from "../hooks/useAssis";
import { useAssistanceTypeStore } from "../store/assistanceTypeStore";

interface AssistanceFormProps {
    id: number,
    isOpen: boolean,
    onClose: () => void
}

const AssistanceForm = ({onClose, isOpen, id}: AssistanceFormProps) => {

    const {form, setForm, errors, handleChange, handleSubmit, handleView, handleClearForm} = useAssis();
    const {data} = useAssistanceTypeStore();
    const [selectedType, setSelectedType] = useState<number>(0);

      useEffect(() => {
        const handleFetch = async () => {
          if (!id) return;
          handleView(id);
        };
    
        handleFetch();
      }, [id]);


      useEffect(() => {
        if(!isOpen){
            console.log("Clear form");
            handleClearForm();
        }
      }, [isOpen])

    const handleValide = async () => {
        let isDone = await handleSubmit(id);
        if(isDone){
            onClose();
        }
    }


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
                        hasError={errors.name}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <SelectInput
                        id="type"
                        name="type"
                        options={[
                            {label: "Select a type...", value: 0},
                            ...data.map((t) => ({ label: `${t.name} (${t.unit})`, value: t.id} )),
                        ]}
                        // prefixElement={<DollarIcon className="w-4 h-4" />}
                        hasError={errors.assistance_id}
                        value={id ? form.assistance_id : selectedType}
                        onChange={(e) => {
                            const selectedValue = e.target.value;
                            setSelectedType(parseInt(selectedValue));
                            setForm({
                                ...form,
                                assistance_id: parseInt(selectedValue)
                            });
                        }}
                    />
                </div>

                <div className="w-md">
                    <Label htmlFor="description" required={false}>Description</Label>
                    <Textarea 
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                      />
                </div>
            </div>   


            <div className="border-t-1 border-gray-200">
                <div className="my-4 flex gap-4 justify-end">
                    <Button onClick={handleValide}>
                        {id ? "Update" : "Save"}
                    </Button>

                    {/* <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button> */}

                </div>
            </div>     
        </div>

     );
}
 
export default AssistanceForm;