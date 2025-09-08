const User = require('../models/UserModel');
const auditLogService = require('./AuditLogService');
const { ACTIONS, RESOURCES } = require('../utils/Constants');
const bcrypt = require('bcryptjs');
const Session = require('../models/SessionModel');

const rolePermissionPopulate = {
  path: 'roles',
  select: 'name displayName permissions',
  populate: { path: 'permissions', select: 'name resource action description isSystem' }
};

const profileService = {
  get: async (userId) => {
    const user = await User.findById(userId)
      .populate(rolePermissionPopulate)
      .select('-__v');
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    return user;
  },

  update: async (userId, updateData) => {
    try {
      if ('email' in updateData) delete updateData.email;
      if ('roles' in updateData) delete updateData.roles;
      if ('isActive' in updateData) delete updateData.isActive;
      if ('password' in updateData) delete updateData.password;
      if ('avatar' in updateData) delete updateData.avatar;

      const user = await User.findById(userId)
        .populate(rolePermissionPopulate);
      if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
      }

      const hasPasswordChange = updateData.currentPassword || updateData.newPassword;
      if (hasPasswordChange) {
        if (!updateData.currentPassword || !updateData.newPassword) {
          const err = new Error('Both currentPassword and newPassword are required');
          err.statusCode = 400;
          throw err;
        }
        const match = await bcrypt.compare(updateData.currentPassword, user.password);
        if (!match) {
          const err = new Error('Current password is incorrect');
          err.statusCode = 400;
          throw err;
        }
        if (updateData.currentPassword === updateData.newPassword) {
          const err = new Error('New password must be different from current password');
          err.statusCode = 400;
          throw err;
        }
        user.password = updateData.newPassword;
      }

      if (typeof updateData.firstName === 'string') user.firstName = updateData.firstName;
      if (typeof updateData.lastName === 'string') user.lastName = updateData.lastName;

      await user.save();

      await auditLogService.log({
        user: userId,
        action: ACTIONS.UPDATE,
        resource: RESOURCES.USER,
        resourceId: userId.toString(),
        status: 'success'
      });

      return user;
    } catch (error) {
      await auditLogService.log({
        user: userId,
        action: ACTIONS.UPDATE,
        resource: RESOURCES.USER,
        resourceId: userId.toString(),
        status: 'failure'
      });
      throw error;
    }
  }
};

module.exports = profileService;