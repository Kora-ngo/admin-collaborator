// src/features/project/components/project-view-general.tsx

import DetailView from "../../../components/widgets/detail-view";
import StatusBadge from "../../../components/widgets/status-badge";
import type { Project } from "../../../types/project";
import { formatDate } from "../../../utils/formatDate";

interface ProjectViewGeneralProps {
  data: any; // null if loading or no data
}

const ProjectViewGeneral = ({ data }: ProjectViewGeneralProps) => {
  if (!data) {
    return (
      <div className="text-center py-10 text-gray-500">
        No project data available
      </div>
    );
  }


    const statusColors: any = {
        pending: { text: "Pending", color: "gray" },
        ongoing: { text: "Ongoing", color: "blue" },
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