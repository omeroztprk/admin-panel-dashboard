const tfaService = require('../services/TfaService');
const asyncHandler = require('../utils/AsyncHandler');

const tfaController = {
  verify: asyncHandler(async (req, res) => {
    const { tfaId, code } = req.body;
    const ip = req.ip;
    const userAgent = req.get('User-Agent');
    const result = await tfaService.verify({ tfaId, code, ip, userAgent });
    res.json({ data: { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken } });
  })
};

module.exports = tfaController;