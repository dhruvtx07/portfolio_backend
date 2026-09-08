const { ContactMessage } = require('../models');

class ContactMessageService {
  /**
   * Save a portfolio contact message
   * @param {Object} req - Express request object
   */
  async createContactMessage(req) {
    const { name, email, message } = req.body;
    try {
      const contact = await ContactMessage.create({
        name,
        email,
        message,
        status: 'unread'
      });

      return {
        messageId: `msg_${contact.id}`
      };
    } catch (error) {
      console.error('Error in createContactMessageService: ', error);
      throw {
        statusCode: error?.statusCode || 400,
        isOperational: true,
        message: 'Error in createContactMessageService: ' + (error?.message || ''),
        stack: `${error?.stack || ''}\n\n\n${JSON.stringify(error, null, 2)}`,
      };
    }
  }
}

module.exports = new ContactMessageService();
