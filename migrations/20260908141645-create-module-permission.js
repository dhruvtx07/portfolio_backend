'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('modules_permissions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles', // Assuming the name of the referenced table is 'roles'
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      module_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'modules', // Assuming the name of the referenced table is 'modules'
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      add: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      update: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      delete: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      view: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      user_admin_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add the unique constraint
    await queryInterface.addConstraint('modules_permissions', {
      fields: ['role_id', 'module_id'],
      type: 'unique',
      name: 'unique_role_module' // Optional: specify a custom name for the unique constraint
    });
  },
  async down(queryInterface, Sequelize) {
    // Remove the unique constraint
    await queryInterface.removeConstraint('modules_permissions', 'unique_role_module');

    // Drop the table
    await queryInterface.dropTable('modules_permissions');
  }
};
