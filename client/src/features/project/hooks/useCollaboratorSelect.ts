import { useEffect, useState } from "react";
import { useMembershipStore } from "../../users/store/membershipStore";

export const useCollaboratorSelect = () => {

    const {data, getData} = useMembershipStore();

    useEffect(() => {
        getData(1, "", "all");
    }, [getData]);

    // Separate enumerators from collaborators
    const enumerators = data.filter(m => m.role === 'enumerator');
    const collaborators = data.filter(m => m.role === 'collaborator');

    // Handle multiple selected enumerators (tags)
    const [selectedEnumerators, setSelectedEnumerators] = useState<typeof data>([]);

    // Handle single selected collaborator
    const [selectedCollaborator, setSelectedCollaborator] = useState<number>(0);

    const handleAddEnumerator = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if(!value) return;
    
        const enumerator = enumerators.find(c => c.id === Number(value));
        if (enumerator && !selectedEnumerators.some(s => s.id === enumerator.id)) {
            setSelectedEnumerators([...selectedEnumerators, enumerator]);
        }


        e.target.value = '';
    };

    const handleRemoveEnumerator = (id: number) => {
        setSelectedEnumerators(selectedEnumerators.filter(c => c.id !== id));
    }; 

    const handleClearAllEnumerators = () => {
        setSelectedEnumerators([]);
    };

    const handleSelectCollaborator = (value: string) => {
        setSelectedCollaborator(Number(value));
    };

    const handleClearCollaborator = () => {
        setSelectedCollaborator(0);
    };

    // Get the full collaborator object for the selected ID
    const getSelectedCollaboratorData = () => {
        if (selectedCollaborator === 0) return null;
        return collaborators.find(c => c.id === selectedCollaborator) || null;
    };

    // Exclude already selected enumerators
    const availableEnumerators = enumerators.filter(
        e => !selectedEnumerators.some(s => s.id === e.id)
    );

    return {
        // Enumerators (multiple selection)
        selectedEnumerators,
        availableEnumerators,
        handleAddEnumerator,
        handleRemoveEnumerator,
        handleClearAllEnumerators,

        setSelectedCollaborator,
        setSelectedEnumerators,

        // Collaborators (single selection)
        collaborators,
        selectedCollaborator,
        handleSelectCollaborator,
        handleClearCollaborator,
        getSelectedCollaboratorData
    }
}