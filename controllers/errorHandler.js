const { ErrorLog } = require('../models'); // Adjust path to your Sequelize models
const nodemailer = require('nodemailer');
const { sendErrorEmail } = require('../utils/emailUtils');

const { sendResponse } = require('../utils/responseHelper');

const { getUserAdminIdFromToken, getClientIp } = require('../utils/authUtils');

//const { getUserAdminIdFromToken, getClientIp } = require('./authController');

const handleServerError = async (req, res, error, isCustomError = false) => {
  try {
    console.error(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

    let userId = '';
    if(req.headers['authorization']){
        userId= req?.headers?.['user-agent'] ? getUserAdminIdFromToken(req) : null;
        error.user_id = userId;
    }
    
    const ipAddress = req?.headers?.['user-agent'] ? getClientIp(req) : '0.0.0.0';
    const userAgent = req?.headers?.['user-agent'] || 'System';
    const requestPath = req?.originalUrl || '[GLOBAL ERROR]';
    const device = userAgent.includes('Mobile') ? 'Mobile' : 'Desktop';

    const isSequelizeUnique = error.name === 'SequelizeUniqueConstraintError';
    const isForeignKeyViolation = error.name === 'SequelizeForeignKeyConstraintError';

    const statusCode = isForeignKeyViolation
      ? 403
      : error.isOperational
        ? error.statusCode || 400
        : isSequelizeUnique
          ? 400
          : 500;

    const finalMessage = isForeignKeyViolation
      ? 'You are not authorized to perform this action.'
      : error.isOperational
        ? error.message
        : isSequelizeUnique
          ? `Fields ${error.errors.map(e => e.path).join(', ')} must be unique - ${error.errors.map(e => e.value).join(', ')}`
          : 'Internal server error';

    try {
      await ErrorLog.create({
        user_id: userId || null,
        error_code: statusCode,
        error_message: `${error.message} ${!error.isOperational ? '- ' + finalMessage : ''}`,
        error_stack: (error?.stack || 'No stack trace available') + (
          error?.details 
            ? ` | Error Details: ${JSON.stringify(error.details)}`
            : ''
        ),
        user_agent: userAgent || null,
        ip_address: ipAddress || null,
        ip_location: null,
        request_path: requestPath || null,
        device: device || null,
      });

      error.request_path = requestPath || null;
      error.ip_address = ipAddress || null;
      error.user_agent = userAgent || null;
      error.device = device || null;

      sendErrorEmail(`NS: Application Error handleServerError`, error);
    } catch (logError) {
      sendErrorEmail('NS: Application Error handling error: LOC-78', logError);
    }

    if (!res || res.headersSent || isCustomError) return;

    return sendResponse(res, statusCode, false, finalMessage, {
      error_message: error.message,
      error_stack: error.stack,
      details: error.details || null
    });

  } catch (unexpectedError) {
    sendErrorEmail('NS: Application unexpected error: LOC-75', unexpectedError);

    if (!isCustomError && res && !res.headersSent) {
      return sendResponse(res, 500, false, 'An unexpected error occurred while handling the error.', {
        error_message: unexpectedError.message,
        error_stack: unexpectedError.stack,
      });
    }
  }
};
const logServerError = async (req, error, customSubject = null) => {
  try {
    console.error(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

    let userId = '';
    if(req.headers['authorization']){
        userId= req?.headers?.['user-agent'] ? getUserAdminIdFromToken(req) : null;
        error.user_id = userId;
    }
    
    const ipAddress = req?.headers?.['user-agent'] ? getClientIp(req) : '0.0.0.0';
    const userAgent = req?.headers?.['user-agent'] || 'System';
    const requestPath = req?.originalUrl || '[GLOBAL ERROR]';
    const device = userAgent.includes('Mobile') ? 'Mobile' : 'Desktop';

    const isSequelizeUnique = error.name === 'SequelizeUniqueConstraintError';
    const isForeignKeyViolation = error.name === 'SequelizeForeignKeyConstraintError';

    const statusCode = isForeignKeyViolation
      ? 403
      : error.isOperational
        ? error.statusCode || 400
        : isSequelizeUnique
          ? 400
          : 500;

    const finalMessage = isForeignKeyViolation
      ? 'You are not authorized to perform this action.'
      : error.isOperational
        ? error.message
        : isSequelizeUnique
          ? `Fields ${error.errors.map(e => e.path).join(', ')} must be unique - ${error.errors.map(e => e.value).join(', ')}`
          : 'Internal server error';

    try {
      await ErrorLog.create({
        user_id: userId || null,
        error_code: statusCode,
        error_message: `${error.message} ${!error.isOperational ? '- ' + finalMessage : ''}`,
        error_stack: (error?.stack || 'No stack trace available') + (
          error?.details 
            ? ` | Error Details: ${JSON.stringify(error.details)}`
            : ''
        ),
        user_agent: userAgent || null,
        ip_address: ipAddress || null,
        ip_location: null,
        request_path: requestPath || null,
        device: device || null,
      });

      error.request_path = requestPath || null;
      error.ip_address = ipAddress || null;
      error.user_agent = userAgent || null;
      error.device = device || null;

      sendErrorEmail(`NS: ${customSubject}`, error);
    } catch (logError) {
      sendErrorEmail(`NS: ${customSubject}`, logError);
    }

  } catch (unexpectedError) {
    sendErrorEmail('NS: Application unexpected error: LOC-141..', unexpectedError);
  }
};
module.exports = { handleServerError, logServerError };