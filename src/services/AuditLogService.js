const AuditLog = require('../models/AuditLogModel');
const paginate = require('../utils/Paginate');

const auditLogService = {
  log: async (data) => {
    try {
      await AuditLog.create(data);
    } catch (_) {
      // Fail silently
    }
  },

  list: async (query = {}, options = {}) => {
    const filter = {};

    if (query.user) filter.user = query.user;
    if (query.action) filter.action = query.action;
    if (query.status) filter.status = query.status;
    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) filter.createdAt.$gte = new Date(query.from);
      if (query.to) filter.createdAt.$lte = new Date(query.to);
    }

    return paginate(AuditLog, filter, {
      ...options,
      populate: 'user',
      select: '-__v'
    });
  },

  getById: async (id) => {
    const auditLog = await AuditLog.findById(id).populate('user').select('-__v');
    if (!auditLog) {
      const err = new Error('Audit log not found');
      err.statusCode = 404;
      throw err;
    }
    return auditLog;
  }
};

module.exports = auditLogService;