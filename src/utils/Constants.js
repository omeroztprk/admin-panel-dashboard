const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
};

const RESOURCES = {
  AUTH: 'auth',
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
  SESSION: 'session',
  AUDIT: 'audit',
};

const ACTIONS = {
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};

const AUTH_ACTIONS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  LOGOUT_ALL: 'logout_all'
};

const PERMISSIONS = {
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  ROLE_READ: 'role:read',
  ROLE_CREATE: 'role:create',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',

  PERMISSION_READ: 'permission:read',
  PERMISSION_CREATE: 'permission:create',
  PERMISSION_UPDATE: 'permission:update',
  PERMISSION_DELETE: 'permission:delete',

  AUDIT_READ: 'audit:read',
};

module.exports = { ROLES, RESOURCES, ACTIONS, AUTH_ACTIONS, PERMISSIONS };