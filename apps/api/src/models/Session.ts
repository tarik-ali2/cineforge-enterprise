import { Schema, model, Types } from 'mongoose';

const sessionSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  refreshTokenHash: { type: String, required: true, index: true },
  deviceId: { type: String, required: true },
  deviceName: String,
  ipHash: String,
  userAgent: String,
  revokedAt: Date,
  expiresAt: { type: Date, required: true, index: { expires: 0 } }
}, { timestamps: true });

export const Session = model('Session', sessionSchema);

