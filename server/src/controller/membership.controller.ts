import type { Request, Response } from "express";
import {MembershipModel, OrganisationModel} from "../models/index.js"
import { cleanupOldDeleted } from "../utils/cleanupOldDeleted.js"
import UserModel from "../models/User.js";
import { Op } from 'sequelize';
import type { MembershipCreationAttributes } from "../types/memebership.js";
import { generateUniqueUid } from "../utils/generateUniqueUid.js";
import bcrypt from "bcryptjs";

const MembershipController = {

    fetchAll: async (req: Request, res: Response) => {
        try{
            // await cleanupOldDeleted(MembershipModel, 7)
        const authUser = req.user;

        // Get Query Params with defaults----------------------->
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;
        const offset = (page - 1) * limit;

        const currentUserId = authUser?.userId;

        console.log("Current ID --> ", currentUserId);

        const whereClause: any = {
            status: ['true', 'blocked'],
        };

        if (currentUserId) {
            whereClause.user_id = { [Op.ne]: currentUserId }; // Not Equal
        }
        
        const {count, rows} = await MembershipModel.findAndCountAll({
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
        
        }catch (error) {
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
                        status: 'true',
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

            await membershipData.update({
                status: status,
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
            
            const { count, rows } = await MembershipModel.findAndCountAll({
            where,
            order: [['date_of', 'DESC']],
            include: [
                {
                model: UserModel,
                as: 'user',
                attributes: ['id', 'name', 'email', 'phone', 'status' ],
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

        }catch (error) {
            console.error("Membership: Search error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    filter: async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = 5;
            const offset = (page - 1) * limit;

            // Filters from query
            const statusFilter = (req.query.status as string)?.trim(); // "true" | "false" | "blocked" | undefined
            const roleFilter = req.query.role ? (req.query.role as string).trim() : undefined;
            const datePreset = (req.query.datePreset as string)?.trim();

            console.log("Role --> ", req.query.role);
            console.log("Status --> ", req.query.status);

            const where: any = {};

            // Handle status filter
            if (statusFilter) {
                if (statusFilter === "true" || statusFilter === "blocked") {
                    where.status = statusFilter; // exact match
                } else if (statusFilter === "false") {
                    where.status = 'false';
                }
                // If invalid, ignore (or you can return error)
            } else {
                // Default behavior: show active + blocked
                where.status = ['true', 'false', 'blocked'];
            }

            // Role filter (assuming role is string: admin/collaborator/enumerator)
            if (roleFilter) {
                where.role = roleFilter;
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