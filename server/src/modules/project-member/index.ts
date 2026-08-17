import ProjectMemberModel from "./project.member.model.js";
import ProjectModel from "../project/project.model.js";
import MembershipModel from "../membership/membership.model.js";

// Associations for ProjectMemberModel — extracted from the former models/index.ts

ProjectMemberModel.belongsTo(ProjectModel, {
    foreignKey: 'project_id',
    as: 'project'
});

// ProjectMember -> Membership
ProjectMemberModel.belongsTo(MembershipModel, {
    foreignKey: 'membership_id',
    as: 'membership'
});

export default ProjectMemberModel;