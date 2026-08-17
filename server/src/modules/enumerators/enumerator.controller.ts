import type { Request, Response } from 'express';
import { EnumeratorService } from './enumerator.service.js';

const EnumeratorController = {

    login: async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const result = await EnumeratorService.login(email, password, req);

            if (result.error) {
                const status = result.status || 400;
                if (result.error === 'user_not_found') return res.status(404).json({ type: 'error', message: result.error });
                return res.status(status).json({ type: 'error', message: result.error });
            }

            res.status(200).json({ type: 'success', token: result.token });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },


    getMobileUserData: async (req: Request, res: Response) => {
        try {
            const authUser = req.user;
            if (!authUser || !authUser.userId) {
                return res.status(401).json({ type: 'error', message: 'unauthorized' });
            }

            const result = await EnumeratorService.getMobileUserData(authUser);

            if (result.error) {
                return res.status(result.status || 500).json({ type: 'error', message: result.error });
            }

            res.status(200).json({ type: 'success', data: result.data });
        } catch (error) {
            console.error('Mobile - Get user data error:', error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    syncData: async (req: Request, res: Response) => {
        try {
            const authUser = req.user;
            if (!authUser || !authUser.userId || !authUser.membershipId) {
                return res.status(401).json({ type: 'error', message: 'unauthorized' });
            }

            const result = await EnumeratorService.syncData(authUser, req.body, req);

            if (result.error) {
                const payload: any = { type: 'error', message: result.error };
                if (result.details) payload.details = result.details;
                return res.status(result.status || 400).json(payload);
            }

            res.status(200).json({ type: 'success', data: result.data });
        } catch (error: any) {
            console.error('Sync Data error:', error);
            res.status(500).json({ type: 'error', message: 'server_error', details: error.message });
        }
    },

};

export default EnumeratorController;