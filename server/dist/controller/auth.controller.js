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
            // Fetch user's memebership details (role + organization)
            const membershipData = await MembershipModel.findOne({
                where: { user_id: userExist?.id },
            });
            const membership = membershipData?.dataValues;
            if (!membership) {
                return res.status(403).json({ type: 'error', message: "no_organization_membership" });
            }
            // check if the user is pending
            if (userExist?.status === 'pending') {
                return res.status(403).json({ type: 'success', message: "user_pending", data: membership });
            }
            // Extract organization ID and role from membership
            const organizationId = membership?.organization_id;
            const role = membership?.role;
            // Fetch active subscription to get expiry date
            const subscriptionData = await SubscriptionModel.findOne({
                where: {
                    organization_id: organizationId,
                    status: 'true'
                },
                order: [['ends_at', 'DESC']],
            });
            const subscription = subscriptionData?.dataValues;
            // Check if subscription exists and get expiry date
            if (!subscription) {
                return res.status(403).json({ type: 'error', message: "no_active_subscription" });
            }
            const expiresAt = subscription ? subscription.ends_at : null;
            // Generate JWT token
            const tokenPayload = {
                userId: userExist?.id,
                userUid: userExist?.uid,
                email: userExist?.email || email,
                organizationId: organizationId,
                membershipId: membership?.id,
                role: role,
                subscriptionExpiresAt: expiresAt
            };
            const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '30d' });
            return res.status(200).json({
                type: 'success',
                token,
                user: {
                    id: userExist.id,
                    uid: userExist.uid,
                    name: userExist.name,
                    email: userExist.email || email,
                    role,
                    organization: {
                        id: organizationId,
                    },
                    subscriptionExpiresAt: expiresAt,
                }
            });
        }
        catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
    // Register admin handler
    registerAdmin: async (req, res) => {
        const { users, organisation, subscription } = req.body;
        console.log("Users --> ", users);
        console.log("Organization --> ", organisation);
        console.log("Subscription --> ", subscription);
        if (!users || !organisation || !subscription) {
            return res.status(400).json({ type: 'error', message: 'missing_user_or_organisation_data' });
        }
        // validate using the picked feilds
        if (!users.name || !users.email || !users.password) {
            return res.status(400).json({ type: 'error', message: 'missing_users_credentials' });
        }
        if (!organisation.name || !organisation.access_code || !organisation.email) {
            return res.status(400).json({ type: 'error', message: 'missing_organisation_fields' });
        }
        const transaction = await sequelize.transaction();
        try {
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
                access_code: organisation.access_code,
                description: organisation.description || null,
                founded_at: organisation.founded_at ? new Date(organisation.founded_at) : new Date(),
                country: organisation.country || null,
                region: organisation.region || null,
                email: organisation.email,
                phone: organisation.phone || null,
                status: 'true',
            }, { transaction });
            // Membership
            const newMembership = await MembershipModel.create({
                user_id: newUser.id,
                organization_id: newOrganisation.id,
                role: 'admin',
            }, { transaction });
            // This is the created membership ID
            const membershipId = newMembership.id;
            // Subscription
            const plan = subscription.plan || 'free';
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
                data: {
                    user: {
                        id: newUser.id,
                        uid: newUser.uid,
                        name: newUser.name,
                        email: newUser.email,
                    },
                    organisation: {
                        id: newOrganisation.id,
                        uid: newOrganisation.uid,
                        name: newOrganisation.name,
                        email: newOrganisation.email,
                    },
                    role: 'admin',
                    subscription: {
                        plan,
                        expiresAt: endsAt.toISOString(),
                    },
                },
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
    // Invite user handler
    inviteUser: async (req, res) => {
        res.status(200).json({ message: 'Invitation sent successfully' });
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
        try {
            const userData = await User.findByPk(authUser.userId);
            const user = userData?.dataValues;
            if (!user || user.status !== 'true') {
                return res.status(403).json({ type: 'error', message: 'user_inactive_or_not_found' });
            }
            const membershipData = await MembershipModel.findOne({
                where: { id: authUser.membershipId },
            });
            const membership = membershipData?.dataValues;
            if (!membership) {
                return res.status(403).json({ type: 'error', message: 'no_memebership_created' });
            }
            // Get active subscription
            const subscriptionData = await SubscriptionModel.findOne({
                where: {
                    organization_id: authUser.organizationId,
                    status: 'true',
                },
                order: [['ends_at', 'DESC']],
            });
            const subscription = subscriptionData.dataValues;
            const isSubscriptionActive = subscription && subscription.ends_at > new Date();
            return res.status(200).json({
                type: 'success',
                user: {
                    id: user.id,
                    uid: user.uid,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                },
                role: membership.role,
                organization: membership.organization_id,
                subscription: {
                    plan: subscription?.plan || 'none',
                    status: isSubscriptionActive ? 'active' : 'expired',
                    expiresAt: subscription?.ends_at || null,
                    isActive: isSubscriptionActive,
                },
            });
        }
        catch (error) {
            console.error('Get current user error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
    forgotPassword: async (req, res) => {
        res.status(200).json({ message: 'Password reset email sent' });
    },
    resetPassword: async (req, res) => {
        res.status(200).json({ message: 'Password reset successfully' });
    }
};
export default AuthController;
//# sourceMappingURL=auth.controller.js.map