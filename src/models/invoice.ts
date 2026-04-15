import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  patientId: mongoose.Types.ObjectId;
  items: Array<{ description: string; cost: number }>;
  totalAmount: number;
  currency: string;
  status: 'Pending' | 'Paid' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    items: [
      {
        description: { type: String, required: true },
        cost: { type: Number, required: true }
      }
    ],
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'USD' }, // Supports multi-currency
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Cancelled'],
      default: 'Pending'
    }
  },
  { timestamps: true }
);

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
