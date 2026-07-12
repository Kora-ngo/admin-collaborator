import { Op } from 'sequelize';
import sequelize from '../../config/database.js';
import { base64ToBuffer } from '../../shared/utils/base64ToBuffer.js';
import MediaController from '../media/media.controller.js';
import { bulkUpdateProjectStatuses, updateProjectStatusInDB } from '../../shared/helpers/projectStatus.js';
import { getProjectEditMetadata } from '../../shared/helpers/getProjectEditMetadata.js';
import { ProjectRepository, ProjectMemberRepository, ProjectAssistanceRepository, ProjectDeletionRepository } from './project.repository.js';

const buildPagination = (count: number, page: number, limit: number) => {
    const totalPages = Math.ceil(count / limit);
    return { total: count, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
};

const processBase64Files = (files: any[]) =>
    files.map((fileData: any) => {
        const { buffer, mimetype, size } = base64ToBuffer(fileData.base64);
        return { buffer, mimetype, originalname: fileData.name, size };
    });

const buildDateFilter = (datePreset: string) => {
    if (!datePreset || datePreset === 'all') return undefined;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const filter: any = {};

    switch (datePreset) {
        case 'today':
            filter[Op.gte] = today;
            filter[Op.lt] = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            break;
        case 'this_week': {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            filter[Op.gte] = weekStart;
            break;
        }
        case 'this_month':
            filter[Op.gte] = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'this_year':
            filter[Op.gte] = new Date(now.getFullYear(), 0, 1);
            break;
    }
    return filter;
};

export const ProjectService = {

    // ============================================================
    // Create
    // ============================================================

    create: async (body: any, membershipId: any) => {
        if (!body.name || !body.organisation_id || !body.start_date || !body.end_date || !body.selectedMembers?.length) {
            return { validationError: 'fields_required' };
        }

        const selectedMembers = typeof body.selectedMembers === 'string' ? JSON.parse(body.selectedMembers) : body.selectedMembers;
        const selectedAssistances = typeof body.selectedAssistances === 'string' ? JSON.parse(body.selectedAssistances) : body.selectedAssistances;

        if (!selectedMembers?.length) {
            return { validationError: 'members_required' };
        }

        const existingProject = await ProjectRepository.findOneByNameInOrg(body.name, body.organisation_id);
        if (existingProject) {
            return { conflict: true };
        }

        const transaction = await sequelize.transaction();

        try {
            const newProject = await ProjectRepository.create({
                organisation_id: body.organisation_id,
                created_by: membershipId!,
                name: body.name,
                description: body.description || '',
                status: 'pending',
                start_date: body.start_date,
                end_date: body.end_date,
                target_families: body.target_families,
            }, transaction);

            if (selectedMembers?.length > 0) {
                const membersData = selectedMembers.map((m: any) => ({
                    project_id: newProject.id,
                    membership_id: m.membership_id,
                    role_in_project: m.role_in_project,
                }));
                await ProjectMemberRepository.bulkCreate(membersData, transaction);
            }

            if (selectedAssistances?.length > 0) {
                const assistancesData = selectedAssistances.map((a: any) => ({
                    project_id: newProject.id,
                    assistance_id: a.assistance_id,
                }));
                await ProjectAssistanceRepository.bulkCreate(assistancesData, transaction);
            }

            let uploadedFiles: any[] = [];
            if (body.files && body.files.length > 0) {
                const processedFiles = processBase64Files(body.files);
                uploadedFiles = await MediaController.uploadAndLinkFiles(
                    processedFiles as any[], 'project', newProject.id, 'document',
                    body.organisation_id, membershipId || 0, transaction
                );
            }

            await transaction.commit();

            return { success: true, data: { project: newProject, uploadedFiles } };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },


    // ============================================================
    // Fetch all
    // ============================================================

    fetchAll: async (userRole: string, membershipId: any, organisationId: any, page: number, limit: number) => {
        const offset = (page - 1) * limit;
        const whereClause: any = { status: { [Op.ne]: 'false' }, organisation_id: organisationId };

        let collaboratorScope: { projectIds?: any[] } | undefined;
        if (userRole === 'collaborator') {
            const projectIds = await ProjectMemberRepository.findProjectIdsForMembership(membershipId);
            collaboratorScope = { projectIds };
        }

        const { count, rows } = await ProjectRepository.findAndCountAllFull(whereClause, collaboratorScope, limit, offset);

        await bulkUpdateProjectStatuses(rows);

        const projectsData = rows.map(p => {
            const data: any = p.dataValues || p;
            return {
                ...data,
                members: data.members?.map((m: any) => m.dataValues || m) || [],
                assistances: data.assistances?.map((a: any) => a.dataValues || a) || [],
                beneficiaries: data.beneficiaries?.map((b: any) => b.dataValues || b) || [],
                deliveries: data.deliveries?.map((d: any) => d.dataValues || d) || [],
                mediaLinks: data.mediaLinks?.map((ml: any) => ml.dataValues || ml) || [],
            };
        });

        return { rows: projectsData, pagination: buildPagination(count, page, limit) };
    },


    // ============================================================
    // Fetch one
    // ============================================================

    fetchOne: async (id: string | undefined) => {
        if (!id) return { notFound: true };

        const project = await ProjectRepository.findOneDetailed(id);
        if (!project) return { notFound: true };

        await updateProjectStatusInDB(project);

        return { notFound: false, data: project.toJSON() };
    },


    // ============================================================
    // Update
    // ============================================================

    update: async (id: string | undefined, updates: any, membershipId: any) => {
        const transaction = await sequelize.transaction();

        try {
            const project = await ProjectRepository.findByPk(id!, transaction);

            if (!project?.dataValues) {
                await transaction.rollback();
                return { notFound: true };
            }

            if (updates.name === '') {
                await transaction.rollback();
                return { validationError: 'fields_required' };
            }

            await ProjectRepository.update(project, {
                name: updates.name,
                description: updates.description,
                status: updates.status,
            }, transaction);

            if (updates.selectedMembers !== undefined) {
                const metadata = await getProjectEditMetadata(Number(id));
                const currentMembers = await ProjectMemberRepository.findAllForProject(id!);
                const lockedMemberIds = metadata.lockedMembers.map((m: any) => m.membership_id);
                const lockedMembers = currentMembers.filter(m => lockedMemberIds.includes(m.membership_id));

                await ProjectMemberRepository.destroyExcluding(id!, lockedMemberIds, transaction);

                const newMembers = updates.selectedMembers.filter((m: any) => !lockedMemberIds.includes(m.membership_id));
                if (newMembers.length > 0) {
                    const membersData = newMembers.map((m: any) => ({
                        project_id: id,
                        membership_id: m.membership_id,
                        role_in_project: m.role_in_project,
                    }));
                    await ProjectMemberRepository.bulkCreate(membersData, transaction);
                }
            }

            if (updates.selectedAssistances !== undefined) {
                const metadata = await getProjectEditMetadata(Number(id));
                const lockedAssistanceIds = metadata.lockedAssistances.map((a: any) => a.assistance_id);

                await ProjectAssistanceRepository.destroyExcluding(id!, lockedAssistanceIds, transaction);

                const newAssistances = updates.selectedAssistances.filter((a: any) => !lockedAssistanceIds.includes(a.assistance_id));
                if (newAssistances.length > 0) {
                    const assistancesData = newAssistances.map((a: any) => ({
                        project_id: id,
                        assistance_id: a.assistance_id,
                    }));
                    await ProjectAssistanceRepository.bulkCreate(assistancesData, transaction);
                }
            }

            if (updates.filesToDelete && updates.filesToDelete.length > 0) {
                for (const mediaId of updates.filesToDelete) {
                    const result = await MediaController.deleteMediaById(mediaId, transaction);
                    if (!result.success) {
                        console.warn(`Failed to delete media ${mediaId}`);
                    }
                }
            }

            let uploadedFiles: any[] = [];
            if (updates.files && updates.files.length > 0) {
                const processedFiles = processBase64Files(updates.files);
                uploadedFiles = await MediaController.uploadAndLinkFiles(
                    processedFiles as any[], 'project', project.dataValues.id, 'document',
                    updates.organisation_id, membershipId || 0, transaction
                );
            }

            await transaction.commit();

            return { success: true, data: { project, uploadedFiles } };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },


    // ============================================================
    // Can delete
    // ============================================================

    canDelete: async (id: string) => {
        const beneficiaryCount = await ProjectDeletionRepository.countActiveBeneficiaries(id);
        const deliveryCount = await ProjectDeletionRepository.countActiveDeliveries(id);
        const canDelete = beneficiaryCount === 0 && deliveryCount === 0;

        return {
            canDelete,
            beneficiaryCount,
            deliveryCount,
            message: canDelete ? 'Project can be deleted' : `Cannot delete: ${beneficiaryCount} beneficiaries, ${deliveryCount} deliveries`,
        };
    },


    // ============================================================
    // Toggle status
    // ============================================================

    toggleStatus: async (id: string | undefined) => {
        const transaction = await sequelize.transaction();
        if (!id) return { notFound: true };

        const projectData = await ProjectRepository.findByPk(id, transaction);
        const project = projectData?.dataValues;
        if (!project) return { notFound: true };

        const newStatus = project.status === 'false' ? 'pending' : 'false';
        await ProjectRepository.update(projectData, { status: newStatus });

        return { notFound: false, data: { id: project.id, name: project.name, status: newStatus } };
    },


    // ============================================================
    // Search
    // ============================================================

    search: async (q: string, userRole: string, membershipId: any, organisationId: any, page: number, limit: number) => {
        if (!q) return { validationError: true };

        const offset = (page - 1) * limit;
        const where: any = {
            status: { [Op.ne]: 'false' },
            name: { [Op.like]: `%${q}%` },
            organisation_id: organisationId,
        };

        const collaboratorScope = userRole === 'collaborator' ? { membershipId } : undefined;

        const { count, rows } = await ProjectRepository.findAndCountAllSummary(where, collaboratorScope, limit, offset);

        await bulkUpdateProjectStatuses(rows);

        return { rows: rows.map(p => p.toJSON()), pagination: buildPagination(count, page, limit) };
    },


    // ============================================================
    // Filter
    // ============================================================

    filter: async (
        userRole: string,
        membershipId: any,
        organisationId: any,
        status: string,
        datePreset: string,
        page: number,
        limit: number
    ) => {
        const offset = (page - 1) * limit;
        const where: any = { organisation_id: organisationId };

        if (status) where.status = status;

        const dateFilter = buildDateFilter(datePreset);
        if (dateFilter) where.created_at = dateFilter;

        const collaboratorScope = userRole === 'collaborator' ? { membershipId } : undefined;

        const { count, rows } = await ProjectRepository.findAndCountAllSummary(where, collaboratorScope, limit, offset);

        await bulkUpdateProjectStatuses(rows);

        return { rows: rows.map(p => p.toJSON()), pagination: buildPagination(count, page, limit) };
    },
};