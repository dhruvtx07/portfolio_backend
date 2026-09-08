const { Op } = require('sequelize');
const { sequelize, Session, Event, ContactMessage } = require('../models');

class AnalyticsService {
  /**
   * Helper to parse date filters into UTC date range
   */
  parseDateRange(from, to) {
    let startDate;
    let endDate;

    if (from) {
      startDate = new Date(from);
      if (isNaN(startDate.getTime())) {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }
    } else {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    if (to) {
      endDate = new Date(to);
      if (isNaN(endDate.getTime())) {
        endDate = new Date();
      } else if (to.length === 10) {
        endDate.setUTCHours(23, 59, 59, 999);
      }
    } else {
      endDate = new Date();
    }

    return { startDate, endDate };
  }

  /**
   * 4.1 Overall dashboard metrics
   * @param {Object} req - Express request object
   */
  async getOverview(req) {
    try {
      const { from, to } = req.query;
      const { startDate, endDate } = this.parseDateRange(from, to);

      const sessionWhere = {
        started_at: {
          [Op.between]: [startDate, endDate]
        }
      };

      const eventWhere = {
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      };

      const contactWhere = {
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      };

      // 1. Sessions count
      const sessionsCount = await Session.count({ where: sessionWhere });

      // 2. Unique visitors count
      const visitorsResult = await Session.findAll({
        where: sessionWhere,
        attributes: [[sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('visitor_id'))), 'unique_visitors']],
        raw: true
      });
      const visitorsCount = parseInt(visitorsResult[0]?.unique_visitors || 0, 10);

      // 3. Average session duration in seconds
      const durationResult = await Session.findAll({
        where: sessionWhere,
        attributes: [
          [
            sequelize.fn(
              'AVG',
              sequelize.fn(
                'TIMESTAMPDIFF',
                sequelize.literal('SECOND'),
                sequelize.col('started_at'),
                sequelize.fn('COALESCE', sequelize.col('ended_at'), sequelize.col('last_activity_at'))
              )
            ),
            'avg_duration'
          ]
        ],
        raw: true
      });
      const avgDurationSeconds = Math.round(parseFloat(durationResult[0]?.avg_duration || 0));

      // 4. Page Views
      const pageViewsCount = await Event.count({
        where: {
          ...eventWhere,
          type: 'page_view'
        }
      });

      // 5. Project Views
      const projectViewsCount = await Event.count({
        where: {
          ...eventWhere,
          type: 'project_view'
        }
      });

      // 6. Resume Downloads
      const resumeDownloadsCount = await Event.count({
        where: {
          ...eventWhere,
          type: 'resume_download'
        }
      });

      // 7. Contact messages count
      const contactMessagesCount = await ContactMessage.count({ where: contactWhere });

      return {
        visitors: visitorsCount,
        sessions: sessionsCount,
        pageViews: pageViewsCount,
        avgSessionDuration: avgDurationSeconds,
        projectViews: projectViewsCount,
        resumeDownloads: resumeDownloadsCount,
        contactMessages: contactMessagesCount
      };
    } catch (error) {
      console.error('Error in getOverviewService: ', error);
      throw {
        statusCode: error?.statusCode || 400,
        isOperational: true,
        message: 'Error in getOverviewService: ' + (error?.message || ''),
        stack: `${error?.stack || ''}\n\n\n${JSON.stringify(error, null, 2)}`,
      };
    }
  }

  /**
   * 4.2 Page-wise analytics
   * @param {Object} req - Express request object
   */
  async getPages(req) {
    try {
      const { from, to, page } = req.query;
      const { startDate, endDate } = this.parseDateRange(from, to);

      const whereClause = {
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      };

      if (page) {
        whereClause.page = page;
      }

      const pages = await Event.findAll({
        where: whereClause,
        attributes: [
          'page',
          [sequelize.fn('COUNT', sequelize.col('Event.id')), 'views'],
          [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('session.visitor_id'))), 'uniqueVisitors']
        ],
        include: [
          {
            model: Session,
            as: 'session',
            attributes: []
          }
        ],
        group: ['page'],
        order: [[sequelize.literal('views'), 'DESC']],
        raw: true
      });

      return pages.map(item => ({
        page: item.page,
        views: parseInt(item.views, 10),
        uniqueVisitors: parseInt(item.uniqueVisitors, 10)
      }));
    } catch (error) {
      console.error('Error in getPagesService: ', error);
      throw {
        statusCode: error?.statusCode || 400,
        isOperational: true,
        message: 'Error in getPagesService: ' + (error?.message || ''),
        stack: `${error?.stack || ''}\n\n\n${JSON.stringify(error, null, 2)}`,
      };
    }
  }

  /**
   * 4.3 Tracked event types
   * @param {Object} req - Express request object
   */
  async getEvents(req) {
    try {
      const { from, to, type } = req.query;
      const { startDate, endDate } = this.parseDateRange(from, to);

      const whereClause = {
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      };

      if (type) {
        whereClause.type = type;
      }

      const events = await Event.findAll({
        where: whereClause,
        attributes: [
          'type',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['type'],
        order: [[sequelize.literal('count'), 'DESC']],
        raw: true
      });

      return events.map(item => ({
        type: item.type,
        count: parseInt(item.count, 10)
      }));
    } catch (error) {
      console.error('Error in getEventsService: ', error);
      throw {
        statusCode: error?.statusCode || 400,
        isOperational: true,
        message: 'Error in getEventsService: ' + (error?.message || ''),
        stack: `${error?.stack || ''}\n\n\n${JSON.stringify(error, null, 2)}`,
      };
    }
  }

  /**
   * 4.4 Device / Browser / OS breakdown
   * @param {Object} req - Express request object
   */
  async getDevices(req) {
    try {
      const { from, to, device } = req.query;
      const { startDate, endDate } = this.parseDateRange(from, to);

      const whereClause = {
        started_at: {
          [Op.between]: [startDate, endDate]
        }
      };

      if (device) {
        whereClause.device_type = device;
      }

      // Devices
      const devicesRaw = await Session.findAll({
        where: whereClause,
        attributes: [
          ['device_type', 'type'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['device_type'],
        order: [[sequelize.literal('count'), 'DESC']],
        raw: true
      });

      // Browsers
      const browsersRaw = await Session.findAll({
        where: whereClause,
        attributes: [
          ['browser', 'name'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['browser'],
        order: [[sequelize.literal('count'), 'DESC']],
        raw: true
      });

      // Operating Systems
      const osRaw = await Session.findAll({
        where: whereClause,
        attributes: [
          ['os', 'name'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['os'],
        order: [[sequelize.literal('count'), 'DESC']],
        raw: true
      });

      return {
        devices: devicesRaw.map(d => ({ type: d.type || 'desktop', count: parseInt(d.count, 10) })),
        browsers: browsersRaw.map(b => ({ name: b.name || 'Unknown', count: parseInt(b.count, 10) })),
        operatingSystems: osRaw.map(o => ({ name: o.name || 'Unknown', count: parseInt(o.count, 10) }))
      };
    } catch (error) {
      console.error('Error in getDevicesService: ', error);
      throw {
        statusCode: error?.statusCode || 400,
        isOperational: true,
        message: 'Error in getDevicesService: ' + (error?.message || ''),
        stack: `${error?.stack || ''}\n\n\n${JSON.stringify(error, null, 2)}`,
      };
    }
  }

  /**
   * 4.5 Referrer / Traffic source analytics
   * @param {Object} req - Express request object
   */
  async getReferrers(req) {
    try {
      const { from, to, source } = req.query;
      const { startDate, endDate } = this.parseDateRange(from, to);

      const whereClause = {
        started_at: {
          [Op.between]: [startDate, endDate]
        }
      };

      const sessions = await Session.findAll({
        where: whereClause,
        attributes: ['referrer'],
        raw: true
      });

      const sourceCounts = {};

      sessions.forEach(sess => {
        let src = 'direct';
        if (sess.referrer && typeof sess.referrer === 'string' && sess.referrer.trim().length > 0) {
          try {
            const parsed = new URL(sess.referrer);
            src = parsed.hostname.replace(/^www\./, '');
          } catch {
            src = sess.referrer.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '') || 'direct';
          }
        }

        sourceCounts[src] = (sourceCounts[src] || 0) + 1;
      });

      let results = Object.keys(sourceCounts).map(key => ({
        source: key,
        count: sourceCounts[key]
      })).sort((a, b) => b.count - a.count);

      if (source) {
        results = results.filter(r => r.source.toLowerCase().includes(source.toLowerCase()));
      }

      return results;
    } catch (error) {
      console.error('Error in getReferrersService: ', error);
      throw {
        statusCode: error?.statusCode || 400,
        isOperational: true,
        message: 'Error in getReferrersService: ' + (error?.message || ''),
        stack: `${error?.stack || ''}\n\n\n${JSON.stringify(error, null, 2)}`,
      };
    }
  }
}

module.exports = new AnalyticsService();
