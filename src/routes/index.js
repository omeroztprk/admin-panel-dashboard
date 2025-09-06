const express = require('express');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const authRoutes = require('./AuthRoutes');
const userRoutes = require('./UserRoutes');
const roleRoutes = require('./RoleRoutes');
const permissionRoutes = require('./PermissionRoutes');
const sessionRoutes = require('./SessionRoutes');
const auditLogRoutes = require('./AuditLogRoutes');
const profileRoutes = require('./ProfileRoutes');
const categoryRoutes = require('./CategoryRoutes');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: {
      message: 'Too many authentication attempts, please try again later.'
    }
  }
});

const router = express.Router();

router.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    }
  };

  const statusCode = health.services.database === 'connected' ? 200 : 503;
  res.status(statusCode).json(health);
});

router.use('/auth', authLimiter, authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/sessions', sessionRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/profile', profileRoutes);
router.use('/categories', categoryRoutes);

module.exports = router;
