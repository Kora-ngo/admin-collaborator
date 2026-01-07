// src/features/project/components/project-view-general.tsx

import DetailView from "../../../components/widgets/detail-view";
import EmptyState from "../../../components/widgets/empty";
import StatusBadge from "../../../components/widgets/status-badge";
import { formatDate } from "../../../utils/formatDate";

interface ProjectViewGeneralProps {
  data: any; // null if loading or no data
}

const ProjectViewGeneral = ({ data }: ProjectViewGeneralProps) => {
  if (!data) {
    return (
      <div className="flex justify-center items-center h-80">
            <EmptyState
                title="No Record Found"
            />
      </div>
    );
  }


    const statusColors: any = {
        pending: { text: "Pending", color: "gray" },
        ongoing: { text: "Ongoing", color: "blue" },
        overdue: { text: "Overdue", color: "red" },
        done: { text: "Done", color: "green" },
        suspended: { text: "Suspended", color: "orange" },
        false: { text: "Deleted", color: "red" }
    };
    const s = statusColors[data.status] || statusColors.pending;

  const fields = [
    { label: "Project Name", value: data.name },
    { label: "Description", value: data.description || "-" },
    { label: "Start Date", value: formatDate(data.start_date!.toString(), false) },
    { label: "End Date", value: formatDate(data.end_date!.toString(), false) },
    { label: "Created On", value: formatDate(data.created_at!.toString(), false) },
    { label: "Status", value: <StatusBadge text={data.status} color={s.color} /> }
  ];

  return (
    <DetailView
      title={data.name}
      fields={fields}
    />
  );
};

export default ProjectViewGeneral;