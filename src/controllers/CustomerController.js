const customerService = require('../services/CustomerService');
const asyncHandler = require('../utils/AsyncHandler');

const customerController = {
  list: asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await customerService.list({ page, limit });
    res.json(result);
  }),

  getById: asyncHandler(async (req, res) => {
    const customer = await customerService.getById(req.params.id);
    res.json({ data: customer });
  }),

  getBySlug: asyncHandler(async (req, res) => {
    const customer = await customerService.getBySlug(req.params.slug);
    res.json({ data: customer });
  }),

  create: asyncHandler(async (req, res) => {
    const customer = await customerService.create(req.body, req.user._id);
    res.status(201).json({ data: customer });
  }),

  update: asyncHandler(async (req, res) => {
    const customer = await customerService.update(req.params.id, req.body, req.user._id);
    res.json({ data: customer });
  }),

  remove: asyncHandler(async (req, res) => {
    await customerService.remove(req.params.id, req.user._id);
    res.status(204).end();
  })
};

module.exports = customerController;