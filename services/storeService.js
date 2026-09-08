const { Store, User, StoreProductGroup, StoreProduct, OrderItem, Settings, Payment } = require('../models');
const { getUserAdminIdFromToken, getUserCurrentRoleFromToken } = require('../utils/authUtils');

const { Op, fn, col, where, cast } = require('sequelize');

const bcrypt = require('bcryptjs');

const emailTemplateService = require('./emailTemplateService');
const { sendStoreStatusChangeEmail } = require('../utils/emailUtils');


class StoreService {
  async createStore(req) {
    const { user_storeowner_id, email, first_name, last_name, store_name, store_description, slug, logo, commission_rate, status, studio_organization_name } = req.body;
    try {
      const token = req.header('Authorization')?.split(' ')[1];
      let modified_by_user_id;
      if(token){
        modified_by_user_id = getUserAdminIdFromToken(req);
      }
      modified_by_user_id = user_storeowner_id;
      const commissionSetting  = await Settings.findOne({ where: { key_name: "Stores_default_commission" } });
      const rate = parseFloat(commissionSetting ?.value);
      const result = await Store.create({
        user_storeowner_id,
        name: store_name,
        description: store_description ?? null,
        studio_organization_name: studio_organization_name ?? null,
        slug: slug ?? null,
        logo: logo ?? null,
        commission_rate: commission_rate ?? rate ?? null,
        modified_by_user_id,
        status: status ?? 0,
      });

      //send email to store owner and admin for store signup
      emailTemplateService.sendStoreSignupEmails({
        user_email: email,
        user_first_name:  first_name,
        user_last_name: last_name,
        storename: result.name,
        storeid: result.id
      });
      return { success: true, store: result, message: 'Store created successfully' };

    } catch (error) {
      console.error('Error in createStoreService: ', error);
      throw {
        statusCode: 400,
        isOperational: true,
        message: 'Error in createStoreService: ' + (error?.message || ''),
        stack: `${error?.stack || ''}\n\n\n${JSON.stringify(error, null, 2)}`,
      };
    }
  }

  async getAllStores(req) {
    try {
      const loggedin_user_id = getUserAdminIdFromToken(req);
      const role_id = getUserCurrentRoleFromToken(req);

      const whereCondition = role_id === 1 ? {} : { user_storeowner_id: loggedin_user_id };

      const limit = parseInt(process.env.PAGINATION_LIMIT_SIZE) || (parseInt(req.query.limit) ? parseInt(req.query.limit) : 10);
      const cursorStr = req.query.cursor;

      const queryWhere = { ...whereCondition };

      if (cursorStr) {
        try {
          const decoded = JSON.parse(Buffer.from(cursorStr, 'base64').toString('ascii'));
          if (decoded && decoded.createdAt && decoded.id) {
            queryWhere[Op.or] = [
              {
                createdAt: {
                  [Op.lt]: new Date(decoded.createdAt)
                }
              },
              {
                createdAt: new Date(decoded.createdAt),
                id: {
                  [Op.lt]: decoded.id
                }
              }
            ];
          }
        } catch (e) {
          console.log('getAllStores: Invalid cursor format');
        }
      }

      const stores = await Store.findAll({
        where: queryWhere,
        include: [
          {
            model: User,
            as: 'store_owner',
            attributes: ['first_name', 'last_name', 'email', 'address'],
          }
        ],
        order: [['createdAt', 'DESC'], ['id', 'DESC']],
        limit: limit + 1,
      });

      const hasNextPage = stores.length > limit;
      const paginatedStores = hasNextPage ? stores.slice(0, limit) : stores;

      let nextCursor = null;
      if (hasNextPage && paginatedStores.length > 0) {
        const lastItem = paginatedStores[paginatedStores.length - 1];
        nextCursor = Buffer.from(JSON.stringify({
          createdAt: lastItem.createdAt,
          id: lastItem.id
        })).toString('base64');
      }

      return {
        success: true,
        stores: paginatedStores,
        message: 'Stores fetched successfully',
        pagination: {
          next_cursor: nextCursor,
          has_more: hasNextPage,
          limit
        }
      };

    } catch (error) {
      console.error('Error in getAllStoresService: ', error);
      throw {
        statusCode: 400,
        isOperational: true,
        message: 'Error in getAllStoresService: ' + (error?.message || ''),
        stack: `${error?.stack || ''}\n\n\n${JSON.stringify(error, null, 2)}`,
      };
    }
  }

