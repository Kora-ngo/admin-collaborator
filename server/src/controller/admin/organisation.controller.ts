import type { Request, Response } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import { OrganisationModel, UserModel, MembershipModel, ProjectModel, AssistanceModel, BeneficiaryModel, DeliveryModel, DeliveryItemModel, BeneficiaryMemberModel, SyncBatchModel, AuditLogModel, ProjectMemberModel, ProjectAssistanceModel, Media, MediaLink, AssistanceTypeModel } from '../../models/index.js';
import SubscriptionModel from '../../models/Subscription.js';
import sequelize from '../../config/database.js';

const OrganisationController = {

    fetchAll: async (req: Request, res: Response) => {
        try {
            const page  = parseInt(req.query.page  as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const { count, rows } = await OrganisationModel.findAndCountAll({
                order: [['date_of', 'DESC']],
                include: [
                    {
                        model: UserModel,
                        as: 'owner',
                        attributes: ['id', 'name', 'email'],
                        foreignKey: 'created_by',
                    },
                    {
                        model: MembershipModel,
                        as: 'memberships',
                        attributes: ['id', 'role'],
                    },
                    {
                        model: ProjectModel,
                        as: 'projects',
                        attributes: ['id'],
                    },
                    {
                        model: AssistanceModel,
                        as: 'assistances',
                        attributes: ['id'],
                    },
                    {
                        model: SubscriptionModel,
                        as: 'subscription',
                        attributes: ['plan', 'status', 'ends_at'],
                        required: false,
                    }
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
                    total: count,
                    page,
                    limit,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            });

        } catch (error) {
            console.error('Organisation fetchAll error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    fetchOne: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const organisation = await OrganisationModel.findByPk(id, {
                include: [
                    {
                        model: UserModel,
                        as: 'owner',
                        attributes: ['id', 'name', 'email', 'phone'],
                        foreignKey: 'created_by',
                    },
                    {
                        model: MembershipModel,
                        as: 'memberships',
                        attributes: ['id', 'role', 'status', 'date_of'],
                    },
                    {
                        model: SubscriptionModel,
                        as: 'subscription',
                        attributes: ['plan', 'status', 'started_at', 'ends_at'],
                        required: false,
                    }
                ],
            });

            if (!organisation) {
                return res.status(404).json({ type: 'error', message: 'record_not_found' });
            }

            return res.status(200).json({ type: 'success', data: organisation });

        } catch (error) {
            console.error('Organisation fetchOne error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    filter: async (req: Request, res: Response) => {
        try {
            const page   = parseInt(req.query.page as string) || 1;
            const limit  = 10;
            const offset = (page - 1) * limit;

            const status     = (req.query.status     as string)?.trim();
            const country    = (req.query.country    as string)?.trim();
            const plan       = (req.query.plan       as string)?.trim();
            const datePreset = (req.query.datePreset as string)?.trim();

            const where: any = {};

            if (status === 'true' || status === 'false') {
                where.status = status;
            }

            if (country) {
                where.country = country;
            }

            if (datePreset && datePreset !== 'all') {
                const now   = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                where.date_of = {};

                switch (datePreset) {
                    case 'today':
                        where.date_of[Op.gte] = today;
                        where.date_of[Op.lt]  = new Date(today.getTime() + 86400000);
                        break;
                    case 'this_week':
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDay());
                        where.date_of[Op.gte] = weekStart;
                        break;
                    case 'this_month':
                        where.date_of[Op.gte] = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                    case 'this_year':
                        where.date_of[Op.gte] = new Date(now.getFullYear(), 0, 1);
                        break;
                }
            }

            // Subscription plan filter (nested where)
            const subscriptionWhere: any = {};
            if (plan && plan !== 'all') {
                subscriptionWhere.plan = plan;
            }

            const { count, rows } = await OrganisationModel.findAndCountAll({
                where,
                order: [['date_of', 'DESC']],
                include: [
                    {
                        model: UserModel,
                        as: 'owner',
                        attributes: ['id', 'name', 'email'],
                        foreignKey: 'created_by',
                    },
                    {
                        model: MembershipModel,
                        as: 'memberships',
                        attributes: ['id', 'role'],
                    },
                    {
                        model: ProjectModel,
                        as: 'projects',
                        attributes: ['id'],
                    },
                    {
                        model: AssistanceModel,
                        as: 'assistances',
                        attributes: ['id'],
                    },
                    {
                        model: SubscriptionModel,
                        as: 'subscription',
                        attributes: ['plan', 'status', 'ends_at'],
                        required: Object.keys(subscriptionWhere).length > 0,
                        where: Object.keys(subscriptionWhere).length > 0 ? subscriptionWhere : undefined,
                    }
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
                    total: count,
                    page,
                    limit,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            });

        } catch (error) {
            console.error('Organisation filter error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    search: async (req: Request, res: Response) => {
        try {
            const q      = (req.query.q as string)?.trim();
            const page   = parseInt(req.query.page as string) || 1;
            const limit  = 10;
            const offset = (page - 1) * limit;

            if (!q) {
                return res.status(400).json({ type: 'error', message: 'search_query_required' });
            }

            const { count, rows } = await OrganisationModel.findAndCountAll({
                where: {
                    name: { [Op.like]: `%${q}%` },
                },
                order: [['date_of', 'DESC']],
                include: [
                    {
                        model: UserModel,
                        as: 'owner',
                        attributes: ['id', 'name', 'email'],
                        foreignKey: 'created_by',
                    },
                    {
                        model: MembershipModel,
                        as: 'memberships',
                        attributes: ['id', 'role'],
                    },
                    {
                        model: ProjectModel,
                        as: 'projects',
                        attributes: ['id'],
                    },
                    {
                        model: AssistanceModel,
                        as: 'assistances',
                        attributes: ['id'],
                    },
                    {
                        model: SubscriptionModel,
                        as: 'subscription',
                        attributes: ['plan', 'status', 'ends_at'],
                        required: false,
                    }
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
                    total: count,
                    page,
                    limit,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            });

        } catch (error) {
            console.error('Organisation search error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    toggleStatus: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const organisation = await OrganisationModel.findByPk(id);

            if (!organisation) {
                return res.status(404).json({ type: 'error', message: 'record_not_found' });
            }

            const newStatus = organisation.dataValues.status === 'true' ? 'blocked' : 'true';

            await organisation.update({ status: newStatus, update_of: new Date() });

            return res.status(200).json({
                type: 'success',
                message: 'done',
                data: { id: organisation.id, status: newStatus },
            });

        } catch (error) {
            console.error('Organisation toggleStatus error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    deleteOrganisation: async (req: Request, res: Response) => {
        const transaction = await sequelize.transaction();

        try {
            const { id } = req.params;

            const orgData = await OrganisationModel.findByPk(id);
            const org = orgData?.dataValues;
            if (!org) {
                await transaction.rollback();
                return res.status(404).json({ type: 'error', message: 'organisation_not_found' });
            }

            // 1. Get all project IDs for this org
            const projects = await ProjectModel.findAll({
                where: { organisation_id: id },
                attributes: ['id'],
                transaction
            });
            const projectIds = projects.map(p => p.id);

            // 2. Get all beneficiary IDs
            const beneficiaries = await BeneficiaryModel.findAll({
                where: { project_id: { [Op.in]: projectIds } },
                attributes: ['id'],
                transaction
            });
            const beneficiaryIds = beneficiaries.map(b => b.id);

            // 3. Get all delivery IDs
            const deliveries = await DeliveryModel.findAll({
                where: { project_id: { [Op.in]: projectIds } },
                attributes: ['id'],
                transaction
            });
            const deliveryIds = deliveries.map(d => d.id);

            // 4. Delete DeliveryItems
            await DeliveryItemModel.destroy({
                where: { delivery_id: { [Op.in]: deliveryIds } },
                transaction
            });

            // 5. Delete Deliveries
            await DeliveryModel.destroy({
                where: { id: { [Op.in]: deliveryIds } },
                transaction
            });

            // 6. Delete BeneficiaryMembers
            await BeneficiaryMemberModel.destroy({
                where: { beneficiary_id: { [Op.in]: beneficiaryIds } },
                transaction
            });

            // 7. Delete Beneficiaries
            await BeneficiaryModel.destroy({
                where: { id: { [Op.in]: beneficiaryIds } },
                transaction
            });

            // 8. Delete SyncBatches
            await SyncBatchModel.destroy({
                where: { project_id: { [Op.in]: projectIds } },
                transaction
            });

            // 9. Delete AuditLogs
            await AuditLogModel.destroy({
                where: { organisation_id: id },
                transaction
            });

            // 10. Get all membership IDs
            const memberships = await MembershipModel.findAll({
                where: { organization_id: id },
                attributes: ['id'],
                transaction
            });
            const membershipIds = memberships.map(m => m.id);

            // 11. Delete ProjectMembers
            await ProjectMemberModel.destroy({
                where: { membership_id: { [Op.in]: membershipIds } },
                transaction
            });

            // 12. Delete ProjectAssistances
            await ProjectAssistanceModel.destroy({
                where: { project_id: { [Op.in]: projectIds } },
                transaction
            });

            // 13. Get all media IDs for this org
            const mediaList = await Media.findAll({
                where: { organisation_id: id },
                attributes: ['id'],
                transaction
            });
            const mediaIds = mediaList.map(m => m.id);

            // 14. Delete MediaLinks
            await MediaLink.destroy({
                where: { media_id: { [Op.in]: mediaIds } },
                transaction
            });

            // 15. Delete Media
            await Media.destroy({
                where: { organisation_id: id },
                transaction
            });

            // 16. Get all assistance IDs for this org
            const assistances = await AssistanceModel.findAll({
                where: { organization_id: id },
                attributes: ['id'],
                transaction
            });
            const assistanceIds = assistances.map(a => a.id);

            // 17. Delete Assistances
            await AssistanceModel.destroy({
                where: { id: { [Op.in]: assistanceIds } },
                transaction
            });

            // 18. Delete AssistanceTypes
            await AssistanceTypeModel.destroy({
                where: { organization_id: id },
                transaction
            });

            // 19. Delete Projects
            await ProjectModel.destroy({
                where: { organisation_id: id },
                transaction
            });

            // 20. Delete Memberships
            await MembershipModel.destroy({
                where: { organization_id: id },
                transaction
            });

            // 21. Delete Subscription
            await SubscriptionModel.destroy({
                where: { organization_id: id },
                transaction
            });

            // 22. Delete Organisation
            await OrganisationModel.destroy({
                where: { id },
                transaction
            });

            await transaction.commit();

            return res.status(200).json({
                type: 'success',
                message: 'organisation_permanently_deleted',
            });

        } catch (error) {
            await transaction.rollback();
            console.error('Organisation delete error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
};

export default OrganisationController;