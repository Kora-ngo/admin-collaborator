'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Expand the ENUM to include 'false'
      await queryInterface.sequelize.query(`
        ALTER TABLE deliveries
        MODIFY COLUMN review_status ENUM('pending', 'approved', 'rejected', 'false')
        NOT NULL DEFAULT 'pending';
      `, { transaction });

      // Optional: If you want to auto-set invalid/old statuses to 'false'
      // (uncomment if needed)
      // await queryInterface.sequelize.query(`
      //   UPDATE deliveries 
      //   SET review_status = 'false' 
      //   WHERE review_status NOT IN ('pending', 'approved', 'rejected');
      // `, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Revert: remove 'false' from ENUM
      await queryInterface.sequelize.query(`
        ALTER TABLE deliveries
        MODIFY COLUMN review_status ENUM('pending', 'approved', 'rejected')
        NOT NULL DEFAULT 'pending';
      `, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};