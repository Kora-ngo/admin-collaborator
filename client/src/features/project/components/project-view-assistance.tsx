import { useEffect } from "react";
import DetailView from "../../../components/widgets/detail-view";
import type { ProjectAssistance } from "../../../types/project";
import EmptyState from "../../../components/widgets/empty";

interface ProjectViewAssistanceProps {
    selectedAssistance: ProjectAssistance[] |undefined
}

const ProjectViewAssistance = ({selectedAssistance}: ProjectViewAssistanceProps) => {

    useEffect(() => {
        console.log("Assinacte --> ", selectedAssistance);
    }, [selectedAssistance])


    if (!selectedAssistance || selectedAssistance.length === 0) {
    return (
      <div className="flex justify-center items-center h-80">
            <EmptyState
                title="No Record Found"
            />
      </div>
    );
  }

  const fields = selectedAssistance.map((assistances: any) => ({
    value: (
      <div className="space-y-1">
        <div className="font-semibold text-md text-gray-900">{assistances.assistance.name}</div>
      </div>
    ),
  }));

    return (
        <DetailView
        title="Enabled Assistance Types"
        subtitle={`Total: ${selectedAssistance.length} type${selectedAssistance.length !== 1 ? 's' : ''}`}
        fields={fields}
        layout="single"
        />
    );
}
 
export default ProjectViewAssistance;