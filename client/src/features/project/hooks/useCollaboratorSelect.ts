import { useState } from "react";

export const useCollaboratorSelect = () => {

    const allCollaborators = [
        { id: 1, name: 'Morel D. (Enumerator)' },
        { id: 2, name: 'Alice J. (Collaborator)' },
        { id: 3, name: 'Bob S. (Collaborator)' },
        { id: 4, name: 'Carol W. (Enumerator)' },
        { id: 5, name: 'David B. (Collaborator)' },
        { id: 6, name: 'Eve D. (Enumerator)' },
    ];
    
    // Handle the multiple seleceted tags for collaborators
    const [selectedCollaborator, setSelectedCollaborator] = useState<typeof allCollaborators>([
        allCollaborators[0]
    ]);

    const handleAddColl = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if(!value) return;
    
        const collaborator = allCollaborators.find(c => c.id === Number(value));
        if (collaborator && !selectedCollaborator.some(s => s.id === collaborator.id)) {
            setSelectedCollaborator([...selectedCollaborator, collaborator]);
        }

        e.target.value = '';
    };

    const handleRemoveColl = (id: number) => {
        setSelectedCollaborator(selectedCollaborator.filter(c => c.id !== id));
     }; 

     const handleClearAllColl = () => {
        setSelectedCollaborator([]);
     };

     // exclude already selected
    const availableOptions = allCollaborators.filter(
        c => !selectedCollaborator.some(s => s.id === c.id)
    );


    return {
        allCollaborators,
        selectedCollaborator,
        availableOptions,

        handleAddColl,
        handleRemoveColl,
        handleClearAllColl
    }
} 