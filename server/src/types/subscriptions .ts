export interface SubscriptionAttributes {
  id: number;
  uid: number;
  organization_id: number;
  plan: string;
  started_at: Date;
  ends_at: Date;
  status: string;
}

export type SubscriptionCreationAttributes = Omit<SubscriptionAttributes, 'id'>;