import { type Request, type Response } from 'express';
import { Op } from 'sequelize';
import { ProjectModel, ProjectMemberModel, MembershipModel } from '../models/index.js';

const DashboardController = {
    
    adminKeyMetrics: async (req: Request, res: Response) => {
        console.log("Backend adminKeyMetrics --> entrance");

        try {
            const authUser = req.user;
            const organisationId = authUser?.organizationId;

            if (!organisationId) {
                res.status(400).json({
                    type: 'error',
                    message: 'organisation_id_required',
                });
                return;
            }

            // 1. Active Projects (status: ongoing)
            const activeProjects = await ProjectModel.count({
                where: {
                    organisation_id: organisationId,
                    status: ['ongoing', 'overdue', '']
                }
            });

            // 2. Total Families Registered (0 for now)
            const totalFamilies = 0;

            // 3. Total Deliveries Made (0 for now)
            const totalDeliveries = 0;

            // 4. Active Field Users (users on ongoing projects)
            const ongoingProjects = await ProjectModel.findAll({
                where: {
                    organisation_id: organisationId,
                    status: ['ongoing', 'overdue', '']
                },
                attributes: ['id'],
                raw: true
            });

            const ongoingProjectIds = ongoingProjects.map(p => p.id);


            let activeFieldUsers = 0;

            if (ongoingProjectIds.length > 0) {

                // Get unique memberships from ongoing projects
                const uniqueMemberships = await ProjectMemberModel.findAll({
                    where: {
                        project_id: { [Op.in]: ongoingProjectIds }
                    },
                    attributes: ['membership_id'],
                    group: ['membership_id']
                });

                activeFieldUsers = uniqueMemberships.length;
            }

            res.status(200).json({
                type: 'success',
                data: {
                    activeProjects,
                    totalFamilies,
                    totalDeliveries,
                    activeFieldUsers
                }
            });

        } catch (error) {
            console.error("Dashboard: adminKeyMetrics error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    adminProjectProgress: async (req: Request, res: Response) => {
        console.log("Backend adminProjectProgress --> entrance");

        try {
            const authUser = req.user;
            const organisationId = authUser?.organizationId;

            if (!organisationId) {
                res.status(400).json({
                    type: 'error',
                    message: 'organisation_id_required',
                });
                return;
            }

            // Get all ongoing projects
            const ongoingProjects = await ProjectModel.findAll({
                where: {
                    organisation_id: organisationId,
                    status: ['ongoing', 'overdue', '']
                },
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: ProjectMemberModel,
                        as: 'members',
                        attributes: ['id']
                    }
                ]
            });

            // Calculate metrics for each project
            const projectsWithMetrics = ongoingProjects.map((project: any) => {
                const projectData = project.toJSON();

                // Calculate days left
                const today = new Date();
                const endDate = new Date(projectData.end_date!);
                const timeDiff = endDate.getTime() - today.getTime();
                const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

                return {
                    id: projectData.id,
                    name: projectData.name,
                    familiesRegistered: 0, // Will be implemented later
                    deliveriesCompleted: 0, // Will be implemented later
                    daysLeft: daysLeft > 0 ? daysLeft : 0,
                    startDate: projectData.start_date,
                    endDate: projectData.end_date,
                    membersCount: projectData.members?.length || 0
                };
            });

            res.status(200).json({
                type: 'success',
                data: projectsWithMetrics
            });

        } catch (error) {
            console.error("Dashboard: adminProjectProgress error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

};

export default DashboardController;