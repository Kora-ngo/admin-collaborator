import type { Request, Response } from 'express';
import { Op } from 'sequelize';
import ProjectModel from '../../models/project.js';
import OrganisationModel from '../../models/Organisation.js';
import MembershipModel from '../../models/Membership.js';
import UserModel from '../../models/User.js';
import ProjectMemberModel from '../../models/projectMember.js';
import BeneficiaryModel from '../../models/Beneficiary.js';
import DeliveryModel from '../../models/Delivery.js';

const ProjectController = {

    fetchAll: async (req: Request, res: Response) => {
        try {
            const page   = parseInt(req.query.page  as string) || 1;
            const limit  = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const { count, rows } = await ProjectModel.findAndCountAll({
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: OrganisationModel,
                        as: 'organisation',
                        attributes: ['id', 'name'],
                    },
                    {
                        // Creator
                        model: MembershipModel,
                        as: 'creator',
                        attributes: ['id', 'role'],
                        include: [{
                            model: UserModel,
                            as: 'user',
                            attributes: ['id', 'name'],
                        }],
                    },
                    {
                        // Project members (lead + enumerators)
                        model: ProjectMemberModel,
                        as: 'members',
                        attributes: ['id', 'role_in_project', 'assigned_at'],
                        include: [{
                            model: MembershipModel,
                            as: 'membership',
                            attributes: ['id'],
                            include: [{
                                model: UserModel,
                                as: 'user',
                                attributes: ['id', 'name'],
                            }],
                        }],
                    },
                    {
                        model: BeneficiaryModel,
                        as: 'beneficiaries',
                        attributes: ['id'],
                    },
                    {
                        model: DeliveryModel,
                        as: 'deliveries',
                        attributes: ['id'],
                    },
                ],
                limit,
                offset,
                distinct: true,
            });

            const totalPages = Math.ceil(count / limit);

            return res.status(200).json({
                type: 'success',
                data: rows,
                pagination: {
                    total: count, page, limit, totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            });
        } catch (error) {
            console.error('Project fetchAll error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    fetchOne: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const project = await ProjectModel.findByPk(id, {
                include: [
                    {
                        model: OrganisationModel,
                        as: 'organisation',
                        attributes: ['id', 'name', 'email', 'country'],
                    },
                    {
                        model: MembershipModel,
                        as: 'creator',
                        attributes: ['id', 'role'],
                        include: [{ model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] }],
                    },
                    {
                        model: ProjectMemberModel,
                        as: 'members',
                        attributes: ['id', 'role_in_project', 'assigned_at'],
                        include: [{
                            model: MembershipModel,
                            as: 'membership',
                            attributes: ['id', 'role'],
                            include: [{ model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] }],
                        }],
                    },
                    {
                        model: BeneficiaryModel,
                        as: 'beneficiaries',
                        attributes: ['id', 'uid', 'family_code', 'head_name', 'phone', 'region', 'village', 'review_status', 'created_at'],
                    },
                    {
                        model: DeliveryModel,
                        as: 'deliveries',
                        attributes: ['id', 'uid', 'delivery_date', 'notes', 'review_status', 'created_at'],
                    },
                ],
            });

            if (!project) {
                return res.status(404).json({ type: 'error', message: 'record_not_found' });
            }

            return res.status(200).json({ type: 'success', data: project });
        } catch (error) {
            console.error('Project fetchOne error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    search: async (req: Request, res: Response) => {
        try {
            const q      = (req.query.q as string)?.trim();
            const page   = parseInt(req.query.page as string) || 1;
            const limit  = 10;
            const offset = (page - 1) * limit;

            if (!q) return res.status(400).json({ type: 'error', message: 'search_query_required' });

            const { count, rows } = await ProjectModel.findAndCountAll({
                where: { name: { [Op.like]: `%${q}%` } },
                order: [['created_at', 'DESC']],
                include: [
                    { model: OrganisationModel, as: 'organisation', attributes: ['id', 'name'] },
                    {
                        model: MembershipModel, as: 'creator', attributes: ['id'],
                        include: [{ model: UserModel, as: 'user', attributes: ['id', 'name'] }],
                    },
                    {
                        model: ProjectMemberModel, as: 'members', attributes: ['id', 'role_in_project'],
                        include: [{
                            model: MembershipModel, as: 'membership', attributes: ['id'],
                            include: [{ model: UserModel, as: 'user', attributes: ['id', 'name'] }],
                        }],
                    },
                    { model: BeneficiaryModel, as: 'beneficiaries', attributes: ['id'] },
                    { model: DeliveryModel,    as: 'deliveries',    attributes: ['id'] },
                ],
                limit, offset, distinct: true,
            });

            const totalPages = Math.ceil(count / limit);
            return res.status(200).json({
                type: 'success', data: rows,
                pagination: { total: count, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
            });
        } catch (error) {
            console.error('Project search error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    filter: async (req: Request, res: Response) => {
        try {
            const page       = parseInt(req.query.page as string) || 1;
            const limit      = 10;
            const offset     = (page - 1) * limit;
            const status     = (req.query.status     as string)?.trim();
            const datePreset = (req.query.datePreset as string)?.trim();

            const where: any = {};

            const validStatuses = ['pending', 'ongoing', 'done', 'suspended', 'overdue', 'false'];
            if (status && validStatuses.includes(status)) {
                where.status = status;
            }

            if (datePreset && datePreset !== 'all') {
                const now   = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                where.created_at = {};

                switch (datePreset) {
                    case 'today':
                        where.created_at[Op.gte] = today;
                        where.created_at[Op.lt]  = new Date(today.getTime() + 86400000);
                        break;
                    case 'this_week':
                        const w = new Date(today);
                        w.setDate(today.getDate() - today.getDay());
                        where.created_at[Op.gte] = w;
                        break;
                    case 'this_month':
                        where.created_at[Op.gte] = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                    case 'this_year':
                        where.created_at[Op.gte] = new Date(now.getFullYear(), 0, 1);
                        break;
                }
            }

            const { count, rows } = await ProjectModel.findAndCountAll({
                where,
                order: [['created_at', 'DESC']],
                include: [
                    { model: OrganisationModel, as: 'organisation', attributes: ['id', 'name'] },
                    {
                        model: MembershipModel, as: 'creator', attributes: ['id'],
                        include: [{ model: UserModel, as: 'user', attributes: ['id', 'name'] }],
                    },
                    {
                        model: ProjectMemberModel, as: 'members', attributes: ['id', 'role_in_project'],
                        include: [{
                            model: MembershipModel, as: 'membership', attributes: ['id'],
                            include: [{ model: UserModel, as: 'user', attributes: ['id', 'name'] }],
                        }],
                    },
                    { model: BeneficiaryModel, as: 'beneficiaries', attributes: ['id'] },
                    { model: DeliveryModel,    as: 'deliveries',    attributes: ['id'] },
                ],
                limit, offset, distinct: true,
            });

            const totalPages = Math.ceil(count / limit);
            return res.status(200).json({
                type: 'success', data: rows,
                pagination: { total: count, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
            });
        } catch (error) {
            console.error('Project filter error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
};

export default ProjectController;