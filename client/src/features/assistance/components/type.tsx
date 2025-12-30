import { useState } from "react";
import { Button } from "../../../components/widgets/button";
import TypeView from "./type-view";
import TypeForm from "./type-form";
import { useAssistance } from "../hooks/useAssistance";

const Type = () => {
        const [toggle, setToggle] = useState<'view' | 'add'>('view');
        const {
    types,
    typeErrors,
    addNewType,
    removeType,
    handleTypeChange,
    handleTypeSubmit,
  } = useAssistance();


    const handleSubmit = (e: any) => {
        e.preventDefault();
        if(toggle === 'view'){
            setToggle('add');
            return;
        }else{
            handleTypeSubmit();
            return;
        }
    }

    return ( 
        <div className="flex flex-col justify-between w-full h-full">
            {
                toggle === "view" ?
                <TypeView />:
                <TypeForm 
                types={types}
                typeErrors={typeErrors}
                addNewType={addNewType}
                removeType={removeType}
                handleTypeChange={handleTypeChange}
                />
            }
            <div className="border-t-1 border-gray-200">
                <div className="my-4 flex gap-4 justify-end">
                    <Button onClick={() => setToggle('view')} variant="ghost">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                        {toggle === "view" ? "New" : "Save"}
                    </Button>

                </div>
            </div>
        </div>
     );
}
 
export default Type;