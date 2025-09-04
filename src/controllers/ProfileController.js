const asyncHandler = require('../utils/AsyncHandler');
const profileService = require('../services/ProfileService');

const profileController = {
  get: asyncHandler(async (req, res) => {
    const user = await profileService.get(req.user._id);
    res.json({ data: user });
  }),

  update: asyncHandler(async (req, res) => {
    const user = await profileService.update(req.user._id, req.body);
    res.json({ data: user });
  })
};

module.exports = profileController;