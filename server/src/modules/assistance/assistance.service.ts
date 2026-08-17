import { Op } from 'sequelize';
import { generateUniqueUid } from '../../shared/utils/generateUniqueUid.js';
import { AssistanceRepository, AssistanceTypeRepository } from './assistance.repository.js';
import type { AssistanceCreationAttributes, AssistanceTypeAttributes, AssistanceTypeCreationAttributes } from './types/assistance.js';


// ============================================================
// Assistance
// ============================================================

export const AssistanceService = {

    fetchAll: async (organizationId: any, status: string, page: number, limit: number) => {
        const whereClause: any = {
            organization_id: organizationId,
        };

        if (status === "all") {
            whereClause.status = { [Op.ne]: 'false' };
            const rows = await AssistanceRepository.findAll(whereClause);
            return { rows, pagination: null };
        }

        const offset = (page - 1) * limit;
        whereClause.status = 'true';

        const { count, rows } = await AssistanceRepository.findAndCountAll(whereClause, limit, offset);
        const totalPages = Math.ceil(count / limit);
        const overall = await AssistanceRepository.countOverview(organizationId);

        return {
            rows,
            pagination: {
                overall,
                total: count,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    },

    fetchOne: async (id: string | undefined) => {
        if (!id) return null;
        return AssistanceRepository.findOne({ id, status: 'true' });
    },

    create: async (body: AssistanceCreationAttributes, organisationId: any) => {
        const existingAssistance = await AssistanceRepository.findOne({
            name: body.name,
            created_by: body.created_by,
            status: 'true',
        });

        if (existingAssistance) {
            return { conflict: true };
        }

        const assistanceUid = await generateUniqueUid('assistance');

        const newAssistance = await AssistanceRepository.create({
            ...body,
            uid: assistanceUid,
            organization_id: organisationId,
            status: 'true',
        });

        return { conflict: false, data: newAssistance };
    },

    update: async (id: string | undefined, updates: AssistanceCreationAttributes) => {
        if (!id) return { notFound: true };

        const assistance = await AssistanceRepository.findByPk(id);
        if (!assistance) return { notFound: true };

        const updated = await AssistanceRepository.update(assistance, {
            ...updates,
            update_of: new Date(),
        });

        return { notFound: false, data: updated };
    },

    toggleStatus: async (id: string | undefined) => {
        if (!id) return { notFound: true };

        const assistanceData = await AssistanceRepository.findByPk(id);
        const assistance = assistanceData?.dataValues;
        if (!assistance) return { notFound: true };

        const newStatus = assistance.status === 'true' ? 'false' : 'true';

        await AssistanceRepository.update(assistanceData, {
            status: newStatus,
            update_of: new Date(),
        });

        return {
            notFound: false,
            data: {
                id: assistance.id,
                name: assistance.name,
                status: newStatus,
            },
        };
    },

    search: async (organizationId: any, q: string, page: number, limit: number) => {
        const offset = (page - 1) * limit;

        const where: any = {
            status: 'true',
            name: { [Op.like]: `%${q}%` },
            organization_id: organizationId,
        };

        const { count, rows } = await AssistanceRepository.findAndCountAll(where, limit, offset);
        const totalPages = Math.ceil(count / limit);
        const overall = await AssistanceRepository.countOverview(organizationId);

        return {
            rows,
            pagination: {
                overall,
                total: count,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    },

    filter: async (organizationId: any, status: string, typeId: number | undefined, datePreset: string, page: number, limit: number) => {
        const offset = (page - 1) * limit;

        const where: any = {
            organization_id: organizationId,
        };

        if (status === "true" || status === "false") {
            where.status = status;
        }

        if (typeId && typeId > 0) {
            where.assistance_id = typeId;
        }

        if (datePreset && datePreset !== "all") {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            where.date_of = {};

            switch (datePreset) {
                case "today":
                    where.date_of[Op.gte] = today;
                    where.date_of[Op.lt] = new Date(today.getTime() + 24 * 60 * 60 * 1000);
                    break;
                case "this_week":
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    where.date_of[Op.gte] = weekStart;
                    break;
                case "this_month":
                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    where.date_of[Op.gte] = monthStart;
                    break;
                case "this_year":
                    const yearStart = new Date(now.getFullYear(), 0, 1);
                    where.date_of[Op.gte] = yearStart;
                    break;
            }
        }

        const { count, rows } = await AssistanceRepository.findAndCountAll(where, limit, offset);
        const totalPages = Math.ceil(count / limit);
        const overall = await AssistanceRepository.countOverview(organizationId);


        return {
            rows,
            pagination: {
                overall: overall,
                total: count,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    },
};


// ============================================================
// Assistance Type
// ============================================================

export const AssistanceTypeService = {

    fetchAll: async (organizationId: any) => {
        return AssistanceTypeRepository.findAll({ organization_id: organizationId });
    },

    fetchOne: async (id: string | undefined) => {
        if (!id) return null;
        return AssistanceTypeRepository.findByPk(id);
    },

    create: async (input: any, organizationId: any) => {
        const typesToCreate: AssistanceTypeCreationAttributes[] = Array.isArray(input) ? input : [input];

        if (typesToCreate.length === 0) {
            return { empty: true };
        }

        const getKey = (name: any, unit: any) =>
            `${(name ?? '').toString().toLowerCase().trim()}|${(unit ?? '').toString().toLowerCase().trim()}`;

        const validationErrors: { index: number; message: string }[] = [];
        const validTypes: AssistanceTypeCreationAttributes[] = [];

        typesToCreate.forEach((body, index) => {
            const name = typeof body.name === 'string' ? body.name.trim() : '';
            const unit = typeof body.unit === 'string' ? body.unit.trim() : '';

            if (name === '' || unit === '') {
                validationErrors.push({ index, message: 'fields_required' });
            } else {
                validTypes.push({ name, unit, organization_id: organizationId });
            }
        });

        if (validationErrors.length > 0) {
            return { validationErrors };
        }

        const namesUnits = validTypes.map(t => getKey(t.name, t.unit));

        const existingTypes = await AssistanceTypeRepository.findExisting(organizationId, validTypes);

        const existingKeys = new Set(
            existingTypes.map(t => getKey(t.get('name'), t.get('unit')))
        );

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
            return { conflicts };
        }

        const newTypes = await AssistanceTypeRepository.bulkCreate(validTypes);
        return { data: newTypes };
    },

    update: async (id: string | undefined, updates: AssistanceTypeAttributes) => {
        if (!id) return { notFound: true };

        const type = await AssistanceTypeRepository.findByPk(id);
        if (!type) return { notFound: true };

        const updated = await AssistanceTypeRepository.update(type, updates);
        return { notFound: false, data: updated };
    },

    delete: async (id: string | undefined) => {
        if (!id) return { notFound: true };

        const type = await AssistanceTypeRepository.findByPk(id);
        if (!type) return { notFound: true };

        await AssistanceTypeRepository.delete(type);
        return { notFound: false };
    },
};