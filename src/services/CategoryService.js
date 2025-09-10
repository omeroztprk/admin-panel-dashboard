const Category = require('../models/CategoryModel');
const paginate = require('../utils/Paginate');
const auditLogService = require('./AuditLogService');
const { ACTIONS, RESOURCES } = require('../utils/Constants');

const categoryService = {
  list: async (options = {}) => {
    return paginate(Category, {}, {
      ...options,
      select: '-__v',
      populate: 'parent'
    });
  },

  getById: async (id) => {
    const cat = await Category.findById(id).populate('parent').select('-__v');
    if (!cat) {
      const err = new Error('Category not found');
      err.statusCode = 404;
      throw err;
    }
    return cat;
  },

  create: async (data, currentUserId) => {
    try {
      if (data.parent === '') data.parent = null;
      const cat = await Category.create(data);
      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.CREATE,
        resource: RESOURCES.CATEGORY,
        resourceId: cat._id.toString(),
        status: 'success'
      });
      return cat;
    } catch (error) {
      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.CREATE,
        resource: RESOURCES.CATEGORY,
        status: 'failure'
      });
      throw error;
    }
  },

  async willCreateCycle(candidateParentId, id) {
    let current = candidateParentId;
    while (current) {
      if (String(current) === String(id)) return true;
      const node = await Category.findById(current).select('parent').lean();
      if (!node) break;
      current = node.parent;
    }
    return false;
  },

  update: async (id, updateData, currentUserId) => {
    try {
      if (updateData.parent === '') updateData.parent = null;
      if (updateData.parent && String(updateData.parent) === String(id)) {
        const err = new Error('Category cannot be its own parent');
        err.statusCode = 400;
        throw err;
      }
      if (updateData.parent) {
        const parentExists = await Category.exists({ _id: updateData.parent });
        if (!parentExists) {
          const err = new Error('Parent category not found');
          err.statusCode = 400;
          throw err;
        }
        const cycle = await categoryService.willCreateCycle(updateData.parent, id);
        if (cycle) {
          const err = new Error('Cannot set parent to a descendant category (circular dependency)');
          err.statusCode = 400;
          throw err;
        }
      }
      const existing = await Category.findById(id);
      if (!existing) {
        const err = new Error('Category not found');
        err.statusCode = 404;
        throw err;
      }
      Object.assign(existing, updateData);
      await existing.save();
      await existing.populate('parent');

      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.UPDATE,
        resource: RESOURCES.CATEGORY,
        resourceId: id,
        status: 'success'
      });

      return existing;
    } catch (error) {
      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.UPDATE,
        resource: RESOURCES.CATEGORY,
        resourceId: id,
        status: 'failure'
      });
      throw error;
    }
  },

  remove: async (id, currentUserId) => {
    try {
      const hasChildren = await Category.exists({ parent: id });
      if (hasChildren) {
        const err = new Error('Category has child categories');
        err.statusCode = 409;
        throw err;
      }
      const deleted = await Category.findByIdAndDelete(id);
      if (!deleted) {
        const err = new Error('Category not found');
        err.statusCode = 404;
        throw err;
      }
      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.DELETE,
        resource: RESOURCES.CATEGORY,
        resourceId: id,
        status: 'success'
      });
      return deleted;
    } catch (error) {
      await auditLogService.log({
        user: currentUserId,
        action: ACTIONS.DELETE,
        resource: RESOURCES.CATEGORY,
        resourceId: id,
        status: 'failure'
      });
      throw error;
    }
  },

  tree: async () => {
    const categories = await Category.find({}).lean();
    const map = {};
    categories.forEach(c => {
      map[c._id] = { ...c, children: [] };
    });
    const roots = [];
    categories.forEach(c => {
      if (c.parent && map[c.parent]) {
        map[c.parent].children.push(map[c._id]);
      } else {
        roots.push(map[c._id]);
      }
    });
    return roots;
  }
};

module.exports = categoryService;