import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  dateOfBirth: Date;
  gender?: string;
  address?: string;
  medicalHistory: string;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', ''], default: '' },
    address: { type: String, default: '' },
    medicalHistory: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IPatient>('Patient', PatientSchema);
