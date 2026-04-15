import Prescription from '../models/prescription.js';

export const createPrescription = async (data: any) => {
  return await Prescription.create(data);
};

export const getPrescriptions = async () => {
  return await Prescription.find().sort({ createdAt: -1 });
};

export const getPrescriptionById = async (id: string) => {
  return await Prescription.findById(id);
};

export const deletePrescription = async (id: string) => {
  return await Prescription.findByIdAndDelete(id);
};
