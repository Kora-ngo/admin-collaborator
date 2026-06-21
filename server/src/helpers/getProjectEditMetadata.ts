import { Op } from "sequelize";
import DeliveryModel from "../modules/delivery/delivery.model.js";
import DeliveryItemModel from "../modules/delivery-item/delivery-item.model.js";
import BeneficiaryModel from "../modules/beneficiary/beneficiary.model.js";

export async function getProjectEditMetadata(projectId: number) {
    // Get assistances used in deliveries
    const usedAssistances = await DeliveryItemModel.findAll({
        attributes: ['assistance_id'],
        include: [{
            model: DeliveryModel,
            as: 'delivery',
            where: { 
                project_id: projectId,
                review_status: { [Op.ne]: 'false' }
            },
            attributes: []
        }],
        group: ['assistance_id'],
        raw: true
    });

    const lockedAssistanceIds = usedAssistances.map((item: any) => item.assistance_id);

    // Get members who created beneficiaries or deliveries
    const beneficiaryCreators = await BeneficiaryModel.findAll({
        attributes: ['created_by_membership_id'],
        where: { 
            project_id: projectId,
            review_status: { [Op.ne]: 'false' }
        },
        group: ['created_by_membership_id'],
        raw: true
    });

    const deliveryCreators = await DeliveryModel.findAll({
        attributes: ['created_by_membership_id'],
        where: { 
            project_id: projectId,
            review_status: { [Op.ne]: 'false' }
        },
        group: ['created_by_membership_id'],
        raw: true
    });

    const lockedMembershipIds = [
        ...beneficiaryCreators.map((b: any) => b.created_by_membership_id),
        ...deliveryCreators.map((d: any) => d.created_by_membership_id)
    ].filter((v, i, a) => a.indexOf(v) === i); // unique

    return {
        lockedAssistances: lockedAssistanceIds.map(id => ({ assistance_id: id })),
        lockedMembers: lockedMembershipIds.map(id => ({ membership_id: id }))
    };
}