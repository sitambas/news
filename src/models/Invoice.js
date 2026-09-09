import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema(
  {
    description: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, trim: true },
    clientName: { type: String, required: true, trim: true },
    clientAddress: { type: String, default: '' },
    clientPhone: { type: String, default: '' },
    clientEmail: { type: String, default: '' },
    clientGstin: { type: String, default: '' },
    items: { type: [invoiceItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    taxPercent: { type: Number, default: 18 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ['draft', 'unpaid', 'paid', 'cancelled'],
      default: 'unpaid',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

invoiceSchema.index({ createdAt: -1 });
invoiceSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
