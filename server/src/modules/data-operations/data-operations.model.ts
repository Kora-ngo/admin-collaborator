import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database.js";
import type { DataOperationAttributes, DataOperationCreationAttributes } from "./types/data-operations.js";

class DataOperation extends Model<DataOperationAttributes, DataOperationCreationAttributes>
    implements DataOperationAttributes {
    public id!: number;
    public uid!: bigint;
    public organization_id!: number;
    public performed_by_user_id!: number;
    public type!: 'IMPORT' | 'EXPORT';
    public dataset!: 'BENEFICIARIES' | 'PROJECTS' | 'DELIVERIES' | 'USERS';
    public status!: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    public file_name!: string;
    public file_type!: 'XLSX' | 'CSV';
    public total_records?: number;
    public successful_records?: number;
    public failed_records?: number;
    public started_at?: Date;
    public completed_at?: Date;
    public error_report_url?: string;
    public created_at!: Date;
}

const DataOperationModel = DataOperation.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    uid: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    performed_by_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('IMPORT', 'EXPORT'),
        allowNull: false,
    },
    dataset: {
        type: DataTypes.ENUM('BENEFICIARIES', 'PROJECTS', 'DELIVERIES', 'USERS'),
        allowNull: false,
    },
    status: {
        // Stored as a plain string (not a native ENUM), consistent with
        // organisation.status / users.status / membership.status.
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'PENDING',
    },
    file_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    file_type: {
        type: DataTypes.ENUM('XLSX', 'CSV'),
        allowNull: false,
    },
    total_records: {
        type: DataTypes.INTEGER,
    },
    successful_records: {
        type: DataTypes.INTEGER,
    },
    failed_records: {
        type: DataTypes.INTEGER,
    },
    started_at: {
        type: DataTypes.DATE,
    },
    completed_at: {
        type: DataTypes.DATE,
    },
    error_report_url: {
        type: DataTypes.STRING,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    modelName: 'DataOperation',
    tableName: 'data_operations',
    timestamps: false,
});

export default DataOperationModel;