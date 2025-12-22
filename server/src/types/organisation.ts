export type Organisation = {
  id: number;
  uid: number;
  name: string;
  access_code: string;
  description: string | null;
  founded_at: string | null;
  country: string | "Cameroon"; 
  region: string | null;
  admin: string;
  email: string;
  phone: string;
  status: string; 
  date_of: string | null;
  update_of: string | null;
}