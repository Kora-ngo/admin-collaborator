import AuditLogModel from "./audit-log.model.js";
import MembershipModel from "../membership/membership.model.js";
import OrganisationModel from "../organisation/organisation.model.js";

// Associations for AuditLogModel — extracted from the former models/index.ts

// AuditLog -> Membership (Actor)
AuditLogModel.belongsTo(MembershipModel, {
    foreignKey: 'actor_membership_id',
    as: 'actor'
});

// AuditLog -> Organisation
AuditLogModel.belongsTo(OrganisationModel, {
    foreignKey: 'organisation_id',
    as: 'organisation'
});

export default AuditLogModel;