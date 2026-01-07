import { type Request, type Response } from 'express';
import { Op } from 'sequelize';
import { ProjectModel, ProjectMemberModel, ProjectAssistanceModel, MembershipModel, AssistanceModel, UserModel } from '../models/index.js';
import type { ProjectCreationAttributes } from '../types/project.js';
import { cleanupOldDeleted } from '../utils/cleanupOldDeleted.js';
import { applyProjectStatusToAll, applyProjectStatus } from '../helpers/projectStatus.js';

const ProjectController = {
    
    fetchAll: async (req: Request, res: Response) => {
        console.log("Backend fetch --> entrance");

        try {
            // Clean up old deleted projects (7 days)
            // await cleanupOldDeleted(ProjectModel, 7);

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 5;
            const offset = (page - 1) * limit;

            const { count, rows } = await ProjectModel.findAndCountAll({
                where: { status: { [Op.ne]: 'false' } },
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: ProjectMemberModel,
                        as: 'members',
                        include: [
                            {
                                model: MembershipModel,
                                as: 'membership',
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
                    },
                    {
                        model: ProjectAssistanceModel,
                        as: 'assistances',
                        include: [
                            {
                                model: AssistanceModel,
                                as: 'assistance',
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ],
                limit,
                offset,
                distinct: true, // FIX: Counts distinct projects, not joined rows
                col: 'id' // Specify which column to count distinctly
            });

            const totalPages = Math.ceil(count / limit);

            // Apply automatic status based on dates
            const projectsWithStatus = applyProjectStatusToAll(rows);

            res.status(200).json({
                type: 'success',
                data: projectsWithStatus,
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
            console.error("Project: Fetch_All error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    fetchOne: async (req: Request, res: Response) => {
        console.log("Backend fetchOne --> entrance");
        
        try {
            const { id } = req.params;
            
            const project = await ProjectModel.findOne({
                where: {
                    id,
                    status: { [Op.ne]: 'false' }
                },
                include: [
                    {
                        model: ProjectMemberModel,
                        as: 'members',
                        include: [
                            {
                                model: MembershipModel,
                                as: 'membership',
                                attributes: ['id', 'role'],
                                include: [
                                    {
                                        model: UserModel,
                                        as: 'user',
                                        attributes: ['id', 'name']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: ProjectAssistanceModel,
                        as: 'assistances',
                        include: [
                            {
                                model: AssistanceModel,
                                as: 'assistance',
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ]
            });

            if (!project) {
                res.status(404).json({
                    type: 'error',
                    message: 'record_not_found',
                });
                return;
            }

            // Apply automatic status
            const projectWithStatus = applyProjectStatus(project.toJSON());

            res.status(200).json({
                type: 'success',
                data: projectWithStatus,
            });
        } catch (error) {
            console.error("Project: Fetch_One error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    create: async (req: Request, res: Response) => {
        try {
            const body = req.body;
            const middlewareAuth = req.user;

            console.log("Project - creation - body --> ", body);

            if (!body.name || !body.organisation_id || !body.start_date || !body.end_date || !body.selectedMembers?.length) {
                res.status(400).json({
                    type: 'error',
                    message: 'fields_required',
                });
                return;
            }

            // Check for duplicate project name in the same organisation
            const existingProject = await ProjectModel.findOne({
                where: { 
                    name: body.name, 
                    organisation_id: body.organisation_id, 
                    status: { [Op.ne]: 'false' } 
                }
            });

            if (existingProject) {
                res.status(409).json({
                    type: 'error',
                    message: 'record_already_exists',
                });
                return;
            }

            // Create project
            const newProject = await ProjectModel.create({
                organisation_id: body.organisation_id,
                membership_id: middlewareAuth!.membershipId,
                name: body.name,
                description: body.description || '',
                status: 'pending',
                start_date: body.start_date,
                end_date: body.end_date,
                target_families: body.target_families
            });

            // Add members
            if (body.selectedMembers?.length > 0) {
                const membersData = body.selectedMembers.map((m: any) => ({
                    project_id: newProject.id,
                    membership_id: m.membership_id,
                    role_in_project: m.role_in_project
                }));
                await ProjectMemberModel.bulkCreate(membersData);
            }

            // Add assistances
            if (body.selectedAssistances?.length > 0) {
                const assistancesData = body.selectedAssistances.map((a: any) => ({
                    project_id: newProject.id,
                    assistance_id: a.assistance_id
                }));
                await ProjectAssistanceModel.bulkCreate(assistancesData);
            }

            res.status(201).json({
                type: 'success',
                message: 'done',
                data: newProject,
            });
        } catch (error: any) {
            console.error("Project: Create error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updates = req.body;

            const project = await ProjectModel.findByPk(id);

            if (!project) {
                res.status(404).json({
                    type: 'error',
                    message: 'record_not_found',
                });
                return;
            }

            if (updates.name === '' || (updates.description === '' && updates.description !== undefined)) {
                res.status(400).json({
                    type: 'error',
                    message: 'fields_required',
                });
                return;
            }

            // Update basic project fields
            await project.update({
                name: updates.name,
                description: updates.description,
                start_date: updates.start_date,
                end_date: updates.end_date,
                status: updates.status,
                target_families: updates.target_families
            });

            // Update members if provided
            if (updates.selectedMembers !== undefined) {
                // Remove old members
                await ProjectMemberModel.destroy({ where: { project_id: id } });
                
                // Add new members
                if (updates.selectedMembers.length > 0) {
                    const membersData = updates.selectedMembers.map((m: any) => ({
                        project_id: id,
                        membership_id: m.membership_id,
                        role_in_project: m.role_in_project
                    }));
                    await ProjectMemberModel.bulkCreate(membersData);
                }
            }

            // Update assistances if provided
            if (updates.selectedAssistances !== undefined) {
                // Remove old assistances
                await ProjectAssistanceModel.destroy({ where: { project_id: id } });
                
                // Add new assistances
                if (updates.selectedAssistances.length > 0) {
                    const assistancesData = updates.selectedAssistances.map((a: any) => ({
                        project_id: id,
                        assistance_id: a.assistance_id
                    }));
                    await ProjectAssistanceModel.bulkCreate(assistancesData);
                }
            }

            res.status(200).json({
                type: 'success',
                message: 'done',
                data: project,
            });
        } catch (error: any) {
            console.error("Project: Update error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    toggleStatus: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const projectData = await ProjectModel.findByPk(id);
            const project = projectData?.dataValues;

            if (!project) {
                return res.status(404).json({
                    type: 'error',
                    message: 'record_not_found',
                });
            }

            // Toggle status: if 'false' restore to 'pending', else delete (set to 'false')
            const newStatus = project.status === 'false' ? 'pending' : 'false';

            await projectData.update({
                status: newStatus
            });

            res.status(200).json({
                type: 'success',
                message: 'done',
                data: {
                    id: project.id,
                    name: project.name,
                    status: newStatus,
                },
            });
        } catch (error) {
            console.error("Project: Toggle Status error:", error);
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
                status: { [Op.ne]: 'false' },
                name: { [Op.like]: `%${q}%` }
            };

            const { count, rows } = await ProjectModel.findAndCountAll({
                where,
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: ProjectMemberModel,
                        as: 'members',
                        include: [
                            {
                                model: MembershipModel,
                                as: 'membership',
                                attributes: ['id', 'role'],
                                include: [
                                    {
                                        model: UserModel,
                                        as: 'user',
                                        attributes: ['id', 'name']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: ProjectAssistanceModel,
                        as: 'assistances',
                        include: [
                            {
                                model: AssistanceModel,
                                as: 'assistance',
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ],
                limit,
                offset,
                distinct: true,
                col: 'id'
            });

            const totalPages = Math.ceil(count / limit);

            // Apply automatic status based on dates
            const projectsWithStatus = applyProjectStatusToAll(rows);

            res.status(200).json({
                type: 'success',
                data: projectsWithStatus,
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
            console.error("Project: Search error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    filter: async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = 5;
            const offset = (page - 1) * limit;

            const status = (req.query.status as string)?.trim();
            const datePreset = (req.query.datePreset as string)?.trim();

            const where: any = {};

            // Status filter
            if (status) {
                where.status = status;
            }

            // Date filter
            if (datePreset && datePreset !== "all") {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                where.created_at = {};

                switch (datePreset) {
                    case "today":
                        where.created_at[Op.gte] = today;
                        where.created_at[Op.lt] = new Date(today.getTime() + 24 * 60 * 60 * 1000);
                        break;

                    case "this_week":
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDay());
                        where.created_at[Op.gte] = weekStart;
                        break;

                    case "this_month":
                        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                        where.created_at[Op.gte] = monthStart;
                        break;

                    case "this_year":
                        const yearStart = new Date(now.getFullYear(), 0, 1);
                        where.created_at[Op.gte] = yearStart;
                        break;
                }
            }

            const { count, rows } = await ProjectModel.findAndCountAll({
                where,
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: ProjectMemberModel,
                        as: 'members',
                        include: [
                            {
                                model: MembershipModel,
                                as: 'membership',
                                attributes: ['id', 'role'],
                                include: [
                                    {
                                        model: UserModel,
                                        as: 'user',
                                        attributes: ['id', 'name']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: ProjectAssistanceModel,
                        as: 'assistances',
                        include: [
                            {
                                model: AssistanceModel,
                                as: 'assistance',
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ],
                limit,
                offset,
                distinct: true,
                col: 'id'
            });

            const totalPages = Math.ceil(count / limit);

            // Apply automatic status based on dates
            const projectsWithStatus = applyProjectStatusToAll(rows);

            res.status(200).json({
                type: 'success',
                data: projectsWithStatus,
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
            console.error("Project: Filter error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
};

export default ProjectController;