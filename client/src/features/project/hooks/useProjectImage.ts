import { useState } from "react";

export const useProjectImage = () => {

    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        processFiles(files);
        // Reset input
        e.target.value = '';
    };



    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    };


    const processFiles = (files: File[]) => {
        if (files.length === 0) return;

        // Validate each file
        const validFiles: File[] = [];
        
        for (const file of files) {
            // Check file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                alert(`${file.name} is too large. Maximum file size is 10MB.`);
                continue;
            }

            // Check if file already exists
            if (uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
                alert(`${file.name} is already uploaded.`);
                continue;
            }

            validFiles.push(file);
        }

        if (validFiles.length > 0) {
            setUploadedFiles(prev => [...prev, ...validFiles]);
        }
    };


    const handleRemoveFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };





        

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };



    return {
        isDragging,
        uploadedFiles,

        setUploadedFiles,
        handleFileChange,

        handleDragOver,
        handleDragLeave,
        handleDrop,


        processFiles,
        handleRemoveFile,
        formatFileSize


    }
}