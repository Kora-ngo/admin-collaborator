import { type QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('reports', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        uid: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        project_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'projects', key: 'id' },
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION',
        },
        organization_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'organisation', key: 'id' },
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION',
        },
        type: {
            type: DataTypes.ENUM('DATA_PACKAGE', 'BENEFICIARIES', 'ASSISTANCE', 'ANALYTICS', 'DONOR_REPORT'),
            allowNull: false,
        },
        format: {
            type: DataTypes.ENUM('ZIP', 'XLSX', 'PDF'),
            allowNull: false,
        },
        reporting_period_from: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        reporting_period_to: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        generated_by: {
            type: DataTypes.INTEGER, // membership.id — actor context, consistent with rest of schema
            allowNull: false,
            references: { model: 'membership', key: 'id' },
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION',
        },
        generated_at: {
            type: DataTypes.DATE,
            allowNull: true, // null while status is PENDING/PROCESSING
        },
        status: {
            // stored as plain string, same convention as data_operations.status
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'PENDING',
        },
        file_type: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'general',
        },
        file_path: {
            type: DataTypes.STRING(500),
            allowNull: true, // null until generation completes
        },
        file_size: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    });

    await queryInterface.addIndex('reports', ['project_id'], { name: 'project_id_idx' });
    await queryInterface.addIndex('reports', ['organization_id'], { name: 'organization_id_idx' });
    await queryInterface.addIndex('reports', ['generated_by'], { name: 'generated_by_idx' });
};

export const down = async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('reports');
};