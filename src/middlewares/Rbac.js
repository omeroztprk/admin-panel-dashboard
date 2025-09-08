const asyncHandler = require('../utils/AsyncHandler');

const rbac = (requiredPermission) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: { message: 'Authentication required.' } });
    }

    const needsPopulation = !req.user.roles?.[0]?.permissions?.[0]?.name;
    if (needsPopulation) {
      await req.user.populate({
        path: 'roles',
        populate: { path: 'permissions', model: 'Permission', select: 'name resource action description isSystem' },
        select: 'name displayName permissions'
      });
    }

    const userPermissions = new Set();
    for (const role of req.user.roles) {
      for (const permission of role.permissions) {
        userPermissions.add(permission.name);
      }
    }

    if (!userPermissions.has(requiredPermission)) {
      return res.status(403).json({ error: { message: 'Insufficient permissions.' } });
    }

    next();
  });
};

module.exports = rbac;