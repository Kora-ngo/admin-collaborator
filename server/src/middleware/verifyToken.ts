import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { checkAndUpdateSubscription } from '../helpers/checkSubscription.js';

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;


    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ type: 'error', message: 'access_token_required' });
    }

    const token = authHeader.split(' ')[1];


    try {

        const payload = jwt.verify(token!, process.env.JWT_SECRET as string) as any;



        // valided required fields in payload
        if (!payload.userId || !payload.organizationId || !payload.role) {
           return res.status(401).json({ type: 'error', message: 'invalid_token_payload' });
        }


        // Check & update subscription status
        const { isActive, subscription, message } = await checkAndUpdateSubscription(payload.organizationId);

        // if (!isActive) {
        //     res.status(403).json({
        //         type: 'error',
        //         message: message || 'subscription_expired_or_inactive',
        //         subscriptionStatus: subscription?.status || 'none',
        //         expiresAt: subscription?.ends_at || null,
        //     });
        // }


        req.user = {
            userId: payload.userId,
            userUid: payload.userUid,
            email: payload.email,
            organizationId: payload.organizationId,
            membershipId: payload.membershipId,
            role: payload.role,
            subscriptionExpiresAt: payload.subscriptionExpiresAt || null,
        };
        

        next();


    }catch (error) {
    res.status(401).json({ type: 'error', message: 'invalid_or_expired_token' });
  }
}