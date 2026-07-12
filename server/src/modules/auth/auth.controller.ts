import { type Request, type Response } from 'express';
import { logAudit } from '../../shared/utils/auditLogger.js';
import { AuthService } from './auth.service.js';

const AuthController = {

    login: async (req: Request, res: Response) => {
        const { email, password } = req.body;

        try {
            const result = await AuthService.login(email, password);

            if (result.validationError) return res.status(400).json({ type: 'error', message: result.validationError });
            if (result.notFound) return res.status(404).json({ type: 'error', message: result.notFound });
            if (result.unauthorized) return res.status(401).json({ type: 'error', message: result.unauthorized });
            if (result.forbidden) return res.status(403).json({ type: 'error', message: result.forbidden });
            if (result.orgBlocked) return res.status(404).json({ type: 'warning', message: 'organization_blocked' });

            await logAudit({
                req,
                action: 'Logged In',
                entityType: 'auth',
                entityId: result.auditContext!.userId,
                metadata: {
                    name: result.auditContext!.name,
                    email: result.auditContext!.email,
                    role: result.auditContext!.role,
                },
            });

            return res.status(200).json({ type: 'success', token: result.token });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    registerAdmin: async (req: Request, res: Response) => {
        const { users, organisation } = req.body;

        try {
            const result = await AuthService.registerAdmin(users, organisation);

            if (result.validationError) return res.status(400).json({ type: 'error', message: result.validationError });
            if (result.conflict) return res.status(409).json({ type: 'error', message: result.conflict });

            res.status(201).json({ type: 'success', message: 'admin_registered_successfully', token: result.token });
        } catch (error: any) {
            console.error('Register error:', error);

            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ type: 'error', message: 'email_or_uid_already_exists' });
            }

            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    acceptInvitation: async (req: Request, res: Response) => {
        const { token } = req.body;

        try {
            const result = await AuthService.acceptInvitation(token);

            if (result.validationError) return res.status(400).json({ type: 'error', message: result.validationError });
            if (result.notFound) return res.status(404).json({ type: 'error', message: 'user_not_found' });
            if (result.forbidden) return res.status(403).json({ type: 'error', message: result.forbidden });
            if (result.alreadyActive) return res.status(400).json({ type: 'error', message: 'user_already_active' });

            return res.status(200).json({ type: 'success', message: 'invitation_accepted', data: result.data });
        } catch (error: any) {
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ type: 'error', message: 'invalid_or_expired_token' });
            }

            console.error('Accept invitation error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    getCurrentUser: async (req: Request, res: Response) => {
        const authUser = req.user;

        if (!authUser || !authUser.userId) {
            return res.status(401).json({ type: 'error', message: 'unauthorized' });
        }

        try {
            const result = await AuthService.getCurrentUser(authUser as any);

            if (result.forbidden) return res.status(403).json({ type: 'error', message: result.forbidden });
            if (result.orgBlocked) return res.status(404).json({ type: 'error', message: 'organization_blocked' });

            return res.status(200).json({ type: 'success', ...result.data });
        } catch (error) {
            console.error('Get current user error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    selectMembership: async (req: Request, res: Response) => {
        const { membershipId, userId, uid, email } = req.body;

        try {
            const result = await AuthService.selectMembership(membershipId, userId, uid, email);

            if (result.validationError) return res.status(400).json({ type: 'error', message: result.validationError });
            if (result.notFound) return res.status(404).json({ type: 'error', message: result.notFound });
            if (result.forbidden) return res.status(403).json({ type: 'error', message: result.forbidden });

            return res.status(200).json({
                type: 'success',
                message: 'organization_selected_successfully',
                token: result.token,
                membership: result.membership,
            });
        } catch (error) {
            console.error('Select organization error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    inviteUser: async (req: Request, res: Response): Promise<void> => {
        res.status(200).json({ message: 'Invitation sent successfully' });
    },

    forgotPassword: async (req: Request, res: Response) => {
        const { email, newPassword, confirmPassword } = req.body;

        try {
            const result = await AuthService.forgotPassword(email, newPassword, confirmPassword);

            if (result.validationError) return res.status(400).json({ type: 'error', message: result.validationError });
            if (result.notFound) return res.status(404).json({ type: 'error', message: result.notFound });
            if (result.forbidden) return res.status(403).json({ type: 'error', message: result.forbidden });

            await logAudit({
                req,
                action: 'Update',
                entityType: 'auth',
                entityId: result.auditContext!.userId,
                metadata: {
                    name: result.auditContext!.name,
                    email: result.auditContext!.email,
                    role: result.auditContext!.role,
                },
            });

            return res.status(200).json({ type: 'success', message: 'done', user: result.data });
        } catch (error) {
            console.error("Reset password error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    resetPassword: async (req: Request, res: Response): Promise<void> => {
        res.status(200).json({ message: 'Password reset successfully' });
    },

    updateProfile: async (req: Request, res: Response) => {
        const authUser = req.user;

        if (!authUser || !authUser.userId) {
            return res.status(401).json({ type: 'error', message: 'unauthorized' });
        }

        try {
            const result = await AuthService.updateProfile(authUser.userId, req.body);

            if (result.validationError) return res.status(400).json({ type: 'error', message: result.validationError });
            if (result.notFound) return res.status(404).json({ type: 'error', message: 'user_not_found' });
            if (result.forbidden) return res.status(403).json({ type: 'error', message: result.forbidden });
            if (result.unauthorized) return res.status(401).json({ type: 'error', message: result.unauthorized });
            if (result.conflict) return res.status(409).json({ type: 'error', message: result.conflict });

            return res.status(200).json({ type: 'success', message: 'done', user: result.data });
        } catch (error: any) {
            console.error("Update profile error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    updateOrganisation: async (req: Request, res: Response) => {
        const authUser = req.user;

        if (!authUser || !authUser.organizationId) {
            return res.status(401).json({ type: 'error', message: 'unauthorized' });
        }

        try {
            const result = await AuthService.updateOrganisation(authUser.organizationId, req.body);

            if (result.validationError) return res.status(400).json({ type: 'error', message: result.validationError });
            if (result.notFound) return res.status(404).json({ type: 'error', message: 'organization_not_found' });
            if (result.conflict) return res.status(409).json({ type: 'error', message: result.conflict });

            return res.status(200).json({
                type: 'success',
                message: 'organisation_updated_successfully',
                organisation: result.data,
            });
        } catch (error: any) {
            console.error("Update organisation error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
};

export default AuthController;