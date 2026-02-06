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
import { getFileIcon } from "../../../utils/fileIcons";
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
        isDragging, 
        uploadedFiles, 
        setUploadedFiles, 
        handleFileChange, 
        handleDragOver, 
        handleDragLeave, 
        handleDrop, 
        handleRemoveFile, 
        formatFileSize 
    } = useProjectImage();
    
    const {loading} = useProjectStore();

    // State for managing existing media files (for edit mode)
    const [existingMedia, setExistingMedia] = useState<any[]>([]);
    const [mediaToDelete, setMediaToDelete] = useState<number[]>([]);

    // State for locked items (computed from project data)
    const [lockedEnumeratorIds, setLockedEnumeratorIds] = useState<number[]>([]);
    const [lockedAssistanceIds, setLockedAssistanceIds] = useState<number[]>([]);

    useEffect(() => {
        const handleFetch = async () => {
            if (!id) {
                // Reset states for add mode
                setExistingMedia([]);
                setMediaToDelete([]);
                setLockedEnumeratorIds([]);
                setLockedAssistanceIds([]);
                setSelectedEnumerators([]);
                setSelectedCollaborator(0);
                setSelectedAssistance([]);
                return;
            }

            const projectData = await handleView(id);
            console.log("Project Data -------> ", projectData);

            // Set existing media files
            if (projectData.mediaLinks) {
                setExistingMedia(projectData.mediaLinks);
            }

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
            console.log("Locked Enumerator IDs:", lockedEnumIds);

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
            console.log("Locked Assistance IDs:", lockedAssistIds);

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
    const handleRemoveExistingMedia = (mediaId: number) => {
        setMediaToDelete(prev => [...prev, mediaId]);
        setExistingMedia(prev => prev.filter(m => m.media.id !== mediaId));
    };

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

            {/* File Uploader - Images & Documents */}
            <div className="grid gap-2 mt-8">
                <Label htmlFor="project_files" required={false}>
                    {id ? "Manage Project Files" : "Project Files"}
                </Label>

                {/* Existing Media Files (Edit Mode) */}
                {id && existingMedia.length > 0 && (
                    <div className="mb-4 space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                            Current Files ({existingMedia.length})
                        </p>
                        <div className="max-h-48 overflow-y-auto space-y-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            {existingMedia.map((mediaLink) => (
                                <div
                                    key={mediaLink.media.id}
                                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <img
                                            src={getFileIcon(mediaLink.media.file_name)}
                                            alt={`${mediaLink.media.file_name} icon`}
                                            className="w-12 h-12 object-contain flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {mediaLink.media.file_name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatFileSize(mediaLink.media.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExistingMedia(mediaLink.media.id)}
                                        className="flex-shrink-0 ml-3 text-red-500 hover:text-red-700 transition-colors"
                                        title="Remove file"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upload Zone */}
                <label
                    htmlFor="project_files"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                        isDragging
                            ? 'border-primary bg-primary/5 scale-[1.02]'
                            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                            className={`w-8 h-8 mb-2 transition-colors ${
                                isDragging ? 'text-primary' : 'text-gray-400'
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                        <p className={`mb-1 text-sm ${isDragging ? 'text-primary font-semibold' : 'text-gray-500'}`}>
                            {isDragging ? (
                                <span className="font-bold">Drop files here</span>
                            ) : (
                                <>
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </>
                            )}
                        </p>
                        <p className="text-xs text-gray-500">
                            {id ? "Add more files" : "Images, PDF, Word, Excel (MAX. 10MB each)"}
                        </p>
                    </div>
                    <input
                        id="project_files"
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                        multiple
                        onChange={handleFileChange}
                    />
                </label>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                    <div className="mt-3 space-y-4 py-2 bg-gray-50 border-gray-200 border-1 rounded-md">
                        <div className="flex mt-2 px-2 items-center justify-between">
                            <p className="text-sm font-medium text-gray-700">
                                New Files to Upload ({uploadedFiles.length})
                            </p>
                            {uploadedFiles.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setUploadedFiles([])}
                                    className="text-xs text-red-600 hover:text-red-800 underline"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        <div className="max-h-48 px-2 overflow-y-auto space-y-2">
                            {uploadedFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="text-2xl flex-shrink-0">
                                            <img
                                                src={getFileIcon(file.name)}
                                                alt={`${file.name} icon`}
                                                className="w-12 h-12 object-contain"
                                            />
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFile(index)}
                                        className="flex-shrink-0 ml-3 text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ))}
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