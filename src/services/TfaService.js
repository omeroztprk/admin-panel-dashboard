const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const TfaToken = require('../models/TfaTokenModel');
const Session = require('../models/SessionModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const auditLogService = require('./AuditLogService');
const { RESOURCES, AUTH_ACTIONS } = require('../utils/Constants');
const User = require('../models/UserModel');

const rolePermissionPopulate = {
  path: 'roles',
  select: 'name displayName permissions',
  populate: { path: 'permissions', select: 'name resource action description isSystem' }
};

const transporter = config.TFA_ENABLED
  ? nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.GMAIL_USER,
      pass: config.GMAIL_PASS
    }
  })
  : null;

const tfaService = {
  createChallenge: async (user) => {
    await TfaToken.updateMany({ user: user._id, usedAt: null }, { $set: { usedAt: new Date() } });

    const code = (Math.floor(100000 + Math.random() * 900000)).toString(); // 6-digit
    const codeHash = await bcrypt.hash(code, 10);
    const ttlMs = config.TFA_CODE_TTL_SECONDS * 1000;
    const expiresAt = new Date(Date.now() + ttlMs);
    const tokenDoc = await TfaToken.create({
      user: user._id,
      codeHash,
      expiresAt
    });

    if (transporter) {
      await transporter.sendMail({
        from: `"Security" <${config.GMAIL_USER}>`,
        to: user.email,
        subject: 'Your verification code',
        text: `Your verification code is: ${code} (valid for ${config.TFA_CODE_TTL_SECONDS / 60} minutes)`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #fafafa;">
            <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Verification Code</h2>
            <p style="font-size: 15px; color: #555; text-align: center;">
              Please use the following code to complete your login:
            </p>
            <div style="font-size: 28px; font-weight: bold; color: #2b6cb0; text-align: center; letter-spacing: 4px; margin: 20px 0;">
              ${code}
            </div>
            <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">
              This code will expire in <b>${Math.round(config.TFA_CODE_TTL_SECONDS / 60)} minutes</b>.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #aaa; text-align: center;">
              If you did not request this code, you can safely ignore this email.
            </p>
          </div>
        `
      });
    }

    return tokenDoc._id.toString();
  },

  verify: async ({ tfaId, code, ip, userAgent }) => {
    const tokenDoc = await TfaToken.findById(tfaId);
    if (!tokenDoc || tokenDoc.usedAt || tokenDoc.expiresAt < new Date()) {
      const err = new Error('Invalid or expired verification request');
      err.statusCode = 400;
      throw err;
    }

    let user = await User.findById(tokenDoc.user);
    if (!user || !user.isActive) {
      const err = new Error('User not found or inactive');
      err.statusCode = 400;
      throw err;
    }

    const match = await bcrypt.compare(code, tokenDoc.codeHash);
    if (!match) {
      tokenDoc.attempts += 1;
      if (tokenDoc.attempts >= config.TFA_MAX_ATTEMPTS) {
        tokenDoc.usedAt = new Date();
      }
      await tokenDoc.save();
      const err = new Error('Invalid code');
      err.statusCode = 400;
      throw err;
    }

    tokenDoc.usedAt = new Date();
    await tokenDoc.save();

    const jti = crypto.randomUUID();
    const accessToken = jwt.sign(
      { userId: user._id, jti },
      config.JWT_ACCESS_SECRET,
      { expiresIn: config.JWT_ACCESS_EXPIRES }
    );
    const refreshToken = jwt.sign(
      { userId: user._id, jti },
      config.JWT_REFRESH_SECRET,
      { expiresIn: config.JWT_REFRESH_EXPIRES }
    );
    const decodedRT = jwt.decode(refreshToken);
    const expiresAt = decodedRT?.exp ? new Date(decodedRT.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const token = Session.hashToken(refreshToken);

    await Session.create({
      user: user._id,
      jti,
      token,
      ip,
      userAgent,
      expiresAt
    });

    user.lastLogin = new Date();
    await user.save();

    await auditLogService.log({
      user: user._id,
      action: AUTH_ACTIONS.LOGIN,
      resource: RESOURCES.AUTH,
      status: 'success'
    });

    user = await User.findById(user._id).populate(rolePermissionPopulate);

    return { user, accessToken, refreshToken };
  }
};

module.exports = tfaService;
