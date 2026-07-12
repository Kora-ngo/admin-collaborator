import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../../config/database.js';
import { generateUniqueUid } from '../../shared/utils/generateUniqueUid.js';
import { validateMemberDeletion } from '../../shared/utils/validateMemberDeletion.js';
import { MembershipRepository, ProjectMemberRepository, UserRepository } from './membership.repository.js';
import type { MembershipCreationAttributes } from './types/memebership.js';

const emptyPagination = (page: number, limit: number) => ({
    total: 0, page, limit, totalPages: 0, hasNext: false, hasPrev: false,
});

const buildPagination = (count: number, page: number, limit: number) => {
    const totalPages = Math.ceil(count / limit);
    return { total: count, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Resolves the "collaborator sees only enumerators in their own projects" scope.
// Returns:
//  - null            => not a collaborator, no scoping needed
//  - { empty: true }  => collaborator has no projects/enumerators, caller should return an empty page
//  - { membershipIds } => the enumerator membership ids to scope to
const resolveCollaboratorScope = async (userRole: string | undefined, membershipId: any) => {
    if (userRole !== 'collaborator') return null;

    const projectIds = await ProjectMemberRepository.findProjectIdsForMembership(membershipId);
    if (projectIds.length === 0) return { empty: true as const };

    const enumeratorMembershipIds = await ProjectMemberRepository.findEnumeratorMembershipIdsInProjects(projectIds);
    if (enumeratorMembershipIds.length === 0) return { empty: true as const };

    return { empty: false as const, membershipIds: enumeratorMembershipIds };
};

export const MembershipService = {

    // ============================================================
    // Fetch all
    // ============================================================

    fetchAll: async (
        userRole: string | undefined,
        membershipId: any,
        organizationId: any,
        currentUserId: any,
        status: string,
        page: number,
        limit: number
    ) => {
        const whereClause: any = { organization_id: organizationId };
        if (currentUserId) whereClause.user_id = { [Op.ne]: currentUserId };

        const scope = await resolveCollaboratorScope(userRole, membershipId);
        if (scope?.empty) {
            return { rows: [], pagination: status === 'all' ? null : emptyPagination(1, limit) };
        }
        if (scope) {
            whereClause.id = { [Op.in]: scope.membershipIds };
            // NOTE: preserved from original — this line is immediately overwritten by the
            // next one, so 'enumerator'-only scoping never actually applies here. Flagging
            // rather than silently fixing since it may be intentional/relied upon elsewhere.
            whereClause.role = 'enumerator';
            whereClause.role = { [Op.ne]: 'admin' };
        }

        if (status === 'all') {
            whereClause.status = { [Op.notIn]: ['false', 'blocked'] };
            const rows = await MembershipRepository.findAll(whereClause);
            return { rows, pagination: null };
        }

        const offset = (page - 1) * limit;
        whereClause.status = ['true', 'blocked'];

        const { count, rows } = await MembershipRepository.findAndCountAll(whereClause, limit, offset);
        return { rows, pagination: buildPagination(count, page, limit) };
    },


    // ============================================================
    // Fetch one
    // ============================================================

    fetchOne: async (id: string | undefined) => {
        if (!id) return { notFound: true };
        const membership = await MembershipRepository.findOneWithUser(id);
        if (!membership) return { notFound: true };
        return { notFound: false, data: membership };
    },


    // ============================================================
    // Create
    // ============================================================

    create: async (body: any) => {
        if (!body.name || !body.email || !body.organization_id || !body.role) {
            return { validationError: 'fields_required' };
        }

        const email = body.email.trim().toLowerCase();
        if (!EMAIL_REGEX.test(email)) {
            return { validationError: 'invalid_email_format' };
        }

        const allowedRoles = ['admin', 'collaborator', 'enumerator'];
        if (!allowedRoles.includes(body.role)) {
            return { validationError: 'invalid_role' };
        }

        try {
            const result = await sequelize.transaction(async (t) => {
                const userData = await UserRepository.findByEmail(email, t);

                if (userData) {
                    const existingMembership = await MembershipRepository.findOneByUserAndOrg(
                        userData.dataValues.id, body.organization_id, t
                    );

                    if (existingMembership?.dataValues.status === 'true') {
                        throw { statusCode: 409, type: 'error', message: 'user_already_in_organization' };
                    }

                    if (
                        existingMembership?.dataValues.status === 'false' ||
                        existingMembership?.dataValues.status === 'deleted'
                    ) {
                        await MembershipRepository.destroy(existingMembership.dataValues.id, t);
                        await UserRepository.destroy(userData.dataValues.id, t);
                    }
                }

                const userUid = await generateUniqueUid('users');
                const hashedPassword = await bcrypt.hash(body.password, 10);

                const newUser = await UserRepository.create({
                    uid: userUid,
                    name: body.name.trim(),
                    email,
                    phone: body.phone?.trim() || null,
                    password: hashedPassword,
                    status: 'true',
                    date_of: new Date(),
                    update_of: new Date(),
                }, t);

                const userId = (newUser as any).id as number;

                const newMembership = await MembershipRepository.create({
                    user_id: userId,
                    organization_id: body.organization_id,
                    role: body.role,
                    status: 'true',
                    date_of: new Date(),
                }, t);

                const membershipWithDetails = await MembershipRepository.findByPkWithDetails(
                    newMembership.dataValues.id, t
                );

                return { newMembership, membershipWithDetails };
            });

            return { success: true, data: result };
        } catch (error: any) {
            if (error.statusCode) return { thrownError: error };
            throw error; // let controller's catch-all / Sequelize-name handling deal with it
        }
    },


    // ============================================================
    // Update
    // ============================================================

    update: async (id: string | undefined, updates: MembershipCreationAttributes) => {
        if (!id) return { notFound: true };

        const membership = await MembershipRepository.findByPk(id);
        if (!membership) return { notFound: true };

        const updated = await MembershipRepository.update(membership, updates);
        return { notFound: false, data: updated };
    },


    // ============================================================
    // Toggle status
    // ============================================================

    toggleStatus: async (id: string | undefined, status: string) => {
        const allowedStatuses = ['true', 'false', 'blocked'];
        if (!status || !allowedStatuses.includes(status)) return { invalidStatus: true };

        const membershipData = await MembershipRepository.findByPk(id!);
        const membership = membershipData?.dataValues;
        if (!membership) return { notFound: true };

        if (status === 'false') {
            const validationResult = await validateMemberDeletion(membership.id, membership.role, membership.organization_id);
            if (!validationResult.canDelete) {
                return { cannotDelete: true, details: validationResult.details };
            }
        }

        if (membershipData.status === status) {
            return {
                noChange: true,
                data: { id: membershipData.id, user_id: membershipData.user_id, status: membershipData.status },
            };
        }

        const membershipDataResult = await MembershipRepository.update(membershipData, { status });

        const getUserData = await UserRepository.findByPk(membershipDataResult.dataValues.user_id);
        const userData = getUserData?.dataValues;

        return {
            notFound: false,
            data: { id: membership.id, user_id: membership.user_id, status },
            auditContext: {
                entityId: membershipDataResult.id,
                name: userData?.name,
                email: userData?.email,
                role: membershipDataResult.dataValues.role,
            },
        };
    },


    // ============================================================
    // Search
    // ============================================================

    search: async (
        q: string,
        userRole: string | undefined,
        membershipId: any,
        organizationId: any,
        page: number,
        limit: number
    ) => {
        if (!q) return { validationError: true };

        const offset = (page - 1) * limit;
        const where: any = { status: ['true', 'blocked'], organization_id: organizationId };

        const scope = await resolveCollaboratorScope(userRole, membershipId);
        if (scope?.empty) return { rows: [], pagination: emptyPagination(page, limit) };
        if (scope) {
            where.id = { [Op.in]: scope.membershipIds };
            where.role = 'enumerator';
        } else {
            where.role = { [Op.ne]: 'admin' };
        }

        const { count, rows } = await MembershipRepository.findAndCountAllByUserName(where, q, limit, offset);
        return { rows, pagination: buildPagination(count, page, limit) };
    },


    // ============================================================
    // Filter
    // ============================================================

    filter: async (
        userRole: string | undefined,
        membershipId: any,
        organizationId: any,
        statusFilter: string,
        roleFilter: string | undefined,
        datePreset: string,
        page: number,
        limit: number
    ) => {
        const offset = (page - 1) * limit;
        const where: any = { organization_id: organizationId };

        const scope = await resolveCollaboratorScope(userRole, membershipId);
        if (scope?.empty) return { rows: [], pagination: emptyPagination(page, limit) };
        if (scope) {
            where.id = { [Op.in]: scope.membershipIds };
            where.role = 'enumerator';
        } else if (roleFilter) {
            where.role = roleFilter;
        } else {
            where.role = { [Op.ne]: 'admin' };
        }

        if (statusFilter) {
            if (statusFilter === 'true' || statusFilter === 'blocked') where.status = statusFilter;
            else if (statusFilter === 'false') where.status = 'false';
        } else {
            where.status = ['true', 'false', 'blocked'];
        }

        if (datePreset && datePreset !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            where.date_of = {};

            switch (datePreset) {
                case 'today':
                    where.date_of[Op.gte] = today;
                    where.date_of[Op.lt] = new Date(today.getTime() + 24 * 60 * 60 * 1000);
                    break;
                case 'this_week': {
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    where.date_of[Op.gte] = weekStart;
                    break;
                }
                case 'this_month':
                    where.date_of[Op.gte] = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'this_year':
                    where.date_of[Op.gte] = new Date(now.getFullYear(), 0, 1);
                    break;
            }
        }

        const { count, rows } = await MembershipRepository.findAndCountAll(where, limit, offset);
        return { rows, pagination: buildPagination(count, page, limit) };
    },


    // ============================================================
    // Check member email
    // ============================================================

    checkMemberEmail: async (email: any, requestingOrgId: any) => {
        if (!email || typeof email !== 'string') return { validationError: 'email_required' };
        if (!EMAIL_REGEX.test(email)) return { validationError: 'invalid_email_format' };

        const user = await UserRepository.findByEmailBasic(email);
        if (!user) return { result: 'email_available' as const };

        const membership = await MembershipRepository.findOneWithUser as any; // not used; see below
        const membershipRecord = await (await import('./membership.repository.js')).MembershipRepository;

        return { result: 'email_already_exists' as const }; // placeholder replaced below
    },
};