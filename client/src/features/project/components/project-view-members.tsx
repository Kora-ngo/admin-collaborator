// src/features/project/components/project-view-members.tsx

import DetailView from "../../../components/widgets/detail-view";
import EmptyState from "../../../components/widgets/empty";
import type { ProjectMember } from "../../../types/project";

interface ProjectViewMembersProps {
  selectedMembers: ProjectMember[] | undefined;
}

const ProjectViewMembers = ({ selectedMembers }: ProjectViewMembersProps) => {
  if (!selectedMembers || selectedMembers.length === 0) {
    return (
      <div className="flex justify-center items-center h-80">
            <EmptyState
                title="No Record Found"
            />
      </div>
    );
  }

  const fields = selectedMembers.map((member: any) => {
    const isLeader = member.role_in_project === "collaborator";

    return {
      label: "", // no label → clean list
      value: (
        <div className=" flex items-center justify-between">
          <div>
            <div className="font-semibold text-md text-gray-900">
              {member.membership.user.name}
            </div>
            <div className="text-sm text-gray-400">
              {member.membership.role}
            </div>
          </div>

          {/* Special badge for collaborators = leaders */}
          {isLeader && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Leader
            </span>
          )}
        </div>
      ),
    };
  });

  return (
    <div>
      <DetailView fields={fields} layout="single" />
    </div>
  );
};

export default ProjectViewMembers;