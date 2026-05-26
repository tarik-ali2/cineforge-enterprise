import { Schema, model } from 'mongoose';

export type UserStatus = 'active' | 'disabled' | 'pending_verification';

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role', index: true }],
  status: { type: String, enum: ['active', 'disabled', 'pending_verification'], default: 'active', index: true },
  emailVerifiedAt: Date,
  passwordResetTokenHash: String,
  passwordResetExpiresAt: Date,
  emailVerificationTokenHash: String,
  twoFactorEnabled: { type: Boolean, default: false },
  lastLoginAt: Date
}, { timestamps: true });

export const User = model('User', userSchema);
