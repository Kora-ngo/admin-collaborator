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

interface ProjectFormProps {
    id: number | any,
    isOpen: boolean,
    onSuccess: () => void
}

const ProjectForm = ({onSuccess, isOpen, id}: ProjectFormProps) => {

    const {selectedEnumerators, availableEnumerators, handleAddEnumerator, handleRemoveEnumerator, handleClearAllEnumerators, collaborators, selectedCollaborator, handleSelectCollaborator } = useCollaboratorSelect();
    const {selectedAssistance, availableAssisOptions, handleAddAssistance, handleRemoveAssistance, handleClearAllAssistance} = useAssitanceSelect()
    const {errors, projectForm, handleChange, handleSubmit, updateSelectedMembers, updateSelectedAssitance, handleView} = useProject();
    const {isDragging, uploadedFiles, setUploadedFiles, handleFileChange, handleDragOver, handleDragLeave, handleDrop, handleRemoveFile, formatFileSize } = useProjectImage();


    useEffect(() => {
        const handleFetch = async () => {
          if (!id) return;
          handleView(id);
        };
    
        handleFetch();
    }, [id]);

    // Update members whenever enumerators or collaborator changes
    useEffect(() => {
        updateSelectedMembers(selectedEnumerators, selectedCollaborator);
    }, [selectedEnumerators, selectedCollaborator]);

    useEffect(() => {
        updateSelectedAssitance(selectedAssistance);
    }, [selectedAssistance]);






    const handleValidate = async () => {
        // console.log("Images --> ", uploadedFiles);
        // const isValid = await handleSubmit(id);
        const isValid = await handleSubmit(id, uploadedFiles);
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

                {
                    !id &&
                    (
                        <>
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
                        </>
                    )
                }
   
            </div>


            {/* File Uploader - Images & Documents */}
                <div className="grid gap-2 mt-8">
                    <Label htmlFor="project_files" required={false}>Project Files</Label>
                    
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
                            <p className="text-xs text-gray-500">Images, PDF, Word, Excel (MAX. 10MB each)</p>
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
                                    Uploaded Files ({uploadedFiles.length})
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
                    <Button onClick={handleValidate}>
                        {id ? "Update" : "Save"}
                    </Button>
                </div>
            </div>             
        </div>
    );
}
 
export default ProjectForm;