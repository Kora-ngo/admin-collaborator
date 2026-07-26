import { useEffect } from "react";
import { useBackupStore } from "../store/backupStore";
import { useToastStore } from "../../../store/toastStore";

export const useBackup = () => {
    const {
        backups,
        lastBackup,
        loading,
        downloading,
        pagination,
        fetchAll,
        create,
        download,
        remove,
    } = useBackupStore();

    const showToast = useToastStore((state) => state.showToast);

    useEffect(() => {
        fetchAll();
    }, []);

    const handleCreate = async () => {
        const result = await create();
        showToast(result);

        if (result?.type === "success") {
            await fetchAll(); // Refresh list
        }
    };

    const handleDownload = async (id: number, fileName: string) => {
        await download(id, fileName);
    };

    const handleDelete = async (id: number) => {
        const result = await remove(id);
        showToast(result);
    };

    const handlePageChange = (page: number) => {
        fetchAll(page);
    };

    // Format file size
    const formatFileSize = (bytes: number | null): string => {
        if (!bytes) return "—";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return {
        backups,
        lastBackup,
        loading,
        downloading,
        pagination,
        handleCreate,
        handleDownload,
        handleDelete,
        handlePageChange,
        formatFileSize,
    };
};