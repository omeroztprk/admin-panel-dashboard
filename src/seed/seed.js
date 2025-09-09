const mongoose = require('mongoose');
const config = require('../config');
const connectDB = require('../config/database');
const User = require('../models/UserModel');
const Role = require('../models/RoleModel');
const Permission = require('../models/PermissionModel');
const { PERMISSIONS, ROLES } = require('../utils/Constants');
const logger = require('../utils/Logger');

(async () => {
  try {
    await connectDB();

    const permissionNames = Object.values(PERMISSIONS);

    const DESCRIPTIONS = {
      [PERMISSIONS.USER_READ]: 'Viewing users and their details',
      [PERMISSIONS.USER_CREATE]: 'Creating a new user',
      [PERMISSIONS.USER_UPDATE]: 'Updating users',
      [PERMISSIONS.USER_DELETE]: 'Deleting users',

      [PERMISSIONS.ROLE_READ]: 'Viewing roles and their details',
      [PERMISSIONS.ROLE_CREATE]: 'Creating a new role',
      [PERMISSIONS.ROLE_UPDATE]: 'Updating roles',
      [PERMISSIONS.ROLE_DELETE]: 'Deleting roles',

      [PERMISSIONS.PERMISSION_READ]: 'Viewing permissions and their details',
      [PERMISSIONS.PERMISSION_CREATE]: 'Creating a new permission',
      [PERMISSIONS.PERMISSION_UPDATE]: 'Updating permissions',
      [PERMISSIONS.PERMISSION_DELETE]: 'Deleting permissions',

      [PERMISSIONS.AUDIT_READ]: 'Viewing audit logs and system events',

      [PERMISSIONS.CATEGORY_READ]: 'Viewing categories and their details',
      [PERMISSIONS.CATEGORY_CREATE]: 'Creating a new category',
      [PERMISSIONS.CATEGORY_UPDATE]: 'Updating categories',
      [PERMISSIONS.CATEGORY_DELETE]: 'Deleting categories',
    };

    const systemPermissions = [];
    for (const name of permissionNames) {
      const [resource, action] = name.split(':');
      const perm = await Permission.findOneAndUpdate(
        { name },
        {
          $set: {
            resource,
            action,
            isSystem: true,
            description: DESCRIPTIONS[name] || ''
          },
          $setOnInsert: { name }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      systemPermissions.push(perm._id);
    }

    const allPerms = await Permission.find({ name: { $in: permissionNames } }, '_id name');
    const permissionMap = {};
    allPerms.forEach(p => { permissionMap[p.name] = p._id; });

    const permIds = (...names) => names.map(n => permissionMap[n]).filter(Boolean);

    const ROLE_DEFS = [
      {
        name: ROLES.SUPER_ADMIN,
        displayName: 'Super Admin',
        permissions: systemPermissions
      },
      {
        name: ROLES.ADMIN,
        displayName: 'Admin',
        permissions: permIds(
          PERMISSIONS.USER_READ, PERMISSIONS.USER_CREATE, PERMISSIONS.USER_UPDATE, PERMISSIONS.USER_DELETE,
          PERMISSIONS.ROLE_READ, PERMISSIONS.ROLE_CREATE, PERMISSIONS.ROLE_UPDATE,
          PERMISSIONS.PERMISSION_READ, PERMISSIONS.PERMISSION_CREATE, PERMISSIONS.PERMISSION_UPDATE,
          PERMISSIONS.AUDIT_READ,
          PERMISSIONS.CATEGORY_READ, PERMISSIONS.CATEGORY_CREATE, PERMISSIONS.CATEGORY_UPDATE, PERMISSIONS.CATEGORY_DELETE
        )
      },
      {
        name: ROLES.MODERATOR,
        displayName: 'Moderator',
        permissions: permIds(
          PERMISSIONS.USER_READ, PERMISSIONS.USER_UPDATE,
          PERMISSIONS.ROLE_READ,
          PERMISSIONS.PERMISSION_READ,
          PERMISSIONS.CATEGORY_READ
        )
      },
      {
        name: ROLES.USER,
        displayName: 'User',
        permissions: []
      }
    ];

    for (const def of ROLE_DEFS) {
      await Role.findOneAndUpdate(
        { name: def.name },
        { ...def, isSystem: true },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    const superAdminRole = await Role.findOne({ name: ROLES.SUPER_ADMIN });
    const adminEmail = config.SEED_ADMIN_EMAIL || 'admin@example.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        firstName: 'System',
        lastName: 'Admin',
        email: adminEmail,
        password: config.SEED_ADMIN_PASSWORD || 'Admin123!',
        roles: [superAdminRole._id],
        isActive: true
      });
      logger.info('Admin user created:', adminEmail);
    }

    logger.info('Seed completed.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    logger.error('Seed failed:', err);
    process.exit(1);
  }
})();