import { type Request, type Response } from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Membership from '../models/Membership.js';
import Subscription from '../models/Subscription.js';


const AuthController = {

// Login handler
login: async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try{
        // Check if the user exists
        const userExist = await User.findOne({ where: { email } });
        if(!userExist){
           return res.status(404).json({ type: 'error', message: "user_not_found" });
        }

        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, userExist.password);
        if(!isPasswordValid){
           return res.status(401).json({ type: 'error', message: "invalid_credentials" });
        }

        // check if the user is active
        if(userExist?.status !== 'true'){
           return res.status(403).json({ type: 'error', message: "user_inactive" });
        }

        
        // Fetch user's memebership details (role + organization)
        const membership = await Membership.findOne({ 
            where: { user_id: userExist?.id },
            });

        if(!membership){
           return res.status(403).json({ type: 'error', message: "no_organization_membership" });
        }

        // Extract organization ID and role from membership
        const organizationId = membership?.organization_id
        const role = membership?.role;

        // Fetch active subscription to get expiry date
        const subscription = await Subscription.findOne({
            where: {
                organization_id: organizationId,
                status: 'true'
            },
            order: [['ends_at', 'DESC']],
        });

        const expiresAt = subscription ? subscription.ends_at : null;

        // Generate JWT token
        const tokenPayload = {
            userId: userExist?.id,
            userUid: userExist?.uid,
            email: userExist?.email || email,
            organizationId: organizationId,
            role: role,
            subscriptionExpiresAt: expiresAt
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET as string, { expiresIn: '30d' });


        return res.status(200).json({
            type: 'success',
            token,
            user: {
                id: userExist.id,
                uid: userExist.uid,
                email: userExist.email|| email,
                role,
                organization: {
                    id: organizationId,
                },
                subscriptionExpiresAt: expiresAt,
            }
        });
    } catch (error){
        console.error("Login error:", error);
        res.status(500).json({ type: 'error', message: 'server_error' });
    }

},

// Register admin handler
registerAdmin: async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ message: 'The admin has been registered' });
},

// Invite user handler
inviteUser: async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ message: 'Invitation sent successfully' });
},

// Additional handlers
acceptInvitation: async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ message: 'Invitation accepted' });
},


refreshToken: async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ message: 'Token refreshed' });
},

getCurrentUser: async (req: Request, res: Response): Promise<void> => {
    // Assuming you have user attached to req (via auth middleware)
    res.status(200).json({ message: 'Current user data' });
},

forgotPassword: async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ message: 'Password reset email sent' });
},

resetPassword: async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ message: 'Password reset successfully' });
}



};

export default AuthController;