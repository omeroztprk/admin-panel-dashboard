const auditLogService = require('../services/AuditLogService');
const asyncHandler = require('../utils/AsyncHandler');

const auditLogController = {
  list: asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const { user, action, resource, status, from, to } = req.query;
    const result = await auditLogService.list({ user, action, resource, status, from, to }, { page, limit });
    res.json(result);
  }),

  getById: asyncHandler(async (req, res) => {
    const auditLog = await auditLogService.getById(req.params.id);
    res.json({ data: auditLog });
  })
};

module.exports = auditLogController;