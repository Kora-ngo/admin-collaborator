import bcrypt from "bcryptjs";
import { EnumeratorAuthRepository, EnumeratorRepository, SyncProjectRepository } from "./enumerator.repository.js";
import jwt from 'jsonwebtoken';
import { logAudit } from "../../shared/utils/auditLogger.js";
import { bulkUpdateProjectStatuses } from "../../shared/helpers/projectStatus.js";
import sequelize from "../../config/database.js";
import { generateUniqueUid } from "../../shared/utils/generateUniqueUid.js";
import { processBeneficiarySync } from "./sync/beneficiary-sync.service.js";
import { processDeliverySync } from "./sync/delivery-sync.service.js";

export const EnumeratorService = {

    // ============================================================
    // Login
    // ============================================================

    login: async (email: string, password: string, req: any) => {
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !password) return { error: 'missing_credentials' };
        if (!emailRegex.test(email)) return { error: 'invalid_email_format' }; 

        const userData = await EnumeratorAuthRepository.findUserByEmail(email);
        const user = userData?.dataValues;
        if (!user) return { error: 'user_not_found' };     
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return { error: 'invalid_credentials', status: 401 };   
        
        if (user.status === 'blocked' || user.status === 'false') {
            return { error: user.status === 'blocked' ? 'user_blocked' : 'user_inactive', status: 403 };
        }

        const membershipData = await EnumeratorAuthRepository.findMembershipByUserId(user.id);
        const membership = membershipData?.dataValues;
        
        // Mobile app is enumerator-only
        if (membership?.role === 'collaborator' || membership?.role === 'admin') {
            return { error: 'user_not_found' };
        }

        const subscriptionData = await EnumeratorAuthRepository.findActiveSubscription(membership?.organization_id!);
        const subscription = subscriptionData?.dataValues;
        if (!subscription) return { error: 'no_active_subscription', status: 403 };


        const token = jwt.sign(
            {
                userId: user.id,
                userUid: user.uid,
                email: user.email || email,
                organizationId: membership?.organization_id,
                membershipId: membership?.id,
                role: membership?.role,
                subscriptionExpiresAt: subscription.ends_at,
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '30d' }
        );

        try {
            await logAudit({
                req,
                action: 'Logged In',
                entityType: 'auth',
                platform: 'mobile',
                entityId: user.id,
                metadata: { name: user.name, email: user.email, role: membership?.role },
            });
        } catch (auditError) {
            console.warn('Audit log failed (non-critical):', auditError);
        }

        return { error: null, token };
    },


    // ============================================================
    // Get mobile user data (user + membership + org + subscription + projects)
    // ============================================================

    getMobileUserData: async (authUser: any) => {
        
        const userData = await EnumeratorRepository.findUserByPk(authUser.userId);
        const user = userData?.dataValues;
        if (!user || user.status !== 'true') return { error: 'user_inactive_or_not_found', status: 403 };

        const membershipData = await EnumeratorRepository.findMembershipByPk(authUser.membershipId);
        const membership = membershipData?.dataValues;
        if (!membership) return { error: 'user_inactive_or_not_found', status: 403 };
        if (membership.status === 'blocked') return { error: 'invalid_or_inactive_membership', status: 403 };
        if (membership.status === 'false') return { error: 'user_inactive_or_not_found', status: 403 };
        if (membership.status !== 'true') return { error: 'unauthorized', status: 403 }
        
        const organisationData = await EnumeratorRepository.findOrganisationByPk(authUser.organizationId);
        const organisation = organisationData?.dataValues;
        if (!organisation) return { error: 'organization_not_found', status: 403 };

        const subscriptionData = await EnumeratorRepository.findActiveSubscription(organisation.id);
        const subscriptionValues = subscriptionData?.dataValues;
        if (!subscriptionValues) return { error: 'no_active_subscription', status: 403 };   
        
        const subscription = {
            plan: subscriptionValues.plan || 'free',
            status: 'true',
            expiresAt: subscriptionValues.ends_at,
            isActive: new Date(subscriptionValues.ends_at!) > new Date(),
        };

        const projects = await EnumeratorRepository.findAffiliatedProjects(membership.id);
        await bulkUpdateProjectStatuses(projects);


        const projectsData = await Promise.all(projects.map(async (p: any) => {
            const data: any = p.dataValues || p;

            const allCollaborators = await EnumeratorRepository.findCollaboratorsForProject(data.id);

            // Only the logged-in user's own membership if they're an enumerator,
            // plus every collaborator on the project (so the app can show who to contact).
            const filteredMembers = (data.members || [])
                .map((m: any) => m.dataValues || m)
                .filter((m: any) => m.membership_id === membership.id);

            const collaboratorMembers = allCollaborators.map((c: any) => c.dataValues || c);

            const uniqueMembers = [...filteredMembers, ...collaboratorMembers].filter(
                (member, index, self) => index === self.findIndex((m) => m.membership_id === member.membership_id)
            );

            return {
                ...data,
                members: uniqueMembers,
                assistances: data.assistances?.map((a: any) => a.dataValues || a) || [],
                mediaLinks: data.mediaLinks?.map((ml: any) => ml.dataValues || ml) || [],
                regions: data.regions?.map((r: any) => r.dataValues || r) || [], // new
                beneficiaries: data.beneficiaries?.map((b: any) => b.dataValues || b) || [],
                deliveries: data.deliveries?.map((d: any) => d.dataValues || d) || [],
            };
        }));

         return {
            error: null,
            data: {
                user: { id: user.id, uid: user.uid, name: user.name, email: user.email, phone: user.phone || null },
                role: membership.role,
                membership: { id: membership.id, role: membership.role },
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
                projects: projectsData,
                projectsCount: projectsData.length,
            },
        };
    },


    // ============================================================
    // Sync data (orchestrator only — per-record logic lives in sync/*)
    // ==========================================================

    syncData: async (authUser: any, body: any, req: any) => {
        const transaction = await sequelize.transaction();

        try{
            const userData = await EnumeratorRepository.findUserByPk(authUser.userId);
            const user = userData?.dataValues;
            if (!user || user.status !== 'true') {
                await transaction.rollback();
                return { error: 'user_inactive_or_not_found', status: 403 };
            }

            const membershipData = await EnumeratorRepository.findMembershipByPk(authUser.membershipId);
            const membership = membershipData?.dataValues;
            if (!membership || membership.status !== 'true') {
                await transaction.rollback();
                return { error: 'invalid_or_inactive_membership', status: 403 };
            }
            if (membership.role !== 'enumerator') {
                await transaction.rollback();
                return { error: 'enumerator_role_required', status: 403 };
            }

            const subscriptionData = await EnumeratorRepository.findActiveSubscription(authUser.organizationId);
            if (!subscriptionData) {
                await transaction.rollback();
                return { error: 'no_active_subscription', status: 403 };
            }

            const { batch_uid, project_id, beneficiaries, deliveries } = body;

            if (!batch_uid || !project_id) {
                await transaction.rollback();
                return { error: 'batch_uid_and_project_id_required', status: 400 };
            }

            if (!beneficiaries?.length && !deliveries?.length) {
                await transaction.rollback();
                return { error: 'no_data_to_sync', status: 400 };
            }


            const projectData = await SyncProjectRepository.findByPk(project_id);
            const project = projectData?.dataValues;
            if (!project) {
                await transaction.rollback();
                return { error: 'project_not_found', status: 404 };
            }

            if (!['ongoing', 'overdue'].includes(project.status)) {
                await transaction.rollback();
                return {
                    error: 'project_not_ongoing', status: 400,
                    details: `Project status is '${project.status}'. Only 'ongoing' projects accept sync data.`,
                };
            }

            const assignment = await SyncProjectRepository.findEnumeratorAssignment(project_id, authUser.membershipId);
            if (!assignment) {
                await transaction.rollback();
                return { error: 'not_assigned_to_project', status: 403 };
            }

            const syncBatchUid = await generateUniqueUid('sync_batches');
            const syncBatch = await SyncProjectRepository.createSyncBatch({
                uid: syncBatchUid,
                project_id,
                submitted_by_membership_id: authUser.membershipId,
                submitted_at: new Date(),
                status: 'pending',
            }, transaction);


            // ------------------------------------------------------
            // Per-record processing — each call is an isolated,
            // independently-testable unit (see sync/*.service.ts).
            // This loop is the future event-dispatch boundary:
            // swap the direct call for `queue.publish('beneficiary.sync.requested', ...)`
            // and have a worker call the same processBeneficiarySync function.
            // ------------------------------------------------------

            const syncContext = { projectId: project_id, membershipId: authUser.membershipId, transaction, req }

            const beneficiaryResults = [];
            for (const benef of beneficiaries || []) {
                beneficiaryResults.push(await processBeneficiarySync(benef, syncContext));
            }

            const deliveryResults = [];
            for (const deliv of deliveries || []) {
                deliveryResults.push(await processDeliverySync(deliv, syncContext));
            }


            const totalBeneficiaries = beneficiaries?.length || 0;
            const totalDeliveries = deliveries?.length || 0;
            const totalRecords = totalBeneficiaries + totalDeliveries;

            const successBeneficiaries = beneficiaryResults.filter(r => r.status === 'pending').length;
            const successDeliveries = deliveryResults.filter(r => r.status === 'pending').length;
            const totalSuccess = successBeneficiaries + successDeliveries;

            const overallStatus =
                totalSuccess === totalRecords ? 'success' :
                totalSuccess > 0 ? 'partial_success' : 'failed';

            await transaction.commit();

            return {
                error: null,
                data: {
                    batch_uid,
                    server_batch_id: syncBatch.id,
                    status: overallStatus,
                    summary: {
                        total_records: totalRecords,
                        successful: totalSuccess,
                        rejected: totalRecords - totalSuccess,
                        beneficiaries: { total: totalBeneficiaries, successful: successBeneficiaries, rejected: totalBeneficiaries - successBeneficiaries },
                        deliveries: { total: totalDeliveries, successful: successDeliveries, rejected: totalDeliveries - successDeliveries },
                    },
                    results: { beneficiaries: beneficiaryResults, deliveries: deliveryResults },
                },
            };

            } catch (error) {
                await transaction.rollback();
                throw error;
        }
    }
}