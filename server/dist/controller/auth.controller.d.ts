import { type Request, type Response } from 'express';
declare const AuthController: {
    login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    registerAdmin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    acceptInvitation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getCurrentUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    selectMembership: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    inviteUser: (req: Request, res: Response) => Promise<void>;
    forgotPassword: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    resetPassword: (req: Request, res: Response) => Promise<void>;
    updateProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateOrganisation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default AuthController;
//# sourceMappingURL=auth.controller.d.ts.map