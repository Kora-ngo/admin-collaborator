import type { Delivery } from "../../../types/delivery";
import DetailView from "../../../components/widgets/detail-view";
import { formatDate } from "../../../utils/formatDate";
import StatusBadge from "../../../components/widgets/status-badge";

interface DeliveryViewGeneralProps {
    data: Delivery;
}

const DeliveryViewGeneral = ({ data }: DeliveryViewGeneralProps) => {
    const statusColors: any = {
        pending: "yellow",
        approved: "green",
        rejected: "red"
    };

    const fields = [
        { label: "Delivery Date", value: formatDate(data.delivery_date, false) },
        { label: "Project", value: data.project?.name || "-" },
        {
            label: "Beneficiary",
            value: data.beneficiary
                ? `${data.beneficiary.family_code} - ${data.beneficiary.head_name}`
                : "-"
        },
        { label: "Notes", value: data.notes || "-" },
        { label: "Total Items", value: data.items?.length || 0 },
        { label: "Sync Source", value: data.sync_source },
        {
            label: "Review Status",
            value: (
                <StatusBadge
                    text={data.review_status}
                    color={statusColors[data.review_status] || "gray"}
                />
            )
        },
        { label: "Created By", value: data.createdBy?.user?.name || "-" },
        { label: "Created At", value: formatDate(data.created_at, true) },
    ];

    if (data.review_status !== 'pending') {
        fields.push(
            { label: "Reviewed By", value: data.reviewedBy?.user?.name || "-" },
            { label: "Reviewed At", value: data.reviewed_at ? formatDate(data.reviewed_at, true) : "-" }
        );

        if (data.review_note) {
            fields.push({ label: "Review Note", value: data.review_note });
        }
    }

    return (
        <DetailView
            title={`Delivery #${data.uid}`}
            subtitle={formatDate(data.delivery_date, false)}
            fields={fields}
        />
    );
};

export default DeliveryViewGeneral;
