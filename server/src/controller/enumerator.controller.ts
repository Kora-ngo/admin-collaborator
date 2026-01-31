import type { Request, Response } from "express";
import UserModel from "../models/User.js";
import MembershipModel from "../models/Membership.js";
import OrganisationModel from "../models/Organisation.js";
import SubscriptionModel from "../models/Subscription.js";
import { Op } from "sequelize";
import { AssistanceModel, AssistanceTypeModel, Media, MediaLink, ProjectAssistanceModel, ProjectMemberModel, ProjectModel } from "../models/index.js";
import { bulkUpdateProjectStatuses } from "../helpers/projectStatus.js";

const EnumeratorController = {
    getMobileUserData: async (req: Request, res: Response) => {
    const authUser = req.user;

    console.log("Mobile - Auth User --> ", authUser);

    if (!authUser || !authUser.userId) {
        return res.status(401).json({ type: 'error', message: 'unauthorized' });
    }

    try {
        // ========================================
        // PART 1: USER DATA (Same as getCurrentUser)
        // ========================================

        // 1. Fetch user (exclude password)
        const userModel = await UserModel.findByPk(authUser.userId);
        const user = userModel?.dataValues;

        console.log("Mobile - User found --> ", user);

        if (!user || user.status !== 'true') {
            return res.status(403).json({
                type: 'error',
                message: 'user_inactive_or_not_found',
            });
        }

        // 2. Fetch membership
        const membershipData = await MembershipModel.findByPk(authUser.membershipId);
        const membership = membershipData?.dataValues;

        if (!membership || membership.status !== 'true') {
            return res.status(403).json({
                type: 'error',
                message: 'invalid_or_inactive_membership',
            });
        }

        // 3. Fetch organisation
        const organisationData = await OrganisationModel.findByPk(authUser.organizationId);
        const organisation = organisationData?.dataValues;

        if (!organisation) {
            return res.status(403).json({
                type: 'error',
                message: 'organization_not_found',
            });
        }

        // 4. Fetch subscription
        const subscriptionData = await SubscriptionModel.findOne({
            where: {
                organization_id: organisation.id,
                status: 'true',
            },
            order: [['ends_at', 'DESC']],
        });

        const subscriptionValues = subscriptionData?.dataValues;

        const isSubscriptionActive = subscriptionValues
            ? new Date(subscriptionValues.ends_at!) > new Date()
            : false;

        const subscription = {
            plan: subscriptionValues?.plan || 'free',
            status: subscriptionValues ? 'true' : 'expired',
            expiresAt: subscriptionValues?.ends_at || null,
            isActive: isSubscriptionActive,
        };

        // ========================================
        // PART 2: PROJECTS DATA (Affiliated only)
        // ========================================

        const userRole = membership.role;
        const membershipId = membership.id;

        console.log("Mobile - Fetching projects for role:", userRole);

        // Build where clause
        const whereClause: any = { 
            status: { [Op.ne]: 'false' } 
        };

        // Build include - only fetch projects user is affiliated with
        const includeArray: any[] = [
            {
                model: ProjectMemberModel,
                as: 'members',
                // ALWAYS filter by membership (even for admin in mobile app)
                where: { 
                    membership_id: membershipId 
                },
                required: true, // INNER JOIN - only projects where user is a member
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
                model: MediaLink,
                as: 'mediaLinks',
                include: [
                    {
                        model: Media,
                        as: 'media',
                        attributes: ['id', 'file_name', 'file_type', 'storage_path', 'size', 'created_at']
                    }
                ]
            }
        ];

        // Fetch projects WITHOUT pagination
        const projects = await ProjectModel.findAll({
            where: whereClause,
            order: [['created_at', 'DESC']],
            include: includeArray,
        });

        // Update project statuses
        await bulkUpdateProjectStatuses(projects);

        // Process projects - filter members to show only logged-in user + collaborators
        const projectsData = await Promise.all(projects.map(async (p) => {
            const data: any = p.dataValues || p;
            
            // Get ALL collaborators for this project
            const allCollaborators = await ProjectMemberModel.findAll({
                where: {
                    project_id: data.id,
                    role_in_project: 'collaborator'
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

            // Filter members: 
            // - ALL collaborators in this project
            // - Only the logged-in user if they're an enumerator
            const filteredMembers = (data.members || [])
                .map((m: any) => m.dataValues || m)
                .filter((m: any) => 
                    m.membership_id === membershipId // Current user (enumerator)
                );

            // Add all collaborators
            const collaboratorMembers = allCollaborators.map((c: any) => c.dataValues || c);

            // Combine and remove duplicates
            const allMembers = [...filteredMembers, ...collaboratorMembers];
            const uniqueMembers = allMembers.filter((member, index, self) =>
                index === self.findIndex((m) => m.membership_id === member.membership_id)
            );

            return {
                ...data,
                members: uniqueMembers,
                assistances: data.assistances?.map((a: any) => a.dataValues || a) || [],
                mediaLinks: data.mediaLinks?.map((ml: any) => ml.dataValues || ml) || []
            };
        }));

        console.log(`Mobile - Found ${projectsData.length} projects for user`);

        // ========================================
        // FINAL RESPONSE
        // ========================================

        return res.status(200).json({
            type: 'success',
            data: {
                 user: {
                id: user.id,
                uid: user.uid,
                name: user.name,
                email: user.email,
                phone: user.phone || null,
            },
            role: membership.role,
            membership: {
                id: membership.id,
                role: membership.role,
            },
            organisation: {
                id: organisation.id,
                uid: organisation.uid,
                name: organisation.name,
                email: organisation.email,
                created_by: organisation.created_by,
                status: organisation.status,
                phone: organisation.phone || null,
                country: organisation.country || null,
                region: organisation.region || null,
            },
            subscription,
            projects: projectsData, // Array of affiliated projects
            projectsCount: projectsData.length
            }
        });

    } catch (error) {
        console.error('Mobile - Get user data error:', error);
        return res.status(500).json({ type: 'error', message: 'server_error' });
    }
},
};


export default EnumeratorController;