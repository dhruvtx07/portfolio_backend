'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('admin_users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'admin'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Indexes
    await queryInterface.addIndex('admin_users', ['email'], {
      unique: true,
      name: 'idx_admin_users_email'
    });
    await queryInterface.addIndex('admin_users', ['role'], {
      name: 'idx_admin_users_role'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('admin_users');
  }
};
