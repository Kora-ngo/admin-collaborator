import { useEffect, useState } from "react";
import { Button } from "../../../components/widgets/button";
import { Input } from "../../../components/widgets/input";
import { Label } from "../../../components/widgets/label";
import Tag from "../../../components/widgets/tag";
import { Textarea } from "../../../components/widgets/textarea";
import { SelectInput } from "../../../components/widgets/select-input";
import { useAssitanceSelect } from "../hooks/useAssitanceSelect";
import { useCollaboratorSelect } from "../hooks/useCollaboratorSelect";
import { useProject } from "../hooks/useProject";
import { useProjectImage } from "../hooks/useProjectImage";
// import { getFileIcon } from "../../../utils/fileIcons";
import { useProjectStore } from "../store/projectStore";

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
        handleSelectCollaborator,
        setSelectedEnumerators,
        setSelectedCollaborator
    } = useCollaboratorSelect();
    
    const {
        selectedAssistance, 
        availableAssisOptions, 
        handleAddAssistance, 
        handleRemoveAssistance, 
        handleClearAllAssistance,
        setSelectedAssistance
    } = useAssitanceSelect();
    
    const {
        errors, 
        projectForm, 
        handleChange, 
        handleSubmit, 
        updateSelectedMembers, 
        updateSelectedAssitance, 
        handleView
    } = useProject();
    
    const {
        // isDragging, 
        uploadedFiles, 
        setUploadedFiles, 
        // handleFileChange, 
        // handleDragOver, 
        // handleDragLeave, 
        // handleDrop, 
        // handleRemoveFile, 
        // formatFileSize 
    } = useProjectImage();
    
    const {loading} = useProjectStore();

    // State for managing existing media files (for edit mode)
    // const [existingMedia, setExistingMedia] = useState<any[]>([]);
    const [mediaToDelete, setMediaToDelete] = useState<number[]>([]);

    // State for locked items (computed from project data)
    const [lockedEnumeratorIds, setLockedEnumeratorIds] = useState<number[]>([]);
    const [lockedAssistanceIds, setLockedAssistanceIds] = useState<number[]>([]);

    useEffect(() => {
        const handleFetch = async () => {
            if (!id) {
                // Reset states for add mode
                // setExistingMedia([]);
                setMediaToDelete([]);
                setLockedEnumeratorIds([]);
                setLockedAssistanceIds([]);
                setSelectedEnumerators([]);
                setSelectedCollaborator(0);
                setSelectedAssistance([]);
                return;
            }

            const projectData = await handleView(id);

            // Set existing media files
            // if (projectData.mediaLinks) {
            //     setExistingMedia(projectData.mediaLinks);
            // }

            // Calculate locked enumerators
            const lockedEnumIds: number[] = [];
            
            // Check beneficiaries
            if (projectData.beneficiaries && projectData.beneficiaries.length > 0) {
                projectData.beneficiaries.forEach((beneficiary: any) => {
                    if (beneficiary.created_by_membership_id && !lockedEnumIds.includes(beneficiary.created_by_membership_id)) {
                        lockedEnumIds.push(beneficiary.created_by_membership_id);
                    }
                });
            }

            // Check deliveries
            if (projectData.deliveries && projectData.deliveries.length > 0) {
                projectData.deliveries.forEach((delivery: any) => {
                    if (delivery.created_by_membership_id && !lockedEnumIds.includes(delivery.created_by_membership_id)) {
                        lockedEnumIds.push(delivery.created_by_membership_id);
                    }
                });
            }

            setLockedEnumeratorIds(lockedEnumIds);

            // Calculate locked assistances
            const lockedAssistIds: number[] = [];
            
            // Check delivery items
            if (projectData.deliveries && projectData.deliveries.length > 0) {
                projectData.deliveries.forEach((delivery: any) => {
                    if (delivery.items && delivery.items.length > 0) {
                        delivery.items.forEach((item: any) => {
                            if (item.assistance_id && !lockedAssistIds.includes(item.assistance_id)) {
                                lockedAssistIds.push(item.assistance_id);
                            }
                        });
                    }
                });
            }

            setLockedAssistanceIds(lockedAssistIds);

            // Load existing members (enumerators and collaborator)
            if (projectData.members) {
                const enums = projectData.members
                    .filter((m: any) => m.role_in_project === 'enumerator')
                    .map((m: any) => m.membership);

                const collab = projectData.members.find((m: any) => 
                    m.role_in_project === 'collaborator'
                );

                // Set enumerators
                setSelectedEnumerators(enums);
                
                // Set collaborator
                setSelectedCollaborator(collab?.membership_id || 0);
            }

            // Load existing assistances
            if (projectData.assistances) {
                const assists = projectData.assistances.map((a: any) => a.assistance);
                setSelectedAssistance(assists);
            }
        };

        handleFetch();
    }, [id, isOpen]);

    // Update members whenever enumerators or collaborator changes
    useEffect(() => {
        updateSelectedMembers(selectedEnumerators, selectedCollaborator);
    }, [selectedEnumerators, selectedCollaborator]);

    useEffect(() => {
        updateSelectedAssitance(selectedAssistance);
    }, [selectedAssistance]);

    // Check if an enumerator is locked (created beneficiaries or deliveries)
    const isEnumeratorLocked = (membershipId: number) => {
        return lockedEnumeratorIds.includes(membershipId);
    };

    // Check if an assistance is locked (used in deliveries)
    const isAssistanceLocked = (assistanceId: number) => {
        return lockedAssistanceIds.includes(assistanceId);
    };

    // Handle removing existing media
    // const handleRemoveExistingMedia = (mediaId: number) => {
    //     setMediaToDelete(prev => [...prev, mediaId]);
    //     setExistingMedia(prev => prev.filter(m => m.media.id !== mediaId));
    // };

    const handleValidate = async () => {
        const isValid = await handleSubmit(id, uploadedFiles, mediaToDelete);
        if(isValid){
            onSuccess();
            // Reset states
            setMediaToDelete([]);
            setUploadedFiles([]);
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

                {/* Single Collaborator Selection - ONLY SHOW IN ADD MODE */}
                {!id && (
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
                )}

                {/* Show collaborator info in EDIT MODE (non-editable) */}
                {id && selectedCollaborator > 0 && (
                    <div className="grid gap-2">
                        <Label>Project Lead (Collaborator)</Label>
                        <div className="p-3 bg-gray-100 border border-gray-300 rounded-md flex items-center gap-2">
                            <span className="text-sm text-gray-700">
                                {collaborators.find(c => c.id === selectedCollaborator)?.user?.name || 'Unknown'}
                            </span>
                            <span className="text-xs font-semibold text-gray-600 ml-2"> - Cannot be changed after creation</span>
                        </div>
                    </div>
                )}

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
                            {availableEnumerators.map(enum_ => {
                                const isLocked = isEnumeratorLocked(enum_.id);
                                return (
                                    <option
                                        key={enum_.id}
                                        value={enum_.id}
                                        disabled={isLocked}
                                        className={isLocked ? "text-gray-400" : ""}
                                    >
                                        {enum_.user?.name} {isLocked ? "" : ""}
                                    </option>
                                );
                            })}
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
                                {selectedEnumerators.map(enum_ => {
                                    const isLocked = isEnumeratorLocked(enum_.id);
                                    return (
                                        <div key={enum_.id} className="relative">
                                            <Tag
                                                locked = {isLocked}
                                                label={
                                                    <span className="flex items-center gap-1">
                                                        {enum_.user?.name || ''}
                                                    </span>
                                                }
                                                onRemove={isLocked ? () => {} : () => handleRemoveEnumerator(enum_.id)}
                                                className={isLocked ? "bg-amber-100 border-amber-300 cursor-not-allowed" : ""}
                                            />
                                        </div>
                                    );
                                })}

                                {/* Clear All Button - only show if there are unlocked enumerators */}
                                {selectedEnumerators.filter(e => !isEnumeratorLocked(e.id)).length > 1 && (
                                    <button
                                        onClick={handleClearAllEnumerators}
                                        className="text-xs text-red-600 hover:text-red-800 underline ml-2 self-center"
                                    >
                                        Clear all unlocked
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Show helper text in edit mode if there are locked enumerators */}
                    {id && lockedEnumeratorIds.length > 0 && (
                    <div className="flex items-center space-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-gray-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                        <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                            Locked enumerators have created beneficiaries or deliveries and cannot be removed
                        </p>
                    </div>
                    )}
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
                            {availableAssisOptions.map(assistance => {
                                const isLocked = isAssistanceLocked(assistance.id!);
                                return (
                                    <option 
                                        key={assistance.id} 
                                        value={assistance.id}
                                        disabled={isLocked}
                                        className={isLocked ? "text-gray-400" : ""}
                                    >
                                        {assistance.name} {isLocked ? "" : ""}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="w-full min-h-20 max-h-32 overflow-y-auto p-3 rounded-md border border-gray-200 bg-gray-50">
                        {selectedAssistance.length === 0 ? (
                            <p className="text-sm text-gray-500">No assistance selected</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {selectedAssistance.map(assistance => {
                                    const isLocked = isAssistanceLocked(assistance.id!);
                                    return (
                                        <div key={assistance.id} className="relative">
                                            <Tag
                                               locked = {isLocked}
                                                label={
                                                    <span className="flex items-center gap-1">
                                                        {assistance.name}
                                                    </span>
                                                }
                                                onRemove={isLocked ? () => {} : () => handleRemoveAssistance(assistance.id!)}
                                                className={isLocked ? "bg-amber-100 border-amber-300 cursor-not-allowed" : ""}
                                            />
                                        </div>
                                    );
                                })}

                                {/* Clear all unlocked assistances */}
                                {selectedAssistance.filter(a => !isAssistanceLocked(a.id!)).length > 1 && (
                                    <button
                                        onClick={handleClearAllAssistance}
                                        className="text-xs text-red-600 hover:text-red-800 underline ml-2 self-center"
                                    >
                                        Clear all unlocked
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Show helper text in edit mode if there are locked assistances */}
                    {id && lockedAssistanceIds.length > 0 && (
                        <div className="flex items-center space-x-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-gray-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                            <p className="text-xs font-semibold text-gray-600  gap-1">
                                Locked assistances are used in deliveries and cannot be removed
                            </p>
                        </div>
                    )}
                </div>

                {/* Date Fields - ONLY IN ADD MODE */}
                {!id && (
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
                )}

            </div>


            <div className="border-t-1 border-gray-200 mt-8">
                <div className="my-4 flex gap-4 justify-end">
                    <Button onClick={handleValidate} loading={loading}>
                        {id ? "Update" : "Save"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ProjectForm;