import { useEffect } from "react";

interface BackupDeleteNoticeProps {
    isVisible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const BackupDeleteNotice: React.FC<BackupDeleteNoticeProps> = ({
    isVisible,
    onConfirm,
    onCancel,
}) => {
    // Auto-cancel after 5 seconds
    useEffect(() => {
        if (!isVisible) return;
        const timer = setTimeout(() => onCancel(), 5000);
        return () => clearTimeout(timer);
    }, [isVisible, onCancel]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl">
                {/* Warning icon */}
                <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                </div>

                <p className="text-sm font-medium">
                    Click the trash icon again to confirm deletion
                </p>

                {/* Cancel */}
                <button
                    onClick={onCancel}
                    className="ml-2 flex items-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default BackupDeleteNotice;