  async searchStores(req) {
    try {
      const loggedin_user_id = getUserAdminIdFromToken(req);
      const role_id = getUserCurrentRoleFromToken(req);
      const searchQuery = req.query.term || req.query.search;

      let whereCondition = role_id === 1 ? {} : { user_storeowner_id: loggedin_user_id };

      if (searchQuery && searchQuery.trim()) {
        const tokens = searchQuery.trim().split(/\s+/).filter(Boolean);
        const tokenConditions = tokens.map((token) => {
          const searchWildcard = `%${token}%`;
          
          return {
            [Op.or]: [
              { name: { [Op.like]: searchWildcard } },
              { studio_organization_name: { [Op.like]: searchWildcard } },
              where(col('store_owner.first_name'), { [Op.like]: searchWildcard }),
              where(col('store_owner.last_name'), { [Op.like]: searchWildcard }),
              where(
                fn('CONCAT_WS', ' ', col('store_owner.first_name'), col('store_owner.last_name')),
                { [Op.like]: searchWildcard }
              ),
            ],
          };
        });

        whereCondition = {
          ...whereCondition,
          [Op.and]: tokenConditions,
        };
      }

      const stores =   await Store.findAll({
        where: whereCondition,
        include: [
          {
            model: User,
            as: 'store_owner',
            attributes: ['first_name', 'last_name', 'email', 'address'],
          },
        ],
        group: [
          'Store.id',
          'store_owner.id',
          'store_owner.first_name',
          'store_owner.last_name',
          'store_owner.email',
        ],
        order: [['createdAt', 'DESC']],
      });

      return { success: true, stores, message: 'Stores searched successfully' };

    } catch (error) {
      console.error('Error in searchStoresService: ', error);
      throw {
        statusCode: 400,
        isOperational: true,
        message: 'Error in searchStoresService: ' + (error?.message || ''),
        stack: `${error?.stack || ''}\n\n\n${JSON.stringify(error, null, 2)}`,
      };
    }
  }

  async getStorefrontById(req) {
    const id = req.params.id;
    try {
      const store = await Store.findOne({
        where: { id },
        include: [
          {
            model: User,
            as: 'store_owner',
            attributes: ['first_name', 'last_name'],
          },
          {
            model: StoreProductGroup,
            as: 'productgroups',
            required: false,
            include: [
              {
                model: StoreProduct,
                as: 'products',
                required: false,
              },
            ],
          },
        ],
        order: [
          [{ model: StoreProductGroup, as: 'productgroups' }, { model: StoreProduct, as: 'products' }, 'sort_order', 'ASC'],
        ],
        rejectOnEmpty: Object.assign(new Error('Store not found.'), { isOperational: true, statusCode: 400 })
      });

      const storeJson = store.toJSON();
      storeJson.productgroups = storeJson.productgroups.map(group => ({
        ...group,
        products: group.products.map(({ id, shopify_product_id, sort_order, option_selections }) => {
          const selections = typeof option_selections === 'string'
            ? JSON.parse(option_selections)
            : (option_selections || []);
          const variant_ids = [];
          for (const opt of selections) {
            for (const val of (opt.values || [])) {
              if (val.selected) variant_ids.push(...(val.variant_ids || []));
            }
          }
          return { id, shopify_product_id, sort_order, variant_ids };
        }),
      }));
      const settings = await Settings.findOne({ where: { key_name: 'static_pages' } });
      const staticPages = settings ? JSON.parse(settings.value) : {};
      

      return { success: true, store: storeJson, settings: staticPages, message: 'Store fetched successfully' };

    } catch (error) {
      console.error('Error in getStorefrontByIdService: ', error);
      throw {
        statusCode: error?.statusCode || 400,
        isOperational: true,
        message: 'Error in getStorefrontByIdService: ' + (error?.message || ''),
        stack: `${error?.stack || ''}\n\n\n${JSON.stringify(error, null, 2)}`,
      };
    }
  }

