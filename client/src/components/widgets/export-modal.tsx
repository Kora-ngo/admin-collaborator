import { useState } from "react";
import { Button } from "./button";
import { SelectInput } from "./select-input";
import Popup from "./popup";

interface ExportPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (period: string) => Promise<void>;
    title: string;
}

const ExportPopup = ({ isOpen, onClose, onExport, title }: ExportPopupProps) => {
    const [period, setPeriod] = useState("all");
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        try {
            setLoading(true);
            await onExport(period);
            onClose();
            setPeriod("all"); // Reset
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Popup open={isOpen} showFooter={false} onClose={onClose} title={title} confirmText="Export to CSV">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Time Period
                    </label>
                    <SelectInput
                        options={[
                            { label: "All Records", value: "all" },
                            { label: "Today", value: "today" },
                            { label: "This Week", value: "this_week" },
                            { label: "This Month", value: "this_month" },
                            { label: "This Year", value: "this_year" }
                        ]}
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={loading}
                        onClick={handleExport}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Exporting...
                            </span>
                        ) : (
                            'Export to CSV'
                        )}
                    </Button>
                </div>
            </div>
        </Popup>
    );
};

export default ExportPopup;