const mongoose = require('mongoose');
const crypto = require('crypto');

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jti: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true,
    select: false
  },
  ip: {
    type: String
  },
  userAgent: {
    type: String
  },
  expiresAt: {
    type: Date,
    required: true
  },
  revokedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

sessionSchema.statics.hashToken = function (token) {
  return crypto.createHash('sha256').update(token).digest('hex');
};

sessionSchema.index({ user: 1, jti: 1 }, { unique: true });

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ revokedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 }); // 1 day

sessionSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Session', sessionSchema);