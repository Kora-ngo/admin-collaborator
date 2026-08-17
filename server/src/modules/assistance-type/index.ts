import AssistanceModel from "../assistance/assistance.model.js";
import AssistanceTypeModel from "./assistance-type.model.js";

// Associations for AssistanceTypeModel — extracted from the former models/index.ts

AssistanceTypeModel.hasMany(AssistanceModel, {
    foreignKey: 'assistance_id',
    as: 'assistances',
});

export default AssistanceTypeModel;