const Permission = require('../models/PermissionModel');
const paginate = require('../utils/Paginate');
const auditLogService = require('./AuditLogService');
const { ACTIONS, RESOURCES } = require('../utils/Constants');
const Role = require('../models/RoleModel');

const permissionService = {
  list: async (options = {}) => {
    return paginate(Permission, {}, {
      ...options,
      select: '-__v'
    });
  },

  getById: async (id) => {
    const permission = await Permission.findById(id).select('-__v');
    if (!permission) {
      const err = new Error('Permission not found');
      err.statusCode = 404;
      throw err;
    }
    return permission;
  },

  create: async (permissionData, currentUserId) => {
    try {
      if ('isSystem' in permissionData) delete permissionData.isSystem;
      permissionData.name = `${permissionData.resource}:${permissionData.action}`;
      const permission = await Permission.create(permissionData);

      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.CREATE,
        resource: RESOURCES.PERMISSION,
        resourceId: permission._id.toString(),
        status: 'success'
      });

      return permission;
    } catch (error) {
      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.CREATE,
        resource: RESOURCES.PERMISSION,
        status: 'failure'
      });
      throw error;
    }
  },

  update: async (id, updateData, currentUserId) => {
    try {
      if ('isSystem' in updateData) delete updateData.isSystem;
      const existing = await Permission.findById(id);
      if (!existing) {
        const err = new Error('Permission not found');
        err.statusCode = 404;
        throw err;
      }
      if (existing.isSystem) {
        const err = new Error('System permission cannot be modified');
        err.statusCode = 400;
        throw err;
      }
      if (updateData.resource || updateData.action) {
        const resource = updateData.resource || existing.resource;
        const action = updateData.action || existing.action;
        updateData.name = `${resource}:${action}`;
      }
      Object.assign(existing, updateData);
      await existing.save();

      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.UPDATE,
        resource: RESOURCES.PERMISSION,
        resourceId: id,
        status: 'success'
      });

      return existing;
    } catch (error) {
      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.UPDATE,
        resource: RESOURCES.PERMISSION,
        resourceId: id,
        status: 'failure'
      });
      throw error;
    }
  },

  remove: async (id, currentUserId) => {
    try {
      const existing = await Permission.findById(id);
      if (!existing) {
        const err = new Error('Permission not found');
        err.statusCode = 404;
        throw err;
      }
      if (existing.isSystem) {
        const err = new Error('System permission cannot be deleted');
        err.statusCode = 400;
        throw err;
      }
      const inUse = await Role.exists({ permissions: id });
      if (inUse) {
        const err = new Error('Permission is assigned to one or more roles and cannot be deleted');
        err.statusCode = 409;
        throw err;
      }

      await Permission.deleteOne({ _id: id });

      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.DELETE,
        resource: RESOURCES.PERMISSION,
        resourceId: id,
        status: 'success'
      });

      return existing;
    } catch (error) {
      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.DELETE,
        resource: RESOURCES.PERMISSION,
        resourceId: id,
        status: 'failure'
      });
      throw error;
    }
  }
};

module.exports = permissionService;