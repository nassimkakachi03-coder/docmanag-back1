import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  patientName?: string;
  date: Date;
  reason?: string;
  duration?: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Pending';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User' },
    patientName: { type: String, default: '' },
    date: { type: Date, required: true },
    reason: { type: String, default: '' },
    duration: { type: Number, default: 30 },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Pending'],
      default: 'Pending'
    },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
