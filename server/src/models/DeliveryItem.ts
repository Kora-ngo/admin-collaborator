// models/DeliveryItem.ts

import { DataTypes, Model } from "sequelize";
import type { DeliveryItemAttributes, DeliveryItemCreationAttributes } from "../types/beneficiary.js";
import sequelize from "../config/database.js";

class DeliveryItem extends Model<DeliveryItemAttributes, DeliveryItemCreationAttributes>
    implements DeliveryItemAttributes {
    public id!: number;
    public delivery_id!: number;
    public assistance_id!: number;
    public quantity!: number;
}

const DeliveryItemModel = DeliveryItem.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    delivery_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    assistance_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'DeliveryItem',
    tableName: 'delivery_items',
    timestamps: false,
});

export default DeliveryItemModel;