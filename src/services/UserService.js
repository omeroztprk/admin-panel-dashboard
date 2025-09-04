const User = require('../models/UserModel');
const paginate = require('../utils/Paginate');
const auditLogService = require('./AuditLogService');
const { ACTIONS, RESOURCES } = require('../utils/Constants');
const Session = require('../models/SessionModel');

const userService = {
  list: async (options = {}) => {
    return paginate(User, {}, {
      ...options,
      populate: 'roles',
      select: '-__v'
    });
  },

  getById: async (id) => {
    const user = await User.findById(id).populate('roles').select('-__v');
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    return user;
  },

  create: async (userData, currentUserId) => {
    try {
      const user = await User.create(userData);

      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.CREATE,
        resource: RESOURCES.USER,
        resourceId: user._id.toString(),
        status: 'success'
      });

      return user;
    } catch (error) {
      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.CREATE,
        resource: RESOURCES.USER,
        status: 'failure'
      });
      throw error;
    }
  },

  update: async (id, updateData, currentUserId) => {
    try {
      if ('email' in updateData) delete updateData.email;
      const user = await User.findById(id).populate('roles');
      if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
      }

      const wasActive = user.isActive;
      const willChangeActive = Object.prototype.hasOwnProperty.call(updateData, 'isActive') &&
        Boolean(updateData.isActive) !== wasActive;

      Object.assign(user, updateData);
      await user.save();

      if (willChangeActive && !user.isActive) {
        await Session.updateMany(
          { user: user._id, revokedAt: null },
          { $set: { revokedAt: new Date() } }
        );
      }

      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.UPDATE,
        resource: RESOURCES.USER,
        resourceId: id,
        status: 'success'
      });

      return user;
    } catch (error) {
      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.UPDATE,
        resource: RESOURCES.USER,
        resourceId: id,
        status: 'failure'
      });
      throw error;
    }
  },

  remove: async (id, currentUserId) => {
    try {
      const user = await User.findByIdAndDelete(id);

      if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
      }

      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.DELETE,
        resource: RESOURCES.USER,
        resourceId: id,
        status: 'success'
      });

      return user;
    } catch (error) {
      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.DELETE,
        resource: RESOURCES.USER,
        resourceId: id,
        status: 'failure'
      });
      throw error;
    }
  }
};

module.exports = userService;