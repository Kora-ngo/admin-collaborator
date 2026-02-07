export interface SubscriptionAttributes {
    id: number;
    uid: number;
    organization_id: number;
    plan: 'test' | 'free' | 'pro' | 'enterprise';
    started_at?: Date;
    ends_at?: Date;
    status: string;
}
export type SubscriptionCreationAttributes = Omit<SubscriptionAttributes, 'id'>;
//# sourceMappingURL=subscriptions%20.d.ts.map