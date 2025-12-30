export interface Membership {
  id: number;
  user_id: number;
  organization_id: number;
  role: string;
  status: string;
  date_of?: Date;
}
