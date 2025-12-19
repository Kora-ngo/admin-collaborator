export interface Membership {
  id: number;
  user_id: number;
  organization_id: number;
  role: "admin" | "collaborator" | "enumerator";
  status: "pending" | "active" | "suspended" | "deleted" | "invited";
  date_of: string;
}