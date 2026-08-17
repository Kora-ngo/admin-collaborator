import OrganisationModel from "./organisation.model.js";
import MembershipModel from "../membership/membership.model.js";
import UserModel from "../user/user.model.js";
import Subscription from "../subscription/subscription.model.js";
import ProjectModel from "../project/project.model.js";
import AssistanceModel from "../assistance/assistance.model.js";
import AuditLogModel from "../audit-log/audit-log.model.js";

// Associations for OrganisationModel — extracted from the former models/index.ts

OrganisationModel.hasMany(MembershipModel, {
    foreignKey: 'organization_id',
    as: 'memberships',
});

// Organisation -- ORGANSIATIOn ---------------------------->
OrganisationModel.belongsTo(UserModel, {
    foreignKey: 'created_by',
    as: 'owner',
});

// Organisation → Subscription
OrganisationModel.hasOne(Subscription, {
    foreignKey: 'organization_id',
    as: 'subscription',
});

// Organisation → Projects
OrganisationModel.hasMany(ProjectModel, {
    foreignKey: 'organisation_id',
    as: 'projects',
});

// Organisation → Assistances
OrganisationModel.hasMany(AssistanceModel, {
    foreignKey: 'organization_id',
    as: 'assistances',
});

OrganisationModel.hasMany(AuditLogModel, {
    foreignKey: 'organisation_id',
    as: 'auditLogs'
});

export default OrganisationModel;