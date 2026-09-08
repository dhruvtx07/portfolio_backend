const { Op } = require('sequelize');
const { User, ActivationLink } = require('../models');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailTemplateService = require('./emailTemplateService');
const { sendResetPasswordEmail } = require('../utils/emailUtils');

class UserService {

  async forgotPassword(req) {
    const { email } = req.body;
    try {
      const user = await User.findOne({
        where: { email },
        rejectOnEmpty: Object.assign(new Error('Invalid email address'), {
          isOperational: true, 
          statusCode: 400
        })
      });
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const forgotPasswordLinkExpiry = process.env.PASSWORD_RESET_LINK_MINS || 30;
      const expiresAt = new Date(Date.now() + forgotPasswordLinkExpiry * 60 * 1000);
      const expiresAtUTC = new Date(expiresAt.toUTCString());
      
      await ActivationLink.create({
        user_id: user.id,
        token: resetToken,
        expires_at: expiresAtUTC
      });

      // Fetch template and send email
      // const htmlTemplate = await emailTemplateService.getEmailTemplate('forgotpassword');
      const resetUrl = `${process.env.WEBSITE_URL}/reset-password?k=${resetToken}`;
      
      const fullname = `${await emailTemplateService.toTitleCase(user.first_name)} ${await emailTemplateService.toTitleCase(user.last_name)}`;
      const emailData = {
        fullname,
        password_reset_link: resetUrl,
      };

      const {htmlTemplate, subject} = await emailTemplateService.getEmailTemplate('forgotpassword');
      const processedHtml = emailTemplateService.replacePlaceholders(htmlTemplate, emailData);
      await sendResetPasswordEmail(user.email, subject, processedHtml);

      return { 
        success: true,
        message: 'Reset password link sent successfully'
      };

    } catch (error) {
      console.error('Error in forgotPassword: ', error);
      throw {
        statusCode: error?.statusCode || 400,
        isOperational: true,
        message: 'Error in forgotPassword: ' + (error?.message || ''),
        stack: `${error?.stack || ''}\n\n\n${JSON.stringify(error, null, 2)}`
      };
    }
  }

  async resetPassword(req) {
    const { token, password, confirm_password } = req.body;
    try {
      if (password !== confirm_password) {
        throw Object.assign(new Error('Passwords do not match'), { 
          isOperational: true, 
          statusCode: 400
        });
      }

      // Validate token
      const activationLink = await ActivationLink.findOne({
        where: {
          token,
          expires_at: { [Op.gt]: new Date() }
        },
        rejectOnEmpty: Object.assign(new Error('Invalid or expired reset link'), { 
          isOperational: true, 
          statusCode: 400
        })
      });

      // Update user password
      const user = await User.findByPk(activationLink.user_id);
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      // Expire the token
      const expiredAtUTC = new Date(new Date(Date.now() - 120000).toUTCString());
      activationLink.expires_at = expiredAtUTC;
      await activationLink.save();

      return { 
        success: true,
        message: 'Password reset successfully'
      };

    } catch (error) {
      console.error('Error in resetPassword: ', error);
      throw {
        statusCode: error?.statusCode || 400,
        isOperational: true,
        message: 'Error in resetPassword: ' + (error?.message || ''),
        stack: `${error?.stack || ''}\n\n\n${JSON.stringify(error, null, 2)}`
      };
    }
  }
  
}

module.exports = new UserService();