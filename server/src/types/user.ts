export interface User {
  id?: number;
  uid: number;
  name: string;
  email: string;
  password_hash: string | null;
  status: number;
  date_of: string;
  update_of: string | null;
}