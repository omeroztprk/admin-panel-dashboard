const roleService = require('../services/RoleService');
const asyncHandler = require('../utils/AsyncHandler');

const roleController = {
  list: asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await roleService.list({ page, limit });
    res.json(result);
  }),

  getById: asyncHandler(async (req, res) => {
    const role = await roleService.getById(req.params.id);
    res.json({ data: role });
  }),

  create: asyncHandler(async (req, res) => {
    const role = await roleService.create(req.body, req.user._id);
    res.status(201).json({ data: role });
  }),

  update: asyncHandler(async (req, res) => {
    const role = await roleService.update(req.params.id, req.body, req.user._id);
    res.json({ data: role });
  }),

  remove: asyncHandler(async (req, res) => {
    await roleService.remove(req.params.id, req.user._id);
    res.status(204).end();
  })
};

module.exports = roleController;