import { Schema, model } from 'mongoose';

const settingSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: Schema.Types.Mixed,
  encrypted: { type: Boolean, default: false }
}, { timestamps: true });

const auditLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true, index: true },
  entityType: String,
  entityId: String,
  ipHash: String,
  metadata: Schema.Types.Mixed
}, { timestamps: true });

export const Setting = model('Setting', settingSchema);
export const AuditLog = model('AuditLog', auditLogSchema);

