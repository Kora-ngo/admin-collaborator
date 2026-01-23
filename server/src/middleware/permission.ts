import type { Request, Response, NextFunction } from 'express';

type Role = 'admin' | 'collaborator' | 'enumerator';

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // req.user comes from verifyToken middleware
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        type: 'error',
        message: 'no_user_found'
      });
    }

    const userRole = req.user.role as Role;

    // Check if user's role is in the allowed list
    if (!allowedRoles.includes(userRole)) {
        console.log("Permission --> Middleware")
      return res.status(403).json({
        type: 'warning',
        message: `unauthorized_access`
      });
    }

    // All good → continue
    next();
  };
}