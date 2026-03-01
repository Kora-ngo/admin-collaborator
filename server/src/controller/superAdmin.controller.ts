import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import SuperAdminModel from '../models/SuperAdmin.js';
import { generateUniqueUid } from '../utils/generateUniqueUid.js';


const SUPER_ADMIN_SECRET = process.env.SUPER_ADMIN_JWT_SECRET || 'super_admin_secret';
const TOKEN_EXPIRY = '8h';

const SuperAdminController = {

    login: async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            console.log("Email --> ")

            // 1. Basic validation
            if (!email || !password) {
                return res.status(400).json({
                    type: 'error',
                    message: 'fields_required',
                });
            }

            // 2. Find super admin by email
            const superAdminData = await SuperAdminModel.findOne({
                where: { email: email, status: 'true' },
            });

            const superAdmin = superAdminData?.dataValues;

            if (!superAdmin) {
                return res.status(401).json({
                    type: 'error',
                    message: 'invalid_credentials',
                });
            }

            // 3. Compare password
            const isMatch = await bcrypt.compare(password, superAdmin.password);

            if (!isMatch) {
                return res.status(401).json({
                    type: 'error',
                    message: 'invalid_credentials',
                });
            }

            // 4. Sign JWT
            const token = jwt.sign(
                {
                    superAdminId: superAdmin.id,
                    email: superAdmin.email,
                    name: superAdmin.name,
                },
                SUPER_ADMIN_SECRET,
                { expiresIn: TOKEN_EXPIRY }
            );

            // 5. Update last_login
            await superAdminData.update({ last_login: new Date() });

            // 6. Return token + basic info
            return res.status(200).json({
                type: 'success',
                message: 'login_success',
                token,
                data: {
                    id: superAdmin.id,
                    name: superAdmin.name,
                    email: superAdmin.email,
                },
            });

        } catch (error) {
            console.error('SuperAdmin login error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    register: async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        // 1. Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({
                type: 'error',
                message: 'fields_required',
            });
        }

        // 2. Enforce 2-user limit
        const count = await SuperAdminModel.count();
        if (count >= 2) {
            return res.status(403).json({
                type: 'warning',
                message: 'registration_limit_reached',
            });
        }

        // 3. Check duplicate email
        const existing = await SuperAdminModel.findOne({
            where: { email: email.trim().toLowerCase() },
        });

        if (existing) {
            return res.status(409).json({
                type: 'warning',
                message: 'email_already_exists',
            });
        }

        // 4. Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // 5. Generate UID
        const uid = await generateUniqueUid('super_admins');

        // 6. Create
        const newAdmin = await SuperAdminModel.create({
            uid,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            status: 'true',
            last_login: new Date(),
            date_of: new Date(),
            update_of: new Date(),
        });

        return res.status(201).json({
            type: 'success',
            message: 'registration_successful',
            data: {
                id: newAdmin.id,
                name: newAdmin.name,
                email: newAdmin.email,
            },
        });

    } catch (error) {
        console.error('SuperAdmin register error:', error);
        return res.status(500).json({ type: 'error', message: 'server_error' });
    }
},

    logout: async (req: Request, res: Response) => {
        // With JWT-only (no refresh), logout is handled client-side
        // This endpoint just confirms the action
        return res.status(200).json({
            type: 'success',
            message: 'logout_success',
        });
    },

    me: async (req: Request, res: Response) => {
        try {
            const superAdminId = (req as any).superAdmin?.superAdminId;

            const superAdmin = await SuperAdminModel.findOne({
                where: { id: superAdminId, status: 'true' },
                attributes: ['id', 'name', 'email', 'last_login', 'date_of'],
            });

            if (!superAdmin) {
                return res.status(404).json({ type: 'error', message: 'not_found' });
            }

            return res.status(200).json({
                type: 'success',
                data: superAdmin,
            });
        } catch (error) {
            console.error('SuperAdmin me error:', error);
            return res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },
};

export default SuperAdminController;