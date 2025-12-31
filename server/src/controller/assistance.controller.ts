import { type Request, type Response } from 'express';
import { json, Op } from 'sequelize';
import type { AssistanceCreationAttributes, AssistanceTypeAttributes, AssistanceTypeCreationAttributes } from '../types/assistance.js';
import { generateUniqueUid } from '../utils/generateUniqueUid.js';
import { AssistanceModel, AssistanceTypeModel } from '../models/index.js';

const AssistanceController = {
    
    // ASSISTANCE CONTROLLER ------------------------>


    fetchAll: async (req: Request, res: Response) => {
        console.log("Backend fetch --> entrance");

       try {

        // Get Query Params with defaults----------------------->
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;
        const offset = (page - 1) * limit;

        const {count, rows} = await AssistanceModel.findAndCountAll({
            where: { status: 'true' },
            order: [['date_of', 'DESC']],
            include: [
                {
                    model: AssistanceTypeModel,
                    as: 'assistanceType',
                    attributes: ['id', 'name', 'unit'],
                    required: true
                }
            ],
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

         res.status(200).json({
                type: 'success',
                data: rows,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            });


       }catch (error) {
            console.error("Assistance: Fetch_All error:", error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },

    fetchOne: async (req: Request, res: Response) => {
        console.log("Backend fetchOne --> entrance");
        try{
            const {id} = req.params;
            const assistance = await AssistanceModel.findOne({
                    where: {
                        id,
                        status: 'true',
                    },
                    include: [
                        {
                            model: AssistanceTypeModel,
                            as: 'assistanceType',
                            attributes: ['id', 'name', 'unit'],
                        },
                    ],
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

            console.log("Assistnace - creation - body --> ", body);

            if(!body.name || !body.assistance_id || !body.created_by) {
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
        console.log("Backend Delete --> entrance");

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

    search: async (req: Request, res: Response) => {
        try {
            const q = (req.query.q as string)?.trim();
            const page = parseInt(req.query.page as string) || 1;
            const limit = 5;
            const offset = (page - 1) * limit;

            if (!q) {
            return res.status(400).json({
                type: 'error',
                message: 'search_query_required',
            });
            }

            const where: any = {
            status: 'true',
            name: { [Op.like]: `%${q}%` },
            };

            const { count, rows } = await AssistanceModel.findAndCountAll({
            where,
            order: [['date_of', 'DESC']],
            include: [
                {
                model: AssistanceTypeModel,
                as: 'assistanceType',
                attributes: ['id', 'name', 'unit'],
                required: true,
                },
            ],
            limit,
            offset,
            });

            const totalPages = Math.ceil(count / limit);

            res.status(200).json({
            type: 'success',
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
            });
        } catch (error) {
            console.error("Assistance: Search error:", error);
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
            const input = req.body;

            // Normalize input:
            const typesToCreate: AssistanceTypeCreationAttributes[] = Array.isArray(input)
            ? input
            : [input];

            if (typesToCreate.length === 0) {
                return res.status(400).json({
                    type: 'error',
                    message: 'no_data_provided',
                });
            }


            const getKey = (name: any, unit: any) => 
                `${(name ?? '').toString().toLowerCase().trim()}|${(unit ?? '').toString().toLowerCase().trim()}`;


            // Validate all entries
                const validationErrors: { index: number; message: string }[] = [];
                const validTypes: AssistanceTypeCreationAttributes[] = [];

                typesToCreate.forEach((body, index) => {
                    // Safely extract and trim strings
                    const name = typeof body.name === 'string' ? body.name.trim() : '';
                    const unit = typeof body.unit === 'string' ? body.unit.trim() : '';

                    if (name === '' || unit === '') {
                        validationErrors.push({
                            index,
                            message: 'fields_required',
                        });
                    } else {
                        validTypes.push({ name, unit });
                    }
                });


            if (validationErrors.length > 0) {
                return res.status(400).json({
                    type: 'error',
                    message: 'validation_failed',
                    details: validationErrors, // optional: helps frontend show per-row errors
                });
            }

            // Check for duplicates (existing in DB or duplicates within the batch)
            const namesUnits = validTypes.map(t => getKey(t.name, t.unit));

            
            // Check against existing records
            const existingTypes = await AssistanceTypeModel.findAll({
                where: {
                    [Op.or]: validTypes.map(t => ({
                        name: t.name,
                        unit: t.unit,
                    })),
                },
                attributes: ['name', 'unit'],
            });

            const existingKeys = new Set(
                existingTypes.map(t => getKey(t.get('name'), t.get('unit'))) // safer if using DataValues
            );


            // Also detect duplicates within the current batch
            const seen = new Set<string>();
            const duplicatesInBatch: number[] = [];
            namesUnits.forEach((key, idx) => {
                if (seen.has(key)) {
                    duplicatesInBatch.push(idx);
                } else {
                    seen.add(key);
                }
            });

            const conflicts: { index: number; message: string }[] = [];

            validTypes.forEach((type, idx) => {
                const key = getKey(type.name, type.unit);
                if (existingKeys.has(key)) {
                    conflicts.push({ index: idx, message: 'record_already_exists' });
                }
            });


            duplicatesInBatch.forEach(idx => {
                conflicts.push({ index: idx, message: 'duplicate_in_batch' });
            });


            if (conflicts.length > 0) {
                return res.status(409).json({
                    type: 'error',
                    message: 'duplicate_records',
                    details: conflicts,
                });
            }


            const newTypes = await AssistanceTypeModel.bulkCreate(validTypes);

            res.status(201).json({
                type: 'success',
                message: 'done',
                data: newTypes,
                count: newTypes.length,
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

            console.log("backend delete type ID:", id);

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