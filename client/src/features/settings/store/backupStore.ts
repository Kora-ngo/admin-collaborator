import { create } from "zustand";
import { handleApiError } from "../../../utils/handleApiError";
import type { Pagination } from "../../../types/pagination";
import type { Backup } from "../backup";
import axiosInstance from "../../../lib/axiosInstance";
import type { ToastMessage } from "../../../types/toastMessage";

interface BackupState {
    backups: Backup[];
    lastBackup: Backup | null;
    loading: boolean;
    downloading: boolean;
    pagination: Pagination | null;

    fetchAll: (page?: number) => Promise<ToastMessage | undefined>;
    create: () => Promise<any>;
    download: (id: number, fileName: string) => Promise<ToastMessage | undefined>;
    remove: (id: number) => Promise<any>;
}

export const useBackupStore = create<BackupState>((set, get) => ({
    backups: [],
    lastBackup: null,
    loading: false,
    downloading: false,
    pagination: null,

    fetchAll: async (page = 1) => {
        try {
            set({ loading: true });

            const response = await axiosInstance.get("backup", {
                params: { page, limit: 10 },
            });

            const rows: Backup[] = response.data.data;

            // Most recent completed backup
            const lastCompleted = rows.find(
                (b) => b.action_status === "completed"
            ) || null;

            set({
                backups: rows,
                lastBackup: lastCompleted,
                pagination: response.data.pagination,
            });
        } catch (error: any) {
            const err = handleApiError(error);
            return err;
        } finally {
            set({ loading: false });
        }
    },

    create: async () => {
        try {
            set({ loading: true });

            const response = await axiosInstance.post("backup", {});
            return response.data;

        } catch (error: any) {
            const err = handleApiError(error);
            return err;
        } finally {
            set({ loading: false });
        }
    },

    download: async (id: number, fileName: string) => {
        try {
            set({ downloading: true });

            const response = await axiosInstance.get(`backup/${id}/download`, {
                responseType: "blob",
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error: any) {
            const err = handleApiError(error);
            return err;
        } finally {
            set({ downloading: false });
        }
    },

    remove: async (id: number) => {
        try {
            set({ loading: true });

            const response = await axiosInstance.delete(`backup/${id}`);

            // Remove from local list
            set((state) => ({
                backups: state.backups.filter((b) => b.id !== id),
            }));

            return response.data;
        } catch (error: any) {
            const err = handleApiError(error);
            return err;
        } finally {
            set({ loading: false });
        }
    },
}));