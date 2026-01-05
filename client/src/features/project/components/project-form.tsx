import { useEffect } from "react";
import { Button } from "../../../components/widgets/button";
import { Input } from "../../../components/widgets/input";
import { Label } from "../../../components/widgets/label";
import Tag from "../../../components/widgets/tag";
import { Textarea } from "../../../components/widgets/textarea";
import { SelectInput } from "../../../components/widgets/select-input";
import { useAssitanceSelect } from "../hooks/useAssitanceSelect";
import { useCollaboratorSelect } from "../hooks/useCollaboratorSelect";
import { useProject } from "../hooks/useProject";

interface ProjectFormProps {
    id: number | any,
    isOpen: boolean,
    onSuccess: () => void
}

const ProjectForm = ({onSuccess, isOpen, id}: ProjectFormProps) => {

    const {
        selectedEnumerators,
        availableEnumerators,
        handleAddEnumerator,
        handleRemoveEnumerator,
        handleClearAllEnumerators,
        collaborators,
        selectedCollaborator,
        handleSelectCollaborator
    } = useCollaboratorSelect();

    const {selectedAssistance, availableAssisOptions, handleAddAssistance, handleRemoveAssistance, handleClearAllAssistance} = useAssitanceSelect();
    
    const {errors, projectForm, handleChange, handleSubmit, updateSelectedMembers, updateSelectedAssitance} = useProject();

    // Update members whenever enumerators or collaborator changes
    useEffect(() => {
        updateSelectedMembers(selectedEnumerators, selectedCollaborator);
    }, [selectedEnumerators, selectedCollaborator]);

    useEffect(() => {
        updateSelectedAssitance(selectedAssistance);
    }, [selectedAssistance]);

    const handleValidate = async () => {
        const isValid = await handleSubmit(id);
        if(isValid){
            onSuccess();
        }
    }
    
    return ( 
        <div className="flex flex-col justify-between w-full h-full">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">Title</Label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Name of the project"
                        value={projectForm.name}
                        onChange={handleChange}
                        hasError={errors.name}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="description" required={false}>Description</Label>
                    <Textarea 
                        id="description"
                        name="description"
                        placeholder="Short overview"
                        rows={2}
                        value={projectForm.description}
                        onChange={handleChange}
                    />
                </div>

                {/* Single Collaborator Selection */}
                <div className="grid gap-2">
                    <Label htmlFor="collaborator">Project Lead (Collaborator)</Label>
                    <SelectInput
                        id="collaborator"
                        options={[
                            { label: "Select a collaborator...", value: 0 },
                            ...collaborators.map(collab => ({
                                label: `${collab.user?.name}`,
                                value: collab.id
                            }))
                        ]}
                        value={selectedCollaborator}
                        hasError={errors.selectedCollaborator}
                        onChange={(e) => handleSelectCollaborator(e.target.value)}
                    />
                </div>
                
                {/* Multiple Enumerators Selection */}
                <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                        <Label required>Enumerators</Label>

                        <select
                            onChange={handleAddEnumerator}
                            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            defaultValue=""
                        >
                            <option value="" disabled>
                                Add Enumerators...
                            </option>
                            {availableEnumerators.map(enum_ => (
                                <option key={enum_.id} value={enum_.id}>
                                    {enum_.user?.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tags Container - Scrollable */}
                    <div className="w-full min-h-20 max-h-32 overflow-y-auto p-3 rounded-md border border-gray-200 bg-gray-50">
                        {selectedEnumerators.length === 0 ? (
                            <>
                                {
                                    errors.selectedMembers ? 
                                    <p className="text-sm text-red-500 font-bold">Enumerators required</p> :
                                    <p className="text-sm text-gray-500">No enumerator selected</p>
                                }
                            </>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {selectedEnumerators.map(enum_ => (
                                    <Tag 
                                        key={enum_.id}
                                        label={enum_.user?.name || ''} 
                                        onRemove={() => handleRemoveEnumerator(enum_.id)} 
                                    />
                                ))}

                                {/* Clear All Button - only show if there are tags */}
                                {selectedEnumerators.length > 1 && (
                                    <button
                                        onClick={handleClearAllEnumerators}
                                        className="text-xs text-red-600 hover:text-red-800 underline ml-2 self-center"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Assistances Selection */}
                <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                        <Label required={false}>Assistance</Label>

                        <select
                            onChange={handleAddAssistance}
                            className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                            defaultValue=""
                        >
                            <option value="" disabled>
                                Add assistance...
                            </option>
                            {availableAssisOptions.map(person => (
                                <option key={person.id} value={person.id}>
                                    {person.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full min-h-20 max-h-32 overflow-y-auto p-3 rounded-md border border-gray-200 bg-gray-50">
                        {selectedAssistance.length === 0 ? (
                            <p className="text-sm text-gray-500">No assistance selected</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {selectedAssistance.map(assistance => (
                                    <Tag 
                                        key={assistance.id}
                                        label={assistance.name} 
                                        onRemove={() => handleRemoveAssistance(assistance.id!)} 
                                    />
                                ))}

                                {selectedAssistance.length > 1 && (
                                    <button
                                        onClick={handleClearAllAssistance}
                                        className="text-xs text-red-600 hover:text-red-800 underline ml-2 self-center"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Date Fields */}
                <div className="grid gap-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="start_date">Start Date</Label>
                            <Input
                                id="start_date"
                                name="start_date"
                                type="date"
                                value={projectForm.start_date?.toString()}
                                onChange={handleChange}
                                hasError={errors.start_date}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="end_date">End Date</Label>
                            <Input
                                id="end_date"
                                name="end_date"
                                type="date"
                                value={projectForm.end_date?.toString()}
                                onChange={handleChange}
                                hasError={errors.end_date}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t-1 border-gray-200 mt-8">
                <div className="my-4 flex gap-4 justify-end">
                    <Button onClick={handleValidate}>
                        {id ? "Update" : "Save"}
                    </Button>
                </div>
            </div>             
        </div>
    );
}
 
export default ProjectForm;