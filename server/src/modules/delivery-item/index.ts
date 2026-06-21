import DeliveryItemModel from "./delivery-item.model.js";
import DeliveryModel from "../delivery/delivery.model.js";
import AssistanceModel from "../assistance/assistance.model.js";

// Associations for DeliveryItemModel — extracted from the former models/index.ts

DeliveryItemModel.belongsTo(DeliveryModel, {
    foreignKey: 'delivery_id',
    as: 'delivery'
});

// DeliveryItem -> Assistance
DeliveryItemModel.belongsTo(AssistanceModel, {
    foreignKey: 'assistance_id',
    as: 'assistance'
});

export default DeliveryItemModel;