const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AdminUser, User } = require('../models');

class AuthService {
  /**
   * Admin authentication and access token generation
   * @param {Object} req - Express request object
   */
  async login(req) {
    const { email, password } = req.body;
    try {
      let user = null;

      if (AdminUser) {
        user = await AdminUser.findOne({ where: { email } });
      }

      // Fallback to legacy User model if AdminUser not found
      if (!user && User) {
        user = await User.findOne({ where: { email } });
      }

      if (!user) {
        throw {
          statusCode: 401,
          isOperational: true,
          message: 'Invalid email or password'
        };
      }

      const passwordHash = user.password_hash || user.password;
      if (!passwordHash) {
        throw {
          statusCode: 401,
          isOperational: true,
          message: 'Invalid email or password'
        };
      }

      const isMatch = await bcrypt.compare(password, passwordHash);
      if (!isMatch) {
        throw {
          statusCode: 401,
          isOperational: true,
          message: 'Invalid email or password'
        };
      }

      const role = user.role || 'admin';
      const secretKey = process.env.JWT_SECRETKEY;
      const expiresIn = process.env.JWT_EXPIRE || '24h';

      const accessToken = jwt.sign(
        {
          user_id: user.id,
          email: user.email,
          logged_in_user_role: role
        },
        secretKey,
        { expiresIn }
      );

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: role
        }
      };
    } catch (error) {
      if (error?.statusCode === 401) {
        throw error;
      }
      console.error('Error in authLoginService: ', error);
      throw {
        statusCode: error?.statusCode || 400,
        isOperational: true,
        message: 'Error in authLoginService: ' + (error?.message || ''),
        stack: `${error?.stack || ''}\n\n\n${JSON.stringify(error, null, 2)}`,
      };
    }
  }
}

module.exports = new AuthService();
