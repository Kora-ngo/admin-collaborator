import { Op } from 'sequelize';
import ProjectModel from '../project.model.js';
import OrganisationModel from '../../organisation/organisation.model.js';
import MembershipModel from '../../membership/membership.model.js';
import UserModel from '../../user/user.model.js';
import ProjectMemberModel from '../../project-member/project.member.model.js';
import BeneficiaryModel from '../../beneficiary/beneficiary.model.js';
import DeliveryModel from '../../delivery/delivery.model.js';

// ============================================================
// Include builders
// ============================================================

const organisationInclude = (attributes: string[]) => ({
    model: OrganisationModel,
    as: 'organisation',
    attributes,
});

const creatorInclude = (membershipAttrs: string[], userAttrs: string[]) => ({
    model: MembershipModel,
    as: 'creator',
    attributes: membershipAttrs,
    include: [{ model: UserModel, as: 'user', attributes: userAttrs }],
});

const membersInclude = (memberAttrs: string[], membershipAttrs: string[], userAttrs: string[]) => ({
    model: ProjectMemberModel,
    as: 'members',
    attributes: memberAttrs,
    include: [{
        model: MembershipModel,
        as: 'membership',
        attributes: membershipAttrs,
        include: [{ model: UserModel, as: 'user', attributes: userAttrs }],
    }],
});

const beneficiariesInclude = (attributes: string[]) => ({
    model: BeneficiaryModel,
    as: 'beneficiaries',
    attributes,
});

const deliveriesInclude = (attributes: string[]) => ({
    model: DeliveryModel,
    as: 'deliveries',
    attributes,
});


// ============================================================
// Project (admin)
// ============================================================

export const AdminProjectRepository = {

    findAndCountAllList: async (limit: number, offset: number) => {
        return ProjectModel.findAndCountAll({
            order: [['created_at', 'DESC']],
            include: [
                organisationInclude(['id', 'name']),
                creatorInclude(['id', 'role'], ['id', 'name']),
                membersInclude(['id', 'role_in_project', 'assigned_at'], ['id'], ['id', 'name']),
                beneficiariesInclude(['id']),
                deliveriesInclude(['id']),
            ],
            limit,
            offset,
            distinct: true,
        });
    },

    findByPkDetailed: async (id: string) => {
        return ProjectModel.findByPk(id, {
            include: [
                organisationInclude(['id', 'name', 'email', 'country']),
                creatorInclude(['id', 'role'], ['id', 'name', 'email']),
                membersInclude(['id', 'role_in_project', 'assigned_at'], ['id', 'role'], ['id', 'name', 'email']),
                beneficiariesInclude(['id', 'uid', 'family_code', 'head_name', 'phone', 'region', 'village', 'review_status', 'created_at']),
                deliveriesInclude(['id', 'uid', 'delivery_date', 'notes', 'review_status', 'created_at']),
            ],
        });
    },

    findAndCountAllSearch: async (q: string, limit: number, offset: number) => {
        return ProjectModel.findAndCountAll({
            where: { name: { [Op.like]: `%${q}%` } },
            order: [['created_at', 'DESC']],
            include: [
                organisationInclude(['id', 'name']),
                creatorInclude(['id'], ['id', 'name']),
                membersInclude(['id', 'role_in_project'], ['id'], ['id', 'name']),
                beneficiariesInclude(['id']),
                deliveriesInclude(['id']),
            ],
            limit,
            offset,
            distinct: true,
        });
    },

    findAndCountAllFilter: async (where: any, limit: number, offset: number) => {
        return ProjectModel.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            include: [
                organisationInclude(['id', 'name']),
                creatorInclude(['id'], ['id', 'name']),
                membersInclude(['id', 'role_in_project'], ['id'], ['id', 'name']),
                beneficiariesInclude(['id']),
                deliveriesInclude(['id']),
            ],
            limit,
            offset,
            distinct: true,
        });
    },
};