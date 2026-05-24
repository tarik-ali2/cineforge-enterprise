import { Schema, model } from 'mongoose';

const permissionSchema = new Schema({
  key: { type: String, required: true },
  enabled: { type: Boolean, default: true }
}, { _id: false });

const roleSchema = new Schema({
  name: { type: String, required: true, unique: true },
  key: { type: String, required: true, unique: true, index: true },
  description: String,
  permissions: [permissionSchema],
  system: { type: Boolean, default: false }
}, { timestamps: true });

export const Role = model('Role', roleSchema);

