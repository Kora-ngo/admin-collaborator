'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1. beneficiaries
      await queryInterface.createTable('beneficiaries', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        uid: {
          type: Sequelize.BIGINT,
          allowNull: false,
          unique: true,
        },
        project_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        family_code: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        head_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        phone: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        region: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        village: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        created_by_membership_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
        sync_source: {
          type: Sequelize.ENUM('web', 'mobile'),
          allowNull: false,
          defaultValue: 'web',
        },
        review_status: {
          type: Sequelize.ENUM('pending', 'approved', 'rejected'),
          allowNull: false,
          defaultValue: 'pending',
        },
        reviewed_by_membership_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        reviewed_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        review_note: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
      }, { transaction });

      // 2. beneficiary_members
      await queryInterface.createTable('beneficiary_members', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        beneficiary_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        full_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        gender: {
          type: Sequelize.ENUM('male', 'female', 'other'),
          allowNull: false,
        },
        date_of_birth: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        relationship: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      }, { transaction });

      // 3. deliveries
      await queryInterface.createTable('deliveries', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        uid: {
          type: Sequelize.BIGINT,
          allowNull: false,
          unique: true,
        },
        project_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        beneficiary_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        delivery_date: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        created_by_membership_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
        sync_source: {
          type: Sequelize.ENUM('web', 'mobile'),
          allowNull: false,
          defaultValue: 'web',
        },
        review_status: {
          type: Sequelize.ENUM('pending', 'approved', 'rejected'),
          allowNull: false,
          defaultValue: 'pending',
        },
        reviewed_by_membership_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        reviewed_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        review_note: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
      }, { transaction });

      // 4. delivery_items
      await queryInterface.createTable('delivery_items', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        delivery_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        assistance_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        quantity: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
      }, { transaction });

      // 5. sync_batches
      await queryInterface.createTable('sync_batches', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        uid: {
          type: Sequelize.BIGINT,
          allowNull: false,
          unique: true,
        },
        project_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        submitted_by_membership_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        submitted_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        status: {
          type: Sequelize.ENUM('pending', 'approved', 'rejected'),
          allowNull: false,
          defaultValue: 'pending',
        },
        reviewed_by_membership_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        reviewed_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        review_note: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sync_batches');
    await queryInterface.dropTable('delivery_items');
    await queryInterface.dropTable('deliveries');
    await queryInterface.dropTable('beneficiary_members');
    await queryInterface.dropTable('beneficiaries');
  }
};