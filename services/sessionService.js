const crypto = require('crypto');
const { Visitor, Session } = require('../models');
const { getClientIp, getGeoDetails, parseUserAgent } = require('./locationService');

class SessionService {
  /**
   * Create visitor session with MaxMind GeoIP and device parsing
   * @param {Object} req - Express request object
   */
  async createSession(req) {
    const { visitorId, landingPage, referrer } = req.body;
    try {
      const ip = getClientIp(req);
      const userAgent = req.headers['user-agent'] || '';

      // MaxMind GeoLite2 lookup
      const geo = await getGeoDetails(ip);

      // User-Agent breakdown
      const { deviceType, browser, os } = parseUserAgent(userAgent);

      const now = new Date();

      // 1. Find or create visitor
      const [visitor, created] = await Visitor.findOrCreate({
        where: { visitor_uuid: visitorId },
        defaults: {
          visitor_uuid: visitorId,
          first_seen_at: now,
          last_seen_at: now
        }
      });

      if (!created) {
        await visitor.update({ last_seen_at: now });
      }

      // 2. Generate clean session ID
      const sessionId = `sess_${crypto.randomBytes(8).toString('hex')}`;
      const cleanLandingPage = landingPage || '/';

      // 3. Create session row
      const session = await Session.create({
        session_uuid: sessionId,
        visitor_id: visitor.id,
        started_at: now,
        ended_at: null,
        last_activity_at: now,
        landing_page: cleanLandingPage,
        last_page: cleanLandingPage,
        referrer: referrer || null,
        ip_address: ip,
        user_agent: userAgent,
        country: geo.country,
        city: geo.city,
        device_type: deviceType,
        browser: browser,
        os: os
      });

      return {
        sessionId: session.session_uuid,
        visitorId: visitor.visitor_uuid,
        startedAt: session.started_at
      };
    } catch (error) {
      console.error('Error in createSessionService: ', error);
      throw {
        statusCode: error?.statusCode || 400,
        isOperational: true,
        message: 'Error in createSessionService: ' + (error?.message || ''),
        stack: `${error?.stack || ''}\n\n\n${JSON.stringify(error, null, 2)}`,
      };
    }
  }

  /**
   * Update session activity and last page / ended at
   * @param {Object} req - Express request object
   */
  async updateSession(req) {
    const { sessionId } = req.params;
    const { lastPage, endedAt } = req.body;

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

      const updates = {
        last_activity_at: new Date()
      };

      if (lastPage !== undefined && lastPage !== null) {
        updates.last_page = lastPage;
      }

      if (endedAt !== undefined) {
        updates.ended_at = endedAt ? new Date(endedAt) : null;
      }

      await session.update(updates);

      return {
        sessionId: session.session_uuid,
        endedAt: session.ended_at
      };
    } catch (error) {
      console.error('Error in updateSessionService: ', error);
      throw {
        statusCode: error?.statusCode || 400,
        isOperational: true,
        message: 'Error in updateSessionService: ' + (error?.message || ''),
        stack: `${error?.stack || ''}\n\n\n${JSON.stringify(error, null, 2)}`,
      };
    }
  }
}

module.exports = new SessionService();
