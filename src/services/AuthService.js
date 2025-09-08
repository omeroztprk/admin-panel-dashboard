const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/UserModel');
const Role = require('../models/RoleModel');
const Session = require('../models/SessionModel');
const config = require('../config');
const auditLogService = require('./AuditLogService');
const tfaService = require('./TfaService');
const { ROLES, RESOURCES, AUTH_ACTIONS } = require('../utils/Constants');

const rolePermissionPopulate = {
  path: 'roles',
  select: 'name displayName permissions',
  populate: { path: 'permissions', select: 'name resource action description isSystem' }
};

const authService = {
  register: async (userData, ip, userAgent) => {
    try {
      const userRole = await Role.findOne({ name: ROLES.USER });
      if (!userRole) {
        const err = new Error('Default user role not found');
        err.statusCode = 500;
        throw err;
      }

      const user = await User.create({
        ...userData,
        roles: [userRole._id]
      });
      await user.populate(rolePermissionPopulate);

      await auditLogService.log({
        user: user._id,
        action: AUTH_ACTIONS.REGISTER,
        resource: RESOURCES.AUTH,
        status: 'success'
      });

      return user;
    } catch (error) {
      await auditLogService.log({
        action: AUTH_ACTIONS.REGISTER,
        resource: RESOURCES.AUTH,
        status: 'failure'
      });
      throw error;
    }
  },

  login: async (email, password, ip, userAgent) => {
    try {
      const user = await User.findOne({ email, isActive: true })
        .populate(rolePermissionPopulate);
      if (!user || !(await user.comparePassword(password))) {
        const err = new Error('Invalid credentials');
        err.statusCode = 401;
        throw err;
      }

      if (config.TFA_ENABLED) {
        const tfaId = await tfaService.createChallenge(user);
        return { tfaRequired: true, tfaId };
      }

      const jti = crypto.randomUUID();
      const accessToken = jwt.sign(
        { userId: user._id, jti },
        config.JWT_ACCESS_SECRET,
        { expiresIn: config.JWT_ACCESS_EXPIRES }
      );
      const refreshToken = jwt.sign(
        { userId: user._id, jti },
        config.JWT_REFRESH_SECRET,
        { expiresIn: config.JWT_REFRESH_EXPIRES }
      );
      const decodedRT = jwt.decode(refreshToken);
      const expiresAt = decodedRT?.exp ? new Date(decodedRT.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const token = Session.hashToken(refreshToken);

      await Session.create({
        user: user._id,
        jti,
        token,
        ip,
        userAgent,
        expiresAt
      });

      user.lastLogin = new Date();
      await user.save();

      await auditLogService.log({
        user: user._id,
        action: AUTH_ACTIONS.LOGIN,
        resource: RESOURCES.AUTH,
        status: 'success'
      });

      return { user, accessToken, refreshToken };
    } catch (error) {
      await auditLogService.log({
        action: AUTH_ACTIONS.LOGIN,
        resource: RESOURCES.AUTH,
        status: 'failure'
      });
      throw error;
    }
  },

  refresh: async (refreshToken) => {
    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
    const token = Session.hashToken(refreshToken);

    const session = await Session.findOne({
      jti: decoded.jti,
      user: decoded.userId,
      expiresAt: { $gt: new Date() }
    }).select('+token');

    if (!session || session.token !== token) {
      const err = new Error('Session revoked or expired');
      err.statusCode = 401;
      throw err;
    }

    const user = await User.findById(decoded.userId)
      .populate(rolePermissionPopulate);
    if (!user || !user.isActive) {
      const err = new Error('Invalid token');
      err.statusCode = 401;
      throw err;
    }

    const accessToken = jwt.sign(
      { userId: user._id, jti: decoded.jti },
      config.JWT_ACCESS_SECRET,
      { expiresIn: config.JWT_ACCESS_EXPIRES }
    );

    return { accessToken };
  },

  logout: async (userId, jti) => {
    try {
      const result = await Session.deleteOne({ user: userId, jti });
      if (result.deletedCount === 0) {
        const err = new Error('Session not found or already revoked');
        err.statusCode = 404;
        throw err;
      }
      await auditLogService.log({
        user: userId,
        action: AUTH_ACTIONS.LOGOUT,
        resource: RESOURCES.AUTH,
        status: 'success'
      });
    } catch (error) {
      await auditLogService.log({
        user: userId,
        action: AUTH_ACTIONS.LOGOUT,
        resource: RESOURCES.AUTH,
        status: 'failure'
      });
      throw error;
    }
  },

  logoutAll: async (userId) => {
    try {
      const res = await Session.deleteMany({ user: userId });
      if (!res.deletedCount) {
        const err = new Error('No active sessions to delete');
        err.statusCode = 404;
        throw err;
      }
      await auditLogService.log({
        user: userId,
        action: AUTH_ACTIONS.LOGOUT_ALL,
        resource: RESOURCES.AUTH,
        status: 'success'
      });
      return { deleted: res.deletedCount };
    } catch (error) {
      await auditLogService.log({
        user: userId,
        action: AUTH_ACTIONS.LOGOUT_ALL,
        resource: RESOURCES.AUTH,
        status: 'failure'
      });
      throw error;
    }
  }
};

module.exports = authService;