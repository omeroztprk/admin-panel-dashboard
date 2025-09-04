const Session = require('../models/SessionModel');
const paginate = require('../utils/Paginate');
const auditLogService = require('./AuditLogService');
const { ACTIONS, RESOURCES } = require('../utils/Constants');

const sessionService = {
  list: async (userId, options = {}) => {
    const baseQuery = {
      user: userId,
      revokedAt: null,
      expiresAt: { $gt: new Date() }
    };
    return paginate(Session, baseQuery, {
      ...options,
      populate: 'user',
      select: '-__v'
    });
  },

  remove: async (sessionId, userId, currentUserId) => {
    try {
      const session = await Session.findOneAndUpdate(
        { _id: sessionId, user: userId, revokedAt: null },
        { $set: { revokedAt: new Date() } },
        { new: true }
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
      const res = await Session.updateMany(
        { user: userId, revokedAt: null },
        { $set: { revokedAt: new Date() } }
      );

      if (res.modifiedCount === 0) {
        const err = new Error('No active sessions to revoke');
        err.statusCode = 404;
        throw err;
      }

      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.DELETE,
        resource: RESOURCES.SESSION,
        status: 'success'
      });

      return { revoked: res.modifiedCount };
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