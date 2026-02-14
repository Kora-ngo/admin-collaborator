import { useState } from "react";
import { Button } from "../../../components/widgets/button";
import TypeView from "./type-view";
import TypeForm from "./type-form";
import { useAssistance } from "../hooks/useAssistance";
import { useAssistanceTypeStore } from "../store/assistanceTypeStore";

const Type = () => {
        const [toggle, setToggle] = useState<'view' | 'add'>('view');
        const {
    types,
    typeErrors,
    setTypes,
    addNewType,
    removeType,
    handleTypeChange,
    handleTypeSubmit,
  } = useAssistance();

  const {fetchData} = useAssistanceTypeStore();


    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if(toggle === 'view'){
            setTypes([{ id: "1", name: "", unit: "" }]);
            setToggle('add');
            return;
        }else{
            const isDone = await handleTypeSubmit();
            if(isDone){
                setToggle('view');
                await fetchData();
            }
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