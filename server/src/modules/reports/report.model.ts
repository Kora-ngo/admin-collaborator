import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database.js";
import type { ReportAttributes, ReportCreationAttributes } from "./types/report.js";

class Report extends Model<ReportAttributes, ReportCreationAttributes>
    implements ReportAttributes {
    public id!: number;
    public uid!: bigint;
    public project_id!: number;
    public organization_id!: number;
    public type!: 'DATA_PACKAGE' | 'BENEFICIARIES' | 'ASSISTANCE' | 'ANALYTICS' | 'DONOR_REPORT';
    public format!: 'ZIP' | 'XLSX' | 'PDF';
    public reporting_period_from?: string;
    public reporting_period_to?: string;
    public generated_by!: number;
    public generated_at?: Date;
    public status!: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    public file_type!: string;
    public file_path?: string;
    public file_size?: number;
    public created_at!: Date;
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