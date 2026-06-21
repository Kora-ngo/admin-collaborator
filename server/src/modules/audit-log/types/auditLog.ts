export interface AuditLogAttributes {
    id: number;
    organisation_id: number;
    actor_membership_id: number;
    actor_role: string;
    action: string;
    entity_type: 'auth' | 'beneficiary' | 'delivery' | 'project' | 'user' | 'sync';
    entity_id?: number;
    batch_uid?: string;
    metadata?: any; // JSON object
    ip_address?: string;
    platform: 'web' | 'mobile';
    created_at: Date;
}

export type AuditLogCreationAttributes = Omit<AuditLogAttributes, 'id' | 'created_at'>;

