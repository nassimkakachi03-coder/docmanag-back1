import Patient from '../models/patient.js';
import PatientAccount from '../models/patientAccount.js';

const normalizeText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const normalizeEmail = (value: unknown) => normalizeText(value).toLowerCase();
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const appendUniqueNote = (currentValue: string, incomingValue: string) => {
  if (!incomingValue) return currentValue;
  if (!currentValue) return incomingValue;
  if (currentValue.includes(incomingValue)) return currentValue;
  return `${currentValue}\n\n${incomingValue}`;
};

const resolveAccountId = async (email: string) => {
  if (!email) return undefined;
  const account = await PatientAccount.findOne({ email }).select('_id');
  return account?._id;
};

const findExistingPatient = async (data: {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}) => {
  if (data.email) {
    const byEmail = await Patient.findOne({ email: data.email });
    if (byEmail) return byEmail;
  }

  if (data.phone && data.firstName && data.lastName) {
    return Patient.findOne({
      phone: data.phone,
      firstName: { $regex: `^${escapeRegex(data.firstName)}$`, $options: 'i' },
      lastName: { $regex: `^${escapeRegex(data.lastName)}$`, $options: 'i' },
    });
  }

  return null;
};

export const createPatient = async (data: any) => {
  const payload = {
    firstName: normalizeText(data.firstName),
    lastName: normalizeText(data.lastName),
    phone: normalizeText(data.phone),
    email: normalizeEmail(data.email),
    source: data.source || 'admin',
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    gender: normalizeText(data.gender),
    address: normalizeText(data.address),
    medicalHistory: normalizeText(data.medicalHistory),
    caseSummary: normalizeText(data.caseSummary),
    careNotes: normalizeText(data.careNotes),
    xRayUrl: normalizeText(data.xRayUrl),
  };

  const existingPatient = await findExistingPatient(payload);
  const accountId = await resolveAccountId(payload.email);

  if (existingPatient) {
    existingPatient.firstName = payload.firstName || existingPatient.firstName;
    existingPatient.lastName = payload.lastName || existingPatient.lastName;
    existingPatient.phone = payload.phone || existingPatient.phone;
    existingPatient.email = payload.email || existingPatient.email;
    existingPatient.source = existingPatient.source || payload.source;
    existingPatient.gender = payload.gender || existingPatient.gender;
    existingPatient.address = payload.address || existingPatient.address;
    existingPatient.medicalHistory = appendUniqueNote(existingPatient.medicalHistory || '', payload.medicalHistory || '');
    existingPatient.caseSummary = appendUniqueNote(existingPatient.caseSummary || '', payload.caseSummary || '');
    existingPatient.careNotes = appendUniqueNote(existingPatient.careNotes || '', payload.careNotes || '');
    existingPatient.xRayUrl = payload.xRayUrl || existingPatient.xRayUrl;
    if (payload.dateOfBirth) existingPatient.dateOfBirth = payload.dateOfBirth;
    if (accountId) existingPatient.accountId = accountId;
    await existingPatient.save();
    return existingPatient;
  }

  return Patient.create({
    ...payload,
    accountId,
  });
};

export const getPatients = async () => Patient.find().sort({ updatedAt: -1, createdAt: -1 });

export const getPatientById = async (id: string) => Patient.findById(id);

export const updatePatient = async (id: string, data: any) => {
  const patient = await Patient.findById(id);
  if (!patient) return null;

  if (data.firstName !== undefined) patient.firstName = normalizeText(data.firstName);
  if (data.lastName !== undefined) patient.lastName = normalizeText(data.lastName);
  if (data.phone !== undefined) patient.phone = normalizeText(data.phone);
  if (data.email !== undefined) {
    patient.email = normalizeEmail(data.email);
    patient.accountId = await resolveAccountId(patient.email || '');
  }
  if (data.source !== undefined) patient.source = data.source;
  if (data.dateOfBirth !== undefined) patient.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : undefined;
  if (data.gender !== undefined) patient.gender = normalizeText(data.gender);
  if (data.address !== undefined) patient.address = normalizeText(data.address);
  if (data.medicalHistory !== undefined) patient.medicalHistory = normalizeText(data.medicalHistory);
  if (data.caseSummary !== undefined) patient.caseSummary = normalizeText(data.caseSummary);
  if (data.careNotes !== undefined) patient.careNotes = normalizeText(data.careNotes);
  if (data.xRayUrl !== undefined) patient.xRayUrl = normalizeText(data.xRayUrl);

  await patient.save();
  return patient;
};

export const deletePatient = async (id: string) => Patient.findByIdAndDelete(id);
