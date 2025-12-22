import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Membership = sequelize.define("Membership", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    
    roles: {
        type: DataTypes.ENUM('admin', 'collaborator', 'enumerator'),
        allowNull: false,
        defaultValue: 'admin'
    },

    date_of: {
        type: DataTypes.DATE(6),
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: false,
    tableName: "membership"
});

export default Membership;