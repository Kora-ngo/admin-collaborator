'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Step 1: Add 'false' to the ENUM type
      await queryInterface.sequelize.query(`
        ALTER TABLE beneficiaries
        MODIFY COLUMN review_status ENUM('pending', 'approved', 'rejected', 'false')
        NOT NULL DEFAULT 'pending';
      `, { transaction });

      // Optional step: If you want to set existing records to 'false' or something else
      // await queryInterface.sequelize.query(`
      //   UPDATE beneficiaries SET review_status = 'false' WHERE review_status NOT IN ('pending', 'approved', 'rejected');
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
        ALTER TABLE beneficiaries
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