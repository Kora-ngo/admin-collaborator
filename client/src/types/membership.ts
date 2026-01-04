import type { User } from "./user";

export interface Membership extends User {
  id: number;
  user_id: number;
  organization_id: number;
  role: string;
  status: string;
  date_of?: Date;
  user?: User
}
