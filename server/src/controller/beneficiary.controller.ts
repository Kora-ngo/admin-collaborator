import type { Request, Response } from "express";
import ProjectMemberModel from "../models/projectMember.js";
import { Op } from "sequelize";
import { BeneficiaryMemberModel, BeneficiaryModel, MembershipModel, ProjectModel, UserModel } from "../models/index.js";
import { logAudit } from "../utils/auditLogger.js";

const BeneficiaryController = {

    fetchAll: async (req: Request, res: Response) => {
        const authUser = req.user;
        const userRole = authUser?.role;
        const organisationId = authUser?.organizationId;
        const membershipId = authUser?.membershipId;

        console.log("Beneficiary fetchAll --> Role:", userRole);

        try{
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const whereClause: any = {};

            // ROLE-BASED FILTERING
            if (userRole === 'collaborator') {
                // Get collaborator's projects

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
                            total: 0,
                            page,
                            limit,
                            totalPages: 0,
                            hasNext: false,
                            hasPrev: false
                        }
                    });
                }


                // Only show beneficiaries from collaborator's projects
                whereClause.project_id = { [Op.in]: projectIds };
                whereClause.review_status = { [Op.ne]: 'false' };

            }

            // Fetch beneficiaries

            const { count, rows } = await BeneficiaryModel.findAndCountAll({
                where: whereClause,
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: ProjectModel,
                        as: 'project',
                        attributes: ['id', 'name', 'status'],
                        where: {
                            organisation_id: organisationId
                        }
                    },
                    {
                        model: BeneficiaryMemberModel,
                        as: 'members',
                        attributes: ['id', 'full_name', 'gender', 'date_of_birth', 'relationship']
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

            // Convert to plain objects
            const beneficiariesData = rows.map(b => {
                const data: any = b.dataValues || b;
                return {
                    ...data,
                    members: data.members?.map((m: any) => m.dataValues || m) || [],
                    project: data.project?.dataValues || data.project,
                    createdBy: data.createdBy?.dataValues || data.createdBy,
                    reviewedBy: data.reviewedBy?.dataValues || data.reviewedBy
                };
            });


            res.status(200).json({
                type: 'success',
                data: beneficiariesData,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            });

        } catch (error) {
            console.error("Beneficiary: Fetch_All error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },


    fetchOne: async (req: Request, res: Response) => {
        const authUser = req.user;
        const userRole = authUser?.role;
        const membershipId = authUser?.membershipId;

        try {
            const { id } = req.params;

            const beneficiaryData = await BeneficiaryModel.findOne({
                where: { id },
                include: [
                    {
                        model: ProjectModel,
                        as: 'project',
                        attributes: ['id', 'name', 'status']
                    },
                    {
                        model: BeneficiaryMemberModel,
                        as: 'members',
                        attributes: ['id', 'full_name', 'gender', 'date_of_birth', 'relationship']
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

            const beneficiary = beneficiaryData?.dataValues;

            if (!beneficiary) {
                return res.status(404).json({
                    type: 'error',
                    message: 'record_not_found'
                });
            }

            // Role-based access check for collaborators
            if (userRole === 'collaborator') {
                const hasAccessData = await ProjectMemberModel.findOne({
                    where: {
                        project_id: beneficiary.project_id,
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
                data: beneficiary
            });

        } catch (error) {
            console.error("Beneficiary: Fetch_One error:", error);
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

            const whereClause: any = {
                [Op.or]: [
                    { head_name: { [Op.like]: `%${q}%` } },
                    { family_code: { [Op.like]: `%${q}%` } },
                    { phone: { [Op.like]: `%${q}%` } }
                ]
            };

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
                            total: 0,
                            page,
                            limit,
                            totalPages: 0,
                            hasNext: false,
                            hasPrev: false
                        }
                    });
                }

                whereClause.project_id = { [Op.in]: projectIds };
            }

            const { count, rows } = await BeneficiaryModel.findAndCountAll({
                where: whereClause,
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: ProjectModel,
                        as: 'project',
                        attributes: ['id', 'name', 'status'],
                        where: {
                            organisation_id: req.user?.organizationId
                        }
                    },
                    {
                        model: BeneficiaryMemberModel,
                        as: 'members'
                    },
                    {
                        model: MembershipModel,
                        as: 'createdBy',
                        include: [{ model: UserModel, as: 'user' }]
                    },
                    {
                        model: MembershipModel,
                        as: 'reviewedBy',
                        required: false,
                        include: [{ model: UserModel, as: 'user' }]
                    }
                ],
                limit,
                offset,
                distinct: true
            });

            const totalPages = Math.ceil(count / limit);

            res.status(200).json({
                type: 'success',
                data: rows,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            });

        } catch (error) {
            console.error("Beneficiary: Search error:", error);
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

            // Review status filter
            if (reviewStatus) {
                whereClause.review_status = reviewStatus;
            }

            // Project filter
            if (projectId) {
                whereClause.project_id = projectId;
            }

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
                            total: 0,
                            page,
                            limit,
                            totalPages: 0,
                            hasNext: false,
                            hasPrev: false
                        }
                    });
                }

                whereClause.project_id = { [Op.in]: projectIds };
            }

            const { count, rows } = await BeneficiaryModel.findAndCountAll({
                where: whereClause,
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: ProjectModel,
                        as: 'project',
                        attributes: ['id', 'name', 'status'],
                        where: {
                            organisation_id: req.user?.organizationId
                        }
                    },
                    {
                        model: BeneficiaryMemberModel,
                        as: 'members'
                    },
                    {
                        model: MembershipModel,
                        as: 'createdBy',
                        include: [{ model: UserModel, as: 'user' }]
                    },
                    {
                        model: MembershipModel,
                        as: 'reviewedBy',
                        required: false,
                        include: [{ model: UserModel, as: 'user' }]
                    }
                ],
                limit,
                offset,
                distinct: true
            });

            const totalPages = Math.ceil(count / limit);

            res.status(200).json({
                type: 'success',
                data: rows,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            });

        } catch (error) {
            console.error("Beneficiary: Filter error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },


    reviewBeneficiary: async (req: Request, res: Response) => {
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

            // ENFORCE: Rejection must have a note
            if (action === 'reject' && (!review_note || review_note.trim() === "")) {
                return res.status(400).json({
                    type: 'error',
                    message: 'rejection_note_required'
                });
            }

            const beneficiaryData = await BeneficiaryModel.findByPk(id);

            const beneficiary = beneficiaryData?.dataValues;

            if (!beneficiary) {
                return res.status(404).json({
                    type: 'error',
                    message: 'record_not_found'
                });
            }

            // Verify collaborator has access to this project
            const hasAccessData = await ProjectMemberModel.findOne({
                where: {
                    project_id: beneficiary.project_id,
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

            // Check if already reviewed
            if (beneficiary.review_status !== 'pending') {
                return res.status(400).json({
                    type: 'error',
                    message: 'already_reviewed'
                });
            }

            // Update review status
            await beneficiaryData.update({
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
                entityType: "beneficiary",
                entityId: beneficiary.project_id,
                metadata: {
                    "Family Code": beneficiary?.family_code,
                    "Family Head": beneficiary?.head_name,
                }
            });

            res.status(200).json({
                type: 'success',
                message: 'done',
                data: beneficiary
            });

        } catch (error) {
            console.error("Beneficiary: Review error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },


    delete: async (req: Request, res: Response) => {
        try {
            const {id} = req.params;
            const {status} = req.body;

            console.log("Status --> ", status);

            if(status != "rejected"){
                return res.status(400).json({
                    type: 'error',
                    message: 'invalid_status'
                });                
            }

            const beneficaryData = await BeneficiaryModel.findByPk(id);
            const beneficary = beneficaryData?.dataValues;
            let members;

            if(beneficary?.id){
                const {count} = await BeneficiaryMemberModel.count({
                where: {
                    beneficiary_id: beneficary?.id
                }
            }) as any;

            members = count;
            }
            
            if (!beneficary) {
                return res.status(404).json({
                    type: 'error',
                    message: 'record_not_found',
                });
            }

            await beneficaryData.update({
                review_status: "false"
            }),

            await logAudit({
                req,
                action: status == "true" ? "Enabled" : status == "blocked" ? "Blocked" : "Deleted",
                entityType: "beneficiary",
                entityId: beneficary.id,
                metadata: {
                    Familly_Code: beneficary.family_code,
                    Familly_Head: beneficary.head_name,
                    Members: `${members} Member(s)`,
                    status,
                }
            });

            res.status(200).json({
            type: 'success',
            message: 'done',
            data: {
                id: beneficary.id,
                status,
            },
            });

        }catch (error) {
            console.error("Membership: Toggle Status error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    }


};

export default BeneficiaryController;
