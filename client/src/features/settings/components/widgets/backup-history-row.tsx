import StatusBadge from "../../../../components/ui/status-badge";
import type { Backup } from "../../backup";


interface BackupHistoryRowProps {
    backup: Backup;
    onDownload: (id: number, fileName: string) => void;
    onDelete: (id: number) => void;
    formatFileSize: (bytes: number | null) => string;
    downloading: boolean;
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
}: BackupHistoryRowProps) => {
    const statusInfo = statusMap[backup.action_status] ?? { text: backup.action_status, color: "yellow" };

    const formattedDate = new Date(backup.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <tr className="hover:bg-gray-50 transition-colors">
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
                    {backup.action_status === "completed" && backup.file_name && (
                        <button
                            onClick={() => onDownload(backup.id, backup.file_name!)}
                            disabled={downloading}
                            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            {downloading ? "..." : "Download"}
                        </button>
                    )}

                    <span className="text-gray-200">|</span>

                    <button
                        onClick={() => onDelete(backup.id)}
                        className="text-xs font-medium text-red-400 hover:underline"
                    >
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default BackupHistoryRow;