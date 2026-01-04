import { useEffect, useState } from "react";
import { useMembershipStore } from "../../users/store/membershipStore";

export const useCollaboratorSelect = () => {

    const {data, getData} = useMembershipStore();

    useEffect(() => {
        getData(1, "", "all");
        console.log("Hello world --> ", data);
    }, [getData])

    // const allCollaborators = [
    //     { id: 1, name: 'Morel D. (Enumerator)' },
    //     { id: 2, name: 'Alice J. (Collaborator)' },
    //     { id: 3, name: 'Bob S. (Collaborator)' },
    //     { id: 4, name: 'Carol W. (Enumerator)' },
    //     { id: 5, name: 'David B. (Collaborator)' },
    //     { id: 6, name: 'Eve D. (Enumerator)' },
    // ];
    
    // Handle the multiple seleceted tags for collaborators
    const [selectedCollaborator, setSelectedCollaborator] = useState<typeof data>([]);

    const handleAddColl = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if(!value) return;
    
        const collaborator = data.find(c => c.id === Number(value));
        if (collaborator && !selectedCollaborator.some(s => s.id === collaborator.id)) {
            setSelectedCollaborator([...selectedCollaborator, collaborator]);
        }

        console.log("Collaborator --> ", selectedCollaborator);

        e.target.value = '';
    };

    const handleRemoveColl = (id: number) => {
        setSelectedCollaborator(selectedCollaborator.filter(c => c.id !== id));
     }; 

     const handleClearAllColl = () => {
        setSelectedCollaborator([]);
     };

     // exclude already selected
    const availableOptions = data.filter(
        c => !selectedCollaborator.some(s => s.id === c.id)
    );


    return {
        selectedCollaborator,
        availableOptions,

        handleAddColl,
        handleRemoveColl,
        handleClearAllColl
    }
} 