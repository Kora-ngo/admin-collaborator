import { type Request, type Response } from 'express';
import { Op } from 'sequelize';
import { ProjectModel, ProjectMemberModel, ProjectAssistanceModel, MembershipModel, AssistanceModel, UserModel, MediaLink, Media, BeneficiaryModel, AssistanceTypeModel, DeliveryItemModel, DeliveryModel, BeneficiaryMemberModel } from '../models/index.js';
import type { ProjectCreationAttributes } from '../types/project.js';
import { cleanupOldDeleted } from '../utils/cleanupOldDeleted.js';
import { bulkUpdateProjectStatuses, updateProjectStatusInDB } from '../helpers/projectStatus.js';
import sequelize from '../config/database.js';
import MediaController from './media.controller.js';
import { base64ToBuffer } from '../utils/base64ToBuffer.js';
import { getProjectEditMetadata } from '../helpers/getProjectEditMetadata.js';
import { validateMemberDeletion } from '../utils/validateMemberDeletion.js';

const ProjectController = {
    
    create: async (req: Request, res: Response) => {
        const transaction = await sequelize.transaction();


        try {
            const body = req.body;
            const middlewareAuth = req.user;

            if (!body.name || !body.organisation_id || !body.start_date || !body.end_date || !body.selectedMembers?.length) {
                res.status(400).json({
                    type: 'error',
                    message: 'fields_required',
                });
                return;
            }


            // Parse selectedMembers and selectedAssistances if they're strings (from FormData)
            const selectedMembers = typeof body.selectedMembers === 'string' 
                ? JSON.parse(body.selectedMembers) 
                : body.selectedMembers;


            const selectedAssistances = typeof body.selectedAssistances === 'string'
                ? JSON.parse(body.selectedAssistances)
                : body.selectedAssistances;

            if (!selectedMembers?.length) {
                await transaction.rollback();
                res.status(400).json({
                    type: 'error',
                    message: 'members_required',
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
                created_by: middlewareAuth?.membershipId!,
                name: body.name,
                description: body.description || '',
                status: 'pending',
                start_date: body.start_date,
                end_date: body.end_date,
                target_families: body.target_families
            }, {transaction});



            // Add members
            if (body.selectedMembers?.length > 0) {
                const membersData = body.selectedMembers.map((m: any) => ({
                    project_id: newProject.id,
                    membership_id: m.membership_id,
                    role_in_project: m.role_in_project
                }));
                await ProjectMemberModel.bulkCreate(membersData, {transaction});
            }



            // Add assistances
            if (body.selectedAssistances?.length > 0) {
                const assistancesData = body.selectedAssistances.map((a: any) => ({
                    project_id: newProject.id,
                    assistance_id: a.assistance_id
                }));
                await ProjectAssistanceModel.bulkCreate(assistancesData, {transaction});
            }

            let uploadedFiles: any[] = [];
            if (body.files && body.files.length > 0) {


                // Convert base64 files to buffer format
                const processedFiles = body.files.map((fileData: any) => {
                    const { buffer, mimetype, size } = base64ToBuffer(fileData.base64);
                    
                    return {
                        buffer,
                        mimetype,
                        originalname: fileData.name,
                        size
                    };
                });
                


                uploadedFiles  = await MediaController.uploadAndLinkFiles(
                    processedFiles as any[],
                    'project',
                    newProject.id,
                    'document',
                    body.organisation_id,
                    middlewareAuth?.membershipId || 0,
                    transaction
                );

            }

            await transaction.commit();

            res.status(201).json({
                type: 'success',
                message: 'done',
                data: {
                    project: newProject,
                    uploadedFiles: uploadedFiles
                },
            });
        } catch (error: any) {
            console.error("Project: Create error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },


    fetchAll: async (req: Request, res: Response) => {
        const userRole = req.user!.role;
        const organisationId = req.user?.organizationId;
        const membershipId = req.user!.membershipId;


        try {
            // Clean up old deleted projects (7 days)
            // await cleanupOldDeleted(ProjectModel, 7);

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 5;
            const offset = (page - 1) * limit;

            // Build where clause based on role
            const whereClause: any = { 
                status: {[Op.ne]: 'false' },
                organisation_id: organisationId
            };

            let includeArray: any[] = [];
            let projectIds;

            // Build include array - conditionally filter members for collaborators
            if(userRole === "collaborator"){

                const collaboratorProjects = await ProjectMemberModel.findAll({
                    where: { 
                        membership_id: membershipId
                     },
                    attributes: ['project_id'],
                    raw: true
                });

                projectIds = collaboratorProjects.map(pm => pm.project_id);

                }

                
                 includeArray = [
                {
                    model: ProjectMemberModel,
                    as: 'members',
                    ...(userRole === 'collaborator' && {
                        where: { 
                            project_id: { [Op.in]: projectIds },
                            role_in_project: ['enumerator', 'collaborator']
                         },
                        required: true // INNER JOIN - only fetch projects where user is a member
                    }),
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
                },
                {
                    model: MediaLink,
                    as: 'mediaLinks',
                    include: [
                        {
                            model: Media,
                            as: 'media',
                            attributes: ['id', 'file_name', 'file_type', 'storage_path', 'size', 'created_at']
                        }
                    ]
                },
                // APPROVED BENEFICIARIES with their members
                {
                    model: BeneficiaryModel,
                    as: 'beneficiaries',
                    where: { review_status: 'approved' },
                    required: false, // LEFT JOIN - projects without approved beneficiaries will still be shown
                    include: [
                        {
                            model: BeneficiaryMemberModel,
                            as: 'members',
                            attributes: ['id', 'full_name', 'gender', 'date_of_birth', 'relationship']
                        }
                    ]
                },
                // APPROVED DELIVERIES with their items
                {
                    model: DeliveryModel,
                    as: 'deliveries',
                    where: { review_status: 'approved' },
                    required: false, // LEFT JOIN - projects without approved deliveries will still be shown
                    include: [
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
                            model: BeneficiaryModel,
                            as: 'beneficiary',
                            attributes: ['id', 'family_code', 'head_name', 'phone']
                        }
                    ]
                }
            ];
            

        const { count, rows } = await ProjectModel.findAndCountAll({
            where: whereClause,
            order: [['created_at', 'DESC']],
            include: includeArray,
            limit,
            offset,
            distinct: true,
            col: 'id'
        });

        const totalPages = Math.ceil(count / limit);

        await bulkUpdateProjectStatuses(rows);

        // Convert to plain JSON objects
        const projectsData = rows.map(p => {
            const data: any = p.dataValues || p;
            return {
                ...data,
                members: data.members?.map((m: any) => m.dataValues || m) || [],
                assistances: data.assistances?.map((a: any) => a.dataValues || a) || [],
                beneficiaries: data.beneficiaries?.map((b: any) => b.dataValues || b) || [],
                deliveries: data.deliveries?.map((d: any) => d.dataValues || d) || [],
                mediaLinks: data.mediaLinks?.map((ml: any) => ml.dataValues || ml) || []
            };
        });

        res.status(200).json({
            type: 'success',
            data: projectsData,
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
                    },
                    {
                        model: MediaLink,
                        as: 'mediaLinks',
                        include: [
                            {
                                model: Media,
                                as: 'media',
                                attributes: ['id', 'file_name', 'file_type', 'storage_path', 'size', 'created_at']
                            }
                        ]
                    },

                                    // APPROVED BENEFICIARIES with their members
                {
                    model: BeneficiaryModel,
                    as: 'beneficiaries',
                    where: { review_status: 'approved' },
                    required: false, // LEFT JOIN - projects without approved beneficiaries will still be shown
                    include: [
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
                    ]
                },
                // APPROVED DELIVERIES with their items
                {
                    model: DeliveryModel,
                    as: 'deliveries',
                    where: { review_status: 'approved' },
                    required: false, // LEFT JOIN - projects without approved deliveries will still be shown
                    include: [
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
                            model: BeneficiaryModel,
                            as: 'beneficiary',
                            attributes: ['id', 'family_code', 'head_name', 'phone']
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

            await updateProjectStatusInDB(project);

            res.status(200).json({
                type: 'success',
                data: project.toJSON(),
            });
        } catch (error) {
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    update: async (req: Request, res: Response) => {
        const transaction = await sequelize.transaction();
        
        try {

            const { id } = req.params;
            const updates = req.body;
            const middlewareAuth = req.user;


            const project = await ProjectModel.findByPk(id);


            if (!project?.dataValues) {
                await transaction.rollback();
                res.status(404).json({
                    type: 'error',
                    message: 'record_not_found',
                });
                return;
            }

            if (updates.name === '') {
                await transaction.rollback();
                res.status(400).json({
                    type: 'error',
                    message: 'fields_required',
                });
                return;
            }

            // Update basic project info
            await project.update({
                name: updates.name,
                description: updates.description,
                // start_date: updates.start_date,
                // end_date: updates.end_date,
                status: updates.status,
                // target_families: updates.target_families
            }, { transaction });

            // Handle members update (only update unlocked ones)
            if (updates.selectedMembers !== undefined) {
                const metadata = await getProjectEditMetadata(Number(id));
                
                // Get current members
                const currentMembers = await ProjectMemberModel.findAll({
                    where: { project_id: id }
                });

                // Keep locked members, replace unlocked ones
                const lockedMemberIds = metadata.lockedMembers.map((m: any) => m.membership_id);
                const lockedMembers = currentMembers.filter(m => 
                    lockedMemberIds.includes(m.membership_id)
                );

                // Remove all unlocked members
                await ProjectMemberModel.destroy({
                    where: {
                        project_id: id,
                        membership_id: { [Op.notIn]: lockedMemberIds }
                    },
                    transaction
                });

                // Add new members (excluding those already locked)
                const newMembers = updates.selectedMembers.filter((m: any) => 
                    !lockedMemberIds.includes(m.membership_id)
                );

                if (newMembers.length > 0) {
                    const membersData = newMembers.map((m: any) => ({
                        project_id: id,
                        membership_id: m.membership_id,
                        role_in_project: m.role_in_project
                    }));
                    await ProjectMemberModel.bulkCreate(membersData, { transaction });
                }
            }

            // Handle assistances update (only update unlocked ones)
            if (updates.selectedAssistances !== undefined) {
                const metadata = await getProjectEditMetadata(Number(id));
                
                // Keep locked assistances, replace unlocked ones
                const lockedAssistanceIds = metadata.lockedAssistances.map((a: any) => a.assistance_id);

                // Remove all unlocked assistances
                await ProjectAssistanceModel.destroy({
                    where: {
                        project_id: id,
                        assistance_id: { [Op.notIn]: lockedAssistanceIds }
                    },
                    transaction
                });

                // Add new assistances (excluding those already locked)
                const newAssistances = updates.selectedAssistances.filter((a: any) => 
                    !lockedAssistanceIds.includes(a.assistance_id)
                );

                if (newAssistances.length > 0) {
                    const assistancesData = newAssistances.map((a: any) => ({
                        project_id: id,
                        assistance_id: a.assistance_id
                    }));
                    await ProjectAssistanceModel.bulkCreate(assistancesData, { transaction });
                }
            }

            // Handle file updates
            if (updates.filesToDelete && updates.filesToDelete.length > 0) {
                // Delete specified media files
                for (const mediaId of updates.filesToDelete) {
                    const result = await MediaController.deleteMediaById(mediaId, transaction);

                    if (!result.success) {
                        console.warn(`Failed to delete media ${mediaId}`);
                    }
                }
            }


            // Handle new file uploads
            let uploadedFiles: any[] = [];
            if (updates.files && updates.files.length > 0) {
                const processedFiles = updates.files.map((fileData: any) => {
                    const { buffer, mimetype, size } = base64ToBuffer(fileData.base64);
                    return {
                        buffer,
                        mimetype,
                        originalname: fileData.name,
                        size
                    };
                });


                uploadedFiles = await MediaController.uploadAndLinkFiles(
                    processedFiles as any[],
                    'project',
                    project.dataValues.id,
                    'document',
                    updates.organisation_id,
                    middlewareAuth?.membershipId || 0,
                    transaction
                );
            }

            await transaction.commit();

            res.status(200).json({
                type: 'success',
                message: 'done',
                data: {
                    project,
                    uploadedFiles
                },
            });
        } catch (error: any) {
            await transaction.rollback();
            console.error("Project: Update error:", error.message);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },


    // New method: Check if project can be deleted
    canDelete: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const beneficiaryCount = await BeneficiaryModel.count({
                where: { 
                    project_id: id,
                    review_status: { [Op.ne]: 'false' }
                }
            });

            const deliveryCount = await DeliveryModel.count({
                where: { 
                    project_id: id,
                    review_status: { [Op.ne]: 'false' }
                }
            });

            const canDelete = beneficiaryCount === 0 && deliveryCount === 0;

            res.status(200).json({
                type: 'success',
                data: {
                    canDelete,
                    beneficiaryCount,
                    deliveryCount,
                    message: canDelete 
                        ? 'Project can be deleted'
                        : `Cannot delete: ${beneficiaryCount} beneficiaries, ${deliveryCount} deliveries`
                }
            });
        } catch (error) {
            console.error("Project: Can Delete check error:", error);
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

            const projectData = await ProjectModel.findByPk(id);
            const project = projectData?.dataValues;

            if (!project) {
                return res.status(404).json({
                    type: 'error',
                    message: 'record_not_found',
                });
            }

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
        const userRole = req.user!.role;
        const membershipId = req.user!.membershipId;
        const organisationId = req.user?.organizationId;

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
                name: { [Op.like]: `%${q}%` },
                organisation_id: organisationId
            };

            // Build includes with role-based filtering
            const includeArray: any[] = [
                {
                    model: ProjectMemberModel,
                    as: 'members',
                    // Filter by membership_id for collaborators
                    ...(userRole === 'collaborator' && {
                        where: { membership_id: membershipId },
                        required: true
                    }),
                    include: [{
                        model: MembershipModel,
                        as: 'membership',
                        attributes: ['id', 'role'],
                        include: [{ 
                            model: UserModel, 
                            as: 'user',
                            attributes: ['id', 'name', 'email']
                        }]
                    }]
                },
                {
                    model: ProjectAssistanceModel,
                    as: 'assistances',
                    include: [{ 
                        model: AssistanceModel, 
                        as: 'assistance',
                        attributes: ['id', 'name']
                    }]
                },
                {
                    model: MediaLink,
                    as: 'mediaLinks',
                    include: [{ 
                        model: Media, 
                        as: 'media',
                        attributes: ['id', 'file_name', 'file_type', 'storage_path', 'size', 'created_at']
                    }]
                }
            ];

            const { count, rows } = await ProjectModel.findAndCountAll({
                where,
                order: [['created_at', 'DESC']],
                include: includeArray,
                limit,
                offset,
                distinct: true,
                col: 'id'
            });

            await bulkUpdateProjectStatuses(rows);
            const projectsData = rows.map(p => p.toJSON());

            res.status(200).json({
                type: 'success',
                data: projectsData,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit),
                    hasNext: page < Math.ceil(count / limit),
                    hasPrev: page > 1,
                },
            });
        } catch (error) {
            console.error("Project: Search error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    filter: async (req: Request, res: Response) => {
        const userRole = req.user!.role;
        const membershipId = req.user!.membershipId;
        const organisationId = req.user?.organizationId;

        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = 5;
            const offset = (page - 1) * limit;

            const status = (req.query.status as string)?.trim();
            const datePreset = (req.query.datePreset as string)?.trim();

            const where: any = {
                organisation_id: organisationId
            };

            if (status) where.status = status;

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
                        where.created_at[Op.gte] = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                    case "this_year":
                        where.created_at[Op.gte] = new Date(now.getFullYear(), 0, 1);
                        break;
                }
            }

            // Build includes with role-based filtering
            const includeArray: any[] = [
                {
                    model: ProjectMemberModel,
                    as: 'members',
                    // Filter by membership_id for collaborators
                    ...(userRole === 'collaborator' && {
                        where: { membership_id: membershipId },
                        required: true
                    }),
                    include: [{
                        model: MembershipModel,
                        as: 'membership',
                        attributes: ['id', 'role'],
                        include: [{ 
                            model: UserModel, 
                            as: 'user',
                            attributes: ['id', 'name', 'email']
                        }]
                    }]
                },
                {
                    model: ProjectAssistanceModel,
                    as: 'assistances',
                    include: [{ 
                        model: AssistanceModel, 
                        as: 'assistance',
                        attributes: ['id', 'name']
                    }]
                },
                {
                    model: MediaLink,
                    as: 'mediaLinks',
                    include: [{ 
                        model: Media, 
                        as: 'media',
                        attributes: ['id', 'file_name', 'file_type', 'storage_path', 'size', 'created_at']
                    }]
                }
            ];

            const { count, rows } = await ProjectModel.findAndCountAll({
                where,
                order: [['created_at', 'DESC']],
                include: includeArray,
                limit,
                offset,
                distinct: true,
                col: 'id'
            });

            await bulkUpdateProjectStatuses(rows);
            const projectsData = rows.map(p => p.toJSON());

            res.status(200).json({
                type: 'success',
                data: projectsData,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit),
                    hasNext: page < Math.ceil(count / limit),
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