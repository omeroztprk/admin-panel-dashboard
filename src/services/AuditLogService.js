const AuditLog = require('../models/AuditLogModel');
const paginate = require('../utils/Paginate');
const mongoose = require('mongoose');
const User = require('../models/UserModel');

const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

const auditLogService = {
  log: async (data) => {
    try {
      await AuditLog.create(data);
    } catch (_) {
      // silent
    }
  },

  list: async (query = {}, options = {}) => {
    const filter = {};

    if (query.user) {
      if (isObjectId(query.user)) {
        filter.user = query.user;
      } else {
        const tokens = query.user.trim().split(/\s+/).filter(Boolean);
        let userQuery;

        if (tokens.length === 1) {
          const rgx = new RegExp(tokens[0], 'i');
          userQuery = { $or: [{ firstName: rgx }, { lastName: rgx }] };
        } else {
          const first = new RegExp(tokens[0], 'i');
          const last = new RegExp(tokens[1], 'i');
          userQuery = { firstName: first, lastName: last };
        }

        const matched = await User.find(userQuery).select('_id').lean();
        if (!matched.length) {
          return {
            data: [],
            meta: {
              page: options.page || 1,
              limit: options.limit || 20,
              total: 0,
              totalPages: 0,
              hasNextPage: false,
              hasPrevPage: (options.page || 1) > 1
            }
          };
        }
        filter.user = { $in: matched.map(m => m._id) };
      }
    }

    if (query.action) filter.action = query.action;
    if (query.resource) filter.resource = query.resource;
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