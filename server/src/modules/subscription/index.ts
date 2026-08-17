import SubscriptionModel from "./subscription.model.js";
import OrganisationModel from "../organisation/organisation.model.js";

// Associations for SubscriptionModel — extracted from the former models/index.ts

SubscriptionModel.belongsTo(OrganisationModel, {
    foreignKey: 'organization_id',
    as: 'organisation',
});

export default SubscriptionModel;