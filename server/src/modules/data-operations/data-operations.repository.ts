import { type Transaction } from 'sequelize';
import DataOperationModel from './data-operations.model.js';

// ============================================================
// Data Operation
// ============================================================

export const DataOperationRepository = {

    findAndCountAll: async (where: any, limit: number, offset: number) => {
        return DataOperationModel.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit,
            offset,
        });
    },

    findByPk: async (id: string, transaction?: Transaction) => {
        return DataOperationModel.findByPk(id, { transaction: transaction! });
    },


    create: async (data: any, transaction?: Transaction) => {
        return DataOperationModel.create(data, { transaction: transaction! });
    },

    update: async (instance: any, data: any, transaction?: Transaction) => {
        return instance.update(data, { transaction: transaction! });
    },
};