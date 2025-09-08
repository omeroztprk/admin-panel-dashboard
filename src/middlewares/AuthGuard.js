const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/UserModel');
const Session = require('../models/SessionModel');
const asyncHandler = require('../utils/AsyncHandler');

const authGuard = asyncHandler(async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { message: 'Access denied. No token provided.' } });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId)
      .populate({
        path: 'roles',
        select: 'name displayName permissions',
        populate: { path: 'permissions', select: 'name resource action description isSystem' }
      });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: { message: 'Invalid token.' } });
    }

    const activeSession = await Session.findOne({
      user: decoded.userId,
      jti: decoded.jti,
      expiresAt: { $gt: new Date() }
    }).select('_id');

    if (!activeSession) {
      return res.status(401).json({ error: { message: 'Session revoked or expired.' } });
    }

    req.user = user;
    req.auth = { userId: decoded.userId, jti: decoded.jti };
    next();
  } catch (_) {
    return res.status(401).json({ error: { message: 'Invalid token.' } });
  }
});

module.exports = authGuard;