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
            await cleanupOldDeleted(MembershipModel, 7)

        // Get Query Params with defaults----------------------->
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;
        const offset = (page - 1) * limit;
        
        const {count, rows} = await MembershipModel.findAndCountAll({
            where: { status: 'true' },
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

            // Required: organization_id and role
            if (!body.organization_id || !body.role) {
                return res.status(400).json({
                    type: 'error',
                    message: 'fields_required',
                });
            }

            // Validate role
            const allowedRoles = ['admin', 'collaborator', 'enumerator'];
            if (!allowedRoles.includes(body.role)) {
                return res.status(400).json({
                    type: 'error',
                    message: 'invalid_role',
                });
            }

            let userId: number;

            // Case 1: user_id provided
            if (body.user_id) {
                const user = await UserModel.findOne({
                    where: {
                        id: body.user_id,
                        status: 'true', // only active users
                    },
                });

                if (!user) {
                    return res.status(404).json({
                        type: 'error',
                        message: 'user_not_found',
                    });
                }

                userId = body.user_id;
            }


            // Case 2: email provided (no user_id) → find or create user
            else if (body.email) {
                let user = await UserModel.findOne({
                    where: { email: body.email.trim().toLowerCase() },
                });

                // If user doesn't exist → create new one
                if (!user) {
                    const userUid = await generateUniqueUid('users'); // your existing helper

                    user = await UserModel.create({
                        uid: userUid,
                        name: body.name?.trim() || body.email.split('@')[0], // fallback name
                        email: body.email.trim().toLowerCase(),
                        phone: body.phone?.trim() || null,
                        password: await bcrypt.hash(body.password, 10),
                        status: 'true',
                        date_of: new Date(),
                        update_of: new Date(),
                    });
                }

                userId = user.id;
            }

            // No user_id and no email → invalid
            else {
                return res.status(400).json({
                    type: 'error',
                    message: 'user_identifier_required',
                });
            }

            // Final check: prevent duplicate active membership in the same organization
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


            // Create membership
            const newMembership = await MembershipModel.create({
                user_id: userId,
                organization_id: body.organization_id,
                role: body.role,
                status: 'true',
                date_of: new Date(),
            });


            // Return with associations for frontend convenience
            const membershipWithDetails = await MembershipModel.findByPk(newMembership.id, {
                include: [
                    { model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] },
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
            const membershipData = await MembershipModel.findByPk(id);
            const membership = membershipData?.dataValues;

            if (!membership) {
                return res.status(404).json({
                    type: 'error',
                    message: 'record_not_found',
                });
            }     
            
            const newStatus = membership.status === 'true' ? 'false' : 'true';

            await membershipData.update({
                status: newStatus,
            }); 


            res.status(200).json({
            type: 'success',
            message: 'done',
            data: {
                id: membership.id,
                user_id: membership.user_id,
                status: newStatus,
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
                status: 'true',
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
        try{
            const page = parseInt(req.query.page as string) || 1;
            const limit = 5;
            const offset = (page - 1) * limit;

            // Filters
            const status = (req.query.status as string)?.trim(); // "true" | "false"
            const roleId = req.query.roleId ? parseInt(req.query.roleId as string) : undefined;
            const datePreset = (req.query.datePreset as string)?.trim();

            const where: any = {};

            if (status === "true" || status === "false") {
                where.status = status;
            }

            if (roleId && roleId > 0) {
                where.role_id = roleId;
            }

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
                    weekStart.setDate(today.getDate() - today.getDay()); // Sunday
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
            
        }   catch (error) {
            console.error("Membership: Filter error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    };

    export default MembershipController;