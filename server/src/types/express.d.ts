// types/express.d.ts

import { UserAttributes } from '../models/User'; // optional, if you want stronger typing

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        userUid: number;
        email: string;
        organizationId: number;
        membershipId: number;
        role: string;
        subscriptionExpiresAt: string | null;
      };
    }


    interface Request {
        user?: { 
          id: number;
          uid: number;
          name: string;
          email: string;
          password: string;
          status: string;
          last_login: Date | null;
          date_of: Date;
          update_of: Date;
         };
        superAdmin?: {
            superAdminId: number;
            email: string;
            name: string;
        };
    }
  }
}

