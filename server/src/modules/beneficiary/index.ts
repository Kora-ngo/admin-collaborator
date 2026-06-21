import BeneficiaryModel from "./beneficiary.model.js";
import ProjectModel from "../project/project.model.js";
import MembershipModel from "../membership/membership.model.js";
import BeneficiaryMemberModel from "../beneficiary-member/beneficiary-member.model.js";
import DeliveryModel from "../delivery/delivery.model.js";

// Associations for BeneficiaryModel — extracted from the former models/index.ts

// ========================================
// BENEFICIARY RELATIONS
// ========================================

// Beneficiary -> Project
BeneficiaryModel.belongsTo(ProjectModel, {
    foreignKey: 'project_id',
    as: 'project'
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

BeneficiaryModel.hasMany(DeliveryModel, {
    foreignKey: 'beneficiary_id',
    as: 'deliveries'
});

export default BeneficiaryModel;