import { useState } from "react";
import StatusBadge from "../../../../components/ui/status-badge";
import { FilterToggleButton } from "../../../../components/widgets/filter-button";
import { Button } from "../../../../components/ui/button";
import { useBackup } from "../../hooks/useBackup";
import BackupHistoryRow from "../widgets/backup-history-row";
import BackupDeleteNotice from "../widgets/backup-delete-notice";


const SettingDataProtection = () => {
    const [activeTab, setActiveTab] = useState<"Backup & Restore" | "history">("Backup & Restore");
    const [isAutomatic, setIsAutomatic] = useState(false);

    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

    const handleDeleteClick = (id: number) => {
        // Actually delete — called on second click via the row
        handleDelete(id);
        setPendingDeleteId(null);
    };

    const handleCancelDelete = () => {
        setPendingDeleteId(null);
    };

    const {
        backups,
        lastBackup,
        loading,
        downloading,
        handleCreate,
        handleDownload,
        handleDelete,
        formatFileSize,
    } = useBackup();

    const toggleMethod = () => setIsAutomatic(!isAutomatic);

    const tabs = [
        {
            key: "Backup & Restore" as const,
            label: "Backup & Restore",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                </svg>
            ),
        },
        {
            key: "history" as const,
            label: "Backup History",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            ),
        },
    ];

    const renderBackup = () => (
        <div className="space-y-6">
            {/* Last backup card */}
            {lastBackup ? (
                <div className="flex items-center gap-4 p-5 bg-gray-100/40 rounded-xl border border-gray-200">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                        </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-gray-900">
                            Last Backup -{" "}
                            <span className="text-gray-500 font-medium capitalize">
                                {lastBackup.type}
                            </span>
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                            <p className="text-sm text-gray-500">
                                {new Date(lastBackup.created_at).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                            <span className="text-gray-300">|</span>
                            <StatusBadge text="Completed" color="green" />
                        </div>
                    </div>

                    <div className="flex-shrink-0">
                        <StatusBadge text={formatFileSize(lastBackup.file_size)} />
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-600">No backups yet</p>
                        <p className="text-xs text-gray-400 mt-0.5">Create your first backup to protect your data</p>
                    </div>
                </div>
            )}

            <p className="text-sm text-gray-500 font-medium">
                Create a portable backup of your organization's data or restore a previously exported Kora backup.
            </p>

            <hr className="text-gray-200" />

            {/* Method selector */}
            <div className="flex items-center">
                <div className="flex-1">
                    <p className="font-bold">Select your backup method</p>
                    {isAutomatic ? (
                        <p className="text-sm text-gray-500 mt-1 font-medium">
                            Kora automatically creates backups on a scheduled <br /> basis to keep your organization's data protected.
                        </p>
                    ) : (
                        <p className="text-sm text-gray-500 mt-1 font-medium">
                            Create a backup whenever you need it. Download and <br /> securely store a copy of your organization's data.
                        </p>
                    )}
                </div>

                <div className="flex-shrink-0">
                    <FilterToggleButton
                        showIcon={false}
                        isOpen={isAutomatic}
                        openText="Automatic"
                        closedText="Manual"
                        onToggle={toggleMethod}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
                <Button variant="outline">Restore</Button>
                <Button
                    onClick={isAutomatic ? undefined : handleCreate}
                    loading={loading}
                >
                    {isAutomatic ? "Activate" : "Create Backup"}
                </Button>
            </div>
        </div>
    );

const renderHistory = () => (
    <div className="space-y-4 relative">
        <h3 className="text-base font-semibold text-gray-900">Recent Backups</h3>

        {backups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-gray-500">No backup history</p>
                <p className="text-xs text-gray-400 mt-1">Backups you create will appear here</p>
            </div>
        ) : (
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {backups.map((backup) => (
                            <BackupHistoryRow
                                key={backup.id}
                                backup={backup}
                                onDownload={handleDownload}
                                onDelete={handleDeleteClick}
                                formatFileSize={formatFileSize}
                                downloading={downloading}
                                pendingDeleteId={pendingDeleteId}
                                onPendingDelete={setPendingDeleteId}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* Delete confirmation notice */}
        <BackupDeleteNotice
            isVisible={pendingDeleteId !== null}
            onConfirm={() => {}} // handled by row second click
            onCancel={handleCancelDelete}
        />
    </div>
);

    return (
        <div className="space-y-8">
            {/* Tab Bar */}
            <div className="flex border-b border-gray-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex text-sm items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                            activeTab === tab.key
                                ? "text-primary border-primary bg-primary/5"
                                : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div>
                {activeTab === "Backup & Restore" ? renderBackup() : renderHistory()}
            </div>
        </div>
    );
};

export default SettingDataProtection;