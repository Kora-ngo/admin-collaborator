import MembershipModel from "./membership.model.js";
import UserModel from "../user/user.model.js";
import OrganisationModel from "../organisation/organisation.model.js";
import ProjectMemberModel from "../project-member/project.member.model.js";
import AuditLogModel from "../audit-log/audit-log.model.js";

// Associations for MembershipModel — extracted from the former models/index.ts

// MEMBERSHIP -- USER -- ORGANSIATIOn ---------------------------->
MembershipModel.belongsTo(UserModel, {
    foreignKey: 'user_id',
    as: 'user'
});

MembershipModel.belongsTo(OrganisationModel, {
    foreignKey: 'organization_id',
    as: 'organization'
});

MembershipModel.hasMany(ProjectMemberModel, {
    foreignKey: 'membership_id',
    as: 'projectMemberships'
});

MembershipModel.hasMany(AuditLogModel, {
    foreignKey: 'actor_membership_id',
    as: 'auditLogs'
});

export default MembershipModel;