export interface MembershipAttributes {
  id: number;
  user_id: number;
  organization_id: number;
  role: 'admin' | 'collaborator' | 'enumerator';
  status: string;
  date_of?: Date;
}

export type MembershipCreationAttributes = Omit<MembershipAttributes, 'id'>;