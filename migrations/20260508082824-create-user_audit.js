'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('users_audit', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      users_id: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      user_admin_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      audit_action: {
        type: Sequelize.STRING,
        allowNull: true
      },
      timestamp: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    
    await queryInterface.sequelize.query(`
      CREATE TRIGGER users_trigger_update AFTER UPDATE ON users FOR EACH ROW
      BEGIN
        INSERT INTO users_audit (users_id, first_name, last_name, email, password, phone, address, state, status, user_admin_id, createdAt, updatedAt, audit_action, timestamp)
        VALUES
        (NEW.id, OLD.first_name, OLD.last_name, OLD.email, OLD.password, OLD.phone,OLD.address, OLD.state, OLD.status, OLD.user_admin_id, OLD.createdAt, OLD.updatedAt, "update", NOW());
      END;
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER users_trigger_delete AFTER DELETE ON users FOR EACH ROW
      BEGIN
        INSERT INTO users_audit (users_id, first_name, last_name, email, password, phone, address, state, status, user_admin_id, createdAt, updatedAt, audit_action, timestamp)
        VALUES
        (OLD.id, OLD.first_name, OLD.last_name, OLD.email, OLD.password, OLD.phone,OLD.address, OLD.state, OLD.status, OLD.user_admin_id, OLD.createdAt, OLD.updatedAt, "delete", NOW());
      END;
    `);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    //await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS users_trigger_insert;');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS users_trigger_update;');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS users_trigger_delete;');
    await queryInterface.dropTable('users_audit');
  }
};
