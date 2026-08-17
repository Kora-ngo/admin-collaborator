import type { Transaction } from 'sequelize';
import { logAudit } from '../../../shared/utils/auditLogger.js';
import { generateUniqueUid } from '../../../shared/utils/generateUniqueUid.js';
import { SyncBeneficiaryRepository } from '../enumerator.repository.js';

export interface BeneficiarySyncContext {
    projectId: number;
    membershipId: number;
    transaction: Transaction;
    req: any; // passed through only for audit logging (IP, etc.)
}

export interface BeneficiarySyncResult {
    uid: string;
    server_id?: number;
    status: 'pending' | 'rejected';
    action?: 'created' | 'updated';
    error?: string;
    inital_stautus?: string;
}

export const processBeneficiarySync = async (benef: any, ctx: BeneficiarySyncContext): Promise<BeneficiarySyncResult> => {
      const { projectId, membershipId, transaction, req } = ctx;

      try{
            // 1. Required fields
            if (!benef.uid || !benef.family_code || !benef.head_name) {
                return { uid: benef.uid || 'unknown', status: 'rejected', error: 'missing_required_fields' };
            }

            // 2. server_id present -> update flow
            if (benef.server_id) {
                const existing = await SyncBeneficiaryRepository.findByPk(benef.server_id, transaction);

                if (existing) {
                    await SyncBeneficiaryRepository.update(existing, {
                        family_code: benef.family_code,
                        head_name: benef.head_name,
                        phone: benef.phone || null,
                        region: benef.region || null,
                        village: benef.village || null,
                        review_status: 'pending',
                        sync_source: 'mobile',
                        updated_at: new Date(),
                    }, transaction);

                    if (benef.members?.length > 0) {
                        await SyncBeneficiaryRepository.destroyMembers(benef.server_id, transaction);
                        for (const member of benef.members) {
                            if (!member.full_name || !member.gender || !member.relationship) continue;
                            await SyncBeneficiaryRepository.createMember({
                                beneficiary_id: benef.server_id,
                                full_name: member.full_name,
                                gender: member.gender,
                                date_of_birth: member.date_of_birth,
                                relationship: member.relationship,
                            }, transaction);
                        }
                    }

                    return { uid: benef.uid, server_id: existing.id, status: 'pending', action: 'updated' };
                }
                // server_id sent but not found -> fall through to create flow
            }


            // 3. Duplicate family_code check (new record flow)
            const duplicate = await SyncBeneficiaryRepository.findDuplicateByFamilyCode(projectId, benef.family_code, transaction);
            if (duplicate) {
                return {
                    uid: benef.uid,
                    server_id: duplicate.id,
                    status: 'rejected',
                    inital_stautus: duplicate.dataValues.review_status,
                    error: 'duplicate_family_code',
                };
            }


            // 4. Insert beneficiary
            const beneficiaryUid = await generateUniqueUid('beneficiaries');
            const newBeneficiary = await SyncBeneficiaryRepository.create({
                uid: beneficiaryUid,
                project_id: projectId,
                family_code: benef.family_code,
                head_name: benef.head_name,
                phone: benef.phone || null,
                region: benef.region || null,
                village: benef.village || null,
                created_by_membership_id: membershipId,
                sync_source: 'mobile',
                review_status: 'pending',
            }, transaction);


            // 5. Insert members
            if (benef.members?.length > 0) {
                for (const member of benef.members) {
                    if (!member.full_name || !member.gender || !member.relationship) continue;
                    await SyncBeneficiaryRepository.createMember({
                        beneficiary_id: newBeneficiary.id,
                        full_name: member.full_name,
                        gender: member.gender,
                        date_of_birth: member.date_of_birth,
                        relationship: member.relationship,
                    }, transaction);
                }
            }


            // Audit log is best-effort — never fails the sync
            try {
                await logAudit({
                    req,
                    action: 'Synched',
                    entityType: 'beneficiary',
                    entityId: newBeneficiary.id,
                    platform: 'mobile',
                    metadata: { status: 'pending' },
                });
            } catch (auditError) {
                console.warn('Audit log failed (non-critical):', auditError);
            }

            return { uid: benef.uid, server_id: newBeneficiary.id, status: 'pending', action: 'created' };

    } catch (error: any) {
        console.error(`Error processing beneficiary ${benef.uid || 'unknown'}:`, error);
        return { uid: benef.uid || 'unknown', status: 'rejected', error: 'server_error' };
    }
}