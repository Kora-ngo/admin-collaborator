import { type Request, type Response } from 'express';
declare const AuthController: {
    login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    registerAdmin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    inviteUser: (req: Request, res: Response) => Promise<void>;
    acceptInvitation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getCurrentUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    forgotPassword: (req: Request, res: Response) => Promise<void>;
    resetPassword: (req: Request, res: Response) => Promise<void>;
};
export default AuthController;
//# sourceMappingURL=auth.controller.d.ts.map