import { Schema, model } from 'mongoose';

const offerSchema = new Schema({
  name: { type: String, required: true },
  headline: { type: String, required: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
  defaultChecked: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const orderSchema = new Schema({
  orderCode: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  phone: String,
  amount: { type: Number, required: true },
  items: [Schema.Types.Mixed],
  paymentMethod: { type: String, enum: ['upi_manual', 'payment_link'], default: 'upi_manual' },
  status: { type: String, enum: ['pending', 'submitted', 'approved', 'rejected'], default: 'pending', index: true },
  utrNumber: String,
  proofMediaId: { type: Schema.Types.ObjectId, ref: 'MediaAsset' },
  downloadTokenHash: String,
  approvedAt: Date
}, { timestamps: true });

export const CheckoutOffer = model('CheckoutOffer', offerSchema);
export const Order = model('Order', orderSchema);

