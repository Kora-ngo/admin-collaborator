import StatusBadge from "../../../../components/ui/status-badge";
import Tooltip from "../../../../components/widgets/tooltip";
import type { Backup } from "../../backup";

interface BackupHistoryRowProps {
    backup: Backup;
    onDownload: (id: number, fileName: string) => void;
    onDelete: (id: number) => void;
    formatFileSize: (bytes: number | null) => string;
    downloading: boolean;
    // Which record is pending deletion confirmation
    pendingDeleteId: number | null;
    onPendingDelete: (id: number | null) => void;
}

const statusMap: Record<string, { text: string; color: "green" | "red" | "yellow" }> = {
    completed: { text: "Completed", color: "green" },
    failed: { text: "Failed", color: "red" },
    processing: { text: "Processing", color: "yellow" },
};

const BackupHistoryRow = ({
    backup,
    onDownload,
    onDelete,
    formatFileSize,
    downloading,
    pendingDeleteId,
    onPendingDelete,
}: BackupHistoryRowProps) => {
    const statusInfo = statusMap[backup.action_status] ?? { text: backup.action_status, color: "yellow" };
    const isPendingDelete = pendingDeleteId === backup.id;
    const isOtherPending = pendingDeleteId !== null && pendingDeleteId !== backup.id;

    const formattedDate = new Date(backup.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const handleDeleteClick = () => {
        if (isPendingDelete) {
            // Second click — confirm delete
            onDelete(backup.id);
            onPendingDelete(null);
        } else {
            // First click — set pending
            onPendingDelete(backup.id);
        }
    };

    return (
        <tr className={`transition-colors ${
            isOtherPending ? "opacity-40 pointer-events-none" : "hover:bg-gray-50"
        }`}>
            {/* Date */}
            <td className="px-4 py-3">
                <p className="text-sm text-gray-700">{formattedDate}</p>
            </td>

            {/* Method */}
            <td className="px-4 py-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    backup.type === "automatic"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-purple-100 text-purple-600"
                }`}>
                    {backup.type.charAt(0).toUpperCase() + backup.type.slice(1)}
                </span>
            </td>

            {/* Size */}
            <td className="px-4 py-3">
                <p className="text-sm text-gray-600">{formatFileSize(backup.file_size)}</p>
            </td>

            {/* Status */}
            <td className="px-4 py-3">
                <StatusBadge text={statusInfo.text} color={statusInfo.color} />
            </td>

            {/* Actions */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    {/* Download */}
                    {backup.action_status === "completed" && backup.file_name && (
                        <Tooltip text="Download backup" position="top">
                            <button
                                onClick={() => onDownload(backup.id, backup.file_name!)}
                                disabled={downloading}
                                className="p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
                            >
                                {downloading ? (
                                    <svg className="animate-spin size-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                    </svg>
                                )}
                            </button>
                        </Tooltip>
                    )}

                    {/* Delete */}
                    <Tooltip text={isPendingDelete ? "Click again to confirm" : "Delete backup"} position="top">
                        <button
                            onClick={handleDeleteClick}
                            className={`p-1.5 rounded-md transition-all ${
                                isPendingDelete
                                    ? "bg-red-500 text-white animate-pulse"
                                    : "text-red-400 hover:bg-red-50"
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                    </Tooltip>
                </div>
            </td>
        </tr>
    );
};

export default BackupHistoryRow;