'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable('audit_logs', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        organisation_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        actor_membership_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        actor_role: {
          type: Sequelize.ENUM('admin', 'collaborator', 'enumerator'),
          allowNull: false,
        },
        action: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        entity_type: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        entity_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        batch_uid: {
          type: Sequelize.STRING(36),
          allowNull: true,
        },
        metadata: {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: {},
        },
        ip_address: {
          type: Sequelize.STRING(45),
          allowNull: true,
        },
        platform: {
          type: Sequelize.ENUM('web', 'mobile'),
          allowNull: false,
          defaultValue: 'web',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      }, { transaction });

      // === Useful Indexes ===
      await queryInterface.addIndex('audit_logs', ['organisation_id'], {
        name: 'audit_logs_organisation_id_idx',
        transaction
      });

      await queryInterface.addIndex('audit_logs', ['actor_membership_id'], {
        name: 'audit_logs_actor_membership_id_idx',
        transaction
      });

      await queryInterface.addIndex('audit_logs', ['action'], {
        name: 'audit_logs_action_idx',
        transaction
      });

      await queryInterface.addIndex('audit_logs', ['entity_type', 'entity_id'], {
        name: 'audit_logs_entity_idx',
        transaction
      });

      await queryInterface.addIndex('audit_logs', ['created_at'], {
        name: 'audit_logs_created_at_idx',
        transaction
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('audit_logs');
  }
};