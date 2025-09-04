const sessionService = require('../services/SessionService');
const asyncHandler = require('../utils/AsyncHandler');

const sessionController = {
  list: asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await sessionService.list(req.user._id, { page, limit });
    res.json(result);
  }),

  remove: asyncHandler(async (req, res) => {
    await sessionService.remove(req.params.id, req.user._id, req.user._id);
    res.status(204).end();
  }),

  removeAll: asyncHandler(async (req, res) => {
    await sessionService.removeAll(req.user._id, req.user._id);
    res.status(204).end();
  })
};


module.exports = sessionController;