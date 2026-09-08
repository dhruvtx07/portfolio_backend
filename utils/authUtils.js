const jwt = require('jsonwebtoken');

// Utility function to get user_admin_id from token
const getUserAdminIdFromToken = (req) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    const secretKey = process.env.JWT_SECRETKEY;
    if (!token || !secretKey) {
      throw new Error('Token or secret key is missing');
    }
    const decoded = jwt.verify(token, secretKey);
    return decoded.user_id;
  } catch (error) {
    throw new Error('Invalid token: ' + error.message);
  }
};

const getUserCurrentRoleFromToken = (req) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    const secretKey = process.env.JWT_SECRETKEY;
    if (!token || !secretKey) {
      throw new Error('Token or secret key is missing');
    }
    const decoded = jwt.verify(token, secretKey);
    return decoded.logged_in_user_role;
  } catch (error) {
    throw new Error('Invalid token: ' + error.message);
  }
};

// Utility function to get the client IP address
const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
};

module.exports = { getUserAdminIdFromToken, getUserCurrentRoleFromToken, getClientIp };