export interface Subscription {
    expiresAt: string;
    isActive: string;
    plan: string;
    status?: string | 'true';      
}