import { type Request, type Response } from 'express';
declare const AuthController: {
    login: (req: Request, res: Response) => Promise<void>;
    registerAdmin: (req: Request, res: Response) => Promise<void>;
    inviteUser: (req: Request, res: Response) => Promise<void>;
    acceptInvitation: (req: Request, res: Response) => Promise<void>;
    forgotPassword: (req: Request, res: Response) => Promise<void>;
    resetPassword: (req: Request, res: Response) => Promise<void>;
    refreshToken: (req: Request, res: Response) => Promise<void>;
    getCurrentUser: (req: Request, res: Response) => Promise<void>;
};
export default AuthController;
//# sourceMappingURL=auth.controller.d.ts.map