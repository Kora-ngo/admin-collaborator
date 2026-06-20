export interface AuditLog {
    id: number;
    organisation_id: number;
    actor_membership_id: number;
    actor_role: 'admin' | 'collaborator' | 'enumerator';
    action: string;
    entity_type: 'auth' | 'beneficiary' | 'delivery' | 'project' | 'user' | 'sync';
    entity_id?: number;
    batch_uid?: string;
    metadata?: any;
    ip_address?: string;
    platform: 'web' | 'mobile';
    created_at: string;

    // Relations
    actor?: {
        id: number;
        role: string;
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
}