// models/BeneficiaryMember.ts

import { DataTypes, Model } from "sequelize";
import type { BeneficiaryMemberAttributes, BeneficiaryMemberCreationAttributes } from "../types/beneficiary.js";
import sequelize from "../config/database.js";

class BeneficiaryMember extends Model<BeneficiaryMemberAttributes, BeneficiaryMemberCreationAttributes>
    implements BeneficiaryMemberAttributes {
    public id!: number;
    public beneficiary_id!: number;
    public full_name!: string;
    public gender!: 'male' | 'female' | 'other';
    public date_of_birth!: Date;
    public relationship!: string;
}

const BeneficiaryMemberModel = BeneficiaryMember.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    beneficiary_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: false,
    },
    date_of_birth: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    relationship: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'BeneficiaryMember',
    tableName: 'beneficiary_members',
    timestamps: false,
});

export default BeneficiaryMemberModel;