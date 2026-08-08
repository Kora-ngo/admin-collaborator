import ProjectModel from "./project.model.js";
import ProjectMemberModel from "../project-member/project.member.model.js";
import ProjectAssistanceModel from "../project-assistance/project-assistance.model.js";
import OrganisationModel from "../organisation/organisation.model.js";
import MembershipModel from "../membership/membership.model.js";
import MediaLink from "../media-link/media-link.model.js";
import BeneficiaryModel from "../beneficiary/beneficiary.model.js";
import DeliveryModel from "../delivery/delivery.model.js";
import SyncBatchModel from "../sync-batch/sync-batch.model.js";
import ProjectRegionModel from "../project-region/project-region.model.js";

// Associations for ProjectModel — extracted from the former models/index.ts

// PROJECT -- PROJECT_MEMBER -- PROJECT_ASSISTANCE ------------------------->

// Project -> ProjectMembers
ProjectModel.hasMany(ProjectMemberModel, {
    foreignKey: 'project_id',
    as: 'members'
});

// Project -> ProjectAssistances
ProjectModel.hasMany(ProjectAssistanceModel, {
    foreignKey: 'project_id',
    as: 'assistances'
});

// Project → Organisation ------------------------->
ProjectModel.belongsTo(OrganisationModel, {
    foreignKey: 'organisation_id',
    as: 'organisation',
});

// Project → Creator (Membership)
ProjectModel.belongsTo(MembershipModel, {
    foreignKey: 'created_by',
    as: 'creator',
});

ProjectModel.hasMany(MediaLink, {
    foreignKey: 'entity_id',
    constraints: false,
    scope: {
        entity_type: 'project'
    },
    as: 'mediaLinks'
});

ProjectModel.hasMany(BeneficiaryModel, {
    foreignKey: 'project_id',
    as: 'beneficiaries'
});

ProjectModel.hasMany(DeliveryModel, {
    foreignKey: 'project_id',
    as: 'deliveries'
});

ProjectModel.hasMany(SyncBatchModel, {
    foreignKey: 'project_id',
    as: 'syncBatches'
});


// Project -> ProjectRegions
ProjectModel.hasMany(ProjectRegionModel, {
    foreignKey: 'project_id',
    as: 'regions',
});

ProjectRegionModel.belongsTo(ProjectModel, {
    foreignKey: 'project_id',
    as: 'project',
});

export default ProjectModel;