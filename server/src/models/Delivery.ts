// models/Delivery.ts

import { DataTypes, Model } from "sequelize";
import type { DeliveryAttributes, DeliveryCreationAttributes } from "../types/beneficiary.js";
import sequelize from "../config/database.js";

class Delivery extends Model<DeliveryAttributes, DeliveryCreationAttributes>
    implements DeliveryAttributes {
    public id!: number;
    public uid!: number;
    public project_id!: number;
    public beneficiary_id!: number;
    public delivery_date!: Date;
    public notes?: string;
    public created_by_membership_id!: number;
    public created_at!: Date;
    public updated_at!: Date;
    public sync_source!: 'web' | 'mobile';
    public review_status!: 'pending' | 'approved' | 'rejected' | 'false';
    public reviewed_by_membership_id?: number;
    public reviewed_at?: Date;
    public review_note?: string;
}

const DeliveryModel = Delivery.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    uid: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
    },
    project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    beneficiary_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    delivery_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    notes: {
        type: DataTypes.TEXT,
    },
    created_by_membership_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    sync_source: {
        type: DataTypes.ENUM('web', 'mobile'),
        allowNull: false,
        defaultValue: 'web',
    },
    review_status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
    },
    reviewed_by_membership_id: {
        type: DataTypes.INTEGER,
    },
    reviewed_at: {
        type: DataTypes.DATE,
    },
    review_note: {
        type: DataTypes.TEXT,
    },
}, {
    sequelize,
    modelName: 'Delivery',
    tableName: 'deliveries',
    timestamps: false,
});

export default DeliveryModel;