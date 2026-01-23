import {} from 'express';
import UserModel from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import SubscriptionModel from '../models/Subscription.js';
import { generateUniqueUid } from '../utils/generateUniqueUid.js';
import OrganisationModel from '../models/Organisation.js';
import sequelize from '../config/database.js';
import MembershipModel from '../models/Membership.js';
import User from '../models/User.js';
const AuthController = {
    // Login handler
    login: async (req, res) => {
        const { email, password } = req.body;
        console.log("Email --> ", email);
        console.log("Password --> ", password);
        try {
            // Validate input
            if (!email || !password) {
                return res.status(400).json({ type: 'error', message: "missing_credentials" });
            }
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ type: 'error', message: "invalid_email_format" });
            }
            // Check if the user exists
            const userExistData = await UserModel.findOne({ where: { email } });
            const userExist = userExistData?.dataValues;
            if (!userExist) {
                return res.status(404).json({ type: 'error', message: "user_not_found" });
            }
            // Check if the password is correct
            const isPasswordValid = await bcrypt.compare(password, userExist.password);
            if (!isPasswordValid) {
                return res.status(401).json({ type: 'error', message: "invalid_credentials" });
            }
            // check if the user is active
            if (userExist?.status === 'blocked' || userExist?.status === 'false') {
                return res.status(403).json({ type: 'error', message: userExist?.status === 'blocked' ? "user_blocked" : "user_inactive" });
            }
            // Fetch One memberships
            const membershipsData = await MembershipModel.findOne({
                where: { user_id: userExist.id },
            });
            const memberships = membershipsData?.dataValues;
            // Fetch active subscription
            const subscriptionData = await SubscriptionModel.findOne({
                where: {
                    organization_id: memberships?.organization_id,
                    status: 'true'
                },
                order: [['ends_at', 'DESC']],
            });
            const subscription = subscriptionData?.dataValues;
            if (!subscription) {
                return res.status(403).json({ type: 'error', message: "no_active_subscription" });
            }
            const expiresAt = subscription.ends_at;
            const token = jwt.sign({
                userId: userExist.id,
                userUid: userExist.uid,
                email: userExist.email || email,
                organizationId: memberships?.organization_id,
                membershipId: memberships?.id,
                role: memberships?.role,
                subscriptionExpiresAt: expiresAt
            }, process.env.JWT_SECRET, { expiresIn: '30d' });
            return res.status(200).json({
                type: 'success',
                token,
            });
        }
        catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
    // Register admin handler
    registerAdmin: async (req, res) => {
        const { users, organisation } = req.body;
        // console.log("Subscription --> ", subscription);
        if (!users || !organisation) {
            return res.status(400).json({ type: 'error', message: 'missing_user_or_organisation_data' });
        }
        // validate using the picked feilds
        if (!users.name || !users.email || !users.password) {
            return res.status(400).json({ type: 'error', message: 'missing_users_credentials' });
        }
        if (!organisation.name || !organisation.email) {
            return res.status(400).json({ type: 'error', message: 'missing_organisation_fields' });
        }
        const transaction = await sequelize.transaction();
        try {
            // Check if user with this email already exists ===
            const existingUser = await UserModel.findOne({
                where: { email: users.email.toLowerCase().trim() }, // Normalize email
            });
            if (existingUser) {
                await transaction.rollback();
                return res.status(409).json({
                    type: 'error',
                    message: 'email_already_in_use',
                });
            }
            // Check if organisation email is already used ===
            const existingOrgEmail = await OrganisationModel.findOne({
                where: { email: organisation.email.toLowerCase().trim() },
            });
            if (existingOrgEmail) {
                await transaction.rollback();
                return res.status(409).json({
                    type: 'error',
                    message: 'organisation_email_already_in_use',
                });
            }
            // Create user
            const hashedPassword = await bcrypt.hash(users.password, 10);
            const userUid = await generateUniqueUid('users');
            const newUser = await UserModel.create({
                uid: userUid,
                name: users.name,
                email: users.email,
                phone: users.phone || null,
                password: hashedPassword,
                status: 'true',
            }, { transaction });
            // Create Organisation
            const orgUid = await generateUniqueUid('organisation');
            const newOrganisation = await OrganisationModel.create({
                uid: orgUid,
                name: organisation.name,
                description: organisation.description || null,
                country: organisation.country || null,
                region: organisation.region || null,
                email: organisation.email,
                created_by: newUser.id,
                phone: organisation.phone || null,
                status: 'true',
            }, { transaction });
            // Membership
            const newMembership = await MembershipModel.create({
                user_id: newUser.id,
                organization_id: newOrganisation.id,
                role: 'admin',
                status: 'true',
            }, { transaction });
            // This is the created membership ID
            const membershipId = newMembership.id;
            // Subscription
            const plan = 'free';
            const trialDays = 30;
            const startedAt = new Date();
            const endsAt = new Date();
            endsAt.setDate(endsAt.getDate() + trialDays);
            await SubscriptionModel.create({
                uid: Date.now() + 2,
                organization_id: newOrganisation.id,
                plan,
                started_at: startedAt,
                ends_at: endsAt,
                status: 'true',
            }, { transaction });
            // JWT 
            const token = jwt.sign({
                userId: newUser.id,
                userUid: newUser.uid,
                email: newUser.email,
                organisationId: newOrganisation.id,
                membershipId: membershipId,
                role: 'admin',
                subscriptionExpiresAt: endsAt.toISOString(),
            }, process.env.JWT_SECRET, { expiresIn: '30d' });
            await transaction.commit();
            res.status(201).json({
                type: 'success',
                message: 'admin_registered_successfully',
                token,
            });
        }
        catch (error) {
            if (transaction)
                await transaction.rollback();
            console.error('Register error:', error);
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({
                    type: 'error',
                    message: 'email_or_uid_already_exists',
                });
            }
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
    // Additional handlers
    acceptInvitation: async (req, res) => {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ type: 'error', message: 'token_required' });
        }
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            const user = await UserModel.findByPk(payload.userId);
            if (!user) {
                return res.status(404).json({ type: 'error', message: 'user_not_found' });
            }
            if (user.status === 'blocked' || user.status === 'false') {
                return res.status(403).json({ type: 'error', message: user.status === 'blocked' ? "user_blocked" : "user_inactive" });
            }
            if (user.status === "true") {
                return res.status(400).json({ type: 'error', message: 'user_already_active' });
            }
            await MembershipModel.create({
                user_id: payload.userId,
                organization_id: payload.organisationId,
                role: payload.role,
                status: 'true',
            });
            return res.status(200).json({ type: 'success', message: 'invitation_accepted', data: {
                    organizationId: payload.organisationId,
                    role: payload.role,
                } });
        }
        catch (error) {
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ type: 'error', message: 'invalid_or_expired_token' });
            }
            console.error('Accept invitation error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
    getCurrentUser: async (req, res) => {
        const authUser = req.user;
        console.log("Auth User --> ", authUser);
        if (!authUser || !authUser.userId) {
            return res.status(401).json({ type: 'error', message: 'unauthorized' });
        }
        console.log("Authriszed User");
        try {
            console.log("Trying to find user");
            // 1. Fetch user (exclude password)
            const userModel = await UserModel.findByPk(authUser.userId);
            const user = userModel?.dataValues;
            console.log("User find --> ", user);
            if (!user || user.status !== 'true') {
                return res.status(403).json({
                    type: 'error',
                    message: 'user_inactive_or_not_found',
                });
            }
            // 2. Fetch the single membership (using the one from JWT)
            const membershipData = await MembershipModel.findByPk(authUser.membershipId);
            const membership = membershipData?.dataValues;
            console.log("membershipData");
            if (!membership || membership.status !== 'true') {
                return res.status(403).json({
                    type: 'error',
                    message: 'invalid_or_inactive_membership',
                });
            }
            const organisationData = await OrganisationModel.findByPk(authUser.organizationId);
            const organisation = organisationData?.dataValues;
            if (!organisation) {
                return res.status(403).json({
                    type: 'error',
                    message: 'organization_not_found',
                });
            }
            // 3. Fetch active subscription for this organization
            const subscriptionData = await SubscriptionModel.findOne({
                where: {
                    organization_id: organisation.id,
                    status: 'true',
                },
                order: [['ends_at', 'DESC']],
            });
            const subscriptionValues = subscriptionData?.dataValues;
            const isSubscriptionActive = subscriptionValues
                ? new Date(subscriptionValues.ends_at) > new Date()
                : false;
            const subscription = {
                plan: subscriptionValues?.plan || 'free',
                status: subscriptionValues ? 'true' : 'expired',
                expiresAt: subscriptionValues?.ends_at || null,
                isActive: isSubscriptionActive,
            };
            // 4. Final clean response — all objects, no arrays
            return res.status(200).json({
                type: 'success',
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
            });
        }
        catch (error) {
            console.error('Get current user error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
    // Select membership handler
    selectMembership: async (req, res) => {
        const { membershipId, userId, uid, email } = req.body;
        const authUser = req.user;
        if (!membershipId) {
            return res.status(400).json({ type: 'error', message: 'membership_id_required' });
        }
        try {
            const membershipData = await MembershipModel.findOne({
                where: {
                    id: membershipId,
                    user_id: userId, // Ensure it belongs to the logged-in user
                },
            });
            const membership = membershipData?.dataValues;
            if (!membership) {
                return res.status(404).json({ type: 'error', message: 'membership_not_found_or_not_owned' });
            }
            if (membership.status === 'pending') {
                return res.status(403).json({ type: 'error', message: 'membership_pending' });
            }
            if (membership.status === 'blocked' || membership.status === 'false') {
                return res.status(403).json({ type: 'error', message: 'membership_inactive' });
            }
            const organizationId = membership.organization_id;
            const role = membership.role;
            // Fetch active subscription for this organization
            const subscriptionData = await SubscriptionModel.findOne({
                where: {
                    organization_id: organizationId,
                    status: 'true'
                },
                order: [['ends_at', 'DESC']],
            });
            const subscription = subscriptionData?.dataValues;
            if (!subscription) {
                return res.status(403).json({ type: 'error', message: 'no_active_subscription_for_organization' });
            }
            const expiresAt = subscription.ends_at;
            const token = jwt.sign({
                userId: userId,
                userUid: uid,
                email: email,
                organizationId,
                membershipId: membership.id,
                role,
                subscriptionExpiresAt: expiresAt
            }, process.env.JWT_SECRET, { expiresIn: '30d' });
            return res.status(200).json({
                type: 'success',
                message: 'organization_selected_successfully',
                token,
                membership: {
                    organizationId,
                    membershipId: membership.id,
                    role,
                    subscriptionExpiresAt: expiresAt,
                }
            });
        }
        catch (error) {
            console.error('Select organization error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
    // Invite user handler
    inviteUser: async (req, res) => {
        res.status(200).json({ message: 'Invitation sent successfully' });
    },
    forgotPassword: async (req, res) => {
        res.status(200).json({ message: 'Password reset email sent' });
    },
    resetPassword: async (req, res) => {
        res.status(200).json({ message: 'Password reset successfully' });
    },
    // Add this method to your AuthController
    updateProfile: async (req, res) => {
        const authUser = req.user;
        if (!authUser || !authUser.userId) {
            return res.status(401).json({ type: 'error', message: 'unauthorized' });
        }
        const { name, phone, email, password, currentPassword } = req.body;
        // At least one field must be provided
        if (!name && !phone && !email && !password) {
            return res.status(400).json({
                type: 'error',
                message: 'no_fields_to_update',
            });
        }
        const transaction = await sequelize.transaction();
        try {
            // Fetch current user
            const userData = await UserModel.findByPk(authUser.userId);
            const user = userData?.dataValues;
            if (!user) {
                await transaction.rollback();
                return res.status(404).json({
                    type: 'error',
                    message: 'user_not_found',
                });
            }
            if (user.status !== 'true') {
                await transaction.rollback();
                return res.status(403).json({
                    type: 'error',
                    message: 'user_inactive',
                });
            }
            // If changing email or password → require current password
            if ((email && email !== user.email) || password) {
                if (!currentPassword) {
                    await transaction.rollback();
                    return res.status(400).json({
                        type: 'error',
                        message: 'current_password_required',
                    });
                }
                const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
                if (!isCurrentPasswordValid) {
                    await transaction.rollback();
                    return res.status(401).json({
                        type: 'error',
                        message: 'invalid_current_password',
                    });
                }
            }
            // Validate new email if provided
            if (email && email !== user.email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    await transaction.rollback();
                    return res.status(400).json({
                        type: 'error',
                        message: 'invalid_email_format',
                    });
                }
                // Check if new email is already taken
                const emailTaken = await UserModel.findOne({
                    where: { email: email.toLowerCase().trim() },
                });
                if (emailTaken) {
                    await transaction.rollback();
                    return res.status(409).json({
                        type: 'error',
                        message: 'email_already_in_use',
                    });
                }
            }
            // Prepare update data
            const updates = {};
            if (name)
                updates.name = name.trim();
            if (phone !== undefined)
                updates.phone = phone?.trim() || null;
            if (email)
                updates.email = email.toLowerCase().trim();
            if (password)
                updates.password = await bcrypt.hash(password, 10);
            console.log('Updates --> ', updates);
            // Update user
            await UserModel.update(updates, {
                where: { id: authUser.userId },
                transaction,
            });
            // Fetch updated user (without password)
            const updatedUserData = await UserModel.findByPk(authUser.userId, {
                attributes: ['id', 'uid', 'name', 'email', 'phone'],
            });
            const updatedUser = updatedUserData?.dataValues;
            await transaction.commit();
            return res.status(200).json({
                type: 'success',
                message: 'done',
                user: updatedUser,
            });
        }
        catch (error) {
            await transaction.rollback();
            console.error("Update profile error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
    // Add this method to your AuthController
    updateOrganisation: async (req, res) => {
        const authUser = req.user;
        if (!authUser || !authUser.organizationId) {
            return res.status(401).json({ type: 'error', message: 'unauthorized' });
        }
        const { name, description, email, phone, country, region } = req.body;
        // At least one field must be provided
        if (!name && !description && !email && !phone && !country && !region) {
            return res.status(400).json({
                type: 'error',
                message: 'no_fields_to_update',
            });
        }
        const transaction = await sequelize.transaction();
        try {
            // Fetch current organisation
            const orgData = await OrganisationModel.findByPk(authUser.organizationId);
            const organisation = orgData?.dataValues;
            if (!organisation) {
                await transaction.rollback();
                return res.status(404).json({
                    type: 'error',
                    message: 'organization_not_found',
                });
            }
            // Validate new email if provided and different
            if (email && email !== organisation.email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    await transaction.rollback();
                    return res.status(400).json({
                        type: 'error',
                        message: 'invalid_email_format',
                    });
                }
                // Check if new email is already taken by another organisation
                const emailTaken = await OrganisationModel.findOne({
                    where: { email: email.toLowerCase().trim() },
                });
                if (emailTaken) {
                    await transaction.rollback();
                    return res.status(409).json({
                        type: 'error',
                        message: 'organisation_email_already_in_use',
                    });
                }
            }
            // Prepare update data
            const updates = {};
            if (name)
                updates.name = name.trim();
            if (description !== undefined)
                updates.description = description?.trim() || null;
            if (email)
                updates.email = email.toLowerCase().trim();
            if (phone !== undefined)
                updates.phone = phone?.trim() || null;
            if (country !== undefined)
                updates.country = country?.trim() || null;
            if (region !== undefined)
                updates.region = region?.trim() || null;
            console.log("Updates --> ", updates);
            // Update organisation
            await OrganisationModel.update(updates, {
                where: { id: authUser.organizationId },
                transaction,
            });
            // Fetch updated organisation
            const updatedOrgData = await OrganisationModel.findByPk(authUser.organizationId, {
                attributes: ['id', 'uid', 'name', 'description', 'email', 'phone', 'country', 'region'],
            });
            const updatedOrg = updatedOrgData?.dataValues;
            await transaction.commit();
            return res.status(200).json({
                type: 'success',
                message: 'organisation_updated_successfully',
                organisation: updatedOrg,
            });
        }
        catch (error) {
            await transaction.rollback();
            console.error("Update organisation error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
};
export default AuthController;
//# sourceMappingURL=auth.controller.js.map