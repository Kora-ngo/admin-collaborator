import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Subscription = sequelize.define("Subscription", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    uid: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    plan: {
        type: DataTypes.ENUM('free', 'pro', 'enterprise'),
        allowNull: false,
        dialectTypes: 'free'
    },
    started_at: {
        type: DataTypes.DATE(6),
        allowNull: false
    },
    ends_at: {
        type: DataTypes.DATE(6),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING(45),
        allowNull: false
    }
}, {
    timestamps: false,
    tableName: "subscription"
});

export default Subscription;