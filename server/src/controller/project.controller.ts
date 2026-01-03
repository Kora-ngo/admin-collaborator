import type { Request, Response } from "express";
import { cleanupOldDeleted } from "../utils/cleanupOldDeleted.js";
import { AssistanceModel, MembershipModel, OrganisationModel, ProjectAssistanceModel, ProjectMemberModel, ProjectModel } from "../models/index.js";
import { Op } from "sequelize";
import type { ProjectCreationAttributes } from "../types/project.js";

const ProjectController = {

    fetchAll: async (req: Request, res: Response) => {
        try{
            // await cleanupOldDeleted(ProjectModel); 

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 5;
            const offset = (page - 1) * limit; 

            const { count, rows } = await ProjectModel.findAndCountAll({
                where: { status: { [Op.in]: ['true', 'pending', 'ongoing', 'suspended'] } },
                order: [['created_at', 'DESC']],
                include: [
                    { model: OrganisationModel, as: 'organization', attributes: ['id', 'name'] }
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
            console.error("Project: Fetch_All error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    fetchOne: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const project = await ProjectModel.findOne({
                where: { id, status: { [Op.not]: 'false' } },
                include: [
                    { model: OrganisationModel, as: 'organization', attributes: ['id', 'name'] },
                    { model: ProjectMemberModel, as: 'members', include: [{ model: MembershipModel, as: 'membership', include: ['user'] }] },
                    { model: ProjectAssistanceModel, as: 'allowedAssistances', include: [{ model: AssistanceModel, as: 'assistance' }] }
                ]
            });  
            
            if (!project) {
                return res.status(404).json({ type: 'error', message: 'record_not_found' });
            }

            res.status(200).json({ type: 'success', data: project });
        }catch (error) {
            console.error("Project: Fetch_One error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    create: async (req: Request, res: Response) => {
        try {
            const body: ProjectCreationAttributes = req.body;

            if (!body.organisation_id || !body.name) {
                return res.status(400).json({ type: 'error', message: 'fields_required' });
            }

            const newProject = await ProjectModel.create({
                ...body,
                status: body.status || 'pending',
            });

            res.status(201).json({
                type: 'success',
                message: 'done',
                data: newProject,
            });
        }catch (error: any) {
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
                return res.status(404).json({ type: 'error', message: 'record_not_found' });
            }

            await project.update(updates);

            res.status(200).json({
                type: 'success',
                message: 'done',
                data: project,
            });

        } catch (error) {
            console.error("Project: Update error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    updateStatus: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const allowed = ['true', 'false', 'pending', 'ongoing', 'done', 'suspended'];
            if (!allowed.includes(status)) {
                return res.status(400).json({ type: 'error', message: 'invalid_status' });
            }

            const project = await ProjectModel.findByPk(id);
            if (!project) {
                return res.status(404).json({ type: 'error', message: 'record_not_found' });
            }

            await project.update({ status });

            res.status(200).json({
                type: 'success',
                message: 'done',
                data: { id: project.id, status }
            });

        } catch (error) {
            console.error("Project: Update Status error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },    

};

export default ProjectController;