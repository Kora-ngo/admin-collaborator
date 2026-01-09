import AssistanceModel from "./Assistance.js";
import AssistanceTypeModel from "./AssistanceType.js";
import Media from "./media.js";
import MediaLink from "./mediaLink.js";
import MembershipModel from "./Membership.js";
import OrganisationModel from "./Organisation.js";
import ProjectModel from "./project.js";
import ProjectAssistanceModel from "./projectAssistance.js";
import ProjectMemberModel from "./projectMember.js";
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
};