import type { Request, Response } from "express";
import UserModel from "../models/User.js";
import MembershipModel from "../models/Membership.js";
import OrganisationModel from "../models/Organisation.js";
import SubscriptionModel from "../models/Subscription.js";
import { Op } from "sequelize";
import { AssistanceModel, AssistanceTypeModel, BeneficiaryMemberModel, BeneficiaryModel, DeliveryItemModel, DeliveryModel, Media, MediaLink, ProjectAssistanceModel, ProjectMemberModel, ProjectModel, SyncBatchModel } from "../models/index.js";
import { bulkUpdateProjectStatuses } from "../helpers/projectStatus.js";
import sequelize from "../config/database.js";
import { generateUniqueUid } from "../utils/generateUniqueUid.js";

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

    syncData: async (req: Request, res: Response) => {
        const authUser = req.user;

        console.log("Hello synch --> ", authUser);
        const transaction = await sequelize.transaction();

        try {
            // STEP 1: VALIDATE USER
            if (!authUser || !authUser.userId || !authUser.membershipId) {
                await transaction.rollback();
                return res.status(401).json({
                    type: 'error',
                    message: 'unauthorized'
                });
            }

            // Check user status
            const userModel = await UserModel.findByPk(authUser.userId);
            const user = userModel?.dataValues;
            if (!user || user.status !== 'true') {
                await transaction.rollback();
                return res.status(403).json({
                    type: 'error',
                    message: 'user_inactive_or_not_found'
                });
            }

            // Check membership status
            const membershipModel = await MembershipModel.findByPk(authUser.membershipId);
            const membership = membershipModel?.dataValues;
            if (!membership || membership.status !== 'true') {
                await transaction.rollback();
                return res.status(403).json({
                    type: 'error',
                    message: 'invalid_or_inactive_membership'
                });
            }


            // Verify role is enumerator
            if (membership.role !== 'enumerator') {
                await transaction.rollback();
                return res.status(403).json({
                    type: 'error',
                    message: 'enumerator_role_required'
                });
            }


            // STEP 2: VALIDATE REQUEST BODY
            const { batch_uid, project_id, beneficiaries, deliveries } = req.body;

            if (!batch_uid || !project_id) {
                await transaction.rollback();
                return res.status(400).json({
                    type: 'error',
                    message: 'batch_uid_and_project_id_required'
                });
            }

            // Check if both arrays are empty
            if ((!beneficiaries || beneficiaries.length === 0) && 
                (!deliveries || deliveries.length === 0)) {
                await transaction.rollback();
                return res.status(400).json({
                    type: 'error',
                    message: 'no_data_to_sync'
                });
            }



            // STEP 3: VALIDATE PROJECT
            const projectModel = await ProjectModel.findByPk(project_id);
            const project =  projectModel?.dataValues;

            if (!project) {
                await transaction.rollback();
                return res.status(404).json({
                    type: 'error',
                    message: 'project_not_found'
                });
            }
            
            // Only accept ongoing projects
            if (!['ongoing', 'overdue'].includes(project.status)) {
                await transaction.rollback();
                return res.status(400).json({
                    type: 'error',
                    message: 'project_not_ongoing',
                    details: `Project status is '${project.status}'. Only 'ongoing' projects accept sync data.`
                });
            }

            // Verify enumerator is assigned to this project
            const projectMemberModel = await ProjectMemberModel.findOne({
                where: {
                    project_id: project_id,
                    membership_id: authUser.membershipId,
                    role_in_project: 'enumerator'
                }
            });

            const projectMember = projectMemberModel?.dataValues;

            if (!projectMember) {
                await transaction.rollback();
                return res.status(403).json({
                    type: 'error',
                    message: 'not_assigned_to_project'
                });
            }



            // STEP 4: CREATE SYNC BATCH

            const syncBatchUid = await generateUniqueUid('sync_batches');
            const syncBatch = await SyncBatchModel.create({
                uid: syncBatchUid,
                project_id: project_id,
                submitted_by_membership_id: authUser.membershipId,
                submitted_at: new Date(),
                status: 'pending'
            }, { transaction });

            console.log(`✓ Created sync batch: ${batch_uid} (Server ID: ${syncBatch.id})`);


            // STEP 5: PROCESS BENEFICIARIES

            const beneficiaryResults: any[] = [];

            if (beneficiaries && beneficiaries.length > 0) {
                console.log(`Processing ${beneficiaries.length} beneficiaries...`);

                for(const benef of beneficiaries){
                       try{
                            // Validate required fields
                            if (!benef.uid || !benef.family_code || !benef.head_name) {
                                beneficiaryResults.push({
                                    uid: benef.uid || 'unknown',
                                    status: 'rejected',
                                    error: 'missing_required_fields'
                                });
                                continue;
                            }


                            // Check for duplicate family_code in this project
                            const existingBeneficiaryModel = await BeneficiaryModel.findOne({
                                where: {
                                    project_id: project_id,
                                    family_code: benef.family_code,
                                    review_status: { [Op.ne]: 'rejected' }
                                }
                            });

                            const existingBeneficiary = existingBeneficiaryModel?.dataValues;

                            if (existingBeneficiary) {
                                beneficiaryResults.push({
                                    uid: benef.uid,
                                    status: 'rejected',
                                    error: 'duplicate_family_code'
                                });
                                continue;
                            }

                            // Generate server UID
                            const beneficiaryUid = await generateUniqueUid('beneficiaries');



                            // Create beneficiary
                            const newBeneficiary = await BeneficiaryModel.create({
                                uid: beneficiaryUid,
                                project_id: project_id,
                                family_code: benef.family_code,
                                head_name: benef.head_name,
                                phone: benef.phone || null,
                                region: benef.region || null,
                                village: benef.village || null,
                                created_by_membership_id: authUser.membershipId,
                                sync_source: 'mobile',
                                review_status: 'pending'
                            }, { transaction });


                            // Create beneficiary members if provided
                            if (benef.members && benef.members.length > 0) {
                                const membersData = benef.members.map((member: any) => ({
                                    beneficiary_id: newBeneficiary.id,
                                    full_name: member.full_name,
                                    gender: member.gender,
                                    date_of_birth: member.date_of_birth,
                                    relationship: member.relationship
                                }));

                                await BeneficiaryMemberModel.bulkCreate(membersData, { transaction });
                            }


                            beneficiaryResults.push({
                                uid: benef.uid,
                                server_id: newBeneficiary.id,
                                status: 'pending'
                            });

                            console.log(`✓ Beneficiary ${benef.uid} → Server ID: ${newBeneficiary.id}`);

                       } catch (error: any) {
                        console.error(`Error processing beneficiary ${benef.uid}:`, error);
                        beneficiaryResults.push({
                            uid: benef.uid,
                            status: 'rejected',
                            error: 'server_error'
                        });
                    }

                }

            }


            // STEP 6: PROCESS DELIVERIES

            const deliveryResults: any[] = [];

             if (deliveries && deliveries.length > 0) {
                console.log(`Processing ${deliveries.length} deliveries...`);

                for (const deliv of deliveries) {
                    try{

                         // Validate required fields
                        if (!deliv.uid || !deliv.beneficiary_id || !deliv.delivery_date) {
                            deliveryResults.push({
                                uid: deliv.uid || 'unknown',
                                status: 'rejected',
                                error: 'missing_required_fields'
                            });
                            continue;
                        }
                        
                        // Validate items exist
                        if (!deliv.items || deliv.items.length === 0) {
                            deliveryResults.push({
                                uid: deliv.uid,
                                status: 'rejected',
                                error: 'no_delivery_items'
                            });
                            continue;
                        }


                        // Verify beneficiary exists and is approved
                        const beneficiaryModel = await BeneficiaryModel.findOne({
                            where: {
                                id: deliv.beneficiary_id,
                                project_id: project_id,
                                review_status: 'approved'
                            }
                        });

                        const beneficiary = beneficiaryModel?.dataValues;


                        if (!beneficiary) {
                            deliveryResults.push({
                                uid: deliv.uid,
                                status: 'rejected',
                                error: 'beneficiary_not_found_or_not_approved'
                            });
                            continue;
                        }


                         // Validate all assistance items exist in project
                        const assistanceIds = deliv.items.map((item: any) => item.assistance_id);
                        const validAssistances = await AssistanceModel.findAll({
                            where: {
                                id: { [Op.in]: assistanceIds },
                                status: 'true'
                            }
                        });
                        
                        if (validAssistances.length !== assistanceIds.length) {
                            deliveryResults.push({
                                uid: deliv.uid,
                                status: 'rejected',
                                error: 'invalid_assistance_items'
                            });
                            continue;
                        }


                        // Generate server UID
                        const deliveryUid = await generateUniqueUid('deliveries');


                        // Create delivery
                        const newDelivery = await DeliveryModel.create({
                            uid: deliveryUid,
                            project_id: project_id,
                            beneficiary_id: deliv.beneficiary_id,
                            delivery_date: deliv.delivery_date,
                            notes: deliv.notes || null,
                            created_by_membership_id: authUser.membershipId,
                            sync_source: 'mobile',
                            review_status: 'pending'
                        }, { transaction });



                        // Create delivery items
                        const itemsData = deliv.items.map((item: any) => ({
                            delivery_id: newDelivery.id,
                            assistance_id: item.assistance_id,
                            quantity: item.quantity
                        }));


                        await DeliveryItemModel.bulkCreate(itemsData, { transaction });

                        deliveryResults.push({
                            uid: deliv.uid,
                            server_id: newDelivery.id,
                            status: 'pending'
                        });

                        console.log(`✓ Delivery ${deliv.uid} → Server ID: ${newDelivery.id}`);


                    }catch (error: any) {
                        console.error(`Error processing delivery ${deliv.uid}:`, error);
                        deliveryResults.push({
                            uid: deliv.uid,
                            status: 'rejected',
                            error: 'server_error'
                        });
                    }
                }

             }


             // STEP 7: DETERMINE OVERALL STATUS

            const totalBeneficiaries = beneficiaries?.length || 0;
            const totalDeliveries = deliveries?.length || 0;
            const totalRecords = totalBeneficiaries + totalDeliveries;

            const successBeneficiaries = beneficiaryResults.filter(r => r.status === 'pending').length;
            const successDeliveries = deliveryResults.filter(r => r.status === 'pending').length;
            const totalSuccess = successBeneficiaries + successDeliveries;


            let overallStatus: 'success' | 'partial_success' | 'failed';


            if (totalSuccess === totalRecords) {
                overallStatus = 'success';
            } else if (totalSuccess > 0) {
                overallStatus = 'partial_success';
            } else {
                overallStatus = 'failed';
            }


            // Commit transaction
            await transaction.commit();
            console.log("✅ Transaction committed successfully");

            // STEP 8: RETURN RESPONSE


            return res.status(200).json({
                type: 'success',
                data: {
                    batch_uid: batch_uid,
                server_batch_id: syncBatch.id,
                status: overallStatus,
                summary: {
                    total_records: totalRecords,
                    successful: totalSuccess,
                    rejected: totalRecords - totalSuccess,
                    beneficiaries: {
                        total: totalBeneficiaries,
                        successful: successBeneficiaries,
                        rejected: totalBeneficiaries - successBeneficiaries
                    },
                    deliveries: {
                        total: totalDeliveries,
                        successful: successDeliveries,
                        rejected: totalDeliveries - successDeliveries
                    }
                },
                results: {
                    beneficiaries: beneficiaryResults,
                    deliveries: deliveryResults
                }
                }
            });


        } catch(error: any) {
            await transaction.rollback();
            console.error("Sync Data error:", error);
            return res.status(500).json({
                type: 'error',
                message: 'server_error',
                details: error.message
            });
        }
    }
};


export default EnumeratorController;