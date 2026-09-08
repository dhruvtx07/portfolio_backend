'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_dashboard_roles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users', // Assuming the name of the referenced table is 'users'
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
    await queryInterface.addConstraint('user_dashboard_roles', {
      fields: ['user_id', 'role_id'],
      type: 'unique',
      name: 'unique_user_role' // Optional: specify a custom name for the unique constraint
    });
  },
  async down(queryInterface, Sequelize) {
    // Remove the unique constraint
    await queryInterface.removeConstraint('user_dashboard_roles', 'unique_user_role');

    // Drop the table
    await queryInterface.dropTable('user_dashboard_roles');
  }
};
