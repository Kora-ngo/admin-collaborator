import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import type { OrganisationAttributes, OrganisationCreationAttributes } from "../types/organisation.js";


class Organisation extends Model<OrganisationAttributes, OrganisationCreationAttributes>
  implements OrganisationAttributes {

  // Declare all fields for TypeScript intellisense and safety
  public id!: number;
  public uid!: number;
  public name!: string;
  public description!: string | null;
  public country!: string | null;
  public region!: string | null;
  public email!: string;
  public phone!: string | null;
  public created_by!: number;
  public status!: string;
  public date_of!: Date;
  public update_of!: Date;
}


const OrganisationModel = Organisation.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    uid: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null
    },
    country: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null
    },
    region: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(45),
        allowNull: true,
        defaultValue: null
    },
    created_by: {
        type: DataTypes.INTEGER,
    },
    status: {
        type: DataTypes.STRING(45),
        allowNull: false
    },
    date_of: {
        type: DataTypes.DATE(6),
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    update_of: {
        type: DataTypes.DATE(6),
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Organisation',
    tableName: 'Organisation', // adjust if your actual table name is different
    timestamps: false,
});

export default OrganisationModel;