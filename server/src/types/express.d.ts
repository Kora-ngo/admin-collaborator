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
  }
}