import AssistanceModel from "./Assistance.js";
import AssistanceTypeModel from "./AssistanceType.js";
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

// Project → Organisation --->
ProjectModel.belongsTo(OrganisationModel, {
    foreignKey: 'organisation_id',
    as: 'organization'
});


// Project Members --->
ProjectModel.hasMany(ProjectMemberModel, {
    foreignKey: 'project_id',
    as: 'members'
});


ProjectMemberModel.belongsTo(ProjectModel, {
    foreignKey: 'project_id',
    as: 'project'
});


ProjectMemberModel.belongsTo(MembershipModel, {
    foreignKey: 'membership_id',
    as: 'membership'
});


MembershipModel.hasMany(ProjectMemberModel, {
    foreignKey: 'membership_id',
    as: 'projectAssignments'
});



// Project Assistance (allowed types) -->
ProjectModel.hasMany(ProjectAssistanceModel, {
    foreignKey: 'project_id',
    as: 'allowedAssistances'
});

ProjectAssistanceModel.belongsTo(ProjectModel, {
    foreignKey: 'project_id',
    as: 'project'
});

ProjectAssistanceModel.belongsTo(AssistanceModel, {
    foreignKey: 'assistance_id',
    as: 'assistance'
});

AssistanceModel.hasMany(ProjectAssistanceModel, {
    foreignKey: 'assistance_id',
    as: 'projectAllowances'
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
};