// models/User.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import type { UserAttributes, UserCreationAttributes } from '../types/user.js'; // or wherever you put it

// We extend Model and tell it the type of attributes
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public uid!: number;
  public name!: string;
  public email!: string;
  public phone!: string;
  public password!: string;
  public status!: string;
  public date_of?: Date;
  public update_of?: Date;

}

const UserModel = User.init(
  {
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
      unique: true, // you probably want this
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'true', // string 'true', not boolean
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


export default UserModel;