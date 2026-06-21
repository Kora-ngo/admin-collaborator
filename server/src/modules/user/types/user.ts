import { Model } from 'sequelize';


export interface UserAttributes {
  id: number;
  uid: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  status: string;      
  date_of?: Date;    
  update_of?: Date;
}

// for create() calls where id is not required
export type UserCreationAttributes = Omit<UserAttributes, 'id'> & { id?: number };