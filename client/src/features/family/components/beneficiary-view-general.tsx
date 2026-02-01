// src/features/family/components/beneficiary-view-general.tsx

import type { Beneficiary } from "../../../types/beneficiary";
import DetailView from "../../../components/widgets/detail-view";
import { formatDate } from "../../../utils/formatDate";
import StatusBadge from "../../../components/widgets/status-badge";

interface BeneficiaryViewGeneralProps {
    data: Beneficiary;
}

const BeneficiaryViewGeneral = ({ data }: BeneficiaryViewGeneralProps) => {
    const statusColors: any = {
        pending: "yellow",
        approved: "green",
        rejected: "red"
    };

    const fields = [
        { label: "Family Code", value: data.family_code },
        { label: "Head of Family", value: data.head_name },
        { label: "Phone", value: data.phone || "-" },
        { label: "Region", value: data.region || "-" },
        { label: "Village", value: data.village || "-" },
        { label: "Project", value: data.project?.name || "-" },
        { 
            label: "Review Status", 
            value: (
                <StatusBadge 
                    text={data.review_status} 
                    color={statusColors[data.review_status] || "gray"} 
                />
            )
        },
        { label: "Sync Source", value: data.sync_source },
        { label: "Created By", value: `${data.createdBy?.user?.name} - ${data.createdBy?.role}` || "-" },
        { label: "Created At", value: formatDate(data.created_at.toString(), true) },
    ];

    // Add review information if reviewed
    if (data.review_status !== 'pending') {
        fields.push(
            { 
                label: "Reviewed By", 
                value: data.reviewedBy?.user?.name || "-" 
            },
            { 
                label: "Reviewed At", 
                value: data.reviewed_at ? formatDate(data.reviewed_at.toString(), true) : "-" 
            }
        );

        if (data.review_note) {
            fields.push({ 
                label: "Review Note", 
                value: data.review_note 
            });
        }
    }

    return (
        <DetailView
            title={`Family: ${data.family_code}`}
            subtitle={data.head_name}
            fields={fields}
        />
    );
};

export default BeneficiaryViewGeneral;