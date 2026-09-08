const { sequelize, User, Role, UserDashboardRoles } = require('./models');

const bcrypt = require('bcryptjs');

async function seedRolesAndAdmins() {
  try {
    console.log('Seeding roles...');
    const adminRole = await Role.create({ id: 1, role_name: 'admin' });
    const store_ownerRole = await Role.create({ id: 2, role_name: 'store_owner' });
    const customerRole = await Role.create({ id: 3, role_name: 'customer' });

    console.log('Roles created successfully.');
    
    console.log('Seeding users...');
    const adminUser1 = await User.create({
      id: '1',
      first_name: 'admin1',
      last_name: 'admin1',
      email: process.env.ADMIN_EMAIL,
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
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

async function seedStaticPageSettings() {
  await sequelize.query(`
    INSERT INTO settings (key_name, value, data_type, description, createdAt, updatedAt)
    VALUES
      ('static_pages', '{"store.justforkix.com-homepage-header":159467864383, "store.justforkix.com-homepage-footer":159467897151, "store.justforkix.com-homepage-body":159414157631, "store.justforkix.com-storefront-header":159413633343, "store.justforkix.com-storefront-footer":159413666111}','json', 'static shopify pages for header and footer for storefront', NOW(), NOW())
    ON DUPLICATE KEY UPDATE updatedAt = NOW();
  `);
}

async function seedShopifySalesChannelId() {
  await sequelize.query(`
    INSERT INTO settings (id, key_name, value, data_type, description, createdAt, updatedAt)
    VALUES
      (3, 'shopify_sales_channel_publication_id', 'gid://shopify/Publication/296210628927', 'string', 'Publication ID for Shopify Sales Channel: ', NOW(), NOW())
    ON DUPLICATE KEY UPDATE updatedAt = NOW();
  `);
}
/*
async function seedBalanceMismatchEmailTemplate() {

  const emailBody = `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding:24px 0; font-family: Arial, Helvetica, sans-serif;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #e5e7eb;">

        <!-- Header -->
        <tr>
          <td style="background-color:#dc2626; padding:20px 32px;">
            <span style="color:#ffffff; font-size:18px; font-weight:bold; vertical-align:middle; margin-left:8px;">
              Balance Reconciliation Mismatch Detected
            </span>
          </td>
        </tr>

        <!-- Store Info -->
        <tr>
          <td style="padding:16px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; border:1px solid #e5e7eb; border-radius:6px;">
              <tr>
                <td style="padding:16px 20px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr><td style="font-size:13px; color:#6b7280; padding-bottom:4px;">Store ID</td></tr>
                    <tr><td style="font-size:15px; color:#111827; font-weight:bold; padding-bottom:12px;">{{store_id}}</td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Payments Ledger -->
        <tr>
          <td style="padding:8px 32px 16px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr>
                <td colspan="2" style="font-size:14px; font-weight:bold; color:#111827; padding-bottom:10px;">
                  Payments Ledger
                </td>
              </tr>
              <tr>
                <td style="font-size:14px; color:#374151; padding:10px 0; border-top:1px solid #e5e7eb;">Total In (sum of all IN rows)</td>
                <td style="font-size:14px; color:#059669; font-weight:bold; text-align:right; padding:10px 0; border-top:1px solid #e5e7eb;">+\${{total_in}}</td>
              </tr>
              <tr>
                <td style="font-size:14px; color:#374151; padding:10px 0; border-top:1px solid #e5e7eb;">Total Out (sum of all OUT rows)</td>
                <td style="font-size:14px; color:#dc2626; font-weight:bold; text-align:right; padding:10px 0; border-top:1px solid #e5e7eb;">-\${{total_out}}</td>
              </tr>
              <tr>
                <td style="font-size:14px; color:#374151; padding:10px 0; border-top:1px solid #e5e7eb;">Total Refund (sum of all REFUND rows)</td>
                <td style="font-size:14px; color:#dc2626; font-weight:bold; text-align:right; padding:10px 0; border-top:1px solid #e5e7eb;">-\${{total_refund}}</td>
              </tr>
              <tr>
                <td style="font-size:14px; color:#111827; font-weight:bold; padding:10px 0; border-top:1px solid #e5e7eb;">Computed Live Balance (In − Out − Refund)</td>
                <td style="font-size:14px; color:#111827; font-weight:bold; text-align:right; padding:10px 0; border-top:1px solid #e5e7eb;">\${{computed_balance}}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Store Snapshot -->
        <tr>
          <td style="padding:0px 32px 16px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr>
                <td colspan="2" style="font-size:14px; font-weight:bold; color:#111827; padding-bottom:10px;">
                  Store Snapshot (stores table columns)
                </td>
              </tr>
              <tr>
                <td style="font-size:14px; color:#374151; padding:10px 0; border-top:1px solid #e5e7eb;">Commission Earned</td>
                <td style="font-size:14px; color:#059669; font-weight:bold; text-align:right; padding:10px 0; border-top:1px solid #e5e7eb;">+\${{stores_earned}}</td>
              </tr>
              <tr>
                <td style="font-size:14px; color:#374151; padding:10px 0; border-top:1px solid #e5e7eb;">Commission Refunded</td>
                <td style="font-size:14px; color:#dc2626; font-weight:bold; text-align:right; padding:10px 0; border-top:1px solid #e5e7eb;">-\${{stores_refunded}}</td>
              </tr>
              <tr>
                <td style="font-size:14px; color:#374151; padding:10px 0; border-top:1px solid #e5e7eb;">Commission Paid</td>
                <td style="font-size:14px; color:#dc2626; font-weight:bold; text-align:right; padding:10px 0; border-top:1px solid #e5e7eb;">-\${{stores_paid}}</td>
              </tr>
              <tr>
                <td style="font-size:14px; color:#111827; font-weight:bold; padding:10px 0; border-top:1px solid #e5e7eb;">Commission Outstanding (Earned − Refunded − Paid)</td>
                <td style="font-size:14px; color:#111827; font-weight:bold; text-align:right; padding:10px 0; border-top:1px solid #e5e7eb;">\${{stores_outstanding}}</td>
              </tr>
              <tr>
                <td style="font-size:14px; color:#7f1d1d; padding:12px 0; border-top:2px solid #dc2626; font-weight:bold;">Mismatch Amount (Live Balance vs Outstanding)</td>
                <td style="font-size:16px; color:#7f1d1d; font-weight:bold; text-align:right; padding:12px 0; border-top:2px solid #dc2626;">\${{mismatch_amount}}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA Button -->
        <tr>
          <td style="padding:8px 32px 32px 32px;" align="center">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-radius:6px; background-color:#111827;">
                  <a href="{{link}}" target="_blank" style="display:inline-block; padding:12px 28px; font-size:14px; font-weight:bold; color:#ffffff; text-decoration:none; border-radius:6px;">
                    View Store Payments →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>`;

  await sequelize.query(
    `
      INSERT INTO email_templates
        (shopify_page_id, name, subject, email_body, type, createdAt, updatedAt)
      VALUES
        (NULL, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        email_body = VALUES(email_body),
        updatedAt = NOW();
    `,
    {
      replacements: [ "Balance Mismatch Email", "Balance Mismatch", emailBody, "balancemismatch",
      ],
    }
  );
}
*/
async function runSeed() {
  try {
    console.log('Starting seeding process...');

    await seedRolesAndAdmins();
    console.log('Roles and Admins seeded.');

    await seedModules();
    console.log('Modules seeded.');

    await seedModulesPermissionsToRoles();
    console.log('Modules permissions seeded.');

    await seedSettings();
    console.log('Settings table seeded');

    await seedEmailTemplate();
    console.log('Email templates seeded');

    await seedStaticPageSettings();
    console.log('Static page settings seeded.');

    await seedShopifySalesChannelId();
    console.log('Shopify sales channel ID seeded.');
/*
    await seedBalanceMismatchEmailTemplate();
    console.log('Balance mismatch email template seeded.');
*/
    console.log('Database seeding complete.');
  } catch (error) {
    console.error('Error during seeding:', error);
  }
}

// Running the seed function
runSeed();