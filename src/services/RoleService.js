const Role = require('../models/RoleModel');
const paginate = require('../utils/Paginate');
const auditLogService = require('./AuditLogService');
const { ACTIONS, RESOURCES } = require('../utils/Constants');
const User = require('../models/UserModel');

const roleService = {
  list: async (options = {}) => {
    return paginate(Role, {}, {
      ...options,
      populate: 'permissions',
      select: '-__v'
    });
  },

  getById: async (id) => {
    const role = await Role.findById(id).populate('permissions').select('-__v');
    if (!role) {
      const err = new Error('Role not found');
      err.statusCode = 404;
      throw err;
    }
    return role;
  },

  create: async (roleData, currentUserId) => {
    try {
      if ('isSystem' in roleData) delete roleData.isSystem;
      const role = await Role.create(roleData);

      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.CREATE,
        resource: RESOURCES.ROLE,
        resourceId: role._id.toString(),
        status: 'success'
      });

      return role;
    } catch (error) {
      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.CREATE,
        resource: RESOURCES.ROLE,
        status: 'failure'
      });
      throw error;
    }
  },

  update: async (id, updateData, currentUserId) => {
    try {
      if ('isSystem' in updateData) delete updateData.isSystem;
      const existing = await Role.findById(id);
      if (!existing) {
        const err = new Error('Role not found');
        err.statusCode = 404;
        throw err;
      }
      if (existing.isSystem) {
        const err = new Error('System role cannot be modified');
        err.statusCode = 400;
        throw err;
      }
      Object.assign(existing, updateData);
      await existing.save();
      await existing.populate('permissions');

      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.UPDATE,
        resource: RESOURCES.ROLE,
        resourceId: id,
        status: 'success'
      });

      return existing;
    } catch (error) {
      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.UPDATE,
        resource: RESOURCES.ROLE,
        resourceId: id,
        status: 'failure'
      });
      throw error;
    }
  },

  remove: async (id, currentUserId) => {
    try {
      const existing = await Role.findById(id);
      if (!existing) {
        const err = new Error('Role not found');
        err.statusCode = 404;
        throw err;
      }
      if (existing.isSystem) {
        const err = new Error('System role cannot be deleted');
        err.statusCode = 400;
        throw err;
      }
      const isAssigned = await User.exists({ roles: id });
      if (isAssigned) {
        const err = new Error('Role is assigned to one or more users and cannot be deleted');
        err.statusCode = 409;
        throw err;
      }

      await Role.deleteOne({ _id: id });

      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.DELETE,
        resource: RESOURCES.ROLE,
        resourceId: id,
        status: 'success'
      });

      return existing;
    } catch (error) {
      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.DELETE,
        resource: RESOURCES.ROLE,
        resourceId: id,
        status: 'failure'
      });
      throw error;
    }
  }
};

module.exports = roleService;