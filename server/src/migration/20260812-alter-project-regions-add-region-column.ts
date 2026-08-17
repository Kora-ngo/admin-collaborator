import { type QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
    // Rename the existing region column to code
    await queryInterface.renameColumn('project_regions', 'region', 'code');

    // Add a new column, named region, on the same table
    await queryInterface.addColumn('project_regions', 'region', {
        type: DataTypes.STRING(255),
        allowNull: true,
    });
};

export const down = async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn('project_regions', 'region');
    await queryInterface.renameColumn('project_regions', 'code', 'region');
};