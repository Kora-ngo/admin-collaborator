import AssistanceModel from "./assistance.model.js";
import AssistanceTypeModel from "../assistance-type/assistance-type.model.js";
import ProjectAssistanceModel from "../project-assistance/project-assistance.model.js";
import DeliveryItemModel from "../delivery-item/delivery-item.model.js";

// Associations for AssistanceModel — extracted from the former models/index.ts

// ASSISTANCE -- TYPE --------------------------------------------->
AssistanceModel.belongsTo(AssistanceTypeModel, {
    foreignKey: 'assistance_id',
    as: 'assistanceType'
});

AssistanceModel.hasMany(ProjectAssistanceModel, {
    foreignKey: 'assistance_id',
    as: 'projectAssistances'
});

AssistanceModel.hasMany(DeliveryItemModel, {
    foreignKey: 'assistance_id',
    as: 'deliveryItems'
});

export default AssistanceModel;