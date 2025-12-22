import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Organisation = sequelize.define("Organisation", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    uid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    access_code: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null
    },
    founded_at: {
        type: DataTypes.DATE(6),
        allowNull: false,
        defaultValue: DataTypes.NOW
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
    timestamps: false,
    tableName: "organisation"
});

export default Organisation;