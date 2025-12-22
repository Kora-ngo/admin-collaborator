import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import type { MembershipAttributes, MembershipCreationAttributes } from "../types/memebership.js";



class Membership extends Model<MembershipAttributes, MembershipCreationAttributes> implements MembershipAttributes {
  public id!: number;
  public user_id!: number;
  public organization_id!: number;
  public role!: string;
  public date_of!: Date;
}


const MembershipModel = Membership.init( {
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
    role: {
        type: DataTypes.ENUM('admin', 'collaborator', 'enumerator'),
        allowNull: false,
        defaultValue: 'admin'
    },

    date_of: {
        type: DataTypes.DATE(6),
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, 
{
    sequelize,
    modelName: 'Membership',
    tableName: 'Membership', // or whatever your table name is
    timestamps: false,
  }
);

export default Membership;