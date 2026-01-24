import type { Request, Response, NextFunction } from 'express';
import { OrganisationModel } from '../models/index.js';

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

export const requireSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.userId || !req.user.organizationId) {
    return res.status(401).json({
      type: 'error',
      message: 'no_user_found',
    });
  }


  const userId = req.user.userId;
  const organizationId = req.user.organizationId;


  try {
    const organization = await OrganisationModel.findOne({
      where: {
        id: organizationId,
        created_by: userId,   // ← this is the super admin check
      },
      attributes: ['id', 'created_by', 'name'], // minimal fields
    });

    if (!organization) {
      return res.status(403).json({
        type: 'error',
        message: 'unauthorized_access',
      });
    }

    next();
  }catch (error) {
    console.error('Super admin middleware error:', error);
    return res.status(500).json({
      type: 'error',
      message: 'server_error_during_authorization',
    });
  }

  


}