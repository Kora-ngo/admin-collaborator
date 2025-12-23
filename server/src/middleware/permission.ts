import type { Request, Response, NextFunction } from 'express';

type Role = 'admin' | 'collaborator' | 'enumerator';

export const permissionMiddleware = (requiredRole: Role[] | Role) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if(!req.user) {
            return res.status(401).json({ type: 'error', message: 'unauthorized' });
        }

        const userRole = req.user.role as Role;
        const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

        // Admin has full access
        if(userRole === 'admin' || requiredRoles.includes(userRole)) {
            return next();
        }

        res.status(403).json({ type: 'error', message: 'insufficient_permissions' });
}
}