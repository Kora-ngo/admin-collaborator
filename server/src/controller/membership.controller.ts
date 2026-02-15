import type { Request, Response } from "express";
import {MembershipModel, OrganisationModel, ProjectMemberModel} from "../models/index.js"
import { cleanupOldDeleted } from "../utils/cleanupOldDeleted.js"
import UserModel from "../models/User.js";
import { Op } from 'sequelize';
import type { MembershipCreationAttributes } from "../types/memebership.js";
import { generateUniqueUid } from "../utils/generateUniqueUid.js";
import bcrypt from "bcryptjs";
import { logAudit } from "../utils/auditLogger.js";
import { validateMemberDeletion } from "../utils/validateMemberDeletion.js";

const MembershipController = {

    fetchAll: async (req: Request, res: Response) => {
        try {
            // await cleanupOldDeleted(MembershipModel, 7)
            const authUser = req.user;
            const userRole = authUser?.role;
            const organisationId = authUser?.organizationId;
            const membershipId = authUser?.membershipId;

            const status = req.query.status as string;
            const currentUserId = authUser?.userId;

            // console.log("Current ID --> ", currentUserId);
            // console.log("User Role --> ", userRole);
            // console.log("Status from body --> ", status);

            const whereClause: any = {
               organization_id: organisationId
            };

            if (currentUserId) {
                whereClause.user_id = { [Op.ne]: currentUserId }; // Exclude current user
            }

            // === ROLE-BASED LOGIC ===
            
            if (userRole === 'collaborator') {
            // Get all project IDs where this collaborator is assigned
            const collaboratorProjects = await ProjectMemberModel.findAll({
                where: { membership_id: membershipId },
                attributes: ['project_id'],
                raw: true
            });

            const projectIds = collaboratorProjects.map(pm => pm.project_id);

            if (projectIds.length === 0) {
                // Collaborator is not assigned to any project
                return res.status(200).json({
                    type: 'success',
                    data: [],
                    pagination: status === "all" ? null : {
                        total: 0,
                        page: 1,
                        limit: 5,
                        totalPages: 0,
                        hasNext: false,
                        hasPrev: false
                    }
                });
            }

            // Get all enumerators in those projects
            const enumeratorsInProjects = await ProjectMemberModel.findAll({
                where: {
                    project_id: { [Op.in]: projectIds },
                    role_in_project: 'enumerator'
                },
                attributes: ['membership_id'],
                raw: true
            });

            const enumeratorMembershipIds = [...new Set(enumeratorsInProjects.map(pm => pm.membership_id))];

            if (enumeratorMembershipIds.length === 0) {
                // No enumerators found in collaborator's projects
                return res.status(200).json({
                    type: 'success',
                    data: [],
                    pagination: status === "all" ? null : {
                        total: 0,
                        page: 1,
                        limit: 5,
                        totalPages: 0,
                        hasNext: false,
                        hasPrev: false
                    }
                });
            }

            // Filter to only these enumerator memberships
            whereClause.id = { [Op.in]: enumeratorMembershipIds };
            whereClause.role = 'enumerator';
            whereClause.role = { [Op.ne]: 'admin' };

        } else {
            // Admin: exclude admin role from results
        }

        // === STATUS HANDLING ===

        // Check if status is "all"
        if (status === "all") {
            // Fetch all except 'false' and 'blocked', no pagination
            whereClause.status = { [Op.notIn]: ['false', 'blocked'] };

            const rows = await MembershipModel.findAll({
                where: whereClause,
                order: [['date_of', 'DESC']],
                include: [
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'name', 'email', 'phone', 'status'],
                        required: true
                    },
                    {
                        model: OrganisationModel,
                        as: 'organization',
                        attributes: ['id', 'name'],
                        required: true
                    }
                ]
            });

            return res.status(200).json({
                type: 'success',
                data: rows,
                pagination: null
            });
        }

        // Default behavior: paginated with status ['true', 'blocked']
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;
        const offset = (page - 1) * limit;

        whereClause.status = ['true', 'blocked'];

        const { count, rows } = await MembershipModel.findAndCountAll({
            where: whereClause,
            order: [['date_of', 'DESC']],
            include: [
                {
                    model: UserModel,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'phone', 'status'],
                    required: true
                },
                {
                    model: OrganisationModel,
                    as: 'organization',
                    attributes: ['id', 'name'],
                    required: true
                }
            ],
            limit,
            offset
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
            console.error("Membership: Fetch_All error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },


    fetchOne: async (req: Request, res: Response) => {
        try{
            const {id} = req.params;

            const membership = await MembershipModel.findOne({
                    where: {
                        id,
                        status: ['true', 'blocked'],
                    },
                    include: [
                        {
                            model: UserModel,
                            as: 'user',
                            attributes: ['id', 'name', 'email', 'phone', 'status'],
                        }
                    ],
                });

            if(!membership) {
                    res.status(404).json({
                        type: 'error',
                        message: 'record_not_found',
                    });
                    return;               
            }

            res.status(200).json({
                    type: 'success',
                    data: membership,
            });


        }catch (error) {
            console.error("Membership: Fetch_One error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    create: async (req: Request, res: Response) => {
        try {

        const body = req.body;

        // Required: email, organization_id, role
        if (!body.name || !body.email || !body.organization_id || !body.role) {
            return res.status(400).json({
                type: 'error',
                message: 'fields_required',
            });
        }

        const email = body.email.trim().toLowerCase();


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
           return  res.status(400).json({ type: 'error', message: "invalid_email_format" });
        }

        // Validate role
        const allowedRoles = ['admin', 'collaborator', 'enumerator'];
        if (!allowedRoles.includes(body.role)) {
            return res.status(400).json({
                type: 'error',
                message: 'invalid_role',
            });
        }

        // Step 1: Find user by email
        let userData = await UserModel.findOne({
            where: { email },
        });

        let user = userData?.dataValues;

        let userId: number;

        // Step 2: If user doesn't exist → create new user
        if (!user) {
            const userUid = await generateUniqueUid('users');

            const name = body.name?.trim();
            const phone = body.phone?.trim() || null;

            // Password: use provided or generate a temporary one (you can adjust policy later)
            const password = body.password; // fallback for MVP
            const hashedPassword = await bcrypt.hash(password, 10);

            user = await UserModel.create({
                uid: userUid,
                name,
                email,
                phone,
                password: hashedPassword,
                status: 'true',
                date_of: new Date(),
                update_of: new Date(),
            });

        }

        userId = user.id;



        // Step 3: Check if this user already has an active membership in this organization
        const existingMembership = await MembershipModel.findOne({
            where: {
                user_id: userId,
                organization_id: body.organization_id,
                status: 'true',
            },
        });


        if (existingMembership) {
            return res.status(409).json({
                type: 'error',
                message: 'user_already_in_organization',
            });
        }


        // Step 4: Create the membership
        const newMembership = await MembershipModel.create({
            user_id: userId,
            organization_id: body.organization_id,
            role: body.role,
            status: 'true',
            date_of: new Date(),
        });


        // Step 5: Return full details
        const membershipWithDetails = await MembershipModel.findByPk(newMembership.id, {
            include: [
                { model: UserModel, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
                { model: OrganisationModel, as: 'organization', attributes: ['id', 'name'] },
            ],
        });


        await logAudit({
            req,
            action: "Create",
            entityType: "user",
            entityId: newMembership.id,
            metadata: {
                name: body.name,
                email: body.email,
                role: body.role,
                status: "true"
            }
        });

        res.status(201).json({
            type: 'success',
            message: 'done',
            data: membershipWithDetails,
        });


        }catch (error: any) {
                console.error("Membership: Create error:", error);

                if (error.name === 'SequelizeUniqueConstraintError') {
                    return res.status(409).json({
                        type: 'error',
                        message: 'record_already_exists',
                    });
                }

                res.status(500).json({
                    type: 'error',
                    message: 'server_error',
                });
    }


    },

    update: async (req: Request, res: Response) => {
        try{
            const {id} = req.params;
            const updates: MembershipCreationAttributes = req.body;
            
            const membership = await MembershipModel.findByPk(id);

            if(!membership){
                res.status(404).json({
                    type: 'error',
                    message: 'record_not_found',
                });
                return;               
            }

            await membership.update(updates);

            res.status(200).json({
                type: 'success',
                message: 'done',
                data: membership,
            });
            
        }catch (error: any) {
            console.error("Membership: Update error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    toggleStatus: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            // Validate that status is provided and is one of the allowed values
            const allowedStatuses = ['true', 'false', 'blocked'];
            if (!status || !allowedStatuses.includes(status)) {
                return res.status(400).json({
                    type: 'error',
                    message: 'invalid_status'
                });
            }

            const membershipData = await MembershipModel.findByPk(id);
            const membership = membershipData?.dataValues;

            if (!membership) {
                return res.status(404).json({
                    type: 'error',
                    message: 'record_not_found',
                });
            }
            
            if (status === 'false') {
                const validationResult = await validateMemberDeletion(membership.id, membership.role, membership.organization_id);
                
                if (!validationResult.canDelete) {
                    return res.status(400).json({
                        type: 'warning',
                        message: 'cannot_delete_member_with_data',
                        details: validationResult.details
                    });
                }
            }

            
            // Only update if the status actually changes (optional, but good practice)
            if (membershipData.status === status) {
                return res.status(200).json({
                    type: 'success',
                    message: 'no_change',
                    data: {
                        id: membershipData.id,
                        user_id: membershipData.user_id,
                        status: membershipData.status,
                    },
                });
            }

            const membershipDataResult = await membershipData.update({
                status: status,
            }); 


            const getUserData = await UserModel.findByPk(membershipDataResult.dataValues.user_id);
            const useData = getUserData?.dataValues;

            console.log("UserData --> ", useData);
            console.log("User ID --> ", membershipDataResult.dataValues.user_id);


            await logAudit({
                req,
                action: status == "true" ? "Enabled" : status == "blocked" ? "Blocked" : "Deleted",
                entityType: "user",
                entityId: membershipDataResult.id,
                metadata: {
                    name: useData?.name,
                    email: useData?.email,
                    role: membershipDataResult.dataValues.role,
                    status,
                }
            });


            res.status(200).json({
            type: 'success',
            message: 'done',
            data: {
                id: membership.id,
                user_id: membership.user_id,
                status,
            },
            });
            
        }catch (error) {
            console.error("Membership: Toggle Status error:", error);
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
            const limit = 5;
            const offset = (page - 1) * limit;
            
            if (!q) {
                return res.status(400).json({
                    type: 'error',
                    message: 'search_query_required',
                });
            } 

            const where: any = {
                status: ['true', 'blocked'],
            };

            // === ROLE-BASED FILTERING ===
            if (userRole === 'collaborator') {
                // Get all project IDs where this collaborator is assigned
                const collaboratorProjects = await ProjectMemberModel.findAll({
                    where: { membership_id: membershipId },
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

                // Get all enumerators in those projects
                const enumeratorsInProjects = await ProjectMemberModel.findAll({
                    where: {
                        project_id: { [Op.in]: projectIds },
                        role_in_project: 'enumerator'
                    },
                    attributes: ['membership_id'],
                    raw: true
                });

                const enumeratorMembershipIds = [...new Set(enumeratorsInProjects.map(pm => pm.membership_id))];

                if (enumeratorMembershipIds.length === 0) {
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

                // Filter to only these enumerator memberships
                where.id = { [Op.in]: enumeratorMembershipIds };
                where.role = 'enumerator';
            } else {
                // Admin: exclude admin role
                where.role = { [Op.ne]: 'admin' };
            }
            
            const { count, rows } = await MembershipModel.findAndCountAll({
                where,
                order: [['date_of', 'DESC']],
                include: [
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'name', 'email', 'phone', 'status'],
                        where: { name: { [Op.like]: `%${q}%` } },
                        required: true,
                    },
                    {
                        model: OrganisationModel,
                        as: 'organization',
                        attributes: ['id', 'name'],
                        required: true,
                    }
                ],
                limit,
                offset,
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
                    hasPrev: page > 1,
                },
            });

        } catch (error) {
            console.error("Membership: Search error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    filter: async (req: Request, res: Response) => {
        const authUser = req.user;
        const userRole = authUser?.role;
        const membershipId = authUser?.membershipId;

        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = 5;
            const offset = (page - 1) * limit;

            // Filters from query
            const statusFilter = (req.query.status as string)?.trim();
            const roleFilter = req.query.role ? (req.query.role as string).trim() : undefined;
            const datePreset = (req.query.datePreset as string)?.trim();

            console.log("Role --> ", req.query.role);
            console.log("Status --> ", req.query.status);
            console.log("User Role --> ", userRole);

            const where: any = {};

            // === ROLE-BASED FILTERING ===
            if (userRole === 'collaborator') {
                // Get all project IDs where this collaborator is assigned
                const collaboratorProjects = await ProjectMemberModel.findAll({
                    where: { membership_id: membershipId },
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

                // Get all enumerators in those projects
                const enumeratorsInProjects = await ProjectMemberModel.findAll({
                    where: {
                        project_id: { [Op.in]: projectIds },
                        role_in_project: 'enumerator'
                    },
                    attributes: ['membership_id'],
                    raw: true
                });

                const enumeratorMembershipIds = [...new Set(enumeratorsInProjects.map(pm => pm.membership_id))];

                if (enumeratorMembershipIds.length === 0) {
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

                // Filter to only these enumerator memberships
                where.id = { [Op.in]: enumeratorMembershipIds };
                where.role = 'enumerator'; // Force enumerator role for collaborators
            } else {
                // Admin: apply role filter if provided, otherwise exclude admins
                if (roleFilter) {
                    where.role = roleFilter;
                } else {
                    where.role = { [Op.ne]: 'admin' };
                }
            }

            // Handle status filter
            if (statusFilter) {
                if (statusFilter === "true" || statusFilter === "blocked") {
                    where.status = statusFilter;
                } else if (statusFilter === "false") {
                    where.status = 'false';
                }
            } else {
                // Default behavior: show active + blocked
                where.status = ['true', 'false', 'blocked'];
            }

            // Date preset filter
            if (datePreset && datePreset !== "all") {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                where.date_of = {};

                switch (datePreset) {
                    case "today":
                        where.date_of[Op.gte] = today;
                        where.date_of[Op.lt] = new Date(today.getTime() + 24 * 60 * 60 * 1000);
                        break;
                    case "this_week":
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDay());
                        where.date_of[Op.gte] = weekStart;
                        break;
                    case "this_month":
                        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                        where.date_of[Op.gte] = monthStart;
                        break;
                    case "this_year":
                        const yearStart = new Date(now.getFullYear(), 0, 1);
                        where.date_of[Op.gte] = yearStart;
                        break;
                }
            }

            const { count, rows } = await MembershipModel.findAndCountAll({
                where,
                order: [['date_of', 'DESC']],
                include: [
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'name', 'email', 'phone', 'status'],
                        required: true,
                    },
                    {
                        model: OrganisationModel,
                        as: 'organization',
                        attributes: ['id', 'name'],
                        required: true,
                    },
                ],
                limit,
                offset,
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
                    hasPrev: page > 1,
                },
            });

        } catch (error) {
            console.error("Membership: Filter error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    };

    export default MembershipController;