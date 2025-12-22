import { Model } from 'sequelize';

// This is the shape of the user instance
export interface UserAttributes {
  id: number;
  uid: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  status: string;      // you used STRING, not BOOLEAN
  date_of?: Date;       // Sequelize DATE -> JS Date
  update_of?: Date;
}

// Optional: for create() calls where id is not required
export type UserCreationAttributes = Omit<UserAttributes, 'id'> & { id?: number };