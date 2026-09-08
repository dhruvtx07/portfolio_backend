const { sequelize, User, Role, UserDashboardRoles, } = require('./models');

const bcrypt = require('bcryptjs');

async function seedRolesAndAdmins() {
  try {
    console.log('Seeding roles...');
    const adminRole = await Role.create({ id: 1, role_name: 'admin' });
    
    console.log('Roles created successfully.');
    
    console.log('Seeding users...');
    const adminUser1 = await User.create({
      id: '1',
      first_name: 'admin1',
      last_name: 'admin1',
      email: process.env.ADMIN_LOGIN_EMAIL,
      password: await bcrypt.hash(process.env.ADMIN_LOGIN_PASSWORD, 10),
      status: 1,
      user_admin_id: 1,
    });
    await UserDashboardRoles.create({ user_id: adminUser1.id, role_id: adminRole.id });
    console.log('Users and roles seeded successfully.');
  } catch (error) {
    console.error('Error seeding data failed::', error);
  } finally {
    console.log('Seeding process complete.');
  }
}

/*

async function seedModules() {
  await sequelize.query(`
    INSERT INTO modules (id, title, url, status, createdAt, updatedAt)
    VALUES
      (1, 'Users', '/users', 1, NOW(), NOW()),
      (2, 'Stores', '/stores', 1, NOW(), NOW()),
      (3, 'Orders', '/orders', 1, NOW(), NOW()),
      (4, 'Commission', '/commission', 1, NOW(), NOW())
    ON DUPLICATE KEY UPDATE updatedAt = NOW();
  `);
}

async function seedModulesPermissionsToRoles() {
  await sequelize.query(`
    INSERT INTO modules_permissions (role_id, module_id, \`add\`, \`update\`, \`delete\`, \`view\`, user_admin_id, createdAt, updatedAt)
    VALUES
      (1, 1, 1, 1, 1, 1, 1, NOW(), NOW()),
      (1, 2, 1, 1, 1, 1, 1, NOW(), NOW()),
      (1, 3, 0, 0, 0, 1, 1, NOW(), NOW()),
      (1, 4, 1, 1, 1, 1, 1, NOW(), NOW()),

      (2, 2, 1, 1, 0, 1, 1, NOW(), NOW()),
      (2, 3, 0, 0, 0, 1, 1, NOW(), NOW()),
      (2, 4, 0, 0, 0, 1, 1, NOW(), NOW())
    ON DUPLICATE KEY UPDATE \`add\` = VALUES(\`add\`), \`update\` = VALUES(\`update\`), \`delete\` = VALUES(\`delete\`), \`view\` = VALUES(\`view\`), updatedAt = NOW();
  `);
}

async function seedSettings() {
  await sequelize.query(`
    INSERT INTO settings (id, key_name, value, data_type, description, createdAt, updatedAt)
    VALUES
      (1, 'Stores_default_commission', 15, 'number', 'default commission for store signup', NOW(), NOW())
    ON DUPLICATE KEY UPDATE updatedAt = NOW();
  `);
}

async function seedEmailTemplate() {
  await sequelize.query(`
    INSERT INTO email_templates (shopify_page_id, name, subject, type,  createdAt, updatedAt)
    VALUES
      ('158639620415', 'Store signup email', 'Store Signup', 'storesignup', NOW(), NOW()),
      ('158640734527', 'Store activated email', 'Your store has been activated!', 'storeactivated', NOW(), NOW()),
      ('159761793343', 'Store deactivated email', 'Your store has been deactivated!', 'storedeactivated', NOW(), NOW()),
      ('158640800063', 'forgot password email', 'Reset your password', 'forgotpassword', NOW(), NOW()),
      ('158642733375', 'Admin Store signup notify email', 'New store signup notification', 'storesignupadmin', NOW(), NOW())
    ON DUPLICATE KEY UPDATE updatedAt = NOW();
  `);
}

*/


async function runSeed() {
  try {
    console.log('Starting seeding process...');

    await seedRolesAndAdmins();
    console.log('Roles and Admins seeded.');
/*
    await seedModules();
    console.log('Modules seeded.');

    await seedModulesPermissionsToRoles();
    console.log('Modules permissions seeded.');

    await seedSettings();
    console.log('Settings table seeded');

    await seedEmailTemplate();
    console.log('Email templates seeded');
*/
    console.log('Database seeding complete.');
  } catch (error) {
    console.error('Error during seeding:', error);
  }
}

// Running the seed function
runSeed();