import { type Transaction } from 'sequelize';
import ReportModel from './report.model.js';
import MembershipModel from '../membership/membership.model.js';
import UserModel from '../user/user.model.js';
import ProjectModel from '../project/project.model.js';

const generatorInclude = {
    model: MembershipModel,
    as: 'generatedBy',
    attributes: ['id', 'role'],
    include: [{ model: UserModel, as: 'user', attributes: ['id', 'name', 'email'] }],
};

const projectInclude = {
    model: ProjectModel,
    as: 'project',
    attributes: ['id', 'name'],
};

export const ReportRepository = {

    countOverview: async (organisationId: number) => {
        const total = await ReportModel.count({ where: { organization_id: organisationId } });
        return total;
    },

    findAll: async (where: any, limit: number, offset: number) => {
        return ReportModel.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            include: [generatorInclude, projectInclude],
            limit,
            offset,
        });
    },

    destroy: async (instance: any) => {
        return instance.destroy();
    },

    findAndCountAll: async (where: any, limit: number, offset: number) => {
        return ReportModel.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            include: [generatorInclude, projectInclude],
            limit,
            offset,
        });
    },

    findByPk: async (id: string | number) => {
        return ReportModel.findOne({
            where: { id },
            include: [generatorInclude, projectInclude],
        });
    },

    create: async (data: any, transaction?: Transaction) => {
        return ReportModel.create(data, { transaction } as any);
    },

    update: async (instance: any, data: any, transaction?: Transaction) => {
        return instance.update(data, { transaction });
    },
};