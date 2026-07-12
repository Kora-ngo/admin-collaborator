import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sequelize from '../../config/database.js';
import { generateUniqueUid } from '../../shared/utils/generateUniqueUid.js';
import { UserRepository, MembershipRepository, OrganisationRepository, SubscriptionRepository } from './auth.repository.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signToken = (payload: object) =>
    jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '30d' });

export const AuthService = {

    // ============================================================
    // Login
    // ============================================================

    login: async (email: string, password: string) => {
        if (!email || !password) return { validationError: 'missing_credentials' };
        if (!EMAIL_REGEX.test(email)) return { validationError: 'invalid_email_format' };

        const userExistData = await UserRepository.findByEmail(email);
        const userExist = userExistData?.dataValues;
        if (!userExist) return { notFound: 'user_not_found' };

        const isPasswordValid = await bcrypt.compare(password, userExist.password);
        if (!isPasswordValid) return { unauthorized: 'invalid_credentials' };

        if (userExist.status === 'blocked' || userExist.status === 'false') {
            return { forbidden: userExist.status === 'blocked' ? 'user_blocked' : 'user_inactive' };
        }

        const membershipsData = await MembershipRepository.findOneByUserId(userExist.id);
        const memberships = membershipsData?.dataValues;

        if (memberships?.role === 'enumerator') return { notFound: 'user_not_found' };

        const organisationData = await OrganisationRepository.findByPk(memberships?.organization_id);
        const organisation = organisationData?.dataValues;

        if (!organisation) return { notFound: 'no_organization_membership' };
        if (organisation.status === 'blocked') return { orgBlocked: true };

        const subscriptionData = await SubscriptionRepository.findMostRecentByOrg(memberships?.organization_id);
        const subscription = subscriptionData?.dataValues;

        if (!subscription) return { forbidden: 'no_active_subscription' };

        const expiresAt = subscription.ends_at;

        const token = signToken({
            userId: userExist.id,
            userUid: userExist.uid,
            email: userExist.email || email,
            organizationId: memberships?.organization_id,
            membershipId: memberships?.id,
            role: memberships?.role,
            subscriptionExpiresAt: expiresAt,
        });

        return {
            success: true,
            token,
            auditContext: { userId: userExist.id, name: userExist.name, email: userExist.email, role: memberships?.role },
        };
    },


    // ============================================================
    // Register admin
    // ============================================================

    registerAdmin: async (users: any, organisation: any) => {
        if (!users || !organisation) return { validationError: 'missing_user_or_organisation_data' };
        if (!users.name || !users.email || !users.password) return { validationError: 'missing_users_credentials' };
        if (!organisation.name || !organisation.email) return { validationError: 'missing_organisation_fields' };

        const transaction = await sequelize.transaction();

        try {
            const existingUser = await UserRepository.findByEmail(users.email.toLowerCase().trim());
            if (existingUser) {
                await transaction.rollback();
                return { conflict: 'email_already_in_use' };
            }

            const existingOrgEmail = await OrganisationRepository.findByEmail(organisation.email.toLowerCase().trim());
            if (existingOrgEmail) {
                await transaction.rollback();
                return { conflict: 'organisation_email_already_in_use' };
            }

            const hashedPassword = await bcrypt.hash(users.password, 10);
            const userUid = await generateUniqueUid('users');

            const newUser = await UserRepository.create({
                uid: userUid,
                name: users.name,
                email: users.email,
                phone: users.phone || null,
                password: hashedPassword,
                status: 'true',
            }, transaction);

            const orgUid = await generateUniqueUid('organisation');
            const newOrganisation = await OrganisationRepository.create({
                uid: orgUid,
                name: organisation.name,
                description: organisation.description || null,
                country: organisation.country || null,
                region: organisation.region || null,
                email: organisation.email,
                created_by: newUser.id,
                phone: organisation.phone || null,
                status: 'true',
            }, transaction);

            const newMembership = await MembershipRepository.create({
                user_id: newUser.id,
                organization_id: newOrganisation.id,
                role: 'admin',
                status: 'true',
            }, transaction);

            const membershipId = newMembership.id;

            const plan = 'free';
            const trialDays = 30;
            const startedAt = new Date();
            const endsAt = new Date();
            endsAt.setDate(endsAt.getDate() + trialDays);

            await SubscriptionRepository.create({
                uid: Date.now() + 2,
                organization_id: newOrganisation.id,
                plan,
                started_at: startedAt,
                ends_at: endsAt,
                status: 'true',
            }, transaction);

            const token = signToken({
                userId: newUser.id,
                userUid: newUser.uid,
                email: newUser.email,
                organizationId: newOrganisation.id,
                membershipId,
                role: 'admin',
                subscriptionExpiresAt: endsAt.toISOString(),
            });

            await transaction.commit();

            return { success: true, token };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },


    // ============================================================
    // Accept invitation
    // ============================================================

    acceptInvitation: async (token: string) => {
        if (!token) return { validationError: 'token_required' };

        const transaction = await sequelize.transaction();

        // NOTE: JWT verification errors (JsonWebTokenError / TokenExpiredError) propagate up
        // and are caught by the controller, same as the original try/catch boundary.
        const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
            userId: number;
            organisationId: number;
            role: 'admin' | 'collaborator' | 'enumerator';
            exp: number;
        };

        const user = await UserRepository.findByPk(payload.userId);
        if (!user) return { notFound: true };

        if (user.status === 'blocked' || user.status === 'false') {
            return { forbidden: user.status === 'blocked' ? 'user_blocked' : 'user_inactive' };
        }

        if (user.status === 'true') return { alreadyActive: true };

        await MembershipRepository.create({
            user_id: payload.userId,
            organization_id: payload.organisationId,
            role: payload.role,
            status: 'true',
        }, transaction);

        return {
            success: true,
            data: { organizationId: payload.organisationId, role: payload.role },
        };
    },


    // ============================================================
    // Get current user
    // ============================================================

    getCurrentUser: async (authUser: { userId: number; membershipId: any; organizationId: any }) => {
        const userModel = await UserRepository.findByPk(authUser.userId);
        const user = userModel?.dataValues;

        if (!user || user.status !== 'true') return { forbidden: 'user_inactive_or_not_found' };

        const membershipData = await MembershipRepository.findByPk(authUser.membershipId);
        const membership = membershipData?.dataValues;

        if (!membership || membership.status !== 'true') return { forbidden: 'invalid_or_inactive_membership' };

        const organisationData = await OrganisationRepository.findByPk(authUser.organizationId);
        const organisation = organisationData?.dataValues;

        if (!organisation) return { forbidden: 'organization_not_found' };
        if (organisation.status === 'blocked') return { orgBlocked: true };

        const subscriptionData = await SubscriptionRepository.findMostRecentActiveByOrg(organisation.id);
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

        return {
            success: true,
            data: {
                user: {
                    id: user.id,
                    uid: user.uid,
                    name: user.name,
                    email: user.email,
                    phone: user.phone || null,
                },
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
            },
        };
    },


    // ============================================================
    // Select membership
    // ============================================================

    selectMembership: async (membershipId: any, userId: any, uid: any, email: any) => {
        if (!membershipId) return { validationError: 'membership_id_required' };

        const membershipData = await MembershipRepository.findOneByIdAndUser(membershipId, userId);
        const membership = membershipData?.dataValues;

        if (!membership) return { notFound: 'membership_not_found_or_not_owned' };
        if (membership.status === 'pending') return { forbidden: 'membership_pending' };
        if (membership.status === 'blocked' || membership.status === 'false') return { forbidden: 'membership_inactive' };

        const organizationId = membership.organization_id;
        const role = membership.role;

        const subscriptionData = await SubscriptionRepository.findMostRecentActiveByOrg(organizationId);
        const subscription = subscriptionData?.dataValues;

        if (!subscription) return { forbidden: 'no_active_subscription_for_organization' };

        const expiresAt = subscription.ends_at;

        const token = signToken({
            userId,
            userUid: uid,
            email,
            organizationId,
            membershipId: membership.id,
            role,
            subscriptionExpiresAt: expiresAt,
        });

        return {
            success: true,
            token,
            membership: { organizationId, membershipId: membership.id, role, subscriptionExpiresAt: expiresAt },
        };
    },


    // ============================================================
    // Forgot password
    // ============================================================

    forgotPassword: async (email: string, newPassword: string, confirmPassword: string) => {
        if (!email || !newPassword || !confirmPassword) return { validationError: 'missing_credentials' };
        if (!EMAIL_REGEX.test(email.trim())) return { validationError: 'invalid_email_format' };
        if (newPassword !== confirmPassword) return { validationError: 'passwords_not_match' };
        if (newPassword.length < 5) return { validationError: 'password_too_short' };

        const transaction = await sequelize.transaction();

        const userExistData = await UserRepository.findByEmail(email);
        const userExist = userExistData?.dataValues;
        if (!userExist) return { notFound: 'user_not_found' };

        const isSamePassword = await bcrypt.compare(newPassword, userExist.password);
        if (isSamePassword) return { validationError: 'same_as_old_password' };

        if (userExist.status === 'blocked' || userExist.status === 'false') {
            return { forbidden: userExist.status === 'blocked' ? 'user_blocked' : 'user_inactive' };
        }

        const membershipsData = await MembershipRepository.findOneByUserId(userExist.id);
        const memberships = membershipsData?.dataValues;

        if (memberships?.role === 'enumerator') return { notFound: 'user_not_found' };

        const subscriptionData = await SubscriptionRepository.findMostRecentByOrg(memberships?.organization_id);
        const subscription = subscriptionData?.dataValues;

        if (!subscription) return { forbidden: 'no_active_subscription' };

        const updates: any = { password: await bcrypt.hash(newPassword, 10) };
        await UserRepository.update(userExist.id, updates, transaction);

        return {
            success: true,
            data: updates,
            auditContext: { userId: userExist.id, name: userExist.name, email: userExist.email, role: memberships?.role },
        };
    },


    // ============================================================
    // Update profile
    // ============================================================

    updateProfile: async (authUserId: number, body: { name?: string; phone?: string; email?: string; password?: string; currentPassword?: string }) => {
        const { name, phone, email, password, currentPassword } = body;

        if (!name && !phone && !email && !password) return { validationError: 'no_fields_to_update' };

        const transaction = await sequelize.transaction();

        try {
            const userData = await UserRepository.findByPk(authUserId);
            const user = userData?.dataValues;

            if (!user) {
                await transaction.rollback();
                return { notFound: true };
            }

            if (user.status !== 'true') {
                await transaction.rollback();
                return { forbidden: 'user_inactive' };
            }

            if ((email && email !== user.email) || password) {
                if (!currentPassword) {
                    await transaction.rollback();
                    return { validationError: 'current_password_required' };
                }

                const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
                if (!isCurrentPasswordValid) {
                    await transaction.rollback();
                    return { unauthorized: 'invalid_current_password' };
                }
            }

            if (email && email !== user.email) {
                if (!EMAIL_REGEX.test(email)) {
                    await transaction.rollback();
                    return { validationError: 'invalid_email_format' };
                }

                const emailTaken = await UserRepository.findByEmail(email.toLowerCase().trim());
                if (emailTaken) {
                    await transaction.rollback();
                    return { conflict: 'email_already_in_use' };
                }
            }

            const updates: any = {};
            if (name) updates.name = name.trim();
            if (phone !== undefined) updates.phone = phone?.trim() || null;
            if (email) updates.email = email.toLowerCase().trim();
            if (password) updates.password = await bcrypt.hash(password, 10);

            await UserRepository.update(authUserId, updates, transaction);

            const updatedUserData = await UserRepository.findByPk(authUserId, { attributes: ['id', 'uid', 'name', 'email', 'phone'] });
            const updatedUser = updatedUserData?.dataValues;

            await transaction.commit();

            return { success: true, data: updatedUser };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },


    // ============================================================
    // Update organisation
    // ============================================================

    updateOrganisation: async (organizationId: any, body: { name?: string; description?: string; email?: string; phone?: string; country?: string; region?: string }) => {
        const { name, description, email, phone, country, region } = body;

        if (!name && !description && !email && !phone && !country && !region) {
            return { validationError: 'no_fields_to_update' };
        }

        const transaction = await sequelize.transaction();

        try {
            const orgData = await OrganisationRepository.findByPk(organizationId);
            const organisation = orgData?.dataValues;

            if (!organisation) {
                await transaction.rollback();
                return { notFound: true };
            }

            if (email && email !== organisation.email) {
                if (!EMAIL_REGEX.test(email)) {
                    await transaction.rollback();
                    return { validationError: 'invalid_email_format' };
                }

                const emailTaken = await OrganisationRepository.findByEmail(email.toLowerCase().trim());
                if (emailTaken) {
                    await transaction.rollback();
                    return { conflict: 'organisation_email_already_in_use' };
                }
            }

            const updates: any = {};
            if (name) updates.name = name.trim();
            if (description !== undefined) updates.description = description?.trim() || null;
            if (email) updates.email = email.toLowerCase().trim();
            if (phone !== undefined) updates.phone = phone?.trim() || null;
            if (country !== undefined) updates.country = country?.trim() || null;
            if (region !== undefined) updates.region = region?.trim() || null;

            await OrganisationRepository.update(organizationId, updates, transaction);

            const updatedOrgData = await OrganisationRepository.findByPk(organizationId);
            const updatedOrg = updatedOrgData?.dataValues;

            await transaction.commit();

            return { success: true, data: updatedOrg };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};