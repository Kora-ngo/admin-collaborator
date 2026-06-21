import DeliveryModel from "./delivery.model.js";
import ProjectModel from "../project/project.model.js";
import BeneficiaryModel from "../beneficiary/beneficiary.model.js";
import MembershipModel from "../membership/membership.model.js";
import DeliveryItemModel from "../delivery-item/delivery-item.model.js";

// Associations for DeliveryModel — extracted from the former models/index.ts

// ========================================
// DELIVERY RELATIONS
// ========================================

// Delivery -> Project
DeliveryModel.belongsTo(ProjectModel, {
    foreignKey: 'project_id',
    as: 'project'
});

// Delivery -> Beneficiary
DeliveryModel.belongsTo(BeneficiaryModel, {
    foreignKey: 'beneficiary_id',
    as: 'beneficiary'
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

export default DeliveryModel;