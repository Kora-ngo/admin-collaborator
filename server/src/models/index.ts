import AssistanceModel from "./Assistance.js";
import AssistanceTypeModel from "./AssistanceType.js";
import BeneficiaryModel from "./beneficiary.js";
import BeneficiaryMemberModel from "./BeneficiaryMember.js";
import DeliveryModel from "./Delivery.js";
import DeliveryItemModel from "./DeliveryItem.js";
import Media from "./media.js";
import MediaLink from "./mediaLink.js";
import MembershipModel from "./Membership.js";
import OrganisationModel from "./Organisation.js";
import ProjectModel from "./project.js";
import ProjectAssistanceModel from "./projectAssistance.js";
import ProjectMemberModel from "./projectMember.js";
import SyncBatchModel from "./SyncBatch.js";
import UserModel from "./User.js";

// === DEFINE ASSOCIATIONS HERE ===

// ASSISTANCE -- TYPE --------------------------------------------->
AssistanceModel.belongsTo(AssistanceTypeModel, {
    foreignKey: 'assistance_id',
    as: 'assistanceType'
});

AssistanceTypeModel.hasMany(AssistanceModel, {
    foreignKey: 'assistance_id',
    as: 'assistances',
});




// MEMBERSHIP -- USER -- ORGANSIATIOn ---------------------------->
MembershipModel.belongsTo(UserModel, {
    foreignKey: 'user_id',
    as: 'user'
});

MembershipModel.belongsTo(OrganisationModel, {
    foreignKey: 'organization_id',
    as: 'organization'
});

UserModel.hasMany(MembershipModel, {
    foreignKey: 'user_id',
    as: 'memberships',
});

OrganisationModel.hasMany(MembershipModel, {
    foreignKey: 'organization_id',
    as: 'memberships',
});





// PROJECT -- PROJECT_MEMBER -- PROJECT_ASSISTANCE ------------------------->

// Project -> ProjectMembers
ProjectModel.hasMany(ProjectMemberModel, {
    foreignKey: 'project_id',
    as: 'members'
});

ProjectMemberModel.belongsTo(ProjectModel, {
    foreignKey: 'project_id',
    as: 'project'
});

// ProjectMember -> Membership
ProjectMemberModel.belongsTo(MembershipModel, {
    foreignKey: 'membership_id',
    as: 'membership'
});

MembershipModel.hasMany(ProjectMemberModel, {
    foreignKey: 'membership_id',
    as: 'projectMemberships'
});

// Project -> ProjectAssistances
ProjectModel.hasMany(ProjectAssistanceModel, {
    foreignKey: 'project_id',
    as: 'assistances'
});

ProjectAssistanceModel.belongsTo(ProjectModel, {
    foreignKey: 'project_id',
    as: 'project'
});

// ProjectAssistance -> Assistance
ProjectAssistanceModel.belongsTo(AssistanceModel, {
    foreignKey: 'assistance_id',
    as: 'assistance'
});

AssistanceModel.hasMany(ProjectAssistanceModel, {
    foreignKey: 'assistance_id',
    as: 'projectAssistances'
});




// MEDIA -- MEDIA_LINK  ------------------------->

// Media → Organisation
Media.belongsTo(OrganisationModel, {
    foreignKey: 'organisation_id',
    as: 'organization'
});

// Media → Uploader (Membership)
Media.belongsTo(MembershipModel, {
    foreignKey: 'uploaded_by_membership_id',
    as: 'uploader'
});

// MediaLink → Media
MediaLink.belongsTo(Media, {
    foreignKey: 'media_id',
    as: 'media'
});

Media.hasMany(MediaLink, {
    foreignKey: 'media_id',
    as: 'links'
});






// Polymorphic: MediaLink points to any entity
MediaLink.belongsTo(ProjectModel, {
    foreignKey: 'entity_id',
    constraints: false,
    scope: {
        entity_type: 'project'
    },
    as: 'project'
});

