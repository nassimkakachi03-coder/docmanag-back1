import mongoose, { Schema, Document } from 'mongoose';

export interface IPrescription extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  medications: Array<{ name: string; dosage: string; instructions: string }>;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    medications: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        instructions: { type: String, required: true }
      }
    ],
    date: { type: Date, default: Date.now },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
