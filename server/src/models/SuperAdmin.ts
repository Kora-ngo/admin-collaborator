import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

export interface SuperAdminAttributes {
    id: number;
    uid: number;
    name: string;
    email: string;
    password: string;
    status: string;
    last_login: Date | null;
    date_of: Date;
    update_of: Date;
}

export type SuperAdminCreationAttributes = Omit<SuperAdminAttributes, 'id'>;

class SuperAdmin extends Model<SuperAdminAttributes, SuperAdminCreationAttributes>
    implements SuperAdminAttributes {
    public id!: number;
    public uid!: number;
    public name!: string;
    public email!: string;
    public password!: string;
    public status!: string;
    public last_login!: Date | null;
    public date_of!: Date;
    public update_of!: Date;
}

const SuperAdminModel = SuperAdmin.init({
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
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'true',
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
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
}, {
    sequelize,
    modelName: 'SuperAdmin',
    tableName: 'super_admins',
    timestamps: false,
});

export default SuperAdminModel;