import AssistanceModel from "./Assistance.js";
import AssistanceTypeModel from "./AssistanceType.js";
import MembershipModel from "./Membership.js";
import OrganisationModel from "./Organisation.js";
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



export {
    AssistanceModel,
    AssistanceTypeModel,
    
    MembershipModel,
    UserModel,
    OrganisationModel
};