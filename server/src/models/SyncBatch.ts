// models/SyncBatch.ts

import { DataTypes, Model } from "sequelize";
import type { SyncBatchAttributes, SyncBatchCreationAttributes } from "../types/beneficiary.js";
import sequelize from "../config/database.js";

class SyncBatch extends Model<SyncBatchAttributes, SyncBatchCreationAttributes>
    implements SyncBatchAttributes {
    public id!: number;
    public uid!: number;
    public project_id!: number;
    public submitted_by_membership_id!: number;
    public submitted_at!: Date;
    public status!: 'pending' | 'approved' | 'rejected';
    public reviewed_by_membership_id?: number;
    public reviewed_at?: Date;
    public review_note?: string;
}

const SyncBatchModel = SyncBatch.init({
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
    submitted_by_membership_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    submitted_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    status: {
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
    modelName: 'SyncBatch',
    tableName: 'sync_batches',
    timestamps: false,
});

export default SyncBatchModel;