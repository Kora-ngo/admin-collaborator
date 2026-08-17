import { type QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('project_regions', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        project_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'projects', key: 'id' },
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION',
        },
        region: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    });

    await queryInterface.addIndex('project_regions', ['project_id'], {
        name: 'project_id_idx',
    });
};

export const down = async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('project_regions');
};