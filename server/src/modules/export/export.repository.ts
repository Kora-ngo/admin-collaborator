import {
    BeneficiaryModel, BeneficiaryMemberModel, DeliveryModel, DeliveryItemModel,
    ProjectModel, MembershipModel, UserModel, AssistanceModel, AssistanceTypeModel
} from '../index.js';

const createdByInclude = {
    model: MembershipModel,
    as: 'createdBy',
    attributes: ['id'],
    include: [{ model: UserModel, as: 'user', attributes: ['name'] }],
};

export const ExportRepository = {

    findAllBeneficiaries: async (where: any) => {
        return BeneficiaryModel.findAll({
            where,
            order: [['created_at', 'DESC']],
            include: [
                { model: ProjectModel, as: 'project', attributes: ['id', 'name'] },
                { model: BeneficiaryMemberModel, as: 'members', attributes: ['id'] },
                createdByInclude,
            ],
        });
    },

    findAllDeliveries: async (where: any) => {
        return DeliveryModel.findAll({
            where,
            order: [['created_at', 'DESC']],
            include: [
                { model: ProjectModel, as: 'project', attributes: ['id', 'name'] },
                { model: BeneficiaryModel, as: 'beneficiary', attributes: ['id', 'family_code', 'head_name'] },
                {
                    model: DeliveryItemModel,
                    as: 'items',
                    include: [
                        {
                            model: AssistanceModel,
                            as: 'assistance',
                            attributes: ['id', 'name'],
                            include: [{ model: AssistanceTypeModel, as: 'assistanceType', attributes: ['name', 'unit'] }],
                        },
                    ],
                },
                createdByInclude,
            ],
        });
    },
};