  async updateStore(req) {
    const id = req.params.id;
    const { user_storeowner_id, name, description, slug, studio_organization_name, logo, commission_rate, status, first_name, last_name, email, address, password } = req.body;
    try {
      const loggedin_user_id = getUserAdminIdFromToken(req);
      const role_id = getUserCurrentRoleFromToken(req);

      const whereCondition = role_id === 1
        ? { id }
        : { id, user_storeowner_id: loggedin_user_id };

      const store = await Store.findOne({
        where: whereCondition,
        rejectOnEmpty: Object.assign(new Error('Store not found or you are not authorised to update this store.'), { isOperational: true, statusCode: 400 })
      });

      await store.update({
        user_storeowner_id,
        name,
        description: description ?? null,
        studio_organization_name,
        slug,
        logo,
        commission_rate,
        status,
        modified_by_user_id: loggedin_user_id,
      });

      const ownerId = user_storeowner_id ?? store.user_storeowner_id;
      const userUpdates = {};
      if (first_name !== undefined) userUpdates.first_name = first_name;
      if (last_name !== undefined) userUpdates.last_name = last_name;
      if (email !== undefined) userUpdates.email = email;
      if(address !== undefined) userUpdates.address = address;
      if (password?.trim()) {
        const salt = await bcrypt.genSalt(10);
        userUpdates.password = await bcrypt.hash(password, salt);
      }

      if (Object.keys(userUpdates).length) {
        await User.update(userUpdates, { where: { id: ownerId } });
      }

      return { success: true, store, message: 'Store updated successfully' };

    } catch (error) {
      console.error('Error in updateStoreService: ', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors?.[0]?.path || 'field';
        throw {
          statusCode: 422,
          isOperational: true,
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} is already in use.`,
        };
      }

      throw {
        statusCode: error?.statusCode || 400,
        isOperational: true,
        message: 'Error in updateStoreService: ' + (error?.message || ''),
        stack: `${error?.stack || ''}\n\n\n${JSON.stringify(error, null, 2)}`,
      };
    }
  }
/*
  async deleteStore(req) {
    const id = req.params.id;
    try {
      const loggedin_user_id = getUserAdminIdFromToken(req);
      const role_id = getUserCurrentRoleFromToken(req);

      const whereCondition = role_id === 1
        ? { id }
        : { id, modified_by_user_id: loggedin_user_id };

      const store = await Store.findOne({
        where: whereCondition,
        rejectOnEmpty: Object.assign(new Error('Store not found or you are not authorised to delete this store.'), { isOperational: true, statusCode: 400 })
      });

      await store.destroy();

      return { success: true, id, message: 'Store deleted successfully' };

    } catch (error) {
      console.error('Error in deleteStoreService: ', error);
      throw {
        statusCode: error?.statusCode || 400,
        isOperational: true,
        message: 'Error in deleteStoreService: ' + (error?.message || ''),
        stack: `${error?.stack || ''}\n\n\n${JSON.stringify(error, null, 2)}`,
      };
    }
  }
*/
  async toggleStoreStatus(req) {
    const id = req.params.id;
    const newStatus = Number(req.body.status);
    try {
      const loggedin_user_id = getUserAdminIdFromToken(req);
      const role_id = getUserCurrentRoleFromToken(req);

      const whereCondition = role_id === 1 ? { id } : { id, user_storeowner_id: loggedin_user_id };

      const store = await Store.findOne({
        where: whereCondition,
        include: [{ model: User, as: 'store_owner', attributes: ['first_name', 'last_name', 'email'] }],
        rejectOnEmpty: Object.assign(new Error('Store not found'), { isOperational: true, statusCode: 404 })
      });

      if (newStatus === 1 && !(parseFloat(store.commission_rate) > 0)) {
        throw Object.assign(
          new Error('Store cannot be activated until a valid commission rate greater than 0 is set.'),
          { isOperational: true, statusCode: 422 }
        );
      }

      await store.update({
        status: newStatus,
        modified_by_user_id: loggedin_user_id,
      });

      const statusText = newStatus === 1 ? 'Activated' : 'Deactivated';

      //sending email to store owner - store activated email
      let htmlTemplate, subject;

      if(statusText === 'Activated'){
        ({ htmlTemplate, subject } = await emailTemplateService.getEmailTemplate('storeactivated'));
      }else{
        ({ htmlTemplate, subject } = await emailTemplateService.getEmailTemplate('storedeactivated'));
      }


      const storename = await emailTemplateService.toTitleCase(store.name);
      const fullname = `${await emailTemplateService.toTitleCase(store.store_owner.first_name)} ${await emailTemplateService.toTitleCase(store.store_owner.last_name)}`;
      const linkToUser = `${process.env.WEBSITE_URL}/login`;
    
      const emailData = {
        storename,
        storeid: store.id,
        fullname,
        link: linkToUser
      };
      const processedHtml = emailTemplateService.replacePlaceholders(htmlTemplate, emailData);
            
      await sendStoreStatusChangeEmail(store.store_owner.email, subject, processedHtml);

      return { success: true, store, subject };

    } catch (error) {
      console.error('Error in toggleStoreStatusService: ', error);
      throw {
        statusCode: error?.statusCode || 400,
        isOperational: true,
        message: 'Error in toggleStoreStatusService: ' + (error?.message || ''),
        stack: `${error?.stack || ''}\n\n\n${JSON.stringify(error, null, 2)}`,
      };
    }
  }

  async uploadStoreLogo(req) {
    const id = req.params.id;
    try {
      if (!req.file) throw Object.assign(
        new Error('No image file uploaded'),
        { isOperational: true, statusCode: 400 }
      );

      const loggedin_user_id = getUserAdminIdFromToken(req);
      const role_id = getUserCurrentRoleFromToken(req);

      const whereCondition = role_id === 1
        ? { id }
        : { id, user_storeowner_id: loggedin_user_id };

      const logo_url = `/${process.env.UPLOAD_STORE_LOGO}/${req.file.filename}`

      await Store.update(
        { logo: logo_url, modified_by_user_id: loggedin_user_id },
        { where: whereCondition }
      );

      return { success: true, id, logo: logo_url };
    } catch (error) {
      throw {
        statusCode: error?.statusCode || 400,
        isOperational: true,
        message: 'Error in uploadStoreLogoService: ' + (error?.message || ''),
        stack: error?.stack || '',
      };
    }
  }

  async calculateCommission(req) {
    const { id } = req.params;
    try {
      const store = await Store.findOne({
        where: { id },
        include: [
          {
            model: User,
            as: 'store_owner',
            attributes: ['first_name', 'last_name'],
          },
        ],
        rejectOnEmpty: Object.assign(new Error('Store not found.'), { isOperational: true, statusCode: 404 }),
      });

      const modified_by_user_id = getUserAdminIdFromToken(req);
      const allStores = await Store.findAll({ where: { user_storeowner_id: modified_by_user_id }, attributes: ['id', 'name', 'status'] });

      const owner = store.store_owner;

      const currentStore = {
        store_name: store.name,
        status: store.status,
        username: owner ? `${owner.first_name} ${owner.last_name}`.trim() : null,
        commission_rate: store.commission_rate,
        store_image: store.logo,
        commission_earned: parseFloat(store.commission_earned || 0),
        commission_paid: parseFloat(store.commission_paid || 0),
        commission_refunded: parseFloat(store.commission_refunded || 0),
        commission_outstanding: parseFloat(store.commission_outstanding || 0),
        payment_state: store.payment_state,
      }

      return {
        success: true,
        currentStore,
        allStores
      };
    } catch (error) {
      console.error('Error in calculateCommission: ', error);
      throw {
        statusCode: error?.statusCode || 400,
        isOperational: true,
        message: 'Error in calculateCommission: ' + (error?.message || ''),
        stack: error?.stack || '',
      };
    }
  }
/*
  async updateStorePaymentState(req) {
    const id = req.params.id;
    const { payment_state } = req.body;
    try {
      const loggedin_user_id = getUserAdminIdFromToken(req);
      const role_id = getUserCurrentRoleFromToken(req);

      if(role_id !== 1) {
        throw { statusCode: 403, isOperational: true, message: 'Access Denied.' };
      }

      const store = await Store.findOne({
        where: {id},
        rejectOnEmpty: Object.assign(new Error('Store not found.'), { isOperational: true, statusCode: 400 })
      });

      await store.update({
        payment_state,
        modified_by_user_id: loggedin_user_id,
      });

      return { success: true, store, message: 'Store Payment State updated successfully' };

    } catch (error) {
      console.error('Error in updateStorePaymentState: ', error);

      throw {
        statusCode: error?.statusCode || 400,
        isOperational: true,
        message: 'Error in updateStorePaymentState: ' + (error?.message || ''),
        stack: `${error?.stack || ''}\n\n\n${JSON.stringify(error, null, 2)}`,
      };
    }
  }
*/
}

module.exports = new StoreService();