const categoryService = require('../services/CategoryService');
const asyncHandler = require('../utils/AsyncHandler');

const categoryController = {
  list: asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await categoryService.list({ page, limit });
    res.json(result);
  }),

  getById: asyncHandler(async (req, res) => {
    const cat = await categoryService.getById(req.params.id);
    res.json({ data: cat });
  }),

  create: asyncHandler(async (req, res) => {
    const cat = await categoryService.create(req.body, req.user._id);
    res.status(201).json({ data: cat });
  }),

  update: asyncHandler(async (req, res) => {
    const cat = await categoryService.update(req.params.id, req.body, req.user._id);
    res.json({ data: cat });
  }),

  remove: asyncHandler(async (req, res) => {
    await categoryService.remove(req.params.id, req.user._id);
    res.status(204).end();
  }),

  tree: asyncHandler(async (_req, res) => {
    const data = await categoryService.tree();
    res.json({ data });
  })
};

module.exports = categoryController;