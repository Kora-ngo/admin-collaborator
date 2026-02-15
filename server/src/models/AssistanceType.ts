import { DataTypes, Model } from "sequelize";
import type { AssistanceTypeAttributes, AssistanceTypeCreationAttributes } from "../types/assistance.js"; // Adjust the path if needed
import sequelize from '../config/database.js';

class AssistanceType extends Model<AssistanceTypeAttributes, AssistanceTypeCreationAttributes>
    implements AssistanceTypeAttributes {
    
    public id!: number;
    public name!: string;
    public unit!: string;
    public organization_id!: number;
    public date_of!: Date;
    public update_of!: Date;
}

const AssistanceTypeModel = AssistanceType.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        organization_id: {  
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        date_of: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        update_of: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'AssistanceType', 
        tableName: 'assistance_type',
        timestamps: false,
    }
);

export default AssistanceTypeModel;