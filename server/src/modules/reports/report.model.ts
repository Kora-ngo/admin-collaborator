import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database.js";
import type { ReportAttributes, ReportCreationAttributes } from "./types/report.js";

class Report extends Model<ReportAttributes, ReportCreationAttributes>
    implements ReportAttributes {
    declare id: number;
    declare uid: bigint;
    declare project_id: number;
    declare organization_id: number;
    declare type: 'DATA_PACKAGE' | 'BENEFICIARIES' | 'ASSISTANCE' | 'ANALYTICS' | 'DONOR_REPORT';
    declare format: 'ZIP' | 'XLSX' | 'PDF';
    declare reporting_period_from?: string;
    declare reporting_period_to?: string;
    declare generated_by: number;
    declare generated_at?: Date;
    declare status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    declare file_type: string;
    declare file_path?: string;
    declare file_size?: number;
    declare created_at: Date;
}

const ReportModel = Report.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    uid: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('DATA_PACKAGE', 'BENEFICIARIES', 'ASSISTANCE', 'ANALYTICS', 'DONOR_REPORT'),
        allowNull: false,
    },
    format: {
        type: DataTypes.ENUM('ZIP', 'XLSX', 'PDF'),
        allowNull: false,
    },
    reporting_period_from: {
        type: DataTypes.DATEONLY,
    },
    reporting_period_to: {
        type: DataTypes.DATEONLY,
    },
    generated_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    generated_at: {
        type: DataTypes.DATE,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'PENDING',
    },
    file_type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'general',
    },
    file_path: {
        type: DataTypes.STRING(500),
    },
    file_size: {
        type: DataTypes.BIGINT,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    modelName: 'Report',
    tableName: 'reports',
    timestamps: false,
});

export default ReportModel;