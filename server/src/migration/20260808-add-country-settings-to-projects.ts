import { type QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn('projects', 'country', {
        type: DataTypes.STRING(2),
        allowNull: true,
    });

    await queryInterface.addColumn('projects', 'settings', {
        type: DataTypes.TEXT('long'),
        allowNull: true,
    });
};

export const down = async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn('projects', 'settings');
    await queryInterface.removeColumn('projects', 'country');
};