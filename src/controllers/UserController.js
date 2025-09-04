const userService = require('../services/UserService');
const asyncHandler = require('../utils/AsyncHandler');

const userController = {
  list: asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await userService.list({ page, limit });
    res.json(result);
  }),

  getById: asyncHandler(async (req, res) => {
    const user = await userService.getById(req.params.id);
    res.json({ data: user });
  }),

  create: asyncHandler(async (req, res) => {
    const user = await userService.create(req.body, req.user._id);
    res.status(201).json({ data: user });
  }),

  update: asyncHandler(async (req, res) => {
    const user = await userService.update(req.params.id, req.body, req.user._id);
    res.json({ data: user });
  }),

  remove: asyncHandler(async (req, res) => {
    await userService.remove(req.params.id, req.user._id);
    res.status(204).end();
  })
};

module.exports = userController;