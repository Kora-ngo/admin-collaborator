
import { DataTypes, Model } from "sequelize";
import type { BeneficiaryAttributes, BeneficiaryCreationAttributes } from "../types/beneficiary.js";
import sequelize from "../config/database.js";

class Beneficiary extends Model<BeneficiaryAttributes, BeneficiaryCreationAttributes>
    implements BeneficiaryAttributes {
    public id!: number;
    public uid!: number;
    public project_id!: number;
    public family_code!: string;
    public head_name!: string;
    public phone?: string;
    public region?: string;
    public village?: string;
    public created_by_membership_id!: number;
    public created_at!: Date;
    public updated_at!: Date;
    public sync_source!: 'web' | 'mobile';
    public review_status!: 'pending' | 'approved' | 'rejected' | 'false';
    public reviewed_by_membership_id?: number;
    public reviewed_at?: Date;
    public review_note?: string;
}

const BeneficiaryModel = Beneficiary.init({
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
    family_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    head_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
    },
    region: {
        type: DataTypes.STRING,
    },
    village: {
        type: DataTypes.STRING,
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
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'false'),
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
    modelName: 'Beneficiary',
    tableName: 'beneficiaries',
    timestamps: false,
});

export default BeneficiaryModel;