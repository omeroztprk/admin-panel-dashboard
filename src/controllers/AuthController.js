const authService = require('../services/AuthService');
const asyncHandler = require('../utils/AsyncHandler');

const authController = {
  register: asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const ip = req.ip;
    const userAgent = req.get('User-Agent');
    const user = await authService.register({ firstName, lastName, email, password }, ip, userAgent);
    res.status(201).json({ data: user });
  }),

  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const ip = req.ip;
    const userAgent = req.get('User-Agent');
    const result = await authService.login(email, password, ip, userAgent);

    if (result.tfaRequired) {
      return res.json({ data: { tfaRequired: true, tfaId: result.tfaId } });
    }

    res.json({ data: { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken } });
  }),

  refresh: asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.json({ data: { accessToken: result.accessToken } });
  }),

  logout: asyncHandler(async (req, res) => {
    if (!req.auth) {
      return res.status(400).json({ error: { message: 'Session context missing' } });
    }
    const { userId, jti } = req.auth;
    await authService.logout(userId, jti);
    res.status(204).end();
  }),

  logoutAll: asyncHandler(async (req, res) => {
    await authService.logoutAll(req.user._id);
    res.status(204).end();
  })
};


module.exports = authController;