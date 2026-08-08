// src/features/project/components/project-view-general.tsx

import DetailView from "../../../components/widgets/detail-view";
import EmptyState from "../../../components/ui/empty";
import StatusBadge from "../../../components/ui/status-badge";
import { formatDate } from "../../../utils/formatDate";
import { useLocationLabels } from "../../common/locations/hooks/uselocationLabels";
import { useMemo } from "react";

interface ProjectViewGeneralProps {
  data: any;
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

  const regionCodes = useMemo(
  () => data?.regions?.map((r: any) => r.region) ?? [],
  [data?.regions]
);

const { countryName, regionName } = useLocationLabels(
  data?.country,
  regionCodes
);


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
    {label: "Country of Operation", value: countryName},
    {
        label: "Region(s) Covered",
        value: data.regions?.length
          ? regionName
          : "...",
      },

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