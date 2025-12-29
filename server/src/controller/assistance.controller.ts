import { type Request, type Response } from 'express';

const AssistanceController = {
    
    // ASSISTANCE CONTROLLER ------------------------>


    fetchAll: async (req: Request, res: Response) => {
        res.json({type: 'success', message: 'read_all_assistances'});
    },

    fetchOne: async (req: Request, res: Response) => {
        res.json({type: 'success', message: 'read_only_one'});
    },

    create: async (req: Request, res: Response) => {
        res.json({type: 'success', message: 'create_assistnce'})
    },

    update: async (req: Request, res: Response) => {
        res.json({type: 'sucess', message: 'update_assitance'})
    },


    delete: async (req: Request, res: Response) => {
        res.json({type: 'success', message: 'deleted_assitance'})
    },



    // ASSISTANCE TYPE CONTROLLER -------------------------->

    fetchAllType: async (req: Request, res: Response) => {
        res.json({type: 'success', message: 'read_all_assistances_type'});
    },

    fetchOneType: async (req: Request, res: Response) => {
        res.json({type: 'success', message: 'read_only_one_type'});
    },

    createType: async (req: Request, res: Response) => {
        res.json({type: 'success', message: 'create_assistnce_type'})
    },

    updateType: async (req: Request, res: Response) => {
        res.json({type: 'sucess', message: 'update_assitance_type'})
    },


    deleteType: async (req: Request, res: Response) => {
        res.json({type: 'success', message: 'deleted_assitance_type'})
    },

};


export default AssistanceController;