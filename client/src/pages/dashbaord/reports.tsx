import { useState } from "react";
import { Button } from "../../components/ui/button";
import Modal from "../../components/ui/modal";
import EmptyState from "../../components/ui/empty";
import GenerateReportForm from "../../features/reports/components/generate-report-form";

const Report = () => {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-end">
                <Button onClick={() => setModalOpen(true)}>Generate Report</Button>
            </div>

            {/* Table display comes later — placeholder for now, per instruction */}
            <div className="bg-gray-50 rounded-xl">
                <EmptyState
                    title="No Reports Generated Yet"
                    description="Reports you generate will appear here."
                />
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Generate Report"
                children={
                    <GenerateReportForm
                        isOpen={modalOpen}
                        onSuccess={() => setModalOpen(false)}
                    />
                }
            />
        </div>
    );
};

export default Report;