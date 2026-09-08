const { Session, Event } = require('../models');

class EventService {
  /**
   * Record an analytics event
   * @param {Object} req - Express request object
   */
  async recordEvent(req) {
    const { sessionId, type, page, metadata } = req.body;
    try {
      const session = await Session.findOne({
        where: { session_uuid: sessionId }
      });

      if (!session) {
        throw {
          statusCode: 404,
          isOperational: true,
          message: 'Session not found'
        };
      }

      const now = new Date();

      const event = await Event.create({
        session_id: session.id,
        type,
        page,
        metadata: metadata || null,
        created_at: now
      });

      // Update session's last activity and current page
      await session.update({
        last_activity_at: now,
        last_page: page
      });

      return {
        eventId: `evt_${event.id}`
      };
    } catch (error) {
      console.error('Error in recordEventService: ', error);
      throw {
        statusCode: error?.statusCode || 400,
        isOperational: true,
        message: 'Error in recordEventService: ' + (error?.message || ''),
        stack: `${error?.stack || ''}\n\n\n${JSON.stringify(error, null, 2)}`,
      };
    }
  }
}

module.exports = new EventService();
