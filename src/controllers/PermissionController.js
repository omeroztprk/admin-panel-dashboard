const permissionService = require('../services/PermissionService');
const asyncHandler = require('../utils/AsyncHandler');

const permissionController = {
  list: asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await permissionService.list({ page, limit });
    res.json(result);
  }),

  getById: asyncHandler(async (req, res) => {
    const permission = await permissionService.getById(req.params.id);
    res.json({ data: permission });
  }),

  create: asyncHandler(async (req, res) => {
    const permission = await permissionService.create(req.body, req.user._id);
    res.status(201).json({ data: permission });
  }),

  update: asyncHandler(async (req, res) => {
    const permission = await permissionService.update(req.params.id, req.body, req.user._id);
    res.json({ data: permission });
  }),

  remove: asyncHandler(async (req, res) => {
    await permissionService.remove(req.params.id, req.user._id);
    res.status(204).end();
  })
};


module.exports = permissionController;