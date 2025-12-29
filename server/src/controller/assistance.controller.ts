import { type Request, type Response } from 'express';
import AssistanceModel from '../models/Assistance.js';
import { json } from 'sequelize';
import AssistanceTypeModel from '../models/AssistanceType.js';
import type { AssistanceCreationAttributes, AssistanceTypeAttributes, AssistanceTypeCreationAttributes } from '../types/assistance.js';
import { generateUniqueUid } from '../utils/generateUniqueUid.js';

const AssistanceController = {
    
    // ASSISTANCE CONTROLLER ------------------------>


    fetchAll: async (req: Request, res: Response) => {
       try {
        const assistances = await AssistanceModel.findAll({
            where: { status: 'true' },
            order: [['name', 'ASC']],
        });
         res.status(200).json({
                type: 'success',
                data: assistances,
            });
       }catch (error) {
            console.error("Assistance: Fetch_All error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    fetchOne: async (req: Request, res: Response) => {
        try{
            const {id} = req.params;
            const assistance = await AssistanceModel.findOne({
                    where: {
                        id,
                        status: 'true',
                    },
                });
                
                if(!assistance) {
                    res.status(404).json({
                        type: 'error',
                        message: 'record_not_found',
                    });
                    return;               
                }

                res.status(200).json({
                    type: 'success',
                    data: assistance,
                });
        }catch (error) {
            console.error("Assistance: Fetch_One error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    create: async (req: Request, res: Response) => {
        try{
            const body: AssistanceCreationAttributes = req.body;

            if(!body.name || !body.assistance_id || body.created_by) {
                res.status(400).json({
                    type: 'error',
                    message: 'feilds_required',
                });
                return;
            }

            const existingAssistance = await AssistanceModel.findOne({
                where: { name: body.name, created_by: body.created_by, status: 'true' },
            });

            if (existingAssistance) {
                res.status(409).json({
                    type: 'error',
                    message: 'record_already_exists',
                });
                return;
            }

            const assistanceUid = await generateUniqueUid('assistance');

            const newAssistance = await AssistanceModel.create({
                ...body,
                uid: assistanceUid,
                status: 'true'
            });

            res.status(201).json({
                type: 'success',
                message: 'done',
                data: newAssistance,
            });
        }catch (error: any) {
            console.error("Assistance: Create error:", error);

            if (error.name === 'SequelizeUniqueConstraintError') {
                res.status(409).json({
                    type: 'error',
                    message: 'uid_already_exists', // Since uid is unique
                });
                return;
            }

            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    update: async (req: Request, res: Response) => {
        try{
            const {id} = req.params;
            const updates: AssistanceCreationAttributes = req.body;

            const assistance = await AssistanceModel.findByPk(id);

            if(!assistance){
                res.status(404).json({
                    type: 'error',
                    message: 'record_not_found',
                });
                return;               
            }

            if (updates.name === '' || (updates.description === '' && updates.description !== undefined)) {
                res.status(400).json({
                    type: 'error',
                    message: 'feilds_required',
                });
                return;
            }

            await assistance.update({
                ...updates,
                update_of: new Date(),
            });

            res.status(200).json({
                type: 'success',
                message: 'done',
                data: assistance,
            });
        }catch (error: any) {
            console.error("Assistance: Update error:", error);

            if (error.name === 'SequelizeUniqueConstraintError') {
                res.status(409).json({
                    type: 'error',
                    message: 'uid_already_exists',
                });
                return;
            }

            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },


    delete: async (req: Request, res: Response) => {
        try {
            const {id} = req.params;

            const assistance = await AssistanceModel.findByPk(id);

            if (!assistance) {
                res.status(404).json({
                    type: 'error',
                    message: 'record_not_found',
                });
                return;
            }

            await assistance.update({
                status: 'false',
                update_of: new Date(),
            });

            res.status(200).json({
                type: 'success',
                message: 'done',
            });
        }catch (error) {
            console.error("Assistance: Soft_Delete error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },



    // ASSISTANCE TYPE CONTROLLER -------------------------->

    fetchAllType: async (req: Request, res: Response) => {
       try{
         const type = await AssistanceTypeModel.findAll({
            order: [['name', 'ASC']],
        });

        res.status(200).json({
            type: 'success',
            data: type
        })
       } catch (error){
        console.error("Assistant Type: Fetch_All_Type error:", error);
        res.status(500).json({ type: 'error', message: 'server_error' });
    }
    },

    fetchOneType: async (req: Request, res: Response) => {
        try{
            const {id} = req.params;

            const type = await AssistanceTypeModel.findByPk(id);

            if(!type){
                res.status(404).json({
                    type: 'error',
                    message: 'record_not_found',
                });
                return;
            }

            res.status(200).json({
                type: 'success',
                data: type,
            })
        } catch (error){
        console.error("Assistant Type: Fetch_One_Type error:", error);
        res.status(500).json({ type: 'error', message: 'server_error' });
    }
    },

    createType: async (req: Request, res: Response) => {
        try {
            const body: AssistanceTypeCreationAttributes = req.body;

            // Basic Validation
            if(!body.name || !body.unit){
                res.status(400).json({
                    type: 'error',
                    message: 'feilds_required',
                });

                return;
            }


            const exististingType = await AssistanceTypeModel.findOne({
                where: {name: body.name, unit: body.unit}
            });


            if (exististingType) {
                res.status(409).json({
                    type: 'error',
                    message: 'record_already_exists',
                });
                return;
            }

            const newType = await AssistanceTypeModel.create(body);
            res.status(201).json({
                type: 'success',
                message: 'done',
                data: newType,
            });

        }catch (error){
        console.error("Assistant Type: Create_Type error:", error);
        res.status(500).json({ type: 'error', message: 'server_error' });
    }
    },

    updateType: async (req: Request, res: Response) => {
        try{
            const {id} = req.params;
            const updates: AssistanceTypeAttributes = req.body;

            const type = await AssistanceTypeModel.findByPk(id);

            if(!type) {
                res.status(404).json({
                    type: 'error',
                    message: 'record_not_found',
                });
                return;
            }

            // Prevent updating with empty name/unit if provided
            if(updates.name === '' || updates.unit === '') {
                res.status(400).json({
                    type: 'error',
                    message: 'feilds_required',
                });
                return;
            }

            await type.update({
                ...updates,
                update_of: new Date(),
            });

            res.status(200).json({
                type: 'success',
                message: 'done',
                data: type,
            })
        }catch (error: any) {
            console.error('Error updating assistance type:', error);

            if (error.name === 'SequelizeUniqueConstraintError') {
                res.status(409).json({
                    type: 'error',
                    message: 'An assistance type with this name already exists',
                });
                return;
            }

            res.status(500).json({type: 'error', message: 'server_error'});
        }
    },

    deleteType: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const type = await AssistanceTypeModel.findByPk(id);

            if(!type){
                res.status(404).json({
                    type: 'error',
                    message: 'record_not_found',
                });
                return;
            }

            await type.destroy();

            res.status(200).json({
                type: 'success',
                message: 'done',
            });
        }catch (error: any) {
            console.error('Error deleting assistance type:', error);

            // If there are related records (foreign key constraint), handle it
            if (error.name === 'SequelizeForeignKeyConstraintError') {
                res.status(409).json({
                    type: 'error',
                    message: 'Cannot delete: This type is being used by existing assistances',
                });
                return;
            }

            res.status(500).json({type: 'error', message: 'server_error'});
        }
    },

};


export default AssistanceController;