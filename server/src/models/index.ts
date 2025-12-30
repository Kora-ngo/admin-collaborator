import AssistanceModel from "./Assistance.js";
import AssistanceTypeModel from "./AssistanceType.js";

// === DEFINE ASSOCIATIONS HERE ===
AssistanceModel.belongsTo(AssistanceTypeModel, {
    foreignKey: 'assistance_id',
    as: 'assistanceType'
});

AssistanceTypeModel.hasMany(AssistanceModel, {
    foreignKey: 'assistance_id',
    as: 'assistances',
});


export {
    AssistanceModel,
    AssistanceTypeModel,
    // ...export others
};