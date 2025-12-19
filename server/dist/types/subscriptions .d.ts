export interface Subscription {
    id: number;
    uid: number;
    organization_id: number;
    plan: "free" | "pro" | "enterprise";
    started_at: string;
    ends_at: string | null;
    status: string;
}
//# sourceMappingURL=subscriptions%20.d.ts.map