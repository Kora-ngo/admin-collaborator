import BeneficiaryMemberModel from "./beneficiary-member.model.js";
import BeneficiaryModel from "../beneficiary/beneficiary.model.js";

// Associations for BeneficiaryMemberModel — extracted from the former models/index.ts

BeneficiaryMemberModel.belongsTo(BeneficiaryModel, {
    foreignKey: 'beneficiary_id',
    as: 'beneficiary'
});

export default BeneficiaryMemberModel;