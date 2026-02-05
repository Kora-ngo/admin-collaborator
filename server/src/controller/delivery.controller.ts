import type { Request, Response } from "express";
import { AssistanceModel, AssistanceTypeModel, BeneficiaryModel, DeliveryItemModel, DeliveryModel, MembershipModel, ProjectMemberModel, ProjectModel, UserModel } from "../models/index.js";
import { Op } from "sequelize";
import { logAudit } from "../utils/auditLogger.js";

const DeliveryController = { 

    fetchAll: async (req: Request, res: Response) => {
        const authUser = req.user;
        const userRole = authUser?.role;
        const membershipId = authUser?.membershipId;

        console.log("Delivery fetchAll --> Role:", userRole);

        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const whereClause: any = {};

            // ROLE-BASED FILTERING
            if (userRole === 'collaborator') {
                const collaboratorProjects = await ProjectMemberModel.findAll({
                    where: {
                        membership_id: membershipId,
                        role_in_project: 'collaborator'
                    },
                    attributes: ['project_id'],
                    raw: true
                });

                const projectIds = collaboratorProjects.map(pm => pm.project_id);

                if (projectIds.length === 0) {
                    return res.status(200).json({
                        type: 'success',
                        data: [],
                        pagination: {
                            total: 0, page, limit,
                            totalPages: 0,
                            hasNext: false,
                            hasPrev: false
                        }
                    });
                }

                whereClause.project_id = { [Op.in]: projectIds };
            }

            const { count, rows } = await DeliveryModel.findAndCountAll({
                where: whereClause,
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: ProjectModel,
                        as: 'project',
                        attributes: ['id', 'name', 'status']
                    },
                    {
                        model: BeneficiaryModel,
                        as: 'beneficiary',
                        attributes: ['id', 'family_code', 'head_name'],
                    },
                    {
                        model: DeliveryItemModel,
                        as: 'items',
                        include: [
                            {
                                model: AssistanceModel,
                                as: 'assistance',
                                attributes: ['id', 'name', 'assistance_id'],
                                include: [
                                    {
                                        model: AssistanceTypeModel,
                                        as: 'assistanceType',
                                        attributes: ['id', 'name', 'unit']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: MembershipModel,
                        as: 'createdBy',
                        attributes: ['id', 'role'],
                        include: [
                            {
                                model: UserModel,
                                as: 'user',
                                attributes: ['id', 'name', 'email']
                            }
                        ]
                    },
                    {
                        model: MembershipModel,
                        as: 'reviewedBy',
                        required: false,
                        attributes: ['id', 'role'],
                        include: [
                            {
                                model: UserModel,
                                as: 'user',
                                attributes: ['id', 'name', 'email']
                            }
                        ]
                    }
                ],
                limit,
                offset,
                distinct: true
            });

            const totalPages = Math.ceil(count / limit);

            const deliveriesData = rows.map(d => {
                const data: any = d.dataValues || d;
                return {
                    ...data,
                    items: data.items?.map((i: any) => i.dataValues || i) || [],
                    beneficiary: data.beneficiary?.dataValues || data.beneficiary,
                    project: data.project?.dataValues || data.project,
                    createdBy: data.createdBy?.dataValues || data.createdBy,
                    reviewedBy: data.reviewedBy?.dataValues || data.reviewedBy
                };
            });

            res.status(200).json({
                type: 'success',
                data: deliveriesData,
                pagination: {
                    total: count, page, limit, totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            });

        } catch (error) {
            console.error("Delivery: Fetch_All error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    fetchOne: async (req: Request, res: Response) => {
        const authUser = req.user;
        const userRole = authUser?.role;
        const membershipId = authUser?.membershipId;

        try {
            const { id } = req.params;

            const deliveryData = await DeliveryModel.findOne({
                where: { id },
                include: [
                    {
                        model: ProjectModel,
                        as: 'project',
                        attributes: ['id', 'name', 'status']
                    },
                    {
                        model: BeneficiaryModel,
                        as: 'beneficiary',
                        attributes: ['id', 'family_code', 'head_name', 'phone', 'region', 'village'],
                    },
                    {
                        model: DeliveryItemModel,
                        as: 'items',
                        include: [
                            {
                                model: AssistanceModel,
                                as: 'assistance',
                                attributes: ['id', 'name', 'assistance_id'],
                                include: [
                                    {
                                        model: AssistanceTypeModel,
                                        as: 'assistanceType',
                                        attributes: ['id', 'name', 'unit']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: MembershipModel,
                        as: 'createdBy',
                        attributes: ['id', 'role'],
                        include: [
                            {
                                model: UserModel,
                                as: 'user',
                                attributes: ['id', 'name', 'email']
                            }
                        ]
                    },
                    {
                        model: MembershipModel,
                        as: 'reviewedBy',
                        required: false,
                        attributes: ['id', 'role'],
                        include: [
                            {
                                model: UserModel,
                                as: 'user',
                                attributes: ['id', 'name', 'email']
                            }
                        ]
                    }
                ]
            });
            const delivery = deliveryData?.dataValues;

            if (!delivery) {
                return res.status(404).json({
                    type: 'error',
                    message: 'record_not_found'
                });
            }

            // Collaborator access check
            if (userRole === 'collaborator') {
                const hasAccessData = await ProjectMemberModel.findOne({
                    where: {
                        project_id: delivery.project_id,
                        membership_id: membershipId,
                        role_in_project: 'collaborator'
                    }
                });
                const hasAccess = hasAccessData?.dataValues;

                if (!hasAccess) {
                    return res.status(403).json({
                        type: 'error',
                        message: 'access_denied'
                    });
                }
            }

            res.status(200).json({
                type: 'success',
                data: delivery
            });

        } catch (error) {
            console.error("Delivery: Fetch_One error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    search: async (req: Request, res: Response) => {
        const authUser = req.user;
        const userRole = authUser?.role;
        const membershipId = authUser?.membershipId;

        try {
            const q = (req.query.q as string)?.trim();
            const page = parseInt(req.query.page as string) || 1;
            const limit = 10;
            const offset = (page - 1) * limit;

            if (!q) {
                return res.status(400).json({
                    type: 'error',
                    message: 'search_query_required'
                });
            }

            const whereClause: any = {};

            // Role-based filtering
            if (userRole === 'collaborator') {
                const collaboratorProjects = await ProjectMemberModel.findAll({
                    where: {
                        membership_id: membershipId,
                        role_in_project: 'collaborator'
                    },
                    attributes: ['project_id'],
                    raw: true
                });

                const projectIds = collaboratorProjects.map(pm => pm.project_id);

                if (projectIds.length === 0) {
                    return res.status(200).json({
                        type: 'success',
                        data: [],
                        pagination: {
                            total: 0, page, limit,
                            totalPages: 0,
                            hasNext: false,
                            hasPrev: false
                        }
                    });
                }

                whereClause.project_id = { [Op.in]: projectIds };
            }

            // Search by beneficiary's head_name or family_code
            whereClause['$beneficiary.head_name$'] = { [Op.like]: `%${q}%` };
            // Using Op.or for multiple search fields
            const searchWhere: any = {
                ...whereClause,
                [Op.or]: [
                    { '$beneficiary.head_name$': { [Op.like]: `%${q}%` } },
                    { '$beneficiary.family_code$': { [Op.like]: `%${q}%` } },
                    { notes: { [Op.like]: `%${q}%` } }
                ]
            };
            // Remove the single field we added before the Op.or
            delete searchWhere['$beneficiary.head_name$'];

            const { count, rows } = await DeliveryModel.findAndCountAll({
                where: searchWhere,
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: ProjectModel,
                        as: 'project',
                        attributes: ['id', 'name', 'status']
                    },
                    {
                        model: BeneficiaryModel,
                        as: 'beneficiary',
                        attributes: ['id', 'family_code', 'head_name'],
                    },
                    {
                        model: DeliveryItemModel,
                        as: 'items',
                        include: [
                            {
                                model: AssistanceModel,
                                as: 'assistance',
                                attributes: ['id', 'name'],
                                include: [
                                    {
                                        model: AssistanceTypeModel,
                                        as: 'assistanceType',
                                        attributes: ['id', 'name', 'unit']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: MembershipModel,
                        as: 'createdBy',
                        attributes: ['id', 'role'],
                        include: [{ model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] }]
                    },
                    {
                        model: MembershipModel,
                        as: 'reviewedBy',
                        required: false,
                        attributes: ['id', 'role'],
                        include: [{ model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] }]
                    }
                ],
                limit,
                offset,
                distinct: true,
                subQuery: false
            });

            const totalPages = Math.ceil(count / limit);

            res.status(200).json({
                type: 'success',
                data: rows.map(d => d.toJSON()),
                pagination: {
                    total: count, page, limit, totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            });

        } catch (error) {
            console.error("Delivery: Search error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },


    filter: async (req: Request, res: Response) => {
        const authUser = req.user;
        const userRole = authUser?.role;
        const membershipId = authUser?.membershipId;

        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = 10;
            const offset = (page - 1) * limit;

            const reviewStatus = (req.query.reviewStatus as string)?.trim();
            const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
            const datePreset = (req.query.datePreset as string)?.trim();

            const whereClause: any = {};

            if (reviewStatus) whereClause.review_status = reviewStatus;
            if (projectId) whereClause.project_id = projectId;

            // Date filter
            if (datePreset && datePreset !== "all") {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                whereClause.created_at = {};

                switch (datePreset) {
                    case "today":
                        whereClause.created_at[Op.gte] = today;
                        whereClause.created_at[Op.lt] = new Date(today.getTime() + 24 * 60 * 60 * 1000);
                        break;
                    case "this_week":
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDay());
                        whereClause.created_at[Op.gte] = weekStart;
                        break;
                    case "this_month":
                        whereClause.created_at[Op.gte] = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                    case "this_year":
                        whereClause.created_at[Op.gte] = new Date(now.getFullYear(), 0, 1);
                        break;
                }
            }

            // Role-based filtering
            if (userRole === 'collaborator') {
                const collaboratorProjects = await ProjectMemberModel.findAll({
                    where: {
                        membership_id: membershipId,
                        role_in_project: 'collaborator'
                    },
                    attributes: ['project_id'],
                    raw: true
                });

                const projectIds = collaboratorProjects.map(pm => pm.project_id);

                if (projectIds.length === 0) {
                    return res.status(200).json({
                        type: 'success',
                        data: [],
                        pagination: {
                            total: 0, page, limit,
                            totalPages: 0,
                            hasNext: false,
                            hasPrev: false
                        }
                    });
                }

                whereClause.project_id = { [Op.in]: projectIds };
            }

            const { count, rows } = await DeliveryModel.findAndCountAll({
                where: whereClause,
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: ProjectModel,
                        as: 'project',
                        attributes: ['id', 'name', 'status']
                    },
                    {
                        model: BeneficiaryModel,
                        as: 'beneficiary',
                        attributes: ['id', 'family_code', 'head_name'],
                    },
                    {
                        model: DeliveryItemModel,
                        as: 'items',
                        include: [
                            {
                                model: AssistanceModel,
                                as: 'assistance',
                                attributes: ['id', 'name'],
                                include: [
                                    {
                                        model: AssistanceTypeModel,
                                        as: 'assistanceType',
                                        attributes: ['id', 'name', 'unit']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: MembershipModel,
                        as: 'createdBy',
                        attributes: ['id', 'role'],
                        include: [{ model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] }]
                    },
                    {
                        model: MembershipModel,
                        as: 'reviewedBy',
                        required: false,
                        attributes: ['id', 'role'],
                        include: [{ model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] }]
                    }
                ],
                limit,
                offset,
                distinct: true
            });

            const totalPages = Math.ceil(count / limit);

            res.status(200).json({
                type: 'success',
                data: rows.map(d => d.toJSON()),
                pagination: {
                    total: count, page, limit, totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            });

        } catch (error) {
            console.error("Delivery: Filter error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    reviewDelivery: async (req: Request, res: Response) => {
        const authUser = req.user;
        const userRole = authUser?.role;
        const membershipId = authUser?.membershipId;

        try {
            const { id } = req.params;
            const { action, review_note } = req.body;

            // Only collaborators can review
            if (userRole !== 'collaborator') {
                return res.status(403).json({
                    type: 'error',
                    message: 'collaborator_role_required'
                });
            }

            if (!action || (action !== 'approve' && action !== 'reject')) {
                return res.status(400).json({
                    type: 'error',
                    message: 'invalid_action'
                });
            }

            // Enforce rejection note
            if (action === 'reject' && (!review_note || review_note.trim() === "")) {
                return res.status(400).json({
                    type: 'error',
                    message: 'rejection_note_required'
                });
            }

            const deliveryData = await DeliveryModel.findByPk(id);
            const delivery = deliveryData?.dataValues;

            if (!delivery) {
                return res.status(404).json({
                    type: 'error',
                    message: 'record_not_found'
                });
            }

            // Verify access
            const hasAccessData = await ProjectMemberModel.findOne({
                where: {
                    project_id: delivery.project_id,
                    membership_id: membershipId,
                    role_in_project: 'collaborator'
                }
            });
            const hasAccess = hasAccessData?.dataValues;

            if (!hasAccess) {
                return res.status(403).json({
                    type: 'error',
                    message: 'access_denied'
                });
            }

            // Already reviewed check
            if (delivery.review_status !== 'pending') {
                return res.status(400).json({
                    type: 'error',
                    message: 'already_reviewed'
                });
            }

            await deliveryData.update({
                review_status: action === 'approve' ? 'approved' : 'rejected',
                reviewed_by_membership_id: membershipId!,
                reviewed_at: new Date(),
                review_note: review_note?.trim() || null,
                updated_at: new Date()
            });


            const getUserData = await UserModel.findByPk(authUser?.userId);
    
    
            await logAudit({
                req,
                action: action === 'approve' ? 'approved' : 'rejected',
                entityType: "delivery",
                entityId: delivery.project_id,
                metadata: {
                    "Delivery Date": delivery?.delivery_date,
                    "Note": delivery?.notes,
                }
            });

            res.status(200).json({
                type: 'success',
                message: 'done',
                data: delivery
            });

        } catch (error) {
            console.error("Delivery: Review error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    }
    
}

export default DeliveryController;