ProjectModel.hasMany(MediaLink, {
    foreignKey: 'entity_id',
    constraints: false,
    scope: {
        entity_type: 'project'
    },
    as: 'mediaLinks'
});





// ========================================
// BENEFICIARY RELATIONS
// ========================================

// Beneficiary -> Project
BeneficiaryModel.belongsTo(ProjectModel, {
    foreignKey: 'project_id',
    as: 'project'
});

ProjectModel.hasMany(BeneficiaryModel, {
    foreignKey: 'project_id',
    as: 'beneficiaries'
});

// Beneficiary -> Creator (Membership)
BeneficiaryModel.belongsTo(MembershipModel, {
    foreignKey: 'created_by_membership_id',
    as: 'createdBy'
});

// Beneficiary -> Reviewer (Membership)
BeneficiaryModel.belongsTo(MembershipModel, {
    foreignKey: 'reviewed_by_membership_id',
    as: 'reviewedBy'
});

// Beneficiary -> BeneficiaryMembers
BeneficiaryModel.hasMany(BeneficiaryMemberModel, {
    foreignKey: 'beneficiary_id',
    as: 'members'
});

BeneficiaryMemberModel.belongsTo(BeneficiaryModel, {
    foreignKey: 'beneficiary_id',
    as: 'beneficiary'
});

// ========================================
// DELIVERY RELATIONS
// ========================================

// Delivery -> Project
DeliveryModel.belongsTo(ProjectModel, {
    foreignKey: 'project_id',
    as: 'project'
});

ProjectModel.hasMany(DeliveryModel, {
    foreignKey: 'project_id',
    as: 'deliveries'
});

// Delivery -> Beneficiary
DeliveryModel.belongsTo(BeneficiaryModel, {
    foreignKey: 'beneficiary_id',
    as: 'beneficiary'
});

BeneficiaryModel.hasMany(DeliveryModel, {
    foreignKey: 'beneficiary_id',
    as: 'deliveries'
});

// Delivery -> Creator (Membership)
DeliveryModel.belongsTo(MembershipModel, {
    foreignKey: 'created_by_membership_id',
    as: 'createdBy'
});

// Delivery -> Reviewer (Membership)
DeliveryModel.belongsTo(MembershipModel, {
    foreignKey: 'reviewed_by_membership_id',
    as: 'reviewedBy'
});

// Delivery -> DeliveryItems
DeliveryModel.hasMany(DeliveryItemModel, {
    foreignKey: 'delivery_id',
    as: 'items'
});

DeliveryItemModel.belongsTo(DeliveryModel, {
    foreignKey: 'delivery_id',
    as: 'delivery'
});

// DeliveryItem -> Assistance
DeliveryItemModel.belongsTo(AssistanceModel, {
    foreignKey: 'assistance_id',
    as: 'assistance'
});

AssistanceModel.hasMany(DeliveryItemModel, {
    foreignKey: 'assistance_id',
    as: 'deliveryItems'
});

// ========================================
// SYNC BATCH RELATIONS
// ========================================

// SyncBatch -> Project
SyncBatchModel.belongsTo(ProjectModel, {
    foreignKey: 'project_id',
    as: 'project'
});

ProjectModel.hasMany(SyncBatchModel, {
    foreignKey: 'project_id',
    as: 'syncBatches'
});

// SyncBatch -> Submitter (Membership)
SyncBatchModel.belongsTo(MembershipModel, {
    foreignKey: 'submitted_by_membership_id',
    as: 'submittedBy'
});

// SyncBatch -> Reviewer (Membership)
SyncBatchModel.belongsTo(MembershipModel, {
    foreignKey: 'reviewed_by_membership_id',
    as:'reviewedBy'

});


export {
    AssistanceModel,
    AssistanceTypeModel,
    
    MembershipModel,
    UserModel,
    OrganisationModel,


    ProjectModel,
    ProjectMemberModel,
    ProjectAssistanceModel,


    Media,
    MediaLink,

    BeneficiaryModel,
    BeneficiaryMemberModel,
    DeliveryModel,
    DeliveryItemModel,
    SyncBatchModel,

};