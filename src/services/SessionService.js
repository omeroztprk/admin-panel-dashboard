const Session = require('../models/SessionModel');
const paginate = require('../utils/Paginate');
const auditLogService = require('./AuditLogService');
const { ACTIONS, RESOURCES } = require('../utils/Constants');

const sessionService = {
  list: async (userId, options = {}) => {
    const baseQuery = { user: userId, expiresAt: { $gt: new Date() } };
    return paginate(Session, baseQuery, {
      ...options,
      select: '-__v'
    });
  },

  remove: async (sessionId, userId, currentUserId) => {
    try {
      const session = await Session.findOneAndDelete(
        { _id: sessionId, user: userId }
      );

      if (!session) {
        const err = new Error('Session not found or already revoked');
        err.statusCode = 404;
        throw err;
      }

      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.DELETE,
        resource: RESOURCES.SESSION,
        resourceId: sessionId,
        status: 'success'
      });

      return session;
    } catch (error) {
      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.DELETE,
        resource: RESOURCES.SESSION,
        resourceId: sessionId,
        status: 'failure'
      });
      throw error;
    }
  },

  removeAll: async (userId, currentUserId) => {
    try {
      const res = await Session.deleteMany(
        { user: userId }
      );

      if (!res.deletedCount) {
        const err = new Error('No sessions to delete');
        err.statusCode = 404;
        throw err;
      }

      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.DELETE,
        resource: RESOURCES.SESSION,
        status: 'success'
      });

      return { deleted: res.deletedCount };
    } catch (error) {
      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.DELETE,
        resource: RESOURCES.SESSION,
        status: 'failure'
      });
      throw error;
    }
  }
};

module.exports = sessionService;