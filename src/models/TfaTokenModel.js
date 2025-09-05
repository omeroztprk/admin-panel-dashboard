const mongoose = require('mongoose');

const tfaTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  codeHash: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  usedAt: {
    type: Date,
    default: null,
    index: true
  },
  attempts: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

tfaTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

tfaTokenSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.codeHash;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('TfaToken', tfaTokenSchema);