import { Button } from "../../../components/widgets/button";
import { Input } from "../../../components/widgets/input";
import { Label } from "../../../components/widgets/label";
import Tag from "../../../components/widgets/tag";
import { Textarea } from "../../../components/widgets/textarea";
import { useAssitanceSelect } from "../hooks/useAssitanceSelect";
import { useCollaboratorSelect } from "../hooks/useCollaboratorSelect";

interface ProjectFormProps {
    id: number | any,
    isOpen: boolean,
    onSuccess: () => void
}

const ProjectForm = ({onSuccess, isOpen, id}: ProjectFormProps) => {

    const {allCollaborators, availableOptions, selectedCollaborator, handleAddColl, handleRemoveColl, handleClearAllColl} = useCollaboratorSelect();
    const {selectedAssistance, availableAssisOptions, handleAddAssistance, handleRemoveAssistance, handleClearAllAssistance,} = useAssitanceSelect();
    
    return ( 
        <div className="flex flex-col justify-between w-full h-full">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">Title</Label>
                    <Input
                        id="name"
                        type="name"
                        placeholder="Name of the project"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="region"  required={false}>Target Location</Label>
                    <Input
                        id="region"
                        type="region"
                        placeholder="Region, City, discrict etc..."
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description" required={false}>Description</Label>
                    <Textarea 
                        id="description"
                        name="description"
                        placeholder="Short overview"
                        rows={2}
                    />
                </div>
                
                <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                        <Label required>Members</Label>

                        {/* Add Collaborator Select */}
                        <select
                        onChange={handleAddColl}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        defaultValue=""
                        >
                        <option value="" disabled>
                            Add Members...
                        </option>
                        {availableOptions.map(collab => (
                            <option key={collab.id} value={collab.id}>
                            {collab.name}
                            </option>
                        ))}
                        </select>
                    </div>

                    {/* Tags Container - Scrollable */}
                    <div className="w-full min-h-20 max-h-32 overflow-y-auto p-3 rounded-md border border-gray-200 bg-gray-50">
                        {selectedCollaborator.length === 0 ? (
                        <p className="text-sm text-gray-500">No member selected</p>
                        ) : (
                        <div className="flex flex-wrap gap-2">
                            {selectedCollaborator.map(collab => (
                                <Tag label={collab.name} onRemove={() => handleRemoveColl(collab.id)} />
                            ))}

                            {/* Clear All Button - only show if there are tags */}
                            {selectedCollaborator.length > 1 && (
                            <button
                                onClick={handleClearAllColl}
                                className="text-xs text-red-600 hover:text-red-800 underline ml-2 self-center"
                            >
                                Clear all
                            </button>
                            )}
                        </div>
                        )}
                    </div>
                </div>

                <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                        <Label required>Assistance</Label>

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
                                <Tag label={assistance.name} onRemove={() => handleRemoveColl(assistance.id)} />
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

                <div className="grid gap-2">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="grid gap-2">
                            <Label className="start_date">Start Date</Label>
                            <Input
                                id="start_date"
                                name="start_date"
                                type="datetime-local"
                            />
                        </div>


                        <div className="grid gap-2">
                            <Label className="end_date">End Date</Label>
                            <Input
                                id="end_date"
                                name="end_date"
                                type="datetime-local"
                            />
                        </div>

                    </div>
                </div>

            </div>

            <div className="border-t-1 border-gray-200 mt-8">
                <div className="my-4 flex gap-4 justify-end">
                    <Button >
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
 
export default ProjectForm;