import { DataTypes, Model } from "sequelize";
import type { AuditLogAttributes, AuditLogCreationAttributes } from "../types/auditLog.js";
import sequelize from "../config/database.js";

class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes>
    implements AuditLogAttributes {
    public id!: number;
    public organisation_id!: number;
    public actor_membership_id!: number;
    public actor_role!: string;
    public action!: string;
    public entity_type!: 'auth' | 'beneficiary' | 'delivery' | 'project' | 'user' | 'sync';
    public entity_id?: number;
    public batch_uid?: string;
    public metadata?: any;
    public ip_address?: string;
    public platform!: 'web' | 'mobile';
    public created_at!: Date;
}

const AuditLogModel = AuditLog.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    organisation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    actor_membership_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    actor_role: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    entity_type: {
        type: DataTypes.ENUM('auth', 'beneficiary', 'delivery', 'project', 'user', 'sync'),
        allowNull: false,
    },
    entity_id: {
        type: DataTypes.INTEGER,
    },
    batch_uid: {
        type: DataTypes.STRING,
    },
    metadata: {
        type: DataTypes.JSON,
    },
    ip_address: {
        type: DataTypes.STRING,
    },
    platform: {
        type: DataTypes.ENUM('web', 'mobile'),
        allowNull: false,
        defaultValue: 'web'
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    timestamps: false,
    indexes: [
        { fields: ['organisation_id'] },
        { fields: ['actor_membership_id'] },
        { fields: ['action'] },
        { fields: ['entity_type'] },
        { fields: ['created_at'] }
    ]
});

export default AuditLogModel;