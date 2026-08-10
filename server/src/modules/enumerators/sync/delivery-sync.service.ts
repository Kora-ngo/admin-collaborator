import type { Transaction } from 'sequelize';
import { logAudit } from '../../../shared/utils/auditLogger.js';
import { generateUniqueUid } from '../../../shared/utils/generateUniqueUid.js';
import { SyncDeliveryRepository } from '../enumerator.repository.js';

export interface DeliverySyncContext {
    projectId: number;
    membershipId: number;
    transaction: Transaction;
    req: any;
}

export interface DeliverySyncResult {
    uid: string;
    server_id?: number;
    status: 'pending' | 'rejected';
    error?: string;
}

// EVENT-READY UNIT: processes exactly one delivery record end-to-end.
export const processDeliverySync = async (deliv: any, ctx: DeliverySyncContext): Promise<DeliverySyncResult> => {
    const { projectId, membershipId, transaction, req } = ctx;

    try{

        if (!deliv.uid || !deliv.beneficiary_id || !deliv.delivery_date) {
            return { uid: deliv.uid || 'unknown', status: 'rejected', error: 'missing_required_fields' };
        }

        if (!deliv.items?.length) {
            return { uid: deliv.uid, status: 'rejected', error: 'no_delivery_items' };
        }

        let deliveryRecord: any = null;
        let isUpdate = false; 
        
        // server_id present -> update flow
        if (deliv.server_id) {
            const existing = await SyncDeliveryRepository.findByPk(deliv.server_id, transaction);
            if (existing) {
                await SyncDeliveryRepository.update(existing, {
                    delivery_date: deliv.delivery_date,
                    notes: deliv.notes || null,
                    sync_source: 'mobile',
                    review_status: 'pending',
                    updated_at: new Date(),
                    // never touch uid / project_id / beneficiary_id / created_by_membership_id / created_at
                }, transaction);
                deliveryRecord = existing;
                isUpdate = true;
            }
        }


        // Not an update -> create new
        if (!deliveryRecord) {
            const beneficiary = await SyncDeliveryRepository.findApprovedBeneficiary(deliv.beneficiary_id, projectId, transaction);
            if (!beneficiary) {
                return { uid: deliv.uid, status: 'rejected', error: 'beneficiary_not_found_or_not_approved' };
            }

            const assistanceIds = deliv.items.map((item: any) => item.assistance_id);
            const validAssistances = await SyncDeliveryRepository.findValidAssistances(assistanceIds, transaction);
            if (validAssistances.length !== assistanceIds.length) {
                return { uid: deliv.uid, status: 'rejected', error: 'invalid_assistance_items' };
            }

            const deliveryUid = await generateUniqueUid('deliveries');
            deliveryRecord = await SyncDeliveryRepository.create({
                uid: deliveryUid,
                project_id: projectId,
                beneficiary_id: deliv.beneficiary_id,
                delivery_date: deliv.delivery_date,
                notes: deliv.notes || null,
                created_by_membership_id: membershipId,
                sync_source: 'mobile',
                review_status: 'pending',
            }, transaction);
        }



        // Items — full replace on update, straight insert on create
        if (isUpdate) {
            await SyncDeliveryRepository.destroyItems(deliv.server_id, transaction);
        }
        const itemsData = deliv.items.map((item: any) => ({
            delivery_id: deliv.server_id ?? deliveryRecord.id,
            assistance_id: item.assistance_id,
            quantity: item.quantity,
        }));
        await SyncDeliveryRepository.bulkCreateItems(itemsData, transaction);


        try {
            await logAudit({
                req,
                action: 'Synched',
                entityType: 'delivery',
                entityId: deliveryRecord.id,
                platform: 'mobile',
                metadata: { status: 'pending' },
            });
        } catch (auditError) {
            console.warn('Audit log failed (non-critical):', auditError);
        }

        return { uid: deliv.uid, server_id: deliveryRecord.id, status: 'pending' };

    } catch (error: any) {
        console.error(`Error processing delivery ${deliv.uid || 'unknown'}:`, error);
        return { uid: deliv.uid || 'unknown', status: 'rejected', error: 'server_error' };
    }
}