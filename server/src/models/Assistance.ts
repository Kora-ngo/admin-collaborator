import { DataTypes, Model } from "sequelize";
import type { AssistanceAttributes, AssistanceCreationAttributes } from "../types/assistance.js";
import sequelize from '../config/database.js';

class Assistance extends Model<AssistanceAttributes, AssistanceCreationAttributes> implements AssistanceAttributes {
    public id!: number;
    public uid!: number;
    public name!: string;
    public description!: string;
    public assistance_id!: number;
    public created_by!: number;
    public status!: string;
    public date_of!: Date;
    public update_of!: Date;
}

const AssistanceModel = Assistance.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    uid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.STRING,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'true',
    },

    assistance_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
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
    modelName: 'User',
    tableName: 'users',
    timestamps: true, 
  }

);

export default AssistanceModel;