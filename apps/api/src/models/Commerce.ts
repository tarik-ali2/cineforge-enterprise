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
  currency: { type: String, default: 'INR' },
  items: [Schema.Types.Mixed],
  paymentMethod: { type: String, enum: ['upi_manual', 'payment_link', 'external', 'razorpay', 'instamojo', 'stripe'], default: 'external' },
  paymentProvider: String,
  status: { type: String, enum: ['pending', 'payment_started', 'submitted', 'approved', 'rejected', 'paid', 'failed'], default: 'pending', index: true },
  eventId: { type: String, index: true },
  transactionId: { type: String, index: true },
  successRedirectUrl: String,
  checkoutUrl: String,
  utm: Schema.Types.Mixed,
  utrNumber: String,
  proofMediaId: { type: Schema.Types.ObjectId, ref: 'MediaAsset' },
  downloadTokenHash: String,
  approvedAt: Date,
  verifiedAt: Date,
  metaPurchaseSentAt: Date
}, { timestamps: true });

export const CheckoutOffer = model('CheckoutOffer', offerSchema);
export const Order = model('Order', orderSchema);
