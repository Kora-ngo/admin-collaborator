import AuditLogModel from '../models/AuditLog.js';
import type { Request } from 'express';

interface LogAuditParams {
    req: Request;
    action: string;
    entityType: 'auth' | 'beneficiary' | 'delivery' | 'project' | 'user' | 'sync';
    entityId?: number;
    batchUid?: string;
    metadata?: any;
    platform?: 'web' | 'mobile';
}

export const logAudit = async ({
    req,
    action,
    entityType,
    entityId,
    batchUid,
    metadata,
    platform = 'web'
}: LogAuditParams): Promise<void> => {
    try {
        const authUser = req.user;

        if (!authUser || !authUser.membershipId || !authUser.organizationId) {
            console.warn('Audit log skipped: No authenticated user');
            return;
        }

        // Get IP address
        const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
                         req.socket.remoteAddress ||
                         'unknown';

                await AuditLogModel.create({
                    organisation_id: authUser.organizationId,
                    actor_membership_id: authUser.membershipId,
                    actor_role: authUser.role,
                    action,
                    entity_type: entityType,
                    ...(entityId !== undefined && { entity_id: entityId }),
                    ...(batchUid !== undefined && { batch_uid: batchUid }),
                    metadata: metadata ?? null,           // keep null instead of undefined
                    ip_address: ipAddress,
                    platform: platform
                });

        console.log(`✓ Audit logged: ${action} by ${authUser.role}`);
    } catch (error) {
        console.error('Failed to log audit:', error);
        // Don't throw - audit logging should not break the main flow
    }
};