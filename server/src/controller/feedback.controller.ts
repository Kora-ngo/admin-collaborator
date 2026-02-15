import { type Request, type Response } from 'express';
import { UserModel, MembershipModel, OrganisationModel } from '../models/index.js';
import emailService from '../utils/emailService.js';
import { logAudit } from '../utils/auditLogger.js';

const FeedbackController = {
    /**
     * Send feedback email
     * POST /feedback
     */
    sendFeedback: async (req: Request, res: Response) => {
        try {
            const { message, email: customEmail } = req.body;
            const middlewareAuth = req.user; // From verifyToken middleware

            // Validate message
            if (!message || !message.trim()) {
                res.status(400).json({
                    type: 'error',
                    message: 'fields_required'
                });
                return;
            }

            // Get user details from membership
            const membershipData = await MembershipModel.findOne({
                where: { id: middlewareAuth?.membershipId },
                include: [
                    {
                        model: UserModel,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: OrganisationModel,
                        as: 'organization',
                        attributes: ['id', 'name']
                    }
                ]
            });

            const membership = membershipData?.dataValues;

            if (!membership) {
                res.status(404).json({
                    type: 'error',
                    message: 'user_not_found'
                });
                return;
            }

            const userData = await UserModel.findByPk(membership.user_id);
            const user = userData?.dataValues;

            if(!user) {
                res.status(404).json({
                    type: 'error',
                    message: 'user_not_found'
                });
                return;
            }

            const orgData = await OrganisationModel.findByPk(membership.organization_id);
            const organisation = orgData?.dataValues;

            if(!organisation){
                res.status(404).json({
                    type: 'error',
                    message: 'user_not_found'
                });
                return;
            }

            const userName = user.name;

            // Determine which email to use for reply
            const replyEmail = customEmail?.trim() || user.email;

            // Prepare feedback data
            const feedbackData = {
                userName: userName,
                userEmail: user.email,
                role: membership.role,
                organisation: organisation.name,
                message: message.trim(),
                replyEmail: replyEmail
            };

            console.log('📧 Sending feedback email:', feedbackData);

            // Send email
            const emailSent = await emailService.sendFeedbackEmail(feedbackData);

            if (!emailSent) {
                res.status(500).json({
                    type: 'error',
                    message: 'email_send_failed'
                });
                return;
            }

            res.status(200).json({
                type: 'success',
                message: 'feedback_sent'
            });

        } catch (error) {
            console.error('Feedback send error:', error);
            res.status(500).json({
                type: 'error',
                message: 'server_error'
            });
        }
    }
};

export default FeedbackController;