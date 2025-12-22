import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import type { SubscriptionAttributes, SubscriptionCreationAttributes } from "../types/subscriptions .js";


class Subscription extends Model<SubscriptionAttributes, SubscriptionCreationAttributes> implements SubscriptionAttributes {
  public id!: number;
  public uid!: number;
  public organization_id!: number;
  public plan!: string;
  public started_at!: Date;
  public ends_at!: Date;
  public status!: string;
}

const SubscriptionModel = Subscription.init({
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
    sequelize,
    modelName: 'Subscription',
    tableName: 'Subscription',
    timestamps: false,
});

export default SubscriptionModel;