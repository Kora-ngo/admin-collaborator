import { type Request, type Response } from 'express';
import { Op, or, Sequelize } from 'sequelize';
import { 
    ProjectModel, 
    ProjectMemberModel, 
    MembershipModel, 
    BeneficiaryModel, 
    DeliveryModel, 
    UserModel 
} from '../models/index.js';

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

            // 1. Active Projects (status: ongoing, overdue)
            const activeProjects = await ProjectModel.count({
                where: {
                    status: { [Op.in]: ['ongoing', 'overdue'] },
                    organisation_id: organisationId
                }
            });

            // 2. Total Families Registered (APPROVED beneficiaries only)
            const totalFamilies = await BeneficiaryModel.count({
                where: {
                    review_status: 'approved'
                },
                include: [
                    {
                        model: ProjectModel,
                        as: 'project',
                        where: { organisation_id: organisationId },
                        attributes: []
                    }
                ]
            });

            // 3. Total Deliveries Made (APPROVED deliveries only)
            const totalDeliveries = await DeliveryModel.count({
                where: {
                    review_status: 'approved'
                },
                include: [
                    {
                        model: ProjectModel,
                        as: 'project',
                        where: { organisation_id: organisationId },
                        attributes: []
                    }
                ]
            });

            // 4. Active Field Users (enumerators + collaborators on ongoing projects)
            const ongoingProjects = await ProjectModel.findAll({
                where: {
                    status: { [Op.in]: ['ongoing', 'overdue'] },
                    organisation_id: organisationId
                },
                attributes: ['id'],
                raw: true
            });

            const ongoingProjectIds = ongoingProjects.map(p => p.id);

            let activeFieldUsers = 0;

            if (ongoingProjectIds.length > 0) {
                // Get unique memberships from ongoing projects
                const uniqueMemberships = await ProjectMemberModel.count({
                    where: {
                        project_id: { [Op.in]: ongoingProjectIds }
                    },
                    distinct: true,
                    col: 'membership_id'
                });

                activeFieldUsers = uniqueMemberships;
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
                    status: { [Op.in]: ['ongoing', 'overdue'] },
                    organisation_id: organisationId
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
            const projectsWithMetrics = await Promise.all(
                ongoingProjects.map(async (project: any) => {
                    const projectData = project.toJSON();
                    const projectId = projectData.id;

                    // Days left until end
                    const today = new Date();
                    const endDate = new Date(projectData.end_date);
                    const timeDiff = endDate.getTime() - today.getTime();
                    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

                    // Count APPROVED beneficiaries only
                    const familiesRegistered = await BeneficiaryModel.count({
                        where: {
                            project_id: projectId,
                            review_status: 'approved'
                        }
                    });

                    // Count APPROVED deliveries only
                    const deliveriesCompleted = await DeliveryModel.count({
                        where: {
                            project_id: projectId,
                            review_status: 'approved'
                        }
                    });

                    // Calculate progress percentage
                    const targetFamilies = projectData.target_families || 0;
                    const progressPercentage = targetFamilies > 0 
                        ? Math.round((familiesRegistered / targetFamilies) * 100)
                        : 0;

                    return {
                        id: projectData.id,
                        name: projectData.name,
                        familiesRegistered,
                        targetFamilies,
                        deliveriesCompleted,
                        progressPercentage,
                        daysLeft: daysLeft > 0 ? daysLeft : 0,
                        startDate: projectData.start_date,
                        endDate: projectData.end_date,
                        membersCount: projectData.members?.length || 0,
                        status: projectData.status
                    };
                })
            );

            res.status(200).json({
                type: 'success',
                data: projectsWithMetrics
            });

        } catch (error) {
            console.error("Dashboard: adminProjectProgress error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    adminAlerts: async (req: Request, res: Response) => {
        console.log("Backend adminAlerts --> entrance");
        
        try {
            const authUser = req.user;
            if (!authUser?.organizationId) {
                return res.status(401).json({ type: 'error', message: 'unauthorized' });
            }

            const orgId = authUser.organizationId;

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const fourDaysAgo = new Date();
            fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

            const alerts: any[] = [];

            // ===================================================================
            // 1. Pending Beneficiaries (awaiting review)
            // ===================================================================
            const pendingBeneficiaries = await BeneficiaryModel.findAll({
                where: { review_status: 'pending' },
                include: [
                    {
                        model: ProjectModel,
                        as: 'project',
                        attributes: [],
                        where: {
                            organisation_id: orgId
                        },
                        required: true
                    }
                ]
            });

            if (pendingBeneficiaries.length > 0) {
                alerts.push({
                    type: 'pending',
                    title: 'Pending Beneficiaries',
                    message: `${pendingBeneficiaries.length} beneficiar${pendingBeneficiaries.length !== 1 ? 'ies' : 'y'} awaiting validation`,
                    count: pendingBeneficiaries.length,
                    items: pendingBeneficiaries
                });
            }

            // ===================================================================
            // 2. Pending Deliveries (awaiting review)
            // ===================================================================
            const pendingDeliveries = await DeliveryModel.findAll({
                where: { review_status: 'pending' },
                include: [
                    {
                        model: ProjectModel,
                        as: 'project',
                        attributes: [],
                        where: {
                            organisation_id: orgId
                        },
                        required: true
                    }
                ]
            });

            if (pendingDeliveries.length > 0) {
                alerts.push({
                    type: 'pending',
                    title: 'Pending Deliveries',
                    message: `${pendingDeliveries.length} deliver${pendingDeliveries.length !== 1 ? 'ies' : 'y'} awaiting validation`,
                    count: pendingDeliveries.length,
                    item: pendingDeliveries
                });
            }

            // ===================================================================
            // 3. Projects nearing deadline (less than 7 days left)
            // ===================================================================
            const today = new Date();
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(today.getDate() + 7);

            const projectsNearDeadline = await ProjectModel.findAll({
                where: {
                    organisation_id: orgId,
                    status: { [Op.in]: ['ongoing', 'overdue'] },
                    end_date: {
                        [Op.lte]: sevenDaysFromNow,
                        [Op.gte]: today
                    }
                },
                attributes: ['id', 'name', 'end_date'],
                raw: true
            });

            if (projectsNearDeadline.length > 0) {
                alerts.push({
                    type: 'warning',
                    title: 'Projects Nearing Deadline',
                    message: `${projectsNearDeadline.length} project${projectsNearDeadline.length !== 1 ? 's' : ''} ending within 7 days`,
                    count: projectsNearDeadline.length,
                    items: projectsNearDeadline.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        endDate: p.end_date,
                        daysLeft: Math.ceil((new Date(p.end_date).getTime() - today.getTime()) / (1000 * 3600 * 24))
                    }))
                });
            }

            // ===================================================================
            // 4. Inactive Enumerators (no activity in 4 days)
            // ===================================================================
            const inactiveEnumerators = await MembershipModel.findAll({
                where: {
                    organization_id: orgId,
                    role: 'enumerator',
                    status: 'true'
                },
                include: [
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });

            const inactiveEnumeratorsList = [];

            for (const enumerator of inactiveEnumerators) {
                const enumeratorData: any = enumerator.toJSON();

                // Get last activity
                const lastBeneficiary = await BeneficiaryModel.findOne({
                    where: { created_by_membership_id: enumeratorData.id },
                    order: [['created_at', 'DESC']],
                    attributes: ['created_at'],
                    raw: true
                });

                const lastDelivery = await DeliveryModel.findOne({
                    where: { created_by_membership_id: enumeratorData.id },
                    order: [['created_at', 'DESC']],
                    attributes: ['created_at'],
                    raw: true
                });

                const lastActivity = [
                    lastBeneficiary?.created_at,
                    lastDelivery?.created_at,
                    enumeratorData.date_of
                ]
                    .filter(Boolean)
                    .map(d => new Date(d as string))
                    .sort((a, b) => b.getTime() - a.getTime())[0];

                if (lastActivity && lastActivity < fourDaysAgo) {
                    inactiveEnumeratorsList.push({
                        id: enumeratorData.id,
                        name: enumeratorData.user?.name || 'Unknown',
                        email: enumeratorData.user?.email || '-',
                        lastActivity: lastActivity
                    });
                }
            }

            if (inactiveEnumeratorsList.length > 0) {
                alerts.push({
                    type: 'warning',
                    title: 'Inactive Enumerators',
                    message: `${inactiveEnumeratorsList.length} enumerator${inactiveEnumeratorsList.length !== 1 ? 's' : ''} with no activity in 4+ days`,
                    count: inactiveEnumeratorsList.length,
                    items: inactiveEnumeratorsList
                });
            }

            return res.status(200).json({
                type: 'success',
                alerts,
                summary: {
                    totalAlerts: alerts.length,
                    warnings: alerts.filter(a => a.type === 'warning').length,
                    pending: alerts.filter(a => a.type === 'pending').length
                }
            });

        } catch (error) {
            console.error("adminAlerts error:", error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },


    // ========================================
    // COLLABORATOR DASHBOARD METHODS
    // ========================================

    collaboratorKeyMetrics: async (req: Request, res: Response) => {
        console.log("Backend collaboratorKeyMetrics --> entrance");

        try {
            const authUser = req.user;
            const membershipId = authUser?.membershipId;

            if (!membershipId) {
                return res.status(401).json({
                    type: 'error',
                    message: 'unauthorized',
                });
            }

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
                    data: {
                        assignedProjects: 0,
                        familiesInProjects: 0,
                        pendingBeneficiaries: 0,
                        pendingDeliveries: 0
                    }
                });
            }

            // 1. Assigned Projects (ongoing/overdue only)
            const assignedProjects = await ProjectModel.count({
                where: {
                    organisation_id: authUser.organizationId,
                    id: { [Op.in]: projectIds },
                    status: { [Op.in]: ['ongoing', 'overdue'] }
                }
            });

            // 2. Families in My Projects (approved only)
            const familiesInProjects = await BeneficiaryModel.count({
                where: {
                    project_id: { [Op.in]: projectIds },
                    review_status: 'approved'
                }
            });

            // 3. Pending Beneficiary Validations
            const pendingBeneficiaries = await BeneficiaryModel.count({
                where: {
                    project_id: { [Op.in]: projectIds },
                    review_status: 'pending'
                }
            });

            // 4. Pending Delivery Validations
            const pendingDeliveries = await DeliveryModel.count({
                where: {
                    project_id: { [Op.in]: projectIds },
                    review_status: 'pending'
                }
            });

            res.status(200).json({
                type: 'success',
                data: {
                    assignedProjects,
                    familiesInProjects,
                    pendingBeneficiaries,
                    pendingDeliveries
                }
            });

        } catch (error) {
            console.error("Dashboard: collaboratorKeyMetrics error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    collaboratorEnumeratorActivity: async (req: Request, res: Response) => {
        console.log("Backend collaboratorEnumeratorActivity --> entrance");

        try {
            const authUser = req.user;
            const membershipId = authUser?.membershipId;

            if (!membershipId) {
                return res.status(401).json({
                    type: 'error',
                    message: 'unauthorized',
                });
            }

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
                    data: []
                });
            }

            // Get all enumerators in these projects
            const enumeratorsInProjects = await ProjectMemberModel.findAll({
                where: {
                    project_id: { [Op.in]: projectIds },
                    role_in_project: 'enumerator'
                },
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
            });

            // Get unique enumerators
            const uniqueEnumerators = new Map();
            enumeratorsInProjects.forEach((pm: any) => {
                const data = pm.toJSON();
                const membershipId = data.membership_id;
                if (!uniqueEnumerators.has(membershipId)) {
                    uniqueEnumerators.set(membershipId, data.membership);
                }
            });

            // Calculate activity for each enumerator
            const enumeratorActivity = await Promise.all(
                Array.from(uniqueEnumerators.values()).map(async (enumerator: any) => {
                    // Count families registered (approved only)
                    const familiesRegistered = await BeneficiaryModel.count({
                        where: {
                            created_by_membership_id: enumerator.id,
                            project_id: { [Op.in]: projectIds },
                            review_status: 'approved'
                        }
                    });

                    // Count deliveries logged (approved only)
                    const deliveriesLogged = await DeliveryModel.count({
                        where: {
                            created_by_membership_id: enumerator.id,
                            project_id: { [Op.in]: projectIds },
                            review_status: 'approved'
                        }
                    });

                    // Get last sync date (most recent beneficiary or delivery)
                    const lastBeneficiary = await BeneficiaryModel.findOne({
                        where: {
                            created_by_membership_id: enumerator.id,
                            project_id: { [Op.in]: projectIds }
                        },
                        order: [['created_at', 'DESC']],
                        attributes: ['created_at'],
                        raw: true
                    });

                    const lastDelivery = await DeliveryModel.findOne({
                        where: {
                            created_by_membership_id: enumerator.id,
                            project_id: { [Op.in]: projectIds }
                        },
                        order: [['created_at', 'DESC']],
                        attributes: ['created_at'],
                        raw: true
                    });

                    const lastSyncDate = [
                        lastBeneficiary?.created_at,
                        lastDelivery?.created_at
                    ]
                        .filter(Boolean)
                        .map(d => new Date(d as any))
                        .sort((a, b) => b.getTime() - a.getTime())[0];

                    return {
                        id: enumerator.id,
                        name: enumerator.user?.name || 'Unknown',
                        email: enumerator.user?.email || '-',
                        familiesRegistered,
                        deliveriesLogged,
                        lastSyncDate: lastSyncDate || null
                    };
                })
            );

            // Sort by last sync date (most recent first)
            enumeratorActivity.sort((a, b) => {
                if (!a.lastSyncDate) return 1;
                if (!b.lastSyncDate) return -1;
                return new Date(b.lastSyncDate).getTime() - new Date(a.lastSyncDate).getTime();
            });

            res.status(200).json({
                type: 'success',
                data: enumeratorActivity
            });

        } catch (error) {
            console.error("Dashboard: collaboratorEnumeratorActivity error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    collaboratorValidationQueue: async (req: Request, res: Response) => {
        console.log("Backend collaboratorValidationQueue --> entrance");

        try {
            const authUser = req.user;
            const membershipId = authUser?.membershipId;

            if (!membershipId) {
                return res.status(401).json({
                    type: 'error',
                    message: 'unauthorized',
                });
            }

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
                    data: {
                        pendingBeneficiaries: [],
                        pendingDeliveries: []
                    }
                });
            }

            // Pending Beneficiaries
            const pendingBeneficiaries = await BeneficiaryModel.findAll({
                where: {
                    project_id: { [Op.in]: projectIds },
                    review_status: 'pending'
                },
                order: [['created_at', 'DESC']],
                limit: 20,
                include: [
                    {
                        model: ProjectModel,
                        as: 'project',
                        attributes: ['id', 'name']
                    },
                    {
                        model: MembershipModel,
                        as: 'createdBy',
                        attributes: ['id'],
                        include: [
                            {
                                model: UserModel,
                                as: 'user',
                                attributes: ['name']
                            }
                        ]
                    }
                ]
            });

            // Pending Deliveries
            const pendingDeliveries = await DeliveryModel.findAll({
                where: {
                    project_id: { [Op.in]: projectIds },
                    review_status: 'pending'
                },
                order: [['created_at', 'DESC']],
                limit: 20,
                include: [
                    {
                        model: ProjectModel,
                        as: 'project',
                        attributes: ['id', 'name']
                    },
                    {
                        model: BeneficiaryModel,
                        as: 'beneficiary',
                        attributes: ['id', 'family_code', 'head_name']
                    },
                    {
                        model: MembershipModel,
                        as: 'createdBy',
                        attributes: ['id'],
                        include: [
                            {
                                model: UserModel,
                                as: 'user',
                                attributes: ['name']
                            }
                        ]
                    }
                ]
            });

            res.status(200).json({
                type: 'success',
                data: {
                    pendingBeneficiaries: pendingBeneficiaries.map(b => b.toJSON()),
                    pendingDeliveries: pendingDeliveries.map(d => d.toJSON())
                }
            });

        } catch (error) {
            console.error("Dashboard: collaboratorValidationQueue error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    }
};

export default DashboardController;