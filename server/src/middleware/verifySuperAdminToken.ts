import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SUPER_ADMIN_SECRET = process.env.SUPER_ADMIN_JWT_SECRET || 'super_admin_secret';

export const verifySuperAdminToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            type: 'error',
            message: 'access_token_required',
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token!, SUPER_ADMIN_SECRET as string) as any;

        if (!payload.superAdminId || !payload.email) {
            return res.status(401).json({
                type: 'error',
                message: 'invalid_token_payload',
            });
        }

        // Attach decoded info to request — frontend never needs to store this
        req.superAdmin = {
            superAdminId: payload.superAdminId,
            email: payload.email,
            name: payload.name,
        };

        next();

    } catch (error) {
        return res.status(401).json({
            type: 'error',
            message: 'invalid_or_expired_token',
        });
    }
};