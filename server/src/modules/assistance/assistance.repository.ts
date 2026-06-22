import { Op } from 'sequelize';
import AssistanceModel from './assistance.model.js';
import AssistanceTypeModel from '../assistance-type/assistance-type.model.js';
import type { AssistanceCreationAttributes, AssistanceTypeAttributes, AssistanceTypeCreationAttributes } from './types/assistance.js';

const assistanceTypeInclude = {
    model: AssistanceTypeModel,
    as: 'assistanceType',
    attributes: ['id', 'name', 'unit'],
    required: true,
};


// ============================================================
// Assistance
// ============================================================

export const AssistanceRepository = {

    findAll: async (where: any) => {
        return AssistanceModel.findAll({
            where,
            order: [['date_of', 'DESC']],
            include: [assistanceTypeInclude],
        });
    },

    findAndCountAll: async (where: any, limit: number, offset: number) => {
        return AssistanceModel.findAndCountAll({
            where,
            order: [['date_of', 'DESC']],
            include: [assistanceTypeInclude],
            limit,
            offset,
        });
    },

    findOne: async (where: any) => {
        return AssistanceModel.findOne({
            where,
            include: [
                {
                    model: AssistanceTypeModel,
                    as: 'assistanceType',
                    attributes: ['id', 'name', 'unit'],
                },
            ],
        });
    },

    findByPk: async (id: string) => {
        return AssistanceModel.findByPk(id);
    },

    create: async (data: any) => {
        return AssistanceModel.create(data);
    },

    update: async (instance: any, data: any) => {
        return instance.update(data);
    },
};


// ============================================================
// Assistance Type
// ============================================================

export const AssistanceTypeRepository = {

    findAll: async (where: any) => {
        return AssistanceTypeModel.findAll({
            order: [['name', 'ASC']],
            where,
        });
    },

    findByPk: async (id: string) => {
        return AssistanceTypeModel.findByPk(id);
    },

    findExisting: async (organizationId: any, validTypes: AssistanceTypeCreationAttributes[]) => {
        return AssistanceTypeModel.findAll({
            where: {
                organization_id: organizationId,
                [Op.or]: validTypes.map(t => ({
                    name: t.name,
                    unit: t.unit,
                })),
            },
            attributes: ['name', 'unit'],
        });
    },

    bulkCreate: async (data: AssistanceTypeCreationAttributes[]) => {
        return AssistanceTypeModel.bulkCreate(data);
    },

    update: async (instance: any, data: AssistanceTypeAttributes) => {
        return instance.update({
            ...data,
            update_of: new Date(),
        });
    },

    delete: async (instance: any) => {
        return instance.destroy();
    },
};