import { Op } from "sequelize";
import { BeneficiaryModel, DeliveryModel, OrganisationModel } from "../models/index.js";

export async function validateMemberDeletion(
    membershipId: number, 
    role: string, 
    organisationId: number
): Promise<{ canDelete: boolean; details: any }> {
    
    const details: any = {
        role,
        blockedBy: []
    };

    // ============================================
    // ENUMERATOR VALIDATION
    // ============================================
    if (role === 'enumerator') {
        // Check if enumerator created any beneficiaries
        const beneficiaryCount = await BeneficiaryModel.count({
            where: {
                created_by_membership_id: membershipId,
                review_status: { [Op.ne]: 'false' }
            }
        });

        console.log("Count enum --> ", beneficiaryCount);

        if (beneficiaryCount > 0) {
            details.blockedBy.push({
                entity: 'beneficiaries',
                count: beneficiaryCount,
                reason: 'Enumerator has created beneficiaries'
            });
        }

        // Check if enumerator created any deliveries
        const deliveryCount = await DeliveryModel.count({
            where: {
                created_by_membership_id: membershipId,
                review_status: { [Op.ne]: 'false' } // Not deleted
            }
        });

        if (deliveryCount > 0) {
            details.blockedBy.push({
                entity: 'deliveries',
                count: deliveryCount,
                reason: 'Enumerator has created deliveries'
            });
        }
    }

    // ============================================
    // COLLABORATOR VALIDATION
    // ============================================
    if (role === 'collaborator') {
        // Check if collaborator reviewed any beneficiaries
        const reviewedBeneficiaryCount = await BeneficiaryModel.count({
            where: {
                reviewed_by_membership_id: membershipId,
                review_status: { [Op.ne]: 'false' } // Not deleted
            }
        });

        if (reviewedBeneficiaryCount > 0) {
            details.blockedBy.push({
                entity: 'beneficiaries',
                count: reviewedBeneficiaryCount,
                reason: 'Collaborator has reviewed beneficiaries'
            });
        }

        // Check if collaborator reviewed any deliveries
        const reviewedDeliveryCount = await DeliveryModel.count({
            where: {
                reviewed_by_membership_id: membershipId,
                review_status: { [Op.ne]: 'false' } // Not deleted
            }
        });

        if (reviewedDeliveryCount > 0) {
            details.blockedBy.push({
                entity: 'deliveries',
                count: reviewedDeliveryCount,
                reason: 'Collaborator has reviewed deliveries'
            });
        }
    }

    // ============================================
    // ADMIN VALIDATION
    // ============================================
    if (role === 'admin') {
        // Check if admin created the organisation
        const organisation = await OrganisationModel.findOne({
            where: {
                id: organisationId,
                created_by: membershipId
            }
        });

        if (organisation) {
            details.blockedBy.push({
                entity: 'organisation',
                count: 1,
                reason: 'Admin is the creator of the organisation'
            });
        }

        // Also check beneficiaries and deliveries for admin
        const adminBeneficiaryCount = await BeneficiaryModel.count({
            where: {
                [Op.or]: [
                    { created_by_membership_id: membershipId },
                    { reviewed_by_membership_id: membershipId }
                ],
                review_status: { [Op.ne]: 'false' }
            }
        });

        if (adminBeneficiaryCount > 0) {
            details.blockedBy.push({
                entity: 'beneficiaries',
                count: adminBeneficiaryCount,
                reason: 'Admin has created or reviewed beneficiaries'
            });
        }

        const adminDeliveryCount = await DeliveryModel.count({
            where: {
                [Op.or]: [
                    { created_by_membership_id: membershipId },
                    { reviewed_by_membership_id: membershipId }
                ],
                review_status: { [Op.ne]: 'false' }
            }
        });

        if (adminDeliveryCount > 0) {
            details.blockedBy.push({
                entity: 'deliveries',
                count: adminDeliveryCount,
                reason: 'Admin has created or reviewed deliveries'
            });
        }
    }

    // ============================================
    // RETURN VALIDATION RESULT
    // ============================================
    return {
        canDelete: details.blockedBy.length === 0,
        details
    };
}